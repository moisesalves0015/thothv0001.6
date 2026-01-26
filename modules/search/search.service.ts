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
    /**
     * Busca usuários pelo username ou nome.
     */
    static async searchUsers(searchQuery: string): Promise<Author[]> {
        const term = searchQuery.trim().toLowerCase();
        if (!term || term.length < 2) return [];

        const usersRef = collection(db, "users");
        const results: Author[] = [];
        const seenIds = new Set();

        const processSnap = (snap: any) => {
            snap.forEach((docSnap: any) => {
                if (!seenIds.has(docSnap.id)) {
                    const data = docSnap.data();
                    seenIds.add(docSnap.id);
                    results.push({
                        id: docSnap.id,
                        name: data.name || data.fullName || data.displayName || "Usuário",
                        username: data.username || data.handle || "usuario",
                        avatar: data.photoURL || data.avatar,
                        university: data.university || "",
                        verified: data.verified || false,
                        stats: data.stats
                    });
                }
            });
        };

        // Estratégia 1: Busca por Username (Prefixo)
        try {
            const qUsername = query(
                usersRef,
                orderBy("username"),
                startAt(searchQuery.trim()),
                endAt(searchQuery.trim() + '\uf8ff'),
                limit(10)
            );
            const snap = await getDocs(qUsername);
            processSnap(snap);
        } catch (e) { console.warn("Primary username search failed", e); }

        // Estratégia 2: Busca por Nome (Prefixo)
        if (results.length < 10) {
            try {
                const qName = query(
                    usersRef,
                    orderBy("name"),
                    startAt(searchQuery.trim()),
                    endAt(searchQuery.trim() + '\uf8ff'),
                    limit(10)
                );
                const snap = await getDocs(qName);
                processSnap(snap);
            } catch (e) { console.warn("Name search failed", e); }
        }

        // Estratégia 3: Fallback Simples (Igualdade)
        if (results.length === 0) {
            try {
                const qSimple = query(usersRef, where("username", "==", searchQuery.trim()), limit(5));
                const snap = await getDocs(qSimple);
                processSnap(snap);
            } catch (e) { }
        }

        return results;
    }

    /**
     * Busca publicações pelo conteúdo ou hashtag.
     */
    static async searchPosts(searchQuery: string): Promise<any[]> {
        const term = searchQuery.trim().toLowerCase();
        const rawTerm = searchQuery.trim();
        if (!term || term.length < 2) return [];

        const postsRef = collection(db, "posts");
        const results: any[] = [];
        const seenIds = new Set();

        const processPostSnap = (snap: any) => {
            snap.forEach((docSnap: any) => {
                if (!seenIds.has(docSnap.id)) {
                    const data = docSnap.data();
                    seenIds.add(docSnap.id);
                    results.push({
                        id: docSnap.id,
                        ...data,
                        timestamp: data.createdAt ? 'Postado em ' + data.createdAt.toDate().toLocaleDateString() : 'agora'
                    });
                }
            });
        };

        // Estratégia 1: Hashtag
        if (rawTerm.startsWith('#')) {
            const hashtag = rawTerm.substring(1);
            try {
                const q = query(postsRef, where("tags", "array-contains", hashtag), limit(20));
                const snap = await getDocs(q);
                processPostSnap(snap);
            } catch (e) { console.error("Hashtag search failed", e); }
        } else {
            // Estratégia 2: Tag exata
            try {
                const q = query(postsRef, where("tags", "array-contains", term), limit(20));
                const snap = await getDocs(q);
                processPostSnap(snap);
            } catch (e) { }

            // Estratégia 3: Post Type
            if (results.length === 0) {
                try {
                    const qType = query(postsRef, where("postType", "==", term), limit(10));
                    const snap = await getDocs(qType);
                    processPostSnap(snap);
                } catch (e) { }
            }
        }

        return results;
    }
}
