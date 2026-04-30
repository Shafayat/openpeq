import { useEffect, useRef } from 'react';
import { useEQStore } from '../store/eq-store';
import { checkDeviceConnected } from '../lib/usb/hid-connection';

const isElectron = !!window.electronAPI?.isElectron;

/** Hook to manage device connection lifecycle and periodic health checks */
export function useDevice() {
  const connectedDevice = useEQStore(s => s.connectedDevice);
  const disconnect = useEQStore(s => s.disconnect);
  const autoConnect = useEQStore(s => s.autoConnect);
  const autoConnectRef = useRef(autoConnect);
  autoConnectRef.current = autoConnect;

  // Electron: try requestDevice() once on mount to grant initial HID permission.
  // This only needs to happen once — after that, getDevices() will find the device.
  const hasTriedInitialConnect = useRef(false);
  useEffect(() => {
    if (!isElectron || hasTriedInitialConnect.current) return;
    hasTriedInitialConnect.current = true;
    // Pass true to use requestDevice() fallback for initial permission grant
    autoConnectRef.current(true);
  }, []);

  // Electron: poll for device when disconnected (uses getDevices() only, no requestDevice())
  useEffect(() => {
    if (!isElectron) return;
    if (connectedDevice) return; // Connected — no need to poll

    const interval = setInterval(() => {
      autoConnectRef.current();
    }, 3000);
    return () => clearInterval(interval);
  }, [connectedDevice]);

  // Health check: detect device unplug (both web and Electron)
  useEffect(() => {
    if (!connectedDevice) return;

    const interval = setInterval(async () => {
      const stillConnected = await checkDeviceConnected(connectedDevice.rawDevice);
      if (!stillConnected) {
        disconnect();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [connectedDevice, disconnect]);
}
