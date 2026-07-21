'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '@/components/basic/dashboard-layout';
import FullScreenLoader from '@/components/basic/FullScreenLoader';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ClipboardCheck, TrendingUp, FolderOpen, RefreshCw, LayoutDashboard, Clock, Search } from 'lucide-react';
import { STUDENT_SIDEBAR_ITEMS } from '@/lib/navigation-constants';
import { safeParseJson } from '@/lib/api-utils';
import dynamic from 'next/dynamic';
import { StudentInsightsSkeleton } from './insights/StudentInsightsSkeleton';
import PriReportView from '@/components/report/PriReportView';

interface PriScoreData {
  hasScore: boolean;
  testTitle?: string;
  testProgram?: string;
  submittedAt?: string;
  evaluation?: {
    percentage: number;
    mcqCorrect: number;
    mcqTotal: number;
    overallStatus: 'pass' | 'fail' | 'pending';
  } | null;
}

const formatScore = (val: any) => {
  const num = Number(val) || 0;
  return (Math.trunc(num * 100) / 100).toFixed(2);
};


const StudentInsights = dynamic(() => import('./insights/StudentInsights'), {
  loading: () => <StudentInsightsSkeleton />,
});
import SkillSpectrumRadar from './insights/SkillSpectrumRadar';

interface PriQuestion 
{
  index: number;
  domainId: string;
  domainName?: string;
  questionType: 'mcq' | 'written';
  questionText: string;
  caseContext?: string;
  caseContextImageUrl?: string;
  subSkill?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  options: Array<{ label: string; text: string }>;
}

interface BankInfo {
  id: string;
  title: string;
  program: string;
  examStartDate?: string;
  examEndDate?: string;
}

interface DomainTimeSlot {
  domainId: string;
  domainName: string;
  domainStartTime: string;
  domainEndTime: string;
  // added by server: absolute ISO timestamps and status
  startsAt?: string | null;
  endsAt?: string | null;
  isUnlocked?: boolean;
  timeToUnlockMs?: number | null;
  timeToCloseMs?: number | null;
  responseStatus?: 'not_started' | 'in_progress' | 'completed' | 'closed';
  lockedReason?: string | null;
}

interface Attempt {
  _id: string;
  studentUserId?: string;
  submittedAt: string;
  status: 'submitted';
  questionBankId?: {
    title: string;
    program: string;
  };
  evaluation?: {
    overallStatus: 'pass' | 'fail' | 'pending';
    percentage: number;
    mcqCorrect: number;
    mcqTotal: number;
  } | null;
  isResultsPublished?: boolean;
}

interface ActiveDomainInfo {
  domainId: string;
  domainName: string;
  start: Date;
  end: Date;
}

function parseTimeToToday(value: string): Date | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
}

