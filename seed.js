import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seedAdmin() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, 'admin@ladder.net', 'admin123');
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: 'admin@ladder.net',
      displayName: 'System Admin',
      username: 'admin',
      initials: 'SA',
      status: 'approved',
      isAdmin: true,
      createdAt: new Date(),
      leagues: []
    });
    console.log('Admin account created successfully');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists.');
    } else {
      console.error('Error creating admin:', error);
    }
    process.exit(1);
  }
}

seedAdmin();
