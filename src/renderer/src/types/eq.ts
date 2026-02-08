export type FilterType = 'PK' | 'LSQ' | 'HSQ';

export interface Band {
  freq: number;      // 20-20000 Hz
  gain: number;      // -10 to +10 dB
  q: number;         // 0.1 to 30
  type: FilterType;
  enabled: boolean;
}

export interface Preset {
  id: string;
  name: string;
  bands: Band[];
  preamp: number;
  createdAt: number;
}

export interface DeviceState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  model: string | null;
  manufacturer: string | null;
  firmwareVersion: string | null;
  currentSlot: number;
  errorMessage: string | null;
}

export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export const BAND_COLORS = [
  '#ef4444', // 1 red
  '#f97316', // 2 orange
  '#eab308', // 3 yellow
  '#84cc16', // 4 lime
  '#22c55e', // 5 green
  '#14b8a6', // 6 teal
  '#06b6d4', // 7 cyan
  '#3b82f6', // 8 blue
  '#8b5cf6', // 9 violet
  '#ec4899', // 10 pink
] as const;

export const DEFAULT_BANDS: Band[] = [
  { freq: 31,    gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 62,    gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 125,   gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 250,   gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 500,   gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 1000,  gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 2000,  gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 4000,  gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 8000,  gain: 0, q: 1.41, type: 'PK', enabled: true },
  { freq: 16000, gain: 0, q: 1.41, type: 'PK', enabled: true },
];

export const MIN_FREQ = 20;
export const MAX_FREQ = 20000;
export const MIN_GAIN = -10;
export const MAX_GAIN = 10;
export const MIN_Q = 0.1;
export const MAX_Q = 30;
export const MAX_FILTERS = 10;
export const SAMPLE_RATE = 96000;
