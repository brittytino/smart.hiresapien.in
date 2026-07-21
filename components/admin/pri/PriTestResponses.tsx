'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, User, CheckCircle2, XCircle, Search, RefreshCw, BarChart3, ClipboardCheck, Target, Activity, Users, Sparkles, Globe, ShieldCheck, ShieldX, FileText, Eye } from 'lucide-react';

interface SubskillResult {
  name: string;
  score: number;
  correct: number;
  total: number;
  priContribution?: number;
}

const getDomainColor = (name: string) => {
  const n = (name || '').toUpperCase();
  if (n.includes('COGNITIVE')) return { bg: 'bg-[#E11D48]', text: '#FF4D8D' };
  if (n.includes('BUSINESS')) return { bg: 'bg-[#1D4ED8]', text: '#3B82F6' };
  if (n.includes('PROBLEM')) return { bg: 'bg-[#7E22CE]', text: '#A855F7' };
  if (n.includes('COMMUNICATION')) return { bg: 'bg-[#C2410C]', text: '#F97316' };
  if (n.includes('LEADERSHIP')) return { bg: 'bg-[#047857]', text: '#10B981' };
  if (n.includes('DIGITAL')) return { bg: 'bg-[#0E7490]', text: '#06B6D4' };
  return { bg: 'bg-[#0f172a]', text: '#fff' };
};

interface DomainResult {
  domainId: string;
  domainName: string;
  domainShare?: number;
  score: number;
  correct: number;
  total: number;
  subskills: SubskillResult[];
}

interface Evaluation {
  _id: string;
  responseId: string;
  studentUserId: string | { _id: string; fullName?: string; username: string; studentId?: string };
  percentage: number;
  totalScore: number;
  mcqCorrect: number;
  mcqTotal: number;
  domains: DomainResult[];
  overallStatus?: 'pass' | 'fail' | 'pending';
  traitResults?: Record<string, { score: number; maxScore: number; passed: boolean }>;
  evaluatedAt: string;
}

