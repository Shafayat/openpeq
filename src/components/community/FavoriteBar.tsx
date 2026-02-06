import { useState } from 'react';
import { useCommunityStore } from '../../store/community-store';
import { useEQStore } from '../../store/eq-store';
import { fetchAutoEQProfile } from '../../lib/community/autoeq-fetch';
import type { AutoEQEntry } from '../../types/autoeq';

const SOURCE_COLORS: Record<string, string> = {
  oratory1990: 'text-blue-400',
  crinacle: 'text-purple-400',
  Rtings: 'text-green-400',
  Innerfidelity: 'text-amber-400',
  'Super Review': 'text-rose-400',
  HypetheSonics: 'text-cyan-400',
};

export function FavoriteBar() {
  const favorites = useCommunityStore(s => s.favorites);
  const setBands = useEQStore(s => s.setBands);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (favorites.length === 0) return null;

  const handleApply = async (entry: AutoEQEntry) => {
    setLoading(entry.path);
    setError(null);
    try {
      const { bands, preamp } = await fetchAutoEQProfile(entry);
      setBands(bands, preamp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium flex-shrink-0">
        Quick EQ
      </span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {favorites.map(fav => {
          const isLoading = loading === fav.path;
          return (
            <button
              key={fav.path}
              onClick={() => handleApply(fav)}
              disabled={loading !== null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${
                isLoading
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-bg-input text-text-secondary border-border hover:border-accent/40 hover:text-accent disabled:opacity-40'
              }`}
            >
              {isLoading ? (
                <div className="w-3 h-3 border-[1.5px] border-accent/30 border-t-accent rounded-full animate-spin" />
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              )}
              <span className="truncate max-w-[140px]">{fav.name}</span>
              <span className={`text-[9px] opacity-60 ${SOURCE_COLORS[fav.source] ?? 'text-text-muted'}`}>
                {fav.source}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <span className="text-[10px] text-danger flex-shrink-0">{error}</span>
      )}
    </div>
  );
}
