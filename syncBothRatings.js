import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocs, collection, writeBatch, getDoc } from 'firebase/firestore';
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

async function syncBothRatings() {
  console.log('Finding Aymannik and Bonole accounts...');
  const usersSnap = await getDocs(collection(db, 'users'));
  
  let aymanIds = [];
  let bonoleIds = [];
  
  usersSnap.forEach(d => {
    const data = d.data();
    if (
      data.email === 'youssefayyman@gmail.com' || 
      data.username === '@Aymannik' || 
      data.username === 'aymanadal' ||
      data.username === 'Aymannik'
    ) {
      aymanIds.push(d.id);
      console.log(`Found Ayman ID: ${d.id}`);
    }
    
    if (
      data.username === '@Bonole' || 
      data.username === 'Bonole' ||
      (data.displayName && data.displayName.includes('Bonole'))
    ) {
      bonoleIds.push(d.id);
      console.log(`Found Bonole ID: ${d.id}`);
    }
  });

  if (aymanIds.length === 0 || bonoleIds.length === 0) {
    console.error('CRITICAL: Could not find both accounts.');
    process.exit(1);
  }

  const batch = writeBatch(db);
  const leagueRef = doc(db, 'leagues', 'global-league');
  
  const leagueDoc = await getDoc(leagueRef);
  let leagueMembers = {};
  if (leagueDoc.exists() && leagueDoc.data().members) {
    leagueMembers = leagueDoc.data().members;
  }

  // Update Aymannik
  for (const id of aymanIds) {
    leagueMembers[id] = {
      ...(leagueMembers[id] || { rank: 0 }),
      rating: 1039,
      lastChange: 39
    };
    batch.set(doc(db, 'stats', id), {
      totalSetsWon: 2,
      totalSetsLost: 1,
      winRate: 66.67,
      bestStreak: 1,
      winStreak: 1
    }, { merge: true });
  }

  // Update Bonole
  for (const id of bonoleIds) {
    leagueMembers[id] = {
      ...(leagueMembers[id] || { rank: 0 }),
      rating: 961,
      lastChange: -39
    };
    batch.set(doc(db, 'stats', id), {
      totalSetsWon: 1,
      totalSetsLost: 2,
      winRate: 33.33,
      bestStreak: 0,
      winStreak: 0
    }, { merge: true });
  }

  batch.set(leagueRef, { members: leagueMembers }, { merge: true });
  
  // Update match changes
  const matchesSnap = await getDocs(collection(db, 'matches'));
  matchesSnap.forEach(d => {
    const data = d.data();
    let matchNeedsUpdate = false;
    let newChanges = { ...(data.ratingChanges || {}) };
    
    const isRelevantMatch = 
      (aymanIds.includes(data.player1Id) && bonoleIds.includes(data.player2Id)) ||
      (bonoleIds.includes(data.player1Id) && aymanIds.includes(data.player2Id));
      
    if (isRelevantMatch) {
      aymanIds.forEach(id => {
        if (data.player1Id === id || data.player2Id === id) {
          newChanges[id] = 39;
          matchNeedsUpdate = true;
        }
      });
      bonoleIds.forEach(id => {
        if (data.player1Id === id || data.player2Id === id) {
          newChanges[id] = -39;
          matchNeedsUpdate = true;
        }
      });
    }
    
    if (matchNeedsUpdate) {
      batch.update(d.ref, { ratingChanges: newChanges });
    }
  });

  await batch.commit();
  console.log('Successfully synced Aymannik to 1039 and Bonole to 961.');
  process.exit(0);
}

syncBothRatings().catch(console.error);
