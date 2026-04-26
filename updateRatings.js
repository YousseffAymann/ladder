import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
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

async function addMatchAndFix() {
  const usersSnap = await getDocs(collection(db, 'users'));
  let aymanId = null;
  let bonoleId = null;

  usersSnap.forEach(doc => {
    const data = doc.data();
    if (data.email === 'youssefayyman@gmail.com' || data.username === 'aymanadal') aymanId = doc.id;
    if (data.email === 'abanoubyousab@outlook.com' || data.username === 'Bonole') bonoleId = doc.id;
  });

  if (!aymanId || !bonoleId) {
    console.log('Users not found, Ayman:', aymanId, 'Bonole:', bonoleId);
    return;
  }

  console.log('Found Ayman:', aymanId, 'Bonole:', bonoleId);

  const matchId = `m-historical-1`;
  const date = new Date('2026-04-25T12:00:00Z');

  const sets = [
    { p1Score: 6, p2Score: 0, completed: true },
    { p1Score: 6, p2Score: 4, completed: true },
    { p1Score: 6, p2Score: 7, completed: true }, // 7-6 loss for Ayman means 6-7 from his perspective
  ];

  const batch = writeBatch(db);

  batch.set(doc(db, 'matches', matchId), {
    leagueId: 'global-league',
    player1Id: aymanId,
    player2Id: bonoleId,
    sets: sets,
    sessionWinner: aymanId,
    verified: true,
    status: 'confirmed',
    ratingChanges: {
      [aymanId]: 39, // 25 + 12 - 8 + 10
      [bonoleId]: -39 // -25 - 12 + 8 - 10
    },
    date: date
  });

  batch.set(doc(db, 'leagues', 'global-league'), {
    [`members.${aymanId}.rating`]: 1039,
    [`members.${aymanId}.lastChange`]: 39,
    [`members.${bonoleId}.rating`]: 961,
    [`members.${bonoleId}.lastChange`]: -39
  }, { merge: true });

  const aymanStats = {
    totalSetsWon: 2,
    totalSetsLost: 1,
    winRate: 66.67,
    headToHead: {
      [bonoleId]: { wins: 1, losses: 0 }
    }
  };

  const bonoleStats = {
    totalSetsWon: 1,
    totalSetsLost: 2,
    winRate: 33.33,
    headToHead: {
      [aymanId]: { wins: 0, losses: 1 }
    }
  };

  batch.set(doc(db, 'stats', aymanId), aymanStats, { merge: true });
  batch.set(doc(db, 'stats', bonoleId), bonoleStats, { merge: true });

  await batch.commit();
  console.log('Match inserted and ratings updated.');
  process.exit(0);
}

addMatchAndFix().catch(console.error);
