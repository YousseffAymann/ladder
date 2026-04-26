import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import StatBar from '../components/StatBar.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Activity, Flame, Target, Trophy, TrendingUp, TrendingDown, Clock, History, Settings } from 'lucide-react';

export default function StatsPage() {
  const { user } = useAuth();
  const { stats, users, matches } = useLeague();
  
  const userStats = stats[user?.id];

  const userMatches = useMemo(() => {
    if (!user) return [];
    return matches
      .filter(m => (m.player1Id === user.id || m.player2Id === user.id) && m.verified)
      .sort((a, b) => b.date - a.date);
  }, [matches, user]);

  const metrics = useMemo(() => {
    let totalWins = 0, totalLosses = 0;
    let pointsGained = 0, pointsLost = 0;
    let biggestWin = 0, worstLoss = 0;
    let currentStreak = 0;
    let streakActive = true;
    let setsWon = 0, setsLost = 0;

    userMatches.forEach(m => {
      const isP1 = m.player1Id === user.id;
      const ratingChange = m.ratingChanges?.[user.id] || 0;
      
      let uSets = 0, oSets = 0;
      m.sets.forEach(s => {
        const p1WonSet = s.p1Score > s.p2Score;
        if (isP1) { if(p1WonSet) uSets++; else oSets++; }
        else { if(!p1WonSet) uSets++; else oSets++; }
      });
      setsWon += uSets;
      setsLost += oSets;

      const matchWon = m.sessionWinner === user.id || (m.sessionWinner === null && uSets > oSets) || (ratingChange > 0);
      
      if (matchWon) {
        totalWins++;
        if (streakActive) currentStreak++;
      } else {
        totalLosses++;
        streakActive = false;
      }

      if (ratingChange > 0) pointsGained += ratingChange;
      else if (ratingChange < 0) pointsLost += Math.abs(ratingChange);

      if (ratingChange > biggestWin) biggestWin = ratingChange;
      if (ratingChange < worstLoss) worstLoss = ratingChange;
    });

    const totalMatches = totalWins + totalLosses;
    const matchWinPct = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
    const totalSets = setsWon + setsLost;
    const setWinPct = totalSets > 0 ? (setsWon / totalSets) * 100 : 0;

    return {
      totalWins, totalLosses, matchWinPct,
      setsWon, setsLost, setWinPct,
      pointsGained, pointsLost,
      biggestWin, worstLoss,
      currentStreak
    };
  }, [userMatches, user]);

  if (!userStats) return (
    <PageTransition>
      <div className="page stack-xl">
        <div className="page-header stack-xs">
          <h1 className="page-title">Statistics</h1>
          <div className="page-subtitle">Your analytical performance</div>
        </div>
        <div className="text-secondary text-center" style={{ padding: '32px 0' }}>No stats available yet.<br/>Play a match to generate stats.</div>
      </div>
    </PageTransition>
  );

  const opponentId = Object.keys(userStats.headToHead || {})[0];
  const h2h = userStats.headToHead?.[opponentId] || { wins: 0, losses: 0 };
  const oppName = users[opponentId]?.displayName || 'Opponent';

  return (
    <PageTransition>
      <div className="page stack-xl">
        <div className="row-between" style={{ alignItems: 'flex-start' }}>
          <div className="page-header stack-xs" style={{ margin: 0 }}>
            <h1 className="page-title">Statistics</h1>
            <div className="page-subtitle">Your analytical performance</div>
          </div>
          <Link to="/settings" className="btn btn-ghost btn-icon">
            <Settings size={24} color="var(--secondary)" />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card stack-sm center text-center border-gold">
            <Trophy size={24} color="var(--gold)" />
            <div className="text-xs text-secondary">Match Win %</div>
            <div className="text-2xl font-black">{metrics.matchWinPct.toFixed(1)}%</div>
            <div className="text-xs text-tertiary">{metrics.totalWins}W - {metrics.totalLosses}L</div>
          </div>
          <div className="card stack-sm center text-center">
            <Flame size={24} color={metrics.currentStreak > 2 ? 'var(--gold)' : 'var(--red)'} />
            <div className="text-xs text-secondary">Current Streak</div>
            <div className="text-2xl font-black">{metrics.currentStreak}</div>
            <div className="text-xs text-tertiary">Best: {userStats.bestStreak || 0}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card stack-sm center text-center">
            <TrendingUp size={24} color="var(--gold)" />
            <div className="text-xs text-secondary">Points Gained</div>
            <div className="text-xl font-bold text-gold">+{metrics.pointsGained}</div>
            <div className="text-xs text-tertiary">Best: +{metrics.biggestWin}</div>
          </div>
          <div className="card stack-sm center text-center">
            <TrendingDown size={24} color="var(--red)" />
            <div className="text-xs text-secondary">Points Lost</div>
            <div className="text-xl font-bold text-red">-{metrics.pointsLost}</div>
            <div className="text-xs text-tertiary">Worst: {metrics.worstLoss}</div>
          </div>
        </div>

        <div className="card stack-lg">
          <div className="row" style={{ gap: 8 }}>
            <Target size={20} color="var(--blue)" />
            <span className="font-bold">Set Performance ({metrics.setWinPct.toFixed(1)}%)</span>
          </div>
          <div className="stack-md">
            <StatBar label="Sets Won" value={metrics.setsWon} max={metrics.setsWon + metrics.setsLost || 1} />
            <StatBar label="Sets Lost" value={metrics.setsLost} max={metrics.setsWon + metrics.setsLost || 1} />
          </div>
        </div>

        {metrics.setsWon + metrics.setsLost > 0 && opponentId && (
          <div className="card stack-lg">
            <div className="row" style={{ gap: 8 }}>
              <Trophy size={20} color="var(--gold)" />
              <span className="font-bold">Most Frequent Head to Head</span>
            </div>
            <div className="stack-md text-sm">
              <div className="row-between text-secondary">
                <span>vs {oppName}</span>
                <span>{h2h.wins} - {h2h.losses}</span>
              </div>
              <div className="stat-bar-track">
                <div 
                  className="stat-bar-fill" 
                  style={{ width: `${(h2h.wins / (h2h.wins + h2h.losses || 1)) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        )}

        <Link to="/history" className="card row-between" style={{ textDecoration: 'none', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <div className="row" style={{ gap: 12 }}>
            <div style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 12 }}>
              <History size={20} color="var(--gold)" />
            </div>
            <div className="font-bold">Full Match Timeline</div>
          </div>
          <div className="text-secondary">→</div>
        </Link>
      </div>
    </PageTransition>
  );
}
