import { useMemo } from 'react';
import type { Band } from '../../types/eq';
import { MIN_FREQ, MAX_FREQ } from '../../types/eq';
import { computeCompositeResponse, getFrequencyPoints } from '../../lib/dsp/frequency-response';
import { freqToLogPosition } from '../../utils/math';

interface Props {
  bands: Band[];
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  dbRange: number;
  isSnapshot?: boolean;
}

export function CompositeCurve({ bands, width, height, padding, dbRange, isSnapshot = false }: Props) {
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const { pathD, fillD } = useMemo(() => {
    const GRAPH_MIN_GAIN = -dbRange;
    const GRAPH_MAX_GAIN = dbRange;
    const response = computeCompositeResponse(bands);
    const freqs = getFrequencyPoints();
    const zeroY = padding.top + (1 - (0 - GRAPH_MIN_GAIN) / (GRAPH_MAX_GAIN - GRAPH_MIN_GAIN)) * plotH;

    const points = freqs.map((f, i) => {
      const x = padding.left + freqToLogPosition(f, MIN_FREQ, MAX_FREQ) * plotW;
      const dbClamped = Math.max(GRAPH_MIN_GAIN, Math.min(GRAPH_MAX_GAIN, response[i]));
      const y = padding.top + (1 - (dbClamped - GRAPH_MIN_GAIN) / (GRAPH_MAX_GAIN - GRAPH_MIN_GAIN)) * plotH;
      return { x, y };
    });

    const pathD = `M${points.map(p => `${p.x},${p.y}`).join('L')}`;
    const fillD = `M${points[0].x},${zeroY}L${points.map(p => `${p.x},${p.y}`).join('L')}L${points[points.length - 1].x},${zeroY}Z`;

    return { pathD, fillD };
  }, [bands, plotW, plotH, padding, dbRange]);

  if (isSnapshot) {
    return (
      <g opacity={0.4}>
        <path
          d={fillD}
          fill="url(#snapshotGradient)"
          opacity={0.1}
        />
        <path
          d={pathD}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeDasharray="6 4"
        />
      </g>
    );
  }

  return (
    <g>
      {/* Fill under curve */}
      <path
        d={fillD}
        fill="url(#compositeGradient)"
        opacity={0.15}
      />
      {/* Stroke */}
      <path
        d={pathD}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeLinejoin="round"
        filter="url(#glow)"
      />
    </g>
  );
}
