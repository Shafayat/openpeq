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

/**
 * Try to auto-connect to an already-paired device (no user gesture needed).
 * Uses navigator.hid.getDevices() which returns previously authorized devices.
 * Returns null if no matching device is found.
 */
export async function tryAutoConnect(): Promise<ConnectedDevice | null> {
  if (!isWebHIDSupported()) return null;

  try {
    const devices = await navigator.hid.getDevices();
    const match = devices.find(d => WALKPLAY_VENDOR_IDS.includes(d.vendorId));
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
  }
}

/** Check if a device is still connected */
export async function checkDeviceConnected(device: HIDDevice): Promise<boolean> {
  try {
    const devices = await navigator.hid.getDevices();
    return devices.some(
      d => d.vendorId === device.vendorId && d.productId === device.productId
    );
  } catch {
    return false;
  }
}
