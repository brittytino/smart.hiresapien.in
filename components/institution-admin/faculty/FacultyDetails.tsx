'use client';

import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  Activity, 
  ShieldCheck,
  User,
  Clock,
  Layers,
  Check,
  XCircle
} from 'lucide-react';

interface FacultyInsights {
  user: {
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  insights: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  recentActivity: Array<{
    domain: string;
    subSkill: string;
    status: string;
    createdAt: string;
    questionText: string;
    _id: string;
  }>;
}

interface FacultyDetailsProps {
  token: string;
  facultyId: string;
  onBack: () => void;
}

export default function FacultyDetails({ token, facultyId, onBack }: FacultyDetailsProps) {
  const [data, setData] = useState<FacultyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch(`/api/institution-admin/users/${facultyId}/insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to fetch insights');
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [token, facultyId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#D62027] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Faculty Intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-[#D62027] rounded-3xl border border-red-100 flex flex-col items-center gap-4">
        <XCircle className="w-10 h-10" />
        <p className="font-black uppercase tracking-widest text-sm">{error}</p>
        <button onClick={onBack} className="text-xs font-bold underline">Go Back</button>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Lifetime Submissions',
      value: data.insights.total,
      bg: 'bg-white',
    },
    {
      label: 'Approved Content',
      value: data.insights.approved,
      bg: 'bg-white',
    },
    {
      label: 'Pending Review',
      value: data.insights.pending,
      bg: 'bg-white',
    },
    {
      label: 'Revision Required',
      value: data.insights.rejected,
      bg: 'bg-white',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header Profile Card */}
      <div className="g360-card p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 className="w-32 h-32" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-zinc-900 rounded-4xl flex items-center justify-center shadow-xl shadow-zinc-900/20">
              <User className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tight leading-none">
                  {data.user.fullName || data.user.username}
                </h3>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${data.user.isActive ? 'bg-emerald-700 text-white border border-emerald-800' : 'bg-red-50 text-[#D62027] border border-red-100'}`}>
                  {data.user.isActive ? 'Active Node' : 'Suspended'}
                </span>
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Faculty Member • @{data.user.username}
              </p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Directory
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.bg} rounded-[28px] p-7 border border-zinc-100 flex flex-col justify-center min-h-[160px] relative no-hover`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
              {stat.label}
            </p>
            <h3 className="text-5xl font-black tracking-tighter text-zinc-900 leading-none">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-[#0f172a] rounded-[32px] p-8 md:p-10 shadow-2xl">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Activity className="w-6 h-6 text-[#D62027]" strokeWidth={2.5} />
              Submission Pipeline
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live tracking of content contributions</p>
          </div>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-auto custom-scrollbar pr-2">
          {data.recentActivity.map((item) => (
            <div 
              key={item._id} 
              className="flex items-center justify-between p-6 rounded-2xl bg-[#1e293b] border border-[#334155]/30 group no-hover"
            >
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-white font-bold text-sm tracking-tight line-clamp-1 mb-1">
                    {item.questionText}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-400">{item.domain} / {item.subSkill}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span className={`${
                      item.status === 'approved' ? 'text-emerald-500' :
                      item.status === 'rejected' ? 'text-red-500' :
                      'text-[#D62027]'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}

          {data.recentActivity.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
              <Activity className="w-12 h-12 text-slate-500 mb-4" strokeWidth={1.5} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">No recent submissions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
