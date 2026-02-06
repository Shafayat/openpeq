import { useEQStore } from '../../store/eq-store';

export function DeviceInfo() {
  const device = useEQStore(s => s.device);

  if (device.status !== 'connected') return null;

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex justify-between">
        <span className="text-text-muted">Model</span>
        <span className="text-text-primary font-medium">{device.model}</span>
      </div>
      {device.firmwareVersion && (
        <div className="flex justify-between">
          <span className="text-text-muted">Firmware</span>
          <span className="text-text-primary font-mono">{device.firmwareVersion}</span>
        </div>
      )}
    </div>
  );
}
