import { useCallback } from 'react';
import type { Band, FilterType } from '../../types/eq';
import { BAND_COLORS, MIN_FREQ, MAX_FREQ, MIN_GAIN, MAX_GAIN, MIN_Q, MAX_Q } from '../../types/eq';
import { useEQStore } from '../../store/eq-store';
import { NumberInput } from './NumberInput';

interface Props {
  band: Band;
  index: number;
}

export function BandRow({ band, index }: Props) {
  const setBandParam = useEQStore(s => s.setBandParam);
  const setBandType = useEQStore(s => s.setBandType);
  const toggleBand = useEQStore(s => s.toggleBand);
  const color = BAND_COLORS[index];

  const handleFreqChange = useCallback((v: number) => setBandParam(index, 'freq', v), [index, setBandParam]);
  const handleGainChange = useCallback((v: number) => setBandParam(index, 'gain', v), [index, setBandParam]);
  const handleQChange = useCallback((v: number) => setBandParam(index, 'q', v), [index, setBandParam]);
  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setBandType(index, e.target.value as FilterType);
  }, [index, setBandType]);
  const handleToggle = useCallback(() => toggleBand(index), [index, toggleBand]);

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        band.enabled
          ? 'bg-bg-card/60 hover:bg-bg-card-hover/60'
          : 'bg-bg-card/20 opacity-50'
      }`}
    >
      {/* Band number + enable toggle */}
      <button
        onClick={handleToggle}
        className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all border-2"
        style={{
          borderColor: band.enabled ? color : 'transparent',
          backgroundColor: band.enabled ? `${color}20` : 'rgba(100,100,100,0.1)',
          color: band.enabled ? color : '#64748b',
        }}
        title={band.enabled ? `Disable band ${index + 1}` : `Enable band ${index + 1}`}
      >
        {index + 1}
      </button>

      {/* Filter type */}
      <select
        value={band.type}
        onChange={handleTypeChange}
        className="flex-shrink-0 w-12 bg-bg-input border border-border rounded-md px-1 py-1.5 text-xs text-text-primary focus:border-border-focus focus:outline-none transition-colors cursor-pointer"
      >
        <option value="PK">PK</option>
        <option value="LSQ">LS</option>
        <option value="HSQ">HS</option>
      </select>

      {/* Frequency */}
      <div className="flex-shrink-0 w-[72px]">
        <NumberInput
          value={band.freq}
          min={MIN_FREQ}
          max={MAX_FREQ}
          step={1}
          suffix="Hz"
          decimals={0}
          onChange={handleFreqChange}
        />
      </div>

      {/* Gain slider + number */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="range"
          min={MIN_GAIN}
          max={MAX_GAIN}
          step={0.1}
          value={band.gain}
          onChange={e => handleGainChange(parseFloat(e.target.value))}
          className="flex-1 h-1.5 accent-current rounded-full cursor-pointer"
          style={{ color }}
        />
        <div className="flex-shrink-0 w-[62px]">
          <NumberInput
            value={band.gain}
            min={MIN_GAIN}
            max={MAX_GAIN}
            step={0.1}
            suffix="dB"
            decimals={1}
            onChange={handleGainChange}
          />
        </div>
      </div>

      {/* Q number */}
      <div className="flex-shrink-0 w-[56px]">
        <NumberInput
          value={band.q}
          min={MIN_Q}
          max={MAX_Q}
          step={0.01}
          decimals={2}
          onChange={handleQChange}
        />
      </div>
    </div>
  );
}
