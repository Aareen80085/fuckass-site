import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern — prevent multiple initializations in hot-reload
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Only init if we have a real project ID (not demo mode)
const isFirebaseConfigured = () =>
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'facet-demo';

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  try {
    const a = getFirebaseApp();
    if (!a) return null;
    if (!auth) auth = getAuth(a);
    return auth;
  } catch {
    return null;
  }
}

export function getFirebaseDb(): Firestore | null {
  try {
    const a = getFirebaseApp();
    if (!a) return null;
    if (!db) db = getFirestore(a);
    return db;
  } catch {
    return null;
  }
}
