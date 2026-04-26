import PageTransition from '../components/PageTransition.jsx';
import StatBar from '../components/StatBar.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Activity, Flame, Target, Trophy } from 'lucide-react';

export default function StatsPage() {
  const { user } = useAuth();
  const { stats, users } = useLeague();
  
  const userStats = stats[user?.id];
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

  const totalSets = (userStats.totalSetsWon || 0) + (userStats.totalSetsLost || 0);

  return (
    <PageTransition>
      <div className="page stack-xl">
        <div className="page-header stack-xs">
          <h1 className="page-title">Statistics</h1>
          <div className="page-subtitle">Your analytical performance</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card stack-sm center text-center">
            <Activity size={24} color="var(--gold)" />
            <div className="text-xs text-secondary">Win Rate</div>
            <div className="text-2xl font-black">{(userStats.winRate || 0).toFixed(1)}%</div>
          </div>
          <div className="card stack-sm center text-center">
            <Flame size={24} color="var(--red)" />
            <div className="text-xs text-secondary">Best Streak</div>
            <div className="text-2xl font-black">{userStats.bestStreak || 0}</div>
          </div>
        </div>

        <div className="card stack-lg">
          <div className="row" style={{ gap: 8 }}>
            <Target size={20} color="var(--blue)" />
            <span className="font-bold">Set Performance</span>
          </div>
          <div className="stack-md">
            <StatBar label="Sets Won" value={userStats.totalSetsWon || 0} max={totalSets || 1} />
            <StatBar label="Sets Lost" value={userStats.totalSetsLost || 0} max={totalSets || 1} />
          </div>
        </div>

        {totalSets > 0 && (
          <div className="card stack-lg">
            <div className="row" style={{ gap: 8 }}>
              <Trophy size={20} color="var(--gold)" />
              <span className="font-bold">Head to Head</span>
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
      </div>
    </PageTransition>
  );
}
