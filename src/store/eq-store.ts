import { create } from 'zustand';
import type { Band, DeviceState, Preset, FilterType } from '../types/eq';
import { DEFAULT_BANDS, MIN_FREQ, MAX_FREQ, MIN_GAIN, MAX_GAIN, MIN_Q, MAX_Q } from '../types/eq';
import { clamp, generateId, roundTo } from '../utils/math';
import type { ConnectedDevice } from '../lib/usb/hid-connection';
import { connectToDevice, disconnectFromDevice } from '../lib/usb/hid-connection';
import { pullFiltersFromDevice, pushFiltersToDevice, saveToDeviceFlash } from '../lib/usb/walkplay-protocol';
import { loadPresets, savePresets } from '../lib/presets/storage';

// ── Types ──────────────────────────────────────────────────────────────

type DbRange = 10 | 20 | 30;

interface HistoryEntry {
  bands: Band[];
  preamp: number;
}

interface EQStore {
  // EQ State
  bands: Band[];
  preamp: number;
  autoPreamp: boolean;

  // Device State
  device: DeviceState;
  connectedDevice: ConnectedDevice | null;

  // Preset State
  presets: Preset[];
  activePresetId: string | null;

  // Dirty tracking (unsaved changes)
  isDirty: boolean;

  // EQ bypass
  eqEnabled: boolean;

  // Undo/Redo
  pastStates: HistoryEntry[];
  futureStates: HistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;

  // A/B Compare
  snapshotBands: Band[] | null;
  snapshotPreamp: number;
  isComparing: boolean;

  // Graph Settings
  graphDbRange: DbRange;

  // EQ Actions
  setBandParam: (index: number, param: 'freq' | 'gain' | 'q', value: number) => void;
  setBandType: (index: number, type: FilterType) => void;
  toggleBand: (index: number) => void;
  setPreamp: (value: number) => void;
  setAutoPreamp: (enabled: boolean) => void;
  resetFlat: () => void;
  setBands: (bands: Band[], preamp?: number) => void;
  toggleEQ: () => void;

  // Undo/Redo Actions
  undo: () => void;
  redo: () => void;

  // A/B Compare Actions
  toggleAB: () => void;

  // Graph Actions
  setGraphDbRange: (range: DbRange) => void;

  // Device Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  pullFromDevice: () => Promise<void>;
  saveToDevice: () => Promise<void>;

