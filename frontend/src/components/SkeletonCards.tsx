export default function SkeletonCards() {
  return (
    <div className="results-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card" style={{ height: 380 }}>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skel-box" style={{ height: 24, width: '60%' }}></div>
            <div className="skel-box" style={{ height: 16, width: '40%' }}></div>
            <div className="skel-box" style={{ height: 40, width: '100%' }}></div>
            <div className="skel-box" style={{ height: 80, width: '100%' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
