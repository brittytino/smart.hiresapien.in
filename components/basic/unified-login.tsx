'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Eye, EyeOff, User } from 'lucide-react';

export default function UnifiedLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [batch, setBatch] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-redirect if already authenticated
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    const role = sessionStorage.getItem('auth_role');
    if (token && role) {
      if (role === 'admin') {
        router.replace('/admin');
      } else if (role === 'student') {
        router.replace('/student');
      } else {
        router.replace(`/${role}`);
      }
    }
  }, [router]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const bodyPayload = mode === 'login' 
        ? { username, password } 
        : { username, password, fullName, batch, studentId };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `${mode === 'login' ? 'Login' : 'Registration'} failed`);
        return;
      }

      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('auth_role', data.role);
      sessionStorage.setItem('auth_username', username);
      sessionStorage.setItem(`${data.role}_token`, data.token);

      window.location.href = data.redirect || '/';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[url('/loginBg.svg')] bg-cover bg-center bg-no-repeat font-sans text-text-main items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="glass-morphism rounded-[2.5rem] shadow-card p-8 md:p-10 flex flex-col items-center relative overflow-hidden">
          
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <Image src="/grad360.png" alt="grad360" width={200} height={68} style={{ objectFit: 'contain' }} priority />
            </div>
            <p className="mt-2 text-[10px] font-bold tracking-[0.25em] text-[#94a3b8]">
              PLACEMENT READINESS INTELLIGENCE PLATFORM
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex w-full bg-slate-100/80 p-1.5 rounded-2xl mb-8 border border-slate-200/50">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-[#D62027] text-white shadow-sm scale-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-3 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-[#D62027] text-white shadow-sm scale-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Profile
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="w-full flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-[#D62027] text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-tight text-[#94a3b8] ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white/70 px-6 py-4 text-sm text-[#0f172a] placeholder-[#cbd5e1] focus:outline-none focus:border-[#D62027] transition-all font-medium shadow-sm"
                    placeholder="Enter your full name"
                  />

                  <label className="text-[10px] font-bold tracking-tight text-[#94a3b8] ml-1">
                    Student ID / Roll No. (Optional)
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white/70 px-6 py-4 text-sm text-[#0f172a] placeholder-[#cbd5e1] focus:outline-none focus:border-[#D62027] transition-all font-medium shadow-sm"
                    placeholder="e.g. STU12345"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-tight text-[#94a3b8] ml-1">
                Username / Login ID
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white/70 px-6 py-4 text-sm text-[#0f172a] placeholder-[#cbd5e1] focus:outline-none focus:border-[#D62027] transition-all font-medium shadow-sm"
                placeholder={mode === 'login' ? "Enter your credential" : "Create a username"}
                autoComplete="username"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-tight text-[#94a3b8] ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-white/70 px-6 py-4 text-sm text-[#0f172a] placeholder-[#cbd5e1] focus:outline-none focus:border-[#D62027] transition-all font-medium shadow-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-[#94a3b8] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center justify-center gap-3 w-full rounded-2xl bg-[#D62027] py-5 px-8 text-sm font-black tracking-normal text-white shadow-[0_8px_20px_-6px_rgba(230,39,39,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <span>{loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Create Profile')}</span>
              <ArrowRight className="w-4 h-4 transition-transform" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
