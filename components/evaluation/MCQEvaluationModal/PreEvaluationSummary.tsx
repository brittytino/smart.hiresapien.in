'use client';

import React from 'react';
import { Users, ClipboardCheck, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { StudentEvaluationResult } from '@/lib/mock-evaluation-data';

interface PreEvaluationSummaryProps {
  students: StudentEvaluationResult[];
  onStartEvaluation: () => void;
  isLoading?: boolean;
}

export default function PreEvaluationSummary({ 
  students, 
  onStartEvaluation, 
  isLoading 
}: PreEvaluationSummaryProps) {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black text-zinc-900 tracking-tight uppercase">Ready to Evaluate</h3>
          <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
            {students.length} Student submissions pending calibration
          </p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 w-fit">
          <ClipboardCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Attendance Validated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Enrollment</p>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-900" />
            <span className="text-2xl font-black text-zinc-900">{students.length}</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Average Attempted</p>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#D62027]" />
            <span className="text-2xl font-black text-zinc-900">
               {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.domains?.length ? s.domains.reduce((da, d) => da + (d.attempted / d.total), 0) / s.domains.length : 0), 0) / students.length * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black rounded-lg uppercase">Awaiting Engine</span>
          </div>
        </div>
      </div>

      <div className="g360-card overflow-hidden border-zinc-100 shadow-sm">
        <div className="bg-zinc-50 px-4 md:px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Student Attendance Matrix</span>
           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden sm:block">Attempted / Total</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {students.map((student) => (
            <div key={student.studentId} className="px-4 md:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                     {student.studentName.charAt(0)}
                   </div>
                   <div className="min-w-0">
                     <p className="text-sm font-black text-zinc-900 truncate">{student.studentName}</p>
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest truncate">{student.studentId}</p>
                   </div>
                </div>
                <div className="flex sm:flex-col justify-between items-center sm:items-end gap-2 bg-zinc-50/50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  <span className="text-xs font-black text-zinc-900">
                    {student.status === 'pending' 
                      ? `${student.testAttempted || 0} Qns` 
                      : `${student.domains.reduce((acc, d) => acc + d.attempted, 0)} / ${student.domains.reduce((acc, d) => acc + d.total, 0)}`
                    }
                  </span>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{student.status === 'pending' ? 'Logged' : 'Total Qns'}</p>
                </div>
              </div>
              {student.status === 'completed' && student.domains && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {student.domains.map((dom) => (
                    <div key={dom.domainId} className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/50 flex flex-col items-center min-w-0">
                      <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest truncate w-full text-center">{dom.domainName}</p>
                      <span className="text-[10px] font-black text-zinc-700">{dom.attempted}/{dom.total}</span>
                    </div>
                  ))}
                </div>
              )}
              {student.status === 'pending' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">Awaiting PRI Generation</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        <button
          onClick={onStartEvaluation}
          disabled={isLoading}
          className="w-full max-w-sm rounded-2xl bg-black text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-200 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {isLoading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Start Evaluation Engine
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            </>
          )}
        </button>
        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Manual Trigger: Scores will be recalibrated upon start</p>
      </div>
    </div>
  );
}