  // Preset Actions
  loadPreset: (id: string) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (id: string, name: string) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

function calculateAutoPreamp(bands: Band[]): number {
  let maxGain = 0;
  for (const band of bands) {
    if (band.enabled && band.gain > maxGain) {
      maxGain = band.gain;
    }
  }
  return maxGain > 0 ? roundTo(-maxGain, 1) : 0;
}

function cloneBands(bands: Band[]): Band[] {
  return bands.map(b => ({ ...b }));
}

function pushHistory(state: EQStore): Partial<EQStore> {
  const entry: HistoryEntry = { bands: cloneBands(state.bands), preamp: state.preamp };
  const past = [...state.pastStates, entry].slice(-MAX_HISTORY);
  return { pastStates: past, futureStates: [], canUndo: true, canRedo: false };
}

// ── Store ───────────────────────────────────────────────────────────────

export const useEQStore = create<EQStore>((set, get) => ({
  bands: DEFAULT_BANDS.map(b => ({ ...b })),
  preamp: 0,
  autoPreamp: true,
  device: {
    status: 'disconnected',
    model: null,
    manufacturer: null,
    firmwareVersion: null,
    currentSlot: -1,
    errorMessage: null,
  },
  connectedDevice: null,
  presets: loadPresets(),
  activePresetId: null,
  isDirty: false,
  eqEnabled: true,

  // Undo/Redo
  pastStates: [],
  futureStates: [],
  canUndo: false,
  canRedo: false,

  // A/B Compare
  snapshotBands: null,
  snapshotPreamp: 0,
  isComparing: false,

  // Graph
  graphDbRange: 20,

  // ── EQ Mutations (all push history first) ──

  setBandParam: (index, param, value) => {
    set(state => {
      const hist = pushHistory(state);
      const bands = state.bands.map((b, i) => {
        if (i !== index) return b;
        const updated = { ...b };
        switch (param) {
          case 'freq':
            updated.freq = clamp(Math.round(value), MIN_FREQ, MAX_FREQ);
            break;
          case 'gain':
            updated.gain = clamp(roundTo(value, 1), MIN_GAIN, MAX_GAIN);
            break;
          case 'q':
            updated.q = clamp(roundTo(value, 2), MIN_Q, MAX_Q);
            break;
        }
        return updated;
      });
      const preamp = state.autoPreamp ? calculateAutoPreamp(bands) : state.preamp;
      return { ...hist, bands, preamp, isDirty: true, activePresetId: null };
    });
  },

  setBandType: (index, type) => {
    set(state => ({
      ...pushHistory(state),
      bands: state.bands.map((b, i) => i === index ? { ...b, type } : b),
      isDirty: true,
      activePresetId: null,
    }));
  },

  toggleBand: (index) => {
    set(state => {
      const hist = pushHistory(state);
      const bands = state.bands.map((b, i) =>
        i === index ? { ...b, enabled: !b.enabled } : b
      );
      const preamp = state.autoPreamp ? calculateAutoPreamp(bands) : state.preamp;
      return { ...hist, bands, preamp, isDirty: true, activePresetId: null };
    });
  },

  setPreamp: (value) => {
    set(state => ({
      ...pushHistory(state),
      preamp: clamp(roundTo(value, 1), -20, 20),
      autoPreamp: false,
      isDirty: true,
    }));
  },

  setAutoPreamp: (enabled) => {
    set(state => ({
      autoPreamp: enabled,
      preamp: enabled ? calculateAutoPreamp(state.bands) : state.preamp,
    }));
  },

  resetFlat: () => {
    set(state => {
      const hist = pushHistory(state);
      const bands = DEFAULT_BANDS.map(b => ({ ...b }));
      return { ...hist, bands, preamp: 0, autoPreamp: true, isDirty: true, activePresetId: null };
    });
  },

  setBands: (bands, preamp) => {
    set(state => ({
      ...pushHistory(state),
      bands,
      preamp: preamp ?? (state.autoPreamp ? calculateAutoPreamp(bands) : state.preamp),
      isDirty: true,
      activePresetId: null,
    }));
  },

  toggleEQ: () => {
    const state = get();
    const newEnabled = !state.eqEnabled;
    set({ eqEnabled: newEnabled });

    // Push bypass/restore to connected device
    if (state.connectedDevice && state.device.status === 'connected') {
      const bandsToSend = newEnabled
        ? state.bands
        : state.bands.map(b => ({ ...b, gain: 0 }));
      const preampToSend = newEnabled ? state.preamp : 0;
      pushFiltersToDevice(
        state.connectedDevice.rawDevice,
        bandsToSend,
        state.connectedDevice.currentSlot,
        preampToSend,
      ).catch(() => { /* best-effort */ });
    }
  },

  // ── Undo / Redo ──

  undo: () => {
    set(state => {
      if (state.pastStates.length === 0) return state;
      const past = [...state.pastStates];
      const entry = past.pop()!;
      const future = [{ bands: cloneBands(state.bands), preamp: state.preamp }, ...state.futureStates].slice(0, MAX_HISTORY);
      return {
        pastStates: past,
        futureStates: future,
        bands: cloneBands(entry.bands),
        preamp: entry.preamp,
        canUndo: past.length > 0,
        canRedo: true,
        isDirty: true,
        activePresetId: null,
      };
    });
  },

  redo: () => {
    set(state => {
      if (state.futureStates.length === 0) return state;
      const future = [...state.futureStates];
      const entry = future.shift()!;
      const past = [...state.pastStates, { bands: cloneBands(state.bands), preamp: state.preamp }].slice(-MAX_HISTORY);
      return {
        pastStates: past,
        futureStates: future,
        bands: cloneBands(entry.bands),
        preamp: entry.preamp,
        canUndo: true,
        canRedo: future.length > 0,
        isDirty: true,
        activePresetId: null,
      };
    });
  },

  // ── A/B Compare ──

  toggleAB: () => {
    set(state => {
      if (!state.snapshotBands) {
        // First press: take snapshot of current state (this is A), user continues editing (becomes B)
        return {
          snapshotBands: cloneBands(state.bands),
          snapshotPreamp: state.preamp,
          isComparing: false,
        };
      }
      // Subsequent presses: swap current with snapshot
      const currentBands = cloneBands(state.bands);
      const currentPreamp = state.preamp;
      return {
        bands: cloneBands(state.snapshotBands),
        preamp: state.snapshotPreamp,
        snapshotBands: currentBands,
        snapshotPreamp: currentPreamp,
        isComparing: !state.isComparing,
      };
    });
  },

  // ── Graph ──

  setGraphDbRange: (range) => {
    set({ graphDbRange: range });
  },

  // ── Device ──

  connect: async () => {
    set(state => ({
      device: { ...state.device, status: 'connecting', errorMessage: null },
    }));

    try {
      const connected = await connectToDevice();
      set({
        connectedDevice: connected,
        device: {
          status: 'connected',
          model: connected.model,
          manufacturer: connected.manufacturer,
          firmwareVersion: connected.firmwareVersion,
          currentSlot: connected.currentSlot,
          errorMessage: null,
        },
      });
    } catch (err) {
      set(state => ({
        device: {
          ...state.device,
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Connection failed',
        },
      }));
    }
  },

  disconnect: async () => {
    const { connectedDevice } = get();
    if (connectedDevice) {
      try {
        await disconnectFromDevice(connectedDevice.rawDevice);
      } catch {
        // Ignore disconnect errors
      }
    }
    set({
      connectedDevice: null,
      device: {
        status: 'disconnected',
        model: null,
        manufacturer: null,
        firmwareVersion: null,
        currentSlot: -1,
        errorMessage: null,
      },
    });
  },

  pullFromDevice: async () => {
    const { connectedDevice } = get();
    if (!connectedDevice) return;

    try {
      const result = await pullFiltersFromDevice(connectedDevice.rawDevice);
      set(state => ({
        ...pushHistory(state),
        bands: result.filters,
        preamp: result.globalGain,
        isDirty: false,
        activePresetId: null,
      }));
    } catch (err) {
      if (err instanceof Error && err.message === 'Device is busy') return;
      set(state => ({
        device: {
          ...state.device,
          errorMessage: err instanceof Error ? err.message : 'Pull failed',
        },
      }));
    }
  },

  saveToDevice: async () => {
    const { connectedDevice, bands, preamp } = get();
    if (!connectedDevice) return;

    try {
      await saveToDeviceFlash(connectedDevice.rawDevice, bands, connectedDevice.currentSlot, preamp);
      set({ isDirty: false });
    } catch (err) {
      if (err instanceof Error && err.message === 'Device is busy') return;
      set(state => ({
        device: {
          ...state.device,
          errorMessage: err instanceof Error ? err.message : 'Save failed',
        },
      }));
    }
  },

  // ── Presets ──

  loadPreset: (id) => {
    const preset = get().presets.find(p => p.id === id);
    if (!preset) return;
    set(state => ({
      ...pushHistory(state),
      bands: preset.bands.map(b => ({ ...b })),
      preamp: preset.preamp,
      autoPreamp: false,
      activePresetId: id,
      isDirty: true,
    }));
  },

  savePreset: (name) => {
    const { bands, preamp, presets } = get();
    const newPreset: Preset = {
      id: generateId(),
      name,
      bands: bands.map(b => ({ ...b })),
      preamp,
      createdAt: Date.now(),
    };
    const updated = [...presets, newPreset];
    savePresets(updated);
    set({ presets: updated, activePresetId: newPreset.id });
  },

  deletePreset: (id) => {
    const updated = get().presets.filter(p => p.id !== id);
    savePresets(updated);
    set(state => ({
      presets: updated,
      activePresetId: state.activePresetId === id ? null : state.activePresetId,
    }));
  },

  renamePreset: (id, name) => {
    const updated = get().presets.map(p => p.id === id ? { ...p, name } : p);
    savePresets(updated);
    set({ presets: updated });
  },
}));
