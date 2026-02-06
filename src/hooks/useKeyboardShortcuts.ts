import { useEffect } from 'react';
import { useEQStore } from '../store/eq-store';

/**
 * Global keyboard shortcuts:
 *   Ctrl+Z          — Undo
 *   Ctrl+Shift+Z    — Redo
 *   Ctrl+Y          — Redo
 *   Ctrl+S          — Save to device
 *   Space           — Toggle A/B compare
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs / textareas / selects
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const ctrl = e.ctrlKey || e.metaKey;

      // ── Undo ──
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        useEQStore.getState().undo();
        return;
      }

      // ── Redo (Ctrl+Shift+Z or Ctrl+Y) ──
      if (ctrl && e.shiftKey && e.key === 'Z') {
        e.preventDefault();
        useEQStore.getState().redo();
        return;
      }
      if (ctrl && e.key === 'y') {
        e.preventDefault();
        useEQStore.getState().redo();
        return;
      }

      // ── Save to device (Ctrl+S) ──
      if (ctrl && e.key === 's') {
        e.preventDefault();
        const state = useEQStore.getState();
        if (state.device.status === 'connected') {
          state.saveToDevice();
        }
        return;
      }

      // ── A/B Compare (Space) ──
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        useEQStore.getState().toggleAB();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
