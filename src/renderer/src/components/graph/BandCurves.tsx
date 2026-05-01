import { useMemo } from 'react';
import type { Band } from '../../types/eq';
import { BAND_COLORS, MIN_FREQ, MAX_FREQ } from '../../types/eq';
import { computeBandResponse, getFrequencyPoints } from '../../lib/dsp/frequency-response';
import { freqToLogPosition } from '../../utils/math';

interface Props {
  bands: Band[];
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  dbRange: number;
}

export function BandCurves({ bands, width, height, padding, dbRange }: Props) {
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const paths = useMemo(() => {
    const GRAPH_MIN_GAIN = -dbRange;
    const GRAPH_MAX_GAIN = dbRange;
    const freqs = getFrequencyPoints();

    return bands.map((band, i) => {
      if (!band.enabled || band.gain === 0) return null;

      const response = computeBandResponse(band);
      const points = freqs.map((f, j) => {
        const x = padding.left + freqToLogPosition(f, MIN_FREQ, MAX_FREQ) * plotW;
        const dbClamped = Math.max(GRAPH_MIN_GAIN, Math.min(GRAPH_MAX_GAIN, response[j]));
        const y = padding.top + (1 - (dbClamped - GRAPH_MIN_GAIN) / (GRAPH_MAX_GAIN - GRAPH_MIN_GAIN)) * plotH;
        return `${x},${y}`;
      });

      return { d: `M${points.join('L')}`, color: BAND_COLORS[i] };
    });
  }, [bands, plotW, plotH, padding, dbRange]);

  return (
    <g>
      {paths.map((path, i) =>
        path ? (
          <path
            key={i}
            d={path.d}
            fill="none"
            stroke={path.color}
            strokeWidth={1.2}
            strokeLinejoin="round"
            opacity={0.35}
          />
        ) : null,
      )}
    </g>
  );
}
