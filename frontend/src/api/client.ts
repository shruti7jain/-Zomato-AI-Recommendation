// Typed API client
export interface UserPreferences {
  location: string;
  budget: 'low' | 'medium' | 'high';
  cuisine?: string;
  min_rating?: number;
  additional_preferences?: string;
  top_k?: number;
}
export interface Recommendation {
  rank: number;
  name: string;
  cuisine: string;
  rating: number;
  estimated_cost: string;
  explanation: string;
}
export interface RecommendationMeta {
  candidates_considered: number;
  filters_applied: string[];
  llm_fallback: boolean;
  suggestions?: string[];
}
export interface RecommendationResponse {
  summary: string;
  recommendations: Recommendation[];
  meta: RecommendationMeta;
}
export interface MetadataResponse {
  locations: string[];
  cuisines: string[];
  budgets: string[];
}

export async function fetchMetadata(): Promise<MetadataResponse> {
  const r = await fetch('/api/metadata');
  if (!r.ok) throw new Error('Metadata unavailable');
  return r.json();
}

export async function fetchRecommendations(p: UserPreferences): Promise<RecommendationResponse> {
  const r = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
  if (!r.ok) {
    const b = await r.json().catch(() => ({}));
    throw new Error(b?.detail?.message ?? b?.detail ?? `Error ${r.status}`);
  }
  return r.json();
}
