import { useMemo } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Calendar, Clock, Trophy, TrendingUp, TrendingDown } from 'lucide-react';

export default function MatchHistoryPage() {
  const { user } = useAuth();
  const { matches, users, tournaments } = useLeague();

  const userMatches = useMemo(() => {
    if (!user) return [];
    return matches
      .filter(m => (m.player1Id === user.id || m.player2Id === user.id) && m.verified)
      .sort((a, b) => b.date - a.date);
  }, [matches, user]);

  return (
    <PageTransition>
      <div className="page stack-xl">
        <div className="page-header stack-xs">
          <h1 className="page-title">Match History</h1>
          <div className="page-subtitle">Your competitive timeline</div>
        </div>

        <div className="stack-md">
          {userMatches.length === 0 ? (
             <div className="text-secondary text-center" style={{ padding: '32px 0' }}>No verified matches yet.</div>
          ) : (
            userMatches.map(m => {
              const isP1 = m.player1Id === user.id;
              const oppId = isP1 ? m.player2Id : m.player1Id;
              const opp = users[oppId];
              
              const ratingChange = m.ratingChanges?.[user.id] || 0;
              const matchWon = m.sessionWinner === user.id;
              
              const dateStr = m.date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              const timeStr = m.date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <div key={m.id} className={`card stack-sm ${matchWon ? 'border-gold' : 'border-red'}`} style={{ padding: 16 }}>
                   <div className="row-between text-xs text-tertiary">
                     <div className="row" style={{ gap: 4 }}><Calendar size={12}/> {dateStr}</div>
                     <div className="row" style={{ gap: 4 }}><Clock size={12}/> {timeStr}</div>
                   </div>
                   
                   {m.tournamentId && (
                     <div className="text-xs text-gold font-bold mb-1">
                        🏆 {tournaments.find(t => t.id === m.tournamentId)?.name || 'Tournament'}
                     </div>
                   )}

                   <div className="row-between">
                     <div className="font-bold text-lg">vs {opp?.displayName || 'Opponent'}</div>
                     <div className={`font-black ${ratingChange > 0 ? 'text-gold' : 'text-red'} row`} style={{ gap: 4 }}>
                       {ratingChange > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                       {ratingChange > 0 ? '+' : ''}{ratingChange}
                     </div>
                   </div>

                   <div className="stack-xs" style={{ marginTop: 8 }}>
                     {m.sets.map((s, i) => {
                       const p1WonSet = s.p1Score > s.p2Score;
                       const userWonSet = isP1 ? p1WonSet : !p1WonSet;
                       const userScore = isP1 ? s.p1Score : s.p2Score;
                       const oppScore = isP1 ? s.p2Score : s.p1Score;
                       return (
                         <div key={i} className="row-between text-sm" style={{ padding: '4px 0', borderBottom: i < m.sets.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                           <span className={userWonSet ? 'text-gold' : 'text-secondary'}>Set {i+1}</span>
                           <span className={`font-bold ${userWonSet ? '' : 'text-secondary'}`}>{userScore} - {oppScore}</span>
                         </div>
                       );
                     })}
                   </div>
                   {m.sessionWinner === user.id && m.sets.length > 1 && (
                     <div className="text-xs text-gold" style={{ marginTop: 8 }}>+10 Session Bonus</div>
                   )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}
