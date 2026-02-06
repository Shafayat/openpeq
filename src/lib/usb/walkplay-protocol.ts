import type { Band, FilterType } from '../../types/eq';
import { computeIIRBytes } from '../dsp/biquad';
import {
  REPORT_ID, READ, WRITE, END, CMD,
  FILTER_TYPE_TO_BYTE, BYTE_TO_FILTER_TYPE,
  PROTOCOL_MAX_CONFIG,
} from './constants';

// Mutex to prevent concurrent device operations from stomping each other
let deviceBusy = false;

async function withDeviceLock<T>(fn: () => Promise<T>): Promise<T> {
  if (deviceBusy) {
    throw new Error('Device is busy');
  }
  deviceBusy = true;
  try {
    return await fn();
  } finally {
    deviceBusy = false;
  }
}

export function isDeviceBusy(): boolean {
  return deviceBusy;
}

function toLittleEndian16(value: number): [number, number] {
  return [value & 0xff, (value >> 8) & 0xff];
}

function toSigned16FixedPoint(value: number, scale: number): [number, number] {
  let v = Math.round(value * scale);
  if (v < 0) v += 0x10000;
  return [v & 0xff, (v >> 8) & 0xff];
}

async function sendReport(device: HIDDevice, reportId: number, packet: number[]): Promise<void> {
  const data = new Uint8Array(packet);
  console.log(`[CrinEQ] sendReport(0x${reportId.toString(16)}):`, Array.from(data).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
  await device.sendReport(reportId, data);
}

function waitForResponse(device: HIDDevice, timeout = 2000): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      device.oninputreport = null;
      reject(new Error('Timeout waiting for HID response'));
    }, timeout);

    device.oninputreport = (event: HIDInputReportEvent) => {
      clearTimeout(timer);
      device.oninputreport = null;
      resolve(new Uint8Array(event.data.buffer));
    };
  });
}

/** Read firmware version from device */
export async function readFirmwareVersion(device: HIDDevice): Promise<string> {
  return withDeviceLock(async () => {
    await sendReport(device, REPORT_ID, [READ, CMD.VERSION, END]);
    const response = await waitForResponse(device);
    const versionBytes = response.slice(3, 6);
    return String.fromCharCode(...versionBytes);
  });
}

/** Read the current EQ slot from device */
export async function readCurrentSlot(device: HIDDevice): Promise<number> {
  return withDeviceLock(async () => {
    await sendReport(device, REPORT_ID, [READ, CMD.PEQ_VALUES, END]);
    const response = await waitForResponse(device);
    return response ? response[35] : -1;
  });
}

/** Parse a filter from a response packet */
function parseFilterPacket(packet: Uint8Array): {
  filterIndex: number;
  freq: number;
  q: number;
  gain: number;
  type: FilterType;
} {
  const filterIndex = packet[4];
  const freq = packet[27] | (packet[28] << 8);
  const qRaw = packet[29] | (packet[30] << 8);
  const q = Math.round((qRaw / 256) * 100) / 100;
  let gainRaw = packet[31] | (packet[32] << 8);
  if (gainRaw > 32767) gainRaw -= 65536;
  const gain = Math.round((gainRaw / 256) * 100) / 100;
  const typeVal = packet[33];
  const type = (BYTE_TO_FILTER_TYPE[typeVal] || 'PK') as FilterType;

  return { filterIndex, freq, q, gain, type };
}

/** Pull all PEQ filters from device */
export async function pullFiltersFromDevice(device: HIDDevice): Promise<{
  filters: Band[];
  globalGain: number;
}> {
  return withDeviceLock(async () => {
    const maxFilters = PROTOCOL_MAX_CONFIG.maxFilters;
    const filters: (Band | undefined)[] = new Array(maxFilters);
    let receivedCount = 0;

    // Collect filter responses
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        device.oninputreport = null;
        resolve();
      }, 10000);

      device.oninputreport = (event: HIDInputReportEvent) => {
        const data = new Uint8Array(event.data.buffer);
        if (data.length >= 32) {
          const parsed = parseFilterPacket(data);
          filters[parsed.filterIndex] = {
            freq: parsed.freq,
            gain: parsed.gain,
            q: parsed.q,
            type: parsed.type,
            enabled: parsed.gain !== 0 || parsed.freq !== 0,
          };
          receivedCount++;

          if (receivedCount >= maxFilters) {
            clearTimeout(timeout);
            device.oninputreport = null;
            resolve();
          }
        }
      };

      // Send requests (fire-and-forget within the promise, responses come via oninputreport)
      (async () => {
        for (let i = 0; i < maxFilters; i++) {
          await sendReport(device, REPORT_ID, [READ, CMD.PEQ_VALUES, 0x00, 0x00, i, END]);
          await delay(50);
        }
      })();
    });

    // Read global gain separately after filters are done
    let globalGain = 0;
    try {
      globalGain = await readGlobalGainInternal(device);
    } catch {
      // Default to 0 on failure
    }

    const result = filters.map((f) => f ?? {
      freq: 1000, gain: 0, q: 1.41, type: 'PK' as FilterType, enabled: true,
    });
    return { filters: result, globalGain };
  });
}

