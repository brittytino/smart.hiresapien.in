'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Brain, BarChart3, PenLine, Lightbulb, FileKey2 } from 'lucide-react';

type StageStatus = 'pending' | 'running' | 'done' | 'error';

interface PipelineStage {
  key: string;
  label: string;
  subLabel: string;
  runningLabel: string;
  icon: React.ElementType;
  status: StageStatus;
}

interface PipelineResult {
  totalStudents: number;
  stages: {
    psychometric: { done: boolean; passed: number; failed: number };
    mcq: { done: boolean };
    written: { done: boolean };
    insights: { done: boolean; fetched: number; skipped: number };
    report: { done: boolean; saved: number };
  };
  students: Array<{
    studentId: string;
    name: string;
    priGatewayPassed: boolean;
    passedTraits: number;
    totalTraits: number;
    mcqPriScore: number;
    writtenPriScore: number;
    totalPriScore: number;
    overallStatus: 'pass' | 'fail';
    insights: {
      status: 'fetched' | 'skipped';
      source: 'external' | 'internal';
      reason: 'none' | 'timeout' | 'unauthorized' | 'no_evaluation_data' | 'service_unavailable' | 'http_error' | 'invalid_payload';
      httpStatus?: number;
      error?: string;
    };
  }>;
  message: string;
}

interface EvaluationPipelineModalProps {
  isOpen: boolean;
  testId: string;
  token: string;
  onComplete: () => void;
  onClose: () => void;
}

const STAGE_DEFS: Omit<PipelineStage, 'status'>[] = [
  {
    key: 'psychometric',
    label: 'Psychometric Gateway',
    runningLabel: 'Scoring workspace psychology traits...',
    subLabel: 'Evaluating behavioural trait responses',
    icon: Brain,
  },
  {
    key: 'mcq',
    label: 'MCQ Intelligence',
    runningLabel: 'Scoring domain MCQ responses...',
    subLabel: 'Evaluating MCQ domain answers',
    icon: BarChart3,
  },
  {
    key: 'written',
    label: 'Written Evaluation',
    runningLabel: 'AI intelligence evaluating written answers...',
    subLabel: 'Analysing business writing responses',
    icon: PenLine,
  },
  {
    key: 'insights',
    label: 'Insights Generation',
    runningLabel: 'Generating personalised student insights...',
    subLabel: 'Building AI-powered student profiles',
    icon: Lightbulb,
  },
  {
    key: 'report',
    label: 'Solution Key',
    runningLabel: 'Preparing and saving solution key...',
    subLabel: 'Persisting results to database',
    icon: FileKey2,
  },
];

const STAGE_DURATION_MS = 3200;

