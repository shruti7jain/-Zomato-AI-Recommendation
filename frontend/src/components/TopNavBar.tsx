

export function TopNavBar() {
  return (
    <nav className="bg-background/40 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10 shadow-[0_0_20px_rgba(255,181,157,0.1)]">
      <div className="flex justify-between items-center h-20 px-gutter max-w-[1200px] mx-auto">
        {/* Brand */}
        <a className="font-headline-md text-headline-md font-extrabold bg-gradient-to-r from-secondary-container to-primary-container bg-clip-text text-transparent hover:scale-95 transition-transform" href="#">
          ZOMATA AI
        </a>
        
        {/* Links (Desktop) */}
        <div className="hidden md:flex space-x-8 items-center font-label-md text-label-md">
          <a className="text-primary border-b-2 border-primary pb-1 active:scale-95 transition-transform" href="#">Discover</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 duration-300 px-3 py-2 rounded-DEFAULT active:scale-95" href="#">Reservations</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 duration-300 px-3 py-2 rounded-DEFAULT active:scale-95" href="#">Elite Hub</a>
        </div>
        
        {/* Trailing Action */}
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors hidden md:block">search</span>
          <button className="bg-gradient-to-r from-secondary to-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md hover:shadow-[0_0_20px_rgba(255,181,157,0.3)] transition-all duration-300 active:scale-95">
            Go Premium
          </button>
        </div>
      </div>
    </nav>
  );
}