export default function PriTestResponses({ 
  testId, 
  testTitle, 
  token, 
  onBack 
}: { 
  testId: string;
  testTitle: string;
  token: string;
  onBack: () => void;
}) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isRunningAiEval, setIsRunningAiEval] = useState(false);
  const [aiEvalError, setAiEvalError] = useState('');
  const [writtenAnswers, setWrittenAnswers] = useState<any[]>([]);
  const [loadingWritten, setLoadingWritten] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  async function loadEvaluations() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pri-tests/${testId}/evaluate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch evaluations');
      setEvaluations(data.evaluations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Check publish status
  async function checkPublishStatus() {
    try {
      const res = await fetch(`/api/admin/pri-tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const bank = data.bank || data.priTestBank;
        if (bank?.institutions) {
          // Check if any institution has published results
          const anyPublished = bank.institutions.some((inst: any) => inst.isResultsPublished);
          setIsPublished(anyPublished);
        }
      }
    } catch { /* ignore */ }
  }

  // Load written answers for selected student
  async function loadWrittenAnswers(responseId: string) {
    setLoadingWritten(true);
    try {
      const res = await fetch(`/api/admin/pri-tests/${testId}/responses/${responseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const written = (data.answers || []).filter((a: any) => a.questionType === 'written');
        setWrittenAnswers(written);
      }
    } catch {
      setWrittenAnswers([]);
    } finally {
      setLoadingWritten(false);
    }
  }

  useEffect(() => {
    loadEvaluations();
    checkPublishStatus();
  }, [testId, token]);

  // When a student is selected, load their written answers
  useEffect(() => {
    if (selectedEval?.responseId) {
      loadWrittenAnswers(selectedEval.responseId);
    } else {
      setWrittenAnswers([]);
    }
  }, [selectedEval?.responseId]);

  async function handleTogglePublish() {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/admin/pri-tests/${testId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ publish: !isPublished }),
      });
      if (res.ok) {
        setIsPublished(!isPublished);
      }
    } catch { /* ignore */ }
    setIsPublishing(false);
  }

  async function handleEvaluate() {
    setIsRunningAiEval(true);
    setAiEvalError('');
    try {
      const res = await fetch('/api/admin/evaluate-business', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setAiEvalError(data.error || `Evaluation failed (${res.status})`);
      } else {
        // After AI eval, re-run PRI evaluation to merge scores
        await fetch(`/api/admin/pri-tests/${testId}/evaluate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        await loadEvaluations();
      }
    } catch (err: any) {
      setAiEvalError(err.message || 'Network error — could not reach evaluation service');
    }
    setIsRunningAiEval(false);
    // Refresh written answers if we have a selected evaluation
    if (selectedEval?.responseId) {
      loadWrittenAnswers(selectedEval.responseId);
    }
  }

  const filteredEvals = evaluations.filter(ev => {
    let studentId = '';
    if (typeof ev.studentUserId === 'string') {
      studentId = ev.studentUserId;
    } else if (ev.studentUserId && typeof ev.studentUserId === 'object') {
      studentId = ev.studentUserId.username || ev.studentUserId.fullName || '';
    }
    const matchesSearch = String(studentId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ev.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#D62027] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Student Responses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">{testTitle}</h3>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
            {evaluations.length} total responses found
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {aiEvalError && (
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{aiEvalError}</p>
          )}
        <div className="flex items-center gap-3 flex-wrap">
          {/* AI Business Eval Button */}
          <button
            onClick={handleEvaluate}
            disabled={isRunningAiEval}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f172a] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
          >
            {isRunningAiEval ? 'Calculating...' : 'Evaluate'}
          </button>

          {/* Publish Toggle */}
          <button
            onClick={handleTogglePublish}
            disabled={isPublishing}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 shadow-sm transition-all hover:scale-[1.02] active:scale-95 ${
              isPublished 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {isPublishing ? 'Updating...' : isPublished ? 'Published ✓' : 'Publish Results'}
          </button>

          <button
            onClick={onBack}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500"
          >
            Back to Tests
          </button>
        </div>
        </div>
      </div>

      {/* Integrated Response Explorer */}
      <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-sm">
        <div className="p-3.75 border-b border-zinc-100 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">Performance Explorer</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Candidate readiness metrics</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-[#D62027]/5 focus:border-[#D62027] transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-600 focus:ring-4 focus:ring-[#D62027]/5 focus:border-[#D62027] outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pass">Psychometric: Pass</option>
                <option value="fail">Psychometric: Fail</option>
                <option value="pending">Pending Eval</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-150 custom-scrollbar no-hover">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Candidate</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">PRI Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Domain Metrics</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredEvals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No records found in explorer</p>
                  </td>
                </tr>
              ) : (
                filteredEvals.map((ev) => {
                  const rawId = typeof ev.studentUserId === 'string'
                    ? ev.studentUserId
                    : ev.studentUserId?.username || ev.studentUserId?.fullName || '';
                  const displayName = rawId.split('@')[0] || 'Unknown';
                  const studentId = typeof ev.studentUserId === 'object' && ev.studentUserId?.studentId
                    ? ev.studentUserId.studentId
                    : rawId;
                  const initials = displayName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('') || 'ST';
                  const readiness = Number(ev.percentage || 0);
                  const domains = ev.domains || [];

                  return (
                    <tr 
                      key={ev._id} 
                      className="border-b border-zinc-50/50 no-hover"
                      onClick={() => {
                        setSelectedEval(ev);
                        setIsDetailOpen(true);
                      }}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-black text-zinc-600 uppercase">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-zinc-900 tracking-tight truncate uppercase">{displayName}</p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 truncate">
                              {studentId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D62027] rounded-full"
                              style={{ width: `${Math.min(Math.max(readiness, 0), 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-zinc-900">
                            {`${readiness.toFixed(2)}%`}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="grid grid-cols-3 gap-2 w-fit">
                          {domains.map((dom, idx) => {
                            const domainScore = dom.domainShare && dom.domainShare > 0
                              ? Number(((dom.score / dom.domainShare) * 100).toFixed(2))
                              : dom.total
                                ? Number(((dom.correct / (dom.total || 1)) * 100).toFixed(2))
                                : Number((dom.score || 0).toFixed(2));
                            const colors = getDomainColor(dom.domainName);
                            return (
                              <div key={dom.domainId} className="relative group/skill">
                                <div 
                                  className={`w-[52px] h-8 px-1.5 rounded-md ${colors.bg} text-white flex items-center justify-center text-[10px] font-black shadow-sm cursor-help transition-all hover:scale-110 hover:shadow-lg`}
                                >
                                  {domainScore}
                                </div>
                                {/* Hover Reveal Tip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#0a0a0a] text-white text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/skill:opacity-100 transition-all duration-200 z-[100] shadow-2xl border border-white/10 translate-y-2 group-hover/skill:translate-y-0 text-center min-w-[120px]">
                                   <p className="leading-tight opacity-70 mb-0.5">{dom.domainName}</p>
                                   <p className="text-[11px] font-black tracking-tighter" style={{ color: colors.text }}>
                                     SCORE: {domainScore}%
                                   </p>
                                   <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#0a0a0a]" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/report/${ev.responseId}`;
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#D62027] text-white px-3 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#b71b20] transition-all"
                          >
                            <Eye className="w-4 h-4" /> View Full Report
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEval(ev);
                              setIsDetailOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#D62027]"
                          >
                            View Full Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed PRI report as popup card */}
      {mounted && isDetailOpen && selectedEval && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F9FAFB] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsDetailOpen(false)}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white border border-zinc-200 p-1.5 text-zinc-400"
            >
              <XCircle className="w-4 h-4" />
            </button>

            <div className="space-y-6 mt-4">
              <div className="g360-card p-8 relative overflow-hidden no-hover">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black rounded-lg tracking-widest uppercase inline-block">
                        PRI Performance Report
                      </span>
                      {selectedEval.overallStatus && (
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg tracking-widest uppercase inline-block ${
                          selectedEval.overallStatus === 'pass' ? 'bg-emerald-600 text-white' :
                          selectedEval.overallStatus === 'fail' ? 'bg-red-600 text-white' :
                          'bg-zinc-200 text-zinc-600'
                        }`}>
                          {selectedEval.overallStatus === 'pass' ? 'Psychometric: Passed' :
                           selectedEval.overallStatus === 'fail' ? 'Psychometric: Failed' : 'Pending'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase mb-1">
                      {typeof selectedEval.studentUserId === 'string' ? selectedEval.studentUserId.split('@')[0] : (selectedEval.studentUserId?.fullName || selectedEval.studentUserId?.username || 'Unknown').split('@')[0]}
                    </h4>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Overall Placement Readiness Index
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `/report/${selectedEval.responseId}`;
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#D62027] text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#b71b20] transition-all"
                    >
                      <Eye className="w-4 h-4" /> View Full Report
                    </button>
                    <div className="bg-white border-4 border-zinc-950 rounded-3xl p-6 flex flex-col items-center justify-center min-w-35 shadow-2xl">
                      <span className="text-4xl font-black text-zinc-950 leading-none mb-1">{Number(selectedEval.percentage || 0).toFixed(2)}%</span>
                      <span className="text-[10px] font-black uppercase text-[#D62027] tracking-widest">Score Index</span>
                    </div>
                  </div>
                </div>

                {/* Psychometric Trait Results */}
                {selectedEval.traitResults && Object.keys(selectedEval.traitResults).length > 0 && (
                  <div className="mt-8 pt-6 border-t border-zinc-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                      Psychometric Gateway
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {Object.entries(selectedEval.traitResults).map(([trait, result]) => (
                        <div key={trait} className={`p-3 rounded-xl border text-center ${
                          result.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1 truncate" title={trait}>
                            {trait.replaceAll('_', ' ')}
                          </p>
                          <p className={`text-xs font-black uppercase ${result.passed ? 'text-emerald-700' : 'text-red-700'}`}>
                            {result.passed ? 'PASS' : 'FAIL'}
                          </p>
                          <p className="text-[9px] text-zinc-400 font-bold mt-0.5">
                            {result.score.toFixed(2)} / {result.maxScore.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Total Correct</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-zinc-900">{selectedEval.mcqCorrect}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Total Questions</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-zinc-900">{selectedEval.mcqTotal}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Total Domains</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-zinc-900">{selectedEval.domains.length}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Evaluation Date</p>
                    <div className="flex items-center gap-2 text-zinc-900 font-black text-sm uppercase tracking-tighter">
                      {selectedEval.evaluatedAt ? new Date(selectedEval.evaluatedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Domain Performance */}
              <div className="space-y-4">
                <h5 className="text-sm font-black uppercase tracking-widest text-zinc-900 px-2 flex items-center gap-2">
                  Domain Performance Breakdown
                </h5>
                <div className="grid gap-4">
                  {selectedEval.domains.map((dom) => (
                    <div key={dom.domainId} className="g360-card p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#D62027] mb-0.5">{dom.domainId}</p>
                          <h6 className="text-lg font-black text-zinc-900 uppercase tracking-tight">{dom.domainName}</h6>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-zinc-950 leading-none">{dom.score}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Section Score</p>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-6">
                        <div
                          className="h-full bg-zinc-950"
                          style={{ width: `${(dom.domainShare && dom.domainShare > 0) ? (dom.score / dom.domainShare) * 100 : (dom.correct / (dom.total || 1)) * 100}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dom.subskills.map((sub, si) => (
                          <div key={si} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <p className="text-[9px] font-bold uppercase tracking-tight text-zinc-500 mb-1 truncate">{sub.name}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-zinc-900">{sub.score} pts</span>
                              <span className="text-[10px] font-bold text-zinc-400">
                                {sub.priContribution ? `/${sub.priContribution} PRI` : `${sub.correct}/${sub.total} Correct`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Written Task AI Evaluation Details */}
              {writtenAnswers.length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-sm font-black uppercase tracking-widest text-zinc-900 px-2 flex items-center gap-2">
                    Business Writing AI Evaluation
                  </h5>
                  {writtenAnswers.map((answer: any, idx: number) => (
                    <div key={idx} className="g360-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5">
                            {answer.domainId} / {answer.subSkill || 'Business Writing Task'}
                          </p>
                          <p className="text-sm font-black text-zinc-900">Written Question {answer.questionIndex + 1}</p>
                        </div>
                        {answer.aiEvaluation && (
                          <div className="bg-[#0f172a] rounded-2xl px-4 py-2 text-center">
                            <span className="text-xl font-black text-white">{answer.aiEvaluation.averageScore.toFixed(2)}</span>
                            <span className="text-[9px] font-black text-zinc-400 block uppercase tracking-widest">/ 100</span>
                          </div>
                        )}
                      </div>

                      {/* Student Response Preview */}
                      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 mb-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Student Response</p>
                        <p className="text-sm text-zinc-700 font-medium leading-relaxed line-clamp-4">
                          {answer.answerText || answer.studentAnswer || 'No response provided'}
                        </p>
                      </div>

                      {/* AI Score Breakdown */}
                      {answer.aiEvaluation?.scores && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                          {Object.entries(answer.aiEvaluation.scores).map(([key, value]) => (
                            <div key={key} className="p-3 bg-white border border-zinc-100 rounded-xl text-center">
                              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1 truncate" title={key.replaceAll('_', ' ')}>
                                {key.replaceAll('_', ' ')}
                              </p>
                              <p className="text-lg font-black text-zinc-900">{value as number}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI Feedback */}
                      {answer.aiEvaluation?.feedback && (
                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                          <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-2">
                            AI Feedback
                          </p>
                          <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                            {answer.aiEvaluation.feedback}
                          </p>
                        </div>
                      )}

                      {!answer.aiEvaluation && !(answer.answerText || answer.studentAnswer) && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                          <p className="text-xs font-bold text-amber-700">
                            No student response found for this task. AI evaluation skipped.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
