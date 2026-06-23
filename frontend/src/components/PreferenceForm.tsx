import { useState } from 'react';
import { MetadataResponse, UserPreferences } from '../api/client';

interface Props {
  metadata: MetadataResponse | null;
  loading: boolean;
  onSubmit: (p: UserPreferences) => void;
}

const BUDGET_OPTIONS = [
  { label: 'Low  — up to ₹500',      value: 'low'    as const },
  { label: 'Medium  — ₹500–₹1,500',  value: 'medium' as const },
  { label: 'High  — above ₹1,500',   value: 'high'   as const },
];

export default function PreferenceForm({ metadata, loading, onSubmit }: Props) {
  const [location, setLocation]   = useState('');
  const [budget, setBudget]       = useState<'low'|'medium'|'high'>('medium');
  const [cuisine, setCuisine]     = useState('');
  const [minRating, setMinRating] = useState(0);
  const [addlPrefs, setAddlPrefs] = useState('');
  const [locErr, setLocErr]       = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) { setLocErr(true); return; }
    setLocErr(false);
    onSubmit({
      location, budget,
      cuisine: cuisine || undefined,
      min_rating: minRating > 0 ? minRating : undefined,
      additional_preferences: addlPrefs || undefined,
      top_k: 3,
    });
  };

  /* glass-ai: stronger blur + gradient border per DESIGN.md */
  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: '36px 32px',
    width: 420,
    flexShrink: 0,
  };

  return (
    <form onSubmit={handleSubmit} style={cardStyle} noValidate>
      <h2 style={{
        fontFamily: '"Plus Jakarta Sans",sans-serif',
        fontWeight: 700, fontSize: 24,
        color: '#e1e3e4', marginBottom: 28,
      }}>
        Refine Search
      </h2>

      {/* LOCATION */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Location</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📍</span>
          <select
            className="input-field"
            style={{ paddingLeft: 38, borderColor: locErr ? '#8b5cf6' : undefined }}
            value={location}
            onChange={(e) => { setLocation(e.target.value); setLocErr(false); }}
            disabled={loading}
          >
            <option value="">Current Location</option>
            {(metadata?.locations ?? []).map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {locErr && <p style={{ color: '#8b5cf6', fontSize: 12, marginTop: 4 }}>Please select a location</p>}
      </div>

      {/* BUDGET — dropdown with pricing labels */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Budget</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>💰</span>
          <select
            className="input-field"
            style={{ paddingLeft: 38 }}
            value={budget}
            onChange={(e) => setBudget(e.target.value as 'low' | 'medium' | 'high')}
            disabled={loading}
          >
            {BUDGET_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CUISINE */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Cuisine</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🍴</span>
          <select
            className="input-field"
            style={{ paddingLeft: 38 }}
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            disabled={loading}
          >
            <option value="">Any Cuisine</option>
            {(metadata?.cuisines ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* MINIMUM RATING — horizontal range slider */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Minimum Rating</span>
          <span style={{ fontWeight: 500, color: minRating > 0 ? '#eec140' : '#929096' }}>
            {minRating > 0 ? `★ ${minRating}.0+` : 'Any'}
          </span>
        </label>
        <input
          type="range"
          min={0} max={5} step={0.5}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          disabled={loading}
          style={{
            width: '100%',
            accentColor: '#8b5cf6',
            cursor: loading ? 'not-allowed' : 'pointer',
            height: 4,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: '#47464c' }}>
          <span>Any</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
        </div>
      </div>

      {/* AI PROMPT DETAILS */}
      <div style={{ marginBottom: 28 }}>
        <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>AI Prompt Details</span>
          <span style={{ fontWeight: 400, color: '#929096' }}>{addlPrefs.length}/150</span>
        </label>
        <textarea
          className="input-field"
          style={{ resize: 'none', height: 88 }}
          placeholder="e.g., 'Quiet corner table for anniversary, sommelier recommended...'"
          maxLength={150}
          value={addlPrefs}
          onChange={(e) => setAddlPrefs(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="btn-accent"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
      >
        {loading ? (
          <>
            <span style={{
              display: 'inline-block', width: 16, height: 16,
              border: '2px solid rgba(17,20,21,0.3)', borderTopColor: '#111415',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
            }} />
            Finding…
          </>
        ) : 'FIND RESTAURANTS →'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}
