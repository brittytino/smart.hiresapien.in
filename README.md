# Grad360 MBA Platform

Welcome to the **Grad360 MBA** assessment and learning platform. This repository contains the source code for the student exam portal, admin test builder, behavioral gateways, and integrated AI capabilities.

## Architecture: Single Next.js Application (Consolidated)

The architecture has been highly optimized to run as a single, fully-integrated Next.js application on **Port 3000**.
- **No separate microservices**: The Python-based AI services (`studentInsights` & `facultyInsights`) and standalone React report module (`REPORT-PRI-main`) have been fully integrated into native Next.js API Routes and Pages.
- **Single Source of Truth**: All configurations reside in a single root `.env` file.
- **Minimal Footprint**: PM2 clustering controls are set up in `ecosystem.config.js` to run a pure singleton process designed for single-vCPU environments.

## Core Modules

### 1. PRI (Professional Readiness Index)
The primary evaluation module for MBA students, covering domains like Cognitive Intelligence, Business Intelligence, Leadership, and more.

### 2. Full-Page PRI Reports
Interactive, full-page student reports are served natively by Next.js at `/report/[id]`, parsing complex MongoDB `aiInsights` structures securely.

### 3. Workspace Psychology (Behavioral Gateway)
An ipsative psychometric assessment that evaluates 5 core behavioral traits:
- Stress Resilience
- Grit & Initiative
- Professionalism
- Cultural Adaptability
- Accountability

**Scoring Rules & Penalties:**
- **Positive Alignment**: +1.0 point
- **Neutral Alignment**: 0 points
- **Negative Alignment**: -0.5 to -1.0 points
- **Unattended/Skipped**: -1.0 point (Penalty)

### 4. Exam Portal
A proctored, high-security environment for students to complete assessments with features like fullscreen enforcement, tab-switch detection, and real-time scoring.

---

## Technical Documentation
Detailed technical specifications are now organized in the `docs/` directory:

- **Architecture:** 
  - `docs/architecture/Evaluation_Process.md`
  - `docs/architecture/Module_Breakdown[Complete].md`
  - `docs/architecture/pri-test-response-evaluation-flow.md`
- **Features:**
  - `docs/features/PROCTORING_SECURITY.md`
  - `docs/features/PSYCHOMETRIC_EVALUATION.md`
  - `docs/features/PsychometricEngine.md`
- **API Reference:** 
  - `docs/api/ContributorModel.md` (and related files)
- **Setup & Verification:** 
  - `docs/setup/` contains testing verification phases.

---

## Deployment & Verification Commands

**1. Production Launch:**
```bash
# Launch optimized singleton on PM2
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

**2. Verify All Endpoints:**
```bash
# Tests Auth, Data Routes, and deeply integrated AI Routes
./scripts/test-all-apis.sh
```

**3. Run CPU / Architecture Tests:**
```bash
# Verify Circuit Breakers, AI singletons, and route handling
npm run test:api
```
