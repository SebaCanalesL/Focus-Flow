import admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;
let auth: admin.auth.Auth | undefined;

try {
  if (!admin.apps.length) {
    // Use emulator in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      console.log('Initializing Firebase Admin with emulator');
      
      // Set emulator environment variables before initializing
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9098';
      
      admin.initializeApp({
        projectId: 'studio-808864941-b51ba',
        // For emulator, we need to disable token verification or use a mock credential
        credential: admin.credential.applicationDefault(),
        databaseURL: 'https://studio-808864941-b51ba.firebaseio.com',
      });
      
      console.log('Firebase Admin initialized with emulator');
      console.log('Emulator hosts set:');
      console.log('- FIRESTORE_EMULATOR_HOST:', process.env.FIRESTORE_EMULATOR_HOST);
      console.log('- FIREBASE_AUTH_EMULATOR_HOST:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    } else {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        console.log('Firebase Admin SDK initialized successfully.');
      } else {
        console.warn(
          'Firebase Admin SDK not initialized. Missing environment variables.'
        );
      }
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
