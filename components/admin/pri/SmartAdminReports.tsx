'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Award, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  X, 
  Activity, 
  FileText, 
  Mail 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface SMARTReport {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  status: string;
  smartScore: number;
  benchmarkPercentile: number;
  readinessLevel: string;
  competencyScores: Record<string, number>;
  skillGapAnalysis: Array<{ domain: string; score: number; benchmark: number }>;
  learningRecommendations: string[];
  totalDurationSeconds: number;
  answers: Array<{
    domainId: string;
    questionId: string;
    questionType: string;
    difficulty: string;
    questionText: string;
    studentAnswer: any;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }>;
  createdAt: string;
}

const DOMAIN_NAMES: Record<string, string> = {
  'computational-thinking': 'Computational Thinking',
  'programming-fundamentals': 'Programming Fundamentals',
  'frontend-engineering': 'Frontend Engineering',
  'backend-engineering': 'Backend Engineering',
  'database-engineering': 'Database Engineering',
  'debugging-quality': 'Debugging & Quality Engineering',
  'system-design': 'System Design & Architecture',
  'ai-augmented': 'AI-Augmented Engineering',
};

export default function SmartAdminReports() {
  const [reports, setReports] = useState<SMARTReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<SMARTReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
      const res = await fetch('/api/smart/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch candidate reports.');
        return;
      }
      setReports(data.reports || []);
    } catch (err) {
      setError('Network error. Failed to retrieve data.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (sec: number) => {
    if (!sec) return '0s';
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const filteredReports = reports.filter((rep) => {
    const matchesSearch = 
      rep.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (scoreFilter === 'high') {
      return matchesSearch && (rep.smartScore >= 800);
    }
    if (scoreFilter === 'mid') {
      return matchesSearch && (rep.smartScore >= 400 && rep.smartScore < 800);
    }
    if (scoreFilter === 'low') {
      return matchesSearch && (rep.smartScore < 400);
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Attempts</span>
            <span className="text-2xl font-black text-slate-900">{reports.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Senior SDE Ready</span>
            <span className="text-2xl font-black text-slate-900">
              {reports.filter(r => r.smartScore >= 800).length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mid SDE Ready</span>
            <span className="text-2xl font-black text-slate-900">
              {reports.filter(r => r.smartScore >= 600 && r.smartScore < 800).length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average SMART Score</span>
            <span className="text-2xl font-black text-slate-900">
              {reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + (r.smartScore || 0), 0) / reports.length) : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate by name or email..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600 transition-all shadow-sm"
          />
        </div>

        {/* Filter Tab */}
        <div className="flex gap-2">
          {['all', 'high', 'mid', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setScoreFilter(f)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                scoreFilter === f
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'all' && 'All Scores'}
              {f === 'high' && 'Senior (>=800)'}
              {f === 'mid' && 'Mid-Level (400-799)'}
              {f === 'low' && 'Needs Training (<400)'}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[250px] shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="text-xs text-slate-500 mt-3 font-semibold">Retrieving assessments records...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center text-red-600 text-sm font-semibold">
          {error}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-sm font-semibold shadow-sm">
          No matching assessment reports found.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Demographics</th>
                  <th className="py-4 px-6 text-center">SMART Score</th>
                  <th className="py-4 px-6 text-center">Duration</th>
                  <th className="py-4 px-6">Completion Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredReports.map((rep) => (
                  <tr key={rep._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-bold">{rep.fullName}</span>
                        <span className="text-[10px] text-blue-600 uppercase tracking-wider font-black mt-0.5">{rep.readinessLevel.split(' (')[0]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-slate-500">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {rep.email}</span>
                        <span className="flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3 text-slate-400" /> {rep.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <span>{rep.gender}, Age {rep.age}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-mono font-bold ${
                        rep.smartScore >= 800 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : rep.smartScore >= 400 
                          ? 'bg-blue-50 text-blue-750 border border-blue-100' 
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {rep.smartScore}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-500 font-mono">
                      {formatDuration(rep.totalDurationSeconds)}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(rep.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedReport(rep)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col relative text-slate-700">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Assessment Detailed Review</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Candidate: {selectedReport.fullName}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8 flex-1">
              
              {/* Demographics & Score summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Overall Score</span>
                  <div className="text-3xl font-black text-slate-900 font-mono">{selectedReport.smartScore}</div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">of 1000</span>
                  <div className="mt-4 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-wider">
                    {selectedReport.readinessLevel}
                  </div>
                </div>

                {/* Demographics details */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:col-span-2 space-y-2.5 text-xs font-semibold">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Candidate Profile</span>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <span className="text-slate-400 text-[10px]">Email</span>
                      <p className="text-slate-800 mt-0.5 font-bold">{selectedReport.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Phone</span>
                      <p className="text-slate-800 mt-0.5 font-bold">{selectedReport.phone}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Age & Gender</span>
                      <p className="text-slate-800 mt-0.5 font-bold">{selectedReport.gender}, {selectedReport.age} years old</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Duration</span>
                      <p className="text-slate-800 mt-0.5 font-bold font-mono">{formatDuration(selectedReport.totalDurationSeconds)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competency Chart */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Competency Map</span>
                <div className="w-full h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedReport.skillGapAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="domain" tick={{ fill: '#475569', fontSize: 8, fontWeight: 'bold' }} tickFormatter={(val) => val.split(' ')[0]} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '10px' }} />
                      <Bar dataKey="score" fill="#2563eb" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="benchmark" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Answers Breakdown */}
              <div className="space-y-4">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Question Level Diagnostics</span>
                
                {selectedReport.answers && selectedReport.answers.length > 0 ? (
                  <div className="space-y-4">
                    {selectedReport.answers.map((ans, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-white px-2.5 py-1 rounded-md text-slate-500 border border-slate-200 uppercase tracking-wider">
                              Q{index + 1}
                            </span>
                            <span className="text-[10px] font-black text-slate-600">
                              {DOMAIN_NAMES[ans.domainId]}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              ({ans.difficulty} | {ans.questionType})
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1 text-slate-400 font-mono"><Clock className="w-3.5 h-3.5 text-slate-400" /> {ans.timeSpentSeconds}s</span>
                            {ans.isCorrect ? (
                              <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-4 h-4 text-emerald-600" /> Correct</span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-650"><XCircle className="w-4 h-4 text-red-650" /> Incorrect</span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs font-bold leading-relaxed text-slate-800">
                          {ans.questionText}
                        </p>

                        <div className="bg-white border border-slate-200/60 p-4 rounded-xl text-xs space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mt-0.5">Submitted:</span>
                            {ans.questionType === 'touchboard' ? (
                              <span className="font-mono text-blue-600">
                                Click Coordinates [X: {ans.studentAnswer?.x ?? 'N/A'}, Y: {ans.studentAnswer?.y ?? 'N/A'}]
                              </span>
                            ) : ans.questionType === 'maq' ? (
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(ans.studentAnswer) ? (
                                  ans.studentAnswer.map((o: string) => (
                                    <span key={o} className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded text-[10px] text-blue-600 uppercase font-black">{o}</span>
                                  ))
                                ) : (
                                  <span className="text-slate-500">{String(ans.studentAnswer || 'None')}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-700 font-semibold">
                                {ans.studentAnswer ? String(ans.studentAnswer) : <span className="text-slate-400 italic">No answer submitted</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                    Detailed answer data is missing for this record.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button 
                onClick={() => setSelectedReport(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-6 rounded-xl cursor-pointer transition-all shadow-sm"
              >
                Close Summary
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
