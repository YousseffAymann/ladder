import { motion, AnimatePresence } from 'framer-motion';
import { getCelebrationMessage } from '../utils/celebrations.js';

export default function MatchModal({ isOpen, onClose, result }) {
  if (!isOpen || !result) return null;

  const isWin = result.p1Change >= 0;
  
  // Find highest rated set for messaging
  const bestSet = result.details.reduce((prev, current) => 
    (prev.change > current.change) ? prev : current, { change: -1, label: '' }
  );
  
  const msg = getCelebrationMessage(bestSet.label || 'MATCH LOGGED', Math.abs(result.p1Change));

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{ background: isWin ? 'var(--bg-elevated)' : 'var(--bg-card)' }}
        >
          <div className="stack-lg">
            <div className="stack-xs" style={{ alignItems: 'center' }}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={`text-3xl font-black ${isWin ? 'text-gold' : 'text-red'}`}
              >
                {msg.title}
              </motion.div>
              <div className="text-lg text-secondary font-medium">{msg.subtitle}</div>
            </div>

            <div className="stack-sm">
              {result.details.map((s, i) => (
                <div key={i} className="row-between text-base" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>Set {i+1}</span>
                  <span className="font-bold">{s.p1Score} - {s.p2Score}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={onClose} style={{ marginTop: 16 }}>
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
