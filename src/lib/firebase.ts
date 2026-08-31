import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent multiple initialization in Next.js dev mode
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);

// NOTE: getAuth() validates the API key synchronously and throws
// (auth/invalid-api-key) when the key is missing. Initializing it at module
// load crashed the Vercel build during page data collection, so auth is now
// created lazily on first use. On the client the key is always available
// (inlined at build time from the environment variables).
let _auth: ReturnType<typeof getAuth> | null = null;
export function getFirebaseAuth(): ReturnType<typeof getAuth> {
  if (!_auth) _auth = getAuth(app);
  return _auth;
}

export default app;