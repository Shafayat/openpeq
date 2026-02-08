import { useEQStore } from '../../store/eq-store';
import { formatGain } from '../../utils/math';

export function PreampSlider() {
  const preamp = useEQStore(s => s.preamp);
  const autoPreamp = useEQStore(s => s.autoPreamp);
  const setPreamp = useEQStore(s => s.setPreamp);
  const setAutoPreamp = useEQStore(s => s.setAutoPreamp);

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-bg-card/40 rounded-lg mt-1">
      <span className="text-xs font-medium text-text-secondary w-14">Preamp</span>
      <input
        type="range"
        min={-20}
        max={10}
        step={0.1}
        value={preamp}
        onChange={e => setPreamp(parseFloat(e.target.value))}
        disabled={autoPreamp}
        className="flex-1 h-1 accent-accent rounded-full cursor-pointer disabled:opacity-40"
      />
      <span className="text-sm font-mono text-text-primary w-14 text-right">
        {formatGain(preamp)} dB
      </span>
      <label className="flex items-center gap-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={autoPreamp}
          onChange={e => setAutoPreamp(e.target.checked)}
          className="w-3.5 h-3.5 rounded accent-accent"
        />
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
          Auto
        </span>
      </label>
    </div>
  );
}
