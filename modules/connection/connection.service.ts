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
    getDoc,
    updateDoc
} from "firebase/firestore";
import { Author } from "../../types";
import { NotificationService } from "../notification/notification.service";

export class ConnectionService {

    /**
     * Gera um ID único e consistente para a relação entre dois usuários.
     */
    private static getConnectionId(uid1: string, uid2: string): string {
        return [uid1, uid2].sort().join("_");
    }

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
        const connId = this.getConnectionId(currentUid, targetUid);
        const connRef = doc(db, "connections", connId);

        await setDoc(connRef, {
            users: [currentUid, targetUid],
            status: 'pending',
            requesterId: currentUid,
            timestamp: new Date().toISOString(),
            // Armazenamos metadados básicos para facilitar exibição sem faturar 20 reads de perfil
            [currentUid]: this.sanitizeData(currentUser),
            [targetUid]: this.sanitizeData(targetUser)
        });

        // Trigger Notification
        await NotificationService.createNotification({
            userId: targetUid,
            type: 'connection',
            title: 'Nova Solicitação de Conexão',
            desc: `${currentUser.name} quer se conectar com você.`,
            avatar: currentUser.avatar,
            metadata: { fromUserId: currentUid }
        });
    }

    /**
     * Aceita solicitação.
     */
    static async acceptConnectionRequest(currentUid: string, targetUid: string): Promise<void> {
        const connId = this.getConnectionId(currentUid, targetUid);
        const connRef = doc(db, "connections", connId);

        const batch = writeBatch(db);
        batch.update(connRef, { status: 'accepted' });

        // Update ONLY own stats to avoid permission errors on target user's doc
        // Note: Target user's stats should be updated via Cloud Functions or when they logs in.
        const myUserRef = doc(db, "users", currentUid);
        batch.update(myUserRef, { "stats.following": increment(1), "stats.followers": increment(1) });

        await batch.commit();
    }

    /**
     * Remove/Rejeita/Cancela.
     */
    static async removeConnection(currentUid: string, targetUid: string, wasAccepted: boolean): Promise<void> {
        const connId = this.getConnectionId(currentUid, targetUid);
        const connRef = doc(db, "connections", connId);

        const batch = writeBatch(db);
        batch.delete(connRef);

        if (wasAccepted) {
            const myUserRef = doc(db, "users", currentUid);
            batch.update(myUserRef, { "stats.following": increment(-1), "stats.followers": increment(-1) });
        }

        await batch.commit();
    }

    /**
     * Busca conexões aceitas.
     */
    static async getConnections(uid: string): Promise<(Author & { connectedAt?: string })[]> {
        const ref = collection(db, "connections");
        const q = query(ref, where("users", "array-contains", uid), where("status", "==", "accepted"));
        const snap = await getDocs(q);

        return snap.docs.map(d => {
            const data = d.data();
            const otherUid = data.users.find((id: string) => id !== uid);
            const otherData = data[otherUid];

            return {
                ...otherData,
                id: otherUid,
                connectedAt: data.timestamp
            } as Author & { connectedAt?: string };
        });
    }

    /**
     * Busca pendentes (Recebidas por mim).
     */
    static async getPendingRequests(uid: string): Promise<Author[]> {
        const ref = collection(db, "connections");
        const q = query(ref,
            where("users", "array-contains", uid),
            where("status", "==", "pending")
        );
        const snap = await getDocs(q);

        return snap.docs
            .filter(d => d.data().requesterId !== uid) // Apenas as que eu não pedi
            .map(d => {
                const data = d.data();
                const otherUid = data.users.find((id: string) => id !== uid);
                return { ...data[otherUid], id: otherUid } as Author;
            });
    }

    /**
     * Busca convites enviados (Aguardando resposta).
     */
    static async getSentRequests(uid: string): Promise<Author[]> {
        const ref = collection(db, "connections");
        // FIX: Query using 'users' array-contains to match security rules
        // Original query (requesterId == uid) failed because rules require checking if auth.uid is in 'users'
        const q = query(ref,
            where("users", "array-contains", uid),
            where("status", "==", "pending")
        );
        const snap = await getDocs(q);

        return snap.docs
            .map(d => d.data())
            // Filter in-memory to find requests initiated by ME
            .filter(data => data.requesterId === uid)
            .map(data => {
                const otherUid = data.users.find((id: string) => id !== uid);
                return { ...data[otherUid], id: otherUid } as Author;
            });
    }

    /**
     * Status entre dois users.
     */
    static async getConnectionStatus(currentUid: string, targetUid: string): Promise<{ status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' }> {
        const connId = this.getConnectionId(currentUid, targetUid);
        const connRef = doc(db, "connections", connId);
        const snap = await getDoc(connRef);

        if (!snap.exists()) return { status: 'none' };

        const data = snap.data();
        if (!data) return { status: 'none' };

        if (data.status === 'accepted') return { status: 'accepted' };
        if (data.status === 'pending') {
            return { status: data.requesterId === currentUid ? 'pending_sent' : 'pending_received' };
        }

        return { status: 'none' };
    }

    /**
     * Sugestões FILTRADAS.
     */
    static async getSuggestions(currentUid: string): Promise<Author[]> {
        try {
            const connectionsRef = collection(db, "connections");
            const connSnap = await getDocs(query(connectionsRef, where("users", "array-contains", currentUid)));

            const excludedIds = new Set([currentUid]);
            connSnap.forEach(d => {
                const data = d.data();
                data.users.forEach((id: string) => excludedIds.add(id));
            });

            const usersRef = collection(db, "users");
            const q = query(usersRef, limit(50));
            const snap = await getDocs(q);

            const suggestions: Author[] = [];
            snap.forEach(d => {
                if (!excludedIds.has(d.id)) {
                    const data = d.data();
                    suggestions.push({
                        id: d.id,
                        name: data.name || data.fullName,
                        username: data.username,
                        avatar: data.photoURL,
                        university: data.university,
                        course: data.course,
                        stats: data.stats
                    });
                }
            });

            return suggestions;
        } catch (e) {
            // Notificamos apenas em debug para evitar poluir console do usuário
            return [];
        }
    }
}
