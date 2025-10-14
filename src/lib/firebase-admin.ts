import admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;
let auth: admin.auth.Auth | undefined;

try {
  if (!admin.apps.length) {
    // Use emulator in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      console.log('Initializing Firebase Admin with emulator');
      
      // Set emulator environment variables before initializing
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      
      admin.initializeApp({
        projectId: 'studio-808864941-b51ba',
        // For emulator, we need to disable token verification or use a mock credential
        credential: admin.credential.applicationDefault(),
      });
      
      console.log('Firebase Admin initialized with emulator');
      console.log('Emulator hosts set:');
      console.log('- FIRESTORE_EMULATOR_HOST:', process.env.FIRESTORE_EMULATOR_HOST);
      console.log('- FIREBASE_AUTH_EMULATOR_HOST:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    } else {
      // Use default credentials in production (App Hosting provides these automatically)
      admin.initializeApp({
        projectId: 'studio-808864941-b51ba',
        credential: admin.credential.applicationDefault(),
      });
      console.log('Firebase Admin SDK initialized with default credentials.');
    }
  }

  if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
    console.log('Firebase Admin services initialized');
    console.log('Firestore emulator host:', process.env.FIRESTORE_EMULATOR_HOST);
    console.log('Auth emulator host:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    console.log('Firestore database initialized');
  }
} catch (error) {
  console.error('Firebase admin initialization error:', (error as Error).message);
}

export { db, auth };
