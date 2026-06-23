/* Skeleton loader — 3 cards, shimmer from 8%→15% white per DESIGN.md */
export default function SkeletonCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="glass-card" style={{ padding: 24, display: 'flex', gap: 20 }}>
          {/* Rank circle */}
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Name */}
            <div className="skeleton" style={{ height: 22, width: '55%' }} />
            {/* Cuisine pills row */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[80, 60, 90].map((w, j) => (
                <div key={j} className="skeleton" style={{ height: 22, width: w, borderRadius: 9999 }} />
              ))}
            </div>
            {/* Rating + cost */}
            <div style={{ display: 'flex', gap: 24 }}>
              <div className="skeleton" style={{ height: 16, width: 110 }} />
              <div className="skeleton" style={{ height: 16, width: 90 }} />
            </div>
            {/* Explanation lines */}
            <div className="skeleton" style={{ height: 14, width: '100%' }} />
            <div className="skeleton" style={{ height: 14, width: '75%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
