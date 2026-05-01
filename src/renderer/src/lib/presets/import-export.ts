import type { Band, FilterType, Preset } from '../../types/eq';
import { DEFAULT_BANDS, MIN_GAIN, MAX_GAIN } from '../../types/eq';
import { generateId, clamp } from '../../utils/math';
import { sanitizeBands, sanitizePreamp } from '../validation';

export interface ImportResult {
  bands: Band[];
  preamp: number;
  warnings: string[];
}

/**
 * Parse AutoEQ / EqualizerAPO format. Handles many variations:
 *   Preamp: -6.2 dB
 *   Filter 1: ON PK Fc 65 Hz Gain 5.8 dB Q 0.76
 *   Filter 2: ON LSC Fc 105 Hz Gain -3.2 dB Q 0.71
 *   Filter 3: PK Fc 200 Hz Gain 2.0 dB Q 1.41
 *   Filter 4: OFF PK Fc 500 Hz Gain -1.0 dB Q 2.00
 */
const UNSUPPORTED_FILTER_TYPES = new Set(['LP', 'HP', 'NO', 'BP', 'LPQ', 'HPQ', 'AP', 'NONE']);

function mapFilterType(raw: string): FilterType | null {
  const t = raw.toUpperCase();
  if (UNSUPPORTED_FILTER_TYPES.has(t)) return null;
  if (t === 'LSC' || t === 'LSQ' || t === 'LS' || t === 'LOW' || t === 'LOWSHELF') return 'LSQ';
  if (t === 'HSC' || t === 'HSQ' || t === 'HS' || t === 'HIGH' || t === 'HIGHSHELF') return 'HSQ';
  return 'PK';
}

export function parseAutoEQ(text: string): ImportResult {
  const lines = text.trim().split('\n');
  const bands: Band[] = [];
  const warnings: string[] = [];
  let preamp = 0;
  let skippedFilters = 0;
  let clampedBands = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Parse preamp line
    const preampMatch = trimmed.match(/^Preamp:\s*([-+]?\d+\.?\d*)\s*dB/i);
    if (preampMatch) {
      preamp = parseFloat(preampMatch[1]);
      continue;
    }

    // Parse filter line - flexible: ON/OFF/omitted, many filter type names
    // Format: Filter N: [ON|OFF] TYPE Fc FREQ Hz Gain GAIN dB Q QVAL
    const filterMatch = trimmed.match(
      /^Filter\s+\d+:\s*(?:ON|OFF)?\s*(PK|PEQ|LSC|LSQ|HSC|HSQ|LS|HS|LP|HP|NO|BP|LPQ|HPQ|AP|NONE|LOW\s*SHELF|HIGH\s*SHELF)\s+Fc\s+(\d+\.?\d*)\s*Hz\s+Gain\s+([-+]?\d+\.?\d*)\s*dB\s+Q\s+(\d+\.?\d*)/i
    );
    if (filterMatch) {
      const rawType = filterMatch[1].replace(/\s+/g, '');
      const mappedType = mapFilterType(rawType);
      if (mappedType === null) {
        skippedFilters++;
        continue;
      }
      const rawGain = parseFloat(filterMatch[3]);
      if (rawGain < MIN_GAIN || rawGain > MAX_GAIN) {
        clampedBands++;
      }
      bands.push({
        freq: clamp(Math.round(parseFloat(filterMatch[2])), 20, 20000),
        gain: clamp(rawGain, MIN_GAIN, MAX_GAIN),
        q: clamp(parseFloat(filterMatch[4]), 0.1, 30),
        type: mappedType,
        enabled: true,
      });
    }
  }

  if (skippedFilters > 0) {
    warnings.push(`${skippedFilters} unsupported filter${skippedFilters > 1 ? 's' : ''} (HP/LP/BP/Notch) skipped — device only supports PK/LS/HS`);
  }
  if (clampedBands > 0) {
    warnings.push(`${clampedBands} band${clampedBands > 1 ? 's' : ''} had gain outside ±${MAX_GAIN} dB and ${clampedBands > 1 ? 'were' : 'was'} clamped`);
  }

  // Pad to 10 bands if fewer
  while (bands.length < 10) {
    bands.push({ ...DEFAULT_BANDS[bands.length] || DEFAULT_BANDS[0], gain: 0 });
  }

  // Truncate to 10
  return { bands: bands.slice(0, 10), preamp, warnings };
}

