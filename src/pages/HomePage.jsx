import { useMemo, useState } from 'react';
import PageTransition from '../components/PageTransition.jsx';
import RankCard from '../components/RankCard.jsx';
import InsightCarousel from '../components/InsightCarousel.jsx';
import GlowEffect from '../components/GlowEffect.jsx';
import ConfettiOverlay from '../components/ConfettiOverlay.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { generateInsights } from '../utils/insights.js';

export default function HomePage() {
  const { user } = useAuth();
  const { getRankings, stats, notifications, pendingMatches, verifyMatch, users } = useLeague();
  
  const rankings = getRankings();
  const userStats = stats[user?.id];
  
  const opponentId = rankings.find(r => r.id !== user?.id)?.id;
  const opponent = opponentId ? rankings.find(r => r.id === opponentId) : null;
  
  const insights = useMemo(() => {
    return generateInsights(userStats, user?.displayName, opponent?.displayName);
  }, [userStats, user, opponent]);

  const pendingVerifications = notifications.filter(n => n.userId === user?.id && n.status === 'pending');

  return (
    <PageTransition>
      <div className="page stack-xl">
        {pendingVerifications.length > 0 && (
          <div className="stack-sm">
            <h2 className="text-lg font-bold text-blue">Action Required</h2>
            {pendingVerifications.map(notif => {
              const match = pendingMatches.find(m => m.id === notif.matchId);
              if (!match) return null;
              
              return (
                <div key={notif.id} className="verification-banner stack-md" style={{ display: 'block' }}>
                  <div className="text-sm">{notif.message}</div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => verifyMatch(match.id, true)}>Confirm</button>
                    <button className="btn btn-danger btn-sm" onClick={() => verifyMatch(match.id, false)}>Dispute</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          <GlowEffect color="rgba(212,168,83,0.08)" />
          <InsightCarousel insights={insights} />
        </div>

        <div className="stack-md">
          <div className="row-between">
            <h2 className="text-xl font-bold">Global Rankings</h2>
            <div className="text-sm text-tertiary">Live</div>
          </div>
          
          <div className="stack-sm">
            {rankings.map((player, index) => (
              <RankCard 
                key={player.id} 
                player={player} 
                index={index} 
                isCurrentUser={player.id === user?.id} 
              />
            ))}
          </div>
        </div>
      </div>
      {user?.rank === 1 && <ConfettiOverlay trigger={true} type="rank1" />}
    </PageTransition>
  );
}
