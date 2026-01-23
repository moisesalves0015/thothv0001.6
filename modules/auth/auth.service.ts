
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../../firebase';

export class AuthService {
  static async login(email: string, pass: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return credential.user;
  }

  static async register(name: string, email: string, pass: string): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(credential.user, { displayName: name });
    return credential.user;
  }

  static async logout(): Promise<void> {
    await signOut(auth);
  }

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
