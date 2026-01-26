import { db } from "../../firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    startAt,
    endAt,
    limit,
    DocumentSnapshot
} from "firebase/firestore";
import { Author } from "../../types";

export class SearchService {

    /**
     * Busca usuários pelo username ou nome.
     * Estratégia: Busca principal pelo username_lower (indexado e único).
     */
    static async searchUsers(searchQuery: string): Promise<Author[]> {
        const term = searchQuery.trim().toLowerCase();
        if (!term || term.length < 2) return [];

        const usersRef = collection(db, "users");

        // Query por username (prefix search)
        // Ex: termo "moi" acha "moises", "moises.alves"
        const q = query(
            usersRef,
            orderBy("username_lower"),
            startAt(term),
            endAt(term + '\uf8ff'),
            limit(20)
        );

        const snap = await getDocs(q);
        const results: Author[] = [];

        snap.forEach(docSnap => {
            const data = docSnap.data();
            results.push({
                id: docSnap.id,
                name: data.name || data.fullName || "Usuário",
                username: data.username,
                avatar: data.photoURL,
                university: data.university,
                verified: false, // TODO
                stats: data.stats
            });
        });

        return results;
    }

    /**
     * Busca publicações pelo conteúdo ou hashtag.
     */
    static async searchPosts(searchQuery: string): Promise<any[]> {
        const term = searchQuery.trim().toLowerCase();
        if (!term || term.length < 2) return [];

        const postsRef = collection(db, "posts");
        let q;

        if (term.startsWith('#')) {
            const hashtag = term.substring(1);
            q = query(
                postsRef,
                where("tags", "array-contains", hashtag),
                orderBy("createdAt", "desc"),
                limit(30)
            );
        } else {
            // Busca simplificada por texto (o Firestore não suporta busca full-text nativa sem plugins)
            // Aqui buscamos posts que contenham o termo como tag ou em campos específicos
            q = query(
                postsRef,
                where("tags", "array-contains", term),
                orderBy("createdAt", "desc"),
                limit(30)
            );
        }

        const snap = await getDocs(q);
        const results: any[] = [];

        snap.forEach(docSnap => {
            const data = docSnap.data() as any;
            results.push({
                id: docSnap.id,
                ...data,
                // Garantir formatação de data para o PostCard (o service de post fará o resto)
                timestamp: data.createdAt ? 'Postado em ' + data.createdAt.toDate().toLocaleDateString() : 'agora'
            });
        });

        return results;
    }
}
