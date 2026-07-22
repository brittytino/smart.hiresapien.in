'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  ClipboardList, 
  Users, 
  ClipboardCheck, 
  LayoutDashboard, 
  Target, 
  BookOpen, 
  Search, 
  Filter, 
  MoreVertical, 
  X 
} from 'lucide-react';

import DashboardLayout from '@/components/basic/dashboard-layout';
import ContributorList from '@/components/admin/contributors/ContributorList';
import PendingQuestions from '@/components/admin/questions/PendingQuestions';
import ApprovedQuestionBank from '@/components/admin/questions/ApprovedQuestionBank';
import AdminInsights from '@/components/admin/insights/AdminInsights';
import PriTestResponses from '@/components/admin/pri/PriTestResponses';
import EvaluateButton from '@/components/evaluation/EvaluateButton';
import TestStatusTracker, { type TestStage } from '@/components/evaluation/TestStatusTracker';
import MCQEvaluationModal from '@/components/evaluation/MCQEvaluationModal';
import EvaluationPipelineModal from '@/components/evaluation/EvaluationPipelineModal';
import { useUI } from '@/components/providers/ui-provider';
import { safeParseJson } from '@/lib/api-utils';
import { DomainId } from '@/lib/domains';
import { ADMIN_SIDEBAR_ITEMS } from '@/lib/navigation-constants';

interface Institution {
  _id: string;
  name: string;
  code: string;
  facultySlotLimit: number;
  studentSlotLimit: number;
  slotUsage?: {
    faculty: number;
    students: number;
  };
  createdAt?: string;
  createdByAdmin?: string;
}

interface PriQuestion {
  _id: string;
  questionText: string;
  correctAnswer: string;
  options: Array<{ label: string; text: string }>;
}

interface PriTestQuestion {
  domainId: string;
  domainName: string;
  subSkill: string;
  questionType: 'mcq' | 'written';
  difficulty: 'easy' | 'medium' | 'hard';
  questionText: string;
  options: Array<{ label: string; text: string }>;
  correctAnswer?: string;
}

interface PriTestBank {
  _id: string;
  title: string;
  program: string;
  status: 'draft' | 'published' | 'completed';
  domains?: any[];
  questions: PriTestQuestion[];
  questionCount?: number;
  institutions?: Array<{ institutionId: string; status: 'pending' | 'accepted' | 'rejected'; examStartDate?: string; examEndDate?: string; isResultsPublished?: boolean }>;
  createdAt?: string;
  updatedAt?: string;
}

type Tab = 'overview' | 'institutions' | 'pri' | 'pri-tests' | 'contributors' | 'review'
  | 'approved-bank' | 'responses';

