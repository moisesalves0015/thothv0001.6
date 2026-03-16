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
import { Discipline, Author, DisciplineLesson, DisciplineMaterial, DisciplineFAQ, DisciplineEvaluation } from "../../types";
import { ChatService } from "../chat/chat.service";

export class DisciplineService {
    private static COLLECTION = "disciplines";

    /**
     * Cria uma nova disciplina
     */
    static async createDiscipline(disciplineData: Omit<Discipline, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const disciplineRef = collection(db, this.COLLECTION);
        
        // 1. Create the Chat Group for the Discipline
        const chatId = await ChatService.createGroup({
            name: disciplineData.name,
            avatar: disciplineData.bannerImage || `https://api.dicebear.com/7.x/initials/svg?seed=${disciplineData.name}`,
            type: 'study',
            members: disciplineData.members || [],
            adminId: disciplineData.teacherId,
            course: disciplineData.code,
            subject: disciplineData.name,
            tags: ['disciplina', disciplineData.code],
        });

        const docRef = await addDoc(disciplineRef, {
            ...disciplineData,
            chatId,
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
        console.log(`DisciplineService: getDiscipline called for ID: ${disciplineId} in collection: ${this.COLLECTION}`);
        const docRef = doc(db, this.COLLECTION, disciplineId);
        try {
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log(`DisciplineService: SUCCESS - Found discipline: ${docSnap.id}`);
                return { id: docSnap.id, ...docSnap.data() } as Discipline;
            } else {
                console.warn(`DisciplineService: NOT FOUND - No document at path: ${this.COLLECTION}/${disciplineId}`);
            }
        } catch (error) {
            console.error(`DisciplineService: ERROR fetching ${disciplineId}:`, error);
        }
        return null;
    }

    /**
     * Busca as aulas de uma disciplina
     */
    static async getLessons(disciplineId: string): Promise<DisciplineLesson[]> {
        const lessonsRef = collection(db, this.COLLECTION, disciplineId, "lessons");
        const q = query(lessonsRef, orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisciplineLesson));
    }

    /**
     * Busca os materiais de uma disciplina
     */
    static async getMaterials(disciplineId: string): Promise<DisciplineMaterial[]> {
        const materialsRef = collection(db, this.COLLECTION, disciplineId, "materials");
        const q = query(materialsRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisciplineMaterial));
    }

    /**
     * Busca as entregas de trabalho de uma disciplina
     */
    static async getAssignments(disciplineId: string): Promise<any[]> {
        const assignmentsRef = collection(db, this.COLLECTION, disciplineId, "assignments");
        const q = query(assignmentsRef, orderBy("dueDate", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    /**
     * Busca as FAQs de uma disciplina
     */
    static async getFAQs(disciplineId: string): Promise<DisciplineFAQ[]> {
        const faqRef = collection(db, this.COLLECTION, disciplineId, "faqs");
        const snapshot = await getDocs(faqRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisciplineFAQ));
    }

    /**
     * Busca as avaliações de uma disciplina
     */
    static async getEvaluations(disciplineId: string): Promise<DisciplineEvaluation[]> {
        const evalRef = collection(db, this.COLLECTION, disciplineId, "evaluations");
        const q = query(evalRef, orderBy("date", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DisciplineEvaluation));
    }

    /**
     * Adiciona uma aula a uma disciplina
     */
    static async addLesson(disciplineId: string, lessonData: Omit<DisciplineLesson, 'id'>): Promise<string> {
        const lessonsRef = collection(db, this.COLLECTION, disciplineId, "lessons");
        const docRef = await addDoc(lessonsRef, {
            ...lessonData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    }

    /**
     * Adiciona um material a uma disciplina
     */
    static async addMaterial(disciplineId: string, materialData: Omit<DisciplineMaterial, 'id'>): Promise<string> {
        const materialsRef = collection(db, this.COLLECTION, disciplineId, "materials");
        const docRef = await addDoc(materialsRef, {
            ...materialData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    }

    /**
     * Adiciona uma avaliação a uma disciplina
     */
    static async addEvaluation(disciplineId: string, evalData: Omit<DisciplineEvaluation, 'id'>): Promise<string> {
        const evalRef = collection(db, this.COLLECTION, disciplineId, "evaluations");
        const docRef = await addDoc(evalRef, {
            ...evalData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    }

    /**
     * Adiciona uma entrega de trabalho a uma disciplina
     */
    static async addAssignment(disciplineId: string, assignmentData: any): Promise<string> {
        const assignmentsRef = collection(db, this.COLLECTION, disciplineId, "assignments");
        const docRef = await addDoc(assignmentsRef, {
            ...assignmentData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    }

    /**
     * Adiciona uma FAQ a uma disciplina
     */
    static async addFAQ(disciplineId: string, faqData: Omit<DisciplineFAQ, 'id'>): Promise<string> {
        const faqsRef = collection(db, this.COLLECTION, disciplineId, "faqs");
        const docRef = await addDoc(faqsRef, {
            ...faqData,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    }

    /**
     * Convida ou adiciona um membro pelo ID
     */
    static async addMember(disciplineId: string, userId: string): Promise<void> {
        const disciplineRef = doc(db, this.COLLECTION, disciplineId);
        await updateDoc(disciplineRef, {
            members: arrayUnion(userId)
        });
    }

    /**
     * Busca os perfis dos membros de uma disciplina
     */
    static async getDisciplineMembers(memberIds: string[]): Promise<Author[]> {
        if (!memberIds || memberIds.length === 0) return [];
        
        const members: Author[] = [];
        // Firestore 'in' query has a limit of 10 items, so we'll fetch in chunks or individually
        // For simplicity and to handle more than 10, we'll fetch individually (cached by browser usually)
        for (const uid of memberIds) {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                members.push({
                    id: userSnap.id,
                    name: data.name || data.fullName,
                    username: data.username,
                    avatar: data.photoURL || data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`
                } as Author);
            }
        }
        return members;
    }
}
