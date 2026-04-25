// Dynamic insights generator
export function generateInsights(stats, playerName, opponentName) {
  const insights = [];
  if (!stats) return ['Welcome to LADDER'];

  if (stats.winStreak >= 3) insights.push(`🔥 ${stats.winStreak}-set win streak — unstoppable`);
  else if (stats.winStreak >= 2) insights.push(`🔥 ${stats.winStreak} wins in a row — keep pushing`);

  if (stats.winRate >= 70) insights.push(`👑 ${stats.winRate.toFixed(0)}% win rate — dominant force`);
  else if (stats.winRate >= 50) insights.push(`📈 ${stats.winRate.toFixed(0)}% win rate — climbing`);
  else insights.push(`💪 ${stats.winRate.toFixed(0)}% win rate — time to strike back`);

  if (stats.totalSetsWon >= 10) insights.push(`⚡ ${stats.totalSetsWon} sets won — building a legacy`);

  const h2h = stats.headToHead && Object.values(stats.headToHead)[0];
  if (h2h) {
    const total = h2h.wins + h2h.losses;
    if (h2h.wins > h2h.losses) insights.push(`🏆 Leading H2H ${h2h.wins}-${h2h.losses} vs ${opponentName || 'rival'}`);
    else if (h2h.losses > h2h.wins) insights.push(`⚔️ Trailing H2H ${h2h.wins}-${h2h.losses} — revenge time`);
    else if (total > 0) insights.push(`⚖️ H2H tied ${h2h.wins}-${h2h.losses} — who breaks through?`);
  }

  if (stats.bestStreak >= 3) insights.push(`🌟 Best streak: ${stats.bestStreak} wins — legendary run`);
  if (stats.tournamentWins >= 1) insights.push(`🏆 ${stats.tournamentWins} tournament${stats.tournamentWins > 1 ? 's' : ''} won — champion mentality`);
  if (stats.incompleteSets?.leading > 0) insights.push(`📊 Leading in ${stats.incompleteSets.leading} incomplete set${stats.incompleteSets.leading > 1 ? 's' : ''} — finish strong`);

  return insights.length > 0 ? insights : [`Welcome, ${playerName}. Start competing.`];
}
