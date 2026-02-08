import { useEQStore } from '../../store/eq-store';
import { BandRow } from './BandRow';
import { PreampSlider } from './PreampSlider';

export function BandControls() {
  const bands = useEQStore(s => s.bands);
  const resetFlat = useEQStore(s => s.resetFlat);
  const undo = useEQStore(s => s.undo);
  const redo = useEQStore(s => s.redo);
  const canUndo = useEQStore(s => s.canUndo);
  const canRedo = useEQStore(s => s.canRedo);
  const toggleAB = useEQStore(s => s.toggleAB);
  const snapshotBands = useEQStore(s => s.snapshotBands);
  const isComparing = useEQStore(s => s.isComparing);
  const eqEnabled = useEQStore(s => s.eqEnabled);
  const toggleEQ = useEQStore(s => s.toggleEQ);

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* EQ On/Off */}
          <button
            onClick={toggleEQ}
            className={`p-1.5 rounded-md border transition-all ${
              eqEnabled
                ? 'bg-success/20 text-success border-success/40 shadow-[0_0_8px_rgba(34,197,94,0.15)]'
                : 'bg-danger/20 text-danger border-danger/40 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
            }`}
            title={eqEnabled ? 'Disable EQ (bypass)' : 'Enable EQ'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Parametric EQ
          </h2>
          {!eqEnabled && (
            <span className="text-[10px] font-medium text-danger/60 uppercase">Bypassed</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 text-text-muted border border-border rounded-md hover:border-border-focus hover:text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.69 3L3 13" />
            </svg>
          </button>
          {/* Redo */}
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 text-text-muted border border-border rounded-md hover:border-border-focus hover:text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.69 3L21 13" />
            </svg>
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* A/B Compare */}
          <button
            onClick={toggleAB}
            className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-all ${
              snapshotBands
                ? isComparing
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-accent/20 text-accent border-accent/40'
                : 'text-text-muted border-border hover:border-border-focus hover:text-text-secondary'
            }`}
            title={snapshotBands ? 'Toggle A/B compare (Space)' : 'Capture snapshot for A/B compare (Space)'}
          >
            {!snapshotBands ? 'A/B' : isComparing ? 'A' : 'B'}
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Reset Flat */}
          <button
            onClick={resetFlat}
            className="px-3 py-1 text-xs font-medium text-text-muted border border-border rounded-md hover:border-border-focus hover:text-text-secondary transition-colors"
          >
            Reset Flat
          </button>
        </div>
      </div>

      <div className={`flex flex-col gap-3 transition-opacity ${!eqEnabled ? 'opacity-40' : ''}`}>
        {/* Column headers */}
        <div className="flex items-center gap-3 px-3 text-[10px] uppercase tracking-wider text-text-muted font-medium">
          <span className="w-7 text-center">#</span>
          <span className="w-12">Type</span>
          <span className="w-[72px]">Freq</span>
          <span className="flex-1">Gain</span>
          <span className="w-[56px] text-center">Q</span>
        </div>

        {/* Band rows */}
        <div className="flex flex-col gap-1 overflow-y-auto pr-1">
          {bands.map((band, i) => (
            <BandRow key={i} band={band} index={i} />
          ))}
        </div>

        {/* Preamp */}
        <PreampSlider />

        {/* Keyboard shortcuts hint */}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 px-3 text-[9px] text-text-muted/50">
          <span>Ctrl+Z Undo</span>
          <span>Ctrl+Shift+Z Redo</span>
          <span>Space A/B</span>
          <span>Ctrl+S Save</span>
        </div>
      </div>
    </div>
  );
}
