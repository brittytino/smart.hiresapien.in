'use client';

import React, { useState } from 'react';
import { Award, ChevronDown, CheckCircle2, XCircle, Users, BarChart3, Target, Activity, ShieldCheck, Download, Brain, FileText, Cpu } from 'lucide-react';
import { StudentEvaluationResult } from '@/lib/mock-evaluation-data';

interface MCQResultsViewProps {
  results: StudentEvaluationResult[];
  onClose: () => void;
}

export default function MCQResultsView({ results, onClose }: MCQResultsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter out workspace-psychology domain from all results
  const filteredResults = results.map(result => ({
    ...result,
    domains: result.domains.filter(domain => domain.domainId !== 'workspace-psychology')
  }));

  const getPillColor = (pill: string) => {
    switch (pill) {
      case 'Diamond': return 'text-blue-500 bg-blue-50 border-blue-100';
      case 'Gold': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'Silver': return 'text-slate-500 bg-slate-50 border-slate-100';
      default: return 'text-zinc-400 bg-zinc-50 border-zinc-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight uppercase">Evaluation Results</h3>
          <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
            Batch Performance finalized across {filteredResults[0]?.domains.length || 0} active domains
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => {
              const testIdFromUrl = window.location.pathname.split('/')[3];
              if (!testIdFromUrl) return;
              window.location.href = `/admin/pri-test/${testIdFromUrl}/solution`;
            }}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl bg-[#D62027] text-white hover:bg-[#b01a20]"
          >
            <ShieldCheck className="w-4 h-4" />
            View Solution Key
          </button>
          
          <button 
             onClick={() => {}} 
             className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl"
          >
            <Download className="w-4 h-4" />
            Export PRI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-zinc-50 border border-zinc-100 flex flex-col items-center">
            <p className="text-[9px] md:text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Class Median PRI</p>
            <span className="text-2xl md:text-3xl font-black text-zinc-900">
               {(results.reduce((acc, s) => acc + s.overallPRI, 0) / (results.length || 1)).toFixed(2)}%
            </span>
         </div>
         <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
            <p className="text-[9px] md:text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-2">Completion Rate</p>
            <span className="text-2xl md:text-3xl font-black text-emerald-700">100%</span>
         </div>
         <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-blue-50 border border-blue-100 flex flex-col items-center">
            <p className="text-[9px] md:text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2">Top Performer</p>
            <span className="text-2xl md:text-3xl font-black text-blue-700">{results[0]?.overallPRI || 0}%</span>
         </div>
         <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-[#D62027]/5 border border-[#D62027]/10 flex flex-col items-center">
            <p className="text-[9px] md:text-[10px] font-black uppercase text-[#D62027] tracking-widest mb-2">Batch Ranking</p>
            <span className="text-2xl md:text-3xl font-black text-[#D62027]">Active</span>
         </div>
      </div>

      <div className="g360-card overflow-hidden shadow-2xl border-zinc-100">
        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-20">
           <div className="col-span-12 md:col-span-6">Student Identity</div>
           <div className="hidden md:block col-span-4 text-center">Placement Index</div>
           <div className="hidden md:block col-span-2 text-right">Action</div>
        </div>

        <div className="divide-y divide-zinc-100">
          {filteredResults.map((student, index) => (
            <div key={student.studentId} className="group transition-all">
              <div 
                className={`flex flex-col md:grid md:grid-cols-12 gap-6 px-6 md:px-8 py-6 items-start md:items-center cursor-pointer transition-colors ${expandedId === student.studentId ? 'bg-zinc-50/80 shadow-inner' : ''}`}
                onClick={() => setExpandedId(expandedId === student.studentId ? null : student.studentId)}
              >
                <div className="w-full md:col-span-6 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 border-2 border-white shadow-md flex items-center justify-center text-[18px] font-black uppercase transition-all">
                      {student.studentName.charAt(0)}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 text-white border-2 border-white flex items-center justify-center text-[10px] font-black shadow-lg">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[15px] font-black text-zinc-900 tracking-tight truncate">{student.studentName}</h5>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">@{student.studentId}</p>
                  </div>
                </div>

                <div className="w-full md:col-span-4">
                  <div className="flex flex-col items-center">
                    <div className="relative w-full h-2 bg-zinc-100 rounded-full overflow-hidden shadow-inner mb-2 lg:mb-4">
                       <div 
                        className="h-full bg-linear-to-r from-zinc-900 to-[#D62027] transition-all duration-1000"
                        style={{ width: `${student.overallPRI}%` }}
                       />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest shadow-sm w-full md:w-auto text-center ${getPillColor(student.prizePill)}`}>
                       PRI: {student.overallPRI.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="w-full md:col-span-2 text-right flex items-center justify-between md:justify-end gap-4">
                   <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest md:hidden">Performance Matrix</p>
                   <button className="p-3 bg-white border border-zinc-200 rounded-2xl text-zinc-400 transition-all shadow-sm">
                      <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${expandedId === student.studentId ? 'rotate-180' : ''}`} />
                   </button>
                </div>
              </div>

              {expandedId === student.studentId && (
                <div className="px-6 md:px-10 py-8 md:py-10 bg-white border-t border-zinc-100 animate-in slide-in-from-top-4 duration-500">
                   <div className="mb-8 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <h6 className="text-[10px] md:text-[11px] font-black uppercase text-zinc-400 tracking-[0.3em] mb-2">Detailed Performance Matrix</h6>
                        <div className="h-0.5 w-16 md:w-20 bg-[#D62027] mx-auto md:mx-0 opacity-30" />
                      </div>
                      
                         <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const reportId = student.responseId || student.studentId;
                          window.location.href = `/report/${reportId}`;
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-[#D62027] text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all shadow-xl active:scale-95"
                      >
                        <Award className="w-4 h-4" />
                        View Full Generated Report
                      </button>
                    </div>

                   <div className="grid gap-10">
                      {student.domains
                        .filter(dom => dom.domainId !== 'workspace-psychology')
                        .map((dom) => (
                        <div key={dom.domainId} className="space-y-6">
                           <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-[#D62027] rounded-xl shadow-lg">
                                    <Target className="w-5 h-5 text-white" />
                                 </div>
                                 <div>
                                    <h6 className="text-lg font-black text-zinc-900 uppercase tracking-tight">{dom.domainName}</h6>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{dom.attempted} of {dom.total} Questions Answered</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="text-2xl font-black text-[#D62027]">{dom.score.toFixed(2)}%</span>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Section Score</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                              {dom.subskills.map((sub, si) => (
                                <div key={si} className="bg-zinc-50/50 border border-zinc-100 rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all group/sub">
                                   <div className="flex justify-between items-start mb-4">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{sub.name}</p>
                                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black shadow-sm ${sub.score >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                         {sub.score.toFixed(2)}%
                                      </span>
                                   </div>
                                   <div className="flex items-center justify-between gap-4">
                                      <div className="flex flex-wrap gap-1.5">
                                         {Array.from({ length: sub.total }).map((_, qi) => {
                                           const isCorrect = qi < sub.correct;
                                           const isAttempted = qi < sub.attempted;
                                           return (
                                            <div key={qi} className={`w-3.5 h-3.5 rounded-full border-2 transform transition-all ${
                                               !isAttempted ? 'border-zinc-200 bg-white' :
                                               isCorrect ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                                               'bg-[#D62027] border-[#D62027] shadow-[0_0_8px_rgba(230,39,39,0.4)]'
                                             }`} />
                                           );
                                         })}
                                      </div>
                                      <span className="text-[10px] font-black text-zinc-900 shrink-0">{sub.correct}/{sub.total}</span>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>

                   {student.traitResults && Object.keys(student.traitResults).length > 0 && (
                     <div className="mb-10">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-2 bg-zinc-900 rounded-xl shadow-lg">
                              <Activity className="w-5 h-5 text-white" />
                           </div>
                           <div>
                             <h6 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Workspace Psychology Gateway</h6>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Trait-level scores · Gateway: min 3 of 5 traits passed</p>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                           {Object.entries(student.traitResults).map(([trait, data]) => (
                             <div key={trait} className={`relative p-6 rounded-3xl border-2 transition-all ${
                               data.passed ? 'bg-white border-emerald-100' : 'bg-white border-red-100'
                             }`}>
                                {/* Pass/Fail badge — top right */}
                                <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                  data.passed ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                  {data.passed ? 'PASS' : 'Need Improvement'}
                                </span>

                                {/* Trait name */}
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 pr-16">{trait}</p>

                                {/* Score display */}
                                <div className="flex items-end gap-1 mb-3">
                                   <span className="text-3xl font-black text-zinc-900 leading-none">{data.score.toFixed(1)}</span>
                                   <span className="text-sm font-bold text-zinc-400 mb-0.5">/ {data.maxScore.toFixed(1)}</span>
                                </div>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Trait Score</p>

                                {/* Score bar */}
                                <div className="mt-4 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                                   <div
                                     className={`h-full rounded-full transition-all duration-700 ${
                                       data.passed ? 'bg-emerald-500' : 'bg-red-400'
                                     }`}
                                     style={{ width: `${Math.min(100, data.maxScore > 0 ? (data.score / data.maxScore) * 100 : 0)}%` }}
                                   />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* PRI Score Breakdown — MCQ + Written AI + Psychometric */}
                   {(student.mcqPriScore !== undefined || student.writtenPriScore !== undefined) && (
                     <div className="mb-10 mt-10">
                       <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-[#D62027] rounded-xl shadow-lg">
                           <BarChart3 className="w-5 h-5 text-white" />
                         </div>
                         <div>
                           <h6 className="text-lg font-black text-zinc-900 uppercase tracking-tight">PRI Score Breakdown</h6>
                           <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">MCQ · Written AI (Gemini)</p>
                         </div>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                         {/* MCQ Score */}
                         <div className="p-6 rounded-3xl border-2 border-zinc-100 bg-white transition-all">
                           <div className="flex items-center gap-2 mb-4">
                             <div className="p-1.5 bg-zinc-100 rounded-lg">
                               <Cpu className="w-4 h-4 text-zinc-600" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MCQ Score</p>
                           </div>
                           <div className="flex items-end gap-1 mb-3">
                             <span className="text-3xl font-black text-zinc-900 leading-none">{(student.mcqPriScore ?? 0).toFixed(1)}</span>
                             <span className="text-sm font-bold text-zinc-400 mb-0.5">pts</span>
                           </div>
                           <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                             <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${Math.min(100, student.mcqPriScore ?? 0)}%` }} />
                           </div>
                         </div>
                         {/* Written AI Score */}
                         <div className="p-6 rounded-3xl border-2 border-blue-100 bg-blue-50/50 transition-all">
                           <div className="flex items-center gap-2 mb-4">
                             <div className="p-1.5 bg-blue-100 rounded-lg">
                               <Brain className="w-4 h-4 text-blue-600" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Written AI (Gemini)</p>
                           </div>
                           <div className="flex items-end gap-1 mb-3">
                             <span className="text-3xl font-black text-blue-700 leading-none">{(student.writtenPriScore ?? 0).toFixed(1)}</span>
                             <span className="text-sm font-bold text-blue-400 mb-0.5">pts</span>
                           </div>
                           <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, student.writtenPriScore ?? 0)}%` }} />
                           </div>
                         </div>
                         {/* Psychometric Score */}
                         <div className={`p-6 rounded-3xl border-2 transition-all ${
                           student.priGatewayPassed === false
                             ? 'border-red-100 bg-red-50/50'
                             : 'border-emerald-100 bg-emerald-50/50'
                         }`}>
                           <div className="flex items-center gap-2 mb-4">
                             <div className={`p-1.5 rounded-lg ${student.priGatewayPassed === false ? 'bg-red-100' : 'bg-emerald-100'}`}>
                               <Activity className={`w-4 h-4 ${student.priGatewayPassed === false ? 'text-red-600' : 'text-emerald-600'}`} />
                             </div>
                             <p className={`text-[10px] font-black uppercase tracking-widest ${student.priGatewayPassed === false ? 'text-red-500' : 'text-emerald-500'}`}>
                               Psychometric Gateway
                             </p>
                           </div>
                           <div className="flex items-end gap-1 mb-3">
                             <span className={`text-3xl font-black leading-none ${student.priGatewayPassed === false ? 'text-red-700' : 'text-emerald-700'}`}>
                               {(student.psychometricPriScore ?? 0).toFixed(1)}
                             </span>
                             <span className={`text-sm font-bold mb-0.5 ${student.priGatewayPassed === false ? 'text-red-400' : 'text-emerald-400'}`}>pts</span>
                           </div>
                           <div className={`h-1.5 rounded-full overflow-hidden ${student.priGatewayPassed === false ? 'bg-red-100' : 'bg-emerald-100'}`}>
                             <div
                               className={`h-full rounded-full ${student.priGatewayPassed === false ? 'bg-red-400' : 'bg-emerald-500'}`}
                               style={{ width: `${Math.min(100, student.psychometricPriScore ?? 0)}%` }}
                             />
                           </div>
                           {student.priGatewayPassed === false && (
                             <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mt-3">Gateway Failed — PRI = 0</p>
                           )}
                         </div>
                       </div>
                     </div>
                   )}

                   <div className="mt-8 md:mt-12 p-6 md:p-8 rounded-2xl md:rounded-4xl bg-zinc-950 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10 hidden sm:block">
                         <ShieldCheck className="w-24 h-24 md:w-32 md:h-32" />
                      </div>
                      <div className="relative z-10">
                         <h6 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D62027] mb-2">Final Evaluation Summary</h6>
                         <p className="text-base md:text-xl font-bold max-w-2xl leading-relaxed">
                            {student.studentName} achieved a Total PRI of {student.overallPRI.toFixed(2)}%.
                            {student.overallStatus === 'pass' 
                              ? ' Behavioral gateway cleared. Student is eligible for placement consideration.' 
                              : student.overallStatus === 'fail'
                              ? ' Behavioral gateway not cleared. Student does not meet the eligibility criteria for this cycle.'
                              : ' Awaiting full evaluation.'}
                         </p>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
         <button 
           onClick={onClose}
           className="px-10 py-4 bg-white border border-zinc-200 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-95"
         >
           Close Report Center
         </button>
      </div>
    </div>
  );
}
