'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, 
  Activity, 
  ShieldCheck,
  User,
  GraduationCap,
  Trophy,
  Target,
  BarChart3,
  Award,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  ExternalLink,
  Zap,
  LayoutDashboard,
  Users,
  TrendingUp,
  XCircle
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RadarTooltip,
} from 'recharts';

const DOMAIN_COLOR_MAP: Record<string, string> = {
  cognitiveintelligence: '#FF4B8C',
  businessintelligence: '#3B82F6',
  problemsolving: '#A855F7',
  coding: '#A855F7',
  communication: '#F97316',
  leadership: '#10B981',
  digitalbusiness: '#06B6D4',
};

const getDomainColor = (name: string) => {
  const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // Special fallbacks for shorter names if needed
  if (normalized === 'cognitive') return DOMAIN_COLOR_MAP.cognitiveintelligence;
  if (normalized === 'business') return DOMAIN_COLOR_MAP.businessintelligence;
  if (normalized === 'digital') return DOMAIN_COLOR_MAP.digitalbusiness;
  
  return DOMAIN_COLOR_MAP[normalized] || '#64748b';
};

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-slate-50 flex flex-col gap-1 min-w-[150px] animate-in zoom-in-95 duration-200">
        <p className="text-lg font-black text-slate-900 leading-none mb-1">{data.name}</p>
        <p className="text-sm font-black text-[#D62027] uppercase tracking-tight">
          Readiness : <span className="tabular-nums">{data.score.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomRadarTick = (props: any) => {
  const { x, y, payload, textAnchor } = props;
  
  // Apply a small vertical offset based on position to avoid overlapping vertices
  const dy = y < 150 ? -12 : y > 250 ? 18 : 6;
  
  return (
    <text
      x={x}
      y={y}
      dy={dy}
      textAnchor={textAnchor}
      fill={getDomainColor(payload.value)}
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
    totalTests: number;
    highestScore: number;
    averageScore: number;
    radarData: { name: string; score: number }[];
    masteryScores: Record<string, number>;
    behavioralProfile: string;
    alignment: number;
    traitResults?: Record<string, { score: number; maxScore: number; passed: boolean }> | null;
    latestReportId?: string;
    latestEvalDate?: string;
    latestTestName?: string;
  };
  recentActivity: Array<{
    score: number;
    totalQuestions: number;
    percentage: number;
    submittedAt: string;
    _id: string;
  }>;
}

interface StudentDetailsProps {
  token: string;
  studentId: string;
  onBack: () => void;
  apiUrl?: string;
}

function cn(...inputs: Array<string | undefined | null | boolean>) {
  return inputs.filter(Boolean).join(' ');
}

export default function StudentDetails({ token, studentId, onBack, apiUrl }: StudentDetailsProps) {
  const [data, setData] = useState<StudentInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!studentId) return;
    
    async function fetchInsights() {
      setLoading(true);
      try {
        const fetchUrl = apiUrl ? apiUrl.replace('${studentId}', studentId) : `/api/institution-admin/users/${studentId}/student-insights`;
        const res = await fetch(fetchUrl, {
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
    fetchInsights();
  }, [token, studentId]);

  if (!mounted) return null;

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


  const currentMastery = (data?.insights.radarData || []).map(item => ({
    label: item.name.toUpperCase(),
    score: item.score
  }));

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[1100px] max-h-[90vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button Trigger */}
        <button 
          onClick={onBack}
          className="absolute top-8 right-8 z-50 p-2 bg-white/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-zinc-900 transition-all hover:scale-110 shadow-sm"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 border-4 border-zinc-200 border-t-[#D62027] rounded-full animate-spin" />
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Compiling Student Intelligence...</p>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto">
               <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
                  <Activity className="w-10 h-10 text-red-500" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-zinc-900 uppercase">Analysis Failed</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2">{error}</p>
               </div>
               <button onClick={onBack} className="g360-btn-primary px-8">Return to List</button>
            </div>
          ) : data && (
            <>
              {/* 1. Header Identity Area */}
              <div className="bg-zinc-50/50 rounded-3xl p-8 border border-zinc-100 relative overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-zinc-100 ring-2 ring-white shadow-lg shrink-0">
                       <User className="w-10 h-10 text-zinc-400" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tight leading-none mb-2">
                        {data.user.fullName || data.user.username}
                      </h3>
                      <p className="text-[11px] font-black text-[#D62027] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full inline-flex items-center gap-2">
                        Based on last {data.insights.latestTestName || 'PRI exam'} on {formatDate(data.insights.latestEvalDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-10 w-px bg-zinc-100 hidden md:block" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 max-w-[180px] leading-relaxed">
                      REAL-TIME SKILL ANALYSIS FOR {data.user.fullName?.split(' ')[0].toUpperCase() || 'STUDENT'}'S PLACEMENT READINESS JOURNEY.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Main Analytics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Radar Chart */}
                <div className="bg-white rounded-3xl p-8 border border-zinc-100 flex flex-col items-center justify-center relative overflow-hidden h-[400px] shadow-sm">
                   <div className="absolute top-8 left-8 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#D62027]" />
                      <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Readiness Spectrum</h4>
                   </div>
                   <p className="absolute top-8 right-8 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">(Click vertices to view %)</p>
                   
                   <div className="w-full h-full max-w-[400px] max-h-[360px] mt-6">
                      <ResponsiveContainer width="100%" height="100%">
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.insights.radarData} margin={{ top: 10, right: 50, bottom: 10, left: 50 }}>
                            <PolarGrid stroke="#000000" strokeOpacity={0.1} />
                            <PolarAngleAxis 
                              dataKey="name" 
                              tick={<CustomRadarTick />}
                            />
                            <Radar
                              name="Readiness"
                              dataKey="score"
                              stroke="#D62027"
                              strokeWidth={3}
                              fill="#D62027"
                              fillOpacity={0.15}
                            />
                            <RadarTooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '10px' }}
                              itemStyle={{ fontWeight: 900, fontSize: '11px' }}
                            />
                         </RadarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Right: Report Preview Card */}
                <div className="bg-[#1e293b] rounded-3xl p-6 border border-zinc-800 flex flex-col relative overflow-hidden shadow-xl">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2.5">
                         <div className="p-2 bg-[#334155] rounded-lg">
                            <FileText className="w-4 h-4 text-zinc-400" />
                         </div>
                         <h4 className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[150px]">{data.user.username.toUpperCase()}_REPORT.PDF</h4>
                      </div>
                      <button 
                        className="flex items-center gap-2 px-4 py-2 bg-[#D62027] rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-[#b01a1f] transition-all shadow-lg active:scale-95"
                        onClick={() => {
                          if (data.insights.latestReportId) {
                            window.open(`/report/${data.insights.latestReportId}`, '_blank');
                          }
                        }}
                      >
                        <Activity className="w-3.5 h-3.5" />
                        Open Report
                      </button>
                   </div>

                   <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col overflow-hidden">
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
                         <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center ring-1 ring-zinc-100 shrink-0">
                            <User className="w-6 h-6 text-zinc-300" strokeWidth={2.5} />
                         </div>
                         <div className="min-w-0">
                            <h5 className="text-base font-black text-zinc-900 uppercase tracking-tight truncate">{data.user.fullName}</h5>
                            <p className="text-[10px] font-medium text-zinc-400 mt-0.5 truncate">
                               {data.user.username}
                            </p>
                         </div>
                      </div>

                      <div className="space-y-5 overflow-auto custom-scrollbar pr-1">
                         <div>
                            <h6 className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                               <GraduationCap className="w-3 h-3" /> Latest Performance
                            </h6>
                            <p className="text-[11px] font-black text-zinc-800 uppercase tracking-tight">{data.insights.latestTestName || 'General Assessment'}</p>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                               SCORE: {`${data.insights.alignment}%`} | {formatDate(data.insights.latestEvalDate)}
                            </p>
                         </div>

                         <div>
                            <h6 className="text-[9px] font-black text-zinc-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                               <Zap className="w-3 h-3 text-amber-500" /> Key Strengths
                            </h6>
                            <div className="flex flex-wrap gap-1.5">
                               {data.insights.radarData.filter(d => d.score > 40).slice(0, 3).map(skill => (
                                  <span key={skill.name} className="bg-zinc-50 px-2 py-1 rounded-md text-[8px] font-black text-zinc-500 uppercase tracking-widest ring-1 ring-zinc-100">
                                     {skill.name}
                                  </span>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className={cn(
                "grid gap-3",
                currentMastery.length <= 4 ? "grid-cols-2 md:grid-cols-4" : 
                currentMastery.length <= 6 ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-6" :
                "grid-cols-2 md:grid-cols-4 lg:grid-cols-4"
              )}>
                {currentMastery.map((item, idx) => {
                  const categoryName = item.label.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
                  const config = MASTERY_COLORS[categoryName] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
                  return (
                    <div key={item.label} className={cn("rounded-2xl p-4 flex flex-col justify-between border border-transparent shadow-sm", config.tint)}>
                       <p className={cn("text-[8px] font-black uppercase tracking-widest mb-1 truncate", config.text)} title={item.label}>{item.label}</p>
                       <div className="text-xl font-black text-zinc-900 tracking-tighter tabular-nums">
                          {item.score.toFixed(2)}%
                       </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 3.5 Behavioral Trait Audit Section */}
              {data.insights.traitResults && (
                <div className="bg-zinc-50/50 rounded-3xl p-8 border border-zinc-100 shadow-sm">
                   <div className="flex items-center gap-2 mb-6">
                      <ShieldCheck className="w-5 h-5 text-red-500" />
                      <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Psychometric Profile</h4>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {Object.entries(data.insights.traitResults).map(([trait, result]) => (
                         <div key={trait} className="bg-white rounded-2xl p-4 border border-zinc-100 flex flex-col gap-2 shadow-sm transition-all hover:shadow-md group">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest truncate group-hover:text-zinc-600">
                               {trait.replace(/_/g, ' ')}
                            </p>
                            <div className="flex items-center justify-between">
                               <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                 result.passed ? "bg-emerald-600 text-white ring-1 ring-emerald-100" : "bg-red-600 text-white ring-1 ring-red-100"
                               )}>
                                  {result.passed ? 'PASS' : 'Need Improvement'}
                               </span>
                               <span className="text-[10px] font-bold text-zinc-300 tabular-nums">
                                  {result.score.toFixed(2)} / {result.maxScore.toFixed(2)}
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>

                </div>
              )}

              {/* 4. Behavioral Profile Footer */}
              <div className="bg-[#0f172a] rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
                 <div className="flex items-center gap-6 z-10">
                    <div className="w-14 h-14 bg-[#1e293b] rounded-2xl flex items-center justify-center ring-1 ring-[#334155] shrink-0">
                       <GraduationCap className="w-7 h-7 text-zinc-400" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1.5 leading-none">BEHAVIORAL PROFILE</p>
                       <h3 className={cn(
                          "text-2xl font-black uppercase tracking-tight leading-none transition-colors",
                          data.insights.alignment >= 90 ? "text-blue-500" :
                          data.insights.alignment >= 80 ? "text-emerald-500" :
                          data.insights.alignment >= 60 ? "text-amber-500" :
                          "text-rose-500"
                       )}>
                          {data.insights.behavioralProfile}
                       </h3>
                    </div>
                 </div>

                 <div className="flex items-center gap-10 z-10 text-center md:text-right">
                    <div className="hidden lg:block max-w-[180px]">
                       <p className="text-[9px] font-bold text-zinc-500 italic leading-relaxed">
                          "Insights indicate consistent performance across core domains."
                       </p>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                       <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1.5 leading-none">ALIGNMENT</p>
                       <h3 className="text-3xl font-black text-rose-500 tracking-tight leading-none tabular-nums">
                          {data.insights.alignment}%
                       </h3>
                    </div>
                 </div>

                 {/* Decorative background shape */}
                 <div className="absolute top-0 right-0 w-48 h-full bg-[#D62027] opacity-10 blur-3xl -mr-24" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
