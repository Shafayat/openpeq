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

  // Electron: auto-connect on mount + poll for new devices when disconnected
  useEffect(() => {
    if (!isElectron) return;

    // Try immediately on mount
    autoConnectRef.current();

    if (!connectedDevice) {
      // No device yet — poll every 3s until one appears
      const interval = setInterval(() => {
        autoConnectRef.current();
      }, 3000);
      return () => clearInterval(interval);
    }
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
