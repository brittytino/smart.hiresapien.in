'use client';

import React, { useState } from 'react';
import { ShieldAlert, Check } from 'lucide-react';

interface ContributorFormProps {
  initial?: {
    _id: string;
    username: string;
    email?: string;
    displayName?: string;
    isActive: boolean;
  };
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ContributorForm({
  initial,
  token,
  onSuccess,
  onCancel,
}: ContributorFormProps) {
  const isEdit = Boolean(initial);

  const [username, setUsername] = useState(initial?.username ?? '');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: Record<string, unknown> = { username, email: email.trim() || undefined, displayName: displayName.trim() || undefined };
    if (!isEdit || password) payload.password = password;
    if (isEdit) payload.isActive = isActive;

    const url = isEdit
      ? `/api/contributors/${initial!._id}`
      : '/api/contributors';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      onSuccess();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClasses = "rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#D62027]/5 focus:border-[#D62027] text-[#000000] font-medium placeholder:text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-in fade-in duration-300">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-[#D62027] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <p className="font-bold uppercase tracking-tight text-[10px]">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username *</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClasses}
            placeholder="e.g. john_doe"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Password {isEdit ? '(Optional)' : '*'}
          </label>
          <input
            type="password"
            required={!isEdit}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
            placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}
            minLength={6}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="contributor@example.com"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClasses}
                    placeholder="John Doe"
                />
            </div>
        </div>

        {isEdit && (
            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#D62027] focus:ring-[#D62027] accent-[#D62027]"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-black text-[#000000] uppercase tracking-widest">Active Account</span>
                    <span className="text-[10px] font-medium text-slate-400">Determines if the user can log in</span>
                </div>
            </label>
        )}
      </div>

      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 px-6 rounded-[1.25rem] bg-black text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Saving…' : (
              <>
                 <span>{isEdit ? 'Save Changes' : 'Create Account'}</span>
                 <Check className="w-4 h-4" />
              </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[1.25rem] bg-white px-8 py-4 text-xs font-black text-slate-400 border border-slate-200 uppercase tracking-widest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
