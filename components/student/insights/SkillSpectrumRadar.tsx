'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RadarTooltip,
} from 'recharts';
import { Activity, BarChart3, User, UserCheck } from 'lucide-react';

function cn(...inputs: Array<string | undefined | null | boolean>) {
  return inputs.filter(Boolean).join(' ');
}


const DOMAIN_COLOR_MAP: Record<string, string> = {
  computationalthinking: '#3B82F6',
  programmingfundamentals: '#10B981',
  frontendengineering: '#6366F1',
  backendengineering: '#8B5CF6',
  databaseengineering: '#F59E0B',
  debuggingquality: '#EF4444',
  systemdesign: '#EC4899',
  aiaugmented: '#06B6D4',
};

const getDomainColor = (name: string) => {
  const normalized = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return DOMAIN_COLOR_MAP[normalized] || '#64748b';
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

interface DomainMetric {
  accuracy?: number;
  band?: string;
  questionsAttempted?: number;
  correct?: number;
  needsAttention?: number;
}

interface SkillSpectrumRadarProps {
  domainMetrics?: Record<string, DomainMetric>;
  overallMetrics?: {
    percentage?: number;
    band?: string;
  };
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  overallStatus?: string;
}

export default React.memo(function SkillSpectrumRadar({
  domainMetrics = {},
  overallMetrics,
  enabled = true,
  title = "Skill Analysis Spectrum",
  subtitle = "COMPREHENSIVE READINESS BREAKDOWN",
  overallStatus
}: SkillSpectrumRadarProps) {
  
  if (!enabled) return null;

  const isPsychometricFailed = (overallStatus || '').toLowerCase() === 'fail';

  const spectrumDomains = Object.entries(domainMetrics).map(([name, metrics]) => {
    const questionsAttempted = metrics.questionsAttempted ?? metrics.correct ?? 0;
    let accuracyPct: number;

    if (typeof metrics.accuracy === 'number') {
      accuracyPct = metrics.accuracy > 1 ? metrics.accuracy : metrics.accuracy * 100;
    } else if (typeof metrics.correct === 'number' && questionsAttempted > 0) {
      accuracyPct = (metrics.correct / questionsAttempted) * 100;
    } else {
      accuracyPct = 0;
    }

    if (!Number.isFinite(accuracyPct)) accuracyPct = 0;
    if (isPsychometricFailed) accuracyPct = 0;

    return {
      name,
      accuracyPct: Math.max(0, Math.min(100, accuracyPct)),
      band: isPsychometricFailed ? 'RED' : (metrics.band ?? 'NEUTRAL'),
      questionsAttempted: questionsAttempted > 0 ? questionsAttempted : 1,
      correct: metrics.correct ?? 0,
      needsAttention: metrics.needsAttention ?? Math.max(0, (questionsAttempted || 0) - (metrics.correct ?? 0)),
    };
  });

  return (
    <div className="space-y-6 pt-12 pb-24">
       <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-[28px] font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h2>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-sans ml-14">{subtitle}</p>
       </div>

       <div className="bg-white rounded-[40px] p-8 md:p-14 border border-slate-100 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.06)] no-hover relative overflow-hidden group">
         {/* Subtle background grid pattern */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
         
         {spectrumDomains.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.1fr_0.7fr] gap-12 lg:gap-8 items-center relative z-10">
               
               {/* 1. Radar Chart Column */}
               <div className="relative h-[360px] md:h-[400px]">
                 <div className="absolute top-0 left-0 z-20 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF4757] shadow-[0_0_8px_rgba(255,71,87,0.4)] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Score</span>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart
                     data={spectrumDomains.map(d => ({
                       name: d.name,
                       score: d.accuracyPct,
                     }))}
                     outerRadius="75%"
                     margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
                   >
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
                       contentStyle={{
                         fontSize: 12,
                         fontWeight: 800,
                         borderRadius: 20,
                         border: 'none',
                         boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                         padding: '12px 20px',
                       }}
                       formatter={(value: any) => [`${(value as number).toFixed(2)}%`, 'Accuracy']}
                     />
                   </RadarChart>
                 </ResponsiveContainer>
               </div>

               {/* 2. Mastery Indicators Column */}
               <div className="flex flex-col gap-8 h-full justify-center lg:border-l lg:border-slate-50 lg:pl-16">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Mastery Indicators</p>
                  <div className="space-y-7">
                    {spectrumDomains.slice(0, 6).map((dom) => (
                      <div key={dom.name} className="flex items-center justify-between group/item">
                        <div className="flex flex-col gap-0.5">
                          <h4 
                            className="text-[15px] font-black uppercase tracking-tight leading-none transition-all group-hover/item:scale-105"
                            style={{ color: getDomainColor(dom.name) }}
                          >
                            {dom.name}
                          </h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</p>
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                          {dom.accuracyPct.toFixed(2)}%
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               {/* 3. Behavioral Profile Column */}
               <div className="flex items-center justify-center lg:justify-end h-full">
                  <div className="bg-[#f8fafc]/50 rounded-[48px] p-10 flex flex-col items-center justify-center w-full max-w-[280px] text-center border border-white shadow-sm relative no-hover group/profile transition-all duration-500 hover:bg-white hover:shadow-xl">
                     {/* Person Icon in Dark Box */}
                     <div className="w-20 h-20 bg-[#0f172a] rounded-[28px] flex items-center justify-center mb-8 shadow-xl shadow-slate-900/10 transition-transform group-hover/profile:-translate-y-2">
                        <UserCheck className="w-8 h-8 text-white" />
                     </div>
                     
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Behavioral Profile</p>
                     
                     <div className={cn(
                       "text-[30px] font-black tracking-tighter uppercase leading-none drop-shadow-sm",
                       isPsychometricFailed ? 'text-[#FF4757]' : 'text-[#10B981]'
                     )}>
                       {isPsychometricFailed ? 'Need Improvement' : 'PASS'}
                     </div>
                  </div>
               </div>
            </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-24 text-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No Evaluation Reports</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 max-w-sm leading-relaxed">
                 Complete your readiness assessment to unlock your comprehensive skill analysis spectrum.
              </p>
           </div>
         )}
       </div>
    </div>
  );
});
