import { useEffect, useRef, useCallback } from 'react';
import { useCommunityStore } from '../../store/community-store';
import { useEQStore } from '../../store/eq-store';
import { getAutoEQIndex } from '../../lib/community/autoeq-index';
import { searchAutoEQ } from '../../lib/community/autoeq-search';
import { fetchAutoEQProfile } from '../../lib/community/autoeq-fetch';
import type { AutoEQEntry } from '../../types/autoeq';

const SOURCE_COLORS: Record<string, string> = {
  oratory1990: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  crinacle: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Rtings: 'bg-green-500/20 text-green-400 border-green-500/30',
  Innerfidelity: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Super Review': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  HypetheSonics: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Resolve: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const DEFAULT_COLOR = 'bg-text-muted/10 text-text-muted border-border';

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] ?? DEFAULT_COLOR;
}

export function CommunityEQModal() {
  const store = useCommunityStore();
  const setBands = useEQStore(s => s.setBands);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load index when modal opens (lazy)
  useEffect(() => {
    if (!store.isOpen) return;
    if (store.entries.length > 0) {
      inputRef.current?.focus();
      return;
    }

    let cancelled = false;
    store.setLoadingIndex(true);
    store.setError(null);

    getAutoEQIndex()
      .then(entries => {
        if (cancelled) return;
        store.setEntries(entries);
        store.setLoadingIndex(false);
        inputRef.current?.focus();
      })
      .catch(err => {
        if (cancelled) return;
        store.setLoadingIndex(false);
        store.setError(err instanceof Error ? err.message : 'Failed to load index');
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.isOpen]);

  const runSearch = useCallback((value: string) => {
    store.setQuery(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const entries = useCommunityStore.getState().entries;
      const results = searchAutoEQ(entries, value);
      store.setResults(results);
    }, 150);
  }, [store]);

  const handleFavoriteClick = useCallback((entry: AutoEQEntry) => {
    const state = useCommunityStore.getState();
    // If already searching this favorite, clear the search
    if (state.query === entry.name) {
      store.setQuery('');
      store.setResults([]);
    } else {
      // Search for this favorite's headphone name
      store.setQuery(entry.name);
      const results = searchAutoEQ(state.entries, entry.name);
      store.setResults(results);
    }
    inputRef.current?.focus();
  }, [store]);

  const handleSelect = useCallback(async (entry: AutoEQEntry) => {
    store.setLoadingProfile(true);
    store.setError(null);
    try {
      const { bands, preamp } = await fetchAutoEQProfile(entry);
      setBands(bands, preamp);
      store.close();
    } catch (err) {
      store.setError(err instanceof Error ? err.message : 'Failed to load profile');
      store.setLoadingProfile(false);
    }
  }, [setBands, store]);

  // Close on Escape
  useEffect(() => {
    if (!store.isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') store.close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store, store.isOpen]);

  if (!store.isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={store.close}
    >
      <div
        className="glass-card p-6 w-full max-w-2xl mx-4 flex flex-col gap-4 max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Community EQ Library</h3>
            <p className="text-[10px] text-text-muted mt-0.5">
              {store.entries.length > 0
                ? `${store.entries.length.toLocaleString()} profiles from AutoEQ + Resolve`
                : 'Powered by AutoEQ + Resolve'}
            </p>
          </div>
          <button
            onClick={store.close}
            className="p-1.5 text-text-muted hover:text-text-secondary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Favorite EQ chips */}
        {store.favorites.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {store.favorites.map(fav => {
              const isActive = store.query === fav.name;
              return (
                <button
                  key={fav.path}
                  onClick={() => handleFavoriteClick(fav)}
                  className={`group/fav flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-bg-input text-text-secondary border-border hover:border-amber-500/30 hover:text-amber-400'
                  }`}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-60">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="truncate max-w-[140px]">{fav.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${getSourceColor(fav.source)}`}>
                    {fav.source}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      store.removeFavorite(fav.path);
                    }}
                    className="flex-shrink-0 opacity-0 group-hover/fav:opacity-60 hover:!opacity-100 transition-opacity cursor-pointer"
                    title="Remove favorite"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={store.query}
            onChange={e => runSearch(e.target.value)}
            placeholder="Search headphones... (e.g. Edition XS, HD 600, AirPods Pro)"
            className="w-full bg-bg-input border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-border-focus focus:outline-none transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Loading index */}
          {store.isLoadingIndex && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Loading headphone database...</p>
            </div>
          )}

          {/* Error */}
          {store.error && !store.isLoadingIndex && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-sm text-danger">{store.error}</p>
              <button
                onClick={() => {
                  store.setError(null);
                  store.setEntries([]);
                  store.close();
                  setTimeout(() => store.open(), 50);
                }}
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state — before search */}
          {!store.isLoadingIndex && !store.error && store.query === '' && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted/30">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-sm text-text-muted">
                Search {store.entries.length > 0 ? `${store.entries.length.toLocaleString()}` : ''} EQ profiles
              </p>
              <p className="text-xs text-text-muted/50">
                From Resolve, oratory1990, crinacle, Rtings, and 20+ more sources
              </p>
            </div>
          )}

          {/* No results */}
          {!store.isLoadingIndex && !store.error && store.query !== '' && store.results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-text-muted">
                No matches for &quot;{store.query}&quot;
              </p>
              <p className="text-xs text-text-muted/50">
                Try a different spelling or shorter query
              </p>
            </div>
          )}

          {/* Results list */}
          {store.results.length > 0 && (
            <div className="flex flex-col gap-1">
              {store.results.map((result, i) => {
                const isFav = store.favorites.some(f => f.path === result.entry.path);
                return (
                  <div
                    key={`${result.entry.path}-${i}`}
                    className="flex items-center gap-1 rounded-lg transition-all hover:bg-bg-card-hover/60 group"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.toggleFavorite(result.entry);
                      }}
                      className={`flex-shrink-0 p-2 transition-colors ${
                        isFav ? 'text-amber-400' : 'text-text-muted/20 hover:text-amber-400/60'
                      }`}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleSelect(result.entry)}
                      disabled={store.isLoadingProfile}
                      className="flex items-center justify-between flex-1 min-w-0 px-2 py-2.5 text-left disabled:opacity-50 disabled:cursor-wait"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-sm text-text-primary truncate group-hover:text-accent transition-colors">
                          {result.entry.name}
                        </span>
                        <span className="text-[10px] text-text-muted/60">{result.entry.form}</span>
                      </div>
                      <span
                        className={`flex-shrink-0 ml-3 px-2 py-0.5 text-[10px] font-medium rounded-full border ${getSourceColor(result.entry.source)}`}
                      >
                        {result.entry.source}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading profile overlay */}
        {store.isLoadingProfile && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <span className="text-xs text-text-muted">Loading EQ profile...</span>
          </div>
        )}
      </div>
    </div>
  );
}
