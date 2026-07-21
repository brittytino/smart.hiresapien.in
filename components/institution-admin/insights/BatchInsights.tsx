'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Search,
  User,
  Users,
  XCircle,
  BarChart3,
  Activity,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Target,
  ShieldCheck,
  FileText,
  Eye,
  Sparkles
} from 'lucide-react';
import PriReportView from '@/components/report/PriReportView';
import StudentDetails from '../student/StudentDetails';

interface DomainScore {
  domainId: string;
  domainName: string;
  domainShare?: number;
  score: number;
  correct: number;
  total: number;
  subskills?: any[];
}

interface EvaluationSummary {
  responseId: string;
  percentage: number;
  totalScore: number;
  mcqCorrect: number;
  mcqTotal: number;
  overallStatus?: 'pass' | 'fail' | 'pending';
  evaluatedAt?: string;
  domains: DomainScore[];
  hasAiInsights?: boolean;
  priGatewayPassed?: boolean;
  traitResults?: Record<string, { score: number; maxScore: number; passed: boolean }>;
}

interface BatchStudent {
  id: string;
  username: string;
  fullName?: string;
  studentId?: string;
  batch?: string;
  programme?: string;
  latestEvaluation?: EvaluationSummary | null;
}

interface BatchAggregate {
  batchName: string;
  averageScore: number;
  totalStudents: number;
  students: BatchStudent[];
  evaluatedStudents?: number;
  passRate?: number;
  aiInsightStatus?: 'generated' | 'skipped_threshold' | 'failed' | 'not_generated';
  aiGeneratedAt?: string | null;
  aiProvider?: string | null;
  aiInsights?: {
    summaryInsight?: string;
    cohortReadiness?: string;
    topFindings?: string[];
    weakDomains?: Array<{
      domainName: string;
      averageAccuracy: number;
      riskCount: number;
      intervention: string;
      whyItMatters: string;
    }>;
    urgentStudents?: Array<{
      studentName: string;
      username: string;
      riskReason: string;
      priority: 'High' | 'Medium' | 'Low';
    }>;
    recommendedActions?: string[];
  } | null;
  batchMetrics?: {
    weakDomains?: Array<{
      domainName: string;
      averageAccuracy: number;
      averageScore: number;
      weakCount: number;
      strongCount: number;
      subskillWeaknesses?: Array<{
        name: string;
        averageAccuracy: number;
        weakCount: number;
      }>;
    }>;
    urgentStudents?: Array<{
      id: string;
      username: string;
      fullName?: string;
      studentId?: string;
      percentage: number;
      overallStatus?: 'pass' | 'fail' | 'pending';
      evaluatedAt?: string;
      weakDomains: string[];
      riskReason: string;
    }>;
    topSubskillGaps?: Array<{
      domainName: string;
      subSkillName: string;
      averageAccuracy: number;
      weakCount: number;
    }>;
  };
}

interface ReportData {
  studentInfo: any;
  overallMetrics: any;
  domains: any[];
  summaryInsight?: string;
  aiInsights?: Record<string, unknown> | null;
  overallStatus?: string;
  priGatewayPassed?: boolean;
}

function getDomainPercentage(domain: DomainScore): number {
  if (domain.domainShare && domain.domainShare > 0) {
    return Number(((domain.score / domain.domainShare) * 100).toFixed(2));
  }
  if (domain.total > 0) {
    return Number(((domain.correct / domain.total) * 100).toFixed(2));
  }
  return Number((domain.score || 0).toFixed(2));
}

function getDisplayName(student: BatchStudent): string {
  return student.fullName || student.username || 'Student';
}

function getAverageScore(batches: BatchAggregate[]): number {
  if (!batches.length) return 0;
  return Number((batches.reduce((acc, batch) => acc + batch.averageScore, 0) / batches.length).toFixed(2));
}

const getDomainColor = (name: string) => {
  const n = (name || '').toUpperCase();
  if (n.includes('COGNITIVE')) return { bg: 'bg-[#FF4B8C]', text: '#FF4B8C' };
  if (n.includes('BUSINESS')) return { bg: 'bg-[#3B82F6]', text: '#3B82F6' };
  if (n.includes('PROBLEM')) return { bg: 'bg-[#A855F7]', text: '#A855F7' };
  if (n.includes('COMMUNICATION')) return { bg: 'bg-[#F97316]', text: '#F97316' };
  if (n.includes('LEADERSHIP')) return { bg: 'bg-[#10B981]', text: '#10B981' };
  if (n.includes('DIGITAL')) return { bg: 'bg-[#06B6D4]', text: '#06B6D4' };
  return { bg: 'bg-[#0f172a]', text: '#fff' };
};

