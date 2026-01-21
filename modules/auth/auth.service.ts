
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
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
}
