import type { Band, FilterType, Preset } from '../../types/eq';
import { DEFAULT_BANDS } from '../../types/eq';
import { generateId, clamp } from '../../utils/math';
import { sanitizeBands, sanitizePreamp } from '../validation';

/**
 * Parse AutoEQ / EqualizerAPO format. Handles many variations:
 *   Preamp: -6.2 dB
 *   Filter 1: ON PK Fc 65 Hz Gain 5.8 dB Q 0.76
 *   Filter 2: ON LSC Fc 105 Hz Gain -3.2 dB Q 0.71
 *   Filter 3: PK Fc 200 Hz Gain 2.0 dB Q 1.41
 *   Filter 4: OFF PK Fc 500 Hz Gain -1.0 dB Q 2.00
 */
function mapFilterType(raw: string): FilterType {
  const t = raw.toUpperCase();
  if (t === 'LSC' || t === 'LSQ' || t === 'LS' || t === 'LOW' || t === 'LOWSHELF') return 'LSQ';
  if (t === 'HSC' || t === 'HSQ' || t === 'HS' || t === 'HIGH' || t === 'HIGHSHELF') return 'HSQ';
  return 'PK';
}

export function parseAutoEQ(text: string): { bands: Band[]; preamp: number } {
  const lines = text.trim().split('\n');
  const bands: Band[] = [];
  let preamp = 0;

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
      bands.push({
        freq: clamp(Math.round(parseFloat(filterMatch[2])), 20, 20000),
        gain: clamp(parseFloat(filterMatch[3]), -10, 10),
        q: clamp(parseFloat(filterMatch[4]), 0.1, 30),
        type: mapFilterType(filterMatch[1]),
        enabled: true,
      });
    }
  }

  // Pad to 10 bands if fewer
  while (bands.length < 10) {
    bands.push({ ...DEFAULT_BANDS[bands.length] || DEFAULT_BANDS[0], gain: 0 });
  }

  // Truncate to 10
  return { bands: bands.slice(0, 10), preamp };
}

/**
 * Parse Peace EQ format (simplified):
 *   Band 1: Freq 100 Gain 3.5 Q 1.41 Type Peak
 *   Or CSV-like: 100,3.5,1.41,PK
 */
export function parsePeaceEQ(text: string): { bands: Band[]; preamp: number } {
  const lines = text.trim().split('\n');
  const bands: Band[] = [];
  let preamp = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

    // Try CSV format: freq,gain,q[,type]
    const csvMatch = trimmed.match(/^(\d+\.?\d*)\s*[,;\t]\s*([-+]?\d+\.?\d*)\s*[,;\t]\s*(\d+\.?\d*)(?:\s*[,;\t]\s*(PK|LSQ|HSQ|Peak|LowShelf|HighShelf))?/i);
    if (csvMatch) {
      const type: FilterType = mapFilterType(csvMatch[4] || 'PK');

      bands.push({
        freq: clamp(Math.round(parseFloat(csvMatch[1])), 20, 20000),
        gain: clamp(parseFloat(csvMatch[2]), -10, 10),
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

  while (bands.length < 10) {
    bands.push({ ...DEFAULT_BANDS[bands.length] || DEFAULT_BANDS[0], gain: 0 });
  }

  return { bands: bands.slice(0, 10), preamp };
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
export function importFromJSON(json: string): { bands: Band[]; preamp: number; name: string } {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid preset file format');
  }
  if (!parsed.bands || !Array.isArray(parsed.bands)) {
    throw new Error('Invalid preset file format: missing bands array');
  }
  return {
    bands: sanitizeBands(parsed.bands),
    preamp: sanitizePreamp(parsed.preamp),
    name: typeof parsed.name === 'string' ? parsed.name.slice(0, 100) : 'Imported Preset',
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
