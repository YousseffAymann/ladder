import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition.jsx';
import TournamentCard from '../components/TournamentCard.jsx';
import ConfettiOverlay from '../components/ConfettiOverlay.jsx';
import { useLeague } from '../contexts/LeagueContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function TournamentsPage() {
  const { user } = useAuth();
  const { tournaments, createTournament, users } = useLeague();
  const [showCreate, setShowCreate] = useState(false);
  const [newTName, setNewTName] = useState('Gardenia Open');
  const [newTFormat, setNewTFormat] = useState('bo3');
  const navigate = useNavigate();

  const activeTournaments = tournaments.filter(t => t.status === 'active');
  const pastTournaments = tournaments.filter(t => t.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  const handleCreate = () => {
    // Adding all users to the tournament for now
    createTournament(newTName, newTFormat, Object.keys(users));
    setShowCreate(false);
  };

  const handleRecordMatch = (tId) => {
    navigate(`/match?tournament=${tId}`);
  };

  const getPlayer = (id) => users[id];

  return (
    <PageTransition>
      <div className="page stack-xl">
        <div className="page-header row-between">
          <div>
            <h1 className="page-title">Tournaments</h1>
            <div className="page-subtitle">Legacy & Glory</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : 'New Cup'}
          </button>
        </div>

        {showCreate && (
          <div className="card stack-md border-gold">
            <h3 className="font-bold">Create Tournament</h3>
            <div className="stack-sm">
              <label className="input-label">Tournament Name</label>
              <select className="input" value={newTName} onChange={e => setNewTName(e.target.value)}>
                <option value="Gardenia Open">Gardenia Open</option>
                <option value="Concorand Garros">Concorand Garros</option>
              </select>
            </div>
            <div className="stack-sm">
              <label className="input-label">Format</label>
              <select className="input" value={newTFormat} onChange={e => setNewTFormat(e.target.value)}>
                <option value="bo3">Best of 3</option>
                <option value="bo5">Best of 5</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleCreate}>Create</button>
          </div>
        )}

        {activeTournaments.length > 0 && (
          <div className="stack-md">
            <h2 className="text-lg font-bold">Active</h2>
            {activeTournaments.map(t => (
              <div key={t.id} style={{ position: 'relative' }}>
                <TournamentCard tournament={t} players={t.players} getPlayerDetails={getPlayer} />
                {t.players.includes(user?.id) && (
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ position: 'absolute', top: 16, right: 16 }}
                    onClick={() => handleRecordMatch(t.id)}
                  >
                    Record Match
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="stack-md">
          <h2 className="text-lg font-bold">History</h2>
          {pastTournaments.length === 0 ? (
            <div className="text-secondary text-center" style={{ padding: '32px 0' }}>No past tournaments</div>
          ) : (
            pastTournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} players={t.players} getPlayerDetails={getPlayer} />
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
