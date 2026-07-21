'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { 
  Trophy, 
  Activity, 
  ClipboardList, 
  ShieldCheck, 
  AlertCircle, 
  ChevronLeft,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/basic/dashboard-layout';
import { ADMIN_SIDEBAR_ITEMS } from '@/lib/navigation-constants';
import PreEvaluationSummary from '@/components/evaluation/MCQEvaluationModal/PreEvaluationSummary';
import MCQResultsView from '@/components/evaluation/MCQResultsView';
import EvaluationPipelineModal from '@/components/evaluation/EvaluationPipelineModal';
import { StudentEvaluationResult, mapApiToEvaluationResult } from '@/lib/mock-evaluation-data';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EvaluationPage({ params }: PageProps) {
  const { id: testId } = use(params);
  const router = useRouter();
  
  const [modalState, setModalState] = useState<'summary' | 'pipeline' | 'results'>('summary');
  const [showPipeline, setShowPipeline] = useState(false);
  const [results, setResults] = useState<StudentEvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState('PRI Evaluation');
  const [adminUser, setAdminUser] = useState('Admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('admin_user');
      if (stored) setAdminUser(stored);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('admin_user');
    router.push('/login');
  };

  const sidebarItems = ADMIN_SIDEBAR_ITEMS.map(item => ({
    icon: item.icon,
    label: item.label,
    href: item.href,
    onClick: item.tab ? () => router.push(`/admin?tab=${item.tab}`) : undefined,
    active: item.tab === 'pri-tests',
  }));

  const fetchResults = useCallback(async () => {
    if (!testId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/pri-tests/${testId}/evaluate`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch evaluation results');
      
      const data = await res.json();
      const mappedResults = mapApiToEvaluationResult(data.evaluations || []);
      setResults(mappedResults);
      
      // Auto-transition to results if already evaluated
      if (data.totalEvaluated > 0 && modalState === 'summary') {
        setModalState('results');
      }
    } catch (err: any) {
      console.error('Error fetching evaluation data:', err);
      setError(err.message || 'Error loading results');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  const triggerEvaluation = () => {
    setShowPipeline(true);
  };

  const handlePipelineComplete = async () => {
    setShowPipeline(false);
    await fetchResults();
    setModalState('results');
  };

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <DashboardLayout
      userType="Admin"
      username={adminUser}
      onLogout={handleLogout}
      sidebarItems={sidebarItems}
      headerTitle="MCQ Evaluation Center"
      headerSubtitle={testTitle}
      onBack={() => router.push('/admin?tab=pri-tests')}
    >
      <div className="space-y-8">
        {/* Status Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-950 rounded-2xl shadow-xl shrink-0">
              {modalState === 'summary' && <ClipboardList className="w-6 h-6 text-white" />}
              {modalState === 'pipeline' && <Activity className="w-6 h-6 text-[#D62027] animate-pulse" />}
              {modalState === 'results' && <Trophy className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#D62027] tracking-[0.25em] mb-0.5">
                {modalState === 'summary' ? 'Pre-Evaluation Summary' : 'Results Ready'}
              </p>
              <h3 className="text-lg font-black text-zinc-900 tracking-tighter uppercase">{testTitle}</h3>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Secure Protocol</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-5 bg-red-50 border-2 border-red-100 rounded-4xl flex items-center gap-4 text-[#D62027] animate-in slide-in-from-top-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">System Error Encountered</p>
              <p className="text-sm font-bold">{error}</p>
            </div>
            <button 
              onClick={fetchResults}
              className="ml-auto px-4 py-2 bg-white border border-red-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {isLoading && modalState === 'summary' ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-20 h-20 bg-zinc-200 rounded-[2.5rem] mb-6"></div>
            <div className="h-6 w-48 bg-zinc-200 rounded-full mb-3"></div>
            <div className="h-4 w-64 bg-zinc-100 rounded-full"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl md:rounded-[3rem] shadow-2xl shadow-zinc-200 border border-zinc-100 overflow-hidden min-h-[60vh] flex flex-col">
            <div className="flex-1 p-6 md:p-10">
              {modalState === 'summary' && (
                <PreEvaluationSummary 
                  students={results} 
                  onStartEvaluation={triggerEvaluation}
                  isLoading={isLoading}
                />
              )}

              {modalState === 'results' && (
                <MCQResultsView 
                  results={results} 
                  onClose={() => router.push('/admin?tab=pri-tests')} 
                />
              )}
            </div>

            {/* Content Footer */}
            <div className="px-6 md:px-10 py-6 bg-zinc-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D62027] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Engine: Active</span>
                </div>
                <div className="flex items-center gap-3 md:border-l md:border-zinc-800 md:pl-8">
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Node: PRI-CALIBRATOR-V4</span>
                </div>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 sm:text-right">
                Grad360 MBA Framework
              </div>
            </div>
          </div>
        )}
      </div>
      {showPipeline && (
        <EvaluationPipelineModal
          isOpen={showPipeline}
          testId={testId}
          token={typeof window !== 'undefined' ? (sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token') || '') : ''}
          onComplete={handlePipelineComplete}
          onClose={() => setShowPipeline(false)}
        />
      )}
    </DashboardLayout>
  );
}
