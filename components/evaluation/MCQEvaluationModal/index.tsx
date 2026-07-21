'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, Trophy, Activity, ClipboardList, ShieldCheck, AlertCircle } from 'lucide-react';
import PreEvaluationSummary from './PreEvaluationSummary';
import ProgressExperience from './ProgressExperience';
import MCQResultsView from '../MCQResultsView';
import { StudentEvaluationResult, mapApiToEvaluationResult } from '@/lib/mock-evaluation-data';

type ModalState = 'summary' | 'progress' | 'results';

interface MCQEvaluationModalProps {
  testId: string;
  testTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MCQEvaluationModal({ 
  testId, 
  testTitle, 
  isOpen, 
  onClose 
}: MCQEvaluationModalProps) {
  const [modalState, setModalState] = useState<ModalState>('summary');
  const [results, setResults] = useState<StudentEvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!testId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('institution_admin_token') || sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
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
    } catch (err: any) {
      console.error('Error fetching evaluation data:', err);
      setError(err.message || 'Error loading results');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  const triggerEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('institution_admin_token') || sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/pri-tests/${testId}/evaluate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) throw new Error('Evaluation engine failed to start');
      
      const data = await res.json();
      // After POST is successful, move to progress state
      setModalState('progress');
    } catch (err: any) {
      setError(err.message || 'Evaluation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProgress = async () => {
    // Re-fetch results after evaluation is complete
    await fetchResults();
    setModalState('results');
  };

  const [portalMounted, setPortalMounted] = React.useState(false);
  useEffect(() => { setPortalMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      setModalState('summary');
      fetchResults();
    }
  }, [isOpen, fetchResults]);

  if (!isOpen || !portalMounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl border-t-[8px] border-[#D62027] animate-in zoom-in-95 duration-500 flex flex-col">
        {/* Header */}
        <div className="px-10 py-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-zinc-950 rounded-2xl shadow-xl">
                {modalState === 'summary' && <ClipboardList className="w-6 h-6 text-white" />}
                {modalState === 'progress' && <Activity className="w-6 h-6 text-[#D62027] animate-pulse" />}
                {modalState === 'results' && <Trophy className="w-6 h-6 text-amber-400" />}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase text-[#D62027] tracking-[0.25em] mb-1">MCQ Evaluation Center</p>
                <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">{testTitle}</h2>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Secure Protocol v2.4</span>
             </div>
             <button 
              onClick={onClose}
              className="p-3 bg-zinc-100 text-zinc-400 rounded-full hover:bg-zinc-900 hover:text-white transition-all transform hover:rotate-90"
             >
                <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-[#D62027] animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}

          {modalState === 'summary' && (
            <PreEvaluationSummary 
              students={results} 
              onStartEvaluation={triggerEvaluation}
              isLoading={isLoading}
            />
          )}

          {modalState === 'progress' && (
            <ProgressExperience 
              totalStudents={results.length || 0} 
              onComplete={handleCompleteProgress} 
            />
          )}

          {modalState === 'results' && (
            <MCQResultsView 
              results={results} 
              onClose={onClose} 
            />
          )}
        </div>
        
        {/* Footer info bar */}
        <div className="px-10 py-4 bg-zinc-950 text-white flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#D62027] animate-pulse" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Evaluation Engine: Active</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Environment: Production (PRI-MCQ)</span>
              </div>
           </div>
           <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
              © 2026 Grad360 MBA · Advanced Analytics Group
           </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