function getPassRate(batches: BatchAggregate[]): number {
  const evaluatedStudents = batches.reduce((acc, batch) => acc + (batch.evaluatedStudents ?? 0), 0);
  if (!evaluatedStudents) return 0;
  const passCount = batches.reduce((acc, batch) => {
    return acc + (batch.students || []).filter((student) => student.latestEvaluation?.overallStatus === 'pass').length;
  }, 0);
  return Number(((passCount / evaluatedStudents) * 100).toFixed(2));
}

export default function BatchInsights({ token, apiUrl = '/api/institution-admin/batches/insights', canGenerate = true }: { token: string; apiUrl?: string; canGenerate?: boolean }) {
  const [batches, setBatches] = useState<BatchAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [generationMessage, setGenerationMessage] = useState('');

  // detail/modal state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [lastExam, setLastExam] = useState<{ id: string; title: string; date: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function loadBatches(generateInsights = false) {
    if (generateInsights) {
      setGeneratingInsights(true);
      setGenerationMessage('Generating batch insights with AI...');
    } else {
      setLoading(true);
      setGenerationMessage('');
    }

    setError('');

    try {
      const url = generateInsights
        ? `${apiUrl}?generate=true&force_refresh=true`
        : apiUrl;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load batch insights');

      setBatches(data.batches || []);
      setLastExam(data.lastExam || null);
      if (data.batches && data.batches.length > 0) {
        setExpandedBatch((current) => current || data.batches[0].batchName);
      }

      if (generateInsights) {
        const generated = data.generationSummary?.generated ?? 0;
        const skipped = data.generationSummary?.skippedThreshold ?? 0;
        const failed = data.generationSummary?.failed ?? 0;
        setGenerationMessage(
          `AI insights updated: ${generated} generated, ${skipped} skipped for low data, ${failed} failed.`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load batch insights');
    } finally {
      if (generateInsights) {
        setGeneratingInsights(false);
      } else {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadBatches();
  }, [token]);

  const handleGenerateInsights = async () => {
    await loadBatches(true);
  };

  // Load report data when student is clicked
  useEffect(() => {
    if (!selectedStudentId) {
      setReportData(null);
      setReportError('');
      return;
    }

    async function loadReport() {
      setReportLoading(true);
      setReportError('');

      // Find the specific student responseId
      let responseId = '';
      let studentData = null;
      for (const b of batches) {
        const s = b.students.find(st => st.id === selectedStudentId);
        if (s) {
          studentData = s;
          responseId = s.latestEvaluation?.responseId || '';
          break;
        }
      }

      if (studentData) {
        setSelectedStudentName(getDisplayName(studentData));
      }

      if (!responseId) {
        setReportError('No PRI evaluation found for this student.');
        setReportData(null);
        setReportLoading(false);
        return;
      }

      try {
        const reportRes = await fetch(`/api/student/reports/${responseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reportJson = await reportRes.json();
        if (!reportRes.ok) {
          throw new Error(reportJson.error || 'Failed to load PRI Report');
        }
        setReportData(reportJson);
      } catch (err: any) {
        setReportError(err.message || 'Failed to load PRI Report');
        setReportData(null);
      } finally {
        setReportLoading(false);
      }
    }

    loadReport();
  }, [selectedStudentId, token, batches]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#D62027] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Batch Insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-[#D62027] rounded-3xl border border-red-100 flex flex-col items-center gap-4">
        <AlertCircle className="w-10 h-10" />
        <p className="font-black uppercase tracking-widest text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {generationMessage && (
        <div className="rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-500 shadow-sm">
          {generationMessage}
        </div>
      )}

      {/* Global Exam Context */}
      {lastExam && (
        <div className="flex items-center gap-3 px-6 py-4 bg-[#0f172a] rounded-[28px] shadow-lg w-max border border-white/10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Award className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Current Intelligence Snapshot</p>
            <h4 className="text-[15px] font-black text-white tracking-tight uppercase">
              Based on {lastExam.title} • {new Date(lastExam.date).toLocaleDateString('en-GB')}
            </h4>
          </div>
        </div>
      )}

      {/* Aggregate Cards (Image 3 style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-4xl p-8 border border-zinc-100 shadow-sm relative overflow-hidden no-hover">
          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">Total Evaluated</p>
          <h3 className="text-5xl font-black text-zinc-900 tracking-tighter">
            {batches.reduce((acc, b) => acc + (b.evaluatedStudents ?? 0), 0)}
          </h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">In Last PRI Exam</p>
        </div>
        <div className="bg-white rounded-4xl p-8 border border-zinc-100 shadow-sm relative overflow-hidden no-hover">
          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">Avg pri score</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-5xl font-black text-zinc-900 tracking-tighter">
              {getAverageScore(batches)}
            </h3>
            <span className="text-2xl font-black text-zinc-400">%</span>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-sm relative overflow-hidden no-hover">
          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">Avg pass rate</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-5xl font-black text-zinc-900 tracking-tighter">
              {getPassRate(batches)}
            </h3>
            <span className="text-2xl font-black text-zinc-400">%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 shadow-sm">
        {batches.length === 0 ? (
           <p className="text-center py-20 text-xs font-bold text-zinc-400 uppercase tracking-widest">
             No batch evaluation records found.
           </p>
        ) : (
          batches.map((batch) => {
            const isExpanded = expandedBatch === batch.batchName;
            
            return (
              <div key={batch.batchName} className={`border border-zinc-100 rounded-3xl overflow-hidden bg-white ${isExpanded ? 'shadow-md' : ''}`}>
                {/* Batch Header */}
                <div 
                  className="p-[15px] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  onClick={() => setExpandedBatch(isExpanded ? null : batch.batchName)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="text-lg font-black text-zinc-900 tracking-tight uppercase">
                        Batch: {batch.batchName}
                      </h4>
                      <div className="flex flex-col gap-1 mt-1">
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                          {batch.totalStudents} Students ({batch.evaluatedStudents ?? 0} Evaluated)
                        </p>
                        {lastExam && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-[#D62027] uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full w-max mt-1">
                            <span>Based on {lastExam.title} ({new Date(lastExam.date).toLocaleDateString('en-GB')})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 md:gap-10">
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Batch Average</p>
                      <div className="flex items-center gap-3 w-32">
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D62027]"
                            style={{ width: `${Math.min(Math.max(batch.averageScore, 0), 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-zinc-900">{batch.averageScore.toFixed(2)}%</span>
                      </div>
                    </div>
                    {batch.aiInsightStatus && (
                      <div className="hidden lg:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">AI Insight</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${batch.aiInsightStatus === 'generated' ? 'bg-emerald-600 text-white' : batch.aiInsightStatus === 'skipped_threshold' ? 'bg-amber-50 text-amber-700' : batch.aiInsightStatus === 'failed' ? 'bg-red-50 text-red-700' : 'bg-zinc-100 text-zinc-500'}`}>
                          {batch.aiInsightStatus.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    <ChevronDown className={`w-5 h-5 text-zinc-400 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Batch Students Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50/30 p-4 lg:p-6">
                    <div className="mb-5 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">AI Batch Summary</p>
                          <h4 className="text-lg font-black text-zinc-900 tracking-tight uppercase">Actionable batch intelligence</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          <span className="px-3 py-1 rounded-full bg-zinc-100">Evaluated: {batch.evaluatedStudents ?? 0}</span>
                          <span className="px-3 py-1 rounded-full bg-zinc-100">Pass Rate: {(batch.passRate ?? 0).toFixed(2)}%</span>
                          <span className="px-3 py-1 rounded-full bg-zinc-100">Status: {batch.aiInsightStatus?.replace('_', ' ') || 'not generated'}</span>
                        </div>
                      </div>

                      {batch.aiInsights ? (
                        <div className="space-y-4">
                          <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Executive Summary</p>
                            <p className="text-sm font-medium text-zinc-700 leading-6">{batch.aiInsights.summaryInsight || 'No summary available.'}</p>
                            {batch.aiInsights.cohortReadiness && (
                              <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-[#D62027]">{batch.aiInsights.cohortReadiness}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-zinc-100 p-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Top Findings</p>
                              <div className="space-y-2">
                                {(batch.aiInsights.topFindings || []).slice(0, 3).map((finding, index) => (
                                  <div key={`${batch.batchName}-finding-${index}`} className="flex gap-3 text-sm text-zinc-700">
                                    <span className="text-[#D62027] font-black">0{index + 1}</span>
                                    <span className="leading-6">{finding}</span>
                                  </div>
                                ))}
                                {(batch.aiInsights.topFindings || []).length === 0 && (
                                  <p className="text-sm text-zinc-400">No findings available yet.</p>
                                )}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-100 p-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Recommended Actions</p>
                              <div className="space-y-2">
                                {(batch.aiInsights.recommendedActions || []).slice(0, 3).map((action, index) => (
                                  <div key={`${batch.batchName}-action-${index}`} className="flex gap-3 text-sm text-zinc-700">
                                    <span className="text-emerald-600 font-black">*</span>
                                    <span className="leading-6">{action}</span>
                                  </div>
                                ))}
                                {(batch.aiInsights.recommendedActions || []).length === 0 && (
                                  <p className="text-sm text-zinc-400">No recommended actions returned.</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-zinc-100 p-4 flex flex-col h-[400px]">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Weak Domains</p>
                              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                                {(batch.aiInsights.weakDomains || []).slice(0, 4).map((domain) => (
                                  <div key={`${batch.batchName}-${domain.domainName}`} className="rounded-xl bg-zinc-50 p-3 border border-zinc-100">
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                      <p className="font-black text-zinc-900 text-sm">{domain.domainName}</p>
                                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{(domain.averageAccuracy || 0).toFixed(2)}%</span>
                                    </div>
                                    <p className="text-xs text-zinc-600 leading-5">{domain.intervention}</p>
                                  </div>
                                ))}
                                {(batch.aiInsights.weakDomains || []).length === 0 && (
                                  <p className="text-sm text-zinc-400">No weak-domain patterns returned.</p>
                                )}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-100 p-4 flex flex-col h-[400px]">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Urgent Students</p>
                              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                                {(batch.aiInsights.urgentStudents || []).slice(0, 6).map((student, index) => {
                                  // Find the student ID to enable clicking
                                  const studentRecord = batch.students.find(s => s.username === student.username || s.fullName === student.studentName);
                                  
                                  return (
                                    <div 
                                      key={`${batch.batchName}-student-${index}`} 
                                      className={`rounded-xl bg-zinc-50 p-3 border border-zinc-100 ${studentRecord ? 'cursor-pointer hover:bg-zinc-100 transition-colors' : ''}`}
                                      onClick={() => {
                                        if (studentRecord) {
                                          setSelectedStudentId(studentRecord.id);
                                          setIsDetailOpen(true);
                                        }
                                      }}
                                    >
                                      <div className="flex items-center justify-between gap-3 mb-1">
                                        <div className="flex items-center gap-2">
                                          <p className="font-black text-zinc-900 text-sm">{student.studentName || student.username}</p>
                                          {studentRecord && <Eye className="w-3 h-3 text-zinc-400" />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${student.priority === 'High' ? 'bg-red-50 text-red-700' : student.priority === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                          {student.priority}
                                        </span>
                                      </div>
                                      <p className="text-xs text-zinc-600 leading-5">{student.riskReason}</p>
                                    </div>
                                  );
                                })}
                                {(batch.aiInsights.urgentStudents || []).length === 0 && (
                                  <p className="text-sm text-zinc-400">No urgent students returned.</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {batch.aiGeneratedAt && (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                              Generated {new Date(batch.aiGeneratedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
                          {batch.aiInsightStatus === 'skipped_threshold'
                            ? 'AI insights were skipped because this batch has fewer than 3 evaluated students ready for analysis.'
                            : batch.aiInsightStatus === 'failed'
                              ? 'AI insight generation failed for this batch. Please retry.'
                              : 'No AI insight has been generated yet. Use Generate Insights to create one.'}
                        </div>
                      )}
                    </div>

                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder={`Search students in ${batch.batchName}...`}
                        value={searchQuery}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:max-w-sm pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] outline-none bg-white transition-all shadow-sm"
                      />
                    </div>
                    
                      <div className="space-y-2 max-h-[600px] overflow-auto custom-scrollbar no-hover pr-2">
                       {/* Table Headers Desktop */}
                      <div className="hidden md:flex items-center gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                        <div className="flex-1">Candidate</div>
                        <div className="w-48">PRI Score</div>
                        <div className="flex-1">Domain Scores</div>
                        <div className="w-40 text-right">Action</div>
                      </div>

                      {batch.students
                        .filter((student) => {
                           const q = searchQuery.toLowerCase();
                           return (student.fullName?.toLowerCase() || '').includes(q) || 
                                  (student.username.toLowerCase()).includes(q) || 
                                  (student.studentId?.toLowerCase() || '').includes(q);
                        })
                        .map((student) => {
                          const evalSummary = student.latestEvaluation;
                          const domainScores = evalSummary?.domains || [];
                          const displayName = getDisplayName(student);
                          const initials = displayName
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join('') || 'ST';
                          const readiness = evalSummary?.percentage || 0;

                          return (
                            <div
                              key={student.id}
                              className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-6 rounded-[2rem] shadow-sm transition-all hover:shadow-md no-hover mb-3"
                            >
                              {/* Candidate */}
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-black text-zinc-600 uppercase shrink-0">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-zinc-900 tracking-tight truncate">{displayName}</p>
                                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 truncate">
                                    {student.studentId || student.username}
                                  </p>
                                </div>
                              </div>

                              {/* Readiness */}
                              <div className="w-full md:w-48 max-w-xs">
                                <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">PRI Score</span>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#D62027] rounded-full transition-all"
                                      style={{ width: `${Math.min(Math.max(readiness, 0), 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-black text-zinc-900">
                                    {`${readiness.toFixed(2)}%`}
                                  </span>
                                </div>
                              </div>

                              {/* Domain Scores */}
                              <div className="flex-1 flex flex-col gap-1 w-full min-w-0">
                                <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Domain Scores</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {domainScores.length === 0 ? (
                                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">N/A</span>
                                  ) : (
                                    domainScores.map((dom) => {
                                      const domainScore = getDomainPercentage(dom);
                                      const colors = getDomainColor(dom.domainName);
                                      return (
                                        <div 
                                          key={dom.domainId}
                                          className="relative group/skill"
                                        >
                                          <div 
                                            className={`min-w-[48px] h-8 px-1.5 rounded-md ${colors.bg} text-white flex items-center justify-center text-[10px] font-black shadow-sm cursor-help transition-all hover:scale-110 hover:shadow-lg`}
                                          >
                                            {(Math.trunc(domainScore * 100) / 100).toFixed(2)}
                                          </div>
                                          {/* Hover Reveal Tip - Positioned Below */}
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#0a0a0a] text-white text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/skill:opacity-100 transition-all duration-200 z-[100] shadow-2xl border border-white/10 -translate-y-2 group-hover/skill:translate-y-0 text-center min-w-[120px]">
                                             <p className="text-[11px] font-black tracking-tighter mb-0.5" style={{ color: colors.text }}>
                                               SCORE: {domainScore.toFixed(2)}%
                                             </p>
                                             <p className="leading-tight opacity-70">{dom.domainName}</p>
                                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[#0a0a0a]" />
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>

                              {/* Action */}
                              <div className="md:w-40 flex md:justify-end mt-2 md:mt-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudentId(student.id);
                                    setIsDetailOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#D62027] group"
                                >
                                  View Full Profile
                                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </button>
                              </div>
                            </div>
                          );
                      })}
                      {batch.students.length === 0 && (
                        <p className="text-center py-6 text-xs text-zinc-400 uppercase tracking-widest font-bold">
                          No students matched your search
                        </p>
                      )}
                      </div>
                    </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detailed PRI report popup modal */}
      {mounted && isDetailOpen && selectedStudentId && (
        <StudentDetails 
          token={token} 
          studentId={selectedStudentId} 
          apiUrl={apiUrl?.startsWith('/api/faculty') ? '/api/faculty/students/${studentId}' : undefined}
          onBack={() => {
            setIsDetailOpen(false);
            setSelectedStudentId(null);
          }} 
        />
      )}
    </div>
  );
}
