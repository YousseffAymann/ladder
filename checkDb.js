import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, collection } from 'firebase/firestore';
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
const db = getFirestore(app);

async function check() {
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log("USERS:");
  let aymanIds = [];
  usersSnap.forEach(d => {
    const data = d.data();
    console.log(`ID: ${d.id}, Email: ${data.email}, Username: ${data.username}`);
    if (data.email === 'youssefayyman@gmail.com' || data.username === '@Aymannik' || data.username === 'aymanadal' || data.username === 'Aymannik') {
      aymanIds.push(d.id);
    }
  });

  console.log("\nFound Ayman IDs:", aymanIds);

  const leagueDoc = await getDoc(doc(db, 'leagues', 'global-league'));
  if (leagueDoc.exists()) {
    console.log("\nGLOBAL LEAGUE MEMBERS:");
    const members = leagueDoc.data().members;
    for (const [uid, data] of Object.entries(members)) {
      console.log(`UID: ${uid}, Rating: ${data.rating}, LastChange: ${data.lastChange}`);
    }
  } else {
    console.log("Global league not found.");
  }
  
  process.exit(0);
}

check().catch(console.error);
