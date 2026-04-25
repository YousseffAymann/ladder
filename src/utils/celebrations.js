import confetti from 'canvas-confetti';

const GOLD = ['#d4a853', '#b8902e', '#f0d78c', '#8B7355'];

export function celebrateDominantWin() {
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: GOLD });
}

export function celebrateTournamentWin() {
  const end = Date.now() + 2000;
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: GOLD });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: GOLD });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function celebrateNewNumber1() {
  confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 }, colors: GOLD, gravity: 0.6 });
  setTimeout(() => {
    confetti({ particleCount: 50, spread: 120, origin: { y: 0.4 }, colors: GOLD });
  }, 400);
}

export function getCelebrationMessage(label, change) {
  if (label === 'DOMINANT WIN') return { title: 'DOMINANT', subtitle: `+${change} CRUSHING VICTORY` };
  if (label === 'STRONG WIN') return { title: 'STRONG WIN', subtitle: `+${change} IMPRESSIVE` };
  if (label === 'SOLID WIN') return { title: 'SOLID WIN', subtitle: `+${change} WELL PLAYED` };
  if (label === 'TIGHT WIN') return { title: 'TIGHT WIN', subtitle: `+${change} BATTLE WON` };
  return { title: 'MATCH LOGGED', subtitle: 'Session recorded' };
}
