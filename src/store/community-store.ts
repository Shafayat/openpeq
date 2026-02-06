import { create } from 'zustand';
import type { AutoEQEntry } from '../types/autoeq';
import type { SearchResult } from '../lib/community/autoeq-search';

const FAVORITES_KEY = 'openpeq-favorite-eqs';

function loadFavorites(): AutoEQEntry[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) return JSON.parse(raw) as AutoEQEntry[];
    return [];
  } catch {
    return [];
  }
}

function saveFavorites(entries: AutoEQEntry[]): void {
  try {
    if (entries.length > 0) localStorage.setItem(FAVORITES_KEY, JSON.stringify(entries));
    else localStorage.removeItem(FAVORITES_KEY);
  } catch { /* noop */ }
}

interface CommunityStore {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  entries: AutoEQEntry[];
  isLoadingIndex: boolean;
  isLoadingProfile: boolean;
  error: string | null;
  favorites: AutoEQEntry[];

  open: () => void;
  close: () => void;
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setEntries: (entries: AutoEQEntry[]) => void;
  setLoadingIndex: (loading: boolean) => void;
  setLoadingProfile: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleFavorite: (entry: AutoEQEntry) => void;
  removeFavorite: (path: string) => void;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
  isOpen: false,
  query: '',
  results: [],
  entries: [],
  isLoadingIndex: false,
  isLoadingProfile: false,
  error: null,
  favorites: loadFavorites(),

  open: () => set({ isOpen: true, error: null }),
  close: () => set({ isOpen: false, query: '', results: [], error: null, isLoadingProfile: false }),
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setEntries: (entries) => set({ entries }),
  setLoadingIndex: (loading) => set({ isLoadingIndex: loading }),
  setLoadingProfile: (loading) => set({ isLoadingProfile: loading }),
  setError: (error) => set({ error }),
  toggleFavorite: (entry) => {
    set(state => {
      const exists = state.favorites.some(f => f.path === entry.path);
      const updated = exists
        ? state.favorites.filter(f => f.path !== entry.path)
        : [...state.favorites, entry];
      saveFavorites(updated);
      return { favorites: updated };
    });
  },
  removeFavorite: (path) => {
    set(state => {
      const updated = state.favorites.filter(f => f.path !== path);
      saveFavorites(updated);
      return { favorites: updated };
    });
  },
}));
