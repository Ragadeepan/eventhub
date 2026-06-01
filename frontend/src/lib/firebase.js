import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = !!firebaseConfig.apiKey;

let app  = null;
let auth = null;

if (isConfigured) {
  try {
    app  = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (e) {
    console.warn('Firebase init failed:', e.message);
  }
}

const googleProvider = isConfigured ? new GoogleAuthProvider() : null;
if (googleProvider) googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, isConfigured as firebaseConfigured };

export const signInWithGoogle = () => {
  if (!auth || !googleProvider) throw new Error('Google login is not configured. Please add Firebase credentials.');
  return signInWithPopup(auth, googleProvider);
};

export const signInEmail      = (email, password) => {
  if (!auth) throw new Error('Firebase not configured');
  return signInWithEmailAndPassword(auth, email, password);
};

export const createAccount    = (email, password) => {
  if (!auth) throw new Error('Firebase not configured');
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOutUser      = () => auth ? signOut(auth) : Promise.resolve();
export const onAuthChange     = (callback) => auth ? onAuthStateChanged(auth, callback) : () => {};
export const updateUserProfile = (user, data) => auth ? updateProfile(user, data) : Promise.resolve();

export default app;
