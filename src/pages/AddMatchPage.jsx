import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import SetScoreInput from '../components/SetScoreInput.jsx';
import MatchModal from '../components/MatchModal.jsx';
import ConfettiOverlay from '../components/ConfettiOverlay.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Plus, X } from 'lucide-react';

export default function AddMatchPage() {
  const { user } = useAuth();
  const { submitMatch, users, tournaments } = useLeague();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournament');
  const tournament = tournamentId ? tournaments.find(t => t.id === tournamentId) : null;
  
  // Exclude current user from opponents list
  const allOpponentIds = tournament 
    ? tournament.players.filter(id => id !== user?.id)
    : Object.keys(users).filter(id => id !== user?.id);
  const opponentIds = allOpponentIds;
  const [opponentId, setOpponentId] = useState(opponentIds[0] || '');
  
  useEffect(() => {
    if (!opponentId && opponentIds.length > 0) {
      setOpponentId(opponentIds[0]);
    }
  }, [opponentIds, opponentId]);

  const opponent = users[opponentId];

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().substring(0, 5);
  const [matchDate, setMatchDate] = useState(today);
  const [matchTime, setMatchTime] = useState(nowTime);
  const [sets, setSets] = useState([{ p1Score: 0, p2Score: 0 }]);
  const [modalResult, setModalResult] = useState(null);

  const updateSet = (index, p1Score, p2Score) => {
    const newSets = [...sets];
    newSets[index] = { p1Score, p2Score };
    setSets(newSets);
  };

  const addSet = () => setSets([...sets, { p1Score: 0, p2Score: 0 }]);
  const removeSet = (index) => setSets(sets.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const activeSets = sets.filter(s => s.p1Score > 0 || s.p2Score > 0);
    if (activeSets.length === 0 || !opponentId) return;
    
    const matchDateTime = new Date(`${matchDate}T${matchTime}`);
    if (matchDateTime > new Date()) {
      alert("You cannot log a match in the future.");
      return;
    }

    const { result } = await submitMatch(user.id, opponentId, activeSets, tournamentId, matchDateTime);
    setModalResult(result);
  };

  const handleModalClose = () => {
    setModalResult(null);
    navigate('/');
  };

  const hasDominantWin = modalResult?.details.some(d => d.label === 'DOMINANT WIN');

  return (
    <PageTransition>
      <div className="page stack-lg">
        <div className="page-header">
          <h1 className="page-title">{tournament ? `Record ${tournament.name} Match` : 'Record Match'}</h1>
          <div className="page-subtitle">{tournament ? 'Submit tournament sets' : 'Submit scores for today\'s session'}</div>
        </div>

        <div className="card stack-sm border-gold">
          <label className="input-label">Select Opponent</label>
          <select 
            className="input" 
            value={opponentId} 
            onChange={(e) => setOpponentId(e.target.value)}
          >
            <option value="" disabled>Select an opponent...</option>
            {opponentIds.map(id => (
              <option key={id} value={id}>{users[id]?.displayName} (@{users[id]?.username})</option>
            ))}
          </select>
          
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 12, marginTop: 16, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="stack-xs" style={{ flex: 1, minWidth: 130 }}>
                <label className="input-label" style={{ marginBottom: 2 }}>Match Date</label>
                <input 
                  type="date" 
                  className="input" 
                  value={matchDate} 
                  max={today}
                  onChange={(e) => setMatchDate(e.target.value)} 
                  style={{ padding: '8px 12px', fontSize: '0.875rem', height: '40px' }}
                />
              </div>
              <div className="stack-xs" style={{ flex: 1, minWidth: 130 }}>
                <label className="input-label" style={{ marginBottom: 2 }}>Match Time</label>
                <input 
                  type="time" 
                  className="input" 
                  value={matchTime} 
                  onChange={(e) => setMatchTime(e.target.value)} 
                  style={{ padding: '8px 12px', fontSize: '0.875rem', height: '40px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {opponentId && (
          <div className="verification-banner text-sm">
            Scores will be sent to {opponent?.initials} for verification before rankings update.
          </div>
        )}

        <div className="stack-xl">
          {sets.map((set, index) => (
            <div key={index} className="stack-sm">
              <div className="row-between text-sm font-bold text-tertiary">
                <span>SET {index + 1}</span>
                {sets.length > 1 && (
                  <button className="btn btn-ghost btn-icon" onClick={() => removeSet(index)} style={{ padding: 4, height: 'auto' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <SetScoreInput
                p1Score={set.p1Score}
                p2Score={set.p2Score}
                p1Name="You"
                p2Name={opponent?.displayName || 'Opponent'}
                onChange={(s1, s2) => updateSet(index, s1, s2)}
              />
            </div>
          ))}

          <button className="btn btn-secondary btn-full" onClick={addSet}>
            <Plus size={18} /> Add Another Set
          </button>

          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={!opponentId}>
              Submit Results
            </button>
          </div>
        </div>
      </div>

      <MatchModal isOpen={!!modalResult} onClose={handleModalClose} result={modalResult} />
      {hasDominantWin && <ConfettiOverlay trigger={!!modalResult} type="dominant" />}
    </PageTransition>
  );
}
