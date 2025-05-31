
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (!apiKey) {
  throw new Error(
    'Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing or empty. Please check your .env file and ensure it is correctly set and that your Next.js server has been restarted.'
  );
}
if (!authDomain) {
  throw new Error('Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is missing.');
}
if (!projectId) {
  throw new Error('Firebase Project ID (NEXT_PUBLIC_FIREBASE_PROJECT_ID) is missing.');
}


const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (e: any) {
  console.error("Firebase initialization error:", e.message);
  let detailedMessage = `Failed to initialize Firebase: ${e.message}. `;
  detailedMessage += "Please double-check your Firebase project configuration values (apiKey, authDomain, projectId, etc.) in your .env file. ";
  detailedMessage += "Ensure they are correct as provided by your Firebase project settings and that Firebase services (like Authentication) are enabled in your Firebase console. ";
  detailedMessage += "Also, ensure your Next.js server was restarted after .env changes."
  throw new Error(detailedMessage);
}

try {
  auth = getAuth(app);
} catch (e: any) {
  console.error("Firebase getAuth error:", e.message);
  throw new Error(
    `Failed to get Firebase Auth instance: ${e.message}. This usually means Firebase app initialization failed. Check previous errors for details on the Firebase configuration.`
  );
}

db = getFirestore(app);

export { app, auth, db };
