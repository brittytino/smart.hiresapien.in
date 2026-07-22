'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

interface SmartVerifyProfileProps {
  onStart: (demographics: {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    gender: string;
  }) => void;
  loading: boolean;
}

export default function SmartVerifyProfile({ onStart, loading }: SmartVerifyProfileProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !age || !gender) {
      setError('Please fill in all demographic details.');
      return;
    }

    if (Number(age) < 15 || Number(age) > 100) {
      setError('Please enter a valid age (15+).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    onStart({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      age: Number(age),
      gender,
    });
  };

  return (
    <div className="w-full max-w-lg ml-0 bg-white border border-slate-200 rounded-[1.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
      {/* Subtle soft blue glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">


        <h1 className="text-2xl font-black text-slate-950 tracking-tight mb-1 text-center">
          Verify Candidate Profile
        </h1>
        <p className="text-xs text-slate-500 mb-5 text-center max-w-sm">
          Enter your demographic details to unlock the Full Stack SDE Assessment Workspace.
        </p>

        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2.5 rounded-xl mb-4 font-semibold animate-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold tracking-wider text-slate-500 uppercase ml-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-12 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold tracking-wider text-slate-500 uppercase ml-1">
              Corporate / Personal Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-12 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
                placeholder="rahul@fintra.com"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold tracking-wider text-slate-500 uppercase ml-1">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-12 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
                placeholder="e.g. +91 9876543210"
              />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold tracking-wider text-slate-500 uppercase ml-1">
                Age
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl pl-12 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm"
                  placeholder="e.g. 24"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold tracking-wider text-slate-500 uppercase ml-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400/50 text-white font-black tracking-wider uppercase rounded-xl py-3 px-8 mt-2 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 hover:gap-3 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Starting Assessment...' : 'Start SDE Assessment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
