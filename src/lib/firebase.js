import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || ''
};

export const configuredAdminEmail = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL?.trim() || '';
export const appCheckSiteKey = import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY?.trim() || '';

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
export const firebaseEnabled = requiredKeys.every((key) => Boolean(firebaseConfig[key]));
export const appCheckEnabled = Boolean(appCheckSiteKey);

export const firebaseConfigHelp = requiredKeys
  .filter((key) => !firebaseConfig[key])
  .map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (match) => `_${match}`).toUpperCase()}`);

const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const appCheck = app && appCheckSiteKey
  ? initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    })
  : null;

const persistenceReady = auth
  ? setPersistence(auth, browserLocalPersistence).catch(() => {})
  : Promise.resolve();

export function onFirebaseAuthChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function ensureVisitorSession() {
  if (!auth) {
    throw new Error('Firebase ist noch nicht konfiguriert.');
  }

  await persistenceReady;
  if (typeof auth.authStateReady === 'function') {
    await auth.authStateReady();
  }

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credentials = await signInAnonymously(auth);
  return credentials.user;
}

export async function signInAdmin(email, password) {
  if (!auth) {
    throw new Error('Firebase ist noch nicht konfiguriert.');
  }

  await persistenceReady;
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
}

export async function signOutFirebase() {
  if (!auth) return;
  await signOut(auth);
}