export default function AdminDashboard() {
  const { confirm, showToast: globalShowToast } = useUI();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  });
  const [adminUser, setAdminUser] = useState<string>('Admin');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [error, setError] = useState('');

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionName, setInstitutionName] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [facultySlotLimit, setFacultySlotLimit] = useState(0);
  const [studentSlotLimit, setStudentSlotLimit] = useState(0);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('all'); 
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [institutionActionMenu, setInstitutionActionMenu] = useState<Institution | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [editInstitutionName, setEditInstitutionName] = useState('');
  const [editInstitutionCode, setEditInstitutionCode] = useState('');
  const [editFacultySlotLimit, setEditFacultySlotLimit] = useState(0);
  const [editStudentSlotLimit, setEditStudentSlotLimit] = useState(0);
  const [isInstitutionsLoading, setIsInstitutionsLoading] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      setActiveMenuId(null);
      setInstitutionActionMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const filteredInstitutions = React.useMemo(() => {
    return institutions.filter((inst) => {
      const matchesSearch = inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
                            inst.code.toLowerCase().includes(institutionSearch.toLowerCase());
      const matchesStatus = institutionFilter === 'all' || 
                           (institutionFilter === 'active' ? (inst.slotUsage?.faculty || 0) + (inst.slotUsage?.students || 0) > 0 : (inst.slotUsage?.faculty || 0) + (inst.slotUsage?.students || 0) === 0);
      return matchesSearch && matchesStatus;
    });
  }, [institutions, institutionSearch, institutionFilter]);


  const [priQuestions, setPriQuestions] = useState<PriQuestion[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState('A');

  const [priTests, setPriTests] = useState<PriTestBank[]>([]);
  const [isPriLoading, setIsPriLoading] = useState(false);
  const [selectedPriTest, setSelectedPriTest] = useState<PriTestBank | null>(null);
  const [priTestTitle, setPriTestTitle] = useState('');
  const [priTestProgram, setPriTestProgram] = useState('');
  const [priTestQuestions, setPriTestQuestions] = useState<PriTestQuestion[]>([]);
  const [priTestPage, setPriTestPage] = useState(1);
  const priTestPageSize = 5;
  const [evalSummaries, setEvalSummaries] = useState<Record<string, { totalSubmitted: number; totalEvaluated: number; avgScore: number } | null>>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [pipelineTestId, setPipelineTestId] = useState<string | null>(null);
  const [activePriTab, setActivePriTab] = useState<'published' | 'pending' | 'completed'>('published');
  const [priSearchQuery, setPriSearchQuery] = useState('');

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    globalShowToast(message, type);
  }, [globalShowToast]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (selectedInstitution) return;

    if (tabParam) {
      if (['overview', 'institutions', 'pri', 'pri-tests', 'contributors', 'review', 'responses'].includes(tabParam)) {
        setActiveTab(tabParam as Tab);
      }
    } else {
      setActiveTab('overview');
    }
  }, [searchParams, selectedInstitution]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const publishedParam = searchParams.get('published');
    if (tabParam === 'pri-tests' && publishedParam === '1') {
      showToast('PRI Published', 'success');
      router.replace('/admin?tab=pri-tests');
    }
  }, [searchParams, router, showToast]);
  
  const filteredPriTests = React.useMemo(() => {
    return priTests.filter((test) => {
      const isDraft = test.status === 'draft';
      const isResultsPublished = test.institutions?.some(i => i.isResultsPublished) ?? false;
      
      let matchesTab = false;
      if (activePriTab === 'pending') matchesTab = isDraft;
      else if (activePriTab === 'published') matchesTab = test.status === 'published' && !isResultsPublished;
      else if (activePriTab === 'completed') matchesTab = test.status === 'completed' || (test.status === 'published' && isResultsPublished);
      
      if (!matchesTab) return false;
      
      const search = priSearchQuery.toLowerCase();
      return (
        test.title.toLowerCase().includes(search) || 
        test.program.toLowerCase().includes(search)
      );
    });
  }, [priTests, activePriTab, priSearchQuery]);

  const priStatsCount = React.useMemo(() => {
    return {
      published: priTests.filter(t => t.status === 'published' && !(t.institutions?.some(i => i.isResultsPublished))).length,
      pending: priTests.filter(t => t.status === 'draft').length,
      completed: priTests.filter(t => t.status === 'completed' || (t.status === 'published' && (t.institutions?.some(i => i.isResultsPublished)))).length
    };
  }, [priTests]);

  useEffect(() => {
    if (!token) {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    } else {
      try {
        const payload = token.split('.')[1];
        if (payload) {
          const decoded = JSON.parse(atob(payload));
          if (decoded && decoded.username) {
            setAdminUser(decoded.username);
          }
        }
      } catch (e) {}
    }
  }, [token]);

  async function loadInstitutions(authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    setIsInstitutionsLoading(true);
    try {
      const res = await fetch('/api/admin/institutions', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to load institutions');
        return;
      }
      setInstitutions(data.institutions ?? []);
    } catch (err: any) {
      console.error('[AdminDashboard] loadInstitutions Error:', err);
      setError('Network error while loading institutions');
    } finally {
      setIsInstitutionsLoading(false);
    }
  }

  async function loadPriQuestions(authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    try {
      const res = await fetch('/api/admin/pri-questions', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to load PRI questions');
        return;
      }
      setPriQuestions(data.questions ?? []);
    } catch (err: any) {
      console.error('[AdminDashboard] loadPriQuestions Error:', err);
      setError('Network error while loading PRI questions');
    }
  }

  async function loadPriTests(authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;

    setIsPriLoading(true);
    try {
      const res = await fetch('/api/admin/pri-tests', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to load PRI tests');
        return;
      }
      setPriTests(data.banks ?? []);
    } catch (err: any) {
      console.error('[AdminDashboard] loadPriTests Error:', err);
      setError('Network error while loading PRI tests');
    } finally {
      setIsPriLoading(false);
    }
  }

  async function loadEvalSummary(testId: string, authToken?: string | null) {
    const currentToken = authToken ?? token;
    if (!currentToken) return;
    try {
      const res = await fetch(`/api/admin/pri-tests/${testId}/evaluate`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) return;
      const data: any = await safeParseJson(res);
      setEvalSummaries((prev) => ({ ...prev, [testId]: { totalSubmitted: data.totalSubmitted, totalEvaluated: data.totalEvaluated, avgScore: data.avgScore } }));
    } catch (err: any) {
      console.error('[AdminDashboard] loadEvalSummary Error:', err);
    }
  }

  function handleEvaluateTest(testId: string) {
    setPipelineTestId(testId);
  }

  useEffect(() => {
    if (!token) return;
    loadInstitutions(token);
    loadPriQuestions(token);
  }, [token]);

  const [priTick, setPriTick] = React.useState(0);

  useEffect(() => {
    if (activeTab !== 'pri-tests' || !token) return;
    setEvalSummaries({});
    loadPriTests(token);
    const pollInterval = setInterval(() => {
      loadPriTests(token);
    }, 30000);
    // Re-render every 60s so time-based stages (Started/Completed) update without waiting for next poll
    const tickInterval = setInterval(() => {
      setPriTick(t => t + 1);
    }, 60000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(tickInterval);
    };
  }, [activeTab, token]);

  useEffect(() => {
    if (!token) return;
    for (const t of priTests.filter((t) => t.status === 'published' || t.status === 'completed')) {
      if (!evalSummaries[t._id]) {
        loadEvalSummary(t._id, token);
      }
    }
  }, [priTests, token]);

  async function createInstitution(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError('');
    try {
      const res = await fetch('/api/admin/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          institutionName,
          institutionCode,
          adminUsername,
          adminPassword,
          facultySlotLimit,
          studentSlotLimit,
        }),
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to create institution');
        return;
      }

      setInstitutionName('');
      setInstitutionCode('');
      setAdminUsername('');
      setAdminPassword('');
      setFacultySlotLimit(0);
      setStudentSlotLimit(0);
      loadInstitutions();
    } catch (err: any) {
      console.error('[AdminDashboard] createInstitution Error:', err);
      setError('Network error while creating institution');
    }
  }

  function startInstitutionEdit(inst: Institution) {
    setEditingInstitution(inst);
    setEditInstitutionName(inst.name);
    setEditInstitutionCode(inst.code);
    setEditFacultySlotLimit(inst.facultySlotLimit);
    setEditStudentSlotLimit(inst.studentSlotLimit);
    setActiveMenuId(null);
    setError('');
  }

  async function handleInstitutionUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !editingInstitution) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/institutions/${editingInstitution._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          institutionName: editInstitutionName,
          institutionCode: editInstitutionCode,
          facultySlotLimit: editFacultySlotLimit,
          studentSlotLimit: editStudentSlotLimit,
        }),
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to update institution');
        return;
      }
      setEditingInstitution(null);
      showToast('Institution updated successfully.');
      loadInstitutions();
    } catch (err: any) {
      console.error('[AdminDashboard] handleInstitutionUpdate Error:', err);
      setError('Network error while updating institution');
    }
  }

  async function handleInstitutionDelete(inst: Institution) {
    if (!token) return;
    const confirmed = await confirm({
      title: 'Delete Institution',
      message: `Delete ${inst.name}? This only works if no users, shares, or test history are linked.`,
      confirmLabel: 'Delete Institution',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    setError('');
    setActiveMenuId(null);
    try {
      const res = await fetch(`/api/admin/institutions/${inst._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: any = await safeParseJson(res);
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete institution');
        return;
      }
      showToast('Institution deleted successfully.');
      loadInstitutions();
    } catch (err: any) {
      console.error('[AdminDashboard] handleInstitutionDelete Error:', err);
      setError('Network error while deleting institution');
    }
  }

  function handleBack() {
    if (activeTab === 'responses') {
      setSelectedPriTest(null);
      setActiveTab('pri-tests');
    } else if (selectedInstitution) {
      setSelectedInstitution(null);
    } else if (selectedPriTest) {
      setSelectedPriTest(null);
      setActiveTab('pri-tests');
    } else {
      setActiveTab('overview');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_role');
    window.location.href = '/';
  }

  if (!mounted || !token) return null;

  const formatPriScore = (value: number | null | undefined) => {
    const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
    // Standardize to 2 decimals truncated as per the user's request across screens
    return (Math.trunc(numeric * 100) / 100).toFixed(2);
  };

  const totalPriTestPages = Math.max(1, Math.ceil(priTestQuestions.length / priTestPageSize));
  const pagedPriTestQuestions = priTestQuestions.slice(
    (priTestPage - 1) * priTestPageSize,
    priTestPage * priTestPageSize
  );

  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: activeTab === 'overview', onClick: () => {
      setSelectedInstitution(null);
      setSelectedPriTest(null);
      setActiveTab('overview');
    }},
    { label: 'PRI Test Builder', icon: ClipboardList, href: '/admin/pri-test' },
    { label: 'SMART Reports', icon: ClipboardCheck, href: '/admin/smart-reports' },
    { label: 'Institution Management', icon: Building2, active: activeTab === 'institutions', onClick: () => {
      setSelectedInstitution(null);
      setSelectedPriTest(null);
      setActiveTab('institutions');
    }},
    { label: 'PRI Management', icon: ClipboardList, active: activeTab === 'pri-tests', onClick: () => {
      setSelectedInstitution(null);
      setSelectedPriTest(null);
      setActiveTab('pri-tests');
    }},
    { label: 'Approved Bank', icon: BookOpen, active: activeTab === 'approved-bank', onClick: () => {
      setSelectedInstitution(null);
      setSelectedPriTest(null);
      setActiveTab('approved-bank');
    }},
    { label: 'Contributors', icon: Users, active: activeTab === 'contributors', onClick: () => {
      setSelectedInstitution(null);
      setSelectedPriTest(null);
      setActiveTab('contributors');
    }},
    { label: 'Contribution Review', icon: ClipboardCheck, active: activeTab === 'review', onClick: () => {
      setSelectedInstitution(null);
      setSelectedPriTest(null);
      setActiveTab('review');
    }},
  ];

  return (
    <>
    <DashboardLayout
      userType="Admin"
      username={adminUser}
      onLogout={handleLogout}
      sidebarItems={sidebarItems}
      onBack={handleBack}
      headerTitle={
        selectedInstitution ? `Institution Detail: ${selectedInstitution.code}` :
        selectedPriTest ? `PRI Test: ${selectedPriTest.title}` :
        activeTab === 'overview' ? `Welcome, ${adminUser}` :
        activeTab === 'institutions' ? 'Institution Management' :
        activeTab === 'pri' ? 'PRI MCQ Builder' :
        activeTab === 'pri-tests' ? 'PRI Management' :
        activeTab === 'responses' ? 'Student Performance' :
        activeTab === 'contributors' ? 'Manage Contributors' :
        activeTab === 'approved-bank' ? 'APPROVED QUESTIONS' :
        'Contribution Review'
      }
      headerSubtitle={
        activeTab === 'overview' ? 'Live System Monitoring' : 'Administrator Hub'
      }
      institutionName="grad360 Admin"
    >
      <div className="p-3.75 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-[#D62027]">
            {error}
          </div>
        )}

        {/* TAB RENDERING */}
        {activeTab === 'overview' && <AdminInsights token={token} />}
        {activeTab === 'approved-bank' && <ApprovedQuestionBank token={token} />}
        {activeTab === 'contributors' && <div className="g360-card no-hover p-0 overflow-hidden"><ContributorList token={token} /></div>}
        {activeTab === 'review' && <div className="g360-card no-hover p-0 overflow-hidden"><PendingQuestions token={token} /></div>}
        {activeTab === 'responses' && selectedPriTest && (
          <PriTestResponses 
            testId={selectedPriTest._id} 
            testTitle={selectedPriTest.title} 
            token={token} 
            onBack={() => { 
              setSelectedPriTest(null); 
              setActiveTab('pri-tests'); 
              loadPriTests(token);
            }} 
          />
        )}

        {/* INSTITUTIONS TAB */}
        {activeTab === 'institutions' && (
          selectedInstitution ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="g360-card no-hover p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                  <div className="flex items-center gap-6">
                    <div>
                      <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">{selectedInstitution.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black rounded-lg tracking-widest uppercase">Node: {selectedInstitution.code}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-2">Deployed {new Date(selectedInstitution.createdAt as any).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Faculty Provisioning</p>
                      <p className="text-lg font-black text-zinc-900">{selectedInstitution.slotUsage?.faculty ?? 0} <span className="text-zinc-300 text-sm">/ {selectedInstitution.facultySlotLimit}</span></p>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-[#D62027] transition-all duration-1000" style={{ width: `${Math.min(100, ((selectedInstitution.slotUsage?.faculty ?? 0) / (selectedInstitution.facultySlotLimit || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="space-y-4 p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Student Enrollment</p>
                      <p className="text-lg font-black text-zinc-900">{selectedInstitution.slotUsage?.students ?? 0} <span className="text-zinc-300 text-sm">/ {selectedInstitution.studentSlotLimit}</span></p>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-black transition-all duration-1000" style={{ width: `${Math.min(100, ((selectedInstitution.slotUsage?.students ?? 0) / (selectedInstitution.studentSlotLimit || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="g360-card no-hover p-6">
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight text-zinc-900">Create Institution</h3>
                <form onSubmit={createInstitution} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] ml-1">Institution Name</label>
                    <input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} required placeholder="Harvard University" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] ml-1">Institution Code</label>
                    <input value={institutionCode} onChange={(e) => setInstitutionCode(e.target.value)} required placeholder="HU01" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] ml-1">Admin Username</label>
                    <input value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} required placeholder="admin_hu" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] ml-1">Admin Password</label>
                    <input value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required type="password" placeholder="••••••••" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] ml-1">Faculty Slots</label>
                    <input value={facultySlotLimit} onChange={(e) => setFacultySlotLimit(Number(e.target.value))} type="number" min={0} className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] ml-1">Student Slots</label>
                    <input value={studentSlotLimit} onChange={(e) => setStudentSlotLimit(Number(e.target.value))} type="number" min={0} className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium" />
                  </div>
                  <button type="submit" className="md:col-span-2 rounded-xl bg-black text-white px-6 py-4 text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-[0.98]">
                    Create Institution
                  </button>
                </form>
              </div>

              <div className="g360-card no-hover overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.75 border-b border-zinc-50 bg-white">
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-zinc-900 uppercase leading-none mb-1">Registered Institutions</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Management Console</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search institutions..." 
                        value={institutionSearch} 
                        onChange={(e) => setInstitutionSearch(e.target.value)} 
                        className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none" 
                      />
                    </div>
                    <select 
                      value={institutionFilter}
                      onChange={(e) => setInstitutionFilter(e.target.value)}
                      className="bg-zinc-50 border-none rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-[#D62027] focus:ring-2 focus:ring-[#D62027]/10 outline-none appearance-none cursor-pointer"
                    >
                      <option value="all">ALL FILTERS</option>
                      <option value="active">HE/UNIV: ACTIVE</option>
                      <option value="inactive">HE/UNIV: INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-auto max-h-150 custom-scrollbar no-hover">
                  <table className="w-full text-left border-collapse no-hover">
                    <thead className="sticky top-0 z-20 bg-white">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 min-w-[320px] bg-white">Node Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-center bg-white">Engagement</th>
                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-center bg-white">Connectivity</th>
                        <th className="px-8 py-5 text-right border-b border-zinc-100 bg-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {isInstitutionsLoading ? (
                        <tr><td colSpan={4} className="px-8 py-10 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">Hydrating Nodes...</td></tr>
                      ) : filteredInstitutions.length === 0 ? (
                        <tr><td colSpan={4} className="px-8 py-20 text-center"><p className="text-xs font-black uppercase tracking-widest text-zinc-300">No records mapped</p></td></tr>
                      ) : (
                        filteredInstitutions.map((inst) => (
                          <tr key={inst._id} className="border-b border-zinc-50 no-hover">
                            <td className="px-8 py-6">
                              <p className="text-sm font-black text-zinc-900 leading-tight uppercase truncate max-w-70">{inst.name}</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">ID: {inst.code}</p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="text-[11px] font-black text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-xl">{inst.slotUsage?.students || 0} Students</span>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="px-3 py-1.5 rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-emerald-800">Connected</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <button onClick={() => setSelectedInstitution(inst)} className="px-5 py-2.5 rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">Details</button>
                                <button onClick={() => { setEditingInstitution(inst); setEditInstitutionName(inst.name); }} className="p-2.5 rounded-xl border border-zinc-100 text-zinc-400"><MoreVertical className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* PRI MANAGEMENT TAB */}
        {activeTab === 'pri-tests' && (
          <div className="space-y-6">
            {/* PRI Stats Row */}
            <div className="bg-white rounded-[20px] p-6 border border-zinc-100 flex flex-col justify-center h-full relative overflow-hidden no-hover shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-1">Completed Cycles</p>
              <h3 className="text-[40px] font-black text-[#111827] leading-none tracking-tighter mb-1">{priStatsCount.completed}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748b]">Total Archived Records</p>
            </div>

            <div className="g360-card no-hover overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.75 border-b border-zinc-50 bg-white">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-zinc-900 uppercase leading-none mb-1">PRI Management</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Lifecycle Controller</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-64 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search PRI tests..." 
                      value={priSearchQuery} 
                      onChange={(e) => setPriSearchQuery(e.target.value)} 
                      className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border-b border-zinc-100 flex items-center gap-1 px-8 pb-px">
                {(['published', 'pending', 'completed'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActivePriTab(tab)} 
                    className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest relative transition-all ${activePriTab === tab ? 'text-[#D62027]' : 'text-zinc-400'}`}
                  >
                    {tab} ({priStatsCount[tab]})
                    {activePriTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D62027] rounded-full" />}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-150 custom-scrollbar no-hover transition-all">
                <div className="min-w-275">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 min-w-62.5 bg-white">Test Identity</th>
                        <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-center bg-white">Stats</th>
                        <th className="px-6 py-5 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 min-w-112.5 bg-white">Analytics</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 bg-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                    {isPriLoading ? (
                      <tr><td colSpan={4} className="px-8 py-10 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest italic">Syncing PRI Core...</td></tr>
                    ) : filteredPriTests.length === 0 ? (
                      <tr><td colSpan={4} className="px-8 py-20 text-center"><p className="text-xs font-black uppercase tracking-widest text-zinc-300">No matching records</p></td></tr>
                    ) : (
                      filteredPriTests.map((test) => {
                        const stats = evalSummaries[test._id];
                        const instList = test.institutions ?? [];
                        const now = Date.now();
                        const acceptedInsts = instList.filter((i) => i.status === 'accepted');
                        const acceptedCount = acceptedInsts.length;
                        const acceptedInfo = { accepted: acceptedCount, total: instList.length };
                        const isResultsPublished = instList.some((i) => i.isResultsPublished === true);
                        const evaluationCompleted = stats && stats.totalSubmitted > 0 && stats.totalEvaluated >= stats.totalSubmitted;
                        const canPublishSolutionKey = !!evaluationCompleted;

                        const anyStarted = acceptedInsts.some(i => i.examStartDate && new Date(i.examStartDate).getTime() <= now);
                        const allEnded = acceptedInsts.length > 0 && acceptedInsts.every(i => i.examEndDate && new Date(i.examEndDate).getTime() <= now);

                        let currentStage: TestStage = 'Published';
                        if (isResultsPublished) currentStage = 'Results Published';
                        else if (evaluationCompleted) currentStage = 'Evaluation Completed';
                        else if (allEnded) currentStage = 'Ready to Evaluate';
                        else if (anyStarted) currentStage = 'Started';
                        else if (acceptedCount > 0) currentStage = 'Accepted';

                        return (
                          <tr key={test._id} className="border-b border-zinc-50 no-hover">
                            <td className="px-8 py-6">
                              <p className="text-sm font-black text-zinc-900 leading-tight uppercase truncate max-w-62.5">{test.title}</p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{test.program} • {test.questionCount ?? test.questions?.length ?? 0} ITEMS</p>
                            </td>
                            <td className="px-8 py-6 text-center">
                              {stats ? (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{stats.totalEvaluated} / {stats.totalSubmitted} EVAL</p>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AVG: {formatPriScore(stats.avgScore)}%</p>
                                </div>
                              ) : <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">AWAITING DATA</span>}
                            </td>
                            <td className="px-8 py-6">
                              <TestStatusTracker 
                                currentStage={currentStage} 
                                acceptedInfo={acceptedInfo}
                              />
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                {evaluationCompleted ? (
                                  <button
                                    onClick={() => { setSelectedPriTest(test); setActiveTab('responses'); }}
                                    className="px-4 py-2 rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600"
                                  >
                                    Responses
                                  </button>
                                ) : (
                                  <EvaluateButton 
                                    onClick={() => handleEvaluateTest(test._id)} 
                                    isLoading={evaluatingId === test._id} 
                                  />
                                )}
                                <button
                                  type="button"
                                  disabled={!canPublishSolutionKey}
                                  onClick={() => { if (test._id) window.location.href = `/admin/pri-test/${test._id}/solution`; }}
                                  className="px-4 py-2 rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600 disabled:opacity-30"
                                >
                                  Key
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!token) return;
                                    const confirmed = await confirm({
                                      title: 'Delete PRI Test',
                                      message: `Delete "${test.title}"? This cannot be undone.`,
                                      confirmLabel: 'Delete',
                                      cancelLabel: 'Cancel',
                                      variant: 'danger'
                                    });
                                    if (!confirmed) return;
                                    try {
                                      const res = await fetch(`/api/admin/pri-tests/${test._id}`, {
                                        method: 'DELETE',
                                        headers: { Authorization: `Bearer ${token}` },
                                      });
                                      if (res.ok) { showToast('Test deleted.'); await loadPriTests(); }
                                    } catch { showToast('Error deleting.', 'error'); }
                                  }}
                                  className="p-2 rounded-xl text-[#D62027]"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {editingInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200"><h3 className="text-lg font-black text-zinc-900 uppercase">Edit Institution</h3></div>
            <form onSubmit={handleInstitutionUpdate} className="p-6 space-y-4">
              <input value={editInstitutionName} onChange={(e) => setEditInstitutionName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" />
              <div className="flex gap-4"><button type="submit" className="flex-1 rounded-xl bg-black text-white px-5 py-3 text-xs font-black uppercase tracking-widest">Save Changes</button><button type="button" onClick={() => setEditingInstitution(null)} className="rounded-xl border border-zinc-200 px-5 text-xs font-black uppercase tracking-widest text-zinc-500">Cancel</button></div>
            </form>
          </div>
        </div>
      )}


    </DashboardLayout>

    {pipelineTestId && token && (
      <EvaluationPipelineModal
        isOpen={!!pipelineTestId}
        testId={pipelineTestId}
        token={token}
        onComplete={() => {
          if (pipelineTestId) loadEvalSummary(pipelineTestId, token);
          setPipelineTestId(null);
        }}
        onClose={() => setPipelineTestId(null)}
      />
    )}
    </>
  );
}
