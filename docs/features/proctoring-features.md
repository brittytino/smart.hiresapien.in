# Grad360MBA — Exam Proctoring Features

> **System:** No-proctoring enforcement is built entirely client-side using React event listeners, browser APIs, and a security heartbeat. Every counting violation is persisted to the database with a timestamp and reason.

---

## Warning System Overview

| Type | Behaviour | Counts Toward Limit? |
|------|-----------|----------------------|
| **Counting Violation (Alert)** | Shows warning modal, increments warning counter, logs to DB | YES — 5 triggers auto-termination |
| **Non-Counting Violation (Blackout)** | Shows 3-second "SCREEN NO PROCTORING" overlay | NO |

**Auto-termination:** After **5 counting violations**, the test is automatically submitted and the domain is locked. The student cannot re-enter.

---

## PREVENTED Actions (Blocked Before They Happen)

### Keyboard Shortcuts

| Key / Combo | What It Blocks | Violation Type |
|-------------|---------------|----------------|
| `Ctrl + C` | Copy | Counting Alert |
| `Ctrl + X` | Cut | Counting Alert |
| `Ctrl + V` | Paste | Counting Alert |
| `Ctrl + A` | Select All | Non-counting Blackout |
| `Ctrl + S` | Save Page | Prevented silently |
| `Ctrl + P` | Print | Prevented silently |
| `Ctrl + U` | View Source | Prevented silently |
| `Ctrl + F` | Find in Page | Prevented silently |
| `Ctrl + W` | Close Tab | Prevented silently |
| `Ctrl + T` | New Tab | Prevented silently |
| `Ctrl + N` | New Window | Prevented silently |
| `Ctrl + Shift + I` | DevTools (Chrome) | Counting Alert |
| `Ctrl + Shift + J` | DevTools Console | Counting Alert |
| `Ctrl + Shift + C` | DevTools Inspector | Counting Alert |
| `Ctrl + Shift + K` | DevTools (Firefox) | Counting Alert |
| `F12` | DevTools | Counting Alert |
| `F11` | Fullscreen Toggle | Prevented silently |
| `Alt + Tab` | Switch Window | Counting Alert |
| `Alt + F4` | Close Window | Counting Alert |
| `Alt + Escape` | Minimise/Switch | Counting Alert |
| `Meta / Windows Key` | Open Start Menu | Counting Alert |
| `PrintScreen` | Screenshot | Counting Alert + clipboard cleared |
| `Meta + Shift + S` | Windows Snipping Tool | Counting Alert + clipboard cleared |
| `Meta + G` | Windows Game Bar | Counting Alert + clipboard cleared |
| `Escape` | Exit Exam State | Counting Alert |

### Mouse & Selection

| Action | What Is Blocked | Violation Type |
|--------|----------------|----------------|
| Right-click | Context menu | Non-counting Blackout |
| Double-click | Text selection via double-click | Non-counting Blackout |
| `selectstart` event | Text highlighting (outside input/textarea) | Prevented silently |
| `dragstart` event | Dragging text out of exam | Prevented silently |

### Clipboard

| Action | Behaviour |
|--------|-----------|
| `copy` event | `preventDefault()` + Counting Alert |
| `paste` event | `preventDefault()` + Counting Alert |
| `cut` event | `preventDefault()` + Counting Alert |
| Clipboard contents on PrintScreen | Cleared via `navigator.clipboard.writeText('')` |

### Page Navigation

| Action | Behaviour |
|--------|-----------|
| Page refresh / back / close tab | `beforeunload` fires confirmation dialog, blocks navigation |
| Navigating away mid-exam | Blocked; answered questions preserved in localStorage |

---

## DETECTED Actions (Monitored, Logged & Flagged)

### Tab & Window Focus

| Trigger | Detection Method | Consequence |
|---------|-----------------|-------------|
| Switching to another tab | `visibilitychange` → `document.hidden === true` | Blocking overlay + Counting Alert |
| Alt+Tab / clicking another app | `window blur` event | Blocking overlay + Counting Alert |

Both require the student to click an acknowledgement button before the exam resumes.

### Fullscreen

| Trigger | Detection Method | Consequence |
|---------|-----------------|-------------|
| Pressing Esc or otherwise exiting fullscreen | `fullscreenchange` → `document.fullscreenElement === null` | Fullscreen-lock overlay; student must click to re-enter fullscreen |
| Each fullscreen exit | — | Counting Alert (+1 toward 5-limit) |

> The fullscreen-lock overlay renders **above** all other modals and cannot be dismissed without re-entering fullscreen.

### Developer Tools

