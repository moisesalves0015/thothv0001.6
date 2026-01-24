import { db } from "../../firebase";
import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    writeBatch
} from "firebase/firestore";

interface CreateProfileData {
    uid: string;
    email: string;
    fullName: string;
    username: string;
    university: string;
    phoneNumber: string;
    role?: string;
}

export class UserService {
    /**
     * Verifica se o nome de usuário já está em uso.
     * Retorna true se disponível, false se indisponível.
     * Checa a coleção 'usernames' para garantia de unicidade rápida.
     */
    static async checkUsernameAvailability(username: string): Promise<boolean> {
        const usernameLower = username.trim().toLowerCase();
        // Verifica constraints básicos
        if (usernameLower.length < 3) return false;
        if (!/^[a-z0-9_.]+$/.test(usernameLower)) return false;

        const usernameRef = doc(db, "usernames", usernameLower);
        const snap = await getDoc(usernameRef);
        return !snap.exists();
    }

    /**
     * Verifica se o email já está cadastrado no sistema (Firestore + Auth fallback).
     * Utiliza uma coleção de índice 'emails' para verificação rápida antes de criar o Auth.
     */
    static async checkEmailAvailability(email: string): Promise<boolean> {
        if (!email || !email.includes('@')) return false;

        // 1. Check UX Index (Firestore)
        const emailRef = doc(db, "emails", email.trim().toLowerCase());
        const snap = await getDoc(emailRef);
        if (snap.exists()) return false;

        // 2. Check Auth (Legacy / Fallback)
        // Isso ajuda a pegar usuários antigos que não estão no index do Firestore ainda.
        // Se a "proteção de enumeração" estiver ativada no console, isso retornará sempre true (disponível),
        // mas é a melhor tentativa que podemos fazer sem backend admin.
        try {
            // Import dinâmico ou uso direto da auth importada
            // Precisamos importar auth e fetchSignInMethodsForEmail aqui ou no topo
            const { auth } = await import('../../firebase');
            const { fetchSignInMethodsForEmail } = await import('firebase/auth');
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods.length === 0;
        } catch (error) {
            // Se der erro, assumimos disponível para não bloquear, 
            // mas o erro final de 'email-already-in-use' pegará no submit.
            return true;
        }
    }

    /**
     * Verifica se o telefone já está cadastrado no sistema (Firestore).
     * Checa a coleção 'phones'.
     */
    static async checkPhoneAvailability(phone: string): Promise<boolean> {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) return false;

        const phoneRef = doc(db, "phones", cleanPhone);
        const snap = await getDoc(phoneRef);
        return !snap.exists();
    }

    /**
     * Cria o perfil completo do usuário e reserva o username/email.
     * Utiliza BATCH WRITE para garantir atomicidade: ou salva tudo (usuário + índices) ou nada.
     * Isso evita dados órfãos se a criação falhar no meio.
     */
    static async createCompleteProfile(data: CreateProfileData): Promise<void> {
        const batch = writeBatch(db);
        const usernameLower = data.username.trim().toLowerCase();
        const emailLower = data.email.trim().toLowerCase();
        const phoneClean = data.phoneNumber.replace(/\D/g, '');

        // 1. Criar documento do usuário
        const userRef = doc(db, "users", data.uid);
        batch.set(userRef, {
            uid: data.uid,
            name: data.fullName, // Mapeando fullName para name para compatibilidade
            fullName: data.fullName,
            username: data.username,
            username_lower: usernameLower,
            email: data.email,
            phoneNumber: data.phoneNumber,
            university: data.university,
            photoURL: data.role === 'Professor'
                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.uid}&mood[]=happy`
                : `https://api.dicebear.com/7.x/initials/svg?seed=${data.fullName}`,
            role: data.role || 'Estudante',
            createdAt: serverTimestamp(),
            stats: {
                followers: 0,
                following: 0,
                projects: 0
            }
        });

        // 2. Reservar username (Indice de unicidade)
        const usernameRef = doc(db, "usernames", usernameLower);
        batch.set(usernameRef, {
            uid: data.uid,
            reservedAt: serverTimestamp()
        });

        // 3. Reservar email (Indice de unicidade para UX)
        const emailRef = doc(db, "emails", emailLower);
        batch.set(emailRef, {
            uid: data.uid,
            reservedAt: serverTimestamp()
        });

        // 4. Reservar telefone (Indice de unicidade)
        const phoneRef = doc(db, "phones", phoneClean);
        batch.set(phoneRef, {
            uid: data.uid,
            reservedAt: serverTimestamp()
        });
        await batch.commit();
    }

    /**
     * Atualiza dados parciais do perfil do usuário.
     */
    static async updateProfile(uid: string, data: Partial<CreateProfileData & { photoURL: string; bio: string }>): Promise<void> {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    }

    /**
     * Busca o perfil completo de um usuário pelo UID.
     */
    static async getUserProfile(uid: string) {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);
        return snap.exists() ? snap.data() : null;
    }
}
