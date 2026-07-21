'use client';

import React, { useEffect, useState } from 'react';
import { UserPlus, Users, Activity, ArrowUpRight, ShieldCheck, GraduationCap, ClipboardCheck, Zap, CheckCircle, LayoutList, Target, TrendingUp } from 'lucide-react';

const formatScore = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(Number(num))) return '0';
  const val = Number(num);
  return (Math.trunc(val * 100) / 100).toFixed(2);
};

interface InstitutionInsightsData {
  stats: {
    faculty: {
      total: number;
      active: number;
      limit: number;
    };
    students: {
      total: number;
      active: number;
      limit: number;
    };
    tests: {
      total: number;
    };
  };
  performance: {
    avgReadiness: number;
    placementReadyCount: number;
    activeEvaluationsCount: number;
    managedSessionsCount: number;
    participationRate: number;
    growth: number;
  };
  recentActivity: {
    users: Array<{
      fullName?: string;
      username: string;
      role: 'faculty' | 'student';
      createdAt: string;
      studentId?: string;
    }>;
  };
  batchReadiness: Array<{
    name: string;
    score: number;
  }>;
}

export default function InstitutionInsights({ token, role }: { token: string, role?: 'faculty' | 'student' }) {
  const [data, setData] = useState<InstitutionInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadInsights() {
    try {
      const res = await fetch('/api/institution-admin/insights', {
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
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#D62027] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Institution Insights...</p>
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

  const filteredActivity = role 
    ? data.recentActivity.users.filter(u => u.role === role)
    : data.recentActivity.users;

  const stats = [
    {
      label: 'Active Faculties',
      value: `${data.stats.faculty.total}/${data.stats.faculty.limit}`,
      textColor: 'text-zinc-400',
      sub: `${data.stats.faculty.active} Active`,
      subColor: 'text-slate-500',
      hidden: role === 'student'
    },
    {
      label: 'Active Students',
      value: `${data.stats.students.total}/${data.stats.students.limit}`,
      textColor: 'text-zinc-400',
      sub: `${data.stats.students.active} Active`,
      subColor: 'text-slate-500',
      hidden: role === 'faculty'
    },
    {
      label: 'PRI Management',
      value: data.stats.tests.total,
      textColor: 'text-[#D62027]',
      sub: `Active Shared Tests`,
      subColor: 'text-slate-500',
    },
  ].filter(s => !s.hidden);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Basic Admin Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${stats.length} gap-6`}>
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">{stat.label}</p>
            <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">{stat.value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Performance KPIs row */}
      {!role && data.performance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
          {/* Avg Readiness Card */}
          <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative overflow-hidden group no-hover h-full">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-black">
              <Zap className="w-5 h-5 text-red-700" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Avg PRI Score</p>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-[32px] font-black text-[#111827] leading-none tracking-tighter">
                {formatScore(data.performance.avgReadiness)}%
              </h3>
              <div className="flex items-center gap-1 text-[10px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-2.5 h-2.5" />
                +{data.performance.growth}%
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institution Performance Index</p>
          </div>

          {/* Placement Ready Card */}
          <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative overflow-hidden group no-hover h-full">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform duration-500">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Placement Ready</p>
            <h3 className="text-[32px] font-black text-[#111827] leading-none tracking-tighter mb-1">
              {data.performance.placementReadyCount}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidates Identified</p>
          </div>

          {/* Active Tests Card */}
          <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative overflow-hidden group no-hover h-full">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform duration-500">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Active Tests</p>
            <h3 className="text-[32px] font-black text-[#111827] leading-none tracking-tighter mb-1">
              {data.performance.activeEvaluationsCount}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active evaluations</p>
          </div>

          {/* Sessions Card */}
          <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative overflow-hidden group no-hover h-full">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform duration-500">
              <LayoutList className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Sessions</p>
            <h3 className="text-[32px] font-black text-[#111827] leading-none tracking-tighter mb-1">
              {data.performance.managedSessionsCount}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Managed sessions</p>
          </div>

          {/* Participation Card */}
          <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative overflow-hidden group no-hover h-full">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform duration-500">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Participation</p>
            <h3 className="text-[32px] font-black text-[#111827] leading-none tracking-tighter mb-1">
              {formatScore(data.performance.participationRate)}%
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Engagement</p>
          </div>

          {/* Growth Trend Card */}
          <div className="bg-white rounded-[28px] p-6 lg:p-8 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative overflow-hidden group no-hover h-full">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Growth Trend</p>
            <h3 className="text-[32px] font-black text-emerald-500 leading-none tracking-tighter mb-1">
              +{data.performance.growth}%
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Momentum</p>
          </div>
        </div>
      )}

      {/* Visualizations */}
      {!role && (
        <div className="bg-white rounded-[28px] p-8 md:p-10 border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] no-hover">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
            <div>
              <h3 className="text-[22px] font-black tracking-tight text-[#111827]">Batch Performance & Readiness Insights</h3>
              <p className="text-[10px] font-black text-white uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full inline-flex items-center gap-2 mt-2">
                Unified Institutional Intelligence Overview
              </p>
            </div>
            <button className="text-[11px] font-black text-[#D62027] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors w-max">
              Download Report
            </button>
          </div>
          
          <div className="relative h-[280px] w-full flex align-end items-end gap-16 md:gap-24">
            {/* Y axis labels */}
            <div className="absolute left-0 top-0 h-[240px] flex flex-col justify-between text-[11px] font-bold text-slate-400 py-2">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-10 right-0 top-0 h-[240px] flex flex-col justify-between py-4 pointer-events-none">
              <div className="border-t border-dashed border-slate-200/60 w-full"></div>
              <div className="border-t border-dashed border-slate-200/60 w-full"></div>
              <div className="border-t border-dashed border-slate-200/60 w-full"></div>
              <div className="border-t border-dashed border-slate-200/60 w-full"></div>
              <div className="border-t border-dashed border-slate-200/60 w-full"></div>
            </div>

            {/* Bars or Empty State */}
            {data.batchReadiness && data.batchReadiness.length > 0 ? (
              <div className="relative w-full h-[240px] flex justify-around items-end ml-10 z-10 px-4 md:px-12">
                {data.batchReadiness.map((batch, idx) => (
                  <div key={idx} className="flex flex-col items-center group relative h-full justify-end w-16">
                    <div className="absolute -top-[80px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 bg-white shadow-xl shadow-slate-200/50 rounded-[16px] px-5 py-3 border border-slate-100 z-20 pointer-events-none w-max">
                      <p className="text-sm font-black text-slate-900 leading-none">{batch.name}</p>
                      <p className="text-[13px] font-black text-[#D62027] mt-1 tracking-tight">PRI Score : {formatScore(batch.score)}%</p>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45"></div>
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-12 bg-gradient-to-t from-[#D62027] to-[#ff4d54] rounded-t-[12px] group-hover:scale-x-110 group-hover:brightness-110 transition-all duration-500 relative overflow-hidden"
                      style={{ height: `${batch.score}%` }}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
                    </div>
                    <span className="absolute -bottom-8 text-[10px] font-black text-slate-400 whitespace-nowrap uppercase tracking-widest">{batch.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 bg-white/50 backdrop-blur-[2px] rounded-2xl">
                 <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">No Batch Data Available</p>
                 <div className="text-xs text-slate-500 mt-2 max-w-[350px] space-y-1">
                    <p>Evaluation data will be displayed once students from multiple batches complete their assessments.</p>
                    <p className="font-medium text-slate-400">Please ensure assessments are assigned and submissions are in progress.</p>
                 </div>
              </div>
            )}
        </div>
      </div>
      )}

      {/* Recent Feed */}
       <div className="bg-[#0f172a] rounded-[28px] p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] no-hover">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[22px] font-black tracking-[-0.04em] text-white leading-none">
              Recent {role ? (role.charAt(0).toUpperCase() + role.slice(1)) : 'Activity'} Feed
            </h3>
          </div>
          <div className="space-y-4">
            {filteredActivity.map((user, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-[#1e293b] border border-[#334155]/50 group cursor-default no-hover">
                  <div>
                    <div className="flex items-center justify-between gap-4 w-full">
                       <p className="text-[15px] font-bold text-white line-clamp-1 tracking-tight">
                         {user.fullName || user.username}
                       </p>
                    </div>
                    <p className="text-[12px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
                      Onboarded as {user.role} • @{user.username}
                      {user.studentId && ` • ID: ${user.studentId}`}
                    </p>
                  </div>
                <div className="text-[11px] font-black text-[#D62027] uppercase tracking-widest self-start pt-1">
                   {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {filteredActivity.length === 0 && (
              <div className="p-5 rounded-2xl bg-[#1e293b] border border-[#334155]/50 text-center py-10">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No recent {role || 'activity'} in your institution</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
