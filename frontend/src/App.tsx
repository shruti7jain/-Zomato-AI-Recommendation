import { useState, useEffect, useCallback } from 'react';
import PreferenceForm from './components/PreferenceForm';
import ResultsPanel from './components/ResultsPanel';
import { fetchMetadata, fetchRecommendations, MetadataResponse, RecommendationResponse, UserPreferences } from './api/client';

export default function App() {
  const [loading, setLoading]   = useState(false);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [results, setResults]   = useState<RecommendationResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetchMetadata().catch(() => null).then(setMetadata);
  }, []);

  const handleSearch = useCallback(async (prefs: UserPreferences) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecommendations(prefs);
      setResults(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <nav className="top-nav">
        <div className="nav-logo">
          <div className="logo-icon">Z</div>
          ZOMATO AI RECOMMENDATION
        </div>
        <div className="nav-links">
          <span className="active">Dashboard</span>
          <span>Discover</span>
          <span>Reservations</span>
        </div>
        <div className="nav-icons">
          <span>🔔</span>
          <div className="avatar"></div>
        </div>
      </nav>

      <div className="dashboard-container">
        <PreferenceForm metadata={metadata} loading={loading} onSubmit={handleSearch} />
        <ResultsPanel data={results} loading={loading} error={error} />
      </div>
      
      <div className="fab" style={{ position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, background: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, boxShadow: '0 8px 24px rgba(139,92,246,0.5)', cursor: 'pointer', zIndex: 50, transition: 'transform 0.2s' }}>
        📍
      </div>
    </>
  );
}
