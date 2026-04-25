export default function SetScoreInput({ p1Score, p2Score, p1Name, p2Name, onChange }) {
  const scores = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="card stack-md">
      <div className="stack-sm">
        <div className="text-sm font-medium text-secondary">{p1Name}</div>
        <div className="score-grid">
          {scores.map(s => (
            <button
              key={`p1-${s}`}
              className={`score-btn ${p1Score === s ? 'active' : ''}`}
              onClick={() => onChange(s, p2Score)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="divider" style={{ margin: '8px 0' }} />
      <div className="stack-sm">
        <div className="text-sm font-medium text-secondary">{p2Name}</div>
        <div className="score-grid">
          {scores.map(s => (
            <button
              key={`p2-${s}`}
              className={`score-btn ${p2Score === s ? 'active' : ''}`}
              onClick={() => onChange(p1Score, s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
