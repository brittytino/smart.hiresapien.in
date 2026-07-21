'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/basic/dashboard-layout';
import { safeParseJson } from '@/lib/api-utils';
import { LayoutDashboard } from 'lucide-react';
import { FACULTY_SIDEBAR_ITEMS } from '@/lib/navigation-constants';
import FacultyInsights from './FacultyInsights';
import FacultyStudentInsights from './FacultyStudentInsights';
import BatchInsights from '../institution-admin/insights/BatchInsights';

type ManagedRole = 'overview' | 'students' | 'batch-insights';

const getDomainColor = (name: string) => {
  const n = (name || '').toUpperCase();
  if (n.includes('COGNITIVE')) return { bg: 'bg-[#E11D48]', text: '#FF4D8D' };
  if (n.includes('BUSINESS')) return { bg: 'bg-[#1D4ED8]', text: '#3B82F6' };
  if (n.includes('PROBLEM')) return { bg: 'bg-[#7E22CE]', text: '#A855F7' };
  if (n.includes('COMMUNICATION')) return { bg: 'bg-[#C2410C]', text: '#F97316' };
  if (n.includes('LEADERSHIP')) return { bg: 'bg-[#047857]', text: '#10B981' };
  if (n.includes('DIGITAL')) return { bg: 'bg-[#0E7490]', text: '#06B6D4' };
  return { bg: 'bg-[#0f172a]', text: '#fff' };
};





export default function FacultyDashboard() {
  const [token] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('faculty_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  });
  const [activeRole, setActiveRole] = useState<ManagedRole>('overview');
  const [facultyProfile, setFacultyProfile] = useState<{ fullName: string; username: string } | null>(null);

  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  async function loadFacultyProfile(authToken: string) {
    try {
      const res = await fetch('/api/faculty/insights', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await safeParseJson(res) as any;
      if (res.ok) {
        if (data.user) setFacultyProfile(data.user);
        if (data.assignedBatches) {
          setAvailableBatches(data.assignedBatches);
          // If only one batch, select it automatically
          if (data.assignedBatches.length === 1 && !selectedBatch) {
            setSelectedBatch(data.assignedBatches[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load faculty profile:', e);
    }
  }

  useEffect(() => {
    if (token) {
        void loadFacultyProfile(token);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      window.location.href = '/';
    }
  }, [token]);


  function handleLogout() {
    sessionStorage.removeItem('faculty_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_role');
    window.location.href = '/';
  }

  const sidebarItems = FACULTY_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: activeRole === item.tab,
    onClick: () => setActiveRole(item.tab as ManagedRole),
  }));


  if (!token) return null;

  return (
    <DashboardLayout
      userType="Faculty"
      username={facultyProfile?.fullName || facultyProfile?.username || 'Faculty'}
      onLogout={handleLogout}
      sidebarItems={sidebarItems}
      headerTitle={
        activeRole === 'overview' 
          ? 'Faculty Overview' 
          : activeRole === 'students' 
            ? 'Student PRI Insights' 
            : 'Batch Analytics'
      }
      headerSubtitle={
        activeRole === 'overview'
          ? 'Real-time student insights and performance analytics'
          : activeRole === 'students'
            ? 'Domain scores, AI insights, and PRI report access'
            : 'Evaluation success metrics and AI cohort analysis'
      }
      institutionName={(facultyProfile as any)?.institutionName}
      sidebarExtras={
        availableBatches.length > 0 ? (
          <div className="flex flex-col gap-3">
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">Select Active Batch</p>
             <div className="relative group">
               <select
                 value={selectedBatch}
                 onChange={(e) => setSelectedBatch(e.target.value)}
                 className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-[13px] font-black text-zinc-900 focus:outline-none focus:ring-4 focus:ring-red-500/5 hover:border-zinc-200 transition-all cursor-pointer appearance-none uppercase tracking-tight shadow-sm"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                   backgroundRepeat: 'no-repeat',
                   backgroundPosition: 'right 20px center',
                   backgroundSize: '16px'
                 }}
               >
                 <option value="">ALL BATCHES</option>
                 {availableBatches.map(batch => (
                   <option key={batch} value={batch}>{batch}</option>
                 ))}
               </select>
             </div>
          </div>
        ) : (
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col gap-2">
             <p className="text-[10px] font-black text-[#D62027] uppercase tracking-widest leading-none">Status Alert</p>
             <p className="text-[11px] font-bold text-[#D62027]/70 uppercase tracking-tight leading-relaxed">No batch assigned to your profile yet.</p>
          </div>
        )
      }
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {availableBatches.length === 0 && (
          <div className="bg-white border border-zinc-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
             <div className="space-y-2">
               <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Access Restricted</h2>
               <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs max-w-md mx-auto leading-relaxed">
                 You haven't been assigned any batches yet. Please contact your Institution Admin to gain access to student data.
               </p>
             </div>
          </div>
        )}

        {availableBatches.length > 0 && activeRole === 'overview' && (
          <FacultyInsights 
            token={token} 
            selectedBatch={selectedBatch} 
          />
        )}

        {availableBatches.length > 0 && activeRole === 'students' && (
          <FacultyStudentInsights 
            token={token} 
            selectedBatch={selectedBatch} 
          />
        )}

        {availableBatches.length > 0 && activeRole === 'batch-insights' && (
          <BatchInsights 
            token={token} 
            apiUrl="/api/faculty/batches/insights" 
            canGenerate={false}
          />
        )}


      </div>
    </DashboardLayout>
  );
}
