'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/basic/dashboard-layout';
import { UserPlus, Users, LayoutDashboard, ClipboardCheck, Target, Trash2, Edit2, Pencil, Eye, CheckCircle2, Clock, XCircle, ArrowLeft, Search, Award, Zap, GraduationCap, ShieldCheck, ChevronRight, User } from 'lucide-react';
import { INSTITUTION_ADMIN_SIDEBAR_ITEMS } from '@/lib/navigation-constants';
import InstitutionInsights from './insights/InstitutionInsights';
import FacultyDetails from './faculty/FacultyDetails';
import StudentDetails from './student/StudentDetails';
import BatchesDetails from './batches/BatchesDetails';
import BatchInsights from './insights/BatchInsights';
import { useUI } from '@/components/providers/ui-provider';
import { safeParseJson } from '@/lib/api-utils';

function cn(...inputs: Array<string | undefined | null | boolean>) {
  return inputs.filter(Boolean).join(' ');
}

type ManagedRole = 'overview' | 'batches' | 'batch-insights' | 'faculty' | 'student' | 'pri-tests';
type ManagedUserRole = 'faculty' | 'student';

const formatScore = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(Number(num))) return '0';
  // Standardize on 2 decimal places without rounding (truncating) as per report standards
  const val = Number(num);
  return (Math.trunc(val * 100) / 100).toFixed(2);
};

const getDomainColor = (name: string) => {
  const n = (name || '').toUpperCase();
  if (n.includes('COGNITIVE')) return { bg: 'bg-[#FF4B8C]', text: '#FF4B8C' };
  if (n.includes('BUSINESS')) return { bg: 'bg-[#3B82F6]', text: '#3B82F6' };
  if (n.includes('PROBLEM')) return { bg: 'bg-[#A855F7]', text: '#A855F7' };
  if (n.includes('COMMUNICATION')) return { bg: 'bg-[#F97316]', text: '#F97316' };
  if (n.includes('LEADERSHIP')) return { bg: 'bg-[#10B981]', text: '#10B981' };
  if (n.includes('DIGITAL')) return { bg: 'bg-[#06B6D4]', text: '#06B6D4' };
  return { bg: 'bg-[#0f172a]', text: '#fff' };
};

interface ManagedUser {
  _id: string;
  username: string;
  role: ManagedUserRole;
  isActive: boolean;
  fullName?: string;
  studentId?: string;
  batch?: string;
}

interface SharedTest {
  _id: string;
  title: string;
  program: string;
  createdAt: string;
  lifecycleStatus: 'Started' | 'Completed' | 'Evaluated' | 'Results Published';
  canRespond: boolean;
  summary: {
    totalSubmitted: number;
    totalEvaluated: number;
    avgScore: number;
  };
  share: {
    status: 'pending' | 'accepted' | 'rejected';
    examStartDate: string;
    examEndDate: string;
    isResultsPublished?: boolean;
  };
}

