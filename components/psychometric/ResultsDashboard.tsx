import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { testData } from '@/lib/psychometric/questions';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle2, XCircle, Brain, Target, ArrowRight } from 'lucide-react';

interface ResultsDashboardProps {
  scores: Record<string, number>;
  aiAnalysis: string;
  onRestart: () => void;
}

export function ResultsDashboard({ scores, aiAnalysis, onRestart }: ResultsDashboardProps) {

  const chartData = testData.map((trait) => {
    const rawScore = scores[trait.id] || 0;
    return {
      subject: trait.title.split(' ')[0],
      A: rawScore,
      fullMark: 5,
    };
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-12 font-sans text-[#0B0F19]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center bg-red-50 text-[#E13737] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-red-100">
            <Target className="w-4 h-4 mr-2" />
            Assessment Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-[#0B0F19] mb-4">
            Your Performance <span className="text-[#E13737]">Analytics</span>
          </h1>
          <p className="text-lg text-[#8A94A6] max-w-2xl mx-auto font-medium">
            A comprehensive breakdown of your professional competencies and behavioral traits.
          </p>
        </header>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-display font-black mb-8 flex items-center text-[#0B0F19]">
              <Target className="w-6 h-6 mr-3 text-[#E13737]" />
              Trait Breakdown
            </h2>
            
            <div className="space-y-8">
              {testData.map((trait) => {
                const score = scores[trait.id] || 0;
                const passed = score >= 2.5;
                
                return (
                  <div key={trait.id} className="relative">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-[#0B0F19] truncate pr-4 uppercase tracking-wider" title={trait.title}>
                        {trait.title}
                      </span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`text-sm font-black ${passed ? 'text-[#34A853]' : 'text-[#E13737]'}`}>
                          {score.toFixed(2)} / 5.0
                        </span>
                        {passed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#34A853]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#E13737]" />
                        )}
                      </div>
                    </div>
                    <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, ((score + 5) / 10) * 100))}%` }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className={`h-full rounded-full ${passed ? 'bg-[#34A853]' : 'bg-[#E13737]'}`}
                      />
                      <div className="absolute top-0 bottom-0 w-1 bg-[#0B0F19] z-10" style={{ left: '75%' }} title="Pass Mark (2.5)" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-[400px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData} margin={{ top: 10, right: 50, bottom: 10, left: 50 }}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8A94A6', fontSize: 11, fontWeight: 700, fontFamily: 'Inter' }} />
                <PolarRadiusAxis angle={30} domain={[-5, 5]} tick={{ fill: '#CBD5E1', fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="#E13737" fill="#E13737" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'Inter', fontWeight: 700 }}
                  itemStyle={{ color: '#E13737', fontWeight: 800 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onRestart}
              className="group flex items-center font-display font-bold text-lg px-12 py-5 rounded-full transition-all duration-200 tracking-widest uppercase bg-[#0B0F19] text-white hover:bg-black shadow-2xl active:scale-95"
            >
              Back to Dashboard
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


