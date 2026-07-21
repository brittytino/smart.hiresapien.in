'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {  } from 'lucide-react';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RadarTooltip,
} from 'recharts';
import { 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Crosshair,
  Clock,
  Activity,
  Award,
  RefreshCw
} from 'lucide-react';
import { useUI } from '@/components/providers/ui-provider';
import { safeParseJson } from '@/lib/api-utils';
import { StudentInsightsSkeleton } from './StudentInsightsSkeleton';
import SkillSpectrumRadar from './SkillSpectrumRadar';
import { BarChart3, HeartPulse, Ribbon, Star, UserCheck } from 'lucide-react';

function cn(...inputs: Array<string | undefined | null | boolean>) {
  return inputs.filter(Boolean).join(' ');
}


interface StudentInsightsData {
  user: {
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    studentId?: string;
  };
  insights: {
    totalTests: number;
    highestScore: number;
    averageScore: number;
  };
  recentActivity: Array<{
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
    _id: string;
    overallStatus?: string;
  }>;
  insightsEngine?: {
    enabled: boolean;
    data: {
      overallMetrics?: {
        percentage?: number;
        band?: string;
        accuracy?: number;
        needsAttention?: number;
      };
      domainMetrics?: Record<string, {
        accuracy?: number;
        band?: string;
        questionsAttempted?: number;
        correct?: number;
        needsAttention?: number;
        avgTimeRatio?: number;
        totalTimeSec?: number;
        strongSubSkills?: string[];
        weakSubSkills?: string[];
      }>;
      aiInsights?: {
        summaryInsight?: string;
        domains?: Record<string, {
          description?: string;
          insights?: string;
          strengths?: string[];
          improvements?: string[];
          actionPlan?: {
            high?: { title: string; steps: string[] };
            medium?: { title: string; steps: string[] };
            low?: { title: string; steps: string[] };
          };
          subSkills?: Array<{
            skill: string;
            accuracy: number;
            time: string;
            status: string;
          }>;
        }>;
      };
    } | null;
    error?: string | null;
  };
}

interface StudentInsightsProps {
  token: string;
  hasActiveTest?: boolean;
  bankInfo?: { id: string; title: string; program: string; examStartDate?: string; examEndDate?: string } | null;
  domainTimeSlots?: Array<{
    domainId: string;
    domainName: string;
    domainStartTime: string;
    domainEndTime: string;
    startsAt?: string | null;
    endsAt?: string | null;
    responseStatus?: 'not_started' | 'in_progress' | 'completed' | 'closed';
    isUnlocked?: boolean;
    lockedReason?: string | null;
  }>;
  activeDomain?: { domainId: string; domainName: string; start: Date; end: Date } | null;
  isCompleted?: boolean;
  startsAt?: string | null;
  /** Unix ms timestamp of the last domain's end time (from server-computed endsAt) */
  testEndAt?: number | null;
  /** Unix ms timestamp of the first domain's start time (from server-computed startsAt) */
  testStartAt?: number | null;
  /** Callback fired once the first insights load (success or handled error) completes */
  onInitialLoadComplete?: () => void;
  /** Server time offset in ms */
  serverOffsetMs?: number;
}

