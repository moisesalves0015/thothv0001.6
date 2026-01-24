
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../firebase';

/**
 * AuthService
 * Encapsula as operações diretas com o Firebase Authentication.
 * Fornece métodos estáticos para login, registro, logout e verificação de email.
 */
export class AuthService {
  /**
   * Realiza o login do usuário com email e senha.
   * @param email - Email do usuário.
   * @param pass - Senha do usuário.
   * @returns Promise com o objeto User do Firebase.
   */
  static async login(email: string, pass: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return credential.user;
  }

  /**
   * Registra um novo usuário no Firebase Authentication e atualiza o Display Name.
   * @param name - Nome completo do usuário.
   * @param email - Email do usuário.
   * @param pass - Senha do usuário.
   * @returns Promise com o objeto User do Firebase recém-criado.
   */
  static async register(name: string, email: string, pass: string): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(credential.user, { displayName: name });
    return credential.user;
  }

  /**
   * Desloga o usuário atual.
   */
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  /**
   * Verifica se o email já está associado a alguma conta existente.
   * Nota: Depende da configuração de "Enumeration Protection" do Firebase Console.
   * @returns true se o email estiver disponível (não usado), false caso contrário.
   */
  static async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length === 0;
    } catch (error) {
      console.error("Error checking email:", error);
      // Assume available if error to not block user, validation will happen on signup
      return true;
    }
  }
}
