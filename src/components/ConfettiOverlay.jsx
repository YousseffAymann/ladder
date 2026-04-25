import { useEffect } from 'react';

export default function ConfettiOverlay({ trigger, type }) {
  useEffect(() => {
    if (!trigger) return;

    import('../utils/celebrations.js').then((m) => {
      if (type === 'dominant') m.celebrateDominantWin();
      else if (type === 'tournament') m.celebrateTournamentWin();
      else if (type === 'rank1') m.celebrateNewNumber1();
    });
  }, [trigger, type]);

  return null;
}
