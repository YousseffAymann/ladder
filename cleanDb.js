import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, writeBatch, deleteDoc } from 'firebase/firestore';
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

async function cleanAndReset() {
  console.log('Starting full database clean and reset...');
  
  // 1. Delete all matches, stats, trophies, notifications
  const collectionsToDelete = ['matches', 'stats', 'trophies', 'notifications'];
  for (const colName of collectionsToDelete) {
    const snap = await getDocs(collection(db, colName));
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach(d => {
      batch.delete(d.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
      console.log(`Deleted ${count} documents from ${colName}`);
    }
  }

  // 2. Fetch all users and reset their league stats to 1000
  const usersSnap = await getDocs(collection(db, 'users'));
  let aymanId = null;
  let bonoleId = null;

  const leagueMembers = {};
  const batch = writeBatch(db);

  usersSnap.forEach(d => {
    const data = d.data();
    if (data.email === 'youssefayyman@gmail.com' || data.username === 'aymanadal') aymanId = d.id;
    if (data.email === 'abanoubyousab@outlook.com' || data.username === 'Bonole') bonoleId = d.id;
    
    // Reset all users to 1000
    leagueMembers[d.id] = { rating: 1000, lastChange: 0, rank: 0 };
    
    // Create empty stats for everyone
    batch.set(doc(db, 'stats', d.id), {
      totalSetsWon: 0, totalSetsLost: 0, winRate: 0, winStreak: 0, bestStreak: 0, headToHead: {}
    });
  });

  if (!aymanId || !bonoleId) {
    console.error('CRITICAL: Could not find Ayman or Bonole. Reset aborted.');
    return;
  }

  // 3. Insert the EXACT ONE historical match
  const matchId = `m-historical-final`;
  const date = new Date('2026-04-25T21:00:00'); // 9:00 PM local time

  const sets = [
    { p1Score: 6, p2Score: 0, completed: true, change: 25, label: 'DOMINANT WIN', winner: 'p1' },
    { p1Score: 6, p2Score: 4, completed: true, change: 12, label: 'SOLID WIN', winner: 'p1' },
    { p1Score: 6, p2Score: 7, completed: true, change: -8, label: 'HEARTBREAKING DEFEAT', winner: 'p2' },
  ];

  batch.set(doc(db, 'matches', matchId), {
    leagueId: 'global-league',
    player1Id: aymanId,
    player2Id: bonoleId,
    sets: sets,
    sessionWinner: aymanId,
    verified: true,
    status: 'confirmed',
    ratingChanges: {
      [aymanId]: 39,
      [bonoleId]: -39
    },
    date: date
  });

  // 4. Set accurate final ratings and stats for the two players
  leagueMembers[aymanId] = { rating: 1039, lastChange: 39, rank: 1 };
  leagueMembers[bonoleId] = { rating: 961, lastChange: -39, rank: 2 };

  batch.set(doc(db, 'leagues', 'global-league'), {
    name: 'Ladder Club',
    createdAt: new Date(),
    members: leagueMembers
  });

  const aymanStats = {
    totalSetsWon: 2,
    totalSetsLost: 1,
    winRate: 66.67, // match win rate since 1 match = 1 win
    bestStreak: 1,
    winStreak: 1,
    headToHead: {
      [bonoleId]: { wins: 1, losses: 0 }
    }
  };

  const bonoleStats = {
    totalSetsWon: 1,
    totalSetsLost: 2,
    winRate: 0,
    bestStreak: 0,
    winStreak: 0,
    headToHead: {
      [aymanId]: { wins: 0, losses: 1 }
    }
  };

  batch.set(doc(db, 'stats', aymanId), aymanStats);
  batch.set(doc(db, 'stats', bonoleId), bonoleStats);

  await batch.commit();
  console.log('Database successfully cleaned and reset. ONE historical match inserted.');
  process.exit(0);
}

cleanAndReset().catch(console.error);
