import type { AutoEQEntry, AutoEQIndex } from '../../types/autoeq';
import { RESOLVE_PRESETS } from './resolve-presets';

const INDEX_URL = 'https://raw.githubusercontent.com/jaakkopasanen/AutoEq/master/results/INDEX.md';
const STORAGE_KEY = 'openpeq-autoeq-index';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Parse INDEX.md lines into structured entries.
 *
 * Line format:
 *   - [Name](./source/form/Name%20Encoded) by source on rig
 *   - [Name](./source/form/Name%20Encoded) by source
 */
export function parseIndexMd(markdown: string): AutoEQEntry[] {
  const entries: AutoEQEntry[] = [];
  const lines = markdown.split('\n');

  // Regex matches: - [Name](./path) by source [on rig]
  const lineRegex = /^- \[(.+?)\]\(\.\/(.+?)\)\s+by\s+(.+?)$/;

  for (const line of lines) {
    const match = line.trim().match(lineRegex);
    if (!match) continue;

    const name = match[1];
    const rawPath = decodeURIComponent(match[2]); // "oratory1990/over-ear/HIFIMAN Edition XS"
    const sourceAndRig = match[3]; // "oratory1990 on GRAS 43AG-7" or just "oratory1990"
    const source = sourceAndRig.replace(/\s+on\s+.+$/, ''); // strip " on rig"

    // Extract form factor from the path (second segment)
    // Path: "source/form-info/headphone-name"
    const pathParts = rawPath.split('/');
    let form = 'unknown';
    if (pathParts.length >= 2) {
      const formSegment = pathParts[1]; // e.g. "711 in-ear", "over-ear", "GRAS RA0045 in-ear"
      if (formSegment.includes('over-ear')) form = 'over-ear';
      else if (formSegment.includes('in-ear')) form = 'in-ear';
      else if (formSegment.includes('earbud')) form = 'earbud';
      else form = formSegment;
    }

    entries.push({ name, source, form, path: rawPath });
  }

  return entries;
}

function loadCachedIndex(): AutoEQIndex | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const index: AutoEQIndex = JSON.parse(raw);
    if (index.fetchedAt + CACHE_TTL > Date.now() && index.entries.length > 0) {
      return index;
    }
    return null;
  } catch {
    return null;
  }
}

function saveCachedIndex(index: AutoEQIndex): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(index));
  } catch {
    // localStorage full or unavailable, ignore
  }
}

async function fetchAutoEQIndex(): Promise<AutoEQEntry[]> {
  const cached = loadCachedIndex();
  if (cached) return cached.entries;

  const response = await fetch(INDEX_URL);
  if (!response.ok) {
    throw new Error(`Failed to load AutoEQ index (${response.status})`);
  }

  const markdown = await response.text();
  const entries = parseIndexMd(markdown);

  if (entries.length === 0) {
    throw new Error('Failed to parse AutoEQ index — no entries found');
  }

  saveCachedIndex({ entries, fetchedAt: Date.now() });
  return entries;
}

// Singleton in-memory cache
let memoryCache: AutoEQEntry[] | null = null;

export async function getAutoEQIndex(): Promise<AutoEQEntry[]> {
  if (memoryCache) return memoryCache;
  const autoEQEntries = await fetchAutoEQIndex();
  // Merge in Resolve (headphones.com) presets
  const resolveEntries = RESOLVE_PRESETS.map(p => p.entry);
  memoryCache = [...autoEQEntries, ...resolveEntries];
  return memoryCache;
}

export function clearAutoEQCache(): void {
  memoryCache = null;
  localStorage.removeItem(STORAGE_KEY);
}
