import { Recommendation } from '../api/client';

interface Props { rec: Recommendation; index: number; }

export default function RestaurantCard({ rec, index }: Props) {
  const cuisines = rec.cuisine.split(',').map((c) => c.trim()).filter(Boolean);
  
  return (
    <div className="card" style={{ animation: `fadeUp 0.4s ease-out ${index * 0.1}s forwards`, opacity: 0, transform: 'translateY(20px)' }}>
      <div className="card-body">
        {rec.rank === 1 && (
          <div className="card-badge">#{rec.rank} RECOMMENDED</div>
        )}
        
        <div className="card-title">{rec.name}</div>
        <div className="card-rating">
          ★ {rec.rating} <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: 12, marginLeft: 4 }}>reviews</span>
        </div>
        
        <div className="card-tags">
          {cuisines.slice(0, 2).map((c) => (
            <span key={c} className="tag">{c}</span>
          ))}
        </div>
        
        <div className="card-metrics">
          <div>
            <div className="metric-label">Cost for Two:</div>
            <div className="metric-value">{rec.estimated_cost}</div>
          </div>
        </div>
        
        <div className="ai-expl">"{rec.explanation}"</div>
        
        <button className="btn-view">View Details</button>
      </div>
    </div>
  );
}
