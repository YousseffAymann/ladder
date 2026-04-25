import { motion } from 'framer-motion';
import TrophyIcon from './TrophyIcon.jsx';

export default function TournamentCard({ tournament, players, getPlayerDetails }) {
  const isCompleted = tournament.status === 'completed';
  const winner = isCompleted ? getPlayerDetails(tournament.winner) : null;

  return (
    <motion.div className={`card stack-md ${isCompleted ? 'card-gold' : ''}`}>
      <div className="row-between">
        <div className="row" style={{ gap: 12 }}>
          <TrophyIcon type={tournament.name} size={40} active={isCompleted} />
          <div className="stack-xs">
            <div className="font-bold text-lg" style={{ color: isCompleted ? 'var(--gold)' : 'var(--text-primary)' }}>
              {tournament.name}
            </div>
            <div className="text-xs text-tertiary">
              {isCompleted ? new Date(tournament.completedAt).toLocaleDateString() : 'Active Tournament'}
            </div>
          </div>
        </div>
        {isCompleted && (
          <div className="badge badge-gold">COMPLETED</div>
        )}
      </div>

      <div className="divider" />

      {isCompleted ? (
        <div className="row" style={{ gap: 12 }}>
          <div className="avatar avatar-gold">{winner?.initials}</div>
          <div>
            <div className="text-sm text-secondary">Champion</div>
            <div className="font-bold text-base">{winner?.displayName}</div>
          </div>
        </div>
      ) : (
        <div className="row" style={{ gap: 8 }}>
          {players.map(pid => {
            const p = getPlayerDetails(pid);
            return <div key={pid} className="avatar" title={p?.displayName}>{p?.initials}</div>;
          })}
        </div>
      )}
    </motion.div>
  );
}
