import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';

export interface FirebaseAuthResponse {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  idToken?: string;
}

export class FirebaseAuthService {
  // Google Sign In
  static async signInWithGoogle(): Promise<FirebaseAuthResponse> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      return {
        success: true,
        user: result.user,
        idToken
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.message || 'Google sign-in failed'
      };
    }
  }

  // Apple Sign In
  static async signInWithApple(): Promise<FirebaseAuthResponse> {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const idToken = await result.user.getIdToken();
      
      return {
        success: true,
        user: result.user,
        idToken
      };
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      return {
        success: false,
        error: error.message || 'Apple sign-in failed'
      };
    }
  }

  // Sign Out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get ID token
  static async getIdToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }
}

export default FirebaseAuthService;
