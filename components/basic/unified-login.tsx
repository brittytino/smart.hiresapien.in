'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function UnifiedLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed');
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
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center justify-center mb-2">
              <Image src="/grad360.png" alt="grad360" width={200} height={68} style={{ objectFit: 'contain' }} priority />
            </div>
            <p className="mt-2 text-[10px] font-bold tracking-[0.25em] text-[#94a3b8]">
              PLACEMENT READINESS INTELLIGENCE PLATFORM
            </p>
          </div>

          {/* Header Info */}
          <div className="flex flex-col items-center mb-8 text-center">
            <h3 className="text-4xl uppercase font-black tracking-tight text-[#0f172a]">
              Log In
            </h3>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-[#D62027] text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-tight text-[#94a3b8] ml-1">
                Login ID
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white/70 px-6 py-4 text-sm text-[#0f172a] placeholder-[#cbd5e1] focus:outline-none  focus:border-[#D62027] transition-all font-medium shadow-sm"
                placeholder="Enter your credential"
                autoComplete="username"
                suppressHydrationWarning
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold tracking-tight text-[#94a3b8]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white/70 px-6 py-4 text-sm text-[#0f172a] placeholder-[#cbd5e1] focus:outline-none  focus:border-[#D62027] transition-all font-medium shadow-sm"
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
                <span>{loading ? 'Authenticating...' : 'Log In'}</span>
              <ArrowRight className="w-4 h-4 transition-transform" />
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