/**
 * Parse Peace EQ format (simplified):
 *   Band 1: Freq 100 Gain 3.5 Q 1.41 Type Peak
 *   Or CSV-like: 100,3.5,1.41,PK
 */
export function parsePeaceEQ(text: string): ImportResult {
  const lines = text.trim().split('\n');
  const bands: Band[] = [];
  const warnings: string[] = [];
  let preamp = 0;
  let clampedBands = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    // Try CSV format: freq,gain,q[,type]
    const csvMatch = trimmed.match(/^(\d+\.?\d*)\s*[,;\t]\s*([-+]?\d+\.?\d*)\s*[,;\t]\s*(\d+\.?\d*)(?:\s*[,;\t]\s*(PK|LSQ|HSQ|Peak|LowShelf|HighShelf))?/i);
    if (csvMatch) {
      const type: FilterType = mapFilterType(csvMatch[4] || 'PK') ?? 'PK';
      const rawGain = parseFloat(csvMatch[2]);
      if (rawGain < MIN_GAIN || rawGain > MAX_GAIN) {
        clampedBands++;
      }

      bands.push({
        freq: clamp(Math.round(parseFloat(csvMatch[1])), 20, 20000),
        gain: clamp(rawGain, MIN_GAIN, MAX_GAIN),
        q: clamp(parseFloat(csvMatch[3]), 0.1, 30),
        type,
        enabled: true,
      });
      continue;
    }

    // Try preamp
    const preampMatch = trimmed.match(/preamp[:\s]+([-+]?\d+\.?\d*)/i);
    if (preampMatch) {
      preamp = parseFloat(preampMatch[1]);
    }
  }

  if (clampedBands > 0) {
    warnings.push(`${clampedBands} band${clampedBands > 1 ? 's' : ''} had gain outside ±${MAX_GAIN} dB and ${clampedBands > 1 ? 'were' : 'was'} clamped`);
  }

  while (bands.length < 10) {
    bands.push({ ...DEFAULT_BANDS[bands.length] || DEFAULT_BANDS[0], gain: 0 });
  }

  return { bands: bands.slice(0, 10), preamp, warnings };
}

/** Export current EQ state as JSON */
export function exportAsJSON(bands: Band[], preamp: number, name: string): string {
  const preset: Preset = {
    id: generateId(),
    name,
    bands,
    preamp,
    createdAt: Date.now(),
  };
  return JSON.stringify(preset, null, 2);
}

/** Import a JSON preset file with full sanitization of untrusted data. */
export function importFromJSON(json: string): ImportResult & { name: string } {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid preset file format');
  }
  if (!parsed.bands || !Array.isArray(parsed.bands)) {
    throw new Error('Invalid preset file format: missing bands array');
  }
  const warnings: string[] = [];
  let clampedBands = 0;
  if (Array.isArray(parsed.bands)) {
    for (const b of parsed.bands) {
      if (b && typeof b.gain === 'number' && (b.gain < MIN_GAIN || b.gain > MAX_GAIN)) {
        clampedBands++;
      }
    }
  }
  if (clampedBands > 0) {
    warnings.push(`${clampedBands} band${clampedBands > 1 ? 's' : ''} had gain outside ±${MAX_GAIN} dB and ${clampedBands > 1 ? 'were' : 'was'} clamped`);
  }
  return {
    bands: sanitizeBands(parsed.bands),
    preamp: sanitizePreamp(parsed.preamp),
    name: typeof parsed.name === 'string' ? parsed.name.slice(0, 100) : 'Imported Preset',
    warnings,
  };
}

/** Export as AutoEQ / EqualizerAPO format */
export function exportAsAutoEQ(bands: Band[], preamp: number): string {
  const lines: string[] = [];
  if (preamp !== 0) {
    lines.push(`Preamp: ${preamp.toFixed(1)} dB`);
  }
  bands.forEach((band, i) => {
    if (!band.enabled) return;
    const typeStr = band.type === 'LSQ' ? 'LSC' : band.type === 'HSQ' ? 'HSC' : 'PK';
    lines.push(
      `Filter ${i + 1}: ON ${typeStr} Fc ${band.freq} Hz Gain ${band.gain.toFixed(1)} dB Q ${band.q.toFixed(2)}`
    );
  });
  return lines.join('\n');
}

/** Trigger a file download in the browser */
export function downloadFile(content: string, filename: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
