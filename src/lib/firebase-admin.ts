import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

function isAdminConfigured() {
  return (
    !!process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PROJECT_ID !== 'facet-demo' &&
    !!process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_PRIVATE_KEY.length > 10
  );
}

export function getAdminApp(): App | null {
  if (!isAdminConfigured()) return null;
  if (!adminApp) {
    const apps = getApps();
    if (apps.length) {
      adminApp = apps[0];
    } else {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    }
  }
  return adminApp;
}

export function getAdminDb(): Firestore | null {
  try {
    const app = getAdminApp();
    if (!app) return null;
    if (!adminDb) adminDb = getAdminFirestore(app);
    return adminDb;
  } catch {
    return null;
  }
}
