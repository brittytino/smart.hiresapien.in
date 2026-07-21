'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DOMAIN_MAP, DOMAINS } from '@/lib/domains';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  _id: string;
  uniqueId?: string;
  domain: string;
  subSkill: string;
  assessmentType: string;
  bloomLevel?: string;
  questionType: 'mcq' | 'written';
  questionText: string;
  questionImageUrl?: string;
  caseContext?: string;
  caseContextImageUrl?: string;
  options: { label: string; text: string; score?: number; imageUrl?: string }[];
  correctAnswer?: string;
  explanation?: string;
  explanationImageUrl?: string;
  difficulty: string;
  estimatedTimeMinutes?: number;
  contributorId?: { _id: string; displayName?: string } | string;
  contributorUsername: string;
  status: 'approved';
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
}

interface DomainStat {
  domainId: string;
  count: number;
}

interface ApprovedQuestionBankProps {
  token: string;
}

export default function ApprovedQuestionBank({ token }: ApprovedQuestionBankProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [domainStats, setDomainStats] = useState<DomainStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedSubSkill, setSelectedSubSkill] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchApprovedQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        status: 'approved',
        page: String(page),
        pageSize: String(pageSize),
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      
      if (selectedDomain !== 'all') {
        params.set('domain', selectedDomain);
      }
      if (selectedSubSkill !== 'all') {
        params.set('subSkill', selectedSubSkill);
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
      if (data.domainStats) {
        setDomainStats(data.domainStats);
      }
      if (data.pagination) {
        setTotal(Number(data.pagination.total) || 0);
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [token, selectedDomain, selectedSubSkill, searchQuery, page, pageSize]);

  useEffect(() => {
    fetchApprovedQuestions();
  }, [fetchApprovedQuestions]);

  useEffect(() => {
    setSelectedSubSkill('all');
  }, [selectedDomain]);

  useEffect(() => {
    setPage(1);
  }, [selectedDomain, selectedSubSkill, searchQuery, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(total, page * pageSize);

  const availableSubSkills = useMemo(() => {
    if (selectedDomain === 'all') return [];
    const domainMeta = DOMAIN_MAP[selectedDomain as keyof typeof DOMAIN_MAP];
    if (!domainMeta) return [];
    return Array.from(new Set(domainMeta.skills.map(s => s.split(' - ')[0].trim())));
  }, [selectedDomain]);

  return (
    <div className="flex flex-col w-full">
      <div className="py-4 space-y-6">
        {/* Domain Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {DOMAINS.map((domain) => {
             const stat = domainStats.find(s => s.domainId === domain.id);
             return (
               <div 
                 key={domain.id}
                 className={`p-6 rounded-[28px] border no-hover ${
                   selectedDomain === domain.id 
                   ? 'bg-zinc-900 border-zinc-900 shadow-xl' 
                   : 'bg-white border-zinc-100 shadow-sm'
                 }`}
                 onClick={() => setSelectedDomain(selectedDomain === domain.id ? 'all' : domain.id)}
                 role="button"
               >
                 <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${
                   selectedDomain === domain.id ? 'text-zinc-400' : 'text-zinc-500'
                 }`}>
                   {domain.name.split(' ')[0]}
                 </p>
                 <div className="flex items-end justify-between">
                   <h4 className={`text-2xl font-black tracking-tight ${
                     selectedDomain === domain.id ? 'text-white' : 'text-zinc-900'
                   }`}>
                     {stat?.count || 0}
                   </h4>
                 </div>
               </div>
             );
          })}
        </div>

        <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-sm">
          {/* Filter/Search Header */}
          <div className="p-[15px] border-b border-zinc-100 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">Inventory Explorer</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Question Repository</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm font-bold placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-[#D62027]/5 focus:border-[#D62027]"
                  />
                </div>
                <div className="relative w-full sm:w-48">
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full appearance-none pl-5 pr-10 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs font-black uppercase tracking-widest text-[#D62027] focus:outline-none focus:ring-4 focus:ring-[#D62027]/5 focus:border-[#D62027] cursor-pointer"
                  >
                    <option value="all">Domain: ALL</option>
                    {DOMAINS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D62027]/40 font-black text-[12px]">↓</div>
                </div>
                {selectedDomain !== 'all' && availableSubSkills.length > 0 && (
                  <div className="relative w-full sm:w-48">
                    <select
                      value={selectedSubSkill}
                      onChange={(e) => setSelectedSubSkill(e.target.value)}
                      className="w-full appearance-none pl-5 pr-10 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs font-black uppercase tracking-widest text-[#D62027] focus:outline-none focus:ring-4 focus:ring-[#D62027]/5 focus:border-[#D62027] cursor-pointer"
                    >
                      <option value="all">Subskill: ALL</option>
                      {availableSubSkills.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D62027]/40 font-black text-[12px]">↓</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Content Area */}
          {loading ? (
            <div className="flex items-center justify-center h-[500px] bg-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D62027]"></div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex items-center justify-center h-[500px] text-center bg-white">
              <p className="text-zinc-300 font-black uppercase tracking-widest text-xs">No records matching your filters</p>
            </div>
          ) : (
            <>
              <div className="max-h-[600px] overflow-auto custom-scrollbar no-hover border-b border-zinc-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border-spacing-0">
                    <thead className="sticky top-0 z-20 bg-zinc-50 border-b border-zinc-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Question Content</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Assessment Info</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Key</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contributor</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right pr-12">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 bg-white">
                      {questions.map((q) => {
                        const isExpanded = expandedId === q._id;
                        
                        return (
                          <React.Fragment key={q._id}>
                            <tr 
                              onClick={() => setExpandedId(isExpanded ? null : q._id)}
                              className={`border-b border-zinc-50 no-hover ${
                                isExpanded ? 'bg-zinc-50' : ''
                              }`}
                            >
                              <td className="px-8 py-6 max-w-sm">
                                <p className="text-sm font-bold text-zinc-900 line-clamp-2 leading-relaxed mb-3">
                                  {q.questionText}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-tight">
                                    {q.domain}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-tight">
                                    {q.subSkill}
                                  </span>
                                </div>
                              </td>

                              <td className="px-8 py-6">
                                <div className="flex flex-col gap-2">
                                  <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                                    q.difficulty === 'High' ? 'bg-red-700 text-white' :
                                    q.difficulty === 'Medium' ? 'bg-amber-700 text-white' :
                                    'bg-emerald-700 text-white'
                                  }`}>
                                    {q.difficulty}
                                  </span>
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    {q.questionType} · {q.bloomLevel || 'L1'}
                                  </span>
                                </div>
                              </td>

                              <td className="px-8 py-6 text-center">
                                <span className="inline-flex h-8 px-4 items-center justify-center bg-zinc-900 text-white rounded-xl text-xs font-black">
                                  {q.correctAnswer || '-'}
                                </span>
                              </td>

                              <td className="px-8 py-6">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-zinc-900 uppercase">
                                    {(() => {
                                      const displayName = typeof q.contributorId === 'object' ? q.contributorId?.displayName : null;
                                      if (displayName) return displayName;
                                      if (q.contributorUsername?.toLowerCase() === 'seed_bot') return 'Grad360 AI';
                                      return q.contributorUsername;
                                    })()}
                                  </span>
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {new Date(q.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </td>

                              <td className="px-8 py-6 text-right pr-12">
                                <ChevronDown className={`w-4 h-4 text-zinc-300 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-zinc-50/20 no-hover">
                                <td colSpan={5} className="px-12 py-10 border-t border-zinc-100">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                      {q.caseContext && (
                                        <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                          <p className="text-[9px] font-black text-[#D62027] uppercase tracking-widest mb-3">Scenario Detail</p>
                                          <p className="text-sm font-medium text-zinc-600 leading-relaxed italic">{q.caseContext}</p>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Question Statement</p>
                                        <p className="text-base font-black text-zinc-900 leading-snug">{q.questionText}</p>
                                      </div>
                                      {q.explanation && (
                                        <div className="p-8 rounded-[32px] bg-zinc-900 text-white shadow-2xl relative overflow-hidden">
                                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4 relative z-10">Rational / Model Answer</p>
                                          <p className="text-sm font-medium leading-relaxed text-zinc-300 relative z-10">{q.explanation}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-4">
                                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Answer Visualization Grid</p>
                                      <div className="grid gap-3">
                                        {q.options.map((opt) => (
                                          <div key={opt.label} className={`p-5 rounded-2xl border flex flex-col gap-4 ${opt.label === q.correctAnswer ? 'bg-white border-emerald-500 shadow-md ring-4 ring-emerald-500/5' : 'bg-white border-zinc-100 shadow-sm'}`}>
                                            <div className="flex items-start gap-4">
                                               <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${opt.label === q.correctAnswer ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                                 {opt.label}
                                               </div>
                                               <div className="flex-1">
                                                 <p className={`text-sm font-bold ${opt.label === q.correctAnswer ? 'text-zinc-900' : 'text-zinc-600'}`}>{opt.text}</p>
                                                 {opt.label === q.correctAnswer && (
                                                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-2 block">Correct Response</span>
                                                 )}
                                               </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
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
              </div>

              {/* Pagination footer */}
              <div className="p-6 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Showing {startIndex}-{endIndex} of {total} items
                </p>
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
                    <button 
                      disabled={page === 1} 
                      onClick={() => setPage(p => p - 1)} 
                      className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-400 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-zinc-900 uppercase px-2">
                       Page {page} of {totalPages}
                    </span>
                    <button 
                      disabled={page >= totalPages} 
                      onClick={() => setPage(p => p + 1)} 
                      className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-400 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
