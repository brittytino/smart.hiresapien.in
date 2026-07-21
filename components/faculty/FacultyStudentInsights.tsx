'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ChevronRight,
  Search,
  User,
  Users,
  XCircle,
  TrendingUp,
  FileText,
  Activity,
  Zap,
  GraduationCap,
  ShieldCheck,
  Award,
  ExternalLink,
  CheckCircle2,
  ArrowLeft,
  LayoutDashboard,
  Eye,
  BarChart3
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RadarTooltip,
} from 'recharts';
import PriReportView from '@/components/report/PriReportView';
import StudentDetails from '../institution-admin/student/StudentDetails';

interface DomainScore {
  domainId: string;
  domainName: string;
  domainShare?: number;
  score: number;
  correct: number;
  total: number;
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
}

interface StudentRow {
  id: string;
  username: string;
  fullName?: string;
  studentId?: string;
  batch?: string;
  latestEvaluation?: any;
}

interface StudentInsights {
  user: {
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    studentId?: string;
  };
  insights: {
    radarData: { name: string; score: number }[];
    masteryScores: Record<string, number>;
    behavioralProfile: string;
    alignment: number;
    latestReportId?: string;
    latestEvalDate?: string;
    latestTestName?: string;
    traitResults?: Record<string, { score: number; maxScore: number; passed: boolean }> | null;
  };
  recentActivity: Array<{
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
    _id: string;
  }>;
}

interface ReportData {
  studentInfo: {
    name: string;
    id: string;
    program: string;
    batch: string;
    school: string;
    examName: string;
    examId: string;
    date: string;
    generated: string;
    priScore: number;
    performanceBand: string;
  };
  overallMetrics: {
    score: number;
    maxScore: number;
    percentage: number;
    accuracy: number;
    timeTaken: string;
    timeEfficiency: string;
    totalQuestions: number;
    correctAnswers: number;
    needsAttention: number;
    estTotalTime: string;
  };
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
  return 0;
}

function getDisplayName(student: StudentRow): string {
  return student.fullName || student.username || 'Student';
}

function formatPercentage(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
}

const MASTERY_COLORS: Record<string, { bg: string; text: string; tint: string }> = {
  'Cognitive': { bg: 'bg-[#FF4B8C]', text: 'text-[#FF4B8C]', tint: 'bg-[#FF4B8C]/10' },
  'Digital': { bg: 'bg-[#06B6D4]', text: 'text-[#06B6D4]', tint: 'bg-[#06B6D4]/10' },
  'Problem Solving': { bg: 'bg-[#A855F7]', text: 'text-[#A855F7]', tint: 'bg-[#A855F7]/10' },
  'Communication': { bg: 'bg-[#F97316]', text: 'text-[#F97316]', tint: 'bg-[#F97316]/10' },
  'Business': { bg: 'bg-[#3B82F6]', text: 'text-[#3B82F6]', tint: 'bg-[#3B82F6]/10' },
  'Leadership': { bg: 'bg-[#10B981]', text: 'text-[#10B981]', tint: 'bg-[#10B981]/10' },
};

const FALLBACK_COLORS = [
  { bg: 'bg-zinc-100', text: 'text-zinc-500', tint: 'bg-zinc-50' },
  { bg: 'bg-slate-100', text: 'text-slate-500', tint: 'bg-slate-50' },
];

const getDomainColor = (name: string) => {
  const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized === 'cognitiveintelligence' || normalized === 'cognitive') return MASTERY_COLORS['Cognitive'];
  if (normalized === 'businessintelligence' || normalized === 'business') return MASTERY_COLORS['Business'];
  if (normalized === 'problemsolving' || normalized === 'coding') return MASTERY_COLORS['Problem Solving'];
  if (normalized === 'communication') return MASTERY_COLORS['Communication'];
  if (normalized === 'leadership') return MASTERY_COLORS['Leadership'];
  if (normalized === 'digitalbusiness' || normalized === 'digital') return MASTERY_COLORS['Digital'];
  
  return FALLBACK_COLORS[0];
};

const getDomainHex = (name: string) => {
  const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized === 'cognitiveintelligence' || normalized === 'cognitive') return '#FF4B8C';
  if (normalized === 'businessintelligence' || normalized === 'business') return '#3B82F6';
  if (normalized === 'problemsolving' || normalized === 'coding') return '#A855F7';
  if (normalized === 'communication') return '#F97316';
  if (normalized === 'leadership') return '#10B981';
  if (normalized === 'digitalbusiness' || normalized === 'digital') return '#06B6D4';
  return '#64748B';
};

