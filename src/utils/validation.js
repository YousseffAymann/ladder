// Tennis score validation
const VALID_COMPLETED = [[6,0],[6,1],[6,2],[6,3],[6,4],[7,5],[7,6]];

export function isValidCompletedSet(s1, s2) {
  const h = Math.max(s1, s2), l = Math.min(s1, s2);
  return VALID_COMPLETED.some(([a, b]) => a === h && b === l);
}

export function isIncompleteSet(s1, s2) {
  if (isValidCompletedSet(s1, s2)) return false;
  return s1 >= 0 && s2 >= 0 && s1 <= 7 && s2 <= 7 && (s1 !== s2);
}

export function getSetStatus(s1, s2) {
  if (isValidCompletedSet(s1, s2)) return 'completed';
  if (s1 === s2) return 'tied';
  return 'incomplete';
}

export function isSessionLocked(date) {
  const d = new Date(date);
  const now = new Date();
  const endOfDay = new Date(d);
  endOfDay.setHours(23, 59, 59, 999);
  return now > endOfDay;
}

export function isSameDay(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
