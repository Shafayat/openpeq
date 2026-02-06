import { useState } from 'react';

interface Props {
  onImport: (text: string, format: 'autoeq' | 'peace') => void;
  onClose: () => void;
}

export function ImportDialog({ onImport, onClose }: Props) {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<'autoeq' | 'peace'>('autoeq');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="glass-card p-6 w-full max-w-lg mx-4 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-text-primary">Import EQ Settings</h3>

        {/* Format selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setFormat('autoeq')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              format === 'autoeq'
                ? 'bg-accent text-white'
                : 'bg-bg-input border border-border text-text-secondary'
            }`}
          >
            AutoEQ / EqualizerAPO
          </button>
          <button
            onClick={() => setFormat('peace')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              format === 'peace'
                ? 'bg-accent text-white'
                : 'bg-bg-input border border-border text-text-secondary'
            }`}
          >
            CSV / Peace EQ
          </button>
        </div>

        {/* Format hint */}
        <p className="text-xs text-text-muted">
          {format === 'autoeq'
            ? 'Paste AutoEQ or EqualizerAPO format: "Filter 1: ON PK Fc 1000 Hz Gain -3.5 dB Q 1.41"'
            : 'Paste CSV format: "freq,gain,q[,type]" per line (e.g. "1000,-3.5,1.41,PK")'
          }
        </p>

        {/* Text area */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={
            format === 'autoeq'
              ? `Preamp: -6.2 dB\nFilter 1: ON PK Fc 65 Hz Gain 5.8 dB Q 0.76\nFilter 2: ON PK Fc 200 Hz Gain -2.1 dB Q 1.41`
              : `65,5.8,0.76,PK\n200,-2.1,1.41,PK\n1000,-3.5,1.41,PK`
          }
          rows={8}
          className="w-full bg-bg-input border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-mono focus:border-border-focus focus:outline-none resize-none"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => text.trim() && onImport(text, format)}
            disabled={!text.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
