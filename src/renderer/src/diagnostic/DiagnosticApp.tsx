import { useState, useRef, useCallback, useEffect } from 'react';
import { WALKPLAY_VENDOR_IDS, REPORT_ID, READ, END, CMD } from '../lib/usb/constants';

interface LogEntry {
  t: number;
  iso: string;
  type:
    | 'info'
    | 'connect'
    | 'baseline'
    | 'input-report'
    | 'poll-sent'
    | 'poll-response'
    | 'gain-change'
    | 'register-change'
    | 'probe-sent'
    | 'probe-response'
    | 'user-action'
    | 'instruction'
    | 'error';
  details: unknown;
}

function bytesToHex(bytes: Uint8Array | number[]): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}

function bytesToArray(bytes: Uint8Array): number[] {
  return Array.from(bytes);
}

const POLL_INTERVAL_MS = 200;
const PROBE_TIMEOUT_MS = 200;
const POLL_ALL_INTERVAL_MS = 50;
// Probe these READ commands (skipping known writes TEMP_WRITE=0x0a, FLASH_EQ=0x01,
// and the already-known reads PEQ_VALUES=0x09, VERSION=0x0c, GLOBAL_GAIN=0x03, GET_SLOT=0x0f).
// Extended to 0x4f to hunt for the analog gain register the physical button writes.
const PROBE_COMMANDS = [
  0x00, 0x02, 0x04, 0x05, 0x06, 0x07, 0x08, 0x0b, 0x0d, 0x0e, 0x10, 0x11, 0x12,
  0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
  0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x2b, 0x2c,
  0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
  0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46,
  0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4c, 0x4d, 0x4e, 0x4f,
];
// Commands the previous probe confirmed return data — poll all of these to find which holds the volume.
// Populated automatically from probe responses + initial known set.
const INITIAL_DISCOVERED_REGISTERS = [
  0x00, 0x02, 0x03, 0x0d, 0x0e, 0x11, 0x16, 0x18, 0x19, 0x1a, 0x1d, 0x1e,
];

const SCRIPT_STEPS = [
  { id: 'observe-idle', label: 'Step 1: Don\'t touch anything for 5 seconds (capturing idle baseline)', auto: true, durationMs: 5000 },
  { id: 'press-vol-up-1', label: 'Step 2: Press the volume UP button ONCE (single short press)', auto: false },
  { id: 'press-vol-up-2', label: 'Step 3: Press volume UP again (we want 2 samples)', auto: false },
  { id: 'press-vol-up-3', label: 'Step 4: Press volume UP a third time', auto: false },
  { id: 'press-vol-down-1', label: 'Step 5: Press volume DOWN once', auto: false },
  { id: 'press-vol-down-2', label: 'Step 6: Press volume DOWN again', auto: false },
  { id: 'long-press', label: 'Step 7: Long-press the button (~1 second) — this is to see what other function it triggers', auto: false },
  { id: 'rapid-press', label: 'Step 8: Rapid-press the button 4 times quickly', auto: false },
  { id: 'idle-after', label: 'Step 9: Wait 3 seconds without touching anything', auto: true, durationMs: 3000 },
  { id: 'check-mixer', label: 'Step 10: Open Windows Volume Mixer (Win+I → System → Sound → Volume mixer). Look for the Crinear/dongle entry. Press the physical button again and tell us if the Windows slider moves. Type observations in the box below, then click "Record observation".', auto: false },
] as const;

