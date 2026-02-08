import type { Preset } from '../../types/eq';
import { sanitizePreset } from '../validation';

const STORAGE_KEY = 'openpeq-presets';

export function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Sanitize each preset and discard any that are completely invalid
    return parsed
      .map(sanitizePreset)
      .filter((p): p is Preset => p !== null);
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
