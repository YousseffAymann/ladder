export default function TrophyIcon({ type, size = 48, active = true }) {
  const isConcorand = type && type.toLowerCase().includes('concorand');
  const color = active ? 'url(#gold)' : 'var(--border-medium)';
  
  if (isConcorand) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 30 C 30 10, 70 10, 70 30 C 70 60, 50 80, 50 80 C 50 80, 30 60, 30 30" fill="none" stroke={color} strokeWidth="6" />
        <path d="M40 80 L 60 80" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <circle cx="50" cy="40" r="8" fill={active ? 'var(--gold)' : 'transparent'} stroke={color} strokeWidth="4" />
      </svg>
    );
  }

  // Gardenia default cup
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 25 L 75 25" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <path d="M30 25 L 35 60 C 37 75, 63 75, 65 60 L 70 25" fill="none" stroke={color} strokeWidth="6" />
      <path d="M50 72 L 50 85" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <path d="M35 85 L 65 85" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <path d="M20 35 C 10 35, 10 55, 33 55" fill="none" stroke={color} strokeWidth="4" />
      <path d="M80 35 C 90 35, 90 55, 67 55" fill="none" stroke={color} strokeWidth="4" />
    </svg>
  );
}
