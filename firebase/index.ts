import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Singleton para o App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicialização imediata dos serviços para garantir registro no core do App
// getAuth(app) registra o componente 'auth' internamente
const auth = getAuth(app);
const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});


// Configura a persistência de forma assíncrona sem bloquear a exportação
// Configura a persistência de forma assíncrona sem bloquear a exportação
// Para PWA, usamos browserLocalPersistence para manter o usuário logado mesmo fechar o app
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn("Firebase persistence warning:", err);
});

const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { app, auth, db, storage, messaging };
export default app;