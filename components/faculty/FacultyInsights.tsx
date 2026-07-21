'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Zap, 
  Target, 
  ClipboardCheck, 
  LayoutList, 
  Users, 
  TrendingUp,
  Award,
  BarChart3,
  ShieldCheck,
  Zap as ZapIcon,
  Target as TargetIcon
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RadarTooltip,
} from 'recharts';

interface FacultyInsightStats {
  assignedBatches: string[];
  selectedBatch?: string;
  stats: {
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
  batchReadiness: Array<{
    name: string;
    score: number;
  }>;
  scoreDistribution: Array<{
    _id: string; // "0-10", "10-20", etc.
    count: number;
  }>;
  domainPerformance: Array<{
    domain: string;
    score: number;
  }>;
  recentActivity: Array<{
    _id: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
    studentName: string;
  }>;
  urgentStudents: Array<{
    id: string;
    username: string;
    fullName: string;
    percentage: number;
    overallStatus: string;
    evaluatedAt: string;
  }>;
  topSubskillGaps: Array<{
    domain: string;
    subskill: string;
    accuracy: number;
  }>;
  lastExam?: {
    id: string;
    title: string;
    date: string;
  } | null;
}

const MASTERY_COLORS: Record<string, { bg: string; text: string; tint: string }> = {
  'Cognitive': { bg: 'bg-[#FF4B8C]', text: 'text-[#FF4B8C]', tint: 'bg-[#FF4B8C]/10' },
  'Digital': { bg: 'bg-[#06B6D4]', text: 'text-[#06B6D4]', tint: 'bg-[#06B6D4]/10' },
  'Problem Solving': { bg: 'bg-[#A855F7]', text: 'text-[#A855F7]', tint: 'bg-[#A855F7]/10' },
  'Communication': { bg: 'bg-[#F97316]', text: 'text-[#F97316]', tint: 'bg-[#F97316]/10' },
  'Business': { bg: 'bg-[#3B82F6]', text: 'text-[#3B82F6]', tint: 'bg-[#3B82F6]/10' },
  'Leadership': { bg: 'bg-[#10B981]', text: 'text-[#10B981]', tint: 'bg-[#10B981]/10' },
};

const getDomainColor = (name: string) => {
  const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized === 'cognitiveintelligence' || normalized === 'cognitive') return MASTERY_COLORS['Cognitive'];
  if (normalized === 'businessintelligence' || normalized === 'business') return MASTERY_COLORS['Business'];
  if (normalized === 'problemsolving' || normalized === 'coding') return MASTERY_COLORS['Problem Solving'];
  if (normalized === 'communication') return MASTERY_COLORS['Communication'];
  if (normalized === 'leadership') return MASTERY_COLORS['Leadership'];
  if (normalized === 'digitalbusiness' || normalized === 'digital') return MASTERY_COLORS['Digital'];
  return { bg: 'bg-zinc-100', text: 'text-zinc-500', tint: 'bg-zinc-50' };
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

export default function FacultyInsights({ token, selectedBatch }: { token: string; selectedBatch?: string }) {
  const [data, setData] = useState<FacultyInsightStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const url = `/api/faculty/insights${selectedBatch ? `?batch=${encodeURIComponent(selectedBatch)}` : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to fetch insights');
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 60000); // Poll every 1m
    return () => clearInterval(interval);
  }, [token, selectedBatch]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-[#D62027]/10 border-t-[#D62027] rounded-full animate-spin mb-6" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Intelligence Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-[#D62027] rounded-3xl border border-red-100 flex flex-col items-center gap-4">
        <Activity className="w-10 h-10" />
        <p className="font-black uppercase tracking-widest text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const topStats = [
    {
      label: selectedBatch ? `${selectedBatch} Students` : 'Batch Students',
      value: selectedBatch ? `${data.stats.students.total}` : `${data.stats.students.total}/${data.stats.students.limit}`,
      sub: `${data.stats.students.active} Active Profiles`,
      subColor: 'text-slate-500',
      icon: Users
    },
    {
      label: 'Avg PRI score',
      value: `${(data.performance.avgReadiness || 0).toFixed(2)}%`,
      sub: selectedBatch ? `${selectedBatch} Performance` : `Cohort Performance`,
      subColor: 'text-slate-500',
      icon: Target
    },
    {
      label: 'At-Risk Students',
      value: `${data.urgentStudents?.length || 0}`,
      sub: `Immediate Action Required`,
      subColor: 'text-[#D62027]',
      icon: Zap
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Exam Context Header */}
      {data.lastExam && (
        <div className="flex items-center gap-3 px-6 py-3 bg-white border border-zinc-100 rounded-[24px] shadow-sm w-max animate-in fade-in slide-in-from-left-4 duration-500">
          <Award className="w-5 h-5 text-[#D62027]" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Based on last PRI exam</p>
            <h4 className="text-sm font-black text-zinc-900 tracking-tight uppercase">
              {data.lastExam.title} • {new Date(data.lastExam.date).toLocaleDateString('en-GB')}
            </h4>
          </div>
        </div>
      )}

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topStats.map((stat, i) => (
          <div key={i} className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden shadow-sm no-hover group">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-[#D62027] transition-all duration-500">
               <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">{stat.label}</p>
            <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-2">{stat.value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-zinc-100 shadow-sm no-hover">
          <div className="flex flex-col gap-2 mb-10">
            <h3 className="text-[22px] font-black tracking-tight text-[#111827] uppercase">Student PRI Score Distribution</h3>
            <p className="text-[10px] font-black text-white uppercase tracking-widest bg-[#D62027] px-3 py-1.5 rounded-full inline-flex items-center gap-2 self-start ring-4 ring-red-50 transition-all">
              Performance Spread Analysis
            </p>
          </div>

          <div className="relative h-[280px] w-full flex align-end items-end gap-2 md:gap-4 mt-8">
            <div className="absolute left-0 top-0 h-[240px] flex flex-col justify-between text-[11px] font-bold text-slate-400/60 py-2">
              <span>High</span>
              <span>Mid</span>
              <span>Low</span>
            </div>
            
            <div className="relative w-full h-[240px] flex justify-around items-end ml-10 z-10 px-2 lg:px-4 gap-1 sm:gap-2">
              {[
                '0-10', '10-20', '20-30', '30-40', '40-50', 
                '50-60', '60-70', '70-80', '80-90', '90-100'
              ].map((range) => {
                const bucket = data.scoreDistribution.find(d => d._id === range);
                const count = bucket ? bucket.count : 0;
                const maxCount = Math.max(...data.scoreDistribution.map(d => d.count), 1);
                const heightPercent = (count / maxCount) * 100;
                
                return (
                  <div key={range} className="flex flex-col items-center group relative h-full justify-end flex-1">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-lg z-50 whitespace-nowrap shadow-xl">
                      {count} Students
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-[#D62027] to-[#ff4d54] rounded-t-[8px] sm:rounded-t-[12px] group-hover:scale-x-105 group-hover:brightness-110 transition-all duration-500 relative overflow-hidden ring-1 ring-white/20"
                      style={{ height: `${Math.max(heightPercent, 2)}%`, minHeight: count > 0 ? '4px' : '0' }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <span className="mt-4 text-[9px] font-bold text-slate-400 rotate-45 origin-left whitespace-nowrap hidden sm:block">
                      {range}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Domain Performance Radar Chart */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-zinc-100 shadow-sm no-hover flex flex-col">
          <div className="flex flex-col gap-2 mb-6">
            <h3 className="text-[22px] font-black tracking-tight text-[#111827] uppercase">Domain AVG Performance Profile</h3>
            <p className="text-[10px] font-black text-white uppercase tracking-widest bg-[#D62027] px-3 py-1.5 rounded-full inline-flex items-center gap-2 self-start ring-4 ring-red-50 transition-all">
              Competency Breakdown
            </p>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full relative">
            {data.domainPerformance && data.domainPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.domainPerformance}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="domain" 
                    tick={<CustomRadarTick />} 
                  />
                  <Radar
                    name="Performance"
                    dataKey="score"
                    stroke="#D62027"
                    fill="#D62027"
                    fillOpacity={0.15}
                    strokeWidth={3}
                  />
                  <RadarTooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      fontSize: '11px',
                      fontWeight: '900',
                      textTransform: 'uppercase'
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                 <TargetIcon className="w-10 h-10 text-zinc-100 mb-4" />
                 <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">No domain evaluation data found</p>
              </div>
            )}
          </div>

          {/* Quick Domain Insights */}
          {data.domainPerformance && data.domainPerformance.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {data.domainPerformance.slice(0, 4).map((domain, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-100">
                  <div className={`w-2 h-2 rounded-full ${getDomainColor(domain.domain).bg}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest truncate">{domain.domain}</p>
                    <p className="text-xs font-black text-zinc-900">{(Math.trunc((domain.score || 0) * 100) / 100).toFixed(2)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgent Attention Students */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-zinc-100 shadow-sm no-hover">
          <div className="flex flex-col gap-2 mb-8">
            <h3 className="text-[22px] font-black tracking-tight text-[#111827] uppercase">Urgent Attention Needed</h3>
            <p className="text-[10px] font-black text-white uppercase tracking-widest bg-amber-500 px-3 py-1.5 rounded-full inline-flex items-center gap-2 self-start ring-4 ring-amber-50 transition-all">
              Critical Performance Gaps
            </p>
          </div>

          <div className="space-y-3">
            {data.urgentStudents && data.urgentStudents.length > 0 ? (
              data.urgentStudents.slice(0, 5).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100 group hover:bg-white hover:border-[#D62027]/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-[11px] font-black text-zinc-400 group-hover:border-[#D62027]/20 group-hover:text-[#D62027] transition-all">
                      {student.fullName ? student.fullName.charAt(0) : student.username.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-zinc-900 tracking-tight">{student.fullName || student.username}</p>
                      <p className="text-[10px] font-bold text-[#D62027] uppercase tracking-widest">
                        Scored {(Math.trunc((student.percentage || 0) * 100) / 100).toFixed(2)}% • Needs Review
                      </p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg bg-zinc-200/50 text-zinc-400 hover:bg-[#D62027] hover:text-white transition-all">
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                 <ShieldCheck className="w-12 h-12 text-emerald-100 mb-4" />
                 <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">No critical risks in current cohort</p>
              </div>
            )}
          </div>
        </div>

        {/* Specific Skill Gaps */}
        <div className="bg-[#111827] rounded-[32px] p-8 md:p-10 shadow-xl border border-white/5 no-hover">
          <div className="flex flex-col gap-2 mb-8">
            <h3 className="text-[22px] font-black tracking-tight text-white uppercase">Critical Skill Gaps</h3>
            <p className="text-[10px] font-black text-white uppercase tracking-widest bg-[#D62027] px-3 py-1.5 rounded-full inline-flex items-center gap-2 self-start ring-4 ring-white/5 transition-all">
              Top Intervention areas
            </p>
          </div>

          <div className="space-y-5">
            {data.topSubskillGaps && data.topSubskillGaps.length > 0 ? (
              data.topSubskillGaps.map((gap, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{gap.domain}</p>
                      <p className="text-[13px] font-black text-white tracking-tight">{gap.subskill}</p>
                    </div>
                    <p className="text-xs font-black text-[#ff4d54]">{(Math.trunc((gap.accuracy || 0) * 100) / 100).toFixed(2)}% Accuracy</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D62027] to-[#ff4d54] rounded-full"
                      style={{ width: `${gap.accuracy}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                 <p className="text-xs font-black text-white/20 uppercase tracking-widest">Awaiting assessment data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-[#0f172a] rounded-[32px] p-10 shadow-xl border border-white/5 no-hover">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[22px] font-black tracking-[-0.04em] text-white leading-none">
            Recent Student Submissions
          </h3>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
             <Activity className="w-4 h-4 text-red-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.recentActivity.map((item) => (
            <div 
              key={item._id} 
              className="flex items-center justify-between p-5 rounded-2xl bg-[#1e293b]/50 border border-white/5 hover:border-red-500/30 hover:bg-[#1e293b] transition-all duration-300 group cursor-default"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white ring-1 ring-white/10 group-hover:ring-red-500/30 transition-all">
                  <span className="text-xs font-black">{item.studentName.charAt(0)}</span>
                </div>
                <div>
                   <p className="text-[15px] font-bold text-white line-clamp-1 tracking-tight">
                     {item.studentName}
                   </p>
                   <p className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
                     {(Math.trunc((item.percentage || 0) * 100) / 100).toFixed(2)}% Accuracy • {new Date(item.submittedAt).toLocaleDateString()}
                   </p>
                </div>
              </div>
              <div className="text-[11px] font-black text-[#D62027] uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                {item.score}/{item.totalQuestions}
              </div>
            </div>
          ))}

          {data.recentActivity.length === 0 && (
            <div className="col-span-full p-5 rounded-2xl bg-[#1e293b] border border-[#334155]/50 text-center py-10 opacity-50">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">No recent submissions found for your batches</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
