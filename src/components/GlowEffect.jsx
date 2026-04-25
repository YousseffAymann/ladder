export default function GlowEffect({ color = 'rgba(212,168,83,0.15)' }) {
  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
}
