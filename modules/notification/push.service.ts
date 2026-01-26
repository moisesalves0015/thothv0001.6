import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';

export class PushNotificationService {
    private static messaging: any = null;

    /**
     * Inicializa o serviço de messaging
     */
    static async initialize() {
        try {
            this.messaging = getMessaging();
            return true;
        } catch (error) {
            console.error('Error initializing messaging:', error);
            return false;
        }
    }

    /**
     * Solicita permissão e registra token do dispositivo
     */
    static async requestPermissionAndGetToken(userId: string): Promise<string | null> {
        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return null;
            }

            if (!this.messaging) {
                await this.initialize();
            }

            // VAPID key - você precisa gerar isso no Firebase Console
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

            if (!vapidKey) {
                console.warn('VAPID key not configured. Push notifications will not work.');
                return null;
            }

            const token = await getToken(this.messaging, { vapidKey });

            if (token) {
                // Salva token no perfil do usuário
                await this.saveTokenToUser(userId, token);
                console.log('FCM Token registered:', token);
                return token;
            }

            return null;
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    }

    /**
     * Salva token no Firestore
     */
    private static async saveTokenToUser(userId: string, token: string) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                fcmTokens: arrayUnion(token),
                lastTokenUpdate: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }

    /**
     * Escuta mensagens em foreground
     */
    static onForegroundMessage(callback: (payload: any) => void) {
        if (!this.messaging) {
            this.initialize();
        }

        if (!this.messaging) return () => { };

        return onMessage(this.messaging, (payload) => {
            console.log('Foreground message received:', payload);
            callback(payload);
        });
    }

    /**
     * Remove token ao fazer logout
     */
    static async removeToken(userId: string, token: string) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                fcmTokens: arrayRemove(token)
            });
        } catch (error) {
            console.error('Error removing FCM token:', error);
        }
    }

    /**
     * Verifica se as notificações estão habilitadas
     */
    static isSupported(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }

    /**
     * Verifica o status da permissão
     */
    static getPermissionStatus(): NotificationPermission {
        return Notification.permission;
    }
}
