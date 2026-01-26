import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK
admin.initializeApp();

/**
 * Cloud Function que envia push notifications quando uma notificação é criada no Firestore
 * Trigger: onCreate em /notifications/{notificationId}
 */
export const sendConnectionNotification = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        try {
            const notification = snap.data();
            const notificationId = context.params.notificationId;

            // Log para debug
            console.log('Nova notificação criada:', notificationId, notification);

            // Apenas processa notificações de conexão
            if (notification.type !== 'connection') {
                console.log('Notificação não é do tipo connection, ignorando');
                return null;
            }

            const userId = notification.userId;

            // Busca os tokens FCM do usuário
            const userDoc = await admin.firestore().doc(`users/${userId}`).get();

            if (!userDoc.exists) {
                console.log('Usuário não encontrado:', userId);
                return null;
            }

            const userData = userDoc.data();
            const fcmTokens = userData?.fcmTokens || [];

            if (fcmTokens.length === 0) {
                console.log('Usuário não tem tokens FCM registrados');
                return null;
            }

            console.log(`Enviando notificação para ${fcmTokens.length} dispositivo(s)`);

            // Monta a mensagem de notificação
            const message = {
                notification: {
                    title: notification.title || 'Nova Notificação',
                    body: notification.desc || '',
                    icon: notification.avatar || '/logo.png',
                },
                data: {
                    type: 'connection',
                    fromUserId: notification.metadata?.fromUserId || '',
                    notificationId: notificationId,
                    url: '/notificacoes',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                },
                tokens: fcmTokens
            };

            // Envia a notificação para todos os dispositivos
            const response = await admin.messaging().sendMulticast(message);

            console.log('Notificações enviadas com sucesso:', response.successCount);
            console.log('Falhas:', response.failureCount);

            // Remove tokens inválidos
            if (response.failureCount > 0) {
                const tokensToRemove: string[] = [];

                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.error('Erro ao enviar para token:', fcmTokens[idx], resp.error);
                        // Remove tokens inválidos ou expirados
                        if (resp.error?.code === 'messaging/invalid-registration-token' ||
                            resp.error?.code === 'messaging/registration-token-not-registered') {
                            tokensToRemove.push(fcmTokens[idx]);
                        }
                    }
                });

                // Remove tokens inválidos do Firestore
                if (tokensToRemove.length > 0) {
                    console.log('Removendo tokens inválidos:', tokensToRemove.length);
                    await admin.firestore().doc(`users/${userId}`).update({
                        fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
                    });
                }
            }

            return {
                success: true,
                sent: response.successCount,
                failed: response.failureCount
            };

        } catch (error) {
            console.error('Erro ao enviar notificação push:', error);
            return {
                success: false,
                error: error
            };
        }
    });

/**
 * Cloud Function de teste para verificar se as functions estão funcionando
 * Pode ser chamada via HTTP para testar
 */
export const testPushNotification = functions.https.onRequest(async (req, res) => {
    try {
        const userId = req.query.userId as string;

        if (!userId) {
            res.status(400).send('userId é obrigatório');
            return;
        }

        const userDoc = await admin.firestore().doc(`users/${userId}`).get();
        const fcmTokens = userDoc.data()?.fcmTokens || [];

        if (fcmTokens.length === 0) {
            res.status(404).send('Usuário não tem tokens FCM');
            return;
        }

        const message = {
            notification: {
                title: '🔔 Teste de Notificação',
                body: 'Se você está vendo isso, as push notifications estão funcionando!',
                icon: '/logo.png'
            },
            data: {
                type: 'test',
                url: '/notificacoes'
            },
            tokens: fcmTokens
        };

        const response = await admin.messaging().sendMulticast(message);

        res.json({
            success: true,
            sent: response.successCount,
            failed: response.failureCount,
            tokens: fcmTokens.length
        });

    } catch (error) {
        console.error('Erro no teste:', error);
        res.status(500).json({ error: String(error) });
    }
});
