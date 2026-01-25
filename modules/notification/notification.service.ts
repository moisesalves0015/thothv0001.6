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
    deleteDoc,
    limit
} from "firebase/firestore";

export interface ThothNotification {
    id?: string;
    userId: string;
    type: 'like' | 'comment' | 'connection' | 'badge' | 'academic' | 'event' | 'reminder';
    title: string;
    desc: string;
    isRead: boolean;
    avatar?: string;
    actionDone?: boolean;
    timestamp: any;
    metadata?: any;
}

export class NotificationService {
    /**
     * Busca notificações de um usuário
     */
    static async getNotifications(userId: string): Promise<ThothNotification[]> {
        const ref = collection(db, "notifications");
        const q = query(
            ref,
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(50)
        );
        const snap = await getDocs(q);

        return snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ThothNotification));
    }

    /**
     * Cria uma nova notificação
     */
    static async createNotification(data: Omit<ThothNotification, 'id' | 'timestamp' | 'isRead'>): Promise<string> {
        const ref = collection(db, "notifications");
        const docRef = await addDoc(ref, {
            ...data,
            isRead: false,
            timestamp: serverTimestamp()
        });
        return docRef.id;
    }

    /**
     * Marca notificação como lida
     */
    static async markAsRead(userId: string, notificationId: string): Promise<void> {
        const ref = doc(db, "notifications", notificationId);
        await updateDoc(ref, { isRead: true });
    }

    /**
     * Remove uma notificação
     */
    static async deleteNotification(userId: string, notificationId: string): Promise<void> {
        const ref = doc(db, "notifications", notificationId);
        await deleteDoc(ref);
    }

    /**
     * Inscreve-se para contagem de notificações não lidas
     */
    static subscribeToUnreadCount(userId: string, callback: (count: number) => void) {
        const ref = collection(db, "notifications");
        const q = query(ref, where("userId", "==", userId), where("isRead", "==", false));

        return onSnapshot(q, (snapshot) => {
            callback(snapshot.size);
        });
    }

    /**
     * Inscreve-se para a lista de notificações
     */
    static subscribeToNotifications(userId: string, callback: (notifications: ThothNotification[]) => void) {
        const ref = collection(db, "notifications");
        const q = query(ref, where("userId", "==", userId), orderBy("timestamp", "desc"), limit(50));

        return onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ThothNotification));
            callback(notifs);
        });
    }
}