| Trigger | Detection Method | Consequence |
|---------|-----------------|-------------|
| F12, Ctrl+Shift+I/J/C/K | Keydown event | Counting Alert (key also prevented) |
| DevTools panel open (docked) | **Security Heartbeat** every 2 s: `outerWidth − innerWidth > 160px` OR `outerHeight − innerHeight > 160px` | Counting Alert |

### Screenshot Attempts

| Trigger | Detection Method | Consequence |
|---------|-----------------|-------------|
| PrintScreen | `e.key === 'PrintScreen'` / `e.code === 'PrintScreen'` | Prevented + clipboard cleared + Counting Alert |
| Meta+PrintScreen | Key combo detection | Same as above |
| Ctrl+PrintScreen | Key combo detection | Same as above |
| Windows Snipping Tool (`Meta+Shift+S`) | Key combo detection | Same as above |
| Windows Game Bar (`Meta+G`) | Key combo detection | Same as above |

### Idle Detection

| Trigger | Detection Method | Consequence |
|---------|-----------------|-------------|
| No mouse movement or keypress for **2 minutes** | `mousemove` + `keydown` reset a 120,000 ms timer | Counting Alert — "You have been idle for 2 minutes." |

---

## Security Heartbeat

Runs **every 2 seconds** while the exam is active:

1. **Fullscreen check** — verifies `document.fullscreenElement` exists; triggers overlay if not.
2. **DevTools size check** — measures `outerWidth − innerWidth` and `outerHeight − innerHeight`; triggers alert if either exceeds 160 px.

---

## Blocking Overlays

| Overlay | Triggered By | Blocks Exam? | Dismissal |
|---------|-------------|-------------|-----------|
| **Blackout ("SCREEN NO PROCTORING")** | Right-click, double-click, Ctrl+A | Yes — 3 seconds | Auto-dismisses |
| **Warning Modal** | Any counting violation | Yes | Student clicks "I Understand" |
| **Focus Lost Overlay** | Tab switch, window blur | Yes | Student clicks acknowledgement |
| **Fullscreen Lock Overlay** | Fullscreen exit | Yes | Student clicks "Re-enter Fullscreen" |
| **Termination Modal** | 5th counting violation | Yes — permanent | No dismissal; domain locked |

---

## Violation Logging (Database)

Every counting violation is recorded in MongoDB (`students_pri_test_response`):

```json
{
  "warningCount": 2,
  "warningEvents": [
    { "timestamp": "2026-04-01T10:05:12Z", "reason": "Tab switching detected." },
    { "timestamp": "2026-04-01T10:07:44Z", "reason": "Developer Tools detected." }
  ]
}
```

Each entry includes:
- **timestamp** — exact date/time of violation
- **reason** — human-readable description of the specific violation type

Administrators can review the full violation history per student per domain.

---

## Termination Conditions

| Condition | Scope | Result |
|-----------|-------|--------|
| 5 counting violations | PRI Test (per domain) | Domain auto-submitted + locked; student cannot re-enter |
| 5 fullscreen exits | Psychometric Test | Test auto-terminated + status set to `'terminated'` in DB |

---

## Complete Violation Count Reference

| Violation | Prevented | Detected | Logged to DB | Counts (out of 5) |
|-----------|:---------:|:--------:|:------------:|:-----------------:|
| Tab switching | YES | YES | YES | YES |
| Window blur (Alt+Tab etc.) | YES | YES | YES | YES |
| Fullscreen exit | YES | YES | YES | YES |
| DevTools via keyboard | YES | YES | YES | YES |
| DevTools via size detection | — | YES | YES | YES |
| PrintScreen | YES | YES | YES | YES |
| Windows Snipping Tool | YES | YES | YES | YES |
| Windows Game Bar | YES | YES | YES | YES |
| Copy (Ctrl+C) | YES | YES | YES | YES |
| Paste (Ctrl+V) | YES | YES | YES | YES |
| Cut (Ctrl+X) | YES | YES | YES | YES |
| Alt+Tab (keyboard) | YES | YES | YES | YES |
| Alt+F4 | YES | YES | YES | YES |
| Windows/Meta Key | YES | YES | YES | YES |
| Escape key | YES | YES | YES | YES |
| 2-minute idle | — | YES | YES | YES |
| Right-click | YES | YES | NO | NO (blackout) |
| Double-click | YES | YES | NO | NO (blackout) |
| Ctrl+A (Select All) | YES | YES | NO | NO (blackout) |
| Ctrl+S / Ctrl+P / Ctrl+U / Ctrl+F | YES | — | NO | NO |
| Ctrl+W / Ctrl+T / Ctrl+N | YES | — | NO | NO |
| Text selection (selectstart) | YES | — | NO | NO |
| Drag & drop | YES | — | NO | NO |
| Page unload / refresh | YES | YES | — | N/A |
