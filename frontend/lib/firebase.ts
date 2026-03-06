import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const getFirebaseConfig = () => ({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
});

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApps()[0];
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

// Export for convenience - initialized lazily on first access
export const auth = {
  get current() { return getFirebaseAuth(); },
};

export default { get current() { return getFirebaseApp(); } };
