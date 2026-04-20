import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBukRgyPQzwC1QE0XgN1XHxKlq1T78SrFo",
  authDomain: "ai-studio-applet-webapp-9c65e.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-9c65e",
  storageBucket: "ai-studio-applet-webapp-9c65e.firebasestorage.app",
  messagingSenderId: "788975736680",
  appId: "1:788975736680:web:e82f65133587072e3b68dd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Conectado a tu base de datos específica de AI Studio
export const db = getFirestore(app, 'ai-studio-f4b65f53-ac57-48b1-9ed2-56362abb2b48');
export const storage = getStorage(app);
