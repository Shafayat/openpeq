import { useMemo } from 'react';
import type { Band } from '../../types/eq';
import { MIN_FREQ, MAX_FREQ } from '../../types/eq';
import { computeBandResponse, getFrequencyPoints } from '../../lib/dsp/frequency-response';
import { freqToLogPosition } from '../../utils/math';

interface Props {
  band: Band;
  color: string;
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  dbRange: number;
}

export function BandCurve({ band, color, width, height, padding, dbRange }: Props) {
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const pathD = useMemo(() => {
    if (!band.enabled || band.gain === 0) return '';

    const GRAPH_MIN_GAIN = -dbRange;
    const GRAPH_MAX_GAIN = dbRange;
    const response = computeBandResponse(band);
    const freqs = getFrequencyPoints();

    const points = freqs.map((f, i) => {
      const x = padding.left + freqToLogPosition(f, MIN_FREQ, MAX_FREQ) * plotW;
      const dbClamped = Math.max(GRAPH_MIN_GAIN, Math.min(GRAPH_MAX_GAIN, response[i]));
      const y = padding.top + (1 - (dbClamped - GRAPH_MIN_GAIN) / (GRAPH_MAX_GAIN - GRAPH_MIN_GAIN)) * plotH;
      return `${x},${y}`;
    });

    return `M${points.join('L')}`;
  }, [band, plotW, plotH, padding, dbRange]);

  if (!pathD) return null;

  return (
    <path
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      opacity={0.5}
      strokeLinejoin="round"
    />
  );
}
