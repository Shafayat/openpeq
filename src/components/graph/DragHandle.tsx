import { useCallback, useRef } from 'react';
import { MIN_FREQ, MAX_FREQ } from '../../types/eq';
import { freqToLogPosition, logPositionToFreq, clamp } from '../../utils/math';

interface Props {
  freq: number;
  gain: number;
  color: string;
  index: number;
  enabled: boolean;
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  dbRange: number;
  onDrag: (index: number, freq: number, gain: number) => void;
}

export function DragHandle({ freq, gain, color, index, enabled, width, height, padding, dbRange, onDrag }: Props) {
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const draggingRef = useRef(false);

  const GRAPH_MIN_GAIN = -dbRange;
  const GRAPH_MAX_GAIN = dbRange;
  const x = padding.left + freqToLogPosition(freq, MIN_FREQ, MAX_FREQ) * plotW;
  const y = padding.top + (1 - (gain - GRAPH_MIN_GAIN) / (GRAPH_MAX_GAIN - GRAPH_MIN_GAIN)) * plotH;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    (e.target as SVGElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    e.preventDefault();

    const svg = (e.target as SVGElement).closest('svg');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normalizedX = (mouseX - padding.left) / plotW;
    const normalizedY = (mouseY - padding.top) / plotH;

    const newFreq = Math.round(clamp(logPositionToFreq(normalizedX, MIN_FREQ, MAX_FREQ), MIN_FREQ, MAX_FREQ));
    const newGain = clamp(dbRange - normalizedY * (dbRange * 2), -10, 10);

    onDrag(index, newFreq, Math.round(newGain * 10) / 10);
  }, [index, padding, plotW, plotH, onDrag, dbRange]);

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  if (!enabled) return null;

  return (
    <g style={{ cursor: 'grab' }}>
      {/* Larger invisible hit area */}
      <circle
        cx={x} cy={y} r={14}
        fill="transparent"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {/* Outer glow */}
      <circle
        cx={x} cy={y} r={8}
        fill={color}
        opacity={0.15}
        pointerEvents="none"
      />
      {/* Main dot */}
      <circle
        cx={x} cy={y} r={5}
        fill={color}
        stroke="#0a0a0f"
        strokeWidth={2}
        pointerEvents="none"
      />
      {/* Band number */}
      <text
        x={x} y={y - 14}
        textAnchor="middle"
        fill={color}
        fontSize={10}
        fontWeight={600}
        fontFamily="Inter, sans-serif"
        pointerEvents="none"
      >
        {index + 1}
      </text>
    </g>
  );
}
