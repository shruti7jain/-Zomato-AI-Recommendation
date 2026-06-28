import { useState, useEffect, useCallback } from 'react';
import PreferenceForm from './components/PreferenceForm';
import { fetchMetadata, fetchRecommendations, MetadataResponse, RecommendationResponse, UserPreferences } from './api/client';
import { TopNavBar } from './components/TopNavBar';
import { AISummaryBanner } from './components/AISummaryBanner';
import { RestaurantCard } from './components/RestaurantCard';

// Default images since backend doesn't provide them yet
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
];

// ── Small stat chip for the hero section ──────────────────────────────────────
function HeroStatChip({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors">
      <span
        className="material-symbols-outlined text-secondary text-[15px]"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className="font-label-md text-label-md font-bold text-on-surface">{value}</span>
      <span className="font-label-sm text-[11px] text-on-surface-variant">{label}</span>
    </div>
  );
}

export default function App() {
  const [loading, setLoading]   = useState(false);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [results, setResults]   = useState<RecommendationResponse | null>(null);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetchMetadata().then(setMetadata).catch(() => {
      setError('Cannot connect to backend. Please ensure the backend server is running on port 8000.');
    });
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
      <TopNavBar />

      {!results ? (
        <main className="flex-grow pt-[120px] pb-stack-lg px-gutter max-w-[1200px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-stack-lg min-h-[calc(100vh-80px)]">
          {/* Left Side: Hero Text */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-stack-md z-10 relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
            <h1 className="font-display-lg text-display-lg text-on-surface">
              Discover Your <br />
              <span className="gradient-text">Next Culinary Obsession</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Unleash our AI concierge to find the perfect dining experience tailored to your exact mood, taste, and budget.
            </p>

            {/* ── Live database stats strip ──────────────────────────── */}
            {metadata && (
              <div className="flex flex-wrap gap-2 pt-2">
                {metadata.restaurant_count != null && (
                  <HeroStatChip
                    icon="store"
                    value={metadata.restaurant_count.toLocaleString() + '+'}
                    label="restaurants"
                  />
                )}
                {metadata.avg_rating != null && (
                  <HeroStatChip
                    icon="star"
                    value={metadata.avg_rating.toFixed(1)}
                    label="avg rating"
                  />
                )}
                {metadata.total_locations != null && (
                  <HeroStatChip
                    icon="location_on"
                    value={String(metadata.total_locations)}
                    label="cities"
                  />
                )}
                {metadata.cuisines.length > 0 && (
                  <HeroStatChip
                    icon="restaurant_menu"
                    value={String(metadata.cuisines.length)}
                    label="cuisines"
                  />
                )}
              </div>
            )}

            {error && <div className="text-error mt-4">{error}</div>}
          </div>

          {/* Right Side: PreferenceForm GlassCard */}
          <div className="w-full md:w-1/2 z-10 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
            <PreferenceForm metadata={metadata} loading={loading} onSubmit={handleSearch} />
          </div>
        </main>
      ) : (
        <main className="max-w-[1200px] mx-auto px-gutter pt-[120px] pb-stack-lg flex flex-col gap-stack-lg min-h-screen">
          <button
            onClick={() => setResults(null)}
            className="self-start text-secondary hover:text-primary transition-colors flex items-center gap-1 font-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Search
          </button>

          <div className="flex flex-col gap-stack-md">
            {results.recommendations.length === 0 ? (
              <div className="glass-card p-8 rounded-xl text-center">
                <h2 className="text-headline-md font-bold text-on-surface mb-4">No Matches Found</h2>
                <p className="text-on-surface-variant font-body-lg mb-6">{results.summary}</p>
                <div className="flex flex-col gap-2 text-left bg-white/5 p-4 rounded-lg inline-block">
                  <strong className="text-secondary">Suggestions:</strong>
                  <ul className="list-disc pl-5 text-on-surface-variant font-body-md">
                    {results.meta.suggestions?.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <AISummaryBanner results={results} />
                <div className="flex flex-col gap-stack-md">
                  {results.recommendations.map((rec, idx) => (
                    <RestaurantCard
                      key={rec.name}
                      rank={rec.rank || (idx + 1)}
                      name={rec.name}
                      rating={rec.rating.toString()}
                      price={rec.estimated_cost}
                      tags={[rec.cuisine]}
                      quote={rec.explanation}
                      imageUrl={FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length]}
                      imageAlt={rec.name}
                      matchPercentage={rec.match_percentage}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      )}
    </>
  );
}
