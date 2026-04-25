import PageTransition from '../components/PageTransition.jsx';
import TrophyCard from '../components/TrophyCard.jsx';
import GlowEffect from '../components/GlowEffect.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function TrophyCasePage() {
  const { user } = useAuth();
  const { trophies } = useLeague();
  
  const userTrophies = trophies.filter(t => t.userId === user?.id)
    .sort((a, b) => new Date(b.dateWon) - new Date(a.dateWon));

  return (
    <PageTransition>
      <div className="page stack-xl" style={{ position: 'relative' }}>
        <GlowEffect color="rgba(212,168,83,0.05)" />
        
        <div className="page-header center stack-sm text-center" style={{ position: 'relative', zIndex: 1, paddingBottom: 32 }}>
          <div className="text-sm text-gold font-bold tracking-widest uppercase">The Vault</div>
          <h1 className="text-3xl font-black">{userTrophies.length} Trophies</h1>
          <div className="text-secondary">Your legacy, immortalized.</div>
        </div>

        {userTrophies.length === 0 ? (
          <div className="center text-center text-secondary" style={{ height: 200, zIndex: 1 }}>
            <p>Your trophy cabinet is empty.<br/>Win tournaments to build your legacy.</p>
          </div>
        ) : (
          <div className="trophy-display">
            {userTrophies.map((trophy, i) => (
              <TrophyCard key={trophy.id} trophy={trophy} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
