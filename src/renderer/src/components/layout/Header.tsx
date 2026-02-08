import { useEQStore } from '../../store/eq-store';

export function Header() {
  const device = useEQStore(s => s.device);
  const isDirty = useEQStore(s => s.isDirty);
  const activePresetId = useEQStore(s => s.activePresetId);
  const presets = useEQStore(s => s.presets);
  const activeCommunityName = useEQStore(s => s.activeCommunityName);
  const activeCommunitySource = useEQStore(s => s.activeCommunitySource);
  const isConnected = device.status === 'connected';

  // Determine active EQ label
  const activePresetName = activePresetId
    ? presets.find(p => p.id === activePresetId)?.name ?? null
    : null;

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

        {/* Active EQ indicator */}
        {activeCommunityName && (
          <div className="flex items-center gap-1.5 ml-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs font-medium text-accent truncate max-w-[200px]">
              {activeCommunityName}
            </span>
            {activeCommunitySource && (
              <span className="text-[9px] text-accent/50">
                {activeCommunitySource}
              </span>
            )}
          </div>
        )}
        {activePresetName && !activeCommunityName && (
          <div className="flex items-center gap-1.5 ml-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs font-medium text-accent truncate max-w-[200px]">
              {activePresetName}
            </span>
          </div>
        )}
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
