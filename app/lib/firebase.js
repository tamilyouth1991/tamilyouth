import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let firebaseApp;

export function getFirebaseApp() {
  if (!firebaseApp) {
    const envConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    const hasEnv = Boolean(envConfig.apiKey && envConfig.authDomain && envConfig.projectId && envConfig.appId);
    const fallbackConfig = {
      apiKey: "AIzaSyDw72f0OhlggQ8x0jJgP5xn2jG5rllxKvM",
      authDomain: "tamilyouthuser.firebaseapp.com",
      projectId: "tamilyouthuser",
      storageBucket: "tamilyouthuser.firebasestorage.app",
      messagingSenderId: "939332592079",
      appId: "1:939332592079:web:d6a0cce003c99edda432ba",
      measurementId: "G-0GKCL976SB",
    };

    const config = hasEnv ? envConfig : fallbackConfig;
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
  }
  return firebaseApp;
}

export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return getAuth(app);
}

export function getFirebaseDb() {
  const app = getFirebaseApp();
  return getFirestore(app);
}


