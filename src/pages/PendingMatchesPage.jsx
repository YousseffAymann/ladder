import { useMemo } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Calendar, Clock, Clock3, Trash2 } from 'lucide-react';

export default function PendingMatchesPage() {
  const { user } = useAuth();
  const { pendingMatches, users, tournaments, deleteMatch } = useLeague();

  const userPendingMatches = useMemo(() => {
    if (!user) return [];
    return pendingMatches
      .filter(m => m.player1Id === user.id) // ONLY matches they submitted
      .sort((a, b) => b.date - a.date);
  }, [pendingMatches, user]);

  return (
    <PageTransition>
      <div className="page stack-xl">
        <div className="page-header stack-xs">
          <h1 className="page-title">Pending Requests</h1>
          <div className="page-subtitle">Awaiting opponent approval</div>
        </div>

        <div className="stack-md">
          {userPendingMatches.length === 0 ? (
             <div className="text-secondary text-center" style={{ padding: '32px 0' }}>No pending match requests.</div>
          ) : (
            userPendingMatches.map(m => {
              const opp = users[m.player2Id];
              const dateStr = m.date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              const timeStr = m.date?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

              return (
                <div key={m.id} className="card stack-sm" style={{ padding: 16, border: '1px solid var(--blue)', boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)' }}>
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
                     <div className="font-bold text-blue row" style={{ gap: 4, fontSize: '0.85rem' }}>
                       <Clock3 size={14}/> Pending
                     </div>
                   </div>

                   <div className="stack-xs" style={{ marginTop: 8 }}>
                     {m.sets.map((s, i) => {
                       const p1WonSet = s.p1Score > s.p2Score;
                       return (
                         <div key={i} className="row-between text-sm" style={{ padding: '4px 0', borderBottom: i < m.sets.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                           <span className={p1WonSet ? 'text-gold' : 'text-secondary'}>Set {i+1}</span>
                           <span className={`font-bold ${p1WonSet ? '' : 'text-secondary'}`}>{s.p1Score} - {s.p2Score}</span>
                         </div>
                       );
                     })}
                   </div>
                   
                   <div style={{ marginTop: 16 }}>
                     <button 
                       className="btn btn-secondary w-full row center" 
                       style={{ gap: 8, borderColor: 'var(--border-subtle)' }}
                       onClick={() => {
                         if(window.confirm('Are you sure you want to cancel this match request?')) {
                           deleteMatch(m.id);
                         }
                       }}
                     >
                       <Trash2 size={16} /> Cancel Request
                     </button>
                   </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageTransition>
  );
}