export default function StudentInsights({
  token,
  hasActiveTest,
  bankInfo,
  domainTimeSlots = [],
  activeDomain,
  isCompleted = false,
  startsAt = null,
  testEndAt = null,
  testStartAt = null,
  onInitialLoadComplete,
  serverOffsetMs = 0,
}: StudentInsightsProps) {
  const router = useRouter();
  const [data, setData] = useState<StudentInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now() + serverOffsetMs);
  const { confirm, showToast } = useUI();
  const initialReportedRef = useRef(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const formatTo12H = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(':')) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hours = h % 12 || 12;
    return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
  };


  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now() + serverOffsetMs);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [serverOffsetMs]);

  // Hydrate from persistent localStorage to avoid showing
  // a blank state on revisits and fulfill 'one-time fetch' requirement.
  useEffect(() => {
    if (typeof window === 'undefined' || !token) return;
    try {
      // Use token prefix to avoid cross-user caching bugs
      const cacheKey = `student_insights_cache_v3_${token.substring(0, 20)}`;
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { timestamp: number; payload: StudentInsightsData };
      
      // Even with 'one-time fetch', we use the cached data immediately.
      setData(parsed.payload);
      setLoading(false);
      
      if (!initialReportedRef.current) {
        initialReportedRef.current = true;
        if (onInitialLoadComplete) {
          onInitialLoadComplete();
        }
      }
    } catch {
      // ignore cache errors
    }
  }, [onInitialLoadComplete, token]);

  const fetchInsights = async (force: boolean = false) => {
    // Check if we already have data in memory or localStorage before fetching
    if (!force && data) {
       setLoading(false);
       return;
    }

    try {
      const res = await fetch(`/api/student/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result: any = await safeParseJson(res);
      if (!res.ok) throw new Error(result.error || 'Failed to fetch personal insights');
      
      setData(result);
      
      if (typeof window !== 'undefined') {
        try {
          const cacheKey = `student_insights_cache_v3_${token.substring(0, 20)}`;
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            payload: result,
          }));
        } catch {
          // ignore cache write errors
        }
      }
    } catch (err: any) {
      console.error('[StudentInsights] fetchInsights Error:', err);
      setError('Could not refresh personal analytics. Please try again later.');
    } finally {
      setLoading(false);
      if (!initialReportedRef.current) {
        initialReportedRef.current = true;
        if (onInitialLoadComplete) {
          onInitialLoadComplete();
        }
      }
    }
  };

  useEffect(() => {
    if (!token) return;
    // Strictly one-time fetch: only fetch if localStorage was empty or data is null
    const cacheKey = `student_insights_cache_v3_${token.substring(0, 20)}`;
    const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
    if (!cached) {
      void fetchInsights(true);
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleFinalPRISubmit = async () => {
    try {
      const confirmed = await confirm({
        title: 'Final PRI Submission',
        message: 'Are you sure you want to submit your entire PRI test? This action is permanent and will finalize your evaluation.',
        confirmLabel: 'Yes, Submit Final',
        cancelLabel: 'Keep Reviewing',
        variant: 'danger'
      });
      
      if (!confirmed) return;
      
      const res = await fetch(`/api/student/pri-test`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          action: 'submit_final_test',
          questionBankId: bankInfo?.id 
        })
      });

      if (!res.ok) {
        const result: any = await safeParseJson(res);
        throw new Error(result.error || 'Failed to submit final test');
      }

      showToast('Assessment Submitted Successfully', 'success');
      
      // Fetch fresh data after submission and update cache
      void fetchInsights(true);
    } catch (err: any) {
      console.error('[StudentInsights] handleFinalPRISubmit Error:', err);
      showToast('An error occurred during submission. Please try again.', 'error');
    }
  };

  const allDomainsFinished = domainTimeSlots.length > 0 && domainTimeSlots.every(slot => 
    slot.responseStatus === 'completed' || slot.responseStatus === 'closed'
  );

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
       // Visual delay for the student to "regenerate" the insights
       await new Promise(r => setTimeout(r, 3000));
       await fetchInsights(true);
       showToast('Analysis regenerated successfully!', 'success');
    } catch (err) {
       showToast('Failed to regenerate analysis', 'error');
    } finally {
       setIsRegenerating(false);
    }
  };

  const overallMetrics = data?.insightsEngine?.data?.overallMetrics;
  const overallStatus = data?.recentActivity?.[0]?.overallStatus;
  const domainMetrics = useMemo(() => data?.insightsEngine?.data?.domainMetrics ?? {}, [data?.insightsEngine?.data?.domainMetrics]);

  const spectrumDomains = Object.entries(domainMetrics as Record<string, any>).map(([name, metrics]) => {
    const questionsAttempted = metrics.questionsAttempted ?? metrics.correct ?? 0;
    let accuracyPct: number;

    if (typeof metrics.accuracy === 'number') {
      // Backend already sends percentage in many cases.
      accuracyPct = metrics.accuracy > 1 ? metrics.accuracy : metrics.accuracy * 100;
    } else if (typeof metrics.correct === 'number' && questionsAttempted > 0) {
      accuracyPct = (metrics.correct / questionsAttempted) * 100;
    } else {
      accuracyPct = 0;
    }

    if (!Number.isFinite(accuracyPct)) accuracyPct = 0;

    return {
      name,
      accuracyPct: Math.max(0, Math.min(100, accuracyPct)),
      band: metrics.band ?? 'NEUTRAL',
      questionsAttempted: questionsAttempted > 0 ? questionsAttempted : 1,
      correct: metrics.correct ?? 0,
      needsAttention: metrics.needsAttention ?? Math.max(0, (questionsAttempted || 0) - (metrics.correct ?? 0)),
    };
  });

  const totalSpectrumWeight = spectrumDomains.reduce((sum, d) => sum + (d.questionsAttempted || 1), 0) || spectrumDomains.length || 1;

const ActionPlanCard = ({
  priority,
  title,
  steps,
  color,
}: {
  priority: string;
  title: string;
  steps: string[];
  color: 'red' | 'amber' | 'emerald';
}) => {
  const colorStyles = {
    red: { cardBorder: 'border-red-100', badgeBg: 'bg-red-600', badgeText: 'text-white', icon: 'text-red-500' },
    amber: { cardBorder: 'border-amber-100', badgeBg: 'bg-amber-500', badgeText: 'text-white', icon: 'text-amber-500' },
    emerald: { cardBorder: 'border-emerald-100', badgeBg: 'bg-emerald-600', badgeText: 'text-white', icon: 'text-emerald-500' },
  };
  const style = colorStyles[color];

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-sm no-hover ${style.cardBorder}`}>
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black tracking-[0.25em] uppercase ${style.badgeBg} ${style.badgeText}`}
        >
          {priority}
        </span>
      </div>
      <h5 className="text-sm font-bold text-[#0f172a] mb-3">{title}</h5>
      <ul className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="text-xs text-slate-600 font-medium flex items-start gap-2">
            <ArrowRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${style.icon}`} />
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-4 mt-6">
    <div className="flex items-center gap-4 mb-2">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-[-0.05em] text-[#0f172a] uppercase">
          {title}
        </h2>
        {description && (
          <p className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-[#94a3b8] uppercase mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const getBandColorClass = (band?: string) => {
  const key = (band || '').toUpperCase();
  if (key === 'GREEN' || key === 'EXCEPTIONAL') return 'bg-emerald-500';
  if (key === 'AMBER' || key === 'YELLOW' || key === 'STRONG') return 'bg-amber-400';
  if (key === 'RED' || key === 'NEEDS WORK') return 'bg-red-500';
  return 'bg-slate-300';
};

  if (loading) {
    return <StudentInsightsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-[#D62027] rounded-3xl border border-red-100 flex flex-col items-center gap-4">
        <p className="font-black uppercase tracking-widest text-sm">{error}</p>
        <button onClick={() => { setLoading(true); void fetchInsights(); }} className="text-xs font-bold underline">Retry Fetching</button>
      </div>
    );
  }

  const isPsychometricFailed = (overallStatus || '').toLowerCase() === 'fail';
  const priScore = isPsychometricFailed ? 0 : (overallMetrics?.percentage ?? 0);

  const getPlacementStatus = (score: number, failed: boolean) => {
    if (failed) return { label: 'Not Available Yet', color: 'text-[#D62027]', iconBg: 'bg-[#D62027]', shadow: 'shadow-red-200', band: 'RED' };
    if (score >= 90) return { label: 'Exceptional', color: 'text-blue-600', iconBg: 'bg-blue-600', shadow: 'shadow-blue-200', band: 'BLUE' };
    if (score >= 80) return { label: 'Ready', color: 'text-emerald-600', iconBg: 'bg-emerald-600', shadow: 'shadow-emerald-200', band: 'GREEN' };
    if (score >= 60) return { label: 'Almost Ready', color: 'text-amber-500', iconBg: 'bg-amber-500', shadow: 'shadow-amber-200', band: 'AMBER' };
    return { label: 'Developing', color: 'text-[#D62027]', iconBg: 'bg-[#D62027]', shadow: 'shadow-red-200', band: 'RED' };
  };

  const status = getPlacementStatus(priScore, isPsychometricFailed);

  return (
    <div className="space-y-8">
      



      {/* Start-time banner: shown before the exam window opens */}
      {testStartAt &&
        isFinite(testStartAt) &&
        !isCompleted &&
        testStartAt > currentTime && (
        <div className="rounded-[28px] bg-[#0f172a] p-5 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden no-hover">
          <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Live Assessment Window</p>
              </div>
              <h4 className="text-2xl font-black text-white tracking-tight leading-none uppercase">Start Time </h4>
              <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">
                {(() => {
                   if (!testStartAt) return 'Scheduled Today';
                   const d = new Date(testStartAt);
                   return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' — Be ready to begin.';
                })()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto justify-center lg:justify-end">
            {(() => {
              const diff = Math.max(0, testStartAt! - currentTime);
              const h = Math.floor(diff / 3600000);
              const m = Math.floor((diff % 3600000) / 60000);
              const s = Math.floor((diff % 60000) / 1000);

              const units = [
                { val: String(h).padStart(2,'0'), label: 'HRS' },
                { val: String(m).padStart(2,'0'), label: 'MIN' },
                { val: String(s).padStart(2,'0'), label: 'SEC' }
              ];

              return units.map((u, i) => (
                <React.Fragment key={u.label}>
                  <div className="flex flex-col items-center">
                    <div className="bg-white/5 border border-white/10 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm transition-all">
                       <span className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">{u.val}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{u.label}</span>
                  </div>
                  {i < units.length - 1 && (
                    <div className="text-slate-700 font-black text-2xl mb-6">:</div>
                  )}
                </React.Fragment>
              ));
            })()}
          </div>
        </div>
      )}

      {testEndAt &&
        isFinite(testEndAt) &&
        !isCompleted &&
        testEndAt > currentTime &&
        !(testStartAt && isFinite(testStartAt) && testStartAt > currentTime) && (
        <div className="rounded-[28px] bg-[#0f172a] p-5 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden no-hover">
          <div className="flex items-center gap-6 relative z-10 w-full lg:w-auto">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D62027]">Critical Window</p>
              </div>
              <h4 className="text-2xl font-black text-white tracking-tight leading-none uppercase">Exam Ends </h4>
              <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">Finish all domains to successfully complete your examination process.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto justify-center lg:justify-end">
            {(() => {
              const diff = Math.max(0, testEndAt! - currentTime);
              const h = Math.floor(diff / 3600000);
              const m = Math.floor((diff % 3600000) / 60000);
              const s = Math.floor((diff % 60000) / 1000);
              
              const units = [
                { val: String(h).padStart(2,'0'), label: 'HRS' },
                { val: String(m).padStart(2,'0'), label: 'MIN' },
                { val: String(s).padStart(2,'0'), label: 'SEC' }
              ];
              
              return units.map((u, i) => (
                <React.Fragment key={u.label}>
                  <div className="flex flex-col items-center">
                    <div className="bg-white/5 border border-white/10 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm transition-all">
                       <span className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">{u.val}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">{u.label}</span>
                  </div>
                  {i < units.length - 1 && (
                    <div className="text-slate-700 font-black text-2xl mb-6">:</div>
                  )}
                </React.Fragment>
              ));
            })()}
          </div>
        </div>
      )}

      {/* 2. TOP PRIORITY: Live Assignment Details (Domain Slots) */}
      {hasActiveTest && !isCompleted && (
        <div className="bg-[#fff5f5] rounded-[28px] p-5 md:p-6 border border-red-50 flex flex-col lg:flex-row gap-10 relative overflow-hidden no-hover">
          <div className="flex-1 w-full lg:w-1/2 flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D62027] animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D62027]">Live Assignment</p>
            </div>
            
            <h4 className="text-4xl md:text-5xl font-black text-[#1e293b] tracking-tight leading-[1.1] mb-4">
              {bankInfo?.title?.split(' ').slice(0, -2).join(' ') ?? 'Grad360 PRI'}{' '}
              <span className="text-[#D62027]">{bankInfo?.title?.split(' ').slice(-2).join(' ') ?? 'Readiness Exam'}</span>
            </h4>
            
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md mb-8">
              Your mandatory evaluation period is open. Please ensure you complete all modules before the deadline to receive your placement authorization.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-red-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">SCHEDULED</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-emerald-100 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">VERIFIED ASSESSMENT</span>
              </div>
            </div>
          </div>

          <div className="lg:w-170 xl:w-190 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#cbd5e1]">Preparation Schedule</p>
              <span className="px-4 py-1.5 bg-[#D62027] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                 Exam Domain
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-95 overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {domainTimeSlots.map((slot) => {
                const respStatus = slot.responseStatus ?? 'not_started';
                const isCompleted = respStatus === 'completed';
                const isClosed = respStatus === 'closed';
                const isTerminated = isClosed && slot.lockedReason === 'terminated_by_proctoring';
                const isMissed = isClosed && slot.lockedReason === 'missed_window';
                const isActive = activeDomain?.domainId === slot.domainId;

                let startsInText: string | null = null;
                if (!isActive && !isCompleted && !isClosed && slot.startsAt) {
                  const diffMs = new Date(slot.startsAt).getTime() - currentTime;
                  if (diffMs > 0) {
                    const h = Math.floor(diffMs / 3600000);
                    const m = Math.floor((diffMs % 3600000) / 60000);
                    const s = Math.floor((diffMs % 60000) / 1000);
                    startsInText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                  }
                }

                const monthStr = bankInfo?.examStartDate
                  ? new Date(bankInfo.examStartDate).toLocaleString('default', { month: 'short' }).toUpperCase()
                  : '---';
                const dateStr = bankInfo?.examStartDate ? new Date(bankInfo.examStartDate).getDate() : '--';

                return (
                  <div
                    key={slot.domainId}
                    onClick={() => isActive && !isCompleted && !isClosed && router.push(`/student/test?domainId=${slot.domainId}`)}
                    className={`flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm transition-all border relative overflow-hidden ${
                      isCompleted  ? 'border-emerald-200 bg-emerald-50/20' :
                      isTerminated ? 'border-red-200 bg-red-50/20 opacity-70 select-none cursor-not-allowed' :
                      isMissed     ? 'border-zinc-100 opacity-60 grayscale select-none cursor-not-allowed bg-zinc-50/50' :
                      isClosed     ? 'border-zinc-100 opacity-60 grayscale select-none cursor-not-allowed bg-zinc-50/50' :
                      isActive     ? 'cursor-pointer border-[#D62027] bg-white' :
                                     'border-zinc-100 opacity-80 cursor-not-allowed bg-zinc-50/10'
                    } ${slot.domainId === 'workspace-psychology' ? 'md:col-span-2' : ''}`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isCompleted  ? 'bg-emerald-500' :
                      isTerminated ? 'bg-red-400' :
                      isMissed     ? 'bg-zinc-300' :
                      isClosed     ? 'bg-zinc-300' :
                      isActive     ? 'bg-[#D62027]' : 'transparent'
                    }`} />

                    <div className={`w-10 h-10 text-white rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      isCompleted  ? 'bg-emerald-500' :
                      isTerminated ? 'bg-red-300' :
                      isMissed     ? 'bg-zinc-200' :
                      isClosed     ? 'bg-zinc-200' :
                      isActive     ? 'bg-[#D62027] shadow-[#D62027]/20 shadow-md' :
                                     'bg-zinc-200 text-zinc-400'
                    }`}>
                      <span className="text-[8px] font-black uppercase tracking-widest leading-none opacity-80">{monthStr}</span>
                      <span className={`text-sm font-black leading-none ${isClosed ? 'text-zinc-400' : 'text-white'}`}>{dateStr}</span>
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <h5 className={`font-black text-[13px] tracking-tight leading-tight flex items-center gap-1.5 ${
                          isCompleted ? 'text-emerald-900' :
                          isClosed ? 'text-zinc-400' :
                          'text-[#0f172a]'
                        }`}>
                          {slot.domainName}
                        </h5>
                        <div className="flex items-center gap-1.5">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                             {formatTo12H(slot.domainStartTime)} – {formatTo12H(slot.domainEndTime)}
                           </p>
                        </div>
                        {startsInText && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 tabular-nums">
                            Starts in: {startsInText}
                          </p>
                        )}
                      </div>

                      <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${
                        isCompleted   ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        isActive      ? 'bg-red-50 text-[#D62027] border-red-100' :
                        startsInText  ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                        'bg-zinc-50 text-zinc-400 border-zinc-100'
                      }`}>
                        {isCompleted ? 'Completed' : isActive ? 'Active Now' : startsInText ? 'Upcoming' : 'Locked'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}



      {/* 5. Fallback/Other Sections (Upcoming / Submitted / No Tests) */}
      <div className="mt-16 pb-12 w-full">
        {!hasActiveTest ? (
          <div className="bg-[#fcfdfd] border border-zinc-100 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-65 no-hover">
            <h4 className="text-xl font-black text-zinc-900 tracking-tight mb-2 uppercase">No Active Tests Assigned</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 max-w-sm">
              Your institution has not published any active PRI readiness tests at this time. Please check back later.
            </p>
          </div>
        ) : isCompleted ? (
          <div className="bg-white rounded-[28px] p-6 md:p-10 border border-slate-200 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] no-hover">
            <div className="flex-1 relative z-10 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className="px-4 py-1.5 bg-white border border-zinc-200 rounded-full flex items-center gap-2.5 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">Official Assessment Recorded</span>
                </div>
              </div>
              
              <h4 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight leading-[1.1] mb-6 uppercase">
                Assessment <span className="text-[#D62027]">Submitted Successfully</span>
              </h4>
              
              <p className="text-[16px] font-medium text-slate-500 leading-relaxed max-w-lg mb-10">
                Thank you for completing the <strong>{bankInfo?.title || 'this evaluation period'}</strong>. Your responses have been securely logged and are now being processed by our Evaluation Engine. Results and final readiness scores will be updated in your Performance History once the verification phase is complete. We appreciate your diligent focus.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button 
                  onClick={() => router.push('/student?tab=results')}
                  className="flex items-center gap-3 px-8 py-5 bg-[#0f172a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                >
                  View Performance History
                </button>
              </div>
            </div>

            <div className="w-full md:w-auto shrink-0 relative z-10 flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 bg-white rounded-[48px] flex items-center justify-center border border-zinc-100 relative transition-all duration-700 no-hover">
                  <div className="w-28 h-28 bg-emerald-700 rounded-[36px] flex flex-col items-center justify-center relative z-10 border border-emerald-100/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status</p>
                    <p className="text-sm font-black uppercase text-white tracking-widest">Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      {/* PRI TOP PERFORMANCE SECTION (Immediate above spectrum) */}
      {data && (
        <section className="space-y-6 mt-10 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-red-600 rounded-xl shadow-[0_0_15px_rgba(255,71,87,0.1)]">
                <TrendingUp className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-[28px] font-black text-slate-900 tracking-tight uppercase leading-none">PRI Placement Readiness Score</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             {/* LEFT CARD: OVERALL PRI SCORE */}
             <div className="md:col-span-8 bg-[#0f172a] rounded-[40px] p-8 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] flex flex-col justify-between no-hover group transition-all duration-500 hover:shadow-[0_35px_70px_-15px_rgba(15,23,42,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-[#D62027]/10 opacity-60 pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#D62027]/10 blur-[100px] rounded-full" />
                
                {/* Red Star Box on top right */}
                <div className="absolute right-10 top-10 flex items-center justify-center w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transition-transform group-hover:scale-110">
                   <Star className="w-6 h-6 text-[#FF4757] fill-[#FF4757]" />
                </div>

                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 font-sans">Overall Placement Readiness Index</p>
                   <div className="flex items-baseline gap-2 mb-10">
                      <span className="text-[80px] font-black text-white tracking-tighter leading-none animate-in zoom-in duration-700">{priScore.toFixed(2)}</span>
                      <span className="text-3xl font-black text-[#FF4757] animate-pulse transition-all">%</span>
                   </div>
                   <p className="text-[11px] font-medium text-slate-400 italic max-w-sm mb-12">Based on comprehensive skill assessment across all domains</p>
                </div>

                <div className="relative z-10">
                   <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Readiness Progress</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-200">{priScore.toFixed(2)}% Complete</p>
                   </div>
                   <div className="h-2.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-[#FF4757] shadow-[0_0_20px_rgba(255,71,87,0.4)] transition-all duration-1000 ease-out" 
                        style={{ width: `${priScore}%` }} 
                      />
                   </div>
                </div>
             </div>

             {/* RIGHT CARD: PLACEMENT STATUS */}
             <div className="md:col-span-4 bg-white rounded-[40px] p-8 flex flex-col items-center justify-center text-center shadow-[0_30px_70px_-20px_rgba(15,23,42,0.06)] border border-slate-50 relative no-hover group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className={cn(
                   "w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-white shadow-xl relative z-10 animate-bounce-subtle",
                   status.iconBg,
                   status.shadow
                )}>
                   <Activity className="w-9 h-9 text-white" />
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 relative z-10">Placement Status</p>
                
                <h3 className={cn(
                  "text-[28px] font-black tracking-tight uppercase leading-none relative z-10 drop-shadow-sm",
                  status.color
                )}>
                  {status.label}
                </h3>
             </div>
          </div>
        </section>
      )}

      <SkillSpectrumRadar 
        domainMetrics={domainMetrics}
        overallMetrics={overallMetrics as any}
        overallStatus={overallStatus}
      />
    </div>
  );
}