const CustomRadarTick = (props: any) => {
  const { x, y, payload, textAnchor } = props;
  const dy = y < 150 ? -12 : y > 250 ? 18 : 6;
  
  return (
    <text
      x={x}
      y={y}
      dy={dy}
      textAnchor={textAnchor}
      fill={getDomainHex(payload.value)}
      fontSize={9}
      fontWeight={900}
      style={{ 
        paintOrder: 'stroke', 
        stroke: '#ffffff', 
        strokeWidth: '4px', 
        strokeLinecap: 'round', 
        strokeLinejoin: 'round',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      {payload.value}
    </text>
  );
};

export default function FacultyStudentInsights({ token, selectedBatch }: { token: string; selectedBatch?: string }) {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      setError('');
      try {
        const url = `/api/faculty/students${selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : ''}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load students');
        setStudents(data.students || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [token, selectedBatch]);
  useEffect(() => {
    async function loadStats() {
      try {
        const url = `/api/faculty/insights${selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : ''}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setStatsData(data);
      } catch (err) {
        console.error('Failed to load faculty stats:', err);
      }
    }
    loadStats();
  }, [token, selectedBatch]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending'>('all');

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const evaluation = student.latestEvaluation;
      const matchesSearch = !query || 
        getDisplayName(student).toLowerCase().includes(query) || 
        (student.username?.toLowerCase() || '').includes(query) || 
        (student.studentId?.toLowerCase() || '').includes(query);
      
      const matchesStatus = statusFilter === 'all' || 
        evaluation?.overallStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#D62027] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Student Insights...</p>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden shadow-sm no-hover">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Total Students</p>
          <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
            {statsData?.stats?.students?.total || 0}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Profiles</p>
        </div>
        
        <div className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden shadow-sm no-hover">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Total Student Badges</p>
          <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
            {statsData?.stats?.students?.limit || 0}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Allocated Slots</p>
        </div>

        <div className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden shadow-sm no-hover">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Unallocated Slots</p>
          <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
            {Math.max(0, (statsData?.stats?.students?.limit || 0) - (statsData?.stats?.students?.total || 0))}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Remaining Capacity</p>
        </div>
      </div>

      <div className="g360-card overflow-hidden">
        {/* Main Header with Search & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 border-b border-zinc-50 bg-white">
          <div>
            <h3 className="text-xl font-black tracking-tight text-zinc-950 uppercase leading-none mb-1">Active Students</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
              Manage your institution's student profiles
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-zinc-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-600 focus:ring-2 focus:ring-[#D62027]/10 outline-none cursor-pointer"
            >
              <option value="all">ALL PROFILES</option>
              <option value="pass">PASSED</option>
              <option value="fail">FAILED</option>
              <option value="pending">PENDING</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto max-h-[600px] custom-scrollbar no-hover">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Candidate</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Batch</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">PRI Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Skill Split</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No records matching your filters</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const evaluation = student.latestEvaluation || null;
                  const domainScores = evaluation?.domains || [];
                  const displayName = getDisplayName(student);
                  const readiness = evaluation?.percentage || 0;
                  const isSelected = selectedStudentId === student.id;

                  return (
                    <tr 
                      key={student.id} 
                      className={`border-b border-zinc-50/50 hover:bg-zinc-50/30 transition-colors cursor-pointer group ${isSelected ? 'bg-zinc-50/80' : ''}`}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setIsDetailOpen(true);
                      }}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-100 shrink-0 border-[2.5px] border-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300 ring-1 ring-zinc-100/50">
                            <User className="w-5 h-5 text-zinc-500" strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-black text-zinc-900 uppercase tracking-tight text-sm leading-none mb-1 group-hover:text-[#D62027] transition-colors">
                              {displayName}
                            </p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                              @{student.username} {student.studentId && `• ${student.studentId}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">
                           {student.batch || 'Unassigned'}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                readiness >= 80 ? 'bg-emerald-500' :
                                readiness >= 60 ? 'bg-amber-400' :
                                'bg-[#D62027]'
                              }`}
                              style={{ width: `${readiness}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-black text-zinc-900 tabular-nums">
                            {`${readiness.toFixed(2)}%`}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                           {domainScores.length > 0 ? (
                             domainScores.map((dom: any, idx: number) => {
                               const score = getDomainPercentage(dom);
                               const colors = getDomainColor(dom.domainName);
                               return (
                                 <div 
                                   key={idx}
                                   className="relative group/skill"
                                 >
                                   <div 
                                     className={`min-w-[48px] h-8 px-1.5 rounded-sm ${colors.bg} text-white flex items-center justify-center text-[10px] font-black shadow-sm cursor-help transition-all hover:scale-110 hover:shadow-lg`}
                                   >
                                     {(Math.trunc(score * 100) / 100).toFixed(2)}
                                   </div>
                                   {/* Hover Reveal Tip */}
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#0a0a0a] text-white text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/skill:opacity-100 transition-all duration-200 z-[100] shadow-2xl border border-white/10 translate-y-2 group-hover/skill:translate-y-0 text-center min-w-[120px]">
                                      <p className="leading-tight opacity-70 mb-0.5">{dom.domainName}</p>
                                      <p className={`text-[11px] font-black tracking-tighter ${colors.text}`}>
                                        SCORE: {(Math.trunc(score * 100) / 100).toFixed(2)}%
                                      </p>
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[#0a0a0a]" />
                                   </div>
                                 </div>
                               );
                             })
                           ) : (
                             <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest leading-none bg-zinc-50 px-2 py-1.5 rounded-md">No Data</span>
                            )}
                          </div>
                       </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentId(student.id);
                              setIsDetailOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#D62027] hover:border-[#D62027]/30 transition-all shadow-sm group/btn"
                          >
                            <Eye className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" strokeWidth={3} />
                            View Report
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

      {mounted && isDetailOpen && selectedStudentId && (
        <StudentDetails 
          token={token} 
          studentId={selectedStudentId} 
          apiUrl="/api/faculty/students/${studentId}"
          onBack={() => {
            setIsDetailOpen(false);
            setSelectedStudentId('');
          }} 
        />
      )}
    </div>
  );
}
