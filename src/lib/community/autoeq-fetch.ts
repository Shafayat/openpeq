import type { Band } from '../../types/eq';
import type { AutoEQEntry } from '../../types/autoeq';
import { parseAutoEQ } from '../presets/import-export';
import { RESOLVE_PRESETS } from './resolve-presets';

const RAW_BASE = 'https://raw.githubusercontent.com/jaakkopasanen/AutoEq/master/results';

/**
 * Fetch a ParametricEQ.txt for a specific headphone entry and parse it.
 * For Resolve presets, returns hardcoded data instantly (no network fetch).
 */
export async function fetchAutoEQProfile(
  entry: AutoEQEntry,
): Promise<{ bands: Band[]; preamp: number }> {
  // Resolve presets are built-in — return immediately
  if (entry.source === 'Resolve') {
    const preset = RESOLVE_PRESETS.find(p => p.entry.path === entry.path);
    if (preset) {
      return { bands: preset.bands, preamp: preset.preamp };
    }
  }

  // Each path segment must be individually encoded
  const encodedPath = entry.path
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  const encodedFilename = encodeURIComponent(`${entry.name} ParametricEQ.txt`);
  const url = `${RAW_BASE}/${encodedPath}/${encodedFilename}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch EQ profile (${response.status})`);
  }

  const text = await response.text();
  return parseAutoEQ(text);
}
