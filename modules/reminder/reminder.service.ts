import { db } from "../../firebase";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy
} from "firebase/firestore";
import { Reminder } from "../../types";

export class ReminderService {
    /**
     * Busca todos os lembretes do usuário
     */
    static async getReminders(userId: string): Promise<Reminder[]> {
        const ref = collection(db, "users", userId, "reminders");
        const q = query(ref, orderBy("timestamp", "desc"));
        const snap = await getDocs(q);

        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Reminder));
    }

    /**
     * Adiciona um novo lembrete
     */
    static async addReminder(userId: string, reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
        const ref = collection(db, "users", userId, "reminders");
        const docRef = await addDoc(ref, reminder);
        return {
            id: docRef.id,
            ...reminder
        };
    }

    /**
     * Atualiza um lembrete existente
     */
    static async updateReminder(userId: string, reminderId: string, updates: Partial<Reminder>): Promise<void> {
        const ref = doc(db, "users", userId, "reminders", reminderId);
        await updateDoc(ref, updates);
    }

    /**
     * Remove um lembrete
     */
    static async deleteReminder(userId: string, reminderId: string): Promise<void> {
        const ref = doc(db, "users", userId, "reminders", reminderId);
        await deleteDoc(ref);
    }
}
