import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase.js';
import { 
  collection, doc, onSnapshot, setDoc, updateDoc, 
  query, where, writeBatch, serverTimestamp, getDocs, getDoc 
} from 'firebase/firestore';
import { useAuth } from './AuthContext.jsx';
import { calculateMatchRatings } from '../utils/ranking.js';
import { isValidCompletedSet, isSameDay } from '../utils/validation.js';

const LeagueContext = createContext(null);

const LEAGUE_ID = 'global-league';

export function LeagueProvider({ children }) {
  const { user } = useAuth();
  const [league, setLeague] = useState({ id: LEAGUE_ID, members: {} });
  const [users, setUsers] = useState({});
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [stats, setStats] = useState({});
  const [trophies, setTrophies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize league if it doesn't exist and fetch data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const init = async () => {
      const leagueRef = doc(db, 'leagues', LEAGUE_ID);
      const snap = await getDoc(leagueRef);
      if (!snap.exists()) {
        await setDoc(leagueRef, {
          name: 'Ladder Club',
          createdAt: serverTimestamp(),
          members: {}
        });
      }
    };
    init();

    const unsubLeague = onSnapshot(doc(db, 'leagues', LEAGUE_ID), (d) => {
      if (d.exists()) setLeague({ id: d.id, ...d.data() });
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const us = {};
      snap.forEach(d => { us[d.id] = { id: d.id, ...d.data() }; });
      setUsers(us);
    });

    const unsubMatches = onSnapshot(query(collection(db, 'matches'), where('leagueId', '==', LEAGUE_ID)), (snap) => {
      const ms = [];
      const pm = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        // Handle timestamps from firestore
        data.date = data.date?.toDate ? data.date.toDate() : new Date();
        if (data.status === 'pending_verification') pm.push(data);
        else ms.push(data);
      });
      setMatches(ms);
      setPendingMatches(pm);
    });

    const unsubTournaments = onSnapshot(query(collection(db, 'tournaments'), where('leagueId', '==', LEAGUE_ID)), (snap) => {
      const ts = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        data.createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        if (data.completedAt) data.completedAt = data.completedAt.toDate ? data.completedAt.toDate() : new Date();
        ts.push(data);
      });
      setTournaments(ts);
    });

    const unsubTrophies = onSnapshot(query(collection(db, 'trophies'), where('leagueId', '==', LEAGUE_ID)), (snap) => {
      const tr = [];
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        data.dateWon = data.dateWon?.toDate ? data.dateWon.toDate() : new Date();
        tr.push(data);
      });
      setTrophies(tr);
    });

    const unsubStats = onSnapshot(collection(db, 'stats'), (snap) => {
      const st = {};
      snap.forEach(d => { st[d.id] = d.data(); });
      setStats(st);
    });

    const unsubNotifs = onSnapshot(query(collection(db, 'notifications'), where('userId', '==', user.id)), (snap) => {
      const ns = [];
      snap.forEach(d => ns.push({ id: d.id, ...d.data() }));
      setNotifications(ns);
    });

    setLoading(false);

    return () => {
      unsubLeague(); unsubUsers(); unsubMatches(); unsubTournaments(); unsubTrophies(); unsubStats(); unsubNotifs();
    };
  }, [user]);

  // Make sure new users get a default rating when they load
  useEffect(() => {
    if (!user || loading || !league.id) return;
    
    // Add current user to league if missing
    if (!league.members || !league.members[user.id]) {
      const update = async () => {
        const lRef = doc(db, 'leagues', LEAGUE_ID);
        await setDoc(lRef, {
          members: {
            [user.id]: { rating: 1000, lastChange: 0, rank: 0 } // Rank calculated dynamically below
          }
        }, { merge: true });
        
        const sRef = doc(db, 'stats', user.id);
        await setDoc(sRef, {
          totalSetsWon: 0, totalSetsLost: 0, winRate: 0, winStreak: 0, bestStreak: 0, headToHead: {}
        }, { merge: true });
      };
      update();
    }
  }, [user, league, loading]);

  const getRankings = useCallback(() => {
    if (!league || !league.members) return [];
    
    const players = Object.entries(league.members).map(([id, data]) => {
      const u = users[id] || {};
      return { id, ...u, ...data };
    });
    
    return players
      .sort((a, b) => b.rating - a.rating)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }, [league, users]);

  const submitMatch = useCallback(async (currentUserId, opponentId, sets) => {
    const allSets = sets.map(s => ({
      ...s,
      completed: isValidCompletedSet(s.p1Score, s.p2Score),
    }));

    const result = calculateMatchRatings(allSets);
    const matchId = `m-${Date.now()}`;
    const batch = writeBatch(db);

    const matchRef = doc(db, 'matches', matchId);
    batch.set(matchRef, {
      leagueId: LEAGUE_ID,
      player1Id: currentUserId,
      player2Id: opponentId,
      sets: allSets,
      sessionWinner: result.sessionWinner === 'p1' ? currentUserId :
        result.sessionWinner === 'p2' ? opponentId : null,
      verified: false,
      ratingChanges: {
        [currentUserId]: result.p1Change,
        [opponentId]: result.p2Change,
      },
      date: serverTimestamp(),
      status: 'pending_verification',
    });

    const notifRef = doc(db, 'notifications', `n-${Date.now()}`);
    batch.set(notifRef, {
      type: 'match_verification',
      userId: opponentId,
      fromUserId: currentUserId,
      matchId: matchId,
      message: `${users[currentUserId]?.displayName} submitted: ${allSets.map(s => `${s.p1Score}-${s.p2Score}`).join(', ')}`,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    await batch.commit();
    return { match: { id: matchId }, result };
  }, [users]);

  const verifyMatch = useCallback(async (matchId, approved) => {
    const match = pendingMatches.find(m => m.id === matchId);
    if (!match) return;

    const batch = writeBatch(db);
    
    // Update notifications
    const notifsToUpdate = notifications.filter(n => n.matchId === matchId);
    for (const n of notifsToUpdate) {
      batch.update(doc(db, 'notifications', n.id), { status: approved ? 'confirmed' : 'disputed' });
    }

    if (approved) {
      batch.update(doc(db, 'matches', matchId), { verified: true, status: 'confirmed' });
      
      const p1Id = match.player1Id;
      const p2Id = match.player2Id;
      const p1Change = match.ratingChanges[p1Id] || 0;
      const p2Change = match.ratingChanges[p2Id] || 0;

      const p1Data = league.members[p1Id] || { rating: 1000 };
      const p2Data = league.members[p2Id] || { rating: 1000 };

      batch.update(doc(db, 'leagues', LEAGUE_ID), {
        [`members.${p1Id}.rating`]: p1Data.rating + p1Change,
        [`members.${p1Id}.lastChange`]: p1Change,
        [`members.${p2Id}.rating`]: p2Data.rating + p2Change,
        [`members.${p2Id}.lastChange`]: p2Change,
      });
      
      // Update stats
      const result = calculateMatchRatings(match.sets);
      const p1Stats = stats[p1Id] || { totalSetsWon: 0, totalSetsLost: 0, headToHead: {} };
      const p2Stats = stats[p2Id] || { totalSetsWon: 0, totalSetsLost: 0, headToHead: {} };
      
      const newP1SetsWon = (p1Stats.totalSetsWon || 0) + result.p1SetsWon;
      const newP1SetsLost = (p1Stats.totalSetsLost || 0) + result.p2SetsWon;
      const newP2SetsWon = (p2Stats.totalSetsWon || 0) + result.p2SetsWon;
      const newP2SetsLost = (p2Stats.totalSetsLost || 0) + result.p1SetsWon;

      // H2H
      const p1H2h = p1Stats.headToHead || {};
      const p1vsP2 = p1H2h[p2Id] || { wins: 0, losses: 0 };
      const p2H2h = p2Stats.headToHead || {};
      const p2vsP1 = p2H2h[p1Id] || { wins: 0, losses: 0 };
      
      const p1Wins = result.p1SetsWon > result.p2SetsWon ? 1 : 0;
      const p2Wins = result.p2SetsWon > result.p1SetsWon ? 1 : 0;

      batch.set(doc(db, 'stats', p1Id), {
        ...p1Stats,
        totalSetsWon: newP1SetsWon,
        totalSetsLost: newP1SetsLost,
        winRate: newP1SetsWon / (newP1SetsWon + newP1SetsLost || 1) * 100,
        headToHead: { ...p1H2h, [p2Id]: { wins: p1vsP2.wins + p1Wins, losses: p1vsP2.losses + p2Wins } }
      }, { merge: true });

      batch.set(doc(db, 'stats', p2Id), {
        ...p2Stats,
        totalSetsWon: newP2SetsWon,
        totalSetsLost: newP2SetsLost,
        winRate: newP2SetsWon / (newP2SetsWon + newP2SetsLost || 1) * 100,
        headToHead: { ...p2H2h, [p1Id]: { wins: p2vsP1.wins + p2Wins, losses: p2vsP1.losses + p1Wins } }
      }, { merge: true });
    } else {
      batch.update(doc(db, 'matches', matchId), { status: 'disputed' });
    }

    await batch.commit();
  }, [pendingMatches, notifications, league, stats]);

  const createTournament = useCallback(async (name, format, players) => {
    const ref = doc(collection(db, 'tournaments'));
    await setDoc(ref, {
      leagueId: LEAGUE_ID,
      name,
      format,
      status: 'active',
      players,
      sets: [],
      winner: null,
      ratingChange: 50,
      createdAt: serverTimestamp(),
      completedAt: null,
    });
  }, []);

  const completeTournament = useCallback(async (tournamentId, winnerId, loserId, finalSets) => {
    const batch = writeBatch(db);
    const tRef = doc(db, 'tournaments', tournamentId);
    
    batch.update(tRef, {
      status: 'completed',
      winner: winnerId,
      sets: finalSets,
      completedAt: serverTimestamp()
    });

    const wData = league.members[winnerId] || { rating: 1000 };
    const lData = league.members[loserId] || { rating: 1000 };

    batch.update(doc(db, 'leagues', LEAGUE_ID), {
      [`members.${winnerId}.rating`]: wData.rating + 50,
      [`members.${winnerId}.lastChange`]: 50,
      [`members.${loserId}.rating`]: lData.rating - 50,
      [`members.${loserId}.lastChange`]: -50,
    });

    const tournament = tournaments.find(t => t.id === tournamentId);
    const trRef = doc(collection(db, 'trophies'));
    batch.set(trRef, {
      userId: winnerId,
      leagueId: LEAGUE_ID,
      tournamentId,
      tournamentName: tournament?.name || 'Tournament',
      dateWon: serverTimestamp(),
      opponent: users[loserId]?.displayName || 'Opponent',
      finalScore: finalSets.map(s => `${s.p1Score}-${s.p2Score}`).join(', '),
    });

    // Update tournament stats
    const wStats = stats[winnerId] || {};
    batch.set(doc(db, 'stats', winnerId), {
      ...wStats,
      tournamentWins: (wStats.tournamentWins || 0) + 1
    }, { merge: true });

    await batch.commit();
  }, [league, tournaments, users, stats]);

  const getUserNotifications = useCallback((userId) => {
    return notifications.filter(n => n.userId === userId && n.status === 'pending');
  }, [notifications]);

  const approveUser = useCallback(async (userId) => {
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', userId), { status: 'approved' });
    
    // Auto-add to global league if approved
    const lData = league.members || {};
    if (!lData[userId]) {
      batch.set(doc(db, 'leagues', LEAGUE_ID), {
        [`members.${userId}`]: { rating: 1000, lastChange: 0, rank: 0 }
      }, { merge: true });
      
      batch.set(doc(db, 'stats', userId), {
        totalSetsWon: 0, totalSetsLost: 0, winRate: 0, winStreak: 0, bestStreak: 0, headToHead: {}
      }, { merge: true });
    }
    await batch.commit();
  }, [league]);

  const rejectUser = useCallback(async (userId) => {
    await updateDoc(doc(db, 'users', userId), { status: 'rejected' });
  }, []);

  const banUser = useCallback(async (userId) => {
    await updateDoc(doc(db, 'users', userId), { status: 'banned' });
  }, []);

  const updateUserRole = useCallback(async (userId, isAdmin) => {
    await updateDoc(doc(db, 'users', userId), { isAdmin });
  }, []);

  return (
    <LeagueContext.Provider value={{
      league, users, matches, tournaments, stats, trophies, notifications, pendingMatches,
      getRankings, submitMatch, verifyMatch, completeTournament, createTournament,
      getUserNotifications, approveUser, rejectUser, banUser, updateUserRole
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
}
