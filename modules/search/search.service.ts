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
}
