import { Recommendation } from '../api/client';
import StarRow from './ui/StarRow';

interface Props { rec: Recommendation; index: number; }

export default function RestaurantCard({ rec, index }: Props) {
  const cuisines = rec.cuisine.split(',').map((c) => c.trim()).filter(Boolean);

  return (
    <div
      className="glass-card animate-fade-up"
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animationDelay: `${index * 90}ms`,
        animationFillMode: 'forwards',
        opacity: 0,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.45)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
      <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* RECOMMENDED badge only for #1 */}
        {rec.rank === 1 && (
          <div
            style={{
              display: 'inline-block',
              alignSelf: 'flex-start',
              background: '#8b5cf6',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 6,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: '0.05em',
              boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
              marginBottom: 16
            }}
          >
            #{rec.rank} RECOMMENDED
          </div>
        )}
        {/* Name */}
        <h3 style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontWeight: 700, fontSize: 20,
          color: '#e1e3e4', marginBottom: 10,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {rec.name}
        </h3>

        {/* Cuisine chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {cuisines.map((c) => (
            <span key={c} className="chip">{c}</span>
          ))}
        </div>

        {/* Rating + Cost row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 14 }}>
          <StarRow value={rec.rating} readOnly size={18} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#7dcea0' }}>
            {rec.estimated_cost}
          </span>
        </div>

        {/* AI Explanation */}
        <blockquote style={{
          borderLeft: '2px solid #8b5cf6',
          paddingLeft: 12,
          margin: 0,
          color: '#929096',
          fontSize: 14,
          fontStyle: 'italic',
          lineHeight: 1.6,
          flex: 1,
        }}>
          {rec.explanation}
        </blockquote>
      </div>
    </div>
  );
}
