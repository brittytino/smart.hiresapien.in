'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DOMAIN_MAP } from '@/lib/domains';
import { Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Question {
  _id: string;
  uniqueId: string;
  domain: string;
  subSkill: string;
  assessmentType: string;
  bloomLevel?: 'Remember' | 'Understand' | 'Apply' | 'Analyse' | 'Create' | 'Evaluate';
  questionType: 'mcq' | 'written';
  questionText: string;
  questionImageUrl?: string;
  sourceDetails?: string;
  caseContext?: string;
  caseContextImageUrl?: string;
  options: { label: string; text: string; imageUrl?: string; score?: number }[];
  correctAnswer?: string;
  explanation?: string;
  explanationImageUrl?: string;
  difficulty: string;
  estimatedTimeMinutes: number;
  contributorUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface MyQuestionsProps {
  token: string;
  refreshKey: number;
}

const STATUS_CONFIG = {
  pending: {
    color: 'red',
    bg: 'bg-[#D62027]',
    text: 'text-white',
    border: 'border-[#b91c1c]',
    icon: Clock,
    label: 'Under Review'
  },
  approved: {
    color: 'emerald',
    bg: 'bg-[#15803d]',
    text: 'text-white',
    border: 'border-[#166534]',
    icon: CheckCircle2,
    label: 'Approved'
  },
  rejected: {
    color: 'red',
    bg: 'bg-[#D62027]',
    text: 'text-white',
    border: 'border-[#D62027]',
    icon: XCircle,
    label: 'Rejected'
  },
};

export default function MyQuestions({ token, refreshKey }: MyQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  };

  const renderImagePreview = (label: string, url?: string) => (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      {url ? (
        <img
          src={url}
          alt={label}
          className="w-full max-h-64 rounded-xl object-contain border border-slate-200 bg-white"
        />
      ) : (
        <span className="text-xs text-slate-600">—</span>
      )}
    </div>
  );

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/questions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load questions');
        return;
      }
      setQuestions(data.questions);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions, refreshKey]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
        <div className="w-48 h-4 bg-slate-100 rounded-full" />
    </div>
  );

  if (error) return (
    <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2rem] flex flex-col items-center text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
        <p className="text-rose-600 font-bold tracking-tight">{error}</p>
        <button onClick={fetchQuestions} className="mt-4 text-xs font-black uppercase text-rose-500 hover:underline">Retry</button>
    </div>
  );

  if (questions.length === 0) return (
    <div className="bg-white border-2 border-dashed border-slate-100 p-16 rounded-[2.5rem] flex flex-col items-center text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-2xl font-black text-[#000000] mb-3 uppercase tracking-tight">No Submissions Found</h3>
        <p className="text-slate-400 font-medium max-w-sm mb-8 leading-relaxed">
          You haven't submitted any questions yet, or they are still being processed. Start contributing to see your work here.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={fetchQuestions}
            className="px-8 py-3.5 bg-[#000000] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#333] transition-all shadow-lg active:scale-95"
          >
            Refresh Submissions
          </button>
        </div>
    </div>
  );

  const renderQuestionDetails = (q: Question) => (
    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white border text-base border-slate-100 p-5 rounded-2xl shadow-sm text-zinc-900 font-medium leading-relaxed">
        {q.questionText}
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unique ID</span>
          <p className="text-xs text-slate-700 font-semibold break-all">{formatValue(q.uniqueId)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assessment Type</span>
          <p className="text-xs text-slate-700 font-semibold">{formatValue(q.assessmentType)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Bloom Level</span>
          <p className="text-xs text-slate-700 font-semibold">{formatValue(q.bloomLevel)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estimated Time (min)</span>
          <p className="text-xs text-slate-700 font-semibold">{formatValue(q.estimatedTimeMinutes)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contributor</span>
          <p className="text-xs text-slate-700 font-semibold">{formatValue(q.contributorUsername)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reviewed By</span>
          <p className="text-xs text-slate-700 font-semibold">{formatValue(q.reviewedBy)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reviewed At</span>
          <p className="text-xs text-slate-700 font-semibold">{formatDateTime(q.reviewedAt)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Created At</span>
          <p className="text-xs text-slate-700 font-semibold">{formatDateTime(q.createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Updated At</span>
          <p className="text-xs text-slate-700 font-semibold">{formatDateTime(q.updatedAt)}</p>
        </div>
      </div>

      {q.caseContext && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Context</span>
          <p className="text-xs text-slate-600 leading-relaxed">{q.caseContext}</p>
          {q.caseContextImageUrl && (
            <img
              src={q.caseContextImageUrl}
              alt="Case context"
              className="mt-3 w-full max-h-64 rounded-xl object-contain border border-slate-200 bg-white"
            />
          )}
        </div>
      )}

      {q.questionImageUrl && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question Image</span>
          <img
            src={q.questionImageUrl}
            alt="Question"
            className="w-full max-h-64 rounded-xl object-contain border border-slate-200 bg-white"
          />
        </div>
      )}

      {q.sourceDetails && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Source / Outsource Details</span>
          <p className="text-xs text-slate-600 leading-relaxed">{q.sourceDetails}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Images</span>
        <div className="grid gap-4 md:grid-cols-3">
          {renderImagePreview('Question', q.questionImageUrl)}
          {renderImagePreview('Context', q.caseContextImageUrl)}
          {renderImagePreview('Explanation', q.explanationImageUrl)}
        </div>
      </div>

      {q.questionType === 'mcq' && (
        <div className="grid gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Options</span>
          {q.options.map((opt) => (
            <div key={opt.label} className={`flex flex-col gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
              q.correctAnswer === opt.label 
              ? 'bg-[#15803d] border-[#166534] text-white shadow-md' 
              : 'bg-white border-slate-100 text-[#000000]'
            }`}>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center font-black bg-[#000000] text-white shadow-sm shrink-0">
                  {opt.label}
                </span>
                <span>{opt.text}</span>
                {typeof opt.score === 'number' && (
                  <span className={`ml-auto px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    q.correctAnswer === opt.label ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    Score: {opt.score}
                  </span>
                )}
                {q.correctAnswer === opt.label && <CheckCircle2 className="w-4 h-4 ml-auto text-white/80" />}
              </div>
              {opt.imageUrl && (
                <img
                  src={opt.imageUrl}
                  alt={`Option ${opt.label}`}
                  className="w-full max-h-48 rounded-xl object-contain border border-slate-200 bg-white"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {q.questionType === 'written' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question Type</span>
          <p className="text-xs text-slate-600">Written response (no options)</p>
        </div>
      )}

      {q.questionType === 'mcq' && q.explanation && (
        <div className="border-t border-slate-100 pt-5">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Explanation</span>
           <p className="text-xs text-slate-600 italic">{q.explanation}</p>
           {q.explanationImageUrl && (
             <img
               src={q.explanationImageUrl}
               alt="Explanation"
               className="mt-3 w-full max-h-56 rounded-xl object-contain border border-slate-200 bg-white"
             />
           )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Answer Key</span>
          <p className="text-xs text-slate-600 font-bold">{formatValue(q.correctAnswer)}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Review Note</span>
          <p className="text-xs text-slate-600 font-bold">{formatValue(q.reviewNote)}</p>
        </div>
      </div>

      {q.status === 'rejected' && q.reviewNote && (
        <div className="mt-4 bg-rose-50 border-l-4 border-rose-400 p-4 rounded-r-xl">
          <p className="text-xs text-rose-800 font-medium">
            <span className="font-black uppercase text-[10px] block mb-1">Feedback from Admin</span>
            {q.reviewNote}
          </p>
        </div>
      )}
    </div>
  );

  const filteredQuestions = questions.filter(q => q.status === activeTab);

  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      <div className="flex items-center gap-6 mb-2 border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('pending'); setExpandedId(null); }}
          className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
            activeTab === 'pending' ? 'border-[#D62027] text-[#D62027]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Under Review
        </button>
        <button
          onClick={() => { setActiveTab('approved'); setExpandedId(null); }}
          className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
            activeTab === 'approved' ? 'border-[#15803d] text-[#15803d]' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => { setActiveTab('rejected'); setExpandedId(null); }}
          className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${
            activeTab === 'rejected' ? 'border-rose-500 text-rose-500' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Rejected
        </button>
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <th className="p-4 px-6 font-black w-24">ID</th>
                  <th className="p-4 px-6 font-black min-w-[200px]">Domain & Skill</th>
                  <th className="p-4 px-6 font-black min-w-[150px]">Question Specs</th>
                  <th className="p-4 px-6 font-black">Status</th>
                  <th className="p-4 px-6 font-black">Submitted</th>
                  <th className="p-4 px-6 font-black text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                      No questions found in this category.
                    </td>
                  </tr>
                )}
                {filteredQuestions.map((q) => {
                  const domainMeta = DOMAIN_MAP[q.domain as keyof typeof DOMAIN_MAP];
                  const status = STATUS_CONFIG[q.status];
                  const StatusIcon = status.icon;
                  const isExpanded = expandedId === q._id;

                  return (
                    <React.Fragment key={q._id}>
                      <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                        <td className="p-4 px-6 text-xs text-slate-500 font-bold uppercase tracking-wider">{q._id.slice(-6)}</td>
                        <td className="p-4 px-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-black text-zinc-900 break-words">{domainMeta?.name ?? q.domain}</span>
                            <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-lg max-w-max">
                              {q.subSkill}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 px-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-slate-100 text-slate-700 px-2.5 py-1 rounded max-w-max uppercase tracking-wider">
                              {q.questionType}
                            </span>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5">
                              <span className="font-medium text-slate-700">{q.difficulty}</span> 
                              {q.bloomLevel && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
                                  <span>{q.bloomLevel}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 px-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${status.bg} ${status.border} ${status.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                          </div>
                        </td>
                        <td className="p-4 px-6 text-xs text-slate-500 font-medium font-mono">
                          {new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-4 px-6 text-right">
                          <button 
                            onClick={() => setExpandedId(isExpanded ? null : q._id)}
                            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border ${
                              isExpanded ? 'border-[#D62027] text-[#D62027]' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            } rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
                          >
                            <span>{isExpanded ? 'Close' : 'View'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/30 p-0 border-b-2 border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-top-4 duration-500">
                              {renderQuestionDetails(q)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
