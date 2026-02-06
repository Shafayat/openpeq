import { useEQStore } from '../../store/eq-store';

export function Header() {
  const device = useEQStore(s => s.device);
  const isDirty = useEQStore(s => s.isDirty);
  const isConnected = device.status === 'connected';

  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h4l3-9 4 18 3-9h4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">
            OpenPEQ
            {isDirty && (
              <span className="ml-1.5 text-xs font-normal text-amber-400/70" title="Unsaved changes">*</span>
            )}
          </h1>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">USB Parametric EQ Configurator</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <span className="text-xs font-medium text-success">
              {device.model}
            </span>
            {device.firmwareVersion && device.firmwareVersion !== 'Unknown' && (
              <span className="text-[10px] text-success/60">
                v{device.firmwareVersion}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
