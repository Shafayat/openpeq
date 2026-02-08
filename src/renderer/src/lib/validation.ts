/**
 * Central input sanitization for all untrusted data entry points.
 *
 * Every value that enters the app from external sources (file import,
 * JSON parse, localStorage, network fetch, device response) MUST pass
 * through these functions before reaching state or the HID device.
 */

import type { Band, FilterType, Preset } from '../types/eq';
import {
  MIN_FREQ, MAX_FREQ,
  MIN_GAIN, MAX_GAIN,
  MIN_Q, MAX_Q,
  MAX_FILTERS,
  DEFAULT_BANDS,
} from '../types/eq';
import { clamp, roundTo } from '../utils/math';

// ── Constants ───────────────────────────────────────────────────────

const VALID_FILTER_TYPES: ReadonlySet<string> = new Set(['PK', 'LSQ', 'HSQ']);
const MAX_PREAMP = 20;
const MIN_PREAMP = -20;
const MAX_PRESET_NAME_LENGTH = 100;

// ── Band sanitization ───────────────────────────────────────────────

/** Validate and clamp a single band from an untrusted source. */
export function sanitizeBand(raw: unknown): Band {
  if (raw === null || typeof raw !== 'object') {
    return { freq: 1000, gain: 0, q: 1.41, type: 'PK', enabled: true };
  }

  const obj = raw as Record<string, unknown>;

  const freq = typeof obj.freq === 'number' && Number.isFinite(obj.freq)
    ? clamp(Math.round(obj.freq), MIN_FREQ, MAX_FREQ)
    : 1000;

  const gain = typeof obj.gain === 'number' && Number.isFinite(obj.gain)
    ? clamp(roundTo(obj.gain, 1), MIN_GAIN, MAX_GAIN)
    : 0;

  const q = typeof obj.q === 'number' && Number.isFinite(obj.q)
    ? clamp(roundTo(obj.q, 2), MIN_Q, MAX_Q)
    : 1.41;

  const type: FilterType =
    typeof obj.type === 'string' && VALID_FILTER_TYPES.has(obj.type)
      ? (obj.type as FilterType)
      : 'PK';

  const enabled = typeof obj.enabled === 'boolean' ? obj.enabled : true;

  return { freq, gain, q, type, enabled };
}

/** Validate an array of bands: sanitize each, truncate to 10, pad if fewer. */
export function sanitizeBands(raw: unknown): Band[] {
  if (!Array.isArray(raw)) {
    return DEFAULT_BANDS.map(b => ({ ...b }));
  }

  const bands = raw.slice(0, MAX_FILTERS).map(sanitizeBand);

  // Pad to MAX_FILTERS if fewer bands provided
  while (bands.length < MAX_FILTERS) {
    const defaultBand = DEFAULT_BANDS[bands.length] ?? DEFAULT_BANDS[0];
    bands.push({ ...defaultBand, gain: 0 });
  }

  return bands;
}

// ── Preamp sanitization ─────────────────────────────────────────────

/** Validate and clamp a preamp value. */
export function sanitizePreamp(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return clamp(roundTo(raw, 1), MIN_PREAMP, MAX_PREAMP);
}

// ── Preset sanitization ─────────────────────────────────────────────

/** Validate a full preset from localStorage or import. Returns null if unfixable. */
export function sanitizePreset(raw: unknown): Preset | null {
  if (raw === null || typeof raw !== 'object') return null;

  const obj = raw as Record<string, unknown>;

  if (typeof obj.id !== 'string' || obj.id.length === 0) return null;
  if (typeof obj.name !== 'string' || obj.name.length === 0) return null;

  return {
    id: obj.id,
    name: obj.name.slice(0, MAX_PRESET_NAME_LENGTH),
    bands: sanitizeBands(obj.bands),
    preamp: sanitizePreamp(obj.preamp),
    createdAt:
      typeof obj.createdAt === 'number' && Number.isFinite(obj.createdAt)
        ? obj.createdAt
        : Date.now(),
  };
}
