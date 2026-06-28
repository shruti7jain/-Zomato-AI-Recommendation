
export interface RestaurantCardProps {
  rank: number;
  name: string;
  rating: string;
  price: string;
  tags: string[];
  quote: string;
  imageUrl: string;
  imageAlt: string;
  matchPercentage?: number;
}

export function RestaurantCard({
  rank,
  name,
  rating,
  price,
  tags,
  quote,
  imageUrl,
  imageAlt,
  matchPercentage,
}: RestaurantCardProps) {
  const getBadgeClasses = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-secondary to-primary-container text-on-primary shadow-[0_0_30px_rgba(255,181,157,0.4)]';
      case 2:
        return 'glass-card text-secondary border-2 border-secondary/50 shadow-[inset_0_0_15px_rgba(238,193,64,0.2)]';
      case 3:
        return 'glass-card text-primary-container border-2 border-primary-container/50 shadow-[inset_0_0_15px_rgba(255,107,53,0.2)]';
      default:
        return 'glass-card text-on-surface-variant border-2 border-white/20';
    }
  };

  const getMatchColor = (pct: number) => {
    if (pct >= 80) return { text: 'text-emerald-400', ring: 'stroke-emerald-400', bg: 'bg-emerald-400/10' };
    if (pct >= 60) return { text: 'text-secondary', ring: 'stroke-secondary', bg: 'bg-secondary/10' };
    if (pct >= 40) return { text: 'text-amber-400', ring: 'stroke-amber-400', bg: 'bg-amber-400/10' };
    return { text: 'text-primary-container', ring: 'stroke-primary-container', bg: 'bg-primary-container/10' };
  };

  const matchColors = matchPercentage != null ? getMatchColor(matchPercentage) : null;
  const circumference = 2 * Math.PI * 18; // radius = 18
  const dashOffset = matchPercentage != null
    ? circumference * (1 - matchPercentage / 100)
    : circumference;

  return (
    <article className="glass-card rounded-xl flex flex-col md:flex-row relative group hover:-translate-y-1 transition-transform duration-300">
      {/* Rank Badge */}
      <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center font-headline-md text-headline-md font-extrabold z-10 ${getBadgeClasses(rank)}`}>
        {rank}
      </div>

      {/* Image */}
      <div className="w-full md:w-[300px] h-[200px] md:h-auto shrink-0 relative">
        <img
          className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
          alt={imageAlt}
          src={imageUrl}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent md:hidden"></div>
      </div>

      {/* Content */}
      <div className="p-container-padding flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h3 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
              {name}
            </h3>

            {/* Match % Ring */}
            {matchPercentage != null && matchColors && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${matchColors.bg} border border-white/10`}>
                <div className="relative w-10 h-10 shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
                    <circle
                      cx="20" cy="20" r="18"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className={matchColors.ring}
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center font-bold text-[10px] ${matchColors.text}`}>
                    {matchPercentage}%
                  </span>
                </div>
                <span className={`font-label-sm text-label-sm ${matchColors.text} hidden sm:block`}>match</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-label-md text-label-md font-bold">{rating}</span>
            </div>
            <span className="text-on-surface-variant font-body-md text-body-md">{price}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, i) => (
              <span key={i} className="glass-pill rounded-full px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <blockquote className="border-l-4 border-secondary pl-4 py-1 italic text-on-surface-variant font-body-md text-body-md bg-white/5 rounded-r-lg">
          "{quote}"
        </blockquote>
      </div>
    </article>
  );
}
