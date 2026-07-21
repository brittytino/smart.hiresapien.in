"use client";


import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './Header/Header';
import CaseStudy from './CaseStudy/CaseStudy';
import ImagePanel from './ImagePanel/ImagePanel';
import QuestionArea from './QuestionArea/QuestionArea';
import RightPanel from './RightPanel/RightPanel';

// Home component removed — students now launch domains from the dashboard
// DomainNavbar removed from exam UI — test progress moved to dashboard
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';

const initialDomains = [
  { id: 'cognitive-intelligence', name: 'COGNITIVE INTELLIGENCE', time: '09:00 AM - 09:45 AM', questions: [1,2,3,4,5], domainId: 'cognitive-intelligence' },
  { id: 'business-intelligence', name: 'BUSINESS INTELLIGENCE', time: '10:00 AM - 10:45 AM', questions: [1,2,3,4,5], domainId: 'business-intelligence' },
  { id: 'problem-solving', name: 'PROBLEM SOLVING', time: '11:00 AM - 11:45 AM', questions: [1,2,3,4,5], domainId: 'problem-solving' },
  { id: 'communication', name: 'COMMUNICATION', time: '12:00 PM - 12:45 PM', questions: [1,2,3,4,5], domainId: 'communication' },
  { id: 'leadership', name: 'LEADERSHIP', time: '01:00 PM - 01:45 PM', questions: [1,2,3,4,5], domainId: 'leadership' },
  { id: 'digital-business', name: 'DIGITAL BUSINESS', time: '02:00 PM - 02:45 PM', questions: [1,2,3,4,5], domainId: 'digital-business' },
  { id: 'workspace-psychology', name: 'WORKSPACE PSYCHOLOGY GATE', time: '03:00 PM - 03:45 PM', questions: [1,2,3,4,5], domainId: 'workspace-psychology' }
];

