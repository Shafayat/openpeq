import type { Band, BiquadCoefficients } from '../../types/eq';
import { SAMPLE_RATE, MIN_FREQ, MAX_FREQ } from '../../types/eq';
import { computeBiquadCoefficients } from './biquad';
import { logSpace } from '../../utils/math';

const NUM_POINTS = 300;

/**
 * Evaluate the magnitude response (in dB) of a biquad filter at a given frequency.
 * Uses the transfer function H(z) = (b0 + b1*z^-1 + b2*z^-2) / (1 + a1*z^-1 + a2*z^-2)
 * evaluated at z = e^(jw) where w = 2*pi*f/fs
 */
export function evaluateBiquadAtFreq(
  coeffs: BiquadCoefficients,
  freq: number,
  sampleRate: number = SAMPLE_RATE
): number {
  const w = (2 * Math.PI * freq) / sampleRate;
  const cosW = Math.cos(w);
  const cos2W = Math.cos(2 * w);
  const sinW = Math.sin(w);
  const sin2W = Math.sin(2 * w);

  // Numerator: b0 + b1*e^(-jw) + b2*e^(-j2w)
  const numReal = coeffs.b0 + coeffs.b1 * cosW + coeffs.b2 * cos2W;
  const numImag = -(coeffs.b1 * sinW + coeffs.b2 * sin2W);

  // Denominator: 1 + a1*e^(-jw) + a2*e^(-j2w)
  const denReal = 1 + coeffs.a1 * cosW + coeffs.a2 * cos2W;
  const denImag = -(coeffs.a1 * sinW + coeffs.a2 * sin2W);

  // |H|^2 = (numReal^2 + numImag^2) / (denReal^2 + denImag^2)
  const numMagSq = numReal * numReal + numImag * numImag;
  const denMagSq = denReal * denReal + denImag * denImag;

  if (denMagSq === 0) return 0;

  // 10 * log10(|H|^2) = 20 * log10(|H|)
  return 10 * Math.log10(numMagSq / denMagSq);
}

/** Frequency points used for graph plotting (log-spaced) */
let cachedFrequencies: number[] | null = null;
export function getFrequencyPoints(): number[] {
  if (!cachedFrequencies) {
    cachedFrequencies = logSpace(MIN_FREQ, MAX_FREQ, NUM_POINTS);
  }
  return cachedFrequencies;
}

/** Compute the frequency response curve (dB values) for a single band */
export function computeBandResponse(band: Band): number[] {
  if (!band.enabled || band.gain === 0) {
    return new Array(NUM_POINTS).fill(0);
  }

  const coeffs = computeBiquadCoefficients(band.freq, band.gain, band.q, band.type);
  const freqs = getFrequencyPoints();
  return freqs.map(f => evaluateBiquadAtFreq(coeffs, f));
}

/** Compute the composite frequency response (sum of all band dB values) */
export function computeCompositeResponse(bands: Band[]): number[] {
  const freqs = getFrequencyPoints();
  const composite = new Array(freqs.length).fill(0);

  for (const band of bands) {
    if (!band.enabled || band.gain === 0) continue;
    const coeffs = computeBiquadCoefficients(band.freq, band.gain, band.q, band.type);
    for (let i = 0; i < freqs.length; i++) {
      composite[i] += evaluateBiquadAtFreq(coeffs, freqs[i]);
    }
  }

  return composite;
}
