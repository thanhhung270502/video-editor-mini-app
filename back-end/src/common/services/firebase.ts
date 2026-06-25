import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;

export const initializeFirebase = (): admin.firestore.Firestore | undefined => {
  if (admin.apps.length === 0) {
    try {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey) {
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });

      console.log('✅ Firebase Admin initialized');
      db = admin.firestore();
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error instanceof Error ? error.message : error);
      console.warn('⚠️ Server will run, but database queries will fail. Please provide valid Firebase credentials in .env');
    }
  } else {
    db = admin.firestore();
  }

  return db;
};

export const getDb = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
};

export { admin };
