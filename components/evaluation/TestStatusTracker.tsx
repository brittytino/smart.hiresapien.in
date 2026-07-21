'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export type TestStage =
  | 'Published'
  | 'Accepted'
  | 'Started'
  | 'Completed'
  | 'Ready to Evaluate'
  | 'Evaluation Completed'
  | 'Results Published';

interface TestStatusTrackerProps {
  currentStage: TestStage;
  acceptedInfo?: { accepted: number; total: number };
  className?: string;
}

const STAGES: TestStage[] = [
  'Published',
  'Accepted',
  'Started',
  'Completed',
  'Ready to Evaluate',
  'Evaluation Completed',
  'Results Published',
];

export default function TestStatusTracker({ currentStage, acceptedInfo, className = '' }: TestStatusTrackerProps) {
  const currentIndex = STAGES.indexOf(currentStage);
  const totalStages = STAGES.length;

  return (
    <div className={`w-full pt-4 pb-12 ${className}`}>
      <div className="relative px-4">
        {/* Progress Bar Background */}
        <div className="absolute top-3 left-[7.14%] right-[7.14%] h-[2px] bg-zinc-100 z-0" />

        {/* Active Progress Bar */}
        <div
          className="absolute top-3 left-[7.14%] h-[2px] bg-[#D62027] z-0 transition-all duration-1000 ease-in-out"
          style={{
            width: currentIndex > 0
              ? `${(currentIndex / (totalStages - 1)) * ((totalStages - 2) / totalStages * 100)}%`
              : '0%'
          }}
        />

        <div className="grid grid-cols-7 gap-0 relative">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center relative z-10">
                {/* Dot */}
                <div className={`
                  flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300
                  ${isCompleted || (isActive && index === totalStages - 1) ? 'bg-[#D62027] border-[#D62027] text-white shadow-lg shadow-[#D62027]/20' : 
                    isActive ? 'bg-white border-[#D62027] text-[#D62027] scale-110 shadow-xl' : 
                    'bg-white border-zinc-200 text-zinc-300'}
                `}>
                  {isCompleted || (isActive && index === totalStages - 1) ? (
                     <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isActive ? (
                     <Clock className="w-3.5 h-3.5 animate-pulse" />
                  ) : (
                     <Circle className="w-2.5 h-2.5 fill-current" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 flex flex-col items-center w-full px-0.5 min-h-[32px]">
                  <p className={`
                    text-[6px] font-black uppercase tracking-tight leading-[1.1] transition-colors duration-300 text-center break-words w-full
                    ${isActive ? 'text-[#D62027]' : isCompleted ? 'text-zinc-600' : 'text-zinc-400'}
                  `}>
                    {stage}
                  </p>
                  {stage === 'Accepted' && acceptedInfo && (
                    <span className={`text-[5px] font-bold tracking-tight mt-0.5 text-center ${isActive ? 'text-[#D62027]' : isCompleted ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {acceptedInfo.accepted}/{acceptedInfo.total}
                    </span>
                  )}
                  {isActive && (
                    <span className="block w-3 h-0.5 bg-[#D62027] mt-1 rounded-full animate-in slide-in-from-left-2 duration-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