/** Internal: read global gain (must be called within device lock) */
async function readGlobalGainInternal(device: HIDDevice): Promise<number> {
  await sendReport(device, REPORT_ID, [READ, CMD.GLOBAL_GAIN, 0x00]);
  const response = await waitForResponse(device, 500);
  if (response[0] !== READ || response[1] !== CMD.GLOBAL_GAIN) {
    return 0;
  }
  const int8 = new Int8Array([response[4]])[0];
  return int8;
}

/** Build a complete PEQ filter packet for one band */
function buildFilterPacket(
  filterIndex: number,
  band: Band,
  slotId: number
): number[] {
  const iirBytes = computeIIRBytes(band.freq, band.enabled ? band.gain : 0, band.q, band.type);
  const freqBytes = toLittleEndian16(band.freq);
  const qBytes = toLittleEndian16(Math.round(band.q * 256));
  const gainBytes = toSigned16FixedPoint(band.enabled ? band.gain : 0, 256);
  const filterTypeByte = FILTER_TYPE_TO_BYTE[band.type] ?? 2;

  return [
    WRITE, CMD.PEQ_VALUES, 0x18, 0x00, filterIndex, 0x00, 0x00,
    ...iirBytes,
    ...freqBytes,
    ...qBytes,
    ...gainBytes,
    filterTypeByte,
    0x00,
    slotId,
    END,
  ];
}

/** Internal: write global gain / preamp (must be called within device lock) */
async function writeGlobalGainInternal(device: HIDDevice, gain: number): Promise<void> {
  // Clamp to signed int8 range (-128..127), device expects a single signed byte
  const clamped = Math.max(-128, Math.min(127, Math.round(gain)));
  const byte = clamped < 0 ? clamped + 256 : clamped;
  await sendReport(device, REPORT_ID, [WRITE, CMD.GLOBAL_GAIN, 0x01, 0x00, byte, END]);
  // Small delay to let the device process before next command
  await delay(50);
}

/** Internal push (must be called within device lock) */
async function pushFiltersInternal(
  device: HIDDevice,
  bands: Band[],
  slotId: number,
  preamp?: number
): Promise<void> {
  // Mute global gain before sending filters to avoid audible glitches
  // during the transition between old and new filter coefficients
  await writeGlobalGainInternal(device, -128);

  for (let i = 0; i < bands.length && i < PROTOCOL_MAX_CONFIG.maxFilters; i++) {
    const packet = buildFilterPacket(i, bands[i], slotId);
    await sendReport(device, REPORT_ID, packet);
  }

  // TEMP_WRITE to apply filter changes
  await sendReport(device, REPORT_ID, [WRITE, CMD.TEMP_WRITE, 0x04, 0x00, 0x00, 0xff, 0xff, END]);

  // Restore global gain (preamp) after TEMP_WRITE
  await delay(50);
  await writeGlobalGainInternal(device, preamp ?? 0);
}

/** Push filters to device (applies immediately, not persisted to flash) */
export async function pushFiltersToDevice(
  device: HIDDevice,
  bands: Band[],
  slotId: number,
  preamp?: number
): Promise<void> {
  return withDeviceLock(async () => {
    await pushFiltersInternal(device, bands, slotId, preamp);
  });
}

/** Save current EQ to device flash (persists across power cycles) */
export async function saveToDeviceFlash(
  device: HIDDevice,
  bands: Band[],
  slotId: number,
  preamp?: number
): Promise<void> {
  console.log(`[CrinEQ] saveToDeviceFlash: slotId=${slotId}, ${bands.length} bands, preamp=${preamp}`);
  return withDeviceLock(async () => {
    // Push the filters (including preamp)
    await pushFiltersInternal(device, bands, slotId, preamp);
    // Then commit to flash
    await sendReport(device, REPORT_ID, [WRITE, CMD.FLASH_EQ, 0x01, END]);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