export function DiagnosticApp() {
  const [device, setDevice] = useState<HIDDevice | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [pollEnabled, setPollEnabled] = useState(false);
  const [autoStepCountdown, setAutoStepCountdown] = useState(0);
  const [observation, setObservation] = useState('');
  const [isProbing, setIsProbing] = useState(false);

  const logRef = useRef<LogEntry[]>([]);
  const sessionStartRef = useRef<number>(0);
  const lastGlobalGainRef = useRef<number | null>(null);
  const deviceRef = useRef<HIDDevice | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAllIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAllCursorRef = useRef<number>(0);
  // Cache of last response bytes per command byte — used to detect changes
  const registerCacheRef = useRef<Map<number, number[]>>(new Map());
  // Dynamic list of commands that have ever returned data (grows as probe finds new ones)
  const discoveredRegistersRef = useRef<number[]>([...INITIAL_DISCOVERED_REGISTERS]);
  // Set when probe is active so we tag responses as probe-response (not input-report)
  const probingRef = useRef<boolean>(false);
  const [pollAllEnabled, setPollAllEnabled] = useState(false);

  const addLog = useCallback((entry: Omit<LogEntry, 't' | 'iso'>) => {
    const now = Date.now();
    const t = sessionStartRef.current === 0 ? 0 : now - sessionStartRef.current;
    const fullEntry: LogEntry = { t, iso: new Date(now).toISOString(), ...entry };
    logRef.current = [...logRef.current, fullEntry];
    setLog(logRef.current.slice(-200)); // UI only shows last 200 entries; full log retained in ref
  }, []);

  const handleInputReport = useCallback(
    (event: HIDInputReportEvent) => {
      const bytes = bytesToArray(new Uint8Array(event.data.buffer));

      // Try to parse as GLOBAL_GAIN response: [READ, 0x03, ?, ?, gainByte, ...]
      let parsedGain: number | null = null;
      if (bytes.length >= 5 && bytes[0] === READ && bytes[1] === CMD.GLOBAL_GAIN) {
        const raw = bytes[4];
        parsedGain = raw > 127 ? raw - 256 : raw; // signed int8
      }

      // Tag responses arriving during probe sweep so we can find them in the log
      const type: LogEntry['type'] = probingRef.current
        ? 'probe-response'
        : parsedGain !== null
          ? 'poll-response'
          : 'input-report';

      addLog({
        type,
        details: {
          reportId: event.reportId,
          length: bytes.length,
          hex: bytesToHex(bytes),
          bytes,
          parsedGain,
        },
      });

      // Track GLOBAL_GAIN changes specifically (legacy gain-change events)
      if (parsedGain !== null) {
        if (lastGlobalGainRef.current !== null && parsedGain !== lastGlobalGainRef.current) {
          addLog({
            type: 'gain-change',
            details: {
              from: lastGlobalGainRef.current,
              to: parsedGain,
              delta: parsedGain - lastGlobalGainRef.current,
            },
          });
        }
        lastGlobalGainRef.current = parsedGain;
      }

      // Auto-discover registers: any cmd that responds gets added to the live poll-all list
      if (bytes.length >= 2 && bytes[0] === READ) {
        const cmd = bytes[1];
        if (!discoveredRegistersRef.current.includes(cmd) && cmd !== CMD.PEQ_VALUES && cmd !== CMD.VERSION) {
          discoveredRegistersRef.current = [...discoveredRegistersRef.current, cmd].sort((a, b) => a - b);
        }
      }

      // Detect change in any discovered register.
      // SKIP cmd=0x09 (PEQ_VALUES): it uses byte 2 as filter sub-index, so consecutive
      // reads of different filters would falsely trigger a "change".
      if (bytes.length >= 2 && bytes[0] === READ && bytes[1] !== CMD.PEQ_VALUES) {
        const cmd = bytes[1];
        const data = bytes.slice(2);
        // Strip trailing zero padding for comparison
        let end = data.length;
        while (end > 0 && data[end - 1] === 0) end--;
        const trimmed = data.slice(0, Math.max(end, 4)); // keep at least 4 bytes for context
        const prev = registerCacheRef.current.get(cmd);
        if (prev) {
          const changed = prev.length !== trimmed.length || prev.some((v, i) => v !== trimmed[i]);
          if (changed) {
            addLog({
              type: 'register-change',
              details: {
                cmd: `0x${cmd.toString(16).padStart(2, '0')}`,
                from: bytesToHex(prev),
                to: bytesToHex(trimmed),
                fromBytes: prev,
                toBytes: trimmed,
              },
            });
          }
        }
        registerCacheRef.current.set(cmd, trimmed);
      }
    },
    [addLog],
  );

  const connect = useCallback(async () => {
    sessionStartRef.current = Date.now();
    logRef.current = [];
    setLog([]);
    addLog({ type: 'info', details: { msg: 'Session started', userAgent: navigator.userAgent } });

    try {
      const devices = await navigator.hid.requestDevice({
        filters: WALKPLAY_VENDOR_IDS.map((vendorId) => ({ vendorId })),
      });
      if (devices.length === 0) {
        addLog({ type: 'error', details: 'No device selected from picker' });
        return;
      }
      const d = devices[0];
      if (!d.opened) await d.open();

      // Use addEventListener so we capture every report (not stomped by other handlers)
      d.addEventListener('inputreport', handleInputReport as EventListener);

      addLog({
        type: 'connect',
        details: {
          vendorId: `0x${d.vendorId.toString(16).padStart(4, '0')}`,
          productId: `0x${d.productId.toString(16).padStart(4, '0')}`,
          productName: d.productName,
          collections: d.collections.map((c) => ({
            usagePage: c.usagePage,
            usage: c.usage,
            inputReportCount: c.inputReports?.length ?? 0,
            outputReportCount: c.outputReports?.length ?? 0,
            featureReportCount: c.featureReports?.length ?? 0,
            inputReports: c.inputReports?.map((r) => ({
              reportId: r.reportId,
              items: r.items?.length ?? 0,
            })),
          })),
        },
      });

      setDevice(d);
      deviceRef.current = d;
    } catch (err) {
      addLog({ type: 'error', details: { msg: String(err) } });
    }
  }, [addLog, handleInputReport]);

  const readBaseline = useCallback(async () => {
    const d = deviceRef.current;
    if (!d) return;

    addLog({ type: 'instruction', details: { msg: 'Reading baseline state...' } });

    // Read firmware version
    try {
      await d.sendReport(REPORT_ID, new Uint8Array([READ, CMD.VERSION, END]));
      addLog({ type: 'baseline', details: { reading: 'VERSION', sent: bytesToHex([READ, CMD.VERSION, END]) } });
    } catch (err) {
      addLog({ type: 'error', details: { msg: 'VERSION read failed', err: String(err) } });
    }
    await delay(150);

    // Read current slot
    try {
      await d.sendReport(REPORT_ID, new Uint8Array([READ, CMD.GET_SLOT, END]));
      addLog({ type: 'baseline', details: { reading: 'GET_SLOT', sent: bytesToHex([READ, CMD.GET_SLOT, END]) } });
    } catch (err) {
      addLog({ type: 'error', details: { msg: 'GET_SLOT read failed', err: String(err) } });
    }
    await delay(150);

    // Read all 10 PEQ filters
    for (let i = 0; i < 10; i++) {
      try {
        await d.sendReport(REPORT_ID, new Uint8Array([READ, CMD.PEQ_VALUES, 0x00, 0x00, i, END]));
        addLog({ type: 'baseline', details: { reading: `PEQ_VALUES[${i}]`, sent: bytesToHex([READ, CMD.PEQ_VALUES, 0x00, 0x00, i, END]) } });
      } catch (err) {
        addLog({ type: 'error', details: { msg: `PEQ_VALUES[${i}] read failed`, err: String(err) } });
      }
      await delay(80);
    }

    // Read GLOBAL_GAIN
    try {
      await d.sendReport(REPORT_ID, new Uint8Array([READ, CMD.GLOBAL_GAIN, 0x00]));
      addLog({ type: 'baseline', details: { reading: 'GLOBAL_GAIN', sent: bytesToHex([READ, CMD.GLOBAL_GAIN, 0x00]) } });
    } catch (err) {
      addLog({ type: 'error', details: { msg: 'GLOBAL_GAIN read failed', err: String(err) } });
    }
    await delay(200);

    addLog({ type: 'instruction', details: { msg: 'Baseline complete. Click "Start polling" then walk through the steps below.' } });
  }, [addLog]);

  const startPolling = useCallback(() => {
    const d = deviceRef.current;
    if (!d) return;
    setPollEnabled(true);
    addLog({ type: 'instruction', details: { msg: 'Polling GLOBAL_GAIN every 200ms started' } });

    pollIntervalRef.current = setInterval(async () => {
      try {
        await d.sendReport(REPORT_ID, new Uint8Array([READ, CMD.GLOBAL_GAIN, 0x00]));
        addLog({ type: 'poll-sent', details: { cmd: 'GLOBAL_GAIN' } });
      } catch {
        // ignore
      }
    }, POLL_INTERVAL_MS);
  }, [addLog]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setPollEnabled(false);
    addLog({ type: 'instruction', details: { msg: 'Polling stopped' } });
  }, [addLog]);

  const startPollAll = useCallback(() => {
    const d = deviceRef.current;
    if (!d) return;
    setPollAllEnabled(true);
    registerCacheRef.current.clear();
    pollAllCursorRef.current = 0;
    const registers = discoveredRegistersRef.current;
    addLog({
      type: 'instruction',
      details: {
        msg: `Polling all ${registers.length} discovered registers in rotation, ${POLL_ALL_INTERVAL_MS}ms each (full cycle ${(registers.length * POLL_ALL_INTERVAL_MS) / 1000}s)`,
        registers: registers.map((c) => `0x${c.toString(16).padStart(2, '0')}`),
      },
    });

    pollAllIntervalRef.current = setInterval(async () => {
      const list = discoveredRegistersRef.current;
      if (list.length === 0) return;
      const cmd = list[pollAllCursorRef.current % list.length];
      pollAllCursorRef.current = (pollAllCursorRef.current + 1) % list.length;
      try {
        await d.sendReport(REPORT_ID, new Uint8Array([READ, cmd, END]));
      } catch {
        // ignore
      }
    }, POLL_ALL_INTERVAL_MS);
  }, [addLog]);

  const stopPollAll = useCallback(() => {
    if (pollAllIntervalRef.current) {
      clearInterval(pollAllIntervalRef.current);
      pollAllIntervalRef.current = null;
    }
    setPollAllEnabled(false);
    addLog({ type: 'instruction', details: { msg: 'Poll-all stopped' } });
  }, [addLog]);

  const markStep = useCallback(
    (stepId: string, label: string) => {
      addLog({ type: 'user-action', details: { stepId, label, manual: true } });
    },
    [addLog],
  );

  const runScript = useCallback(async () => {
    setStepIndex(0);
    for (let i = 0; i < SCRIPT_STEPS.length; i++) {
      const step = SCRIPT_STEPS[i];
      setStepIndex(i);
      addLog({ type: 'user-action', details: { stepId: step.id, label: step.label, scriptStep: i + 1 } });

      if (step.auto && 'durationMs' in step) {
        const ms = step.durationMs;
        const startedAt = Date.now();
        while (Date.now() - startedAt < ms) {
          const remaining = Math.ceil((ms - (Date.now() - startedAt)) / 1000);
          setAutoStepCountdown(remaining);
          await delay(200);
        }
        setAutoStepCountdown(0);
      } else {
        // Manual step — wait for user click on "Next step"
        await new Promise<void>((resolve) => {
          const handler = () => {
            window.removeEventListener('diagnostic-next-step', handler);
            resolve();
          };
          window.addEventListener('diagnostic-next-step', handler);
        });
      }
    }
    setStepIndex(-1);
    addLog({ type: 'user-action', details: { stepId: 'done', label: 'Script complete' } });
  }, [addLog]);

  const advanceStep = useCallback(() => {
    window.dispatchEvent(new Event('diagnostic-next-step'));
  }, []);

  const probeUnknownCommands = useCallback(async () => {
    const d = deviceRef.current;
    if (!d) return;
    setIsProbing(true);
    probingRef.current = true;
    addLog({
      type: 'instruction',
      details: {
        msg: `Probing ${PROBE_COMMANDS.length} READ commands 0x00..0x4f (safe: read-only). Responses tagged 'probe-response'.`,
      },
    });

    for (const cmd of PROBE_COMMANDS) {
      try {
        await d.sendReport(REPORT_ID, new Uint8Array([READ, cmd, END]));
        addLog({ type: 'probe-sent', details: { cmd: `0x${cmd.toString(16).padStart(2, '0')}` } });
      } catch (err) {
        addLog({ type: 'error', details: { msg: `Probe 0x${cmd.toString(16)} send failed`, err: String(err) } });
      }
      await delay(PROBE_TIMEOUT_MS);
    }
    probingRef.current = false;
    setIsProbing(false);
    addLog({
      type: 'instruction',
      details: {
        msg: 'Probe sweep complete',
        discoveredRegisters: discoveredRegistersRef.current.map((c) => `0x${c.toString(16).padStart(2, '0')}`),
        count: discoveredRegistersRef.current.length,
      },
    });
  }, [addLog]);

  const recordObservation = useCallback(() => {
    if (!observation.trim()) return;
    addLog({ type: 'user-action', details: { stepId: 'observation', text: observation } });
    setObservation('');
  }, [observation, addLog]);

  const downloadLog = useCallback(() => {
    const json = JSON.stringify(
      {
        sessionStart: new Date(sessionStartRef.current).toISOString(),
        durationMs: Date.now() - sessionStartRef.current,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        entries: logRef.current,
      },
      null,
      2,
    );
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crinear-diagnostic-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollAllIntervalRef.current) clearInterval(pollAllIntervalRef.current);
      const d = deviceRef.current;
      if (d) {
        d.removeEventListener('inputreport', handleInputReport as EventListener);
      }
    };
  }, [handleInputReport]);

  const currentStep = stepIndex >= 0 && stepIndex < SCRIPT_STEPS.length ? SCRIPT_STEPS[stepIndex] : null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 font-mono">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-bold text-accent">Crinear Diagnostic</h1>
            <p className="text-xs text-text-muted mt-1">
              Captures HID input reports, polls registers, probes unknown commands. All actions are read-only — no writes to the device.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {device ? (
              <span className="text-xs px-2 py-1 rounded bg-success/20 text-success border border-success/40">Connected</span>
            ) : (
              <span className="text-xs px-2 py-1 rounded bg-danger/20 text-danger border border-danger/40">Disconnected</span>
            )}
          </div>
        </header>

        {/* Recommended flow */}
        <div className="border border-accent/40 bg-accent/5 rounded p-3 text-xs leading-relaxed text-text-secondary">
          <div className="text-accent font-bold uppercase tracking-wider mb-1">Recommended flow for finding analog gain register</div>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Click <b>1. Connect device</b></li>
            <li>Click <b>5. Probe unknown commands</b> (sweeps 0x00–0x4f, ~15 seconds). This auto-populates the discovered registers list.</li>
            <li>Click <b>5b. Poll ALL discovered registers</b> — now polls every register at 50ms each.</li>
            <li><b>Press the physical volume button MANY times</b> (slow and fast, vol up and vol down). For every press, also click the matching annotation button below (e.g. "Just pressed VOL UP") so we know when in the timeline you pressed.</li>
            <li>Watch the log for amber-highlighted <b>register-change</b> events — those are the smoking gun. Note: PEQ_VALUES (0x09) changes are now suppressed so they won't pollute the log.</li>
            <li>Click <b>6. Download log</b> and share.</li>
          </ol>
        </div>

        {/* Control bar */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={connect}
            disabled={!!device}
            className="px-3 py-1.5 text-xs font-medium bg-accent/20 border border-accent/40 text-accent rounded hover:bg-accent/30 disabled:opacity-30"
          >
            1. Connect device
          </button>
          <button
            onClick={readBaseline}
            disabled={!device}
            className="px-3 py-1.5 text-xs font-medium bg-bg-input border border-border rounded hover:border-border-focus disabled:opacity-30"
          >
            2. Read baseline
          </button>
          <button
            onClick={pollEnabled ? stopPolling : startPolling}
            disabled={!device}
            className={`px-3 py-1.5 text-xs font-medium border rounded disabled:opacity-30 ${
              pollEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-bg-input border-border hover:border-border-focus'
            }`}
          >
            3. {pollEnabled ? 'Stop polling' : 'Start polling (GLOBAL_GAIN)'}
          </button>
          <button
            onClick={runScript}
            disabled={!device || stepIndex >= 0}
            className="px-3 py-1.5 text-xs font-medium bg-accent/20 border border-accent/40 text-accent rounded hover:bg-accent/30 disabled:opacity-30"
          >
            4. Run scripted test
          </button>
          <button
            onClick={probeUnknownCommands}
            disabled={!device || isProbing}
            className="px-3 py-1.5 text-xs font-medium bg-bg-input border border-border rounded hover:border-border-focus disabled:opacity-30"
          >
            5. Probe unknown commands
          </button>
          <button
            onClick={pollAllEnabled ? stopPollAll : startPollAll}
            disabled={!device}
            className={`px-3 py-1.5 text-xs font-medium border rounded disabled:opacity-30 ${
              pollAllEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-purple-500/20 border-purple-500/40 text-purple-300'
            }`}
          >
            5b. {pollAllEnabled ? 'Stop poll-all' : 'Poll ALL discovered registers'}
          </button>
          <button
            onClick={downloadLog}
            className="px-3 py-1.5 text-xs font-medium bg-accent/20 border border-accent/40 text-accent rounded hover:bg-accent/30 ml-auto"
          >
            6. Download log (JSON)
          </button>
        </div>

        {/* Current step */}
        {currentStep && (
          <div className="border-2 border-accent/40 bg-accent/10 rounded p-4 flex flex-col gap-2">
            <div className="text-xs text-accent uppercase tracking-wider">
              Step {stepIndex + 1} of {SCRIPT_STEPS.length}
            </div>
            <p className="text-sm">{currentStep.label}</p>
            {currentStep.auto ? (
              <p className="text-xs text-text-muted">Auto-advancing in {autoStepCountdown}s...</p>
            ) : (
              <button
                onClick={advanceStep}
                className="self-start px-3 py-1.5 text-xs font-medium bg-accent border border-accent rounded text-white hover:bg-accent-hover"
              >
                Done — Next step →
              </button>
            )}
          </div>
        )}

        {/* Manual annotations */}
        <details className="border border-border rounded p-3">
          <summary className="text-xs uppercase tracking-wider text-text-muted cursor-pointer">Manual annotations</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ['vol-up', 'Just pressed VOL UP'],
              ['vol-down', 'Just pressed VOL DOWN'],
              ['mute', 'Just pressed MUTE / multi-function'],
              ['unplug', 'Just unplugged headphones'],
              ['plug', 'Just plugged headphones'],
              ['idle', 'Going idle now'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => markStep(id, label)}
                className="px-2 py-1 text-[11px] font-medium bg-bg-input border border-border rounded hover:border-border-focus"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && recordObservation()}
              placeholder="Free-form observation (e.g. 'Windows mixer slider moved when I pressed the button')"
              className="flex-1 bg-bg-input border border-border rounded px-2 py-1 text-xs"
            />
            <button
              onClick={recordObservation}
              className="px-3 py-1 text-xs font-medium bg-accent/20 border border-accent/40 text-accent rounded hover:bg-accent/30"
            >
              Record observation
            </button>
          </div>
        </details>

        {/* Live event stream */}
        <div className="border border-border rounded flex flex-col" style={{ height: '50vh' }}>
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-text-muted">
              Live event stream ({logRef.current.length} total events)
            </span>
            <span className="text-xs text-text-muted">Showing last 200</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 text-[11px] leading-relaxed">
            {log.length === 0 ? (
              <p className="text-text-muted italic">No events yet. Click "Connect device" to begin.</p>
            ) : (
              [...log].reverse().map((entry, i) => (
                <div key={i} className="flex gap-2 py-0.5 border-b border-border/30">
                  <span className="text-text-muted shrink-0 w-20">
                    +{(entry.t / 1000).toFixed(2)}s
                  </span>
                  <span className={`shrink-0 w-24 font-bold ${colorForType(entry.type)}`}>{entry.type}</span>
                  <span className="text-text-secondary break-all whitespace-pre-wrap">
                    {formatDetails(entry.details)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <footer className="text-xs text-text-muted">
          When you're done, click "Download log (JSON)" and share the file. The full event history is saved (not just the 200 shown above).
        </footer>
      </div>
    </div>
  );
}

function colorForType(type: LogEntry['type']): string {
  switch (type) {
    case 'input-report':
      return 'text-cyan-400';
    case 'poll-response':
      return 'text-blue-400';
    case 'gain-change':
    case 'register-change':
      return 'text-amber-400 font-bold';
    case 'user-action':
      return 'text-green-400';
    case 'probe-response':
      return 'text-purple-400';
    case 'error':
      return 'text-danger';
    case 'instruction':
      return 'text-accent';
    case 'connect':
    case 'baseline':
      return 'text-text-secondary';
    default:
      return 'text-text-muted';
  }
}

function formatDetails(d: unknown): string {
  if (typeof d === 'string') return d;
  try {
    return JSON.stringify(d, null, 0);
  } catch {
    return String(d);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
