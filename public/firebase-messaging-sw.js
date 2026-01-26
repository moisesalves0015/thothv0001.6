// Firebase Cloud Messaging Service Worker
// Este arquivo deve estar na pasta public/ para ser acessível na raiz do site

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase (mesma do seu firebase/index.ts)
// IMPORTANTE: Substitua com suas credenciais reais
firebase.initializeApp({
    apiKey: "AIzaSyBZkStF0t5bcWJxK_EFRG9Hqb_nRIhqbMY",
    authDomain: "thothv0001-4.firebaseapp.com",
    projectId: "thothv0001-4",
    storageBucket: "thothv0001-4.firebasestorage.app",
    messagingSenderId: "881831991550",
    appId: "1:881831991550:web:cd22ac9b127df1209a6daf"
});

const messaging = firebase.messaging();

// Escuta mensagens em background (quando o app não está aberto)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Nova Notificação';
    const notificationOptions = {
        body: payload.notification?.body || 'Você tem uma nova notificação',
        icon: payload.notification?.icon || '/logo.png',
        badge: '/badge.png',
        tag: payload.data?.type || 'default',
        data: payload.data,
        requireInteraction: true, // Mantém a notificação até o usuário interagir
        actions: payload.data?.type === 'connection' ? [
            { action: 'accept', title: 'Aceitar' },
            { action: 'reject', title: 'Recusar' }
        ] : []
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Trata cliques nas notificações
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/notificacoes';
    const action = event.action;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Se já existe uma janela aberta, foca nela
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus().then(() => {
                            // Envia mensagem para o cliente com a ação
                            if (action) {
                                client.postMessage({
                                    type: 'NOTIFICATION_ACTION',
                                    action: action,
                                    data: event.notification.data
                                });
                            }
                            return client.navigate(urlToOpen);
                        });
                    }
                }

                // Se não existe janela aberta, abre uma nova
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Trata fechamento de notificações
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] Notification closed:', event);
});

console.log('[firebase-messaging-sw.js] Service Worker loaded successfully');
