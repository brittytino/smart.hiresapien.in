'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ContributorForm from './ContributorForm';
import { Plus, X, Search } from 'lucide-react';

interface Contributor {
  _id: string;
  username: string;
  email?: string;
  displayName?: string;
  isActive: boolean;
  createdAt: string;
}

interface ContributorListProps {
  token: string;
}

export default function ContributorList({ token }: ContributorListProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // null = list view, 'create' = new form, contributor object = edit form
  const [formState, setFormState] = useState<null | 'create' | Contributor>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContributors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contributors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load contributors');
        return;
      }
      setContributors(data.contributors);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/contributors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Delete failed');
        return;
      }
      setDeleteConfirmId(null);
      fetchContributors();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex flex-col relative w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-[15px] border-b border-zinc-50 bg-white">
        <div>
          <h2 className="text-lg font-black tracking-tight text-zinc-900 uppercase leading-none mb-1">Team Members</h2>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Managing portal contributors</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search contributors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border-none rounded-xl pl-11 pr-4 py-3 text-xs font-bold uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 outline-none"
            />
          </div>
          <button
            onClick={() => setFormState('create')}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#D62027] px-6 py-3 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-red-500/10 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contributor</span>
          </button>
        </div>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-primary-red">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
            <p className="text-sm font-medium text-text-muted animate-pulse">Loading contributors…</p>
        </div>
      ) : contributors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border-light p-12 text-center text-sm">
          <p className="text-text-muted mb-4">No contributors yet.</p>
          <button
            onClick={() => setFormState('create')}
            className="font-bold text-primary-red"
          >
             Click to add your first contributor
          </button>
        </div>
      ) : (
        <div className="overflow-auto max-h-[600px] custom-scrollbar no-hover">
          <table className="w-full text-sm whitespace-nowrap border-collapse">
            <thead className="bg-zinc-50/50 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-left">Username</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-left">Display Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-left">Email</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-left">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-left">Created</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {contributors
                .filter(c => 
                  c.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  (c.displayName && c.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((c) => (
                <tr key={c._id} className="border-b border-zinc-50 no-hover">
                  <td className="px-8 py-7 font-black text-zinc-950">{c.username}</td>
                  <td className="px-8 py-7 text-zinc-600 font-bold">{c.displayName ?? '—'}</td>
                  <td className="px-8 py-7 text-zinc-600 font-bold">{c.email ?? '—'}</td>
                  <td className="px-8 py-7">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                        c.isActive
                          ? 'bg-[#06402B] text-white border-[#06402B]'
                          : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-zinc-500 font-bold">
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setFormState(c)}
                        className="text-sm font-black text-[#D62027] uppercase tracking-tighter"
                      >
                        Edit
                      </button>
                      <div className="w-px h-4 bg-zinc-200"></div>
                      {deleteConfirmId === c._id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(c._id)}
                            disabled={deleteLoading}
                            className="text-sm font-black text-[#D62027]"
                          >
                            {deleteLoading ? '...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-sm font-bold text-zinc-400"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                          <button
                            onClick={() => setDeleteConfirmId(c._id)}
                            className="text-sm font-bold text-zinc-400 uppercase tracking-tighter"
                          >
                            Delete
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Popup for Form */}
      {formState !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
           <div className="relative w-full max-w-lg mx-4 rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden">
               {/* Modal Header */}
               <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
                   <h3 className="font-extrabold text-lg text-zinc-900 uppercase tracking-tight">
                       {formState === 'create' ? 'Add New Contributor' : 'Edit Contributor'}
                   </h3>
                       <button 
                           onClick={() => setFormState(null)}
                           className="p-1.5 rounded-full text-zinc-400"
                       >
                       <X className="w-5 h-5" />
                   </button>
               </div>
               
               {/* Modal Body */}
               <div className="p-6">
                 <ContributorForm
                   initial={formState === 'create' ? undefined : formState}
                   token={token}
                   onSuccess={() => {
                     setFormState(null);
                     fetchContributors();
                   }}
                   onCancel={() => setFormState(null)}
                 />
               </div>
           </div>
        </div>
      )}
    </div>
  );
}
