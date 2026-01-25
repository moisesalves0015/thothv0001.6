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
    setDoc,
    getDoc,
    arrayUnion,
    deleteDoc,
    increment
} from "firebase/firestore";
import { ChatMessage, ChatGroup, ChatUser, Author } from "../../types";

export class ChatService {
    /**
     * Cria um novo grupo de chat
     */
    static async createGroup(groupData: Omit<ChatGroup, 'id'>): Promise<string> {
        const groupRef = collection(db, "chats");
        const docRef = await addDoc(groupRef, {
            ...groupData,
            createdAt: serverTimestamp(),
            lastMessage: null,
            unreadCount: 0
        });
        return docRef.id;
    }

    /**
     * Envia uma mensagem para um chat
     */
    static async sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
        const messagesRef = collection(db, "chats", chatId, "messages");

        // Adiciona a mensagem à subcoleção
        await addDoc(messagesRef, {
            ...message,
            timestamp: serverTimestamp()
        });

        // Atualiza a última mensagem do chat para listagem e incrementa contador (simplificado)
        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
            lastMessage: {
                ...message,
                timestamp: Date.now()
            },
            updatedAt: serverTimestamp(),
            unreadCount: increment(1) // Incrementa para todos (exemplo simplificado)
        });
    }

    /**
     * Edita uma mensagem existente
     */
    static async editMessage(chatId: string, messageId: string, newText: string): Promise<void> {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);
        await updateDoc(messageRef, {
            text: newText,
            edited: true
        });
    }

    /**
     * Fixa ou desfixa uma mensagem
     */
    static async togglePinMessage(chatId: string, messageId: string, isPinned: boolean): Promise<void> {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);
        await updateDoc(messageRef, {
            pinned: isPinned
        });
    }

    /**
     * Exclui uma mensagem
     */
    static async deleteMessage(chatId: string, messageId: string): Promise<void> {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);
        await deleteDoc(messageRef);
    }

    /**
     * Adiciona uma reação a uma mensagem
     */
    static async addReaction(chatId: string, messageId: string, emoji: string, userId: string, reactions: { emoji: string; userIds: string[] }[] = []): Promise<void> {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);

        let newReactions = [...reactions];
        const existingReactionIndex = newReactions.findIndex(r => r.emoji === emoji);

        if (existingReactionIndex >= 0) {
            const reaction = newReactions[existingReactionIndex];
            if (!reaction.userIds.includes(userId)) {
                newReactions[existingReactionIndex] = {
                    ...reaction,
                    userIds: [...reaction.userIds, userId]
                };
            }
        } else {
            newReactions.push({ emoji, userIds: [userId] });
        }

        await updateDoc(messageRef, { reactions: newReactions });
    }

    /**
     * Inscreve-se para receber atualizações de mensagens de um chat
     */
    static subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();
                const timestamp = data.timestamp?.toMillis ? data.timestamp.toMillis() : Date.now();
                const dateObj = new Date(timestamp);

                return {
                    id: doc.id,
                    ...data,
                    timestamp,
                    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: dateObj.toISOString().split('T')[0]
                } as ChatMessage;
            });
            callback(messages);
        });
    }

    /**
     * Inscreve-se para receber lista de chats do usuário
     */
    private static profileCache = new Map<string, Author>();

    /**
     * Inscreve-se para receber lista de chats do usuário com metadados enriquecidos (Avatar/Nome reais)
     */
    static subscribeToUserChats(userId: string, callback: (chats: ChatGroup[]) => void, onError?: (error: any) => void) {
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("members", "array-contains", userId));

        return onSnapshot(q, async (snapshot) => {
            const chats = await Promise.all(snapshot.docs.map(async chatDoc => {
                const data = chatDoc.data() as ChatGroup;
                let finalName = data.name;
                let finalAvatar = data.avatar;

                // Para chats diretos, buscar dados do outro usuário
                if (data.type === 'direct' && data.members) {
                    const otherUserId = data.members.find(m => m !== userId);
                    if (otherUserId) {
                        try {
                            let userProfile = ChatService.profileCache.get(otherUserId);
                            if (!userProfile) {
                                const userDocRef = doc(db, "users", otherUserId);
                                const userSnap = await getDoc(userDocRef);
                                if (userSnap.exists()) {
                                    const userData = userSnap.data();
                                    userProfile = { id: userSnap.id, ...userData } as Author;
                                    ChatService.profileCache.set(otherUserId, userProfile);
                                }
                            }

                            if (userProfile) {
                                finalName = userProfile.name;
                                finalAvatar = userProfile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.name}`;
                            }
                        } catch (e) {
                            console.error("Error fetching peer profile", e);
                        }
                    }
                }

                return {
                    id: chatDoc.id,
                    ...data,
                    name: finalName,
                    avatar: finalAvatar
                } as ChatGroup;
            }));

            // Sort client-side to avoid index requirement
            chats.sort((a, b) => {
                const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
                const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
                return timeB - timeA;
            });
            callback(chats);
        }, (error) => {
            console.error("Error subscribing to chats:", error);
            if (onError) onError(error);
        });
    }

    /**
     * Busca conexões do usuário para criar grupos (substitui mock searchUsers)
     */
    static async getUserConnections(userId: string): Promise<Author[]> {
        // Implementar busca real em 'connections' subcollection
        try {
            const connectionsRef = collection(db, "users", userId, "connections");
            const q = query(connectionsRef, where("status", "==", "accepted"));
            const snapshot = await getDocs(q);

            const authors: Author[] = [];
            for (const docSnap of snapshot.docs) {
                // Para cada conexão, buscar dados do usuário
                const userRef = doc(db, "users", docSnap.id); // ID da conexão é o UID do target
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    authors.push({ id: userSnap.id, ...userSnap.data() } as Author);
                }
            }
            return authors;
        } catch (error) {
            console.error("Error fetching connections:", error);
            return [];
        }
    }

    /**
     * Cria ou retorna ID de chat direto entre dois usuários
     */
    static async getOrCreateDirectChat(currentUserId: string, targetUserId: string, targetUser?: Author): Promise<string> {
        const ids = [currentUserId, targetUserId].sort();
        const chatId = `dm_${ids[0]}_${ids[1]}`;

        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                type: 'direct',
                name: targetUser?.name || 'Chat', // Nome inicial, mas no front exibimos o nome do outro
                members: [currentUserId, targetUserId],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: null,
                users: ids
            });
        }
        return chatId;
    }

    /**
     * Marca o chat como lido (zera contador)
     */
    static async markAsRead(chatId: string): Promise<void> {
        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
            unreadCount: 0
        });
    }

    /**
     * Retorna contagem total de não lidas (simplificado)
     */
    static subscribeToUnreadCount(userId: string, callback: (count: number) => void) {
        // Query para somar unreadCount dos seus chats seria ideal
        // Por enquanto, escuta todos os chats e soma localmente (pode ser pesado se muitos chats)
        return this.subscribeToUserChats(userId, (chats) => {
            const total = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
            callback(total);
        });
    }
}
