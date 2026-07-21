'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LandingPage } from '@/components/psychometric/LandingPage';
import { InstructionsPage } from '@/components/psychometric/InstructionsPage';
import { TestRunner } from '@/components/psychometric/TestRunner';
import { ResultsDashboard } from '@/components/psychometric/ResultsDashboard';

export default function PsychometricTestPage() {
  const router = useRouter();
  const [testState, setTestState] = useState<'loading' | 'landing' | 'instructions' | 'running' | 'results' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Data retrieved from server
  const [scores, setScores] = useState<Record<string, number>>({});
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check test status on mount
    async function checkStatus() {
      try {
        const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
        if (!token) {
          router.push('/');
          return;
        }

        const res = await fetch('/api/student/psychometric', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Failed to check test status');
          setTestState('error');
          return;
        }

        if (data.status === 'submitted') {
          setScores(data.scores);
          setAiAnalysis(data.aiAnalysis);
          setTestState('results');
        } else if (data.status === 'not_started' || data.status === 'in_progress') {
          setTestState('landing');
        } else {
          setErrorMessage('Your test was terminated or is in an invalid state.');
          setTestState('error');
        }
      } catch (err) {
        setErrorMessage('A network error occurred.');
        setTestState('error');
      }
    }

    checkStatus();
  }, [router]);

  const handleStart = () => {
    setTestState('instructions');
  };

  const handleContinueToTest = () => {
    setTestState('running');
  };

  const handleComplete = async (finalScores: Record<string, number>) => {
    setIsSubmitting(true);
    setTestState('loading'); // Show loading while AI generates

    try {
      const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
      const res = await fetch('/api/student/psychometric/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ scores: finalScores })
      });

      const data = await res.json();
      
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit test');
        setTestState('error');
        return;
      }

      setScores(data.scores);
      setAiAnalysis(data.aiAnalysis);
      setTestState('results');
    } catch (err) {
      setErrorMessage('A network error occurred during submission.');
      setTestState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTerminate = async () => {
    try {
      const token = sessionStorage.getItem('student_token') || sessionStorage.getItem('auth_token');
      await fetch('/api/student/psychometric', { // PATCH to terminate
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
    
    setErrorMessage('Test terminated due to multiple full-screen exits or time limit violations.');
    setTestState('error');
  };

  const handleRestart = () => {
    // They can't actually restart if it's already in the DB, but they can click it to go back to dashboard
    router.push('/student');
  };

  if (testState === 'loading' || isSubmitting) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-white font-sans">
        <Loader2 className="w-12 h-12 animate-spin text-[#E13737] mb-6" />
        <h2 className="text-2xl font-display font-bold mb-2">
          {isSubmitting ? 'Calculating Performance...' : 'Loading Test Environment...'}
        </h2>
        {isSubmitting && (
          <p className="text-gray-400 max-w-md text-center">
            Finalizing your performance breakdown and recording your professional milestones.
          </p>
        )}
      </div>
    );
  }

  if (testState === 'error') {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="bg-[#151A2A] rounded-3xl p-8 max-w-md w-full border border-red-900/30 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-[#E13737] font-bold text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-display font-bold mb-4">Cannot Access Assessment</h2>
          <p className="text-gray-400 mb-8">{errorMessage}</p>
          <button
            onClick={() => router.push('/student')}
            className="bg-white text-[#0B0F19] font-display font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors w-full uppercase tracking-widest text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {testState === 'landing' && <LandingPage onStart={handleStart} />}
      {testState === 'instructions' && <InstructionsPage onBegin={handleContinueToTest} />}
      {testState === 'running' && <TestRunner onComplete={handleComplete} onTerminate={handleTerminate} />}
      {testState === 'results' && <ResultsDashboard scores={scores} aiAnalysis={aiAnalysis} onRestart={handleRestart} />}
    </>
  );
}
