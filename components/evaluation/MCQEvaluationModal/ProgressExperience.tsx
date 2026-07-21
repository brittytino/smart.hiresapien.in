'use client';

import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Database, FileSearch, Lightbulb, TrendingUp, BarChart3, ClipboardCheck } from 'lucide-react';

interface ProgressExperienceProps {
  onComplete: () => void;
  totalStudents: number;
}

const STAGES = [
  { label: 'Initializing Evaluation Engine...', icon: Activity, color: 'text-zinc-400' },
  { label: 'Aggregating Student Responses...', icon: Database, color: 'text-blue-500' },
  { label: 'Validating Answer Keys...', icon: ShieldCheck, color: 'text-emerald-500' },
  { label: 'Scoring Sub-domains...', icon: FileSearch, color: 'text-amber-500' },
  { label: 'Calibrating Difficulty Weights...', icon: Lightbulb, color: 'text-purple-500' },
  { label: 'Computing Placement Readiness Index (PRI)...', icon: TrendingUp, color: 'text-[#D62027]' },
  { label: 'Finalizing Performance Rankings...', icon: BarChart3, color: 'text-indigo-500' },
  { label: 'Generating Insight Reports...', icon: ClipboardCheck, color: 'text-emerald-600' },
];

export default function ProgressExperience({ onComplete, totalStudents }: ProgressExperienceProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    const stageDuration = 2500; // 2.5s per stage
    const totalDuration = stageDuration * STAGES.length;
    
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        clearInterval(stageInterval);
        return prev;
      });
    }, stageDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) return prev + 0.5;
        clearInterval(progressInterval);
        return prev;
      });
    }, totalDuration / 200);

    const studentInterval = setInterval(() => {
      setStudentsCount((prev) => {
        if (prev < totalStudents) return prev + 1;
        clearInterval(studentInterval);
        return prev;
      });
    }, totalDuration / totalStudents);

    const timeout = setTimeout(() => {
      onComplete();
    }, totalDuration + 1000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
      clearInterval(studentInterval);
      clearTimeout(timeout);
    };
  }, [onComplete, totalStudents]);

  const CurrentIcon = STAGES[currentStage].icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative">
        {/* Pulsing rings */}
        <div className="absolute inset-0 bg-[#D62027]/10 rounded-full animate-ping" />
        <div className="absolute inset-0 bg-[#D62027]/5 rounded-full animate-pulse blur-xl" />
        
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-950 flex items-center justify-center shadow-2xl border-4 border-[#D62027]/20 transform rotate-[10deg]">
           <div className="bg-[#D62027] p-4 md:p-5 rounded-xl md:rounded-2xl shadow-xl transform rotate-[-10deg]">
             <CurrentIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
           </div>
        </div>
      </div>

      <div className="text-center space-y-4 px-4">
        <h3 className="text-xl md:text-3xl font-black text-zinc-900 tracking-tight transition-all duration-500 uppercase max-w-lg mx-auto">
          {STAGES[currentStage].label}
        </h3>
        <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-[0.25em] flex items-center justify-center gap-3">
          <Activity className="w-3 h-3 text-[#D62027] animate-pulse" />
          Batch Evaluation in Progress
        </p>
      </div>

      <div className="w-full max-w-md space-y-3">
        <div className="flex justify-between items-end px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D62027]">System Progress</span>
          <span className="text-sm font-black text-zinc-900">{Math.floor(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50 relative">
          <div 
            className="h-full bg-gradient-to-r from-zinc-900 via-[#D62027] to-zinc-900 transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[progress-bar-stripes_1s_linear_infinite]" />
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 border border-zinc-200/50 rounded-[2rem] p-6 md:p-8 flex flex-col items-center min-w-[240px] md:min-w-[280px] shadow-sm transform hover:scale-[1.02] transition-transform">
        <div className="text-4xl md:text-5xl font-black text-zinc-950 tabular-nums tracking-tighter mb-2">
          {studentsCount}
        </div>
        <p className="text-[10px] md:text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">Students Evaluated</p>
      </div>
      
      <style jsx>{`
        @keyframes progress-bar-stripes {
          from { background-position: 24px 0; }
          to { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
}
