import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyBZkStF0t5bcWJxK_EFRG9Hqb_nRIhqbMY",
  authDomain: "thothv0001-4.firebaseapp.com",
  projectId: "thothv0001-4",
  storageBucket: "thothv0001-4.firebasestorage.app",
  messagingSenderId: "881831991550",
  appId: "1:881831991550:web:cd22ac9b127df1209a6daf",
  measurementId: "G-2H7H2L52MW"
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