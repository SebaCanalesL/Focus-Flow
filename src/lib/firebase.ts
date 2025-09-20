// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from "firebase/auth";
import {
  initializeFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const isBrowser = typeof window !== "undefined";
const isEdgeRuntime = typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

if (isEdgeRuntime) {
  // Firestore web SDK no está soportado en Edge Runtime
  throw new Error("Firestore no es compatible con Edge Runtime. Usa Node runtime o llamadas desde el cliente.");
}

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error("Faltan variables de entorno de Firebase. Revisa tus .env(.development) con NEXT_PUBLIC_*");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔧 Firestore robusto: long-polling auto + cache local persistente + undefined-safe
const firestore = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true,
  // En SDK recientes puedes activar cache persistente así (si no, omítelo sin problema)
  // experimentalForceLongPolling: false, // deja autodetección
  // localCache: persistentLocalCache()   // si tu versión lo soporta
});

const auth = getAuth(app);
const storage = getStorage(app);

// Idioma + persistencia del login solo en navegador
if (isBrowser) {
  auth.useDeviceLanguage?.();
  // Mantener sesión tras recargar (localStorage)
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// 🧪 Emuladores opcionales
if (useEmulators) {
  try {
    connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    // console.info("[Firebase] Emulators ON");
  } catch {
    // no-op si ya estaban conectados
  }
}

export const isUsingEmulators = useEmulators;

export { app, auth, firestore, storage };