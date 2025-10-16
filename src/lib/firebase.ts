import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth, connectAuthEmulator} from 'firebase/auth';
import {initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator} from 'firebase/firestore';
import {getStorage, connectStorageEmulator} from 'firebase/storage';
import {getMessaging, isSupported} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = initializeFirestore(
  app, 
  { 
    experimentalForceLongPolling: true,
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  },
  'focusflowv2' // Especificar la base de datos correcta
);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize messaging only in browser environment
let messaging: unknown = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

// Connect to emulators if emulators are enabled
console.log('Firebase config check:', {
  NODE_ENV: process.env.NODE_ENV,
  USE_EMULATORS: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
  shouldConnect: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
});

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  console.log('Connecting to Firebase emulators');
  try {
    connectFirestoreEmulator(db, 'localhost', 8081);
    connectAuthEmulator(auth, 'http://127.0.0.1:9098', { disableWarnings: true });
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Successfully connected to Firebase emulators');
  } catch (e) {
    console.error("Error connecting to emulators. It's possible they are already connected.", e);
  }
} else {
  console.log('Not connecting to emulators - using production Firebase');
}

export {app, db, auth, storage, messaging};
