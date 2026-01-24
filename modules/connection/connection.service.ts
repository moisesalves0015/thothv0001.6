import { db } from "../../firebase";
import {
    doc,
    setDoc,
    deleteDoc,
    increment,
    writeBatch,
    collection,
    query,
    where,
    getDocs,
    limit,
    getDoc
} from "firebase/firestore";
import { Author } from "../../types";

export class ConnectionService {

    /**
     * Helper para remover undefined
     */
    static sanitizeData(data: any): any {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            return value === undefined ? null : value;
        }));
    }

    /**
     * Envia solicitação de conexão.
     */
    static async sendConnectionRequest(currentUid: string, currentUser: Author, targetUid: string, targetUser: Author): Promise<void> {
        const batch = writeBatch(db);

        const cleanCurrentUser = ConnectionService.sanitizeData(currentUser);
        const cleanTargetUser = ConnectionService.sanitizeData(targetUser);

        // 1. Sent
        const myConnRef = doc(db, "users", currentUid, "connections", targetUid);
        batch.set(myConnRef, {
            ...cleanTargetUser,
            status: 'pending',
            direction: 'sent',
            timestamp: new Date().toISOString()
        });

        // 2. Received
        const targetConnRef = doc(db, "users", targetUid, "connections", currentUid);
        batch.set(targetConnRef, {
            ...cleanCurrentUser,
            status: 'pending',
            direction: 'received',
            timestamp: new Date().toISOString()
        });

        await batch.commit();
    }

    /**
     * Aceita solicitação.
     */
    static async acceptConnectionRequest(currentUid: string, targetUid: string): Promise<void> {
        const batch = writeBatch(db);

        const myConnRef = doc(db, "users", currentUid, "connections", targetUid);
        batch.update(myConnRef, { status: 'accepted' });

        const targetConnRef = doc(db, "users", targetUid, "connections", currentUid);
        batch.update(targetConnRef, { status: 'accepted' });

        // Incrementa
        const myUserRef = doc(db, "users", currentUid);
        const targetUserRef = doc(db, "users", targetUid);
        batch.update(myUserRef, { "stats.following": increment(1), "stats.followers": increment(1) });
        batch.update(targetUserRef, { "stats.following": increment(1), "stats.followers": increment(1) });

        await batch.commit();
    }

    /**
     * Remove/Rejeita.
     */
    static async removeConnection(currentUid: string, targetUid: string, isAccepted: boolean): Promise<void> {
        const batch = writeBatch(db);

        batch.delete(doc(db, "users", currentUid, "connections", targetUid));
        batch.delete(doc(db, "users", targetUid, "connections", currentUid));

        if (isAccepted) {
            const myUserRef = doc(db, "users", currentUid);
            const targetUserRef = doc(db, "users", targetUid);
            batch.update(myUserRef, { "stats.following": increment(-1), "stats.followers": increment(-1) });
            batch.update(targetUserRef, { "stats.following": increment(-1), "stats.followers": increment(-1) });
        }

        await batch.commit();
    }

    /**
     * Busca conexões aceitas e hidrata com dados frescos.
     */
    static async getConnections(uid: string): Promise<(Author & { connectedAt?: string })[]> {
        const ref = collection(db, "users", uid, "connections");
        const q = query(ref, where("status", "==", "accepted"));
        const snap = await getDocs(q);

        const connectionIds = snap.docs.map(d => d.id);
        if (connectionIds.length === 0) return [];

        const userPromises = connectionIds.map(id => getDoc(doc(db, "users", id)));
        const userSnaps = await Promise.all(userPromises);

        return userSnaps
            .filter(d => d.exists())
            .map((d, index) => {
                const data = d.data();
                // Encontrar o ID correspondente para pegar o timestamp do snapshot de conexão original?
                // O array connectionIds e userSnaps estão alinhados pelo índice? Sim, Promise.all mantém a ordem.
                const connectionId = connectionIds[index];
                // Mas precisamos do DADO do doc de conexão, não só o ID. 
                // O snap original (snap.docs) tem os dados da conexão.
                const connectionDoc = snap.docs[index];
                const connectionData = connectionDoc.data();

                return {
                    id: d.id,
                    name: data.fullName || data.name,
                    username: data.username,
                    avatar: data.photoURL,
                    university: data.university,
                    stats: data.stats,
                    connectedAt: connectionData.timestamp // Adicionando campo extra (precisa atualizar type Author?)
                    // Se Author não tiver connectedAt, typescript vai reclamar.
                    // Vamos fazer um cast ou estender o tipo localmente na página.
                } as Author & { connectedAt?: string };
            });
    }

    /**
     * Busca pendentes (Received).
     */
    static async getPendingRequests(uid: string): Promise<Author[]> {
        const ref = collection(db, "users", uid, "connections");
        const q = query(ref, where("status", "==", "pending"), where("direction", "==", "received"));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as Author);
    }

    /**
     * Status entre dois users.
     */
    static async getConnectionStatus(currentUid: string, targetUid: string): Promise<{ status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' }> {
        const docRef = doc(db, "users", currentUid, "connections", targetUid);
        const snap = await getDoc(docRef);

        if (!snap.exists()) return { status: 'none' };

        const data = snap.data();
        if (data.status === 'accepted') return { status: 'accepted' };
        if (data.status === 'pending') {
            return { status: data.direction === 'sent' ? 'pending_sent' : 'pending_received' };
        }

        return { status: 'none' };
    }

    /**
     * Sugestões FILTRADAS.
     */
    static async getSuggestions(currentUid: string): Promise<Author[]> {
        // 1. Busca quem eu já conheço (IDs)
        const myConnectionsRef = collection(db, "users", currentUid, "connections");
        const myConnectionsSnap = await getDocs(myConnectionsRef);
        const excludedIds = new Set([currentUid]);

        myConnectionsSnap.forEach(d => excludedIds.add(d.id));

        // 2. Busca usuários gerais (limit 50 para ter margem de filtro)
        const usersRef = collection(db, "users");
        // Melhora futura: Ordenar aleatoriamente ou por afinidade. Por enquanto, order by username ou natural.
        // Como não temos cursor aleatório fácil no Firestore, aumentamos o limit.
        const q = query(usersRef, limit(50));
        const snap = await getDocs(q);

        const suggestions: Author[] = [];

        snap.forEach(d => {
            // SÓ ADICIONA SE NÃO ESTIVER NA LISTA DE EXCLUÍDOS
            if (!excludedIds.has(d.id)) {
                const data = d.data();
                suggestions.push({
                    id: d.id,
                    name: data.name || data.fullName,
                    username: data.username,
                    avatar: data.photoURL,
                    university: data.university,
                    stats: data.stats // Pega o dado fresco aqui
                });
            }
        });

        return suggestions;
    }
}
