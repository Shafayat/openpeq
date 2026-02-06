import { useEffect } from 'react';
import { useEQStore } from '../store/eq-store';
import { checkDeviceConnected } from '../lib/usb/hid-connection';

/** Hook to manage device connection lifecycle and periodic health checks */
export function useDevice() {
  const connectedDevice = useEQStore(s => s.connectedDevice);
  const disconnect = useEQStore(s => s.disconnect);

  // Periodic check if device is still connected
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
