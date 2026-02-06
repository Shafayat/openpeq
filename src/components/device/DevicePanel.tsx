import { useEQStore } from '../../store/eq-store';
import { isWebHIDSupported } from '../../lib/usb/hid-connection';
import { DeviceInfo } from './DeviceInfo';

export function DevicePanel() {
  const device = useEQStore(s => s.device);
  const isDirty = useEQStore(s => s.isDirty);
  const eqEnabled = useEQStore(s => s.eqEnabled);
  const connect = useEQStore(s => s.connect);
  const disconnect = useEQStore(s => s.disconnect);
  const pullFromDevice = useEQStore(s => s.pullFromDevice);
  const saveToDevice = useEQStore(s => s.saveToDevice);

  const isConnected = device.status === 'connected';
  const isConnecting = device.status === 'connecting';
  const webHIDSupported = isWebHIDSupported();

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
        Device
      </h2>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            isConnected
              ? 'bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]'
              : isConnecting
                ? 'bg-warning animate-pulse'
                : 'bg-text-muted'
          }`}
        />
        <span className="text-sm text-text-primary">
          {isConnected
            ? device.model || 'Connected'
            : isConnecting
              ? 'Connecting...'
              : 'Disconnected'}
        </span>
      </div>

      {/* Error message */}
      {device.errorMessage && (
        <div className="text-xs text-danger bg-danger/10 rounded-md px-3 py-2">
          {device.errorMessage}
        </div>
      )}

      {/* WebHID not supported warning */}
      {!webHIDSupported && (
        <div className="text-xs text-warning bg-warning/10 rounded-md px-3 py-2">
          WebHID is not supported in this browser. Use Chrome or Edge.
        </div>
      )}

      {/* Device info */}
      <DeviceInfo />

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isConnecting || !webHIDSupported}
            className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Device'}
          </button>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={pullFromDevice}
                disabled={!eqEnabled}
                className="px-3 py-2 bg-bg-input border border-border hover:border-accent text-text-primary text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border"
                title={eqEnabled ? 'Read current EQ from device' : 'Enable EQ first'}
              >
                Pull from Device
              </button>
              <button
                onClick={saveToDevice}
                disabled={!eqEnabled}
                className="px-3 py-2 bg-success/20 border border-success/30 hover:bg-success/30 text-success text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-success/20"
                title={eqEnabled ? 'Push EQ to device (Ctrl+S)' : 'Enable EQ first'}
              >
                Push to Device
                {isDirty && eqEnabled && <span className="ml-1 text-[10px] opacity-60">*</span>}
              </button>
            </div>

            <button
              onClick={disconnect}
              className="w-full px-3 py-1.5 text-xs text-text-muted hover:text-danger border border-transparent hover:border-danger/30 rounded-md transition-colors"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
