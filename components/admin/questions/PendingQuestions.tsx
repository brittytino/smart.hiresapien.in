'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DOMAIN_MAP } from '@/lib/domains';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Question {
  _id: string;
  uniqueId?: string;
  contributorId?: { _id: string; displayName?: string } | string;
  domain: string;
  subSkill: string;
  assessmentType: string;
  bloomLevel?: string;
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
  estimatedTimeMinutes?: number;
  contributorUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
}

interface PendingQuestionsProps {
  token: string;
}

interface ContributorSummary {
  contributorId: string;
  contributorUsername: string;
  totalQuestions: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-100 text-zinc-900 border-zinc-200',
  approved: 'bg-zinc-100 text-zinc-900 border-zinc-200',
  rejected: 'bg-zinc-100 text-zinc-900 border-zinc-200',
};

const STATUS_TABS = ['pending', 'approved', 'rejected'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function PendingQuestions({ token }: PendingQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('pending');

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [contributors, setContributors] = useState<ContributorSummary[]>([]);
  const [selectedContributorId, setSelectedContributorId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'contributorUsername' | 'domain'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchQuestions = useCallback(
    async (status: StatusTab) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          status,
          page: String(page),
          pageSize: String(pageSize),
          sortBy,
          sortDir,
        });
        if (selectedContributorId !== 'all') {
          params.set('contributorId', selectedContributorId);
        }
        if (searchQuery.trim()) {
          params.set('search', searchQuery.trim());
        }

        const res = await fetch(`/api/admin/questions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Failed to fetch questions');
          return;
        }
        setQuestions(data.questions ?? []);
        if (Array.isArray(data.contributors)) {
          setContributors(data.contributors);
        }
        if (data.pagination) {
          setTotal(Number(data.pagination.total) || 0);
        } else {
          setTotal(Array.isArray(data.questions) ? data.questions.length : 0);
        }
      } catch {
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    },
    [token, selectedContributorId, searchQuery, page, pageSize, sortBy, sortDir]
  );

  useEffect(() => {
    fetchQuestions(activeTab);
    setExpandedId(null);
    setReviewingId(null);
  }, [fetchQuestions, activeTab]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedContributorId, searchQuery, sortBy, sortDir, pageSize]);

  function startReview(id: string, action: 'approve' | 'reject') {
    setReviewingId(id);
    setReviewAction(action);
    setReviewNote('');
    setReviewError('');
  }

  async function submitReview(id: string) {
    if (!reviewAction) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await fetch(`/api/admin/questions/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: reviewAction, reviewNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error ?? 'Review failed');
        return;
      }
      setReviewingId(null);
      setReviewAction(null);
      fetchQuestions(activeTab);
    } catch {
      setReviewError('Network error.');
    } finally {
      setReviewLoading(false);
    }
  }

  const counts = total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(total, page * pageSize);
  const contributorTotals = useMemo(() => {
    return new Map(
      contributors.map((entry) => [entry.contributorId, entry.totalQuestions])
    );
  }, [contributors]);

  return (
    <div className="flex flex-col w-full">
      {/* Standard Header with Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-[15px] border-b border-zinc-100 bg-white">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase leading-none">Contribution Review</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Vetting contributor submissions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH QUESTION..."
              className="w-full bg-zinc-50 border border-zinc-100 rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 outline-none"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <select
              value={selectedContributorId}
              onChange={(e) => setSelectedContributorId(e.target.value)}
              className="w-full appearance-none bg-zinc-50 border border-zinc-100 rounded-xl pl-4 pr-10 py-3 text-xs font-black uppercase tracking-widest text-[#D62027] focus:ring-2 focus:ring-[#D62027]/10 outline-none cursor-pointer"
            >
              <option value="all">CONTRIBUTOR: ALL</option>
              {contributors.map((contributor) => (
                <option key={contributor.contributorId} value={contributor.contributorId}>
                  {contributor.contributorUsername?.toLowerCase() === 'seed_bot' ? 'Grad360 AI' : `@${contributor.contributorUsername}`}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D62027]/40 font-black text-[10px]">↓</div>
          </div>
        </div>
      </div>

      {/* Tabs and Sort controls */}
      <div className="bg-white border-b border-zinc-100 flex items-center gap-1 px-[15px] pb-px">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest relative ${activeTab === tab ? 'text-[#D62027]' : 'text-zinc-400'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D62027] rounded-full" />}
          </button>
        ))}
        <div className="ml-auto pr-4 relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-400 focus:ring-0 outline-none cursor-pointer pr-6"
          >
            <option value="createdAt">SORT: DATE</option>
            <option value="contributorUsername">SORT: USER</option>
            <option value="domain">SORT: DOMAIN</option>
          </select>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-300 font-black text-[10px]">↓</div>
        </div>
      </div>

      <div className="p-0">
        {error && (
          <div className="p-6">
            <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-bold text-[#D62027] uppercase tracking-widest">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D62027]"></div>
          </div>
        ) : counts === 0 ? (
          <div className="p-20 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
              No {activeTab} questions found.
            </p>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            <div className="max-h-[600px] overflow-auto custom-scrollbar no-hover">
              <table className="w-full text-left border-collapse border-spacing-0">
                <thead className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-sm border-b border-zinc-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Question & Metadata</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Type Info</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Estimation</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contributor</th>
                    <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 bg-white">
                  {questions.map((q) => {
                    const domainMeta = DOMAIN_MAP[q.domain as keyof typeof DOMAIN_MAP];
                    const isExpanded = expandedId === q._id || activeTab !== 'pending';
                    const isReviewing = reviewingId === q._id;

                    return (
                      <React.Fragment key={q._id}>
                        <tr 
                          className={`border-b border-zinc-50 no-hover ${isExpanded ? 'bg-zinc-50/30' : ''}`}
                          onClick={() => activeTab === 'pending' && setExpandedId(isExpanded ? null : q._id)}
                        >
                          <td className="px-8 py-6 max-w-lg">
                            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                              <span className="px-2 py-0.5 rounded bg-zinc-900 text-white text-[9px] font-black uppercase tracking-tight">
                                {domainMeta?.name ?? q.domain}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                                {q.subSkill}
                              </span>
                            </div>
                            <p className={`text-sm font-black text-zinc-900 leading-tight tracking-tight ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {q.questionText}
                            </p>
                             {q.correctAnswer && (
                                <p className="text-[10px] font-black text-[#D62027] uppercase tracking-widest mt-2">
                                  KEY: {q.correctAnswer}
                                </p>
                              )}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[10px] font-black uppercase tracking-widest">
                                {q.questionType}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                q.difficulty.toLowerCase() === 'high' || q.difficulty.toLowerCase() === 'hard' ? 'bg-red-50 text-red-600 border-red-100' :
                                q.difficulty.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                {q.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                               <span className="text-sm font-black text-zinc-900">{q.estimatedTimeMinutes || '--'}</span>
                               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Minutes</span>
                            </div>
                          </td>
                           <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-zinc-900 uppercase">
                                {(() => {
                                  const displayName = typeof q.contributorId === 'object' ? q.contributorId?.displayName : null;
                                  if (displayName) return displayName;
                                  if (q.contributorUsername?.toLowerCase() === 'seed_bot') return 'Grad360 AI';
                                  return `@${q.contributorUsername}`;
                                })()}
                              </span>
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                {new Date(q.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             {activeTab === 'pending' ? (
                               <ChevronDown className={`w-4 h-4 text-zinc-300 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                             ) : (
                               <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                 q.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                 q.status === 'rejected' ? 'bg-red-50 text-[#D62027] border-red-100' :
                                 'bg-zinc-100 text-zinc-500 border-zinc-200'
                               }`}>
                                 {q.status}
                               </span>
                             )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-zinc-50/10">
                            <td colSpan={5} className="px-12 py-10 border-t border-zinc-50">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                  <div className="grid grid-cols-2 gap-8 border-b border-zinc-100 pb-8">
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Bloom Level</p>
                                      <p className="text-sm font-black text-zinc-900 uppercase">{q.bloomLevel || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Assessment</p>
                                      <p className="text-sm font-black text-zinc-900 uppercase">{q.assessmentType}</p>
                                    </div>
                                  </div>

                                  {q.caseContext && (
                                    <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                      <p className="text-[9px] font-black text-[#D62027] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D62027]" /> Scenario Detail
                                      </p>
                                      <p className="text-sm font-medium text-zinc-700 leading-relaxed italic whitespace-pre-wrap">{q.caseContext}</p>
                                      {q.caseContextImageUrl && (
                                        <img src={q.caseContextImageUrl} alt="Context" className="mt-6 w-full max-h-80 rounded-2xl object-contain border border-zinc-100 bg-zinc-50" />
                                      )}
                                    </div>
                                  )}

                                  <div className="space-y-4">
                                     <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Question Statement</p>
                                     <p className="text-base font-black text-zinc-900 leading-snug whitespace-pre-wrap">{q.questionText}</p>
                                     {q.questionImageUrl && (
                                       <img src={q.questionImageUrl} alt="Question" className="mt-4 w-full max-h-80 rounded-2xl object-contain border border-zinc-100 bg-zinc-50" />
                                     )}
                                  </div>

                                  {q.explanation && (
                                    <div className="p-8 rounded-[32px] bg-zinc-900 text-white shadow-2xl relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 relative z-10">Rational / Model Answer</p>
                                      <p className="text-sm font-medium leading-relaxed text-zinc-300 relative z-10 whitespace-pre-wrap">{q.explanation}</p>
                                      {q.explanationImageUrl && (
                                        <img src={q.explanationImageUrl} alt="Explanation" className="mt-6 w-full max-h-64 rounded-2xl object-contain border border-white/10 bg-white/5 relative z-10" />
                                      )}
                                    </div>
                                  )}

                                  {q.status === 'rejected' && q.reviewNote && (
                                    <div className="p-6 rounded-2xl bg-red-50 border border-red-100">
                                      <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em] mb-2">Rejection Feedback</p>
                                      <p className="text-sm font-bold text-red-900">{q.reviewNote}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-6">
                                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Answer Evaluation Grid</p>
                                  <div className="grid gap-3">
                                    {q.options.map((o) => (
                                      <div key={o.label} className={`p-5 rounded-2xl border flex flex-col gap-4 ${q.correctAnswer === o.label ? 'bg-white border-emerald-500 shadow-md ring-4 ring-emerald-500/5' : 'bg-white border-zinc-100 shadow-sm'}`}>
                                        <div className="flex items-start gap-4">
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${q.correctAnswer === o.label ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                            {o.label}
                                          </div>
                                          <div className="flex-1">
                                            <p className={`text-sm font-bold ${q.correctAnswer === o.label ? 'text-zinc-900' : 'text-zinc-600'}`}>{o.text}</p>
                                            <div className="flex items-center gap-3 mt-3">
                                              {typeof o.score === 'number' && (
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${o.score > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : o.score < 0 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-zinc-50 text-zinc-500 border border-zinc-100'}`}>
                                                  SCORE: {o.score}
                                                </span>
                                              )}
                                              {q.correctAnswer === o.label && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Correct Response</span>}
                                            </div>
                                          </div>
                                        </div>
                                        {o.imageUrl && (
                                          <img src={o.imageUrl} alt={`Opt ${o.label}`} className="w-full max-h-56 rounded-xl object-contain border border-zinc-50 bg-zinc-50/50" />
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Review Interface - only for pending */}
                                  {q.status === 'pending' && !isReviewing && (
                                    <div className="pt-8 mt-4 border-t border-zinc-100 flex gap-4">
                                      <button onClick={() => startReview(q._id, 'approve')} className="flex-1 rounded-2xl bg-black text-white px-6 py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-zinc-200 transition-all active:scale-95">Approve Item</button>
                                      <button onClick={() => startReview(q._id, 'reject')} className="flex-1 rounded-2xl border-2 border-[#D62027] text-[#D62027] px-6 py-4 text-xs font-black uppercase tracking-widest transition-all active:scale-95">Reject Request</button>
                                    </div>
                                  )}

                                  {isReviewing && (
                                    <div className="pt-8 mt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                      <div className={`p-6 rounded-3xl border ${reviewAction === 'approve' ? 'bg-emerald-50/30 border-emerald-100' : 'bg-red-50/30 border-red-100'}`}>
                                        <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-4">
                                          Review Decision: {reviewAction === 'approve' ? 'Approving' : 'Rejecting'}
                                        </p>
                                        <textarea
                                          required={reviewAction === 'reject'}
                                          rows={3}
                                          value={reviewNote}
                                          onChange={(e) => setReviewNote(e.target.value)}
                                          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all outline-none"
                                          placeholder={reviewAction === 'reject' ? "Please provide a reason for rejection..." : "Add an optional approval note..."}
                                        />
                                        {reviewError && <p className="text-[10px] font-bold text-[#D62027] uppercase tracking-widest mt-2">{reviewError}</p>}
                                        <div className="flex gap-3 mt-4">
                                          <button 
                                            onClick={() => submitReview(q._id)} 
                                            disabled={reviewLoading} 
                                            className={`flex-1 rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50 ${reviewAction === 'approve' ? 'bg-emerald-600' : 'bg-[#D62027]'}`}
                                          >
                                            {reviewLoading ? 'Processing...' : 'Confirm Decision'}
                                          </button>
                                          <button 
                                            onClick={() => { setReviewingId(null); setReviewAction(null); }} 
                                            className="px-6 py-3 rounded-xl border border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest text-zinc-500"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
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

            {/* Pagination Footer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-zinc-50/50 border-t border-zinc-100">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                 Showing {startIndex}-{endIndex} of {total} items
               </span>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg">
                     <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-1">Per Page</span>
                     <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="bg-transparent border-none p-0 text-[10px] font-black uppercase text-zinc-900 focus:ring-0 outline-none cursor-pointer"
                      >
                        {[10, 20, 50, 100].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-400 disabled:opacity-30 transition-all">
                       <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-black text-zinc-900 uppercase px-2">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-400 disabled:opacity-30 transition-all">
                       <ChevronRight size={16} />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
