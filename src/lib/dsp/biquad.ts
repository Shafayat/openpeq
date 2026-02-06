import type { BiquadCoefficients, FilterType } from '../../types/eq';
import { SAMPLE_RATE } from '../../types/eq';

/**
 * Compute biquad IIR filter coefficients using Audio EQ Cookbook formulas.
 * Reference: https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html
 */
export function computeBiquadCoefficients(
  freq: number,
  gain: number,
  q: number,
  type: FilterType,
  sampleRate: number = SAMPLE_RATE
): BiquadCoefficients {
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const A = Math.pow(10, gain / 40); // = sqrt(10^(gain/20))
  const alpha = sinW0 / (2 * q);

  let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;

  switch (type) {
    case 'PK': {
      b0 = 1 + alpha * A;
      b1 = -2 * cosW0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosW0;
      a2 = 1 - alpha / A;
      break;
    }
    case 'LSQ': {
      const sqrtA = Math.sqrt(A);
      const twoSqrtAAlpha = 2 * sqrtA * alpha;
      b0 = A * ((A + 1) - (A - 1) * cosW0 + twoSqrtAAlpha);
      b1 = 2 * A * ((A - 1) - (A + 1) * cosW0);
      b2 = A * ((A + 1) - (A - 1) * cosW0 - twoSqrtAAlpha);
      a0 = (A + 1) + (A - 1) * cosW0 + twoSqrtAAlpha;
      a1 = -2 * ((A - 1) + (A + 1) * cosW0);
      a2 = (A + 1) + (A - 1) * cosW0 - twoSqrtAAlpha;
      break;
    }
    case 'HSQ': {
      const sqrtA = Math.sqrt(A);
      const twoSqrtAAlpha = 2 * sqrtA * alpha;
      b0 = A * ((A + 1) + (A - 1) * cosW0 + twoSqrtAAlpha);
      b1 = -2 * A * ((A - 1) + (A + 1) * cosW0);
      b2 = A * ((A + 1) + (A - 1) * cosW0 - twoSqrtAAlpha);
      a0 = (A + 1) - (A - 1) * cosW0 + twoSqrtAAlpha;
      a1 = 2 * ((A - 1) - (A + 1) * cosW0);
      a2 = (A + 1) - (A - 1) * cosW0 - twoSqrtAAlpha;
      break;
    }
  }

  // Normalize by a0
  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/**
 * Compute IIR coefficients for the Walkplay protocol.
 * Uses the same peaking formula as walkplayHidHandler.js computeIIRFilter.
 * Returns 20 bytes (5 x 32-bit LE integers) packed as Uint8Array.
 *
 * The walkplay protocol sends: [b0, b1, b2, -a1, -a2] as 30-bit fixed-point.
 * For PK filters this uses the same formula as the original handler.
 * For LSQ/HSQ we use the Audio EQ Cookbook formulas.
 */
export function computeIIRBytes(
  freq: number,
  gain: number,
  q: number,
  type: FilterType = 'PK'
): Uint8Array {
  const coeffs = computeBiquadCoefficients(freq, gain, q, type);

  // Quantize to 30-bit fixed-point (multiply by 2^30 = 1073741824)
  const SCALE = 1073741824;
  const quantized = [
    Math.round(coeffs.b0 * SCALE),
    Math.round(coeffs.b1 * SCALE),
    Math.round(coeffs.b2 * SCALE),
    Math.round(-coeffs.a1 * SCALE), // Note: negated a1
    Math.round(-coeffs.a2 * SCALE), // Note: negated a2
  ];

  // Pack as 5 x 32-bit little-endian integers (20 bytes total)
  const bytes = new Uint8Array(20);
  for (let i = 0; i < 5; i++) {
    const value = quantized[i];
    bytes[i * 4 + 0] = value & 0xff;
    bytes[i * 4 + 1] = (value >> 8) & 0xff;
    bytes[i * 4 + 2] = (value >> 16) & 0xff;
    bytes[i * 4 + 3] = (value >> 24) & 0xff;
  }

  return bytes;
}
