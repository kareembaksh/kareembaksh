import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDtm8utWbAqtqZDi11RBTGthH9YsZAvtT0",
  authDomain: "kareembaksh-eafeb.firebaseapp.com",
  projectId: "kareembaksh-eafeb",
  storageBucket: "kareembaksh-eafeb.firebasestorage.app",
  messagingSenderId: "601000524378",
  appId: "1:601000524378:web:3bc8849dbaae8040763663",
};

// Prevent multiple initialization in Next.js dev mode
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db      = getFirestore(app);
export const storage = getStorage(app);
export const auth    = getAuth(app);
export default app;
