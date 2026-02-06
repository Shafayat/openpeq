import type { Preset } from '../../types/eq';

const STORAGE_KEY = 'openpeq-presets';

export function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Preset[];
  } catch {
    return [];
  }
}

export function savePresets(presets: Preset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    console.error('Failed to save presets to localStorage');
  }
}
