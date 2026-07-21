'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  Plus,
  ChevronDown,
  GraduationCap,
  Pencil,
  Trash2,
  X,
  UserPlus,
  UserMinus,
  Search,
} from 'lucide-react';
import { useUI } from '@/components/providers/ui-provider';

// Renders children into document.body so 'fixed' overlays are never
// trapped by an ancestor's transform / overflow / contain CSS.
function ModalPortal({ children }: { children: React.ReactNode }) {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.body;
    setMounted(true);
  }, []);

  if (!mounted || !ref.current) return null;
  return createPortal(children, ref.current);
}

interface Student {
  _id: string;
  username: string;
  fullName?: string;
  studentId?: string;
  batch?: string;
  isActive: boolean;
}

interface Faculty {
  _id: string;
  username: string;
  fullName?: string;
}

interface Batch {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  studentCount: number;
  assignedFaculty?: Array<{ _id: string; fullName?: string; username: string }>;
}

export default function BatchesDetails({ token }: { token: string }) {
  const { confirm, showToast } = useUI();

  // ─── State ───────────────────────────────────────────────────────────────
  const [students, setStudents] = useState<Student[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Create / Edit modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createSelectedFaculty, setCreateSelectedFaculty] = useState<string[]>([]);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSelectedFaculty, setEditSelectedFaculty] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Student assignment
  const [assigningBatchId, setAssigningBatchId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [assigningFacultyBatchId, setAssigningFacultyBatchId] = useState<string | null>(null);
  const [facultySearch, setFacultySearch] = useState('');

  // ─── Data Loading ─────────────────────────────────────────────────────────
  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [studentsRes, batchesRes, facultyRes] = await Promise.all([
        fetch('/api/institution-admin/users?role=student', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/institution-admin/batches', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/institution-admin/users?role=faculty', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [studentsData, batchesData, facultyData] = await Promise.all([
        studentsRes.json(),
        batchesRes.json(),
        facultyRes.json(),
      ]);

      if (!studentsRes.ok) throw new Error(`Candidates not found (${studentsRes.status})`);
      if (!batchesRes.ok) throw new Error(`Batches data inaccessible (${batchesRes.status})`);
      if (!facultyRes.ok) throw new Error(`Faculty directory inaccessible (${facultyRes.status})`);

      setStudents(studentsData.users || []);
      setFacultyMembers(facultyData.users || []);
      const batchRows: Batch[] = batchesData.batches || [];
      setBatches(batchRows);

      if (!expandedBatchId && batchRows.length > 0) {
        setExpandedBatchId(batchRows[0]._id);
      }
    } catch (err: any) {
      console.error('[BatchesDetails] Error loading data:', err);
      setError('Network error while loading batch data.');
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ─── Create Batch ─────────────────────────────────────────────────────────
  async function handleCreateBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;

    setIsSaving(true);
    setError('');
    try {
      const res = await fetch('/api/institution-admin/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim(),
          assignedFaculty: createSelectedFaculty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create batch');
        return;
      }

      setShowCreateModal(false);
      setCreateName('');
      setCreateDescription('');
      setCreateSelectedFaculty([]);
      showToast('Batch created successfully.');
      await loadData();
    } catch {
      setError('Network error while creating batch.');
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Edit Batch ───────────────────────────────────────────────────────────
  function startEdit(batch: Batch) {
    setEditingBatch(batch);
    setEditName(batch.name);
    setEditDescription(batch.description ?? '');
    setEditSelectedFaculty(batch.assignedFaculty?.map(f => f._id) || []);
    setError('');
  }

  async function handleUpdateBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBatch || !editName.trim()) return;

    setIsSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/institution-admin/batches/${editingBatch._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim(),
          assignedFaculty: editSelectedFaculty,
          isActive: editingBatch.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to update batch');
        return;
      }

      setEditingBatch(null);
      setEditName('');
      setEditDescription('');
      setEditSelectedFaculty([]);
      showToast('Batch updated successfully.');
      await loadData();
    } catch {
      setError('Network error while updating batch.');
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Delete Batch ─────────────────────────────────────────────────────────
  async function handleDeleteBatch(batch: Batch) {
    const confirmed = await confirm({
      title: 'Delete Batch',
      message: `Delete batch "${batch.name}"? Student mappings will be removed from this batch.`,
      confirmLabel: 'Delete Batch',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    setError('');
    try {
      const res = await fetch(`/api/institution-admin/batches/${batch._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete batch');
        return;
      }

      showToast('Batch deleted successfully.');
      await loadData();
    } catch {
      setError('Network error while deleting batch.');
    }
  }

  // ─── Student Assignment ───────────────────────────────────────────────────
  async function handleAssignStudent(batchId: string, studentId: string, action: 'add' | 'remove') {
    try {
      const res = await fetch(`/api/institution-admin/batches/${batchId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Failed to update student batch assignment', 'error');
        return;
      }

      showToast(action === 'add' ? 'Student added to batch.' : 'Student removed from batch.');
      await loadData();
    } catch {
      showToast('Network error while updating student assignment.', 'error');
    }
  }

  // ─── Faculty Assignment ───────────────────────────────────────────────────
  async function handleAssignFacultyToggle(batchId: string, facultyId: string, isAssigned: boolean) {
    const batch = batches.find((b) => b._id === batchId);
    if (!batch) return;

    const currentFacultyIds = batch.assignedFaculty?.map((f) => f._id) || [];
    const newFacultyIds = isAssigned
      ? [...currentFacultyIds, facultyId]
      : currentFacultyIds.filter((id) => id !== facultyId);

    try {
      const res = await fetch(`/api/institution-admin/batches/${batchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: batch.name,
          description: batch.description,
          assignedFaculty: newFacultyIds,
          isActive: batch.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Failed to update faculty assignment', 'error');
        return;
      }

      showToast(isAssigned ? 'Faculty assigned to batch.' : 'Faculty removed from batch.');
      await loadData();
    } catch {
      showToast('Network error while updating faculty assignment.', 'error');
    }
  }

  // ─── Derived data for each batch ─────────────────────────────────────────
  function getBatchStudents(batchName: string) {
    return students.filter((s) => s.batch === batchName);
  }

  function getUnassignedStudents() {
    return students.filter((s) => !s.batch || s.batch.trim() === '');
  }

  function getOtherBatchStudents(batchName: string) {
    return students.filter((s) => s.batch && s.batch.trim() !== '' && s.batch !== batchName);
  }

  // Filtered unassigned for search
  const filteredUnassigned = useMemo(() => {
    const q = studentSearch.toLowerCase();
    if (!q) return getUnassignedStudents();
    return getUnassignedStudents().filter(
      (s) =>
        (s.fullName ?? '').toLowerCase().includes(q) ||
        s.username.toLowerCase().includes(q) ||
        (s.studentId ?? '').toLowerCase().includes(q)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, studentSearch]);

  const filteredFacultyMembers = useMemo(() => {
    const q = facultySearch.toLowerCase();
    if (!q) return facultyMembers;
    return facultyMembers.filter(
      (f) =>
        (f.fullName ?? '').toLowerCase().includes(q) ||
        f.username.toLowerCase().includes(q)
    );
  }, [facultyMembers, facultySearch]);

  // ─── UI helpers ──────────────────────────────────────────────────────────
  function closeModal() {
    setShowCreateModal(false);
    setEditingBatch(null);
    setError('');
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="g360-card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-lg font-black tracking-tight text-zinc-900 uppercase">Active Batches</h3>
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
            {batches.length} {batches.length === 1 ? 'batch' : 'batches'} · {students.length} students total
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-[#D62027] transition-colors" />
            <input 
              type="text"
              placeholder="Search batches..."
              value={studentSearch} 
              onChange={(e) => setStudentSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-zinc-50 border-none text-[10px] font-black uppercase tracking-widest placeholder:text-zinc-300 focus:ring-2 focus:ring-[#D62027]/10 transition-all outline-none w-48"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D62027] text-[10px] font-black text-white hover:bg-[#b01a1f] transition-all uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Batch</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D62027]" />
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#D62027]">
              {error}
            </div>
          )}

          {batches.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center border border-dashed border-zinc-200 rounded-2xl">
              <div className="p-4 bg-zinc-50 rounded-2xl mb-3">
                <Users className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No batches created yet</p>
              <p className="text-zinc-300 text-[11px] mt-1">Click &quot;Create Batch&quot; to get started</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-auto custom-scrollbar pr-2">
              {batches.map((batch) => {
                const enrolled = getBatchStudents(batch.name);
                const expanded = expandedBatchId === batch._id;
                const isAssigning = assigningBatchId === batch._id;

                return (
                  <div
                    key={batch._id}
                    className="border border-zinc-100 rounded-2xl bg-white overflow-hidden transition-all duration-300"
                  >
                    {/* Batch header row */}
                    <div
                      className="p-5 md:p-6 flex items-center justify-between cursor-pointer bg-zinc-50/50 transition-colors no-hover"
                      onClick={() => setExpandedBatchId(expanded ? null : batch._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="text-base font-black text-zinc-900 tracking-tight uppercase leading-none">
                            {batch.name}
                          </h4>
                          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5">
                            {enrolled.length} Students Enrolled
                            <span className="mx-2 text-zinc-300">·</span>
                            <span className={batch.isActive ? 'text-emerald-600' : 'text-zinc-400'}>
                              {batch.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                          {batch.description && (
                            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{batch.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(batch);
                          }}
                          className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all"
                          title="Edit batch"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDeleteBatch(batch);
                          }}
                          className="rounded-lg border border-red-100 bg-white p-2 text-red-400 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all"
                          title="Delete batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronDown
                          className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ml-1 ${expanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded content */}
                    {expanded && (
                      <div className="border-t border-zinc-100 bg-white">
                        <div className="p-6">
                          {/* Assigned Faculty Section */}
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                               Assigned Faculty ({batch.assignedFaculty?.length || 0})
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                setAssigningFacultyBatchId(assigningFacultyBatchId === batch._id ? null : batch._id);
                                setFacultySearch('');
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                assigningFacultyBatchId === batch._id
                                  ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                  : 'bg-black text-white hover:bg-zinc-800 shadow-sm shadow-zinc-200'
                              }`}
                            >
                              {assigningFacultyBatchId === batch._id ? (
                                <>
                                  <X className="w-3.5 h-3.5" />
                                  Done
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  Manage Faculty
                                </>
                              )}
                            </button>
                          </div>

                          {(!batch.assignedFaculty || batch.assignedFaculty.length === 0) ? (
                            <div className="py-6 flex flex-col items-center text-center border border-dashed border-zinc-100 rounded-xl mb-4">
                              <Users className="w-6 h-6 text-zinc-200 mb-2" />
                              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">
                                No faculty assigned
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                              {batch.assignedFaculty.map((fac) => (
                                <div
                                  key={fac._id}
                                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-zinc-400">
                                      <Users className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-[11px] font-bold text-zinc-900 leading-none">
                                        {fac.fullName || fac.username}
                                      </p>
                                      <p className="text-[9px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">
                                        @{fac.username}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void handleAssignFacultyToggle(batch._id, fac._id, false)}
                                    className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 transition-colors"
                                    title="Remove faculty"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Manage Faculty Selection Panel */}
                          {assigningFacultyBatchId === batch._id && (
                            <div className="mt-4 border border-zinc-100 rounded-2xl p-4 bg-zinc-50/30">
                              <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <input
                                  type="text"
                                  value={facultySearch}
                                  onChange={(e) => setFacultySearch(e.target.value)}
                                  placeholder="Search faculty by name or username…"
                                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all outline-none"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                                {filteredFacultyMembers.map((fac) => {
                                  const isAssigned = batch.assignedFaculty?.some(a => a._id === fac._id);
                                  return (
                                    <div
                                      key={fac._id}
                                      onClick={() => void handleAssignFacultyToggle(batch._id, fac._id, !isAssigned)}
                                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                        isAssigned 
                                          ? 'border-emerald-100 bg-emerald-50 text-emerald-900' 
                                          : 'border-zinc-100 bg-white hover:border-zinc-300 text-zinc-600'
                                      }`}
                                    >
                                      <div className="flex flex-col">
                                        <p className="text-[11px] font-bold leading-none mb-1">
                                          {fac.fullName || fac.username}
                                        </p>
                                        <p className="text-[9px] font-medium opacity-60 uppercase tracking-widest">
                                          @{fac.username}
                                        </p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                        isAssigned ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-200'
                                      }`}>
                                        {isAssigned && <Plus className="w-3 h-3 rotate-45" />}
                                        {!isAssigned && <Plus className="w-3 h-3" />}
                                      </div>
                                    </div>
                                  );
                                })}
                                {filteredFacultyMembers.length === 0 && (
                                  <div className="col-span-full py-6 text-center text-zinc-400 text-[11px] font-bold uppercase tracking-widest">
                                    No faculty found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-6 pt-0 border-t border-zinc-100/50">
                          {/* Enrolled students */}
                          <div className="flex items-center justify-between mb-4 mt-6">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              Enrolled Students ({enrolled.length})
                            </h5>
                            <button
                              type="button"
                              onClick={() => {
                                setAssigningBatchId(isAssigning ? null : batch._id);
                                setStudentSearch('');
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                isAssigning
                                  ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                  : 'bg-[#D62027] text-white hover:bg-[#b01a1f] shadow-sm shadow-red-500/20'
                              }`}
                            >
                              {isAssigning ? (
                                <>
                                  <X className="w-3.5 h-3.5" />
                                  Done
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  Add Students
                                </>
                              )}
                            </button>
                          </div>

                          {enrolled.length === 0 ? (
                            <div className="py-6 flex flex-col items-center text-center border border-dashed border-zinc-100 rounded-xl mb-4">
                              <GraduationCap className="w-6 h-6 text-zinc-200 mb-2" />
                              <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">
                                No students enrolled
                              </p>
                            </div>
                          ) : (
                            <div className="grid gap-2 mb-4">
                              {enrolled.map((student) => (
                                <div
                                  key={student._id}
                                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 bg-zinc-50/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="text-sm font-bold text-zinc-900 leading-none">
                                        {student.fullName || student.username}
                                      </p>
                                      <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">
                                        @{student.username}
                                        {student.studentId && ` · ID: ${student.studentId}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black px-2.5 py-1 uppercase tracking-widest rounded-lg bg-emerald-600 text-white border border-emerald-100">
                                      Enrolled
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => void handleAssignStudent(batch._id, student._id, 'remove')}
                                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-700 transition-all"
                                      title="Remove from batch"
                                    >
                                      <UserMinus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add students panel */}
                          {isAssigning && (
                            <div className="mt-4 border-t border-zinc-100 pt-4">
                              <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                                Add Unassigned Students
                              </h5>

                              {/* Search */}
                              <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <input
                                  type="text"
                                  value={studentSearch}
                                  onChange={(e) => setStudentSearch(e.target.value)}
                                  placeholder="Search by name, username, or student ID…"
                                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all font-medium"
                                />
                              </div>

                              {filteredUnassigned.length === 0 ? (
                                <div className="py-5 flex flex-col items-center text-center border border-dashed border-zinc-100 rounded-xl">
                                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">
                                    {studentSearch
                                      ? 'No matching unassigned students'
                                      : 'All students are already assigned to a batch'}
                                  </p>
                                </div>
                              ) : (
                                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                                  {filteredUnassigned.map((student) => (
                                    <div
                                      key={student._id}
                                      className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-100 hover:border-[#D62027]/20 bg-white transition-colors"
                                    >
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <p className="text-sm font-bold text-zinc-900 leading-none">
                                          {student.fullName || student.username}
                                        </p>
                                          <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">
                                            @{student.username}
                                            {student.studentId && ` · ID: ${student.studentId}`}
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => void handleAssignStudent(batch._id, student._id, 'add')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D62027] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#b01a1f] transition-all shadow-sm shadow-red-500/20 active:scale-95"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Students already in other batches — informational */}
                              {getOtherBatchStudents(batch.name).length > 0 && (
                                <div className="mt-4">
                                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-2">
                                    In Another Batch ({getOtherBatchStudents(batch.name).length}) — Cannot reassign directly
                                  </p>
                                  <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                                    {getOtherBatchStudents(batch.name).map((student) => (
                                      <div
                                        key={student._id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 opacity-60"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div>
                                            <p className="text-sm font-bold text-zinc-500 leading-none">
                                              {student.fullName || student.username}
                                            </p>
                                            <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">
                                              Batch: {student.batch}
                                            </p>
                                          </div>
                                        </div>
                                        <span className="text-[9px] font-black px-2.5 py-1 uppercase tracking-widest rounded-lg bg-zinc-100 text-zinc-400">
                                          Assigned
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Modal (portalled to document.body) ─────────── */}
      {(showCreateModal || editingBatch) && (
        <ModalPortal>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-white border border-zinc-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Red accent bar */}
              <div className="h-1.5 w-full bg-[#D62027]" />

              <div className="p-6 md:p-8">
                {/* Modal header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D62027] mb-1">
                      {editingBatch ? 'Edit Batch' : 'New Batch'}
                    </p>
                    <h4 className="text-xl font-black tracking-tight text-zinc-900">
                      {editingBatch ? editName || 'Edit Batch' : 'Create a Batch'}
                    </h4>
                  </div>
                  <button
                    onClick={closeModal}
                    className="rounded-full p-2 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#D62027]">
                    {error}
                  </div>
                )}

                <form onSubmit={editingBatch ? handleUpdateBatch : handleCreateBatch} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Batch Name <span className="text-[#D62027]">*</span>
                    </label>
                    <input
                      value={editingBatch ? editName : createName}
                      onChange={(e) =>
                        editingBatch ? setEditName(e.target.value) : setCreateName(e.target.value)
                      }
                      required
                      placeholder="e.g. 2024-26 MBA"
                      className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all outline-none"
                    />
                    <p className="text-[10px] text-zinc-400 ml-1">Max 80 characters · Must be unique within institution</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Description <span className="text-zinc-300 font-bold">(Optional)</span>
                    </label>
                    <textarea
                      value={editingBatch ? editDescription : createDescription}
                      onChange={(e) =>
                        editingBatch ? setEditDescription(e.target.value) : setCreateDescription(e.target.value)
                      }
                      placeholder="Short description of this cohort…"
                      rows={3}
                      className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#D62027]/10 focus:border-[#D62027] transition-all resize-none outline-none"
                    />
                  </div>

                  {/* Faculty Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Assign Faculty <span className="text-zinc-300 font-bold">(Optional)</span>
                    </label>
                    <div className="max-h-32 overflow-y-auto border border-zinc-100 rounded-xl p-2 space-y-2 bg-zinc-50/50">
                      {facultyMembers.length === 0 ? (
                        <p className="text-[10px] text-zinc-400 p-2 text-center uppercase tracking-widest font-bold">No faculty found</p>
                      ) : (
                        facultyMembers.map((fac) => {
                          const isSelected = editingBatch 
                            ? editSelectedFaculty.includes(fac._id)
                            : createSelectedFaculty.includes(fac._id);
                          
                          return (
                            <label key={fac._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (editingBatch) {
                                    setEditSelectedFaculty(prev => 
                                      checked ? [...prev, fac._id] : prev.filter(id => id !== fac._id)
                                    );
                                  } else {
                                    setCreateSelectedFaculty(prev => 
                                      checked ? [...prev, fac._id] : prev.filter(id => id !== fac._id)
                                    );
                                  }
                                }}
                                className="w-4 h-4 rounded border-zinc-300 text-[#D62027] focus:ring-[#D62027]/20"
                              />
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-900 transition-colors">
                                  {fac.fullName || fac.username}
                                </span>
                                <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">
                                  @{fac.username}
                                </span>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 ml-1">Assigned faculty can view insights for this batch</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 rounded-xl bg-[#D62027] text-white px-6 py-3.5 text-xs font-black uppercase tracking-widest hover:bg-[#b01a1f] transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSaving ? 'Saving…' : editingBatch ? 'Update Batch' : 'Create Batch'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSaving}
                      className="px-6 py-3.5 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 hover:text-zinc-900 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