export default function ExamPortalMain() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlDomainId = searchParams.get('domainId');

  // Core exam state
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examSessionActive, setExamSessionActive] = useState(false); // true from first domain pick to final submit
  const [selectedSubSkill, setSelectedSubSkill] = useState(null);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [answers, setAnswers] = useState({});
  const [durationSeconds, setDurationSeconds] = useState({});
  const [visited, setVisited] = useState({});
  const [markedRead, setMarkedRead] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [showTerminatedModal, setShowTerminatedModal] = useState(false);
  const [guidelinesAcknowledged, setGuidelinesAcknowledged] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [completedDomains, setCompletedDomains] = useState(new Set());
  const [terminatedDomains, setTerminatedDomains] = useState(new Set());

  // Real data states
  const [domainTimeSlots, setDomainTimeSlots] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [testBankId, setTestBankId] = useState(null);
  const [bankTitle, setBankTitle] = useState("");
  const [bankProgram, setBankProgram] = useState("");
  const [isNoProctoringGraded, setIsNoProctoringGraded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [lastWarningReason, setLastWarningReason] = useState("");
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showFocusLostOverlay, setShowFocusLostOverlay] = useState(false);
  const [showDomainSavedModal, setShowDomainSavedModal] = useState(false);
  const [savedDomainName, setSavedDomainName] = useState('');
  const [showPriCompletedModal, setShowPriCompletedModal] = useState(false);
  const [isProctoringBlackoutActive, setIsProctoringBlackoutActive] = useState(false);
  const [proctoringBlackoutMsg, setProctoringBlackoutMsg] = useState('');
  const [showSubmissionConfirm, setShowSubmissionConfirm] = useState(false);
  const [pendingSubmissionStatus, setPendingSubmissionStatus] = useState(null);
  const [isSubmittingDomain, setIsSubmittingDomain] = useState(false);
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  const [domainSubmitSuccess, setDomainSubmitSuccess] = useState(false);
  const [studentInfo, setStudentInfo] = useState({ id: '', name: '' });
  const [markedForReviewCount, setMarkedForReviewCount] = useState(0);
  const [submissionAnsweredCount, setSubmissionAnsweredCount] = useState(0);
  const [submissionTotalCount, setSubmissionTotalCount] = useState(0);
  const [now, setNow] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0); // Server Time - Client Time
  const [caseStudyMinimized, setCaseStudyMinimized] = useState(false);

  // ── Server Time Helper ────────────────────────────────────────────────────
  const getServerTime = () => Date.now() + timeOffset;

  const to12Hour = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hours = h % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
  };

  // Refs for proctoring — avoid stale closures in event handlers
  const warningCountRef = useRef(0);
  const lastWarningTimeRef = useRef(0);
  const isExamStartedRef = useRef(false);
  const examSessionActiveRef = useRef(false);
  const testBankIdRef = useRef(null);
  const idleTimerRef = useRef(null);
  const triggerWarningRef = useRef(null);
  // Stable setter ref so the proctoring effect can set overlay without re-running
  const setFocusLostOverlayRef = useRef(null);
  // Set to true in beforeunload so refresh/navigation doesn't fire proctoring events
  const isUnloadingRef = useRef(false);
  const examEntryTimeRef = useRef(null); // timestamp when student clicked Continue
  const finalAutoSubmitFiredRef = useRef(false); // guard: prevent double final-submit

  // Keep refs in sync with state
  useEffect(() => { warningCountRef.current = warningCount; }, [warningCount]);
  useEffect(() => { isExamStartedRef.current = isExamStarted; }, [isExamStarted]);
  useEffect(() => { examSessionActiveRef.current = examSessionActive; }, [examSessionActive]);
  useEffect(() => { testBankIdRef.current = testBankId; }, [testBankId]);

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  const durationRef = useRef(durationSeconds);
  useEffect(() => { durationRef.current = durationSeconds; }, [durationSeconds]);
  const allQuestionsRef = useRef(allQuestions);
  useEffect(() => { allQuestionsRef.current = allQuestions; }, [allQuestions]);

  const syncBatchAnswers = async () => {
    if (!testBankIdRef.current) return;
    const currentAnswers = answersRef.current;
    const questionsData = allQuestionsRef.current;
    const batchAnswers = [];

    Object.keys(currentAnswers).forEach(domainId => {
      Object.keys(currentAnswers[domainId]).forEach(qNumStr => {
        const qNum = parseInt(qNumStr, 10);
        const val = currentAnswers[domainId][qNumStr];
        const domainQs = questionsData.filter(q => q.domainId === domainId || q.domainName === domainId);
        if (domainId === 'workspace-psychology') {
          domainQs.sort((a, b) => a.subSkill.localeCompare(b.subSkill));
        }
        const qExact = domainQs[qNum - 1];
        if (qExact && val) {
           const timeTaken = durationRef.current[domainId]?.[qNumStr] || 0;
           batchAnswers.push({
             questionIndex: qExact.index,
             domainId: qExact.domainId || domainId,
             questionType: qExact.questionType,
             selectedOption: qExact.questionType === 'mcq' ? val : undefined,
             answerText: qExact.questionType === 'written' ? val : undefined,
             timeTakenSeconds: timeTaken
           });
        }
      });
    });

    if (batchAnswers.length === 0) return;

    try {
      const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
      await fetch('/api/student/pri-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          questionBankId: testBankIdRef.current,
          action: 'batch_save',
          batchAnswers
        }),
      });
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  };

  useEffect(() => {
    if (!examSessionActive) return;
    const syncInterval = setInterval(() => {
      syncBatchAnswers();
    }, 30000);
    return () => clearInterval(syncInterval);
  }, [examSessionActive]);


  // ─── Data Fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchTestData() {
      const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
      if (!token) return;

      try {
        const res = await fetch('/api/student/pri-test?full=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Handle special status codes before processing exam data
        if (data.code === 'ALREADY_SUBMITTED') {
          showToast('This test is already submitted or terminated. Re-entry is not allowed.', 'info');
          setShowPriCompletedModal(true);
          setLoading(false);
          return;
        }
        if (data.code === 'NO_ACTIVE_TEST') {
          // No exam available yet — Home screen will show appropriate state
          setLoading(false);
          return;
        }

        if (res.ok && data.bank?.id) {
          if (data.serverNow) {
            const serverMs = new Date(data.serverNow).getTime();
            const localMs = Date.now();
            setTimeOffset(serverMs - localMs);
          }
          setTestBankId(data.bank.id);
          if (data.bank?.title) setBankTitle(data.bank.title);
          if (data.bank?.program) setBankProgram(data.bank.program);
          if (data.bank?.isNoProctoringGraded) setIsNoProctoringGraded(true);
          if (data.domains) setDomainTimeSlots(data.domains);
          if (data.questions) {
            setAllQuestions(data.questions);
            if (data.questions.length === 0) {
              showToast('No questions were loaded for this test. Please contact support.', 'error');
            }
          }

          if (data.existingResponse?.answers && data.questions) {
            const restoredAnswers = {};
            data.existingResponse.answers.forEach(a => {
              if (!a.domainId) return;
              if (!restoredAnswers[a.domainId]) restoredAnswers[a.domainId] = {};
              // Find 1-based position of this question within its domain
              const domainQs = data.questions.filter(q => q.domainId === a.domainId);
              const posIdx = domainQs.findIndex(q => q.index === a.questionIndex);
              if (posIdx !== -1) {
                restoredAnswers[a.domainId][posIdx + 1] = a.selectedOption || a.answerText;
              }
            });
            setAnswers(restoredAnswers);
          }

          if (data.existingResponse?.warningCount !== undefined) {
            setWarningCount(data.existingResponse.warningCount);
            warningCountRef.current = data.existingResponse.warningCount;
          }

          // Pre-populate completedDomains from server (persists across page reloads)
          if (data.existingResponse?.submittedDomains?.length) {
            setCompletedDomains(new Set(data.existingResponse.submittedDomains));
          }
          if (data.existingResponse?.terminatedDomains?.length) {
            setTerminatedDomains(new Set(data.existingResponse.terminatedDomains));
          }
          
          // Populate student info for watermark — prefer top-level studentInfo (always present),
          // fall back to existingResponse fields.
          const sInfo = data.studentInfo || {};
          setStudentInfo({
            id: sInfo.studentId || data.existingResponse?.studentId || '',
            name: sInfo.studentName || data.existingResponse?.studentName || ''
          });

          // ── Local Storage Hydration ──────────────────────────────────────
          const localKey = `pri_test_${data.bank.id}`;
          const cached = localStorage.getItem(localKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              // Merge local answers with server answers (server wins on conflict if needed, 
              // but usually local is more 'fresh' during the session)
              setAnswers(prev => ({ ...prev, ...parsed.answers }));
              if (parsed.durationSeconds) setDurationSeconds(prev => ({ ...prev, ...parsed.durationSeconds }));
              setVisited(prev => ({ ...prev, ...parsed.visited }));
              setMarkedRead(prev => ({ ...prev, ...parsed.markedRead }));
            } catch (e) {
              console.error("Failed to hydrate from local storage", e);
            }
          }

          if (urlDomainId && data.domains) {
            const idx = data.domains.findIndex(d => d.domainId === urlDomainId);
            if (idx !== -1) {
              const domain = data.domains[idx];
              setCurrentDomainIndex(idx);
              setSelectedSubSkill(domain);

              // Restore active exam session on page refresh
              const wasSessionActive = sessionStorage.getItem('exam_session_active') === 'true';
              const domainStillOpen = domain.endsAt ? new Date(domain.endsAt).getTime() > getServerTime() : false;
              const domainDone = (data.existingResponse?.submittedDomains || []).includes(domain.domainId);
              const domainTerminated = (data.existingResponse?.terminatedDomains || []).includes(domain.domainId);

              if (wasSessionActive && domainStillOpen && !domainDone && !domainTerminated) {
                setIsExamStarted(true);
                setExamSessionActive(true);
              }
            }
          }
        }
      } catch {
        showToast('Failed to load test data. Please refresh the page.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchTestData();
  }, [urlDomainId]);

  // ─── Proctoring Session Persistence ──────────────────────────────────────
  // Restore proctoring state if refreshing during an active exam session.
  useEffect(() => {
    const wasActive = sessionStorage.getItem('exam_session_active') === 'true';
    if (wasActive && !loading && testBankId) {
      setExamSessionActive(true);
    }
  }, [loading, testBankId]);

  // Handle redirect if no domain is selected after loading
  useEffect(() => {
    if (!loading && !selectedSubSkill && !examSessionActive && typeof window !== 'undefined') {
      router.push('/student');
    }
  }, [loading, selectedSubSkill, router, examSessionActive]);

  // Global time tick for guidelines and domain start checks
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date(getServerTime()));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeOffset]); // re-run if offset updates

  // Safety Sync: Ensure proctoring is enabled ONLY when the test is explicitly started.
  useEffect(() => {
    if (isExamStarted && isNoProctoringGraded && !examSessionActive) {
      setExamSessionActive(true);
    }
  }, [isExamStarted, isNoProctoringGraded, examSessionActive]);

  // ── Local Storage Persistence ───────────────────────────────────────────
  // Save whenever answers/visited/markedRead change — regardless of isExamStarted —
  // so that data is preserved across refreshes even before the student re-clicks Continue.
  useEffect(() => {
    if (testBankId) {
      const localKey = `pri_test_${testBankId}`;
      const dataToSave = { answers, durationSeconds, visited, markedRead };
      localStorage.setItem(localKey, JSON.stringify(dataToSave));
    }
  }, [answers, durationSeconds, visited, markedRead, testBankId]);

  // Sync to sessionStorage to help persistence across reloads during an active test session
  useEffect(() => {
    if (examSessionActive) {
      sessionStorage.setItem('exam_session_active', 'true');
    } else {
      sessionStorage.removeItem('exam_session_active');
    }
  }, [examSessionActive]);

  // ─── Domain Countdown Timer ───────────────────────────────────────────────
  useEffect(() => {
    if (!isExamStarted) return;
    const domain = domainTimeSlots[currentDomainIndex];
    if (!domain) return;

    // Prefer server-computed endsAt ISO (avoids client-side date/timezone bugs).
    // Fall back to domainDate + domainEndTime only when endsAt is absent.
    const calcTimeLeft = () => {
      let endMs = null;
      if (domain.endsAt) {
        endMs = new Date(domain.endsAt).getTime();
      } else if (domain.domainEndTime) {
        const [h, m] = domain.domainEndTime.split(':').map(Number);
        const end = domain.domainDate ? new Date(domain.domainDate) : new Date(getServerTime());
        end.setHours(h, m, 0, 0);
        endMs = end.getTime();
      }
      if (!endMs) return null;
      return Math.max(0, Math.round((endMs - getServerTime()) / 1000));
    };

    const initial = calcTimeLeft();
    if (initial === null) return; // no end time configured
    setTimeLeft(initial);
    const interval = setInterval(() => {
      const t = calcTimeLeft();
      if (t !== null) setTimeLeft(t);
    }, 1000);
    return () => clearInterval(interval);
  }, [isExamStarted, currentDomainIndex, domainTimeSlots]);

  // Auto-submit on timeout
  // Guard: only fire if the student has been in the exam for at least 10 seconds.
  // This prevents an instant false-timeout if the domain's endsAt has already passed
  // by the time the student clicks Continue (stale timer / clock drift scenarios).
  useEffect(() => {
    if (isExamStarted && timeLeft === 0 && domainTimeSlots.length > 0) {
      const elapsed = examEntryTimeRef.current ? getServerTime() - examEntryTimeRef.current : 0;
      if (elapsed < 10000) return; // Domain ended before student even entered — don't auto-submit
      showToast('Domain time has expired. Submitting your answers.', 'info');
      handleSubSkillSubmit('timeout');
    }
  }, [timeLeft, isExamStarted]);

  // ─── Global Test-End Auto-Submit ─────────────────────────────────────────
  // Fires when the last domain's endsAt passes regardless of which screen the
  // student is on (Home, waiting, mid-domain). Submits the final PRI test so
  // no responses are left un-finalised.
  useEffect(() => {
    if (!testBankId || !domainTimeSlots.length) return;

    const lastEndMs = domainTimeSlots.reduce((max, d) => {
      if (!d.endsAt) return max;
      const ms = new Date(d.endsAt).getTime();
      return ms > max ? ms : max;
    }, 0);

    if (!lastEndMs) return;

    const msUntilEnd = lastEndMs - getServerTime();
    if (msUntilEnd <= 0) return; // already expired — server handles on next GET

    const timer = setTimeout(async () => {
      if (finalAutoSubmitFiredRef.current) return; // already handled by per-domain timeout
      finalAutoSubmitFiredRef.current = true;

      const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
      if (!token || !testBankIdRef.current) return;

      try {
        await fetch('/api/student/pri-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'submit_final_test', questionBankId: testBankIdRef.current }),
        });
      } catch (e) {
        console.error('[Global test-end] Failed to auto-submit final test', e);
      }

      showToast('All domain times have ended. Your test has been automatically submitted.', 'info');
      setIsExamStarted(false);
      setExamSessionActive(false);
      sessionStorage.removeItem('exam_session_active');
      setShowPriCompletedModal(true);
    }, msUntilEnd);

    return () => clearTimeout(timer);
  }, [testBankId, domainTimeSlots]);

  // Mark current question as visited
  useEffect(() => {
    if (isExamStarted && domainTimeSlots.length > 0) {
      const domainId = domainTimeSlots[currentDomainIndex].domainId;
      setVisited(prev => ({
        ...prev,
        [domainId]: { ...(prev[domainId] || {}), [currentQuestionNumber]: true }
      }));
    }
  }, [isExamStarted, currentDomainIndex, currentQuestionNumber]);

  // ─── Derived State ────────────────────────────────────────────────────────
  const currentDomain = domainTimeSlots[currentDomainIndex] || initialDomains[currentDomainIndex];

  const domainQuestions = useMemo(() => {
    if (allQuestions.length > 0) {
      const dId = currentDomain?.domainId || currentDomain?.id;
      let filtered = allQuestions.filter(q => q.domainId === dId);
      
      if (filtered.length === 0) {
        filtered = allQuestions.filter(q => q.domainName === currentDomain?.domainName);
      }

      if (dId === 'workspace-psychology') {
        // Sort by subSkill. Since subskill names are like "Stress resilience", "Grit", etc.
        // we can sort them alphabetically or use the original order from DOMAINS if needed.
        // For simplicity and grouping, we sort by subSkill.
        return [...filtered].sort((a, b) => a.subSkill.localeCompare(b.subSkill));
      }
      
      return filtered;
    }
    return [];
  }, [allQuestions, currentDomain]);

  const domainAnswers = answers[currentDomain?.domainId || currentDomain?.id] || {};
  const isLastQuestionInDomain = currentQuestionNumber === domainQuestions.length;
  const isLastDomain = currentDomainIndex === (domainTimeSlots.length > 0 ? domainTimeSlots.length - 1 : initialDomains.length - 1);

  // Submit button becomes visible once 3/4 of the domain's slot time has elapsed
  // (i.e. ≤ 25% of time remains).
  // Uses timeLeft (seconds, updated every second) so it works correctly for short
  // domains (e.g. 2-minute test slots) where minute-level precision is too coarse.
  const isSubmitEnabled = () => {
    if (!currentDomain?.domainStartTime || !currentDomain?.domainEndTime) return true;
    if (timeLeft === null || timeLeft === undefined) return false;
    const parseMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const startMins = parseMinutes(currentDomain.domainStartTime);
    const endMins = parseMinutes(currentDomain.domainEndTime);
    const totalSecs = (endMins - startMins) * 60;
    if (totalSecs <= 0) return true;
    // Visible when remaining seconds ≤ 25% of total (= 75% elapsed)
    return timeLeft <= Math.ceil(totalSecs * 0.25);
  };

  const isTestComplete = isExamStarted && isSubmitEnabled();

  // ─── Toast ────────────────────────────────────────────────────────────────
  const showToast = (text, type = 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // ─── Fullscreen re-entry (requires user gesture — triggered by button click) ──
  const handleReenterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setShowFullscreenPrompt(false);
    } catch {
      showToast('Please allow fullscreen to continue the exam.', 'error');
    }
  };

  // ─── Focus-lost overlay acknowledgement ──────────────────────────────────────
  // Called when the student clicks the acknowledgement button after switching away.
  // Bypasses the 8-second warning cooldown so every tab/window switch is ALWAYS counted.
  const handleFocusLostAcknowledge = async () => {
    setShowFocusLostOverlay(false);

    // Only count as a warning violation during an active question session.
    // Between domains (examSessionActive but isExamStarted = false) the overlay
    // still blocks but does not consume one of the student's 3 warnings.
    if (!isExamStartedRef.current) return;

    // Bypass cooldown — reset last warning time so this always registers.
    lastWarningTimeRef.current = 0;
    await triggerWarning("Tab or window switching detected. This violation has been recorded.");
  };

  // ─── Warning (ref-safe, no stale closures) ────────────────────────────────
  const triggerWarning = async (reason) => {
    if (!isExamStartedRef.current) return;
    const nowTimestamp = getServerTime();
    if (nowTimestamp - lastWarningTimeRef.current < 8000) return;
    lastWarningTimeRef.current = nowTimestamp;

    warningCountRef.current += 1;
    const newCount = warningCountRef.current;
    setWarningCount(newCount);
    setLastWarningReason(reason);
    setShowWarningModal(true);

    // Persist warning count directly to avoid stale persistAnswer closure
    const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
    const bankId = testBankIdRef.current;
    if (bankId && token) {
      try {
        await fetch('/api/student/pri-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ questionBankId: bankId, warningCount: newCount, warningReason: reason }),
        });
      } catch {}
    }

    if (newCount >= 6) {
      setShowWarningModal(false);
      setShowTerminatedModal(true);
      
      const dId = currentDomain?.domainId || currentDomain?.id;

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // Directly exit without going through stale handleSubSkillSubmit
      isExamStartedRef.current = false;
      setIsExamStarted(false);
      examSessionActiveRef.current = false;
      setExamSessionActive(false);
      setSelectedSubSkill(null);

      if (bankId && token && dId) {
        try {
          await fetch('/api/student/pri-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ 
              questionBankId: bankId, 
              action: 'terminate_domain', 
              domainId: dId,
              warningCount: newCount 
            }),
          });
        } catch {}
      }
    }
  };

  // Keep refs always current (no deps — always fresh)
  useEffect(() => { triggerWarningRef.current = triggerWarning; });
  useEffect(() => { setFocusLostOverlayRef.current = setShowFocusLostOverlay; });

  // ─── Proctoring — active for entire exam session ───────────────────────────
  useEffect(() => {
    if (!examSessionActive) {
      clearTimeout(idleTimerRef.current);
      return;
    }

    const handleProctoringWarning = (msg) => {
      setProctoringBlackoutMsg(msg || 'SCREEN NO PROCTORING');
      setIsProctoringBlackoutActive(true);
      setTimeout(() => {
        setIsProctoringBlackoutActive(false);
      }, 3000);
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimerRef.current);
      if (isExamStartedRef.current) {
        idleTimerRef.current = setTimeout(() => {
          triggerWarningRef.current?.("You have been idle for 2 minutes. Please stay active during the exam.");
        }, 2 * 60 * 1000);
      }
    };

    const handleKeyDown = (e) => {
      resetIdleTimer();

      // ── Windows / Meta key (Win, Cmd) ──────────────────────────────────────
      if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        if (examSessionActiveRef.current) {
          triggerWarningRef.current?.("Windows/Command key usage is not allowed during the exam.");
        }
        return;
      }

      // ── Alt combinations — window-switch / close attempts ─────────────────
      if (e.altKey && ['Tab', 'F4', 'Escape'].includes(e.key)) {
        e.preventDefault();
        if (examSessionActiveRef.current) {
          triggerWarningRef.current?.("Switching or closing windows is not allowed during the exam.");
        }
        return;
      }

      // ── F11 fullscreen toggle — prevent exiting fullscreen via keyboard ───
      if (e.key === 'F11') {
        e.preventDefault();
        return;
      }

      // ── All PrintScreen variants ───────────────────────────────────────────
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        (e.metaKey && e.key === 'PrintScreen') ||
        (e.ctrlKey && e.key === 'PrintScreen')
      ) {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch {}
        if (examSessionActiveRef.current) {
          triggerWarningRef.current?.("Screenshot attempt detected. Screenshots are not allowed during the exam.");
        }
        return;
      }

      // ── Win+Shift+S (Snipping Tool) / Win+G (Xbox Game Bar) ──────────────
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (examSessionActiveRef.current) {
          triggerWarningRef.current?.("Screenshot attempt detected. Screenshots are not allowed.");
        }
        return;
      }
      if (e.metaKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        return;
      }

      // ── Developer tools ────────────────────────────────────────────────────
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c', 'k'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }

      // ── Ctrl combinations ──────────────────────────────────────────────────
      if (e.ctrlKey && !e.altKey) {
        const k = e.key.toLowerCase();
        // Source view / print / save / find
        if (['s', 'p', 'u', 'f'].includes(k)) { e.preventDefault(); return; }
        
        // SELECT ALL (Ctrl + A) -> Warning (Non-counting Blackout)
        if (k === 'a') {
          e.preventDefault();
          handleProctoringWarning("SCREEN NO PROCTORING");
          return;
        }

        // Copy / cut / paste — block AND count as Alert
        if (['c', 'x', 'v'].includes(k)) {
          e.preventDefault();
          if (examSessionActiveRef.current) {
            triggerWarningRef.current?.("Copy, cut, and paste are not allowed during the exam.");
          }
          return;
        }
        // Close tab / new tab / new window
        if (['w', 't', 'n'].includes(k)) { e.preventDefault(); return; }
      }

      // ── Escape during exam ─────────────────────────────────────────────────
      if (e.key === 'Escape' && isExamStartedRef.current) {
        e.preventDefault();
        triggerWarningRef.current?.("Exiting fullscreen is not allowed during the exam.");
      }
    };

    // Tab switching — fires whenever the tab becomes hidden.
    // Do NOT just warn — immediately lock the exam with a blocking overlay.
    // The student cannot interact with anything until they return and acknowledge.
    const handleVisibilityChange = () => {
      if (document.hidden && examSessionActiveRef.current && !isUnloadingRef.current) {
        setFocusLostOverlayRef.current?.(true);
      }
    };

    // Window / app switch — fires when the OS window loses focus (Alt+Tab, clicking another app, etc.).
    // Immediately raise the blocking overlay so the student cannot continue answering.
    const handleWindowBlur = () => {
      if (examSessionActiveRef.current && !isUnloadingRef.current) {
        setFocusLostOverlayRef.current?.(true);
        // Best-effort attempt to pull focus back (works in some browsers / OS combinations)
        try { window.focus(); } catch {}
      }
    };

    // Copy / paste / cut DOM events — prevent clipboard access entirely
    const handleCopyPaste = (e) => {
      e.preventDefault();
      if (examSessionActiveRef.current) {
        triggerWarningRef.current?.("Copy and paste are disabled during the exam.");
      }
      return false;
    };

    // Drag — prevents dragging selected text out of the browser or into another app
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      if (examSessionActiveRef.current) {
        handleProctoringWarning("SCREEN NO PROCTORING");
      }
      return false;
    };

    const handleDblClick = (e) => {
      if (!examSessionActiveRef.current) return;
      // Skip double-clicks on options, images, the question navigator, and exam action buttons
      if (e.target.closest('.option-card, .palette-btn, .palette-grid, .questions-grid-container, img, .action-btn, .clear-btn, .mark-read-btn, .next-btn')) return;
      handleProctoringWarning("SCREEN NO PROCTORING");
    };

    // Fullscreen — when lost during session, show blocking overlay that requires
    // a user-gesture button click to re-enter (requestFullscreen needs user gesture).
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && examSessionActiveRef.current) {
        if (isExamStartedRef.current) {
          triggerWarningRef.current?.("Fullscreen mode is required. Please do not exit fullscreen.");
        }
        // Always show the re-enter prompt — silently calling requestFullscreen()
        // without a user gesture fails in most browsers.
        setShowFullscreenPrompt(true);
      } else if (document.fullscreenElement) {
        setShowFullscreenPrompt(false);
      }
    };

    // Page unload / navigation — last line of defence against leaving the exam.
    // Also marks isUnloadingRef so the subsequent visibility/blur events (which
    // fire during a refresh) don't incorrectly trigger a proctoring violation.
    const handleBeforeUnload = (e) => {
      if (examSessionActiveRef.current) {
        isUnloadingRef.current = true;
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleMouseMove = () => resetIdleTimer();

    resetIdleTimer();

    // Use capture phase for keydown so our handler runs before any framework handler
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dblclick", handleDblClick);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(idleTimerRef.current);
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dblclick", handleDblClick);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [examSessionActive]);

  // ─── Exam Actions ─────────────────────────────────────────────────────────
  const handleInitiateExam = (skillName) => {
    let idx = -1;
    if (domainTimeSlots.length > 0) {
      idx = domainTimeSlots.findIndex(d => (d.domainName || d.name) === skillName);
    }
    if (idx === -1) {
      idx = initialDomains.findIndex(d => d.name === skillName);
    }

    const domain = domainTimeSlots.length > 0 ? domainTimeSlots[idx] : initialDomains[idx];
    if (!domain) return;

    const dId = domain.domainId || domain.id;
    const isCompleted = completedDomains.has(dId);
    const isTerminated = terminatedDomains.has(dId);
    
    const parseMin = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const syncedNow = new Date(getServerTime());
    const nowMins = syncedNow.getHours() * 60 + syncedNow.getMinutes();
    const isClosed = domain.domainEndTime && nowMins > parseMin(domain.domainEndTime);

    // 1. Block if terminated
    if (isTerminated) {
      showToast('Access Restricted: Your assessment has been terminated due to proctoring violations.', 'error');
      return;
    }

    // 2. Block if completed
    if (isCompleted) {
      showToast('Access Restricted: You have already submitted this domain.', 'info');
      return;
    }

    // 3. Block if closed/expired
    if (isClosed) {
      showToast('Access Restricted: This domain\'s time slot has already ended.', 'error');
      return;
    }

    // 4. Block if upcoming (not yet started)
    const isUpcoming = domain.domainStartTime && nowMins < parseMin(domain.domainStartTime);
    if (isUpcoming) {
      showToast(`Access Restricted: This domain is scheduled to start at ${to12Hour(domain.domainStartTime)}.`, 'info');
      return;
    }

    // 5. Late entry threshold: block if > 25% of the domain's slot time has elapsed
    if (domain.domainStartTime && domain.domainEndTime) {
      const startMins = parseMin(domain.domainStartTime);
      const endMins = parseMin(domain.domainEndTime);
      const totalMins = endMins - startMins;
      const elapsed = nowMins - startMins;
      
      if (elapsed > 0 && totalMins > 0 && elapsed > totalMins * 0.25) {
        showToast('Late entry is not allowed. More than 25% of this domain\'s exam period has elapsed.', 'error');
        return;
      }
    }

    if (idx !== -1) {
      setCurrentDomainIndex(idx);
      setSelectedSubSkill(domain);
    } else {
      setCurrentDomainIndex(0);
      setSelectedSubSkill(domainTimeSlots.length > 0 ? domainTimeSlots[0] : initialDomains[0]);
    }
  };

  const startTest = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        showToast('Please allow full-screen mode to start the exam. Click CONTINUE again after enabling it.', 'error');
        return;
      }
      if (!document.fullscreenElement) {
        showToast('Full-screen is required. Please enable it in your browser and try again.', 'error');
        return;
      }
    }

    // ── Start Time Validation ──
    const nowTimestamp = getServerTime();
    const syncedNow = new Date(nowTimestamp);
    const domain = domainTimeSlots[currentDomainIndex];
    if (domain?.startsAt) {
      const start = new Date(domain.startsAt);
      if (syncedNow < start) {
        showToast(`This domain is scheduled to start at ${to12Hour(domain.domainStartTime)}. Please wait.`, 'info');
        return;
      }
    } else if (domain?.domainStartTime) {
      const parseMin = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      const nowMins = syncedNow.getHours() * 60 + syncedNow.getMinutes();
      if (nowMins < parseMin(domain.domainStartTime)) {
        showToast(`This domain is scheduled to start at ${to12Hour(domain.domainStartTime)}. Please wait.`, 'info');
        return;
      }
    }

    setGuidelinesAcknowledged(true);
    setIsExamStarted(true);
    setCurrentQuestionNumber(1);
    const startMs = getServerTime();
    setQuestionStartTime(startMs);
    examEntryTimeRef.current = startMs;
    
    // Log start time to backend
    const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
    if (testBankId && token) {
      fetch('/api/student/pri-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionBankId: testBankId, action: 'start_test' }),
      }).catch(() => {});
    }
  };

  const handleAgreementChange = async (e) => {
    const isChecked = e.target.checked;
    setAgreedToGuidelines(isChecked);
    
    if (isChecked) {
      // 1. Enter Fullscreen
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          showToast('Fullscreen denied. Please enable it manually to proceed.', 'error');
        }
      }
      
      // 2. Enable Proctoring logic
      setExamSessionActive(true);
      showToast('Proctoring & Fullscreen Session Active. You are now being monitored.', 'info');
    } else {
      // Optional: Drop proctoring if they uncheck before starting?
      // For security, once they agree, we could keep it on, but standard UX says uncheck = undo.
      setExamSessionActive(false);
    }
  };

  const handleAnswerSelect = (optionId) => {
    setAnswers(prev => ({
      ...prev,
      [currentDomain.domainId || currentDomain.id]: {
        ...(prev[currentDomain.domainId || currentDomain.id] || {}),
        [currentQuestionNumber]: optionId
      }
    }));
  };
  
  const accumulateTime = () => {
    if (!isExamStarted || !questionStartTime) return;
    const nowTimestamp = getServerTime();
    const diff = Math.round((nowTimestamp - questionStartTime) / 1000);
    if (diff <= 0) return;

    const dId = currentDomain.domainId || currentDomain.id;
    setDurationSeconds(prev => ({
      ...prev,
      [dId]: {
        ...(prev[dId] || {}),
        [currentQuestionNumber]: (prev[dId]?.[currentQuestionNumber] || 0) + diff
      }
    }));
    setQuestionStartTime(nowTimestamp);
  };

  const persistAnswer = async (domainId, questionIdx, questionType, answer, action, status, updatedWarningCount, timeTaken) => {
    if (!testBankId) return;
    try {
      const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
      await fetch('/api/student/pri-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionBankId: testBankId,
          questionIndex: questionIdx,
          domainId: domainId,
          questionType: questionType,
          selectedOption: questionType === 'mcq' ? answer : undefined,
          answerText: questionType === 'written' ? answer : undefined,
          action,
          status,
          warningCount: updatedWarningCount !== undefined ? updatedWarningCount : warningCount,
          timeTakenSeconds: timeTaken
        }),
      });
    } catch {
      showToast('Failed to save answer. Check your connection.', 'error');
    }
  };

  const clearResponse = () => {
    const dId = currentDomain.domainId || currentDomain.id;
    const currentQ = domainQuestions[currentQuestionNumber - 1];

    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (newAnswers[dId]) delete newAnswers[dId][currentQuestionNumber];
      return newAnswers;
    });

    if (currentQ) {
      persistAnswer(currentQ.domainId, currentQ.index, currentQ.questionType, null, 'clear');
    }
  };

  const handleMarkAsRead = (forceValue) => {
    const dId = currentDomain.domainId || currentDomain.id;
    setMarkedRead(prev => ({
      ...prev,
      [dId]: { 
        ...(prev[dId] || {}), 
        [currentQuestionNumber]: forceValue !== undefined ? forceValue : !prev[dId]?.[currentQuestionNumber] 
      }
    }));

    const currentQ = domainQuestions[currentQuestionNumber - 1];
    const currentAns = domainAnswers[currentQuestionNumber];
    if (currentQ && currentAns) {
      persistAnswer(currentQ.domainId, currentQ.index, currentQ.questionType, currentAns);
    }
  };

  const handleSubSkillSubmit = async (finalStatus) => {
    accumulateTime();
    // Show confirmation modal for manual submissions
    if (finalStatus === 'submitted' && !showSubmissionConfirm) {
      const dId = currentDomain.domainId || currentDomain.id;
      const reviewCount = Object.keys(markedRead[dId] || {}).filter(k => markedRead[dId][k]).length;
      const answeredCount = Object.keys(answers[dId] || {}).filter(k => answers[dId][k]).length;
      const totalCount = domainQuestions.length;
      setMarkedForReviewCount(reviewCount);
      setSubmissionAnsweredCount(answeredCount);
      setSubmissionTotalCount(totalCount);
      setPendingSubmissionStatus(finalStatus);
      setShowSubmissionConfirm(true);
      return;
    }

    setShowSubmissionConfirm(false);
    setIsSubmittingDomain(true);
    setDomainSubmitSuccess(false);

    // Before submitting the domain, do a final batch push to ensure everything is saved to DB
    await syncBatchAnswers();

    // Blank submission guard — require at least 1 answer for manual submissions.
    // Skip only for timeout (system-forced) since we handle 0-answer timeout above.
    if (finalStatus !== 'timeout') {
      const totalQs = domainQuestions.length;
      const answeredQs = Object.keys(domainAnswers).filter(k => domainAnswers[k]).length;
      const minRequired = Math.max(1, Math.ceil(totalQs * 0.25));
      if (totalQs > 0 && answeredQs < minRequired) {
        setIsSubmittingDomain(false);
        showToast(
          `Please answer at least ${minRequired} question(s) before submitting (${answeredQs}/${totalQs} answered).`,
          'error'
        );
        return;
      }
    }

    // Manual submission
    if (finalStatus === 'submitted') {
      const dId = currentDomain.domainId || currentDomain.id;
      const dName = currentDomain.domainName || currentDomain.name || 'Domain';
      setCompletedDomains(prev => new Set([...prev, dId]));
      
      try {
        const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
        await fetch('/api/student/pri-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            questionBankId: testBankId,
            action: 'submit_domain',
            domainId: dId,
            domainName: currentDomain.domainName || currentDomain.name,
            domainEnteredAt: examEntryTimeRef.current ? new Date(examEntryTimeRef.current).toISOString() : null,
            scheduledStartTime: currentDomain.domainStartTime,
            scheduledEndTime: currentDomain.domainEndTime,
          }),
        });

        // If this is the last domain, also submit the full test
        if (isLastDomain) {
          finalAutoSubmitFiredRef.current = true;
          await fetch('/api/student/pri-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ questionBankId: testBankId, action: 'submit_final_test' }),
          });
        }

        setDomainSubmitSuccess(true);
        setIsSubmittingDomain(false);
        
        setIsExamStarted(false);
        setSelectedSubSkill(null);
        setExamSessionActive(false);
        sessionStorage.removeItem('exam_session_active');

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }

        if (isLastDomain) {
          setShowPriCompletedModal(true);
        } else {
          setShowDomainSavedModal(true);
          setSavedDomainName(dName);
        }
      } catch (e) {
        console.error('Failed to mark domain as submitted', e);
        setIsSubmittingDomain(false);
        showToast('Failed to submit. Please check your connection and try again.', 'error');
      }
      return;
    }

    if (finalStatus === 'timeout') {
      const dId = currentDomain.domainId || currentDomain.id;
      const dName = currentDomain.domainName || currentDomain.name || 'Domain';
      setCompletedDomains(prev => new Set([...prev, dId]));

      try {
        const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
        await fetch('/api/student/pri-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            questionBankId: testBankId,
            action: 'submit_domain',
            domainId: dId,
            domainName: currentDomain.domainName || currentDomain.name,
            domainEnteredAt: examEntryTimeRef.current ? new Date(examEntryTimeRef.current).toISOString() : null,
            scheduledStartTime: currentDomain.domainStartTime,
            scheduledEndTime: currentDomain.domainEndTime,
          }),
        });

        // If this was the last domain, auto-submit the entire test
        if (isLastDomain) {
          finalAutoSubmitFiredRef.current = true;
          await fetch('/api/student/pri-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ questionBankId: testBankId, action: 'submit_final_test' }),
          });
        }
        
        setDomainSubmitSuccess(true);
        setIsSubmittingDomain(false);
        setIsExamStarted(false);
        setSelectedSubSkill(null);
        setExamSessionActive(false);
        sessionStorage.removeItem('exam_session_active');

        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        
        setShowAutoSubmitModal(true);
      } catch (e) {
        console.error('Failed to mark domain as submitted (timeout)', e);
        setIsSubmittingDomain(false);
        // On timeout failure, we should still probably redirect or show an error but the app shouldn't hang.
        router.push('/student');
      }
    }
  };

  // Called when student acknowledges the "domain saved" popup — redirects to student dashboard
  const handleDomainSavedAcknowledge = () => {
    setShowDomainSavedModal(false);
    setSavedDomainName('');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    window.close();
    router.push('/student');
  };

  // Called when student acknowledges the "PRI completed" popup — ends session and navigates away
  const handlePriCompletedAcknowledge = () => {
    setShowPriCompletedModal(false);
    setExamSessionActive(false);
    setShowFocusLostOverlay(false);
    setShowFullscreenPrompt(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    window.close();
    router.push('/student');
  };

  const handlePortalExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    window.close();
    router.push('/student');
  };

  const handleNext = async () => {
    accumulateTime();
    const currentQ = domainQuestions[currentQuestionNumber - 1];
    const currentAns = domainAnswers[currentQuestionNumber];

    if (currentQ && currentAns) {
      // Clear review status if answered
      const dId = currentDomain.domainId || currentDomain.id;
      if (markedRead[dId]?.[currentQuestionNumber]) {
        setMarkedRead(prev => ({
          ...prev,
          [dId]: { ...prev[dId], [currentQuestionNumber]: false }
        }));
      }
    }

    // Only advance if not on the last question — the Submit Test button handles domain submission.
    if (!isLastQuestionInDomain) {
      setCurrentQuestionNumber(prev => prev + 1);
      setQuestionStartTime(getServerTime());
    }
  };

  const handlePrevious = () => {
    accumulateTime();
    if (currentQuestionNumber > 1) {
      setCurrentQuestionNumber(prev => prev - 1);
      setQuestionStartTime(getServerTime());
    }
  };

  const handleQuestionClick = (domainIndex, qNum) => {
    if (qNum === currentQuestionNumber) return;
    accumulateTime();
    setCurrentDomainIndex(domainIndex);
    setCurrentQuestionNumber(qNum);
    setQuestionStartTime(getServerTime());
  };

  const getQuestionStatus = (domainId, qNum) => {
    const isAnswered = answers[domainId]?.[qNum] !== undefined;
    const isMarked = markedRead[domainId]?.[qNum];
    const isVisited = visited[domainId]?.[qNum];
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (isVisited) return 'not-answered';
    return 'not-visited';
  };

  // ─── Dynamic layout helper ────────────────────────────────────────────────
  const currentQ = domainQuestions[currentQuestionNumber - 1];
  const hasCaseContent = !!(currentQ && (currentQ.caseContext || currentQ.questionImageUrl || currentQ.caseContextImageUrl));

  // ─── Render ───────────────────────────────────────────────────────────────
  // Text obfuscation: prevent text selection and drag during active exam session
  const examContentStyle = examSessionActive ? {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitUserDrag: 'none',
  } : {};

  return (
    <div className={`app-container ${examSessionActive ? 'proctoring-active' : ''}`} style={examContentStyle}>
      <div className="main-content">
        <Header
          onBack={!isExamStarted ? handlePortalExit : null}
          title={isExamStarted ? currentDomain.domainName || currentDomain.name : null}
          onSubmitTest={isExamStarted ? handleSubSkillSubmit : null}
          isTestComplete={isTestComplete}
          isLastDomain={isLastDomain}
          isNoProctoringGraded={isNoProctoringGraded}
          timeLeft={isExamStarted ? timeLeft : null}
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="loader">Loading Test...</div>
          </div>
        ) : !selectedSubSkill ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '1rem' }}>
            <div className="loader">Redirecting to Dashboard...</div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Please select a domain from your active schedule.
            </p>
          </div>
        ) : !isExamStarted ? (
          <div className="guidelines-container">
            <div className="guidelines-header-small">{currentDomain.domainName || currentDomain.name}</div>

            {guidelinesAcknowledged ? (
              // Simplified screen for subsequent domains — no need to re-read guidelines
              <>
                <h1 className="guidelines-title">READY FOR NEXT DOMAIN?</h1>
                <p className="guidelines-subtitle" style={{ color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
                  You have already acknowledged the exam guidelines. Click CONTINUE to begin{' '}
                  <strong>{currentDomain.domainName || currentDomain.name}</strong>.
                </p>
                <div className="guidelines-card" style={{ maxWidth: '480px', margin: '0 auto 32px' }}>
                  <ul className="guidelines-list">
                    <li>
                      <span>Proctoring is active: No tab/window switching, no exiting fullscreen, and no right-click/double-tap.</span>
                    </li>
                    <li>
                      <span>The SUBMIT button will enable only after 75% of the exam time has elapsed.</span>
                    </li>
                  </ul>
                </div>
                <button className="guidelines-continue-btn" onClick={startTest}>
                  CONTINUE TO {(currentDomain.domainName || currentDomain.name || '').toUpperCase()}
                </button>
              </>
            ) : (
              // Full guidelines — shown only once per session
              <>
                <h1 className="guidelines-title">EXAM GUIDELINES</h1>
                <p className="guidelines-subtitle" style={{ color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
                  Please read the following instructions carefully before starting your assessment.
                </p>

                <div className="guidelines-card">
                  <div className="guidelines-card-header">
                    <span>OPERATIONAL GUIDELINES</span>
                  </div>

                  <ul className="guidelines-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {[
                      'This assessment must be taken in full-screen Safe Exam Browser (SEB) mode. Exiting, minimizing, or switching applications is not permitted.',
                      'No malpractice is allowed. Use of mobile phones, notes, external devices, or any third-party assistance is strictly prohibited.',
                      'Only one login and one attempt per candidate is permitted. Multiple sessions or reattempts are not allowed.',
                      'Any unauthorized action, refresh, or system manipulation will be logged and may result in automatic disqualification.',
                      'Screenshots, screen recording, and developer tools are blocked. Attempting to capture the screen will trigger an automatic warning.',
                      'Advanced proctoring is enabled. Tab/window switching, right-clicking, and text selection (including double-tapping) are strictly prohibited.',
                      'The SUBMIT button will enable only after 75% of the duration has passed. You cannot submit or leave the examination before this time.',
                      'You will receive a maximum of 5 warnings. On the 6th violation, your test will be terminated and submitted immediately.',
                    ].map((text, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                        <div
                          style={{
                            flexShrink: 0,
                            width: '12px',
                            height: '12px',
                            borderRadius: '999px',
                            backgroundColor: '#D62027',
                            marginTop: '6px',
                          }}
                        />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Guidelines Agreement Checkbox inside card */}
                  <div className="guidelines-agreement-section">
                    <label className="agreement-label">
                      <div className="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          id="guidelines-agreement"
                          checked={agreedToGuidelines}
                          onChange={handleAgreementChange}
                        />
                        <div className="custom-checkbox">
                          {agreedToGuidelines && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="agreement-text">
                        I have read, understood, and agree to abide by the above guidelines and proctoring policies. I understand that any violation will be recorded and reported.
                      </span>
                    </label>
                  </div>
                </div>

                {(() => {
                  const domain = domainTimeSlots[currentDomainIndex];
                  const parseMin = (t) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
                  const syncedNow = now || new Date(getServerTime());
                  const nowMins = syncedNow.getHours() * 60 + syncedNow.getMinutes();
                  
                  let isUpcoming = false;
                  let startsInLabel = '';
                  
                  if (domain?.startsAt) {
                    const start = new Date(domain.startsAt);
                    if (syncedNow < start) {
                      isUpcoming = true;
                      const diff = start.getTime() - syncedNow.getTime();
                      const h = Math.floor(diff / 3600000);
                      const m = Math.floor((diff % 3600000) / 60000);
                      const s = Math.floor((diff % 60000) / 1000);
                      startsInLabel = `Starts in ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                    }
                  } else if (domain?.domainStartTime) {
                    const domainStartMins = parseMin(domain.domainStartTime);
                    if (nowMins < domainStartMins) {
                      isUpcoming = true;
                      // build a Starts In label from domain.domainStartTime (local day)
                      const [sh, sm] = domain.domainStartTime.split(':').map(Number);
                      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sh, sm, 0, 0);
                      if (startDate.getTime() > now.getTime()) {
                        const diff = startDate.getTime() - now.getTime();
                        const h = Math.floor(diff / 3600000);
                        const m = Math.floor((diff % 3600000) / 60000);
                        const s = Math.floor((diff % 60000) / 1000);
                        startsInLabel = `Starts in ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                      }
                    }
                  }

                  // Compute end time label to show as the primary banner message
                  let endTimeLabel = '';
                  if (domain?.endsAt) {
                    try {
                      const t = new Date(domain.endsAt).toTimeString().slice(0,5); // HH:MM
                      endTimeLabel = to12Hour(t);
                    } catch (e) {
                      endTimeLabel = '';
                    }
                  } else if (domain?.domainEndTime) {
                    endTimeLabel = to12Hour(domain.domainEndTime);
                  }

                  return (
                    <>
                      {isUpcoming && (
                        <div className="upcoming-banner" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', borderRadius: '16px', background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid #334155', color: '#fff', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Test Begins In</div>
                          {startsInLabel ? (
                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                              {startsInLabel.replace('Starts in ', '').split(':').map((val, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ffffff0a', border: '1px solid #ffffff1a', borderRadius: '12px', padding: '12px 20px', minWidth: '80px' }}>
                                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: '1' }}>{val}</span>
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>{['Hours', 'Minutes', 'Seconds'][idx]}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>AWAITING START TIME</div>
                          )}
                          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '20px', fontWeight: 600 }}>Scheduled start: {to12Hour(domain.domainStartTime || domain.startsAt?.split('T')[1]?.slice(0,5) || '')} • Ends at {endTimeLabel || to12Hour(domain.domainEndTime || domain.endsAt?.split('T')[1]?.slice(0,5) || '')}</div>
                        </div>
                      )}

                      <button 
                        className={`guidelines-continue-btn ${(!agreedToGuidelines || isUpcoming) ? 'disabled-btn' : ''}`} 
                        onClick={startTest}
                        disabled={!agreedToGuidelines || isUpcoming}
                        style={{
                          backgroundColor: isUpcoming ? '#94a3b8' : undefined,
                          cursor: isUpcoming ? 'not-allowed' : undefined
                        }}
                      >
                        {isUpcoming ? (startsInLabel || 'AWAITING START TIME') : 'CONTINUE TO ASSESSMENT'}
                      </button>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        ) : (
          <div className="active-exam-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div className="exam-content-layout" style={{ display: 'grid', gridTemplateRows: '1fr', height: '100%', overflow: 'hidden' }}>
              {/* Left navbar removed per request (test progress hidden) */}
              <div className="exam-main-panel" style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#f8fafc', width: '100%' }}>
                <div className="content-area-wrapper" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: hasCaseContent 
                    ? (caseStudyMinimized ? '64px 1fr 350px' : 'minmax(300px, 450px) 1fr 350px') 
                    : '1fr 350px',
                  height: '100%',
                  padding: '24px', 
                  gap: '24px',
                  overflow: 'hidden',
                  transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {/* LEFT: Case Study or Image Panel */}
                  {hasCaseContent && (() => {
                    const q = domainQuestions[currentQuestionNumber - 1];
                    if (!q) return null;

                    if (caseStudyMinimized) {
                      return (
                        <div 
                          className="case-study-minimized-rail"
                          onClick={() => setCaseStudyMinimized(false)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '16px 0',
                            cursor: 'pointer',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{ marginBottom: '24px', color: '#64748b' }}>
                            <Maximize2 size={20} />
                          </div>
                          <div style={{
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            whiteSpace: 'nowrap',
                            color: '#0f172a',
                            fontWeight: 800,
                            fontSize: '12px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            opacity: 0.6
                          }}>
                            {q.caseContext ? 'CASE STUDY' : 'REFERENCE IMAGE'}
                          </div>
                        </div>
                      );
                    }

                    if (q.questionImageUrl && !q.caseContext) {
                      return (
                        <div className="case-study-column" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                            <button 
                              onClick={() => setCaseStudyMinimized(true)}
                              style={{ padding: '6px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Minimize2 size={16} />
                            </button>
                          </div>
                          <ImagePanel src={q.questionImageUrl} />
                        </div>
                      );
                    }

                    return (
                      <div className="case-study-column" key={`case-${currentQuestionNumber}`} style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                          <button 
                            onClick={() => setCaseStudyMinimized(true)}
                            style={{ padding: '6px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Minimize2 size={16} />
                          </button>
                        </div>
                        {q.caseContext && <CaseStudy content={q.caseContext} />}
                        {q.caseContextImageUrl && (
                          <div style={{ marginTop: '1.5rem' }}>
                            <ImagePanel src={q.caseContextImageUrl} />
                          </div>
                        )}
                        {q.questionImageUrl && q.caseContext && (
                          <div style={{ marginTop: '1.5rem' }}>
                            <ImagePanel src={q.questionImageUrl} />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MIDDLE: Question Area */}
                  <div
                    className="question-column"
                    style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}
                  >
                    <QuestionArea
                      key={`${currentDomain.domainId || currentDomain.id}-${currentQuestionNumber}`}
                      currentDomain={currentDomain}
                      currentQuestion={currentQuestionNumber}
                      totalQuestions={domainQuestions.length}
                      questionData={domainQuestions[currentQuestionNumber - 1]}
                      selectedAnswer={domainAnswers[currentQuestionNumber]}
                      onAnswerSelect={handleAnswerSelect}
                      onNext={handleNext}
                      onPrevious={handlePrevious}
                      onClearResponse={clearResponse}
                      onMarkAsRead={handleMarkAsRead}
                      isMarked={markedRead[currentDomain.domainId || currentDomain.id]?.[currentQuestionNumber]}
                      isLastQuestionInDomain={isLastQuestionInDomain}
                      isLastDomain={isLastDomain}
                    />
                  </div>

                  {/* RIGHT: Status Palette */}
                  <RightPanel
                    domains={[currentDomain]}
                    domainQuestions={domainQuestions}
                    currentDomainIndex={0}
                    currentQuestion={currentQuestionNumber}
                    onQuestionClick={(idx, qNum) => handleQuestionClick(currentDomainIndex, qNum)}
                    getQuestionStatus={getQuestionStatus}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: '40px' }}>⚠️</span>
            </div>
            <h2 style={{ color: '#991b1b', fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Security Violation Detected</h2>
            <p style={{ color: '#4b5563', fontSize: '16px', marginBottom: '8px', lineHeight: 1.5 }}>{lastWarningReason}</p>
            <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', margin: '20px 0', border: '1px solid #fee2e2' }}>
              <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '14px', margin: 0 }}>Warning {warningCount} of 6</p>
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '32px' }}>
              You will receive a maximum of 5 warnings. On the 6th warning your test will be terminated and submitted immediately.
            </p>
            <button
              onClick={() => {
                setShowWarningModal(false);
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              style={{ backgroundColor: '#dc2626', color: 'white', padding: '12px 32px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}

      {/* Terminated Modal */}
      {showTerminatedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '48px 40px', borderRadius: '16px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: '40px' }}>🚫</span>
            </div>
            <h2 style={{ color: '#991b1b', fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Test Terminated</h2>
            <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Your test has been automatically submitted due to multiple security violations. Please contact your institution administrator.
            </p>
            <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fee2e2', marginBottom: '32px' }}>
              <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '13px', margin: 0 }}>6 Proctoring Warnings Exceeded — Test Terminated</p>
            </div>
            <button
              onClick={() => router.push('/student')}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '14px 0',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '15px',
                letterSpacing: '0.5px',
                width: '100%',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              RETURN TO HOME PAGE
            </button>
          </div>
        </div>
      )}

      {/* Domain Saved Confirmation Modal — shown after a non-final domain is submitted */}
      {showDomainSavedModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 99999, padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white', padding: '48px 40px', borderRadius: '16px',
            maxWidth: '480px', width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: '80px', height: '80px', backgroundColor: '#dcfce7', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 style={{ color: '#15803d', fontSize: '22px', fontWeight: 900, marginBottom: '10px' }}>
              Responses Saved!
            </h2>
            <p style={{ color: '#1e293b', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              {savedDomainName}
            </p>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
              Your responses for this domain have been saved successfully.
              Please wait on the home screen for the next domain's time slot to open.
            </p>
            <button
              onClick={handleDomainSavedAcknowledge}
              style={{
                backgroundColor: '#16a34a', color: 'white', padding: '13px 0',
                borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer',
                fontSize: '15px', width: '100%', letterSpacing: '0.5px',
              }}
            >
              OK — RETURN TO HOME SCREEN
            </button>
          </div>
        </div>
      )}

      {/* PRI Test Completed Modal — shown after the final domain is submitted */}
      {showPriCompletedModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 99999, padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white', padding: '52px 40px', borderRadius: '16px',
            maxWidth: '500px', width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              width: '90px', height: '90px', background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 28px',
              boxShadow: '0 4px 24px rgba(22,163,74,0.25)',
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 style={{ color: '#15803d', fontSize: '26px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              PRI Test Completed!
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
              All Domains Submitted
            </p>
            <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.8, marginBottom: '32px' }}>
              All your responses across every domain have been saved successfully.
              Your PRI assessment is now complete and has been submitted for evaluation.
            </p>
            <div style={{
              backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '10px', padding: '14px 18px', marginBottom: '32px',
            }}>
              <p style={{ color: '#15803d', fontWeight: 700, fontSize: '13px', margin: 0 }}>
                ✓ Responses recorded &nbsp;·&nbsp; ✓ Test submitted &nbsp;·&nbsp; ✓ Evaluation pending
              </p>
            </div>
            <button
              onClick={handlePriCompletedAcknowledge}
              style={{
                background: 'linear-gradient(135deg,#16a34a,#15803d)', color: 'white',
                padding: '15px 0', borderRadius: '8px', border: 'none',
                fontWeight: 900, cursor: 'pointer', fontSize: '16px',
                width: '100%', letterSpacing: '0.5px',
                boxShadow: '0 4px 14px rgba(22,163,74,0.4)',
              }}
            >
              DONE
            </button>
          </div>
        </div>
      )}

      {/* Focus-Lost Blocker — raised immediately on any tab/window switch.
          zIndex is higher than every other modal so nothing can be clicked behind it.
          Student cannot dismiss it — only the acknowledgement button works, which also
          counts as a proctoring violation. */}
      {showFocusLostOverlay && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.98)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 99999999, padding: '20px',
          // Pointer-events on the backdrop: do nothing on click (only the button works)
        }}>
          <div
            style={{
              backgroundColor: 'white', padding: '48px 40px', borderRadius: '16px',
              maxWidth: '500px', width: '100%', textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9)',
            }}
            // Stop click propagation so clicking the card doesn't trigger blur again
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '90px', height: '90px', backgroundColor: '#fee2e2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}>
              <span style={{ fontSize: '44px' }}>🚨</span>
            </div>
            <h2 style={{ color: '#991b1b', fontSize: '24px', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Exam Suspended
            </h2>
            <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.7, marginBottom: '8px' }}>
              You switched away from the exam window. This action is <strong>strictly prohibited</strong> and has been recorded as a proctoring violation.
            </p>
            <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
              The exam was paused the moment you left. You cannot answer or navigate questions while outside this window.
            </p>
            <div style={{
              backgroundColor: '#fef2f2', padding: '12px 16px', borderRadius: '8px',
              marginBottom: '28px', border: '1px solid #fecaca',
            }}>
              <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '13px', margin: 0 }}>
                {warningCount >= 5
                  ? `⚠️ Warning ${warningCount + 1} of 6 — ONE MORE VIOLATION WILL TERMINATE YOUR TEST.`
                  : `⚠️ This will count as Warning ${warningCount + 1} of 6.`}
              </p>
            </div>
            <button
              onClick={handleFocusLostAcknowledge}
              style={{
                backgroundColor: '#dc2626', color: 'white', padding: '14px 0',
                borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer',
                fontSize: '15px', letterSpacing: '0.5px', width: '100%',
              }}
            >
              I UNDERSTAND — RETURN TO EXAM
            </button>
            <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '14px', lineHeight: 1.5 }}>
              All violations are logged and reported to your institution administrator.
            </p>
          </div>
        </div>
      )}

      {/* Fullscreen Lock Overlay — blocks ALL interaction until student re-enters fullscreen.
          Must be rendered above warning / terminated modals so it cannot be dismissed by clicking behind it. */}
      {showFullscreenPrompt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.97)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 999999, padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white', padding: '48px 40px', borderRadius: '16px',
            maxWidth: '480px', width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
          }}>
            <div style={{
              width: '80px', height: '80px', backgroundColor: '#fef3c7', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}>
              <span style={{ fontSize: '40px' }}>🔒</span>
            </div>
            <h2 style={{ color: '#92400e', fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>
              Fullscreen Required
            </h2>
            <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
              You have exited fullscreen mode. The exam must be conducted in fullscreen at all times.
              Click the button below to return and continue your exam.
            </p>
            {warningCount > 0 && (
              <div style={{
                backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px',
                marginBottom: '24px', border: '1px solid #fee2e2',
              }}>
                <p style={{ color: '#dc2626', fontWeight: 700, fontSize: '13px', margin: 0 }}>
                  Warning {warningCount} of 5 — Further violations will terminate your test automatically.
                </p>
              </div>
            )}
            <button
              onClick={handleReenterFullscreen}
              style={{
                backgroundColor: '#d97706', color: 'white', padding: '14px 36px',
                borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer',
                fontSize: '15px', letterSpacing: '0.5px', width: '100%',
              }}
            >
              RETURN TO FULLSCREEN
            </button>
          </div>
        </div>
      )}

      {/* Proctoring Blackout Overlay for non-counting warnings */}
      {isProctoringBlackoutActive && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'black', zIndex: 1000000, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'white', textAlign: 'center', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            fontSize: '48px', fontWeight: 950, letterSpacing: '-2px',
            marginBottom: '10px', textTransform: 'uppercase'
          }}>
            {proctoringBlackoutMsg}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7, letterSpacing: '1px' }}>
            SECURITY VIOLATION DETECTED · SESSION MONITORED
          </div>
        </div>
      )}

      {showSubmissionConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25)' }}>

             {/* Header */}
             <div style={{ padding: '32px 32px 24px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
              {isSubmittingDomain && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.95)', zIndex: 10,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease'
                }}>
                  <div className="loader" style={{ marginBottom: '16px', borderTopColor: '#0f172a' }}></div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>SUBMITTING...</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>Confirming data persistence...</div>
                </div>
              )}
               <div style={{ width: '48px', height: '48px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid #e2e8f0' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Submit {currentDomain?.domainName || 'Domain'}?
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 500, letterSpacing: '0.2px' }}>
                Review your progress before confirming
              </p>
            </div>

            <div style={{ padding: '24px 32px' }}>
              {/* Question stats table with standard UI rules */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search status..." 
                    style={{ 
                      width: '100%', 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px', 
                      padding: '8px 12px 8px 36px', 
                      color: '#0f172a', 
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <select style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', color: '#0f172a', fontSize: '13px', outline: 'none' }}>
                  <option>All Status</option>
                  <option>Answered</option>
                  <option>Unanswered</option>
                  <option>Reviewed</option>
                </select>
              </div>

              <div style={{ 
                maxHeight: '250px', 
                overflowY: 'auto', 
                padding: '4px 0',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Answered</td>
                    <td style={{ padding: '14px 16px', fontSize: '15px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{submissionAnsweredCount}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Unanswered</td>
                    <td style={{ padding: '14px 16px', fontSize: '15px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{submissionTotalCount - submissionAnsweredCount}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>Reviewed</td>
                    <td style={{ padding: '14px 16px', fontSize: '15px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>{markedForReviewCount}</td>
                  </tr>
                </tbody>
                </table>
              </div>

              {/* Info notices */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', backgroundColor: '#fefce8', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#78350f', lineHeight: 1.5 }}>
                    Once submitted, <strong>your answers cannot be changed</strong> and you will not be able to re-enter this domain.
                  </p>
                </div>
                {markedForReviewCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#1e40af', lineHeight: 1.5 }}>
                      You have <strong>{markedForReviewCount} question{markedForReviewCount > 1 ? 's' : ''} marked for review</strong>. They will be submitted with their current answers.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowSubmissionConfirm(false)}
                  style={{ flex: 1, backgroundColor: 'white', color: '#374151', padding: '14px 0', borderRadius: '8px', border: '1px solid #d1d5db', fontWeight: 600, cursor: 'pointer', fontSize: '13px', letterSpacing: '0.5px' }}
                >
                  GO BACK
                </button>
                <button
                  onClick={() => handleSubSkillSubmit(pendingSubmissionStatus)}
                  style={{ flex: 1, backgroundColor: '#0f172a', color: 'white', padding: '14px 0', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '13px', letterSpacing: '0.5px' }}
                >
                  CONFIRM & SUBMIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Submit Timeout Modal */}
      {showAutoSubmitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white', padding: '48px 40px', borderRadius: '16px',
            maxWidth: '480px', width: '100%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            animation: 'modalEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes modalEnter {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `}} />
            <div style={{
              width: '80px', height: '80px', backgroundColor: '#fef2f2', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              border: '1px solid #fee2e2'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 style={{ color: '#991b1b', fontSize: '22px', fontWeight: 900, marginBottom: '10px' }}>
              TIME EXPIRED!
            </h2>
            <p style={{ color: '#1e293b', fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
              Auto-Submission Complete
            </p>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
              Your time for this domain has ended. Your responses have been automatically saved and submitted to ensure no progress is lost.
            </p>
            <button
              onClick={() => {
                setShowAutoSubmitModal(false);
                router.push('/student');
              }}
              style={{
                backgroundColor: '#dc2626', color: 'white', padding: '13px 0',
                borderRadius: '8px', border: 'none', fontWeight: 800, cursor: 'pointer',
                fontSize: '15px', width: '100%', letterSpacing: '0.5px',
              }}
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      )}

      {/* Watermark Overlay */}
      {examSessionActive && (
        <div className="watermark-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 99999, opacity: 0.06, overflow: 'hidden',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around',
          alignContent: 'space-around', userSelect: 'none'
        }}>
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} style={{
              transform: 'rotate(-35deg)', whiteSpace: 'nowrap',
              fontSize: '14px', fontWeight: 900, color: '#000',
              padding: '40px', letterSpacing: '1px'
            }}>
              {bankTitle || 'PRI TEST'} | {studentInfo.id || 'ID'} | {studentInfo.name || 'STUDENT'}
            </div>
          ))}
        </div>
      )}



      {/* Toast Notification */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, maxWidth: '360px', backgroundColor: toastMsg.type === 'error' ? '#1e293b' : '#064e3b', color: 'white', padding: '14px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1.5 }}>
          <span>{toastMsg.type === 'error' ? '⚠️' : '✓'}</span>
          {toastMsg.text}
        </div>
      )}
    </div>
  );
}
