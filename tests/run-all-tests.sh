#!/usr/bin/env bash
# ================================================================
# Grad360 MBA — Phase 1 Bug Verification Test Runner
# Covers all 38 bugs documented in docs/pharse1_testing_bugs_report.md
# ================================================================
set -e

PASS_COUNT=0
FAIL_COUNT=0
LAYER1_FAILED=0

echo ""
echo "================================================================"
echo "  Grad360 MBA — Phase 1 Bug Verification Suite"
echo "================================================================"
echo ""

# ── Layer 1: Static Source Verification (instant, no dependencies) ──
echo "┌── LAYER 1: Static Source Verification (22 checks)"
echo "│   Verifies bug fix patterns are present in source code"
echo "│"
if node tests/verify-source.js; then
  echo "│   RESULT: ALL SOURCE CHECKS PASSED"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "│   RESULT: SOURCE CHECKS FAILED — one or more bug fixes missing"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  LAYER1_FAILED=1
fi
echo "└──"
echo ""

# ── Layer 2: API/Model Unit Tests (Vitest + mongodb-memory-server) ──
echo "┌── LAYER 2: API/Model Unit Tests (33 tests across 6 files)"
echo "│   BUG-02, 03, 04, 05, 25, 28, 37"
echo "│"
if npx vitest run --reporter=verbose 2>&1; then
  echo "│   RESULT: ALL API TESTS PASSED"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "│   RESULT: API TESTS FAILED"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo "└──"
echo ""

# ── Layer 3: Playwright E2E Tests (requires dev server on port 3000) ──
echo "┌── LAYER 3: Playwright E2E Tests"
echo "│   BUG-01, 06–10, 13–17, 19, 21, 26, 27, 29, 31, 33–35, 38"
echo "│   NOTE: Requires running dev server (npm run dev) or auto-starts one"
echo "│"
if npx playwright test --reporter=list 2>&1; then
  echo "│   RESULT: ALL E2E TESTS PASSED"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "│   RESULT: E2E TESTS FAILED"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
echo "└──"
echo ""

# ── Summary ──────────────────────────────────────────────────────────
echo "================================================================"
echo "  FINAL RESULTS"
echo "================================================================"
echo "  Layer 1 (Source scan):  $([ $LAYER1_FAILED -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo ""
if [ $FAIL_COUNT -eq 0 ]; then
  echo "  ALL LAYERS PASSED — Phase 1 bug fixes verified ✓"
  echo "================================================================"
  exit 0
else
  echo "  $FAIL_COUNT LAYER(S) FAILED — review output above"
  echo "================================================================"
  exit 1
fi
