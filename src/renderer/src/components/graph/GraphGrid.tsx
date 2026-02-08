import { MIN_FREQ, MAX_FREQ } from '../../types/eq';
import { freqToLogPosition, formatFreq } from '../../utils/math';

interface Props {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  dbRange: number;
}

const FREQ_LINES = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
const FREQ_LABELS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

function getGainLines(dbRange: number): number[] {
  const step = dbRange <= 10 ? 2 : 5;
  const lines: number[] = [];
  for (let g = -dbRange; g <= dbRange; g += step) {
    lines.push(g);
  }
  return lines;
}

export function GraphGrid({ width, height, padding, dbRange }: Props) {
  const GRAPH_MIN_GAIN = -dbRange;
  const GRAPH_MAX_GAIN = dbRange;
  const GAIN_LINES = getGainLines(dbRange);
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const freqToX = (f: number) =>
    padding.left + freqToLogPosition(f, MIN_FREQ, MAX_FREQ) * plotW;

  const gainToY = (g: number) =>
    padding.top + (1 - (g - GRAPH_MIN_GAIN) / (GRAPH_MAX_GAIN - GRAPH_MIN_GAIN)) * plotH;

  return (
    <g className="graph-grid">
      {/* Vertical frequency lines */}
      {FREQ_LINES.map(f => {
        const x = freqToX(f);
        return (
          <line
            key={`vline-${f}`}
            x1={x} y1={padding.top}
            x2={x} y2={height - padding.bottom}
            stroke="rgba(99,102,241,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* Horizontal gain lines */}
      {GAIN_LINES.map(g => {
        const y = gainToY(g);
        return (
          <line
            key={`hline-${g}`}
            x1={padding.left} y1={y}
            x2={width - padding.right} y2={y}
            stroke={g === 0 ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.08)'}
            strokeWidth={g === 0 ? 1.5 : 1}
          />
        );
      })}

      {/* Frequency labels */}
      {FREQ_LABELS.map(f => {
        const x = freqToX(f);
        return (
          <text
            key={`flabel-${f}`}
            x={x}
            y={height - padding.bottom + 18}
            textAnchor="middle"
            fill="#64748b"
            fontSize={11}
            fontFamily="Inter, sans-serif"
          >
            {formatFreq(f)}
          </text>
        );
      })}

      {/* Gain labels */}
      {GAIN_LINES.filter(g => g % 5 === 0).map(g => {
        const y = gainToY(g);
        return (
          <text
            key={`glabel-${g}`}
            x={padding.left - 8}
            y={y + 4}
            textAnchor="end"
            fill="#64748b"
            fontSize={11}
            fontFamily="Inter, sans-serif"
          >
            {g > 0 ? `+${g}` : g}
          </text>
        );
      })}

      {/* Axis labels */}
      <text
        x={width / 2}
        y={height - 2}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={12}
        fontFamily="Inter, sans-serif"
      >
        Frequency (Hz)
      </text>
      <text
        x={12}
        y={height / 2}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={12}
        fontFamily="Inter, sans-serif"
        transform={`rotate(-90, 12, ${height / 2})`}
      >
        Gain (dB)
      </text>

      {/* Border */}
      <rect
        x={padding.left}
        y={padding.top}
        width={plotW}
        height={plotH}
        fill="none"
        stroke="rgba(99,102,241,0.15)"
        strokeWidth={1}
        rx={2}
      />
    </g>
  );
}
