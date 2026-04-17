/**
 * authService.ts
 * Bridges Firebase Authentication with the local Zustand store.
 * When Firebase is not configured, falls back to local-only auth (demo mode).
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from './firebase';
import { User } from './store';

export type AuthError = {
  code: string;
  message: string;
};

// ─── Firestore helpers ────────────────────────────────────────────────────────

export async function saveUserToFirestore(uid: string, data: Partial<User>) {
  const db = getFirebaseDb();
  if (!db) return;
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

async function getUserFromFirestore(uid: string): Promise<Partial<User> | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return null;
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as Partial<User>) : null;
  } catch (error) {
    console.warn('Firestore not reachable or user doc missing. Skipping firestore sync.', error);
    return null;
  }
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function firebaseSignUp(
  email: string,
  password: string,
  displayName: string,
  role: User['role'],
  niche: string,
  bio: string
): Promise<{ user: Partial<User> } | { error: AuthError }> {
  const auth = getFirebaseAuth();

  // Demo mode: return success without actual Firebase call
  if (!auth) {
    return {
      user: {
        id: `demo-${Date.now()}`,
        email,
        displayName,
        role,
        niche,
        bio,
        username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        skills: [],
        portfolio: [],
        socialLinks: [],
        profileScore: 20,
        createdAt: new Date().toISOString().split('T')[0],
      },
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    const userData: Partial<User> = {
      id: cred.user.uid,
      email,
      displayName,
      role,
      niche,
      bio,
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      skills: [],
      portfolio: [],
      socialLinks: [],
      profileScore: 20,
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Database enabled - permanently save the user information
    await saveUserToFirestore(cred.user.uid, userData);
    
    return { user: userData };
  } catch (err: any) {
    return { error: { code: err.code || 'auth/unknown', message: friendlyError(err.code) } };
  }
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

export async function firebaseSignIn(
  email: string,
  password: string
): Promise<{ user: Partial<User> } | { error: AuthError }> {
  const auth = getFirebaseAuth();

  if (!auth) {
    // Demo mode — handled by Zustand store directly
    return { error: { code: 'demo/no-firebase', message: 'Using demo mode (no Firebase configured).' } };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch full profile from Firestore database now that it's enabled
    const firestoreUser = await getUserFromFirestore(cred.user.uid);
    const userData: Partial<User> = {
      id: cred.user.uid,
      email: cred.user.email || email,
      displayName: cred.user.displayName || firestoreUser?.displayName || '',
      ...firestoreUser,
    };
    return { user: userData };
  } catch (err: any) {
    console.error('Firebase Auth Error Raw:', err);
    return { error: { code: err.code || 'auth/unknown', message: friendlyError(err.code) } };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function firebaseSignOut() {
  const auth = getFirebaseAuth();
  if (auth) await signOut(auth);
}

// ─── Password Reset ──────────────────────────────────────────────────────────

export async function firebaseResetPassword(email: string): Promise<{ error?: AuthError }> {
  const auth = getFirebaseAuth();
  if (!auth) return {}; // demo mode — pretend success
  try {
    await sendPasswordResetEmail(auth, email);
    return {};
  } catch (err: any) {
    return { error: { code: err.code, message: friendlyError(err.code) } };
  }
}

// ─── Sync profile to Firestore ───────────────────────────────────────────────

export async function syncProfileToFirestore(uid: string, data: Partial<User>) {
  const db = getFirebaseDb();
  if (!db || !uid) return;
  try {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  } catch {
    // If doc doesn't exist yet, create it
    await saveUserToFirestore(uid, data);
  }
}

// ─── Auth observer ───────────────────────────────────────────────────────────

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  const auth = getFirebaseAuth();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

// ─── Error messages ──────────────────────────────────────────────────────────

function friendlyError(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'User already exists. Sign in?',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'Password or Email Incorrect',
    'auth/wrong-password': 'Password or Email Incorrect',
    'auth/invalid-credential': 'Password or Email Incorrect',
    'auth/invalid-login-credentials': 'Password or Email Incorrect',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return messages[code] || `Authentication failed (${code}). Please try again.`;
}
