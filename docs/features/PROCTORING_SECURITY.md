# Proctoring Security & Anti-Cheat Mechanisms

## System Objective
The primary objective of the proctoring system is to ensure the integrity of the assessment process by enforcing a secure, controlled exam environment. It acts as a digital invigilator that prevents, detects, and logs unauthorized activities such as tab switching, the use of banned shortcuts, and leaving the exam screen. Violations are categorized into non-counting warnings (minor infractions) and counting alerts (critical infractions), with a maximum violation threshold that leads to automatic exam termination.

## Security Stack & Dependencies
The proctoring system is built entirely on the client-side within the React/Next.js ecosystem. It relies heavily on standard web APIs to monitor user interactions:
- **DOM Events:** `keydown`, `contextmenu`, `dblclick`, `selectstart`, `copy`, `cut`, `paste`, `dragstart`
- **Window & Document APIs:** `visibilitychange`, `blur`, `fullscreenchange`, `beforeunload`
- **Fullscreen API:** `document.documentElement.requestFullscreen`
- **Clipboard API:** `navigator.clipboard.writeText` to clear clipboard attempts
- **React Hooks:** `useRef` and `useEffect` for state persistence and event listener management

## Core Anti-Cheat Mechanisms
Based on our current implementation, the core security mechanisms encompass:

1. **Fullscreen Enforcement:**
   - The exam requires the user to enter and remain in fullscreen mode.
   - Exiting fullscreen triggers a counting alert ("Fullscreen mode is required").
   - A blocking overlay forces the user to click a button to re-enter fullscreen via a user gesture.

2. **Window & Tab Tracking (Focus Management):**
   - Disabling tab switching is monitored via the `visibilitychange` event.
   - A `blur` event on the `window` detects when the browser loses OS focus (e.g., using Alt+Tab to switch applications).
   - Any loss of focus brings up a blocking overlay ("Tab or window switching detected"), pausing the exam UI and forcing the student to acknowledge the violation, logging it as a counting warning/alert.

3. **Keyboard Shortcuts & Hotkeys Lockdown:**
   - Disabled System Keys: Windows/Meta/OS keys and Alt+Tab/F4/Escape are fully blocked.
   - Disabled DevTools: F12 and Ctrl+Shift+I/J/C/K shortcuts are prevented.
   - Blocked Browser Controls: Ctrl+S (Save), P (Print), U (Source), F (Find), W (Close Tab), T (New Tab), N (New Window) are disabled.
   - Screenshot Prevention: Prevents `PrintScreen`, `Win+Shift+S`, and clears the clipboard if a screenshot is attempted. 

4. **Copy/Paste & Text Selection Prevention:**
   - Disabled standard copy/cut/paste keyboard shortcuts (Ctrl+C, X, V).
   - Disabled DOM events (`copy`, `cut`, `paste`, `dragstart`, `selectstart`).
   - "Select All" (Ctrl+A), Double Click, and Right Click (context menu) are disabled and result in a temporary UI blackout warning ("SCREEN NO PROCTORING").

5. **Idle & Heartbeat Detection:**
   - An idle timer tracks mouse movement and keyboard usage. Inactivity for 2 minutes triggers a warning alert.
   - A backend heartbeat interval periodically checks if the window dimensions differ significantly from inner dimensions, identifying floating developer tools.

6. **Violation Thresholds & Auto-Termination:**
   - Warnings don't increase the violation limit but black out the screen briefly.
   - Alerts increase the violation count. 
   - Reaching **5 counting warnings** automatically locks the exam, forces final submission, and navigates the user away.

## Media & Monitoring
Based on the current source code, there is **no active media recording or monitoring** in this project:
- The system does not request access to the user's webcam or microphone (`getUserMedia` and `mediaDevices` are not utilized).
- Proctoring is entirely behavioral (keyboard, mouse, window focus, clipboard behavior) rather than visual/auditory.
- No video or audio streams are captured, analyzed, or uploaded to the server.

## Key File References
Future developers modifying proctoring logic should reference these primary files:
- **`components/exam-portal/ExamPortalMain.jsx`**: Manages the overarching exam session, registers the most robust event listeners, applies focus-loss overlays, handles timeouts, and enforces violation rules.
- **`components/exam-portal/hooks/useProctoring.js`**: Contains a separated, refactored proctoring hook covering basic DOM lockdown rules, categorization of Alerts vs Warnings, and the basic heartbeat checks for devtools.
- **`tests/e2e/fullscreen-proctoring.spec.ts`**: Contains automated E2E tests for the proctoring logic, including tests for fullscreen constraints, hotkey blocking (PrintScreen, F12, Escape), idle timeouts, and window blur events.
