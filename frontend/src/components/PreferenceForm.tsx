import { useState } from 'react';
import { UserPreferences, MetadataResponse } from '../api/client';

interface Props {
  metadata: MetadataResponse | null;
  loading: boolean;
  onSubmit: (prefs: UserPreferences) => void;
}

export default function PreferenceForm({ metadata, loading, onSubmit }: Props) {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('medium');
  const [cuisine, setCuisine] = useState('');
  const [minRating, setMinRating] = useState<number>(4.0);
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    
    onSubmit({
      location,
      budget,
      cuisine: cuisine || undefined,
      min_rating: minRating || undefined,
      additional_preferences: prompt || undefined,
      top_k: 3,
    });
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Refine Your Taste</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div className="form-group">
          <label className="form-label">Location</label>
          <select 
            className="input-field" 
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          >
            <option value="">Select Location</option>
            {metadata?.locations.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Budget</label>
          <select 
            className="input-field" 
            value={budget}
            onChange={e => setBudget(e.target.value)}
          >
            <option value="low">Low — up to ₹500</option>
            <option value="medium">Medium — ₹500–₹1,500</option>
            <option value="high">High — above ₹1,500</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Cuisine</label>
          <select 
            className="input-field"
            value={cuisine}
            onChange={e => setCuisine(e.target.value)}
          >
            <option value="">Any Cuisine</option>
            {metadata?.cuisines.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <div className="range-header">
            <span className="form-label">Rating</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{minRating > 0 ? minRating.toFixed(1) : 'Any'}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.5" 
            value={minRating}
            onChange={e => setMinRating(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Preferences</label>
          <textarea 
            className="input-field" 
            rows={3} 
            style={{ resize: 'none' }} 
            placeholder="Intimate ambiance, good vegetarian options..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          ></textarea>
        </div>
        
        <button type="submit" className="btn-submit" disabled={loading || !location}>
          {loading ? (
            <><div className="spinner"></div> Processing...</>
          ) : (
            <span>Find My Perfect Spot</span>
          )}
        </button>
      </form>
    </aside>
  );
}
