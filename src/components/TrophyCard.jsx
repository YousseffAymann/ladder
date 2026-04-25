import { motion } from 'framer-motion';
import TrophyIcon from './TrophyIcon.jsx';

export default function TrophyCard({ trophy, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="trophy-card glow-gold"
      style={{ overflow: 'hidden' }}
    >
      <div className="animate-shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div className="stack-sm center" style={{ position: 'relative', zIndex: 1 }}>
        <TrophyIcon type={trophy.tournamentName} size={64} />
        <div className="stack-xs">
          <div className="font-bold text-base" style={{ color: 'var(--gold)' }}>{trophy.tournamentName}</div>
          <div className="text-xs text-tertiary">{new Date(trophy.dateWon).toLocaleDateString()}</div>
        </div>
        <div className="divider" style={{ width: '100%', margin: '4px 0' }} />
        <div className="text-xs text-secondary">Defeated {trophy.opponent}</div>
        <div className="text-sm font-bold">{trophy.finalScore}</div>
      </div>
    </motion.div>
  );
}