function formatTo12H(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hours = h % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

function getActiveDomain(domains: DomainTimeSlot[], serverOffsetMs: number = 0): ActiveDomainInfo | null {
  const now = new Date(Date.now() + serverOffsetMs);
  for (const domain of domains) {
    let start: Date | null = null;
    let end: Date | null = null;
    if (domain.startsAt) {
      start = new Date(domain.startsAt);
    } else {
      start = parseTimeToToday(domain.domainStartTime);
    }
    if (domain.endsAt) {
      end = new Date(domain.endsAt);
    } else {
      end = parseTimeToToday(domain.domainEndTime);
    }
    if (!start || !end) continue;
    if (now >= start && now <= end) {
      return {
        domainId: domain.domainId,
        domainName: domain.domainName,
        start,
        end,
      };
    }
  }
  return null;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [priScore, setPriScore] = useState<PriScoreData | null>(null);

  async function loadInsightsData(authToken?: string | null) {
    if (!authToken) return;
    try {
      const res = await fetch('/api/student/insights', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const result = await safeParseJson(res);
      if (res.ok) {
        setInsightsData(result);
      }
    } catch (e) {
      console.error('Failed to load insights:', e);
    } finally {
      setInsightsLoading(false);
    }
  }

  async function loadPriScore(authToken?: string | null) {
    const t = authToken ?? token;
    if (!t) return;
    try {
      const res = await fetch('/api/student/pri-score', {
        headers: { Authorization: `Bearer ${t}` }
      });
      const result = await safeParseJson(res);
      if (res.ok) setPriScore(result as PriScoreData);
    } catch (e) {
      console.error('Failed to load PRI score:', e);
    }
  }

  useEffect(() => {
    const t = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
    setIsMounted(true);
    setToken(t);
    if (t) {
      void loadInsightsData(t);
      void loadPriScore(t);
    }
  }, []);

  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [domainTimeSlots, setDomainTimeSlots] = useState<DomainTimeSlot[]>([]);
  const [questions, setQuestions] = useState<PriQuestion[]>([]);
  const [answers, setAnswers] = useState<
    Record<number, { selectedOption?: string; answerText?: string }>
  >({});
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [resultsLoading, setResultsLoading] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Tab state derived from URL or default to 'dashboard'
  const activeTab = (searchParams.get('tab') as 'dashboard' | 'test' | 'results') || 'dashboard';

  const setActiveTab = (tab: 'dashboard' | 'test' | 'results') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [testActive, setTestActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<ActiveDomainInfo | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimeoutRef = useRef<number | null>(null);
  const timeTakenRef = useRef<Record<number, number>>({});
  const lastQuestionRef = useRef<number | null>(null);
  const lastQuestionStartRef = useRef<number | null>(null);
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending'>('all');
  const timeTickRef = useRef<number | null>(null);
  const [priInitialLoading, setPriInitialLoading] = useState(true);
  const hasCompletedInitialPriLoadRef = useRef(false);

  // Embedded Report View State
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);
  const [specificReportData, setSpecificReportData] = useState<any>(null);
  const [specificReportLoading, setSpecificReportLoading] = useState(false);

  useEffect(() => {
    if (isMounted && !token) {
      window.location.href = '/';
    }
  }, [isMounted, token]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Recalculate active domain whenever currentTime ticks
  useEffect(() => {
    setActiveDomain(getActiveDomain(domainTimeSlots, serverOffsetMs));
  }, [currentTime, domainTimeSlots, serverOffsetMs]);

  // Background polling: Only poll results when the Results tab is in view.
  // Do NOT call loadTest() on every poll — it's a heavy DB operation.
  // loadTest is only called once on mount and after events (domain unlock, submit).
  useEffect(() => {
    if (!token) return;
    const pollInterval = window.setInterval(() => {
      if (activeTab === 'results') {
        void loadResults(token);
      }
    }, 30000);
    return () => window.clearInterval(pollInterval);
  }, [token, activeTab]);

  // Auto-submit final test when the last domain's window expires on the dashboard
  useEffect(() => {
    if (!token || !domainTimeSlots.length || isCompleted || !bankInfo?.id) return;

    const lastEndMs = domainTimeSlots.reduce((max, d) => {
      if (!d.endsAt) return max;
      const ms = new Date(d.endsAt).getTime();
      return ms > max ? ms : max;
    }, 0);

    if (!lastEndMs) return;

    const msUntilEnd = lastEndMs - (Date.now() + serverOffsetMs);
    if (msUntilEnd <= 0) {
      // Already expired when page loaded — reload to pick up server-enforced state
      void loadTest(token);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        await fetch('/api/student/pri-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'submit_final_test', questionBankId: bankInfo.id }),
        });
      } catch (e) {
        console.error('[Dashboard] Failed to auto-submit final test', e);
      }
      void loadTest(token);
    }, msUntilEnd);

    return () => window.clearTimeout(timer);
  }, [token, domainTimeSlots, isCompleted, bankInfo?.id]);

  async function loadTest(authToken?: string | null, isInitial: boolean = false) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    try {
      const isFull = activeTab === 'test' || testActive;
      const res = await fetch(`/api/student/pri-test${isFull ? '?full=true' : ''}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setQuestions([]);
        setError(data.error ?? 'Failed to load test questions');
        return;
      }
      if (data.code === 'TEST_NOT_STARTED') {
        setQuestions([]);
        setBankInfo({
          id: '',
          title: data.title,
          program: data.program,
          examStartDate: data.examStartDate,
        });
        setStartsAt(data.examStartDate);
        // Populate domain time slots from pre-start response for proper countdown
        if (data.domains && Array.isArray(data.domains)) {
          setDomainTimeSlots(data.domains.map((d: any) => ({
            domainId: d.domainId,
            domainName: d.domainName,
            domainStartTime: d.domainStartTime || '',
            domainEndTime: d.domainEndTime || '',
            startsAt: d.startsAt || null,
            endsAt: d.endsAt || null,
            responseStatus: 'not_started' as const,
            isUnlocked: false,
            lockedReason: null,
          })));
        }
        setError('');
        return;
      }
      if (data.code === 'NO_ACTIVE_TEST') {
        setQuestions([]);
        setStartsAt(null);
        setError('');
        return;
      }
      if (data.code === 'ALREADY_SUBMITTED') {
        setQuestions([]);
        setStartsAt(null);
        setIsCompleted(true);
        if (data.bank || data.title) {
          setBankInfo(data.bank || { 
            id: 'completed',
            title: data.title || 'PRI Readiness Test',
            program: data.program || 'Developer'
          });
        }
        setError('');
        return;
      }
      setIsCompleted(false);
      setStartsAt(null);
      if (data.bank) {
        setBankInfo(data.bank);
      }
      // compute server offset if provided
      if (data.serverNow) {
        const serverMs = Date.parse(data.serverNow);
        setServerOffsetMs(serverMs - Date.now());
      }
      setDomainTimeSlots(data.domains ?? []);
      setQuestions(data.questions ?? []);
      setActiveDomain(getActiveDomain(data.domains ?? [], data.serverNow ? (Date.parse(data.serverNow) - Date.now()) : 0));
      if (data.existingResponse?.answers?.length) {
        const restored: Record<number, { selectedOption?: string; answerText?: string }> = {};
        for (const a of data.existingResponse.answers) {
          restored[a.questionIndex] = { selectedOption: a.selectedOption, answerText: a.answerText };
        }
        setAnswers(restored);
      }
    } catch (err: any) {
      console.error('[StudentDashboard] loadTest Error:', err);
      setError('Network error: Could not reach the evaluation engine.');
    } finally {
      if (isInitial && !hasCompletedInitialPriLoadRef.current) {
        hasCompletedInitialPriLoadRef.current = true;
        setPriInitialLoading(false);
      }
    }
  }

  async function loadResults(authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    setResultsLoading(true);
    try {
      const res = await fetch('/api/student/results', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to load results');
        return;
      }
      setAttempts(data.attempts ?? []);
      setResultsLoaded(true);
    } catch (err: any) {
      console.error('[StudentDashboard] loadResults Error:', err);
      setError('Network error while loading performance results');
    } finally {
      setResultsLoading(false);
    }
  }

  async function loadSpecificReport(reportId: string) {
    setViewingReportId(reportId);
    setSpecificReportLoading(true);
    try {
      const res = await fetch(`/api/student/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeParseJson(res);
      if (res.ok) {
        setSpecificReportData(data);
      }
    } catch (e) {
      console.error('Failed to load specific report:', e);
    } finally {
      setSpecificReportLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    const timer = window.setTimeout(() => {
      void loadTest(token, true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [token]);

  // Lazily load results only when the Results tab is opened the first time
  useEffect(() => {
    if (!token) return;
    if (activeTab !== 'results') return;
    if (resultsLoaded) return;
    void loadResults(token);
  }, [activeTab, token, resultsLoaded]);

  useEffect(() => {
    if (activeTab !== 'test') return;
    const interval = window.setInterval(() => {
      setActiveDomain(getActiveDomain(domainTimeSlots));
    }, 30000);

    return () => window.clearInterval(interval);
  }, [activeTab, domainTimeSlots]);

  // Reset current question index when domain changes
  useEffect(() => {
    setCurrentQuestionIndex(null);
  }, [activeDomain?.domainId]);

  useEffect(() => {
    if (activeTab !== 'test') return;

    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'test') return;

    const preventCopy = (event: Event) => event.preventDefault();
    const preventContext = (event: Event) => event.preventDefault();

    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventContext);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventContext);
    };
  }, [activeTab]);

  async function saveProgress() {
    if (!token || !testActive) return;
    if (!activeDomain) return;

    commitActiveQuestionTime(true);

    const payload = buildAnswerPayload();

    if (payload.length === 0) return;

    setSaveStatus('saving');
    try {
      await fetch('/api/student/pri-test/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: payload,
          currentDomainId: activeDomain.domainId,
          currentQuestionIndex: currentQuestionIndex ?? undefined,
        }),
      });
      setSaveStatus('saved');
      window.setTimeout(() => setSaveStatus('idle'), 1500);
    } catch {
      setSaveStatus('idle');
    }
  }

  useEffect(() => {
    if (!testActive) return;
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      void saveProgress();
    }, 800);
  }, [answers, activeDomain?.domainId, currentQuestionIndex, testActive]);

  async function submitTest() {
    if (!token) return;

    commitActiveQuestionTime(true);

    const payload = buildAnswerPayload();

    if (payload.length === 0) {
      setError('Answer at least one question before submitting.');
      return;
    }

    setError('');
    try {
      const res = await fetch('/api/student/pri-test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'ATTEMPT_LIMIT_REACHED' || data.code === 'NO_ACTIVE_TEST') {
          setError(data.error ?? 'You are currently not allowed to submit this test.');
          return;
        }

        setError(data.error ?? 'Failed to submit test');
        return;
      }

      setAnswers({});
      setTestActive(false);
      await loadResults();
      await loadInsightsData(token); // Update spectrum immediately
      void loadPriScore(token); // Refresh header PRI badge
      setActiveTab('results');
    } catch (err: any) {
      console.error('[StudentDashboard] submitTest Error:', err);
      setError('Network error while submitting test. Please check your connection and try again.');
    }
  }

  async function handleStartTest() {
    if (!testActive) {
      setTestActive(true);
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // ignore
      }
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('student_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_role');
    window.location.href = '/';
  }

  const sidebarItems = STUDENT_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: activeTab === item.tab,
    onClick: item.tab ? () => setActiveTab(item.tab as 'dashboard' | 'test' | 'results') : undefined,
  }));

  const latestResult = useMemo(() => attempts[0], [attempts]);
  const questionsByDomain = useMemo(() => {
    const map = new Map<string, PriQuestion[]>();
    questions.forEach((question) => {
      const list = map.get(question.domainId) ?? [];
      list.push(question);
      map.set(question.domainId, list);
    });
    return map;
  }, [questions]);

  const activeDomainQuestions = useMemo(() => {
    if (!activeDomain) return [];
    return questionsByDomain.get(activeDomain.domainId) ?? [];
  }, [activeDomain, questionsByDomain]);

  const filteredAttempts = useMemo(() => {
    let result = attempts;
    
    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(attempt => attempt.evaluation?.overallStatus === statusFilter);
    }

    if (!resultSearchQuery.trim()) return result;
    const query = resultSearchQuery.toLowerCase();
    return result.filter(attempt => 
      (attempt.questionBankId?.title || 'PRI Readiness Test').toLowerCase().includes(query) ||
      new Date(attempt.submittedAt).toLocaleDateString().toLowerCase().includes(query)
    );
  }, [attempts, resultSearchQuery, statusFilter]);

  const activeQuestionIndex = useMemo(() => {
    if (!activeDomain) return null;
    return currentQuestionIndex ?? activeDomainQuestions[0]?.index ?? null;
  }, [activeDomain, activeDomainQuestions, currentQuestionIndex]);

  const activeIndex = activeQuestionIndex ?? 0;

  function commitActiveQuestionTime(resetStart: boolean) {
    const now = Date.now();
    if (lastQuestionRef.current !== null && lastQuestionStartRef.current !== null) {
      const delta = now - lastQuestionStartRef.current;
      if (delta > 0) {
        timeTakenRef.current[lastQuestionRef.current] =
          (timeTakenRef.current[lastQuestionRef.current] ?? 0) + delta;
      }
    }
    if (resetStart && lastQuestionRef.current !== null) {
      lastQuestionStartRef.current = now;
    }
  }

  function switchActiveQuestion(nextIndex: number | null) {
    if (nextIndex === null) return;
    if (lastQuestionRef.current === nextIndex) return;
    commitActiveQuestionTime(false);
    lastQuestionRef.current = nextIndex;
    lastQuestionStartRef.current = Date.now();
  }

  function getTimeTakenSeconds(index: number) {
    const ms = timeTakenRef.current[index] ?? 0;
    return Math.max(0, Math.round(ms / 1000));
  }

  function buildAnswerPayload() {
    const mergedIndices = new Set<number>([
      ...Object.keys(answers).map((key) => Number(key)),
      ...Object.keys(timeTakenRef.current).map((key) => Number(key)),
    ]);

    return Array.from(mergedIndices).map((questionIndex) => ({
      questionIndex,
      selectedOption: answers[questionIndex]?.selectedOption,
      answerText: answers[questionIndex]?.answerText,
      timeTakenSeconds: getTimeTakenSeconds(questionIndex),
    }));
  }

  const unansweredCountByDomain = useMemo(() => {
    const map = new Map<string, number>();
    questionsByDomain.forEach((list, domainId) => {
      const unanswered = list.filter((question) => {
        const answer = answers[question.index];
        return !answer?.selectedOption && !answer?.answerText;
      }).length;
      map.set(domainId, unanswered);
    });
    return map;
  }, [answers, questionsByDomain]);

  useEffect(() => {
    if (!testActive || !isFullscreen) {
      commitActiveQuestionTime(false);
      lastQuestionRef.current = null;
      lastQuestionStartRef.current = null;
      if (timeTickRef.current) {
        window.clearInterval(timeTickRef.current);
        timeTickRef.current = null;
      }
      return;
    }

    switchActiveQuestion(activeQuestionIndex);
    if (!timeTickRef.current) {
      timeTickRef.current = window.setInterval(() => {
        commitActiveQuestionTime(true);
      }, 5000);
    }
    return () => {
      if (timeTickRef.current) {
        window.clearInterval(timeTickRef.current);
        timeTickRef.current = null;
      }
    };
  }, [activeQuestionIndex, isFullscreen, testActive]);

  // Only gate the full-screen loader on PRI test readiness.
  // StudentInsights keeps its own lightweight skeleton while loading
  // so the dashboard can appear sooner even if analytics are still fetching.
  const initialLoading = !!token && priInitialLoading;

  if (!isMounted || initialLoading) {
    return <FullScreenLoader message="Loading your student dashboard..." />;
  }

  if (!token) return null;

  if (viewingReportId) {
    if (specificReportLoading) {
      return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-zinc-100 border-t-[#D62027] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-[#D62027]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight mb-2">Analyzing Behavioral Metrics</h2>
          <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Consulting PRI Evaluation Engine...</p>
        </div>
      );
    }
    if (specificReportData) {
      return (
        <PriReportView 
          reportData={specificReportData} 
          onBack={() => {
            setViewingReportId(null);
            setSpecificReportData(null);
          }}
        />
      );
    }
  }

  return (
    <DashboardLayout 
      userType="Student" 
      username={insightsData?.user?.fullName || insightsData?.user?.username || (insightsLoading ? 'Loading Profile...' : 'Student')}
      onLogout={handleLogout} 
      sidebarItems={sidebarItems}
      headerTitle={activeTab === 'dashboard' ? 'Student Dashboard' : activeTab === 'test' ? 'PRI Test Evaluation' : 'RESULT HISTORY'}
      headerSubtitle={activeTab === 'dashboard' ? 'Personal analytics & performance' : activeTab === 'test' ? 'Evaluate your readiness' : 'Track your previous performance metrics'}
      showBackButton={false}
      institutionName={insightsData?.user?.institutionName}
    >
      {testActive && isFullscreen && (
        <div className="fixed bottom-8 left-8 z-9999 pointer-events-none animate-in fade-in duration-1000">
          <img src="/poweredBySentra.png" alt="Sentra Logo" className="h-12 w-auto object-contain" />
        </div>
      )}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {error && activeTab !== 'results' && (
          <div className="bg-red-50 border border-red-100 text-[#D62027] text-xs px-5 py-4 rounded-2xl flex items-center gap-3">
             <p className="font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <StudentInsights
            token={token}
            hasActiveTest={!!bankInfo}
            bankInfo={bankInfo}
            domainTimeSlots={domainTimeSlots}
            activeDomain={activeDomain}
            isCompleted={isCompleted}
            startsAt={startsAt}
            testEndAt={(() => {
              const withEnds = domainTimeSlots.filter(d => d.endsAt);
              if (withEnds.length === 0) return null;
              return withEnds.reduce<number>((max, d) => Math.max(max, new Date(d.endsAt!).getTime()), 0) || null;
            })()}
            testStartAt={(() => {
              const withStarts = domainTimeSlots.filter(d => d.startsAt);
              if (withStarts.length === 0) return null;
              const earliest = withStarts.reduce<number>((min, d) => Math.min(min, new Date(d.startsAt!).getTime()), Infinity);
              return isFinite(earliest) ? earliest : null;
            })()}
            serverOffsetMs={serverOffsetMs}
          />
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            {bankInfo && (
              <div className="g360-card no-hover p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Active PRI Test</p>
                    <p className="text-xl font-black text-zinc-900 tracking-tight mt-2">{bankInfo.title}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#D62027] mt-1">Program: {bankInfo.program}</p>
                    {activeDomain && (
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                          Active Domain: {activeDomain.domainName} ({activeDomain.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - {activeDomain.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })})
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#D62027]">
                                 {(() => {
                                 const parseMin = (t: string) => { if (!t) return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
                                 const allEnds = domainTimeSlots.map(d => parseMin(d.domainEndTime)).filter(v => v !== 0);
                                 if (!allEnds.length) return '---';
                                 
                                 const lastEndMins = Math.max(...allEnds);
                                 const nowMins = new Date(currentTime).getHours() * 60 + new Date(currentTime).getMinutes();
                                 const nowSecs = new Date(currentTime).getSeconds();
                                 
                                 let diffSecs = (lastEndMins * 60) - (nowMins * 60 + nowSecs);
                                 if (diffSecs < 0) return "00:00:00";
                                 
                                 const h = Math.floor(diffSecs / 3600);
                                 const m = Math.floor((diffSecs % 3600) / 60);
                                 const s = diffSecs % 60;
                                 
                                 return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                                 })()}
                           </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleStartTest}
                      disabled={!activeDomain}
                      className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                        !activeDomain 
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200' 
                          : 'bg-black text-white hover:bg-zinc-800 shadow-lg active:scale-95'
                      }`}
                    >
                      {!activeDomain ? 'Awaiting Window' : testActive ? 'Resume Test' : 'Start Test'}
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Idle'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {questions.length === 0 && !startsAt && (
              <div className="g360-card no-hover p-6 md:p-10 flex flex-col items-center justify-center text-center min-h-100 border-dashed border-2 border-zinc-200 bg-zinc-50/50 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
                <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto">
                  <h3 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight leading-none mb-3 uppercase">No PRI Available</h3>
                  <p className="text-zinc-500 font-bold text-xs leading-relaxed mb-8 uppercase tracking-widest">
                    Your readiness evaluation is currently being prepared. Check back later or contact your admin.
                  </p>
                  <button 
                    onClick={() => { void loadTest(); void loadResults(); }} 
                    className="flex items-center gap-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all shadow-sm outline-none"
                  >
                    Refresh Status
                  </button>
                </div>
              </div>
            )}

            {questions.length === 0 && startsAt && (
              <div className="g360-card no-hover p-6 md:p-10 flex flex-col items-center justify-center text-center min-h-100 bg-[#0f172a] relative overflow-hidden group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[40px_40px]"></div>
                <div className="relative z-10 flex flex-col items-center max-w-md mx-auto text-white">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-4 uppercase">Test Starting Soon</h3>
                  <p className="text-zinc-400 font-bold text-[10px] leading-relaxed mb-10 uppercase tracking-[0.2em] max-w-xs">
                    Get ready! Your PRI readiness evaluation for <span className="text-white">{bankInfo?.title}</span> will begin shortly.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-6 mb-12">
                    {(() => {
                      const diff = new Date(startsAt).getTime() - currentTime;
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                      
                      return [
                        { label: 'Hours', val: Math.max(0, hours) },
                        { label: 'Mins', val: Math.max(0, minutes) },
                        { label: 'Secs', val: Math.max(0, seconds) }
                      ].map(t => (
                        <div key={t.label} className="flex flex-col items-center">
                          <span className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums mb-1">{t.val.toString().padStart(2, '0')}</span>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#D62027]">{t.label}</span>
                        </div>
                      ));
                    })()}
                  </div>

                  <button 
                    onClick={() => { void loadTest(); void loadResults(); }} 
                    className="flex items-center gap-2 rounded-xl bg-[#D62027] text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-[#D62027]/20 active:scale-[0.98] outline-none"
                  >
                    Refresh Now
                  </button>
                </div>
              </div>
            )}

            {questions.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <div className="g360-card no-hover p-4 md:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Domains</p>
                  <div className="space-y-3">
                    {domainTimeSlots.map((slot) => {
                      const nowServer = Date.now() + serverOffsetMs;
                      const isActive = slot.isUnlocked || activeDomain?.domainId === slot.domainId;
                      const unanswered = unansweredCountByDomain.get(slot.domainId) ?? 0;
                      const respStatus = slot.responseStatus ?? 'not_started';
                      const isClosed = respStatus === 'closed';
                      const isCompleted = respStatus === 'completed';

                      function formatHHMMSS(ms: number | null) {
                        if (ms === null) return '00:00:00';
                        const total = Math.max(0, Math.floor(ms / 1000));
                        const h = Math.floor(total / 3600);
                        const m = Math.floor((total % 3600) / 60);
                        const s = total % 60;
                        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                      }

                      // Determine displayed status label
                      let statusLabel = 'Locked';
                      if (isCompleted) statusLabel = 'Completed';
                      else if (isClosed) statusLabel = 'Closed';
                      else if (isActive) statusLabel = 'Active';
                      else if (!isActive && slot.startsAt) statusLabel = 'Starts in';

                      // Timer: time to unlock if not active, otherwise time to close
                      let timerText: string | null = null;
                      if (!isActive && slot.startsAt) {
                        timerText = formatHHMMSS(new Date(slot.startsAt).getTime() - nowServer);
                      } else if (isActive && slot.endsAt) {
                        timerText = formatHHMMSS(new Date(slot.endsAt).getTime() - nowServer);
                      }

                      // Build status badge styles
                      const domainQuestions = questionsByDomain.get(slot.domainId) ?? [];
                      const totalQ = domainQuestions.length;
                      const answeredQ = totalQ - unanswered;

                      type BadgeStyle = { label: string; bg: string; text: string; dot?: string };
                      let badge: BadgeStyle;
                      if (isCompleted) {
                        badge = { label: '✓ Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
                      } else if (isClosed) {
                        badge = { label: '🔒 Closed', bg: 'bg-zinc-100', text: 'text-zinc-500', dot: 'bg-zinc-400' };
                      } else if (isActive) {
                        badge = { label: 'Active Now', bg: 'bg-red-50', text: 'text-[#D62027]', dot: 'bg-[#D62027]' };
                      } else if (slot.startsAt) {
                        badge = { label: `Starts in ${timerText ?? ''}`, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' };
                      } else {
                        badge = { label: 'Locked', bg: 'bg-zinc-50', text: 'text-zinc-400', dot: 'bg-zinc-300' };
                      }

                      return (
                        <div key={slot.domainId} className={`rounded-xl border px-3 py-3 ${isActive ? 'border-[#D62027]/30 bg-red-50/40' : isCompleted ? 'border-emerald-100 bg-emerald-50/20' : isClosed ? 'border-zinc-100 bg-zinc-50/50 opacity-70' : 'border-zinc-100'}`}>
                          {/* Domain name row */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-800 leading-tight">
                              {slot.domainName}
                            </p>
                            {/* Status badge */}
                            <span className={`inline-flex items-center gap-1 shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                              {isActive && <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />}
                              {!isActive && badge.dot && <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />}
                              {isCompleted || isClosed || !timerText ? badge.label : (isActive ? 'Active Now' : `Starts in`)}
                            </span>
                          </div>

                          {/* Time slot */}
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            {formatTo12H(slot.domainStartTime)} – {formatTo12H(slot.domainEndTime)}
                          </p>

                          {/* Countdown timer (Starts in / Time Left) */}
                          {timerText && !isCompleted && !isClosed && (
                            <div className={`mt-2 flex items-center gap-1.5 ${isActive ? 'text-[#D62027]' : 'text-amber-600'}`}>
                              <span className="text-[9px] font-black uppercase tracking-widest">{isActive ? 'Time Left:' : 'Starts in:'}</span>
                              <span className="text-[11px] font-black tabular-nums">{timerText}</span>
                            </div>
                          )}

                          {/* Answered count */}
                          {totalQ > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full bg-zinc-100 overflow-hidden">
                                <div className="h-full rounded-full bg-[#D62027]" style={{ width: `${totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0}%` }} />
                              </div>
                              <span className="text-[9px] font-black text-zinc-500 tabular-nums">
                                {answeredQ}/{totalQ}
                              </span>
                            </div>
                          )}

                          {/* Question jump buttons for active domain */}
                          {isActive && !isClosed && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {domainQuestions.map((question) => {
                                const isSelected = activeIndex === question.index;
                                return (
                                  <button
                                    key={question.index}
                                    onClick={() => setCurrentQuestionIndex(question.index)}
                                    className={`h-7 w-7 rounded-lg text-[10px] font-black ${isSelected ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}`}
                                  >
                                    {question.index + 1}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  {!testActive && (
                    <div className="g360-card no-hover p-6 md:p-8 text-center">
                      <p className="text-sm font-bold text-zinc-500">Start the test to unlock questions in fullscreen mode.</p>
                    </div>
                  )}

                  {testActive && !isFullscreen && (
                    <div className="g360-card no-hover p-6 md:p-8 text-center">
                      <p className="text-sm font-bold text-[#D62027]">Fullscreen is required to continue.</p>
                      <button
                        onClick={handleStartTest}
                        className="mt-4 rounded-xl bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest"
                      >
                        Re-enter Fullscreen
                      </button>
                    </div>
                  )}

                  {testActive && isFullscreen && activeDomainQuestions.length === 0 && (
                    <div className="g360-card no-hover p-6 md:p-8 text-center">
                      <p className="text-sm font-bold text-zinc-500">No active domain right now. Please wait for the next slot.</p>
                    </div>
                  )}

                  {testActive && isFullscreen && activeDomainQuestions.length > 0 && (
                    <div className="g360-card no-hover p-6 md:p-8" key={`q-${activeIndex}`}>
                      {(() => {
                        const question = questions.find((q) => q.index === activeIndex) ?? activeDomainQuestions[0];
                        if (!question) return null;

                        return (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{question.domainName ?? activeDomain?.domainName}</p>
                            <p className="text-lg font-black text-zinc-900 tracking-tight leading-snug mt-2">
                              Q{question.index + 1}. {question.questionText}
                            </p>
                             {question.caseContext ? (
                               <div className="mt-4 p-6 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm italic text-zinc-600 leading-relaxed">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Reference Case</p>
                                 {question.caseContext}
                               </div>
                             ) : (
                               <div className="mt-4 p-4 border border-dashed border-zinc-200 rounded-2xl flex items-center justify-center bg-zinc-50/30">
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Direct Question • No Reference Scenario Required</p>
                               </div>
                             )}
                            {question.caseContextImageUrl && (
                              <div className="mt-4 rounded-2xl overflow-hidden border border-zinc-100">
                                <img src={question.caseContextImageUrl} alt="Case study" className="w-full h-auto" />
                              </div>
                            )}
                            {question.subSkill && (
                              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{question.subSkill}</p>
                            )}
                            {question.difficulty && (
                              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Difficulty: {question.difficulty}</p>
                            )}
                            <div className="mt-6 space-y-3">
                              {question.questionType === 'mcq' && question.options.map((option) => (
                                <label
                                  key={option.label}
                                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${answers[question.index]?.selectedOption === option.label ? 'border-[#D62027] bg-red-50/50' : 'border-zinc-100'}`}
                                >
                                  <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-zinc-300 bg-white shadow-sm shrink-0">
                                    {answers[question.index]?.selectedOption === option.label && <div className="w-2.5 h-2.5 rounded-full bg-[#D62027]" />}
                                  </div>
                                  <input
                                    type="radio"
                                    name={`q-${question.index}`}
                                    className="sr-only"
                                    checked={answers[question.index]?.selectedOption === option.label}
                                    onChange={() =>
                                      setAnswers((prev) => ({
                                        ...prev,
                                        [question.index]: { ...prev[question.index], selectedOption: option.label },
                                      }))
                                    }
                                  />
                                  <span className="text-sm font-medium text-zinc-800">{option.label}. {option.text}</span>
                                </label>
                              ))}
                              {question.questionType === 'written' && (
                                <textarea
                                  value={answers[question.index]?.answerText ?? ''}
                                  onChange={(e) =>
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [question.index]: { ...prev[question.index], answerText: e.target.value },
                                    }))
                                  }
                                  placeholder="Write your response..."
                                  rows={4}
                                  className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
                                />
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {questions.length > 0 && (
              <div className="flex justify-start">
                <button
                  onClick={submitTest}
                  disabled={Object.keys(answers).length === 0}
                  className="w-full md:w-auto rounded-xl bg-black text-white px-8 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  Submit Test
                </button>
              </div>
            )}
          </div>
        )}
         {activeTab === 'results' && (
          <div className="space-y-8 flex flex-col mt-6">
            {/* Report list is now the only thing here as dedicated report view is handled at top level */}
            <>
              {latestResult && (
                  <div className={`${latestResult.evaluation?.overallStatus === 'fail' ? 'bg-[#450a0a]' : 'bg-[#0f172a]'} rounded-[28px] p-8 md:p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] w-full no-hover`}>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#9ca3af]/50 mb-4">Latest Submission</p>
                    <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 border-b border-white/5 pb-8 mb-6">
                       <h3 className={`font-black text-white leading-none tracking-tighter uppercase ${latestResult.evaluation?.overallStatus === 'fail' ? 'text-3xl md:text-4xl' : 'text-5xl md:text-6xl'}`}>
                         {latestResult.evaluation?.overallStatus === 'pass' ? 'Passed' : 
                          latestResult.evaluation?.overallStatus === 'fail' ? 'Need Improvement' : 'Submitted'}
                       </h3>
                       <p className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${
                         latestResult.evaluation?.overallStatus === 'pass' ? 'text-emerald-400' :
                         latestResult.evaluation?.overallStatus === 'fail' ? 'text-[#D62027]' : 'text-[#D62027]'
                       }`}>
                         {latestResult.evaluation?.overallStatus === 'pass' ? 'Requirement Cleared' : 
                          latestResult.evaluation?.overallStatus === 'fail' ? 'Gateway Blocked' : 'Evaluation Pending'}
                       </p>
                    </div>
                    
                    {latestResult.evaluation?.overallStatus === 'pass' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Total PRI Score</p>
                          <p className="text-2xl font-black text-white">{formatScore(latestResult.evaluation.percentage)}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Correct Answers</p>
                          <p className="text-2xl font-black text-white">{latestResult.evaluation.mcqCorrect} / {latestResult.evaluation.mcqTotal}</p>
                        </div>
                      </div>
                    )}

                    {latestResult.evaluation?.overallStatus === 'fail' && (
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
                        <p className="text-sm font-bold text-red-200 leading-relaxed uppercase tracking-widest">
                           Your behavioral profile did not meet the eligibility gateway for this session. 
                           Please focus on the corrective feedback provided by your faculty.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center opacity-60">
                        <p className="text-xs font-bold uppercase tracking-widest text-white">
                          Test: {latestResult.questionBankId?.title || 'PRI Readiness Test'}
                        </p>
                        <p className="text-xs font-bold uppercase tracking-widest text-white">Recorded {new Date(latestResult.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}


                <div className="g360-card no-hover overflow-hidden w-full">
                  {/* Table Header with Search & Filter - Standard Pattern */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 border-b border-zinc-50 bg-white">
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-zinc-900 uppercase leading-none mb-1">Result History</h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Track your previous performance metrics</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search tests..."
                          value={resultSearchQuery}
                          onChange={(e) => setResultSearchQuery(e.target.value)}
                          className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none"
                        />
                      </div>
                      <div className="relative w-full sm:w-44">
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="w-full bg-zinc-50 border-none rounded-xl pl-4 pr-10 py-3 text-[10px] font-black uppercase tracking-widest text-[#D62027] focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="all">Filter: ALL</option>
                          <option value="pass">Filter: PASSED</option>
                          <option value="fail">Filter: NEED IMPROVEMENT</option>
                          <option value="pending">Filter: PENDING</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D62027]/40 font-black text-[12px]">↓</div>
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block g360-table-container overflow-auto max-h-150 custom-scrollbar">
                    <table className="w-full text-sm whitespace-nowrap">
                      <thead className="g360-table-header text-left text-xs uppercase tracking-widest sticky top-0 z-10 bg-white">
                        <tr>
                          <th className="px-8 py-5">Test Name</th>
                          <th className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span>Status</span>
                            </div>
                          </th>
                          <th className="px-8 py-5">PRI Score</th>
                          <th className="px-8 py-5">Submitted On</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light">
                        {resultsLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={`skeleton-${i}`} className="animate-pulse">
                              <td className="px-8 py-6">
                                <div className="h-4 w-48 bg-zinc-100 rounded-full mb-1" />
                                <div className="h-3 w-32 bg-zinc-50 rounded-full" />
                              </td>
                              <td className="px-8 py-6">
                                <div className="h-6 w-24 bg-zinc-100 rounded-full" />
                              </td>
                              <td className="px-8 py-6">
                                <div className="h-5 w-10 bg-zinc-100 rounded-full" />
                              </td>
                              <td className="px-8 py-6">
                                <div className="h-4 w-28 bg-zinc-100 rounded-full mb-1" />
                                <div className="h-3 w-20 bg-zinc-50 rounded-full" />
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="inline-block h-8 w-24 bg-zinc-100 rounded-xl" />
                              </td>
                            </tr>
                          ))
                        ) : filteredAttempts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-16 text-center">
                                 <div className="flex flex-col items-center">
                                   <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No matching results found</p>
                                 {resultSearchQuery && (
                                   <button 
                                     onClick={() => setResultSearchQuery('')}
                                     className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#D62027]"
                                   >
                                     Clear Search
                                   </button>
                                 )}
                               </div>
                            </td>
                          </tr>
                        ) : (
                          filteredAttempts.map((attempt) => (
                            <tr key={attempt._id}>
                              <td className="px-8 py-6 font-black text-zinc-950 uppercase tracking-tight">
                                {attempt.questionBankId?.title || 'PRI Readiness Test'}
                              </td>
                              <td className="px-8 py-6 text-zinc-600 font-bold">
                                {!attempt.isResultsPublished ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border bg-zinc-50 text-zinc-400 border-zinc-100">
                                    Submitted / Processing
                                  </span>
                                ) : (
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                                    attempt.evaluation?.overallStatus === 'pass' ? 'bg-[#06402B] text-white border-[#06402B]' :
                                    attempt.evaluation?.overallStatus === 'fail' ? 'bg-red-700 text-red-100 border-red-100' : 
                                    'bg-zinc-50 text-zinc-500 border-zinc-100'
                                  }`}>
                                    {attempt.evaluation?.overallStatus === 'pass' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                    {attempt.evaluation?.overallStatus === 'pass' ? 'PASSED' : 
                                     attempt.evaluation?.overallStatus === 'fail' ? 'NEED IMPROVEMENT' : 'PENDING'}
                                  </span>
                                )}
                              </td>
                              <td className="px-8 py-6 text-zinc-950 font-black">
                                {attempt.isResultsPublished && attempt.evaluation?.percentage !== undefined ? (
                                  attempt.evaluation.overallStatus === 'fail' ? 'Not Available Yet' : `${formatScore(attempt.evaluation.percentage)}%`
                                ) : '—'}
                              </td>
                              <td className="px-8 py-6 text-zinc-500 font-bold">
                                <div className="flex flex-col">
                                  <span>{new Date(attempt.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                  <span className="text-[9px] text-zinc-300 uppercase tracking-widest mt-0.5">
                                    {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 {attempt.isResultsPublished && attempt.evaluation?.overallStatus === 'pass' ? (
                                  <button
                                    onClick={() => loadSpecificReport(attempt._id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm outline-none"
                                  >
                                    VIEW REPORT
                                  </button>
                                ) : attempt.isResultsPublished && attempt.evaluation?.overallStatus === 'fail' ? (
                                  <button
                                    onClick={() => loadSpecificReport(attempt._id)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm outline-none"
                                  >
                                    View Results
                                  </button>
                                ) : !attempt.isResultsPublished ? (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">Awaiting Release</span>
                                ) : null}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden divide-y divide-zinc-50">
                    {resultsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={`mob-skeleton-${i}`} className="p-5 animate-pulse">
                          <div className="h-4 w-3/4 bg-zinc-100 rounded-full mb-3" />
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-20 bg-zinc-50 rounded-full" />
                            <div className="h-4 w-12 bg-zinc-50 rounded-full" />
                          </div>
                        </div>
                      ))
                    ) : filteredAttempts.length === 0 ? (
                      <div className="p-10 text-center">
                        <p className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">No matching results</p>
                      </div>
                    ) : (
                      filteredAttempts.map((attempt) => (
                        <div key={`mob-${attempt._id}`} className="p-5 space-y-4">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                              {new Date(attempt.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight leading-tight">
                              {attempt.questionBankId?.title || 'PRI Readiness Test'}
                            </h4>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-600 font-bold">
                              {!attempt.isResultsPublished ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border bg-zinc-50 text-zinc-400 border-zinc-100">
                                  Processing
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                                  attempt.evaluation?.overallStatus === 'pass' ? 'bg-[#06402B] text-white border-[#06402B]' :
                                  attempt.evaluation?.overallStatus === 'fail' ? 'bg-red-700 text-red-100 border-red-100' : 
                                  'bg-zinc-50 text-zinc-500 border-zinc-100'
                                }`}>
                                  {attempt.evaluation?.overallStatus === 'pass' ? 'PASSED' : 
                                   attempt.evaluation?.overallStatus === 'fail' ? 'NEED IMPROVEMENT' : 'PENDING'}
                                </span>
                              )}
                              <span className="text-sm font-black text-zinc-950">
                                {attempt.isResultsPublished && attempt.evaluation?.percentage !== undefined ? (
                                  attempt.evaluation.overallStatus === 'fail' ? 'Not Available Yet' : `${formatScore(attempt.evaluation.percentage)}%`
                                ) : ''}
                              </span>
                            </div>
                            
                            {(attempt.isResultsPublished) && (
                              <button
                                onClick={() => loadSpecificReport(attempt._id)}
                                className="bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
                              >
                                View Report
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
          </div>

        )}
      </div>
    </DashboardLayout>
  );
}
