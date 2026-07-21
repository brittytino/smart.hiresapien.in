'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { User, XCircle, AlertCircle, Search } from 'lucide-react';
import PriReportView from '@/components/report/PriReportView';

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  responseId: string;
  studentName: string;
  token: string;
}

export default function AIReportModal({
  isOpen,
  onClose,
  responseId,
  studentName,
  token
}: AIReportModalProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !responseId) return;

    async function loadReport() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/student/reports/${responseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load report');
        setReportData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load PRI report insights');
        setReportData(null);
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [isOpen, responseId, token]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-[2.5rem] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h4 className="text-lg font-black text-zinc-900 tracking-tight uppercase leading-none mb-1">
                {studentName}
              </h4>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 leading-none">
                Detailed PRI Performance Insight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-500"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="w-12 h-12 rounded-full border-4 border-zinc-200 border-t-[#D62027] animate-spin" />
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                Fetching PRI Report insights...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white p-10 border border-red-200 rounded-3xl text-center max-w-md mx-auto my-10 shadow-sm">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
              <h4 className="text-sm font-black uppercase text-zinc-900 mb-2">Evaluation Pending</h4>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                {error}
              </p>
            </div>
          ) : reportData ? (
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
              <PriReportView reportData={reportData} variant="embedded" />
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center gap-4 bg-white border border-dashed border-zinc-200 rounded-3xl max-w-2xl mx-auto my-10">
              <div className="p-5 bg-zinc-50 rounded-full mb-2">
                <Search className="w-8 h-8 text-zinc-300" />
              </div>
              <h4 className="text-lg font-black text-zinc-800 uppercase tracking-tight">No PRI Data</h4>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest max-w-sm leading-relaxed">
                A detailed PRI report is not yet available for this student. They must complete evaluating first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
