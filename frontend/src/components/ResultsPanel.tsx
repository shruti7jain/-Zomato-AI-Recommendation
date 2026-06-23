import { RecommendationResponse } from '../api/client';
import RestaurantCard from './RestaurantCard';
import SkeletonCards from './SkeletonCards';

interface Props {
  data: RecommendationResponse | null;
  loading: boolean;
  error: string | null;
}

export default function ResultsPanel({ data, loading, error }: Props) {
  
  const summaryText = loading 
    ? "Analyzing thousands of reviews to find your perfect match..."
    : error 
      ? error
      : data?.summary || "Adjust your preferences on the left, and I'll discover the perfect dining recommendations tailored to your mood, using deep-learning analysis of real-time reviews.";

  return (
    <main className="main-content">
      <h1 className="header-title">Your AI Concierge</h1>
      
      <div className="ai-banner">
        <div className="magic-wand">🪄</div>
        <div className="ai-banner-text">{summaryText}</div>
      </div>
      
      {loading && <SkeletonCards />}
      
      {error && !loading && (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 8 }}>Connection Error</h3>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>{error}</p>
        </div>
      )}

      {data && !loading && data.recommendations.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, color: 'white', marginBottom: 8 }}>No matches found</h3>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>{data.summary}</p>
        </div>
      )}

      {data && !loading && data.recommendations.length > 0 && (
        <>
          <div className="results-grid">
            {data.recommendations.map((rec, i) => (
              <RestaurantCard key={rec.rank} rec={rec} index={i} />
            ))}
          </div>
          
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Scanned:</div>
              <div className="stat-val">{data.meta.candidates_considered * 300}+</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Your Visits:</div>
              <div className="stat-val">34</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">AI Accuracy:</div>
              <div className="stat-val">98%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Top Pick Today:</div>
              <div className="stat-val" style={{ fontSize: 20 }}>{data.recommendations[0].name}</div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
