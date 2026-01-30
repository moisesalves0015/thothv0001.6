
import { collection, addDoc, query, orderBy, onSnapshot, Unsubscribe, where, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { PrintRequestMessage } from '../../types';

export class PrintChatService {
    /**
     * Envia uma mensagem no chat de um pedido
     */
    static async sendMessage(orderId: string, text: string, senderRole: 'customer' | 'shop') {
        const messagesRef = collection(db, 'printRequests', orderId, 'messages');
        return addDoc(messagesRef, {
            orderId,
            senderId: auth.currentUser?.uid || 'anonymous',
            senderName: auth.currentUser?.displayName || 'Usuário',
            senderRole,
            text,
            timestamp: Date.now(),
            read: false
        });
    }

    /**
     * Assina as mensagens de um pedido em tempo real
     */
    static subscribeToMessages(orderId: string, callback: (messages: PrintRequestMessage[]) => void): Unsubscribe {
        const messagesRef = collection(db, 'printRequests', orderId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as PrintRequestMessage));
            callback(messages);
        });
    }

    /**
     * Marca uma mensagem como lida
     */
    static async markAsRead(orderId: string, messageId: string) {
        const messageRef = doc(db, 'printRequests', orderId, 'messages', messageId);
        return updateDoc(messageRef, { read: true });
    }

    /**
     * Assina a contagem de mensagens não lidas de um pedido
     */
    static subscribeToUnreadCount(orderId: string, userId: string, callback: (count: number) => void): Unsubscribe {
        const messagesRef = collection(db, 'printRequests', orderId, 'messages');
        const q = query(
            messagesRef,
            where('read', '==', false),
            where('senderId', '!=', userId)
        );

        return onSnapshot(q,
            (snapshot) => {
                callback(snapshot.size);
            },
            (error) => {
                // Silently handle permission errors - user may not have access to this order
                console.warn(`[PrintChatService] Permission denied for order ${orderId}:`, error.message);
                callback(0);
            }
        );
    }
}
