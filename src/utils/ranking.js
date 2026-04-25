// Ranking calculation engine
const SCORE_RATINGS = [
  { check: (w, l) => (w === 6 && l <= 1), points: 25, label: 'DOMINANT WIN' },
  { check: (w, l) => (w === 6 && (l === 2 || l === 3)), points: 18, label: 'STRONG WIN' },
  { check: (w, l) => (w === 6 && l === 4), points: 12, label: 'SOLID WIN' },
  { check: (w, l) => (w === 7 && (l === 5 || l === 6)), points: 8, label: 'TIGHT WIN' },
];

const SESSION_BONUS = 10;
const TOURNAMENT_BONUS = 50;

export function getSetRatingChange(winnerScore, loserScore) {
  for (const sr of SCORE_RATINGS) {
    if (sr.check(winnerScore, loserScore)) return { points: sr.points, label: sr.label };
  }
  return { points: 0, label: 'INCOMPLETE' };
}

export function calculateMatchRatings(sets) {
  let p1Total = 0, p2Total = 0, p1SetsWon = 0, p2SetsWon = 0;
  const details = [];

  for (const set of sets) {
    const { p1Score, p2Score, completed } = set;
    if (!completed) {
      details.push({ ...set, change: 0, label: 'INCOMPLETE', momentum: true });
      continue;
    }
    const p1Won = p1Score > p2Score;
    const { points, label } = getSetRatingChange(
      Math.max(p1Score, p2Score), Math.min(p1Score, p2Score)
    );
    if (p1Won) { p1Total += points; p2Total -= points; p1SetsWon++; }
    else { p2Total += points; p1Total -= points; p2SetsWon++; }
    details.push({ ...set, change: points, label, winner: p1Won ? 'p1' : 'p2' });
  }

  // Session bonus
  if (p1SetsWon > p2SetsWon) { p1Total += SESSION_BONUS; p2Total -= SESSION_BONUS; }
  else if (p2SetsWon > p1SetsWon) { p2Total += SESSION_BONUS; p1Total -= SESSION_BONUS; }

  return {
    p1Change: p1Total, p2Change: p2Total,
    p1SetsWon, p2SetsWon, details,
    sessionWinner: p1SetsWon > p2SetsWon ? 'p1' : p2SetsWon > p1SetsWon ? 'p2' : null,
  };
}

export function isDominantWin(winnerScore, loserScore) {
  return winnerScore === 6 && loserScore <= 1;
}

export function getTournamentBonus() { return TOURNAMENT_BONUS; }
