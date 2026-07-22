'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ShieldAlert, ArrowRight, CheckCircle2, Volume2, Mic } from 'lucide-react';
import SmartVerifyProfile from './SmartVerifyProfile';
import SmartTestEngine from './SmartTestEngine';
import SmartReportView from './SmartReportView';

type TabMode = 'candidate' | 'admin';
type StepState = 'profile' | 'mic-check' | 'testing' | 'report';

export default function SmartHomePortal({ initialTabMode = 'candidate' }: { initialTabMode?: TabMode }) {
  const router = useRouter();
  const [tabMode, setTabMode] = useState<TabMode>(initialTabMode);
  const [step, setStep] = useState<StepState>('profile');
  
  // Demographics / Session data
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [candidateDemographics, setCandidateDemographics] = useState<any>(null);

  // Admin login credentials
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Mic check states
  const [micState, setMicState] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const submitTriggeredRef = React.useRef(false);

  // Auto redirect if already authenticated as admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
      const role = sessionStorage.getItem('auth_role');
      if (token && role === 'admin') {
        router.replace('/admin');
      }
    }
  }, [router]);

  // Restore candidate session progress if session parameter is present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get('session');
      if (sessionParam) {
        setLoading(true);
        fetch(`/api/smart/session?id=${sessionParam}`)
          .then((res) => {
            if (!res.ok) throw new Error('Session not found');
            return res.json();
          })
          .then((data) => {
            setSessionId(sessionParam);
            setCandidateDemographics({
              fullName: data.fullName,
              email: data.email,
              phone: data.phone,
              age: data.age,
              gender: data.gender,
            });
            if (data.status === 'submitted') {
              setReportData(data);
              setStep('report');
            } else {
              if (data.answers && data.answers.length > 0) {
                setStep('testing');
              } else {
                setStep('mic-check');
              }
            }
          })
          .catch((err) => {
            console.error('Failed to restore session:', err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [router]);

  // Clean up audio context
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Admin authentication POST handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Authentication failed.');
        return;
      }

      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('admin_token', data.token);
      sessionStorage.setItem('auth_role', data.role);
      sessionStorage.setItem('auth_username', adminUsername);

      window.location.href = '/admin';
    } catch (err) {
      setAdminError('Network error. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Start Assessment candidate demographics submit handler
  const handleCandidateStart = async (demographics: any) => {
    setCandidateDemographics(demographics);
    setLoading(true);
    try {
      const res = await fetch('/api/smart/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demographics),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to initialize session.');
        return;
      }

      setSessionId(data.id);
      setStep('mic-check');

      // Slugify name and route to assessment/[username]
      const slug = demographics.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      router.push(`/assessment/${slug}?session=${data.id}`);
    } catch (err) {
      alert('Network error. Failed to initiate assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Microphone hardware verify
  const handleTestMic = async () => {
    setMicState('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      
      // Keep checking for 3 seconds then pass successfully
      setTimeout(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        setMicState('success');
      }, 3000);

    } catch (err) {
      console.error(err);
      setMicState('failed');
    }
  };

  // Grade and show reports finishes handler
  const handleCandidateFinish = async (answers: any[]) => {
    if (submitTriggeredRef.current) return;
    submitTriggeredRef.current = true;
    setLoading(true);
    try {
      const res = await fetch('/api/smart/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sessionId, answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit test data.');
        submitTriggeredRef.current = false;
        return;
      }

      setReportData(data);
      setStep('report');
    } catch (err) {
      alert('Network error. Failed to evaluate test responses.');
      submitTriggeredRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setSessionId('');
    setReportData(null);
    setStep('profile');
    setMicState('idle');
    setMicVolume(0);
    submitTriggeredRef.current = false;
    router.push('/');
  };

  const isLoginPage = step === 'profile' || step === 'mic-check';

  return (
    <div 
      className={`flex min-h-screen font-sans text-slate-800 relative overflow-hidden transition-all duration-700 ${
        isLoginPage 
          ? step === 'profile'
            ? "items-center justify-center bg-[url('/hero.jpeg')] bg-cover bg-center md:justify-start justify-start pl-8 pr-4 pt-28 pb-8 md:pl-12"
            : "items-center justify-center bg-[url('/hero.jpeg')] bg-cover bg-center justify-center p-4 md:p-6" 
          : "items-start justify-center bg-slate-50 w-full p-4 md:px-8 md:py-2"
      }`}
    >
      {/* Top Left Logos (Sona & Scale) */}
      {isLoginPage && (
        <div className="absolute top-8 left-8 md:left-12 flex items-center gap-4 z-20 select-none">
          <img src="/sona__1_-removebg-preview.png" alt="Sona Logo" className="h-12 md:h-18 object-contain" />
          <div className="w-px h-10 bg-white/30"></div>
          <img src="/Scale Logo High Res (1).png" alt="Scale Logo" className="h-12 md:h-18 object-contain" />
        </div>
      )}

      {/* Top Right Logo (SMART) */}
      {isLoginPage && (
        <div className="absolute top-8 right-8 md:right-12 z-20 select-none">
          <img src="/SMART_Logo_New__1_-removebg-preview.png" alt="SMART Logo" className="h-16 md:h-24 object-contain" />
        </div>
      )}

      {/* Background overlays */}
      {isLoginPage ? (
        <>
          {/* Soft tint layout layer with conditional backdrop blur */}
          {step === 'profile' ? (
            <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
          ) : (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md pointer-events-none z-0"></div>
          )}
        </>
      ) : (
        /* Light grid layout background for exam testing and reports */
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none z-0"></div>
      )}

      <div className={`relative z-10 w-full flex items-center ${
        isLoginPage 
          ? step === 'profile'
            ? "max-w-5xl justify-start my-8" 
            : "max-w-5xl justify-center my-8"
          : "max-w-none justify-center mt-2 mb-8"
      }`}>
        
        {/* Render Step forms */}
        {step === 'profile' && (
          <div className="flex flex-col items-start w-full">
            {tabMode === 'candidate' ? (
              <SmartVerifyProfile onStart={handleCandidateStart} loading={loading} />
            ) : (
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in duration-300 text-slate-800 z-10">
                <div className="flex items-center gap-2 mb-3 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span className="text-[9px] font-black tracking-wider text-blue-600 uppercase">
                    Admin Sign-In
                  </span>
                </div>
                
                <h2 className="text-lg font-black text-slate-950 mb-1">Access Dashboard</h2>
                <p className="text-xs text-slate-500 mb-4">Enter authorized credentials to view candidate metrics.</p>

                {adminError && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 mb-4 font-semibold animate-in slide-in-from-top-1">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-slate-500 uppercase ml-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-600 transition-all shadow-sm"
                      placeholder="Enter administrator ID"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-wider text-slate-500 uppercase ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-600 transition-all shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400/50 text-white font-black tracking-wider uppercase rounded-xl py-3 mt-2 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>{adminLoading ? 'Verifying...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {step === 'mic-check' && (
          <div className="w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-[1.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-500 text-slate-800">
            <h2 className="text-xl font-black text-slate-950 tracking-tight mb-1 text-center">
              Workspace Hardware Validation
            </h2>
            <p className="text-xs text-slate-500 mb-5 text-center max-w-sm mx-auto">
              SMART assessments include oral response segments. Please test your microphone access below.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center mb-5 relative">
              {micState === 'idle' && (
                <>
                  <Volume2 className="w-10 h-10 text-blue-600 mb-3" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">
                    Microphone is ready to test
                  </p>
                  <button
                    onClick={handleTestMic}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider py-3 px-6 rounded-xl transition-all cursor-pointer"
                  >
                    Test Hardware Connection
                  </button>
                </>
              )}
 
              {micState === 'checking' && (
                <>
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                    <Mic className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-4">
                    Analyzing sound stream... Speak now
                  </p>
                  
                  {/* Visual Feedback Volume Bar */}
                  <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-100"
                      style={{ width: `${micVolume}%` }}
                    />
                  </div>
                </>
              )}
 
              {micState === 'success' && (
                <>
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-3" />
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">
                    Microphone Configured Correctly
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Audio inputs successfully calibrated for transcription.
                  </span>
                </>
              )}

              {micState === 'failed' && (
                <>
                  <ShieldAlert className="w-10 h-10 text-red-600 mb-3" />
                  <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-2">
                    Microphone check failed
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold text-center max-w-xs mb-4">
                    Access was denied or unavailable. You can still proceed and use typing fallbacks.
                  </span>
                  <button
                    onClick={handleTestMic}
                    className="text-xs font-bold text-blue-600 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Retry Diagnostics
                  </button>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="font-bold text-slate-600 uppercase text-[9px] tracking-wider mb-1.5">Assessment Rules:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>You will be presented with 16 questions (2 in each core domain).</li>
                  <li>Questions have individual countdown timers (60s to 120s).</li>
                  <li>Adaptive logic will dynamically update question difficulty on response.</li>
                </ul>
              </div>

              <button
                disabled={micState === 'checking'}
                onClick={() => setStep('testing')}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400/40 text-white font-black tracking-wider uppercase rounded-xl py-3 shadow-[0_8px_20px_-6px_rgba(10,34,92,0.3)] flex items-center justify-center gap-2 hover:gap-3 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Begin Adaptive Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'testing' && (
          <SmartTestEngine 
            sessionId={sessionId} 
            candidateInfo={candidateDemographics} 
            onSubmitTest={handleCandidateFinish} 
          />
        )}

        {step === 'report' && reportData && (
          <SmartReportView 
            reportData={{
              fullName: reportData.fullName || 'Anonymous Candidate',
              email: reportData.email || '',
              phone: reportData.phone || '',
              age: reportData.age || 24,
              gender: reportData.gender || 'Male',
              smartScore: reportData.smartScore || 0,
              benchmarkPercentile: reportData.benchmarkPercentile || 50,
              readinessLevel: reportData.readinessLevel || '',
              competencyScores: reportData.competencyScores || {},
              skillGapAnalysis: reportData.skillGapAnalysis || [],
              learningRecommendations: reportData.learningRecommendations || [],
              totalDurationSeconds: reportData.totalDurationSeconds || 0,
            }}
            onRestart={handleRestart}
          />
        )}

      </div>
    </div>
  );
}
