import { useState } from 'react';
import { UserPreferences, MetadataResponse } from '../api/client';

interface Props {
  metadata: MetadataResponse | null;
  loading: boolean;
  onSubmit: (prefs: UserPreferences) => void;
}

export default function PreferenceForm({ metadata, loading, onSubmit }: Props) {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [cuisine, setCuisine] = useState('');
  const [minRating, setMinRating] = useState<number>(4.5);
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
      top_k: 5,
    });
  };

  return (
    <div className="glass-card rounded-xl p-container-padding space-y-stack-md relative overflow-hidden w-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full blur-2xl"></div>
      <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
        Refine Parameters
      </h2>
      <form onSubmit={handleSubmit} className="space-y-stack-sm flex flex-col">
        {/* Location & Budget Row */}
        <div className="flex flex-col sm:flex-row gap-stack-sm">
          <div className="flex-1 relative">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Location</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">location_on</span>
              <select 
                className="glass-input w-full bg-transparent text-on-surface pl-10 pr-4 py-3 rounded-lg appearance-none font-body-md text-body-md focus:ring-0 border-x-0 border-t-0 border-b-2 border-white/10"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              >
                <option className="bg-surface-container text-on-surface" disabled value="">Select Location</option>
                {metadata?.locations?.map(l => (
                  <option className="bg-surface-container text-on-surface" key={l} value={l}>{l}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
            </div>
          </div>
          <div className="flex-1 relative">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Budget Tier</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">payments</span>
              <select 
                className="glass-input w-full bg-transparent text-on-surface pl-10 pr-4 py-3 rounded-lg appearance-none font-body-md text-body-md focus:ring-0 border-x-0 border-t-0 border-b-2 border-white/10"
                value={budget}
                onChange={e => setBudget(e.target.value as 'low' | 'medium' | 'high')}
              >
                <option className="bg-surface-container text-on-surface" disabled value="">Any Budget</option>
                <option className="bg-surface-container text-on-surface" value="low">Low — up to ₹500</option>
                <option className="bg-surface-container text-on-surface" value="medium">Medium — ₹500–₹1,500</option>
                <option className="bg-surface-container text-on-surface" value="high">High — above ₹1,500</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
            </div>
          </div>
        </div>

        {/* Cuisine Dropdown */}
        <div className="relative">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Cuisine Preference</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">restaurant</span>
            <select 
              className="glass-input w-full bg-transparent text-on-surface pl-10 pr-4 py-3 rounded-lg appearance-none font-body-md text-body-md focus:ring-0 border-x-0 border-t-0 border-b-2 border-white/10"
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
            >
              <option className="bg-surface-container text-on-surface" value="">Any Cuisine</option>
              {metadata?.cuisines?.map(c => (
                <option className="bg-surface-container text-on-surface" key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
          </div>
        </div>

        {/* Rating Slider */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-label-sm text-label-sm text-on-surface-variant">Minimum Rating</label>
            <span className="font-label-md text-label-md text-primary">{minRating > 0 ? minRating.toFixed(1) + '+' : 'Any'}</span>
          </div>
          <input 
            className="w-full" 
            max="5" 
            min="0" 
            step="0.5" 
            type="range" 
            value={minRating}
            onChange={e => setMinRating(parseFloat(e.target.value))}
          />
          <div className="flex justify-between font-label-sm text-[10px] text-on-surface-variant mt-1">
            <span>0.0</span>
            <span>2.5</span>
            <span>5.0</span>
          </div>
        </div>

        {/* AI Prompt Textarea */}
        <div className="pt-2">
          <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            AI Vibe Prompt
          </label>
          <textarea 
            className="glass-input w-full bg-transparent text-on-surface p-3 rounded-lg font-body-md text-body-md focus:ring-0 border-x-0 border-t-0 border-b-2 border-white/10 resize-none placeholder-on-surface-variant/50" 
            placeholder="e.g., 'Looking for a dim-lit, romantic spot with excellent natural wine and loud 90s hip hop.'" 
            rows={3}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button 
          className="gradient-btn w-full mt-4 py-4 rounded-lg font-label-md text-label-md text-white flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.2)] disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit"
          disabled={loading || !location}
        >
          {loading ? (
            <span className="animate-spin material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
          ) : (
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>travel_explore</span>
          )}
          {loading ? 'Processing...' : 'Search'}
        </button>
      </form>
    </div>
  );
}
