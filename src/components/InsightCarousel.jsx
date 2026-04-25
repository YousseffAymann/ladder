import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InsightCarousel({ insights }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [insights.length]);

  if (!insights.length) return null;

  return (
    <div className="stack-sm">
      <div className="insight-card" style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-medium"
            style={{ color: 'var(--gold)', width: '100%', textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: insights[current] }}
          />
        </AnimatePresence>
      </div>
      {insights.length > 1 && (
        <div className="carousel-dots">
          {insights.map((_, i) => (
            <div key={i} className={`carousel-dot ${i === current ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
}
