'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Users, ClipboardCheck, LayoutDashboard, ArrowUpRight, Activity, ChevronDown } from 'lucide-react';

interface InsightsData {
  stats: {
    institutions: {
      total: number;
      totalFacultySlots: number;
      totalStudentSlots: number;
    };
    contributors: {
      total: number;
      active: number;
    };
    questions: {
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  recentActivity: {
    institutions: Array<{ name: string; createdAt: string }>;
    submissions: Array<{ questionText: string; contributorUsername: string; status: string; createdAt: string }>;
  };
  contributorQuestionTotals: Array<{
    contributorId: string;
    contributorUsername: string;
    totalQuestions: number;
    approvedQuestions: number;
    pendingQuestions: number;
  }>;
}

export default function AdminInsights({ token, onOpenPortal }: { token: string; onOpenPortal?: () => void }) {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllContributors, setShowAllContributors] = useState(false);
  const [showAllInstitutions, setShowAllInstitutions] = useState(false);

  async function loadInsights() {
    try {
      const res = await fetch('/api/admin/insights', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch insights');
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsights();
    const interval = setInterval(loadInsights, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D62027]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-[#D62027] rounded-2xl border border-red-100">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Institutions',
      value: data.stats.institutions.total,
      textColor: 'text-zinc-400',
      sub: `${data.stats.institutions.totalFacultySlots + data.stats.institutions.totalStudentSlots} Total Capacity (${data.stats.institutions.totalStudentSlots} Students + ${data.stats.institutions.totalFacultySlots} Faculty)`,
      subColor: 'text-slate-500',
    },
    {
      label: 'Contributors',
      value: data.stats.contributors.total,
      textColor: 'text-zinc-400',
      sub: `${data.stats.contributors.active} Verified Active`,
      subColor: 'text-slate-500',
    },
    {
      label: 'Pending Reviews',
      value: data.stats.questions.pending,
      textColor: 'text-zinc-400',
      sub: `${data.stats.questions.approved} Approved to Date`,
      subColor: 'text-slate-500',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-[20px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">{stat.label}</p>
            <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">{stat.value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* System Metrics Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Capacity Mix */}
        <div className="bg-white rounded-[20px] p-6 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full no-hover">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Capacity Mix</p>
              <h4 className="text-xl font-black text-zinc-900 tracking-tight">Student / Faculty</h4>
            </div>
          </div>
          <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-[#111827]" 
              style={{ width: `${Math.max(5, (data.stats.institutions.totalStudentSlots / (data.stats.institutions.totalStudentSlots + data.stats.institutions.totalFacultySlots || 1)) * 100)}%` }} 
            />
            <div 
              className="h-full bg-[#cc2733]/20" 
              style={{ width: `${Math.max(5, (data.stats.institutions.totalFacultySlots / (data.stats.institutions.totalStudentSlots + data.stats.institutions.totalFacultySlots || 1)) * 100)}%` }} 
            />
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span>{data.stats.institutions.totalStudentSlots} Students</span>
            <span>{data.stats.institutions.totalFacultySlots} Faculty</span>
          </div>
        </div>

      
        {/* Review Processing */}
        <div className="bg-white rounded-[20px] p-6 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full no-hover">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Processing</p>
              <h4 className="text-xl font-black text-zinc-900 tracking-tight">Review Pipeline</h4>
            </div>
          </div>
          <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-0.5">
            <div 
              className="h-full bg-[#10b981]" 
              title="Approved"
              style={{ width: `${(data.stats.questions.approved / ((data.stats.questions.approved + data.stats.questions.pending + data.stats.questions.rejected) || 1)) * 100}%` }} 
            />
            <div 
              className="h-full bg-[#f59e0b]" 
              title="Pending"
              style={{ width: `${(data.stats.questions.pending / ((data.stats.questions.approved + data.stats.questions.pending + data.stats.questions.rejected) || 1)) * 100}%` }} 
            />
            <div 
              className="h-full bg-[#ef4444]" 
              title="Rejected"
              style={{ width: `${(data.stats.questions.rejected / ((data.stats.questions.approved + data.stats.questions.pending + data.stats.questions.rejected) || 1)) * 100}%` }} 
            />
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="text-[#10b981]">{data.stats.questions.approved} Approved</span>
            <span className="text-[#f59e0b]">{data.stats.questions.pending} Pending</span>
            <span className="text-[#ef4444]">{data.stats.questions.rejected} Rejected</span>
          </div>
        </div>

        {/* Contributor Output */}
        <div className="bg-white rounded-[20px] p-6 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative h-full flex flex-col no-hover">
          {/* Default View */}
          <div className="flex-1 flex flex-col opacity-100">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Contributor Output</p>
                <h4 className="text-xl font-black text-zinc-900 tracking-tight">Total Contributions</h4>
              </div>
            </div>
            <div className="space-y-3">
              {data.contributorQuestionTotals.length === 0 ? (
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                  No submissions yet
                </p>
              ) : (
                data.contributorQuestionTotals.slice(0, 5).map((entry) => (
                  <div key={entry.contributorId} className="flex items-center justify-between">
                    <span className="text-[12px] font-bold uppercase tracking-widest text-zinc-600">
                      @{entry.contributorUsername}
                    </span>
                    <span className="text-[12px] font-black text-zinc-900">{entry.approvedQuestions}</span>
                  </div>
                ))
              )}
              {/* Let's remove the "Hover to View" text since there's no hover overlay anymore */}
              {data.contributorQuestionTotals.length > 5 && (
                <p className="text-[10px] font-black uppercase text-[#cc2733] tracking-widest pt-2">
                  + {data.contributorQuestionTotals.length - 5} More
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Recent Submissions */}
        <div className="bg-[#0f172a] rounded-[28px] p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] no-hover">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[26px] font-black tracking-[-0.04em] text-white leading-none flex items-center gap-3">
              Recent Contributions
            </h3>
          </div>
          <div className={`space-y-4 overflow-y-auto custom-scrollbar pr-2 transition-all duration-500 ease-in-out ${showAllContributors ? 'max-h-[600px]' : 'max-h-[370px]'}`}>
            {data.recentActivity.submissions.map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-[#1e293b] border border-[#334155]/50 no-hover">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-4 w-full">
                       <p className="text-[15px] font-bold text-white line-clamp-1 tracking-tight">{sub.questionText}</p>
                    </div>
                    <p className="text-[12px] font-medium text-slate-400 mt-1">
                      Submitted by @{sub.contributorUsername}
                    </p>
                  </div>
                </div>
                <div className="text-[11px] font-black text-[#D62027] uppercase tracking-widest self-start pt-1">
                   {new Date(sub.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {data.recentActivity.submissions.length === 0 && (
              <div className="p-5 rounded-2xl bg-[#1e293b] border border-[#334155]/50 text-center py-10">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No recent contributions</p>
              </div>
            )}
          </div>
          {data.recentActivity.submissions.length > 3 && (
            <button 
              onClick={() => setShowAllContributors(!showAllContributors)}
              className="mt-6 text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"
            >
              {showAllContributors ? 'Show Less' : 'View More Submissions'}
              <ChevronDown className={`w-4 h-4 ${showAllContributors ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {/* Recently Onboarded Institutions */}
        <div className="bg-[#5c0e12] rounded-[28px] p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] flex flex-col relative overflow-hidden no-hover">
          {/* Abstract background shape matching reference */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col items-start mb-6">
            <div className="flex items-center gap-4 mb-4">
               <h3 className="text-[26px] font-black tracking-[-0.04em] text-white leading-none">Active Institutions</h3>
            </div>
            
            <p className="text-[14px] text-white/90 leading-relaxed max-w-[90%] font-medium">
               A total of {data.stats.institutions.total} institutions are actively operating on the platform. Monitor usage and configuration settings securely from this portal.
            </p>
          </div>
          
          <div className={`relative z-10 space-y-3 mb-4 transition-all duration-500 ease-in-out overflow-y-auto pr-2 custom-scrollbar ${showAllInstitutions ? 'max-h-[300px]' : 'max-h-[100px]'}`}>
            {data.recentActivity.institutions.map((inst, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                   <p className="text-[13px] font-bold text-white tracking-tight">{inst.name}</p>
                </div>
                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{new Date(inst.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {data.recentActivity.institutions.length === 0 && (
               <p className="text-[13px] font-bold text-white/70">No institutions deployed yet</p>
            )}
          </div>

          {data.recentActivity.institutions.length > 3 && (
            <button 
              onClick={() => setShowAllInstitutions(!showAllInstitutions)}
              className="relative z-10 text-[11px] font-black uppercase tracking-widest text-white/50 flex items-center gap-2"
            >
              {showAllInstitutions ? 'Show Less' : 'View More Institutions'}
              <ChevronDown className={`w-4 h-4 ${showAllInstitutions ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
