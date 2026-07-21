'use client';

import React, { useState, useEffect } from 'react';
import { Target, Calendar, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/basic/dashboard-layout';
import { INSTITUTION_ADMIN_SIDEBAR_ITEMS } from '@/lib/navigation-constants';
import { useUI } from '@/components/providers/ui-provider';

export default function PsychometricAssignmentPage() {
  const { showToast, confirm } = useUI();
  const router = useRouter();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Auth state
  const [adminUser, setAdminUser] = useState('Admin');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('institution_admin_token') || sessionStorage.getItem('auth_token');
    if (!t) {
      router.push('/');
      return;
    }
    setToken(t);
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      setAdminUser(payload.username || 'Inst-Admin');
    } catch (e) {}
  }, [router]);

  const fetchAssignment = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/institution-admin/psychometric', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAssignment(data.assignment);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAssignment();
    }
  }, [token]);

  const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
    if (status === 'accepted' && (!startDate || !endDate)) {
      showToast('Please set start and end dates before accepting.', 'error');
      return;
    }

    if (status === 'rejected') {
      const confirmed = await confirm({
        title: 'Discard Assignment',
        message: 'Are you sure you want to discard this psychometric assessment? This action will remove it from your pending list.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep Pending',
        variant: 'danger'
      });
      if (!confirmed) return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/institution-admin/psychometric/${assignment._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          examStartDate: status === 'accepted' ? startDate : undefined,
          examEndDate: status === 'accepted' ? endDate : undefined,
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      
      showToast(status === 'accepted' ? 'Assessment deployed successfully!' : 'Assignment discarded.', 'success');
      await fetchAssignment();
    } catch (err: any) {
      showToast(err.message || 'Failed to update assignment', 'error');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('institution_admin_token');
    sessionStorage.removeItem('auth_token');
    router.push('/');
  };

  const sidebarItems = INSTITUTION_ADMIN_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: item.href === '/institution-admin/psychometric',
    href: item.href || (item.tab === 'overview' ? '/institution-admin' : `/institution-admin?tab=${item.tab}`),
  }));

  if (loading && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <Loader2 className="w-10 h-10 animate-spin text-[#D62027]" />
      </div>
    );
  }

  return (
    <DashboardLayout
      userType="Institution Admin"
      username={adminUser}
      onLogout={handleLogout}
      sidebarItems={sidebarItems}
      headerTitle="Psychometric Module"
      headerSubtitle="Review and schedule assessment deployments."
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {error && (
          <div className="bg-red-50 text-[#D62027] p-6 rounded-2xl mb-8 border border-red-100 font-bold text-sm">
            {error}
          </div>
        )}

        {!assignment ? (
          <div className="g360-card p-12 text-center text-zinc-400 font-bold italic">
            No psychometric tests have been assigned to your institution yet.
          </div>
        ) : (
          <div className="g360-card p-10 border-l-4 border-l-[#D62027]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-zinc-50 gap-6">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tight uppercase">Professional Portfolio Assessment</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Deployed by Global Command</span>
                  <div className="h-1 w-1 bg-zinc-300 rounded-full"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-2 py-0.5 rounded italic">@{assignment.assignedBy}</span>
                </div>
              </div>
              
              <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-sm border ${
                assignment.status === 'accepted' ? 'bg-green-50 border-green-100 text-green-600' :
                assignment.status === 'rejected' ? 'bg-red-50 border-red-100 text-[#D62027]' :
                'bg-amber-50 border-amber-100 text-amber-600'
              }`}>
                {assignment.status === 'pending' && <Clock className="w-4 h-4 mr-2" strokeWidth={3} />}
                {assignment.status === 'accepted' && <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={3} />}
                {assignment.status === 'rejected' && <XCircle className="w-4 h-4 mr-2" strokeWidth={3} />}
                {assignment.status}
              </span>
            </div>

            <div className="bg-zinc-50/50 p-8 rounded-2xl border border-zinc-100 mb-8">
              <h3 className="text-sm font-black mb-6 uppercase tracking-widest text-zinc-400">Schedule Active Window</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Assessment Start (Live)</label>
                  <input
                    type="datetime-local"
                    disabled={assignment.status === 'accepted'}
                    className="w-full border-zinc-200 rounded-xl p-4 border bg-white focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] font-medium text-sm transition-all disabled:opacity-60 disabled:bg-zinc-50"
                    value={startDate || (assignment.examStartDate ? new Date(assignment.examStartDate).toISOString().slice(0, 16) : '')}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Assessment End (Expiry)</label>
                  <input
                    type="datetime-local"
                    disabled={assignment.status === 'accepted'}
                    className="w-full border-zinc-200 rounded-xl p-4 border bg-white focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] font-medium text-sm transition-all disabled:opacity-60 disabled:bg-zinc-50"
                    value={endDate || (assignment.examEndDate ? new Date(assignment.examEndDate).toISOString().slice(0, 16) : '')}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {assignment.status === 'pending' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={loading}
                  className="flex-1 bg-black text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center shadow-xl hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={3} />
                  Authorize & Deploy
                </button>
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={loading}
                  className="flex-1 bg-white text-zinc-400 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-zinc-200 hover:border-[#D62027] hover:text-[#D62027] active:scale-95 disabled:opacity-50"
                >
                  Discard Assignment
                </button>
              </div>
            )}
            
            {assignment.status === 'accepted' && (
              <div className="mt-4 p-5 bg-green-50/50 border border-green-100 rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-6 h-6" strokeWidth={3} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-green-700 uppercase tracking-widest leading-none mb-1">Module Live</p>
                    <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-widest">
                      The assessment registry is now operational for your student node.
                    </p>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
