import admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;
let auth: admin.auth.Auth | undefined;

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  try {
    // Use emulator in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
      console.log('Initializing Firebase Admin with emulator');
      
      // Set emulator environment variables before initializing
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      
      admin.initializeApp({
        projectId: 'studio-808864941-b51ba',
      });
      
      console.log('Firebase Admin initialized with emulator');
    } else {
      // Production: Initialize without explicit credentials
      // App Hosting should provide default credentials automatically
      admin.initializeApp({
        projectId: 'studio-808864941-b51ba',
      });
      console.log('Firebase Admin SDK initialized for production.');
    }
  } catch (error) {
    console.error('Firebase admin initialization error:', (error as Error).message);
    // Don't throw the error, just log it and continue
  }
}

// Initialize services if app is available
if (admin.apps.length > 0) {
  try {
    db = admin.firestore();
    auth = admin.auth();
    console.log('Firebase Admin services initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin services:', (error as Error).message);
  }
}

export { db, auth };
