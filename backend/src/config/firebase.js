import admin from 'firebase-admin';

const isConfigured = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

export const initFirebaseAdmin = () => {
  if (!isConfigured) return null;
  if (admin.apps.length) return admin.apps[0];

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  console.log('✅ Firebase Admin initialized');
  return app;
};

export const verifyFirebaseToken = async (idToken) => {
  if (!isConfigured) throw new Error('Firebase is not configured on this server');
  if (!admin.apps.length) initFirebaseAdmin();
  return admin.auth().verifyIdToken(idToken);
};

export default admin;
