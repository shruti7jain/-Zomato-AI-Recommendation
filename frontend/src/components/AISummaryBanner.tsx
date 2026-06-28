import { RecommendationResponse } from '../api/client';

interface Props {
  results: RecommendationResponse;
}

export function AISummaryBanner({ results }: Props) {
  const { meta, summary, recommendations } = results;



  const avgMatch = recommendations.length > 0
    ? Math.round(
        recommendations.reduce((s, r) => s + (r.match_percentage ?? 0), 0) / recommendations.length
      )
    : 0;

  return (
    <div className="glass-card rounded-xl p-container-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/5 opacity-60 pointer-events-none" />

      <div className="relative flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-outlined text-secondary mt-0.5 shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
              AI Concierge Summary
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant italic leading-relaxed">
              "{summary}"
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 pt-1 border-t border-white/10">
          {/* Restaurants found */}
          <StatPill
            icon="restaurant"
            value={`${recommendations.length}`}
            label="results found"
            color="text-secondary"
          />

          {/* Avg match */}
          <StatPill
            icon="percent"
            value={`${avgMatch}%`}
            label="avg match"
            color={avgMatch >= 70 ? 'text-emerald-400' : avgMatch >= 50 ? 'text-secondary' : 'text-amber-400'}
          />

          {/* Candidates considered */}
          <StatPill
            icon="database"
            value={meta.candidates_considered.toLocaleString()}
            label="candidates scanned"
            color="text-on-surface-variant"
          />

        </div>

        {/* Filters applied */}
        {meta.filters_applied.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {meta.filters_applied.map((f, i) => (
              <span
                key={i}
                className="glass-pill rounded-full px-2.5 py-0.5 font-label-sm text-[11px] text-on-surface-variant"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
      <span
        className={`material-symbols-outlined text-[16px] ${color}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className={`font-label-md text-label-md font-bold ${color}`}>{value}</span>
      <span className="font-label-sm text-[11px] text-on-surface-variant">{label}</span>
    </div>
  );
}
