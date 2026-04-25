import { motion } from 'framer-motion';

export default function RatingBadge({ change }) {
  if (change === 0 || !change) return null;
  const isPositive = change > 0;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`badge ${isPositive ? 'badge-green' : 'badge-red'}`}
    >
      {isPositive ? '+' : ''}{change}
    </motion.div>
  );
}
