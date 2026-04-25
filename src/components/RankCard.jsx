import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber.jsx';
import RatingBadge from './RatingBadge.jsx';

export default function RankCard({ player, isCurrentUser, index }) {
  const isRank1 = player.rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`card row-between ${isRank1 ? 'card-gold glow-gold' : ''} ${isCurrentUser ? 'rank-current' : ''}`}
      style={{ padding: '16px 20px', position: 'relative', overflow: 'hidden' }}
    >
      {isRank1 && <div className="animate-shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />}
      
      <div className="row" style={{ gap: 16, zIndex: 1 }}>
        <div className={`rank-number ${isRank1 ? 'rank-1' : ''}`}>{player.rank}</div>
        <div className={`avatar ${isRank1 ? 'avatar-gold' : ''}`}>{player.initials}</div>
        <div className="stack-xs">
          <div className="font-bold text-base" style={{ color: isRank1 ? 'var(--gold)' : 'var(--text-primary)' }}>
            {player.displayName} {isCurrentUser && '(You)'}
          </div>
          <div className="text-sm text-tertiary">@{player.username || player.id}</div>
        </div>
      </div>
      
      <div className="stack-xs" style={{ alignItems: 'flex-end', zIndex: 1 }}>
        <div className="font-black text-xl" style={{ color: isRank1 ? 'var(--gold)' : 'var(--text-primary)' }}>
          <AnimatedNumber value={player.rating} />
        </div>
        <RatingBadge change={player.lastChange} />
      </div>
    </motion.div>
  );
}
