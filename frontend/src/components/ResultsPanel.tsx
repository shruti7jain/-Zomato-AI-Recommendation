import RestaurantCard from './RestaurantCard';
import SkeletonCards from './SkeletonCards';
import { RecommendationResponse } from '../api/client';

interface Props {
  data: RecommendationResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNewSearch: () => void;
}

export default function ResultsPanel({ data, loading, error, onRetry, onNewSearch }: Props) {
  return (
    <section style={{ width: '100%' }}>
      {/* Top bar: back + "Top Matches" heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={onNewSearch}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#929096', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e1e3e4')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#929096')}
        >
          ← New Search
        </button>
        <h2 style={{ fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 700, fontSize: 24, color: '#e1e3e4' }}>
          Top Matches
        </h2>
        <div /> {/* spacer */}
      </div>

      {/* AI Summary banner */}
      {data && (
        <div className="glass-card" style={{
          padding: '16px 24px', marginBottom: 24,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <p style={{ color: '#c8c5cc', fontStyle: 'italic', fontSize: 15, lineHeight: 1.6 }}>
            "{data.summary}"
          </p>
          {/* Active filter chips */}
          {data.meta.filters_applied.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.meta.filters_applied.map((f) => (
                <span key={f} className="chip">{f.replace(/['"=]/g, ' ').trim()}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── States ── */}
      {loading && <SkeletonCards />}

      {error && !loading && (
        <div className="glass-card" style={{
          padding: 32, textAlign: 'center',
          border: '1px solid rgba(255,100,80,0.3)',
          background: 'rgba(255,70,50,0.05)',
        }}>
          <p style={{ color: '#ffb4ab', fontWeight: 600, marginBottom: 8 }}>Something went wrong</p>
          <p style={{ color: '#929096', fontSize: 14, marginBottom: 20 }}>{error}</p>
          <button className="btn-accent" onClick={onRetry} style={{ padding: '12px 28px', fontSize: 13 }}>
            Try again →
          </button>
        </div>
      )}

      {data && !loading && data.recommendations.length === 0 && (
        <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <h3 style={{ fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 700, fontSize: 22, color: '#e1e3e4', marginBottom: 8 }}>
            No restaurants found
          </h3>
          <p style={{ color: '#929096', maxWidth: 400, margin: '0 auto 24px' }}>{data.summary}</p>
          {data.meta.suggestions && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              {data.meta.suggestions.map((s, i) => (
                <span key={i} className="chip">{s}</span>
              ))}
            </div>
          )}
          <button className="btn-accent" onClick={onNewSearch} style={{ padding: '12px 28px', fontSize: 13 }}>
            Search again →
          </button>
        </div>
      )}

      {data && !loading && data.recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {data.recommendations.map((rec, i) => (
              <RestaurantCard key={rec.rank} rec={rec} index={i} />
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#47464c', paddingTop: 8 }}>
            {data.meta.candidates_considered} restaurants considered
            {data.meta.llm_fallback ? ' · fallback ranking' : ' · AI-ranked'}
          </p>
        </div>
      )}
    </section>
  );
}
