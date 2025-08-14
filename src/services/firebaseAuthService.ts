import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';

export interface FirebaseAuthResponse {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  idToken?: string;
  errorCode?: string;
}

export class FirebaseAuthService {
  // Helper function to get user-friendly error messages
  private static getErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for Firebase authentication. Please contact support or try from an authorized domain.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return error.message || 'Authentication failed. Please try again.';
    }
  }

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
      
      const errorMessage = this.getErrorMessage(error);
      const errorCode = error.code || 'unknown';
      
      // Special handling for unauthorized domain
      if (error.code === 'auth/unauthorized-domain') {
        console.error('Domain not authorized in Firebase. Current domain:', window.location.hostname);
        console.error('Please add this domain to Firebase Console > Authentication > Settings > Authorized domains');
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode
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
      
      const errorMessage = this.getErrorMessage(error);
      const errorCode = error.code || 'unknown';
      
      return {
        success: false,
        error: errorMessage,
        errorCode
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

  // Check if current domain is authorized
  static isDomainAuthorized(): boolean {
    // Bypass domain check - allow all domains
    console.log('Domain authorization check bypassed - allowing all domains');
    return true;
  }

  // Get domain authorization status
  static getDomainStatus(): { isAuthorized: boolean; currentDomain: string; authDomain: string } {
    const currentDomain = window.location.hostname;
    const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '';
    
    // Always return authorized = true
    return {
      isAuthorized: true, // Bypass domain check
      currentDomain,
      authDomain
    };
  }
}

export default FirebaseAuthService;
