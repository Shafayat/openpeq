export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Convert frequency to log-scale position (0-1) within min-max range */
export function freqToLogPosition(freq: number, minFreq: number, maxFreq: number): number {
  return (Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq));
}

/** Convert log-scale position (0-1) back to frequency */
export function logPositionToFreq(position: number, minFreq: number, maxFreq: number): number {
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);
  return Math.pow(10, logMin + position * (logMax - logMin));
}

/** Convert gain (dB) to linear position (0-1) within min-max range */
export function gainToPosition(gain: number, minGain: number, maxGain: number): number {
  return 1 - (gain - minGain) / (maxGain - minGain);
}

/** Convert position (0-1) to gain (dB) */
export function positionToGain(position: number, minGain: number, maxGain: number): number {
  return maxGain - position * (maxGain - minGain);
}

/** Generate logarithmically spaced frequency points */
export function logSpace(start: number, end: number, count: number): number[] {
  const logStart = Math.log10(start);
  const logEnd = Math.log10(end);
  const step = (logEnd - logStart) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.pow(10, logStart + i * step));
}

/** Round to a specific number of decimal places */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Format frequency for display */
export function formatFreq(freq: number): string {
  if (freq >= 1000) {
    const kHz = freq / 1000;
    return kHz % 1 === 0 ? `${kHz}k` : `${kHz.toFixed(1)}k`;
  }
  return freq % 1 === 0 ? `${freq}` : freq.toFixed(1);
}

/** Format gain for display */
export function formatGain(gain: number): string {
  const sign = gain > 0 ? '+' : '';
  return `${sign}${gain.toFixed(1)}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
