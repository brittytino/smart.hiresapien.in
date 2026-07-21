import { useEffect, useRef } from 'react';

/**
 * useProctoring hook (Refactored)
 * 
 * Splits proctoring violations into:
 * - Warnings: Minor actions (Double Click, Ctrl+A, Right Click)
 *   -> Reaction: Temporary blackout screen with message "SCREEN NO PROCTORING".
 *   -> Non-counting: Does not increment the 5-warning limit.
 * - Alerts: Critical violations (Tab/Window switching, Fullscreen Exit, DevTools)
 *   -> Reaction: Warning modal.
 *   -> Counting: Increments the 5-warning limit.
 */
export default function useProctoring(active, { 
  onWarning, 
  onAlert,
  onFullscreenExit,
  onBlackout
}) {
  const activeRef = useRef(active);
  const lastViolationTimeRef = useRef(0);

  // Sync ref to avoid stale closures in event listeners
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const triggerWarning = (msg) => {
    if (!activeRef.current) return;
    try { window.getSelection().removeAllRanges(); } catch {}
    if (onWarning) onWarning(msg);
  };

  const triggerAlert = (msg) => {
    if (!activeRef.current) return;
    if (onAlert) onAlert(msg);
  };

  useEffect(() => {
    if (!active) return;

    // ─── ⌨️ Keyboard Guard ────────────────────────────────────────────────
    const handleKeyDown = (e) => {
      if (!activeRef.current) return;

      const key = e.key;
      const code = e.code;
      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;
      const meta = e.metaKey;
      const alt = e.altKey;

      // 1. SELECT ALL (Ctrl + A) -> Warning (Non-counting Blackout)
      if (ctrl && (key.toLowerCase() === 'a' || code === 'KeyA')) {
        e.preventDefault();
        triggerWarning("SCREEN NO PROCTORING"); // Action: Ctrl+A
        return false;
      }

      // 2. Windows/Command key (Meta) -> Alert (Counting)
      if (key === 'Meta' || key === 'OS') {
        e.preventDefault();
        triggerAlert("System key usage (Windows/Command) is not allowed.");
        return;
      }

      // 3. Alt combinations (Tab, F4, Esc) -> Alert (Counting)
      if (alt && ['Tab', 'F4', 'Escape'].includes(key)) {
        e.preventDefault();
        triggerAlert("Switching or closing windows using Alt combinations is prohibited.");
        return;
      }

      // 4. Developer tools (F12, Ctrl+Shift+I/J/C/K) -> Alert (Counting)
      if (key === 'F12' || (ctrl && shift && ['i', 'j', 'c', 'k'].includes(key.toLowerCase()))) {
        e.preventDefault();
        triggerAlert("Developer Tools are strictly prohibited.");
        return;
      }

      // 5. Common shortcuts (Save, Print, Source, Find, Copy/Paste/Cut) -> Alert (Counting)
      if (ctrl && !alt) {
        const k = key.toLowerCase();
        if (['s', 'p', 'u', 'f', 'c', 'x', 'v'].includes(k)) {
          e.preventDefault();
          triggerAlert(`Hotkey Ctrl+${k.toUpperCase()} is disabled.`);
          return;
        }
      }
    };

    // ─── 🖱️ Mouse & Connection Guard ─────────────────────────────────────
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerWarning("SCREEN NO PROCTORING"); // Action: Right Click
      return false;
    };

    const handleDblClick = (e) => {
      if (e.target.closest('.action-btn, .clear-btn, .mark-read-btn, .next-btn')) return;
      e.preventDefault();
      triggerWarning("SCREEN NO PROCTORING"); // Action: Double Click
      return false;
    };

    const handleSelectStart = (e) => {
      if (['TEXTAREA', 'INPUT'].includes(e.target.tagName)) return true;
      e.preventDefault();
      return false;
    };

    // ─── 👁️ Visibility & Focus Guard (Alert - Counting) ─────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden && activeRef.current) {
        triggerAlert("Tab switching detected. This violation has been recorded.");
      }
    };

    const handleWindowBlur = () => {
      if (activeRef.current) {
        triggerAlert("Window focus lost. Please stay focused on the assessment.");
      }
    };

    // ─── 🖥️ Fullscreen Guard (Alert - Counting) ─────────────────────────────
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && activeRef.current) {
        if (onFullscreenExit) onFullscreenExit();
        triggerAlert("Fullscreen mode is required. Any exit will be logged.");
      }
    };

    // ─── 💓 Heartbeat Security Check (Alert - Counting) ─────────────────────
    const securityHeartbeat = setInterval(() => {
        if (!activeRef.current) return;

        // 1. Force Fullscreen
        if (!document.fullscreenElement) {
            if (onFullscreenExit) onFullscreenExit();
        }

        // 2. DevTools detection via window size threshold
        const threshold = 160;
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        
        if (widthDiff > threshold || heightDiff > threshold) {
            triggerAlert("Developer Tools detected. Please close the panel to continue.");
        }
    }, 2000);

    // Attach listeners
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("dblclick", handleDblClick, { capture: true });
    document.addEventListener("selectstart", handleSelectStart, { capture: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      clearInterval(securityHeartbeat);
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("dblclick", handleDblClick, { capture: true });
      document.removeEventListener("selectstart", handleSelectStart, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [active, onWarning, onAlert, onFullscreenExit, onBlackout]);
}