export default function InstitutionAdminDashboard() {
  const { confirm, showToast } = useUI();
  const [token] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('institution_admin_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  });
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [sharedTests, setSharedTests] = useState<SharedTest[]>([]);
  const [activeRole, setActiveRole] = useState<ManagedRole>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('active_dashboard_tab') as ManagedRole) || 'overview';
    }
    return 'overview';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('active_dashboard_tab', activeRole);
    }
  }, [activeRole]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editStudentId, setEditStudentId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAcceptSuccessModal, setShowAcceptSuccessModal] = useState(false);
  const [acceptedtest, setAcceptedtest] = useState<SharedTest | null>(null);
  const [isPriLoading, setIsPriLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [priStatusFilter, setPriStatusFilter] = useState<'all' | 'Started' | 'Completed' | 'Evaluated' | 'Results Published'>('all');
  const [insightsData, setInsightsData] = useState<any>(null);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [editBatch, setEditBatch] = useState('');

  useEffect(() => {
    if (!token) {
      window.location.href = '/';
    }
  }, [token]);

  async function loadInsights(authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    try {
      const res = await fetch('/api/institution-admin/insights', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (res.ok) {
        setInsightsData(data);
      }
    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] loadInsights Error:', err);
    }
  }

  async function loadAvailableBatches(authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    try {
      const res = await fetch('/api/institution-admin/batches', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (res.ok) {
        setAvailableBatches(data.batches || []);
      }
    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] loadAvailableBatches Error:', err);
    }
  }

  async function loadUsers(nextRole: ManagedRole, authToken?: string | null) {
    if (nextRole === 'overview' || nextRole === 'pri-tests' || nextRole === 'batches' || nextRole === 'batch-insights') return;
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    setError('');
    try {
      const res = await fetch(`/api/institution-admin/users?role=${nextRole}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to load users');
        return;
      }
      setUsers(data.users ?? []);
    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] loadUsers Error:', err);
      setError('Network error while loading users');
    }
  }

  async function loadSharedTests(authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    setIsPriLoading(true);
    setError('');
    try {
      const res = await fetch('/api/institution-admin/pri-tests', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to load PRI tests');
        return;
      }
      const banks = data.banks ?? [];
      setSharedTests(banks);

    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] loadSharedTests Error:', err);
      setError('Network error while loading PRI tests');
    } finally {
      setIsPriLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    cancelEdit();
    setUsers([]); // Clear stale users when switching tabs
    setSearchTerm(''); // Reset search
    const timer = window.setTimeout(() => {
      if (activeRole === 'pri-tests') {
        void loadSharedTests(token);
        return;
      }
      void loadInsights(token);
      void loadAvailableBatches(token);
      void loadUsers(activeRole, token);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [token, activeRole]);

  // Autorefresh shared tests every 30 seconds
  useEffect(() => {
    if (activeRole !== 'pri-tests' || !token) return;
    const interval = window.setInterval(() => {
      void loadSharedTests(token);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [activeRole, token]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/institution-admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: activeRole,
          username,
          password,
          fullName,
          ...(activeRole === 'student' ? { studentId } : {}),
        }),
      });

      const data: any = await safeParseJson(res);
      if (!res.ok) {
        if (res.status === 403 && data.error === 'Faculty slot limit reached') {
          showToast('Faculty limit reached. Contact Admin to increase slots.', 'error');
          setError('Faculty slot limit reached');
          return;
        }

        if (res.status === 403 && data.error === 'Student slot limit reached') {
          showToast('Student limit reached. Contact Admin to increase slots.', 'error');
          setError('Student slot limit reached');
          return;
        }

        setError(data.error ?? 'Failed to create user');
        return;
      }

      setUsername('');
      setPassword('');
      setFullName('');
      setStudentId('');
      setShowCreateForm(false);
      if (activeRole !== 'overview') {
        await loadUsers(activeRole);
      }
    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] handleCreate Error:', err);
      setError('Network error while creating user');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestResponse(bankId: string, action: 'accept' | 'reject') {
    if (!token) return;

    setError('');
    try {
      const res = await fetch(`/api/institution-admin/pri-tests/${bankId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to update PRI test status');
        return;
      }

      if (action === 'accept') {
        const test = sharedTests.find((t) => t._id === bankId);
        if (test) {
          setAcceptedtest(test);
          setShowAcceptSuccessModal(true);
        }
      }

      await loadSharedTests();
    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] handleTestResponse Error:', err);
      setError('Network error while updating PRI test status');
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;

    const confirmed = await confirm({
      title: 'Delete User Account',
      message: 'Are you sure you want to permanently remove this user and all associated data? This action cannot be undone.',
      confirmLabel: 'Delete Data',
      cancelLabel: 'Keep User',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/institution-admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete user');
        return;
      }
      if (activeRole !== 'overview') {
        await loadUsers(activeRole);
      }
    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] handleDelete Error:', err);
      setError('Network error while deleting user');
    }
  }

  function startEdit(user: ManagedUser) {
    setEditingUserId(user._id);
    setEditUsername(user.username);
    setEditFullName(user.fullName ?? '');
    setEditStudentId(user.studentId ?? '');
    setEditBatch(user.batch ?? '');
    setEditPassword('');
    setEditIsActive(user.isActive);
    setError('');
  }

  function cancelEdit() {
    setEditingUserId(null);
    setEditUsername('');
    setEditFullName('');
    setEditStudentId('');
    setEditBatch('');
    setEditPassword('');
    setEditIsActive(true);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingUserId) return;

    setLoading(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        username: editUsername,
        fullName: editFullName,
        isActive: editIsActive,
        batch: editBatch,
      };

      if (activeRole === 'student') {
        payload.studentId = editStudentId;
      }

      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      const res = await fetch(`/api/institution-admin/users/${editingUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to update user');
        return;
      }

      cancelEdit();
      if (activeRole !== 'overview') {
        await loadUsers(activeRole);
      }
    } catch (err: any) {
      console.error('[InstitutionAdminDashboard] handleUpdate Error:', err);
      setError('Network error while updating user');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('institution_admin_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_role');
    window.location.href = '/';
  }

  function handleBack() {
    if (selectedFacultyId) {
      setSelectedFacultyId(null);
    } else if (selectedStudentId) {
      setSelectedStudentId(null);
    } else if (editingUserId) {
      cancelEdit();
    } else if (showCreateForm) {
      setShowCreateForm(false);
    } else {
      window.history.back();
    }
  }

  if (!token) return null;

  const sidebarItems = INSTITUTION_ADMIN_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: activeRole === item.tab,
    onClick: item.tab ? () => {
      setActiveRole(item.tab as ManagedRole);
      // Reset details view when switching tabs
      setShowCreateForm(false);
      setSelectedFacultyId(null);
      setSelectedStudentId(null);
    } : undefined,
  }));

  const headerActions = null;

  const institutionLifecycleStages: SharedTest['lifecycleStatus'][] = [
    'Started',
    'Completed',
    'Evaluated',
    'Results Published',
  ];

  return (
    <DashboardLayout 
      userType="Institution Admin" 
      username={insightsData?.user?.fullName || insightsData?.user?.username || 'Institution Admin'}
      onLogout={handleLogout} 
      sidebarItems={sidebarItems}
      onBack={handleBack}
      isBlurred={showAcceptSuccessModal}
      headerTitle={
        activeRole === 'overview' ? 'Institution Overview' : 
        activeRole === 'batches' ? 'Batch Management' :
        activeRole === 'pri-tests' ? 'PRI Management' :
        activeRole === 'faculty' ? 'Faculty Management' : 
        'Student Management'
      }
      headerSubtitle={
        activeRole === 'overview' ? 'Real-Time Academic & Performance Analytics' : 
        activeRole === 'batches' ? 'Manage student batches and cohorts' :
        activeRole === 'pri-tests' ? 'Manage shared PRI tests' :
        activeRole === 'faculty' ? 'Manage your academic staff' : 
        'Student Management'
      }
      headerActions={headerActions || null}
      institutionName={insightsData?.user?.institutionName}
    >
      {showAcceptSuccessModal && acceptedtest && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-100 animate-in zoom-in-95 duration-400">
            <div className="relative h-32 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 animate-in zoom-in-50 duration-500 delay-200">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <div className="p-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Success Confirmation</p>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-4">PRI Test Accepted</h3>
              
              <div className="bg-zinc-50 rounded-2xl p-6 mb-8 border border-zinc-100 text-left">
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Test Title</p>
                  <p className="font-black text-zinc-800 text-lg tracking-tight">{acceptedtest.title}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Examination Window</p>
                  <div className="flex items-center gap-2 text-zinc-700 font-bold text-sm">
                    <Clock className="w-4 h-4 text-[#D62027]" />
                    <span>{new Date(acceptedtest.share.examStartDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    <span className="text-zinc-300 mx-1">→</span>
                    <span>{new Date(acceptedtest.share.examEndDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs font-medium text-zinc-500 mb-8 px-4 leading-relaxed">
                The test has been successfully integrated into your institution's schedule. Students will be able to access it during the window specified.
              </p>

              <button
                onClick={() => {
                  setShowAcceptSuccessModal(false);
                  setAcceptedtest(null);
                }}
                className="w-full rounded-2xl bg-black text-white py-4 text-xs font-black uppercase tracking-[0.15em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {error && (
          <div className="bg-red-50 border border-red-100 text-[#D62027] text-xs px-5 py-4 rounded-2xl flex items-center gap-3">
             <p className="font-bold uppercase tracking-tight">{error}</p>
          </div>
        )}

        {activeRole === 'overview' && !selectedFacultyId && !selectedStudentId && (
           <InstitutionInsights token={token} />
        )}

        {activeRole === 'batches' && (
          <BatchesDetails token={token} />
        )}

        {activeRole === 'batch-insights' && (
          <BatchInsights token={token} />
        )}

        {activeRole === 'faculty' && selectedFacultyId && (
          <FacultyDetails 
            token={token} 
            facultyId={selectedFacultyId} 
            onBack={() => setSelectedFacultyId(null)} 
          />
        )}

        {selectedStudentId && (
          <StudentDetails 
            token={token} 
            studentId={selectedStudentId} 
            onBack={() => setSelectedStudentId(null)} 
          />
        )}

        {activeRole === 'pri-tests' && (
          <>
            {/* PRI Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-[20px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Total PRI Tests</p>
                <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">{sharedTests.length}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scheduled Exams</p>
              </div>

              <div className="bg-white rounded-[20px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Total Evaluated</p>
                <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
                  {sharedTests.reduce((acc, t) => acc + t.summary.totalEvaluated, 0)}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Processed Records</p>
              </div>

              <div className="bg-white rounded-[20px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Results Published</p>
                <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
                  {sharedTests.filter(t => t.share?.isResultsPublished).length}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Released Portals</p>
              </div>
            </div>

            <div className="g360-card overflow-hidden">
              {/* PRI Card Header with Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-[15px] border-b border-zinc-50 bg-white">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-zinc-900 uppercase leading-none mb-1">Shared PRI Management</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Manage shared PRI tests</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-64 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
                    <input
                      type="text"
                      placeholder="Search PRI tests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none"
                    />
                  </div>
                  <select
                    value={priStatusFilter}
                    onChange={(e) => setPriStatusFilter(e.target.value as any)}
                    className="bg-zinc-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-600 focus:ring-2 focus:ring-[#D62027]/10 outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="Started">Started</option>
                    <option value="Completed">Completed</option>
                    <option value="Evaluated">Evaluated</option>
                    <option value="Results Published">Results Published</option>
                  </select>
                </div>
              </div>

              <div className="overflow-auto max-h-[600px] custom-scrollbar no-hover">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-zinc-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Test Details</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Analytics</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Lifecycle</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {isPriLoading ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-10 h-10 rounded-full border-4 border-zinc-200 border-t-[#D62027] animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading PRI Tests...</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sharedTests.filter(t => {
                        const q = searchTerm.toLowerCase();
                        const matchesSearch = t.title.toLowerCase().includes(q) || t.program.toLowerCase().includes(q);
                        const matchesFilter = priStatusFilter === 'all' || t.lifecycleStatus === priStatusFilter;
                        return matchesSearch && matchesFilter;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <p className="text-zinc-300 font-black uppercase tracking-widest text-xs">No records matching your filters</p>
                          </td>
                        </tr>
                      ) : (
                        sharedTests.filter(t => {
                          const q = searchTerm.toLowerCase();
                          const matchesSearch = t.title.toLowerCase().includes(q) || t.program.toLowerCase().includes(q);
                          const matchesFilter = priStatusFilter === 'all' || t.lifecycleStatus === priStatusFilter;
                          return matchesSearch && matchesFilter;
                        }).map((test) => (
                          <tr key={test._id} className="no-hover">
                            <td className="px-8 py-5">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 leading-none mb-1">{test.program}</p>
                                <p className="text-sm font-black text-zinc-900 tracking-tight leading-none mb-2">{test.title}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                  {new Date(test.share.examStartDate).toLocaleDateString()} - {new Date(test.share.examEndDate).toLocaleDateString()}
                                </p>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                  Submissions: {test.summary.totalSubmitted}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                  Evaluated: {test.summary.totalEvaluated}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                  Avg Score: {test.summary.avgScore}%
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-2">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded w-max",
                                  test.lifecycleStatus === 'Results Published' ? "bg-emerald-600 text-white" : "bg-black text-white"
                                )}>
                                  {test.lifecycleStatus}
                                </span>
                                <div className="flex gap-0.5">
                                  {institutionLifecycleStages.map((stage, idx) => {
                                    const currentIndex = institutionLifecycleStages.indexOf(test.lifecycleStatus);
                                    const reached = idx <= currentIndex;
                                    return (
                                      <div key={stage} className={`w-3 h-1 rounded-full ${reached ? 'bg-black' : 'bg-zinc-100'}`} title={stage} />
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                {test.canRespond && (
                                  <>
                                    <button
                                      onClick={() => handleTestResponse(test._id, 'accept')}
                                      className="rounded-lg bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleTestResponse(test._id, 'reject')}
                                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {test.share?.status === 'accepted' && (
                                  <button
                                    onClick={async () => {
                                      if (!token) return;
                                      const isPub = test.share?.isResultsPublished;
                                      try {
                                        const res = await fetch(`/api/institution-admin/pri-tests/${test._id}/publish`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                          body: JSON.stringify({ publish: !isPub }),
                                        });
                                        const data: any = await safeParseJson(res);
                                        if (!res.ok) { showToast(data.error ?? 'Action failed', 'error'); return; }
                                        await loadSharedTests();
                                      } catch (err) {
                                        showToast('Network error', 'error');
                                      }
                                    }}
                                    className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${
                                      test.share?.isResultsPublished 
                                      ? 'bg-zinc-100 text-zinc-600' 
                                      : 'bg-[#D62027] text-white hover:bg-[#b01a1f]'
                                    }`}
                                  >
                                    {test.share?.isResultsPublished ? 'Unpublish' : 'Publish Solution'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {(activeRole === 'student' || activeRole === 'faculty') && (
          <>
            {showCreateForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border-t-8 border-[#D62027] animate-in zoom-in-95 duration-300">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 leading-none mb-1">Create {activeRole === 'faculty' ? 'Faculty' : 'Student'} Account</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Provision new academic credentials</p>
                      </div>
                      <button onClick={() => setShowCreateForm(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 p-2.5 rounded-full hover:rotate-90 duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                    <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Username</label>
                        <input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          placeholder="e.g. jsmith24"
                          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Initial Password</label>
                         <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          type="password"
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Identity Name</label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Smith"
                          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
                        />
                      </div>
                      {activeRole === 'student' && (
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Student Identifier</label>
                          <input
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                            placeholder="ST-2024-XXX"
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
                          />
                        </div>
                      )}
                      <div className="md:col-span-2 pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-xl bg-black text-white px-6 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : `Provision ${activeRole} Account`}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Row for Management */}
            {(activeRole === 'student' || activeRole === 'faculty') && insightsData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Total {activeRole === 'faculty' ? 'Faculties' : 'Students'}</p>
                  <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
                    {activeRole === 'faculty' ? insightsData.stats.faculty.total : insightsData.stats.students.total}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Profiles</p>
                </div>
                
                <div className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Total {activeRole === 'faculty' ? 'Faculty' : 'Student'} Badges</p>
                  <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
                    {activeRole === 'faculty' ? insightsData.stats.faculty.limit : insightsData.stats.students.limit}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Allocated Slots</p>
                </div>

                <div className="bg-white rounded-[28px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Unallocated Slots</p>
                  <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">
                    {activeRole === 'faculty' 
                      ? (insightsData.stats.faculty.limit - insightsData.stats.faculty.total) 
                      : (insightsData.stats.students.limit - insightsData.stats.students.total)}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Remaining Capacity</p>
                </div>
              </div>
            )}

            <div className="g360-card overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 border-b border-zinc-50 bg-white">
                 <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black tracking-tight text-zinc-900 uppercase leading-none mb-1">
                          Active {activeRole === 'faculty' ? 'Faculty' : 'Students'}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                        Manage your institution's {activeRole} profiles
                      </p>
                    </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
                      <input 
                        type="text"
                        placeholder={`Search ${activeRole}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none"
                      />
                    </div>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as any)}
                      className="bg-zinc-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-600 focus:ring-2 focus:ring-[#D62027]/10 outline-none cursor-pointer"
                    >
                      <option value="all">All Profiles</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                    {headerActions}
                 </div>
              </div>
              
              <div className="overflow-auto max-h-[600px] custom-scrollbar no-hover">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="bg-zinc-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Candidate</th>
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Batch</th>
                      {activeRole === 'student' && (
                        <>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Readiness</th>
                          <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100">Skill Split</th>
                        </>
                      )}
                      <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {users.filter(u => {
                      const q = searchTerm.toLowerCase();
                      const matchesSearch = u.username.toLowerCase().includes(q) || 
                                          (u.fullName || '').toLowerCase().includes(q) ||
                                          (u.studentId || '').toLowerCase().includes(q);
                      const matchesFilter = userStatusFilter === 'all' || 
                                          (userStatusFilter === 'active' ? u.isActive : !u.isActive);
                      return matchesSearch && matchesFilter;
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={activeRole === 'student' ? 5 : 3} className="px-8 py-20 text-center">
                          <p className="text-zinc-300 font-black uppercase tracking-widest text-xs">No records matching your filters</p>
                        </td>
                      </tr>
                    ) : (
                      users.filter(u => {
                        const q = searchTerm.toLowerCase();
                        const matchesSearch = u.username.toLowerCase().includes(q) || 
                                            (u.fullName || '').toLowerCase().includes(q) ||
                                            (u.studentId || '').toLowerCase().includes(q);
                        const matchesFilter = userStatusFilter === 'all' || 
                                            (userStatusFilter === 'active' ? u.isActive : !u.isActive);
                        return matchesSearch && matchesFilter;
                      }).map((user: any) => (
                        <tr 
                          key={user._id} 
                          className="border-b border-zinc-50/50 hover:bg-zinc-50/30 transition-colors cursor-pointer group"
                          onClick={() => {
                            if (activeRole === 'faculty') setSelectedFacultyId(user._id);
                            else if (activeRole === 'student') setSelectedStudentId(user._id);
                            else startEdit(user);
                          }}
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                               <div className="w-11 h-11 rounded-full flex items-center justify-center bg-zinc-100 shrink-0 border-[2.5px] border-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300 ring-1 ring-zinc-100/50">
                                <User className="w-5 h-5 text-zinc-500" strokeWidth={2.5} />
                              </div>
                              <div>
                                <p className="font-black text-zinc-900 uppercase tracking-tight text-sm leading-none mb-1 group-hover:text-[#D62027] transition-colors">
                                  {user.fullName || user.username}
                                </p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                  {user.studentId || 'ID Pending'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">
                               {user.batch || 'No Batch'}
                             </span>
                          </td>
                          {activeRole === 'student' && (
                            <>
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3 min-w-[120px]">
                                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-1000 ${
                                        (user.latestPriScore || 0) >= 80 ? 'bg-emerald-500' :
                                        (user.latestPriScore || 0) >= 60 ? 'bg-amber-400' :
                                        'bg-[#D62027]'
                                      }`}
                                      style={{ width: `${user.latestPriScore || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-[11px] font-black text-zinc-900 tabular-nums min-w-[45px]">
                                    {formatScore(user.latestPriScore)}%
                                  </span>
                                </div>
                              </td>
                            </>
                          )}
                          {activeRole === 'student' && (
                            <td className="px-8 py-5">
                             <div className="flex items-center gap-1.5 flex-wrap">
                               {(user.skillSplit || []).length > 0 ? (
                                 user.skillSplit.map((skill: any, idx: number) => {
                                   const colors = getDomainColor(skill.name);
                                   const displayScore = formatScore(skill.score);
                                   return (
                                     <div 
                                       key={idx}
                                       className="relative group/skill"
                                     >
                                       <div 
                                         className={`min-w-[32px] h-8 px-1.5 rounded-md ${colors.bg} text-white flex items-center justify-center text-[10px] font-black shadow-sm cursor-help transition-all hover:scale-110 hover:shadow-lg`}
                                       >
                                         {displayScore}
                                       </div>
                                       {/* Hover Reveal Tip */}
                                       <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#0a0a0a] text-white text-[9px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover/skill:opacity-100 transition-all duration-200 z-[100] shadow-2xl border border-white/10 -translate-y-2 group-hover/skill:translate-y-0 text-center min-w-[140px]">
                                          <p className="text-[11px] font-black tracking-tighter mb-0.5" style={{ color: colors.text }}>
                                            SCORE: {displayScore}%
                                          </p>
                                          <p className="leading-tight opacity-70">{skill.name}</p>
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-[#0a0a0a]" />
                                       </div>
                                     </div>
                                   );
                                 })
                               ) : (
                                 <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest leading-none bg-zinc-50 px-2 py-1.5 rounded-md">No Data</span>
                                )}
                              </div>
                           </td>
                          )}
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeRole === 'faculty') setSelectedFacultyId(user._id);
                                  else if (activeRole === 'student') setSelectedStudentId(user._id);
                                }}
                                className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-[#D62027] hover:border-[#D62027]/30 transition-all"
                                title="View Insights"
                              >
                                <Eye className="w-4 h-4" strokeWidth={2.5} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(user);
                                }}
                                className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all"
                                title="Edit profile"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(user._id);
                                }}
                                className="rounded-lg border border-red-100 bg-white p-2 text-red-400 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                                title="Delete account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>
            </div>

            {editingUserId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border-t-8 border-[#D62027] animate-in zoom-in-95 duration-300">
                  <div className="p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 leading-none mb-1">Modify {activeRole === 'faculty' ? 'Faculty' : 'Student'} Profile</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Update account identity and access status</p>
                      </div>
                      <button onClick={cancelEdit} className="text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 p-2.5 rounded-full hover:rotate-90 duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                    <form onSubmit={handleUpdate} className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Username</label>
                        <input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          required
                          placeholder="Username"
                          className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-sm focus:ring-4 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-bold placeholder:text-zinc-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Identity Name</label>
                        <input
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          placeholder="Full Name (optional)"
                          className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-sm focus:ring-4 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-bold placeholder:text-zinc-300"
                        />
                      </div>
                      {activeRole === 'student' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Student Identifier</label>
                          <input
                            value={editStudentId}
                            onChange={(e) => setEditStudentId(e.target.value)}
                            required
                            placeholder="Student ID"
                            className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-sm focus:ring-4 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-bold placeholder:text-zinc-300"
                          />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Privacy Override (New Password)</label>
                        <input
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          type="password"
                          placeholder="Leave blank to keep existing"
                          className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-sm focus:ring-4 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-bold placeholder:text-zinc-300"
                        />
                      </div>

                      {activeRole === 'student' && (
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                            Academic Batch
                          </label>
                          <select
                            value={editBatch}
                            onChange={(e) => setEditBatch(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-200 px-5 py-4 text-sm focus:ring-4 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-bold bg-white"
                          >
                            <option value="">Select a batch</option>
                            {availableBatches.map((b) => (
                              <option key={b._id} value={b.name}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className="md:col-span-2 py-4 border-y border-zinc-50 my-2">
                        <label className="flex items-center gap-4 cursor-pointer group w-max">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={editIsActive}
                              onChange={(e) => setEditIsActive(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D62027] border border-zinc-200 peer-checked:border-[#D62027]"></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-zinc-900 uppercase tracking-widest leading-none mb-0.5">Account Status</span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest transition-colors peer-checked:text-emerald-500">
                              {editIsActive ? 'Active & Accessible' : 'Restricted / Inactive'}
                            </span>
                          </div>
                        </label>
                      </div>

                      <div className="md:col-span-2 flex gap-4 mt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 rounded-2xl bg-black text-white px-8 py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98] disabled:opacity-50"
                        >
                          {loading ? 'COMMITTING CHANGES...' : 'COMMIT CHANGES'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-10 rounded-2xl bg-zinc-100 text-zinc-500 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-200 hover:text-zinc-900 transition-all active:scale-[0.98]"
                        >
                          DISCARD
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
