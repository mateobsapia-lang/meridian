import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ─────────────────────────────────────────────────────────────
// INSTRUCCIONES:
// 1. Ir a https://console.firebase.google.com
// 2. Crear proyecto → Agregar app web
// 3. Copiar el firebaseConfig y pegarlo acá abajo
// 4. Habilitar: Authentication (Email/Password + Google)
//              Firestore Database
//              Storage
// ─────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
