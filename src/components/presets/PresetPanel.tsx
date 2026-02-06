import { useState, useRef } from 'react';
import { useEQStore } from '../../store/eq-store';
import { useCommunityStore } from '../../store/community-store';
import {
  exportAsJSON,
  exportAsAutoEQ,
  importFromJSON,
  parseAutoEQ,
  parsePeaceEQ,
  downloadFile,
} from '../../lib/presets/import-export';
import { ImportDialog } from './ImportDialog';

export function PresetPanel() {
  const presets = useEQStore(s => s.presets);
  const activePresetId = useEQStore(s => s.activePresetId);
  const bands = useEQStore(s => s.bands);
  const preamp = useEQStore(s => s.preamp);
  const loadPreset = useEQStore(s => s.loadPreset);
  const savePreset = useEQStore(s => s.savePreset);
  const deletePreset = useEQStore(s => s.deletePreset);
  const setBands = useEQStore(s => s.setBands);

  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (saving) {
      if (saveName.trim()) {
        savePreset(saveName.trim());
        setSaveName('');
        setSaving(false);
      }
    } else {
      setSaving(true);
    }
  };

  const handleExportJSON = () => {
    const json = exportAsJSON(bands, preamp, 'OpenPEQ Export');
    downloadFile(json, 'openpeq-preset.json');
  };

  const handleExportAutoEQ = () => {
    const text = exportAsAutoEQ(bands, preamp);
    downloadFile(text, 'openpeq-preset.txt', 'text/plain');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject files larger than 1 MB to prevent browser hang
    const MAX_FILE_SIZE = 1_048_576;
    if (file.size > MAX_FILE_SIZE) {
      console.error('Import rejected: file exceeds 1 MB size limit');
      e.target.value = '';
      return;
    }

    const input = e.target;
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const { bands: importedBands, preamp: importedPreamp } = importFromJSON(content);
          setBands(importedBands, importedPreamp);
        } else {
          // Try AutoEQ format first, then Peace
          const result = parseAutoEQ(content);
          if (result.bands.some(b => b.gain !== 0)) {
            setBands(result.bands, result.preamp);
          } else {
            const peaceResult = parsePeaceEQ(content);
            setBands(peaceResult.bands, peaceResult.preamp);
          }
        }
      } catch (err) {
        console.error('Import failed:', err);
      }
      // Reset input after reading is complete so the same file can be re-imported
      input.value = '';
    };
    reader.readAsText(file);
  };

  const handleImportText = (text: string, format: 'autoeq' | 'peace') => {
    try {
      const result = format === 'autoeq' ? parseAutoEQ(text) : parsePeaceEQ(text);
      setBands(result.bands, result.preamp);
      setShowImport(false);
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
        Presets
      </h2>

      {/* Preset list */}
      <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto">
        {presets.length === 0 && (
          <p className="text-xs text-text-muted italic py-2">No saved presets</p>
        )}
        {presets.map(p => (
          <div
            key={p.id}
            className={`flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm ${
              activePresetId === p.id
                ? 'bg-accent/15 text-accent border border-accent/20'
                : 'hover:bg-bg-card-hover text-text-primary border border-transparent'
            }`}
            onClick={() => loadPreset(p.id)}
          >
            <span className="truncate">{p.name}</span>
            <button
              onClick={e => {
                e.stopPropagation();
                deletePreset(p.id);
              }}
              className="text-text-muted hover:text-danger text-xs px-1 transition-colors"
              title="Delete preset"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {/* Save input */}
      {saving && (
        <div className="flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Preset name..."
            autoFocus
            className="flex-1 bg-bg-input border border-border rounded-md px-2 py-1.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
          />
          <button
            onClick={() => { setSaving(false); setSaveName(''); }}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Community EQ Library */}
      <button
        onClick={() => useCommunityStore.getState().open()}
        className="w-full px-3 py-2 text-xs font-medium bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Community EQ Library
      </button>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-xs font-medium bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 rounded-md transition-colors"
        >
          {saving ? 'Confirm Save' : 'Save Preset'}
        </button>
        <button
          onClick={() => setShowImport(true)}
          className="px-3 py-1.5 text-xs font-medium bg-bg-input border border-border text-text-secondary hover:border-border-focus rounded-md transition-colors"
        >
          Import Text
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 text-xs font-medium bg-bg-input border border-border text-text-secondary hover:border-border-focus rounded-md transition-colors"
        >
          Import File
        </button>
        <div className="relative group">
          <button
            className="w-full px-3 py-1.5 text-xs font-medium bg-bg-input border border-border text-text-secondary hover:border-border-focus rounded-md transition-colors"
          >
            Export
          </button>
          <div className="absolute bottom-full left-0 mb-1 hidden group-hover:flex flex-col bg-bg-card border border-border rounded-md shadow-xl z-10 overflow-hidden">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 text-xs text-text-primary hover:bg-bg-card-hover text-left whitespace-nowrap"
            >
              Export as JSON
            </button>
            <button
              onClick={handleExportAutoEQ}
              className="px-4 py-2 text-xs text-text-primary hover:bg-bg-card-hover text-left whitespace-nowrap"
            >
              Export as AutoEQ
            </button>
          </div>
        </div>
      </div>

      {/* File input - positioned off-screen (display:none blocks programmatic click in some browsers) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,.csv"
        style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
        onChange={handleFileImport}
        tabIndex={-1}
      />

      {/* Import dialog */}
      {showImport && (
        <ImportDialog
          onImport={handleImportText}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