export default function EvaluationPipelineModal({
  isOpen,
  testId,
  token,
  onComplete,
  onClose,
}: EvaluationPipelineModalProps) {
  const [stages, setStages] = useState<PipelineStage[]>(() =>
    STAGE_DEFS.map((s) => ({ ...s, status: 'pending' }))
  );
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiDone, setApiDone] = useState(false);
  const visualStageRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentStudentText, setCurrentStudentText] = useState('');
  const [progressCount, setProgressCount] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!isOpen) return;

    // Reset
    setResult(null);
    setError(null);
    setApiDone(false);
    setCurrentStudentText('');
    setProgressCount({ current: 0, total: 0 });
    visualStageRef.current = 0;
    setStages(STAGE_DEFS.map((s) => ({ ...s, status: 'pending' })));

    // Kick off first stage
    setStages((prev) => {
      const next = [...prev];
      next[0] = { ...next[0], status: 'running' };
      return next;
    });

    // Visual ticker — advances one stage every STAGE_DURATION_MS
    timerRef.current = setInterval(() => {
      visualStageRef.current += 1;
      const idx = visualStageRef.current;
      if (idx >= STAGE_DEFS.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      setStages((prev) => {
        const next = [...prev];
        if (idx > 0) next[idx - 1] = { ...next[idx - 1], status: 'done' };
        next[idx] = { ...next[idx], status: 'running' };
        return next;
      });
    }, STAGE_DURATION_MS);

    // Real API call (Sequential processing per student)
    const run = async () => {
      try {
        const getRes = await fetch(`/api/admin/pri-tests/${testId}/evaluate/pipeline`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!getRes.ok) {
           const errData = await getRes.json().catch(() => ({}));
           throw new Error(errData.error || 'Failed to fetch pending responses');
        }
        
        const pendingData = await getRes.json();
        const responses = pendingData.responses || [];
        
        if (responses.length === 0) {
          setResult({
            totalStudents: 0,
            stages: {
              psychometric: { done: true, passed: 0, failed: 0 },
              mcq: { done: true },
              written: { done: true },
              insights: { done: true, fetched: 0, skipped: 0 },
              report: { done: true, saved: 0 },
            },
            students: [],
            message: 'No pending students to evaluate.',
          });
          setApiDone(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }

        setProgressCount({ current: 0, total: responses.length });

        let accumulatedResult: PipelineResult = {
          totalStudents: 0,
          stages: {
            psychometric: { done: true, passed: 0, failed: 0 },
            mcq: { done: true },
            written: { done: true },
            insights: { done: true, fetched: 0, skipped: 0 },
            report: { done: true, saved: 0 },
          },
          students: [],
          message: 'Pipeline complete.',
        };

        for (let i = 0; i < responses.length; i++) {
          const resp = responses[i];
          const name = resp.studentName || resp.studentUsername || 'Student';
          setCurrentStudentText(`Evaluating ${name}...`);
          
          try {
            const res = await fetch(`/api/admin/pri-tests/${testId}/evaluate/pipeline`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ responseId: resp._id }),
            });
            
            if (!res.ok) {
              console.warn(`Evaluation failed for student ${name}`);
              setProgressCount(prev => ({ ...prev, current: prev.current + 1 }));
              continue;
            }
            
            const data: PipelineResult = await res.json();
            
            accumulatedResult.totalStudents += data.totalStudents;
            accumulatedResult.stages.psychometric.passed += data.stages.psychometric.passed;
            accumulatedResult.stages.psychometric.failed += data.stages.psychometric.failed;
            accumulatedResult.stages.insights.fetched += data.stages.insights.fetched;
            accumulatedResult.stages.insights.skipped += data.stages.insights.skipped;
            accumulatedResult.stages.report.saved += data.stages.report.saved;
            if (data.students && data.students.length > 0) {
              accumulatedResult.students.push(...data.students);
            }
            
          } catch (err) {
            console.warn(`Error evaluating student ${name}:`, err);
          }
          
          setProgressCount(prev => ({ ...prev, current: prev.current + 1 }));
        }

        setResult(accumulatedResult);
      } catch (err: any) {
        setError(err.message || 'Evaluation pipeline failed');
      } finally {
        setApiDone(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    run();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, testId, token]);

  // Once API finishes, lock all stages to real state
  useEffect(() => {
    if (!apiDone) return;
    if (error) {
      setStages((prev) =>
        prev.map((s) =>
          s.status === 'running' || s.status === 'pending' ? { ...s, status: 'error' } : s
        )
      );
      return;
    }
    if (result) {
      setStages(
        STAGE_DEFS.map((def, i) => {
          let subLabel = def.subLabel;
          if (def.key === 'psychometric')
            subLabel = `${result.stages.psychometric.passed} passed · ${result.stages.psychometric.failed} failed`;
          else if (def.key === 'mcq') subLabel = `${result.totalStudents} student(s) scored`;
          else if (def.key === 'written') subLabel = `${result.totalStudents} student(s) evaluated`;
          else if (def.key === 'insights')
            subLabel = `${result.stages.insights.fetched} generated · ${result.stages.insights.skipped} skipped`;
          else if (def.key === 'report') subLabel = `${result.stages.report.saved} report(s) saved`;
          return { ...def, subLabel, status: 'done' };
        })
      );
    }
  }, [apiDone, error, result]);

  if (!isOpen) return null;

  const activeIdx = stages.findIndex((s) => s.status === 'running');
  const activeStage = activeIdx >= 0 ? stages[activeIdx] : null;
  const skippedInsights = (result?.students || []).filter((s) => s.insights?.status === 'skipped');
  const reasonLabel: Record<string, string> = {
    timeout: 'Timeout',
    unauthorized: 'Unauthorized',
    no_evaluation_data: 'No Evaluation Data',
    service_unavailable: 'Service Unavailable',
    http_error: 'HTTP Error',
    invalid_payload: 'Invalid Payload',
    none: 'None',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl shadow-2xl border border-zinc-100 w-full max-w-lg animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-100">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D62027] mb-1">PRI Assessment Engine</p>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none">
              Evaluation Pipeline
            </h2>
            {progressCount.total > 0 && !apiDone && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 text-zinc-600 rounded-lg">
                {progressCount.current} / {progressCount.total}
              </span>
            )}
          </div>
          {activeStage && !apiDone && (
            <p className="mt-2 text-[11px] font-medium text-zinc-500 animate-in fade-in duration-500">
              {currentStudentText ? currentStudentText : activeStage.runningLabel}
            </p>
          )}
          {apiDone && !error && (
            <p className="mt-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest">
              All stages complete
            </p>
          )}
          {error && (
            <p className="mt-2 text-[11px] font-black text-red-500 uppercase tracking-widest">
              Pipeline error
            </p>
          )}
        </div>

        {/* Roadmap */}
        <div className="px-8 py-6">
          <div className="relative">
            {/* Vertical track */}
            <div className="absolute left-4.75 top-5 bottom-5 w-0.5 bg-zinc-100" />
            {/* Active fill */}
            <div
              className="absolute left-4.75 top-5 w-0.5 bg-[#D62027] transition-all duration-700 ease-in-out"
              style={{
                height: (() => {
                  const doneCount = stages.filter((s) => s.status === 'done').length;
                  const total = stages.length - 1;
                  if (doneCount === 0) return '0%';
                  if (doneCount >= stages.length) return '100%';
                  return `${(doneCount / total) * 100}%`;
                })(),
              }}
            />

            <div className="space-y-0">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                const isDone = stage.status === 'done';
                const isRunning = stage.status === 'running';
                const isError = stage.status === 'error';

                return (
                  <div key={stage.key} className="flex items-start gap-5 relative py-3">
                    {/* Node */}
                    <div className="relative z-10 shrink-0">
                      {isDone ? (
                        <div className="w-10 h-10 rounded-full bg-[#D62027] flex items-center justify-center shadow-md shadow-[#D62027]/20 transition-all duration-300">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      ) : isRunning ? (
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-[#D62027] flex items-center justify-center shadow-lg scale-110 transition-all duration-300">
                          <div className="w-4 h-4 border-2 border-[#D62027]/30 border-t-[#D62027] rounded-full animate-spin" />
                        </div>
                      ) : isError ? (
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-red-400 flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-400" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center transition-all duration-300">
                          <Icon className="w-4 h-4 text-zinc-300" />
                        </div>
                      )}
                    </div>

                    {/* Labels */}
                    <div className="flex-1 pt-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-[11px] font-black uppercase tracking-tight transition-colors duration-300 ${
                          isDone ? 'text-zinc-700' :
                          isRunning ? 'text-[#D62027]' :
                          isError ? 'text-red-500' :
                          'text-zinc-300'
                        }`}>
                          {stage.label}
                        </p>
                        {isRunning && (
                          <span className="inline-flex gap-0.5">
                            {[0,1,2].map(i => (
                              <span
                                key={i}
                                className="w-1 h-1 rounded-full bg-[#D62027] animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] font-medium mt-0.5 transition-colors duration-300 ${
                        isDone ? 'text-emerald-600' :
                        isRunning ? 'text-zinc-400' :
                        'text-zinc-300'
                      }`}>
                        {isDone ? stage.subLabel : isRunning ? stage.runningLabel : stage.subLabel}
                      </p>
                    </div>

                    {/* Done check accent */}
                    {isDone && (
                      <div className="pt-2.5 shrink-0">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Done</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          {!apiDone ? (
            <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-4 h-4 border-2 border-[#D62027]/20 border-t-[#D62027] rounded-full animate-spin shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Pipeline running — please wait...
              </span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-0.5">Error</p>
                <p className="text-[11px] text-red-700 wrap-break-word">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 px-3 py-1.5 bg-white border border-red-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all"
              >
                Close
              </button>
            </div>
          ) : result ? (
            <div className="space-y-3">
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Students</p>
                  <p className="text-xl font-black text-zinc-900">{result.totalStudents}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Gateway Pass</p>
                  <p className="text-xl font-black text-emerald-700">{result.stages.psychometric.passed}</p>
                </div>
                <div className={`p-3 rounded-xl text-center border ${result.stages.psychometric.failed > 0 ? 'bg-red-50 border-red-100' : 'bg-zinc-50 border-zinc-100'}`}>
                  <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${result.stages.psychometric.failed > 0 ? 'text-red-500' : 'text-zinc-400'}`}>Gateway Fail</p>
                  <p className={`text-xl font-black ${result.stages.psychometric.failed > 0 ? 'text-red-700' : 'text-zinc-400'}`}>{result.stages.psychometric.failed}</p>
                </div>
              </div>
              {skippedInsights.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-[8px] font-black uppercase tracking-widest text-amber-700 mb-2">
                    Insights Skip Diagnostics
                  </p>
                  <div className="max-h-28 overflow-auto space-y-2 pr-1">
                    {skippedInsights.map((student) => (
                      <div key={student.studentId} className="rounded-lg bg-white border border-amber-100 px-2.5 py-2">
                        <p className="text-[10px] font-black text-zinc-800 uppercase tracking-tight">
                          {student.name} ({student.studentId})
                        </p>
                        <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                          {reasonLabel[student.insights.reason] || student.insights.reason}
                          {typeof student.insights.httpStatus === 'number' ? ` · HTTP ${student.insights.httpStatus}` : ''}
                          {' · '}
                          {student.insights.source}
                        </p>
                        {student.insights.error && (
                          <p className="text-[9px] text-zinc-600 mt-0.5 leading-relaxed">
                            {student.insights.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={onComplete}
                className="w-full rounded-2xl bg-zinc-950 text-white py-3.5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
              >
                View Full Results
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
