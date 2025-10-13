import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth, connectAuthEmulator} from 'firebase/auth';
import {initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator} from 'firebase/firestore';
import {getStorage, connectStorageEmulator} from 'firebase/storage';

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
  }
);
const auth = getAuth(app);
const storage = getStorage(app);

// Connect to emulators if in development and emulators are enabled
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  console.log('Connecting to Firebase emulators');
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (e) {
    console.error("Error connecting to emulators. It's possible they are already connected.", e);
  }
}

export {app, db, auth, storage};
