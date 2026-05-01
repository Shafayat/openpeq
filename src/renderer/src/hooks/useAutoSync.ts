import { useEffect, useRef } from 'react';
import { useEQStore } from '../store/eq-store';
import { pushFiltersToDevice } from '../lib/usb/walkplay-protocol';

const DEBOUNCE_MS = 150;

/**
 * Automatically pushes EQ changes to the connected device with debouncing.
 * Writes to RAM only (not flash) so the user still controls persistence.
 */
export function useAutoSync() {
  const bands = useEQStore(s => s.bands);
  const preamp = useEQStore(s => s.preamp);
  const connectedDevice = useEQStore(s => s.connectedDevice);
  const eqEnabled = useEQStore(s => s.eqEnabled);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial mount — don't push default state on page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!connectedDevice) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const bandsToSend = eqEnabled
        ? bands
        : bands.map(b => ({ ...b, gain: 0 }));
      const preampToSend = eqEnabled ? preamp : 0;

      pushFiltersToDevice(
        connectedDevice.rawDevice,
        bandsToSend,
        connectedDevice.currentSlot,
        preampToSend,
      ).catch(() => { /* best-effort — device busy or disconnected */ });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [bands, preamp, connectedDevice, eqEnabled]);
}
