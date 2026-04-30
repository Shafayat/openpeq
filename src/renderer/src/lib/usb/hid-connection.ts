import { WALKPLAY_VENDOR_IDS } from './constants';
import { readFirmwareVersion, readCurrentSlot } from './walkplay-protocol';

export interface ConnectedDevice {
  rawDevice: HIDDevice;
  model: string;
  manufacturer: string;
  firmwareVersion: string;
  currentSlot: number;
}

/** Check if WebHID API is available */
export function isWebHIDSupported(): boolean {
  return 'hid' in navigator;
}

/** Request and connect to a Protocol Max device */
export async function connectToDevice(): Promise<ConnectedDevice> {
  if (!isWebHIDSupported()) {
    throw new Error('WebHID is not supported in this browser. Please use Chrome or Edge.');
  }

  const filters = WALKPLAY_VENDOR_IDS.map(vendorId => ({ vendorId }));
  const devices = await navigator.hid.requestDevice({ filters });

  if (devices.length === 0) {
    throw new Error('No device selected. Please try again.');
  }

  const rawDevice = devices[0];

  if (!rawDevice.opened) {
    await rawDevice.open();
  }

  let firmwareVersion = 'Unknown';
  try {
    firmwareVersion = await readFirmwareVersion(rawDevice);
  } catch {
    // Firmware read may fail on some devices
  }

  let currentSlot = -1;
  try {
    currentSlot = await readCurrentSlot(rawDevice);
  } catch {
    // Slot read may fail
  }

  return {
    rawDevice,
    model: rawDevice.productName || 'Unknown Device',
    manufacturer: 'CrinEar',
    firmwareVersion,
    currentSlot,
  };
}

/** Disconnect from the device */
export async function disconnectFromDevice(device: HIDDevice): Promise<void> {
  if (device.opened) {
    await device.close();
  }
}

// Guard against concurrent auto-connect attempts
let autoConnectInFlight = false;

/**
 * Try to auto-connect to an already-paired device (no user gesture needed).
 * Uses navigator.hid.getDevices() which returns previously authorized devices.
 *
 * In Electron, if no previously-paired device is found, falls back to
 * requestDevice() which is silently auto-selected by the main process's
 * select-hid-device handler (no picker dialog shown).
 *
 * Returns null if no matching device is found.
 */
export async function tryAutoConnect(useRequestFallback = false): Promise<ConnectedDevice | null> {
  if (!isWebHIDSupported()) return null;
  if (autoConnectInFlight) return null;

  autoConnectInFlight = true;
  try {
    // First try previously authorized devices (no user gesture required)
    const devices = await navigator.hid.getDevices();
    let match = devices.find(d => WALKPLAY_VENDOR_IDS.includes(d.vendorId));

    // In Electron, the main process auto-selects the device so requestDevice()
    // won't show a picker — safe to call without a user gesture.
    if (!match && useRequestFallback) {
      try {
        const filters = WALKPLAY_VENDOR_IDS.map(vendorId => ({ vendorId }));
        const requested = await navigator.hid.requestDevice({ filters });
        match = requested[0] ?? null;
      } catch {
        // requestDevice may fail if no device is plugged in — that's fine
      }
    }

    if (!match) return null;

    if (!match.opened) {
      await match.open();
    }

    let firmwareVersion = 'Unknown';
    try {
      firmwareVersion = await readFirmwareVersion(match);
    } catch {
      // Firmware read may fail on some devices
    }

    let currentSlot = -1;
    try {
      currentSlot = await readCurrentSlot(match);
    } catch {
      // Slot read may fail
    }

    return {
      rawDevice: match,
      model: match.productName || 'Unknown Device',
      manufacturer: 'CrinEar',
      firmwareVersion,
      currentSlot,
    };
  } catch {
    return null;
  } finally {
    autoConnectInFlight = false;
  }
}

/**
 * Check if a device is still connected.
 * Uses both getDevices() and the device's opened state for reliability —
 * in Electron, getDevices() may not always list devices authorized via requestDevice().
 */
export async function checkDeviceConnected(device: HIDDevice): Promise<boolean> {
  // If the device handle itself reports closed, it's definitely gone
  if (!device.opened) return false;

  try {
    const devices = await navigator.hid.getDevices();
    const foundInList = devices.some(
      d => d.vendorId === device.vendorId && d.productId === device.productId
    );
    // Trust the device list if it finds the device.
    // If not found but device.opened is still true, trust the handle —
    // Electron may not list devices authorized via requestDevice().
    return foundInList || device.opened;
  } catch {
    return false;
  }
}
