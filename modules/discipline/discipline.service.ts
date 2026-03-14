import { db } from "../../firebase";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    orderBy,
    serverTimestamp,
    arrayUnion,
    getDoc,
    limit
} from "firebase/firestore";
import { Discipline, Author } from "../../types";

export class DisciplineService {
    private static COLLECTION = "disciplines";

    /**
     * Cria uma nova disciplina
     */
    static async createDiscipline(disciplineData: Omit<Discipline, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const disciplineRef = collection(db, this.COLLECTION);
        const docRef = await addDoc(disciplineRef, {
            ...disciplineData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            members: disciplineData.members || []
        });
        return docRef.id;
    }

    /**
     * Inscreve um usuário em uma disciplina
     */
    static async enrollInDiscipline(disciplineId: string, userId: string): Promise<void> {
        const disciplineRef = doc(db, this.COLLECTION, disciplineId);
        await updateDoc(disciplineRef, {
            members: arrayUnion(userId),
            updatedAt: serverTimestamp()
        });
    }

    /**
     * Busca disciplinas por código ou nome
     */
    static async searchDisciplines(searchTerm: string): Promise<Discipline[]> {
        if (!searchTerm.trim()) return [];

        const disciplinesRef = collection(db, this.COLLECTION);
        const term = searchTerm.toLowerCase();

        // Firestore doesn't support easy multi-field partial search without external services like Algolia,
        // so we'll do a simple query for name/code or fetch and filter if terms are short.
        // For now, let's try direct matches or simple prefix search if possible.
        // A common workaround is fetching active items and filtering local.
        const q = query(disciplinesRef, where("status", "==", "active"), limit(20));
        const snapshot = await getDocs(q);

        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Discipline))
            .filter(d => 
                d.name.toLowerCase().includes(term) || 
                d.code.toLowerCase().includes(term)
            );
    }

    /**
     * Busca uma disciplina específica pelo joinCode
     */
    static async getDisciplineByJoinCode(joinCode: string): Promise<Discipline | null> {
        const disciplinesRef = collection(db, this.COLLECTION);
        const q = query(disciplinesRef, where("joinCode", "==", joinCode), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Discipline;
    }

    /**
     * Inscreve-se para as disciplinas que o usuário participa ou criou
     */
    static subscribeToUserDisciplines(userId: string, callback: (disciplines: Discipline[]) => void) {
        const disciplinesRef = collection(db, this.COLLECTION);
        
        // We can't easily do (members contains userId OR teacherId == userId) in one query without a composite index
        // but maybe we can just query members contains userId since the teacher is also a member usually.
        const q = query(disciplinesRef, where("members", "array-contains", userId), where("status", "==", "active"));

        return onSnapshot(q, (snapshot) => {
            const disciplines = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Discipline));
            
            callback(disciplines);
        }, (error) => {
            console.error("Error subscribing to disciplines:", error);
        });
    }

    /**
     * Busca detalhes de uma disciplina
     */
    static async getDiscipline(disciplineId: string): Promise<Discipline | null> {
        const docRef = doc(db, this.COLLECTION, disciplineId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Discipline;
        }
        return null;
    }
}
