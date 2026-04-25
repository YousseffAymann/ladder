import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function StatBar({ label, value, max, format = (v) => v }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div ref={ref} className="stack-xs">
      <div className="row-between text-sm">
        <span className="text-secondary">{label}</span>
        <span className="font-bold">{format(value)}</span>
      </div>
      <div className="stat-bar-track">
        <motion.div
          className="stat-bar-fill"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}
