import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useEQStore } from '../../store/eq-store';
import { BAND_COLORS } from '../../types/eq';
import { GraphGrid } from './GraphGrid';
import { CompositeCurve } from './CompositeCurve';
import { DragHandle } from './DragHandle';

const PADDING = { top: 20, right: 30, bottom: 40, left: 50 };

export function FrequencyGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 340 });

  const bands = useEQStore(s => s.bands);
  const setBandParam = useEQStore(s => s.setBandParam);
  const graphDbRange = useEQStore(s => s.graphDbRange);
  const setGraphDbRange = useEQStore(s => s.setGraphDbRange);
  const eqEnabled = useEQStore(s => s.eqEnabled);

  // A/B compare state — for optional snapshot curve overlay
  const snapshotBands = useEQStore(s => s.snapshotBands);
  const isComparing = useEQStore(s => s.isComparing);

  // When EQ is bypassed, show flat curves
  const displayBands = useMemo(
    () => eqEnabled ? bands : bands.map(b => ({ ...b, gain: 0 })),
    [eqEnabled, bands],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: Math.max(280, Math.min(400, width * 0.38)) });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleDrag = useCallback((index: number, freq: number, gain: number) => {
    setBandParam(index, 'freq', freq);
    setBandParam(index, 'gain', gain);
  }, [setBandParam]);

  return (
    <div ref={containerRef} className="w-full glass-card p-4">
      {/* dB range toggle */}
      <div className="flex items-center justify-end gap-1 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium mr-1">Scale</span>
        {([10, 20, 30] as const).map(range => (
          <button
            key={range}
            onClick={() => setGraphDbRange(range)}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
              graphDbRange === range
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'text-text-muted border border-border hover:border-border-focus hover:text-text-secondary'
            }`}
          >
            ±{range}
          </button>
        ))}
      </div>

      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="select-none"
      >
        <defs>
          <linearGradient id="compositeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="snapshotGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <GraphGrid
          width={dimensions.width}
          height={dimensions.height}
          padding={PADDING}
          dbRange={graphDbRange}
        />

        {/* A/B snapshot composite curve (shown as faded dashed line when comparing) */}
        {snapshotBands && (
          <CompositeCurve
            bands={snapshotBands}
            width={dimensions.width}
            height={dimensions.height}
            padding={PADDING}
            dbRange={graphDbRange}
            isSnapshot
          />
        )}

        {/* Composite curve */}
        <CompositeCurve
          bands={displayBands}
          width={dimensions.width}
          height={dimensions.height}
          padding={PADDING}
          dbRange={graphDbRange}
        />

        {/* Drag handles */}
        {bands.map((band, i) => (
          <DragHandle
            key={i}
            freq={band.freq}
            gain={band.gain}
            color={BAND_COLORS[i]}
            index={i}
            enabled={band.enabled}
            width={dimensions.width}
            height={dimensions.height}
            padding={PADDING}
            dbRange={graphDbRange}
            onDrag={handleDrag}
          />
        ))}

        {/* A/B state indicator */}
        {snapshotBands && (
          <text
            x={dimensions.width - PADDING.right - 4}
            y={PADDING.top + 16}
            textAnchor="end"
            fill={isComparing ? '#f59e0b' : '#6366f1'}
            fontSize={13}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
            opacity={0.7}
          >
            {isComparing ? 'A' : 'B'}
          </text>
        )}
      </svg>
    </div>
  );
}
