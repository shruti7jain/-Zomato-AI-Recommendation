import { useState, useEffect, useCallback } from 'react';
import PreferenceForm from './components/PreferenceForm';
import ResultsPanel from './components/ResultsPanel';
import SkeletonCards from './components/SkeletonCards';
import { fetchMetadata, fetchRecommendations, MetadataResponse, RecommendationResponse, UserPreferences } from './api/client';

type State = 'idle' | 'loading' | 'done';

export default function App() {
  const [state, setState]       = useState<State>('idle');
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [results, setResults]   = useState<RecommendationResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [lastPrefs, setLastPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    fetchMetadata().catch(() => null).then(setMetadata);
  }, []);

  const handleSearch = useCallback(async (prefs: UserPreferences) => {
    setLastPrefs(prefs);
    setState('loading');
    setError(null);
    try {
      const data = await fetchRecommendations(prefs);
      setResults(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setResults(null);
    } finally {
      setState('done');
    }
  }, []);

  const handleRetry     = () => { if (lastPrefs) handleSearch(lastPrefs); };
  const handleNewSearch = () => { setState('idle'); setResults(null); setError(null); };

  /* ── Shared nav ── */
  const Nav = (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(12,15,16,0.85)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div className="container-desktop" style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <span style={{
          fontFamily: '"Plus Jakarta Sans",sans-serif',
          fontWeight: 800, fontSize: 18,
          background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em',
        }}>
          ZOMATA AI
        </span>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['AI Insights', 'Search', 'Restaurants'].map((l) => (
            <span key={l} style={{
              fontSize: 14, fontWeight: l === 'Search' ? 600 : 400,
              color: l === 'Search' ? '#e1e3e4' : '#929096',
              borderBottom: l === 'Search' ? '1px solid #8b5cf6' : 'none',
              paddingBottom: l === 'Search' ? 2 : 0,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}>
              {l}
            </span>
          ))}
        </div>

        <span style={{ fontSize: 13, color: '#47464c', letterSpacing: '0.02em' }}>
          AI-Powered Restaurant Finder
        </span>
      </div>
    </nav>
  );

  /* ── IDLE: hero split layout ── */
  if (state === 'idle') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {Nav}

        {/* Hero: radial glow on right side behind form */}
        <main style={{
          flex: 1,
          background: 'radial-gradient(ellipse at 72% 50%, rgba(139,92,246,0.09) 0%, transparent 62%)',
          display: 'flex', alignItems: 'center',
        }}>
          <div className="container-desktop" style={{
            display: 'flex', alignItems: 'center',
            gap: 64, paddingBlock: 64,
          }}>
            {/* Left: headline */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontFamily: '"Plus Jakarta Sans",sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(2.8rem, 4.5vw, 4rem)',
                lineHeight: 1.08,
                color: '#e1e3e4',
                letterSpacing: '-0.02em',
                marginBottom: 24,
              }}>
                Find your perfect<br />
                table,{' '}
                <span style={{
                  background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  powered by AI
                </span>
              </h1>
              <p style={{ fontSize: 18, color: '#929096', lineHeight: 1.65, maxWidth: 440, marginBottom: 48 }}>
                Experience curated, intelligent dining recommendations.
                Tell us what you're craving, and our AI concierge will handle the rest.
              </p>
              {/* Floating food icons */}
              <div style={{ display: 'flex', gap: 16 }}>
                {['🍕', '🍜', '🍖'].map((icon, i) => (
                  <div
                    key={i}
                    style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                      animation: `float 3.5s ease-in-out ${i * 0.6}s infinite`,
                    }}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <PreferenceForm metadata={metadata} loading={false} onSubmit={handleSearch} />
          </div>
        </main>

        {Footer}
      </div>
    );
  }

  /* ── LOADING / DONE: results layout ── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {Nav}
      <main style={{ flex: 1 }}>
        <div className="container-desktop" style={{ paddingBlock: 40 }}>
          {state === 'loading'
            ? (
              <>
                {/* Summary skeleton */}
                <div className="skeleton" style={{ height: 80, borderRadius: 16, marginBottom: 24 }} />
                <SkeletonCards />
              </>
            )
            : (
              <ResultsPanel
                data={results}
                loading={false}
                error={error}
                onRetry={handleRetry}
                onNewSearch={handleNewSearch}
              />
            )
          }
        </div>
      </main>
      {Footer}
    </div>
  );
}

const Footer = (
  <footer style={{
    borderTop: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(12,15,16,0.6)',
  }}>
    <div className="container-desktop" style={{
      paddingBlock: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <span style={{
        fontFamily: '"Plus Jakarta Sans",sans-serif', fontWeight: 800, fontSize: 15,
        background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        ZOMATA AI
      </span>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Privacy', 'Terms', 'Restaurants', 'AI Insights'].map((l) => (
          <span key={l} style={{ fontSize: 13, color: '#47464c', cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#929096')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#47464c')}>
            {l}
          </span>
        ))}
      </div>
      <span style={{ fontSize: 12, color: '#47464c' }}>
        © 2024 ZOMATA AI. Editorial AI-Powered Discovery.
      </span>
    </div>
  </footer>
);
