'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PriReportView from '@/components/report/PriReportView';
import { useUI } from '@/components/providers/ui-provider';

const API_URL = '/api/student/reports';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const responseId = params.id as string;
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { confirm, showToast } = useUI();

  const authRole =
    typeof window !== 'undefined'
      ? (sessionStorage.getItem('auth_role') || '').toLowerCase()
      : '';
  const hasAdminToken =
    typeof window !== 'undefined' &&
    Boolean(sessionStorage.getItem('admin_token'));
  const hasInstitutionAdminToken =
    typeof window !== 'undefined' &&
    Boolean(sessionStorage.getItem('institution_admin_token'));
  const isAdminViewer =
    authRole === 'admin' ||
    authRole === 'institution_admin' ||
    authRole === 'institution-admin' ||
    hasAdminToken ||
    hasInstitutionAdminToken;
  const canRegenerate = authRole === 'admin' || hasAdminToken;

  const loadReport = async () => {
    const token =
      sessionStorage.getItem('admin_token') ||
      sessionStorage.getItem('institution_admin_token') ||
      sessionStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/${responseId}`, { headers });
    if (res.status === 403) {
      setAccessDenied(true);
      return;
    }
    if (!res.ok) throw new Error('Report not found');
    const data = await res.json();
    setAccessDenied(false);
    setReportData(data);
  };

  useEffect(() => {
    if (!responseId) return;

    loadReport()
      .catch((err) => {
        console.error('Failed to fetch report:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [responseId]);

  const handleRegenerate = async () => {
    if (!canRegenerate || regenerating) return;

    const approved = await confirm({
      title: 'Regenerate AI Insights',
      message: 'This will refresh and save AI insights for this report response. Continue?',
      confirmLabel: 'Regenerate Insights',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });
    if (!approved) return;

    try {
      setRegenerating(true);
      const token =
        sessionStorage.getItem('admin_token') ||
        sessionStorage.getItem('institution_admin_token') ||
        sessionStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/reports/${responseId}/regenerate`, {
        method: 'POST',
        headers,
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to regenerate insights');

      await loadReport();
      if (payload?.insights?.status !== 'ok') {
        showToast(payload?.insights?.error || 'AI insights are still unavailable. Check the insights service.', 'info');
      } else {
        showToast('AI insights regenerated successfully.', 'success');
      }
    } catch (error: any) {
      console.error('Failed to regenerate report:', error);
      showToast(error?.message || 'Failed to regenerate insights.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const handleBack = React.useCallback(() => {
    const dashboardPath = authRole === 'admin' 
      ? '/admin' 
      : (authRole === 'institution_admin' || authRole === 'institution-admin')
        ? '/institution-admin'
        : '/student';

    // If we have history, try moving back
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      
      // Fallback: if we're still here after a bit, push to the dashboard
      setTimeout(() => {
        if (window.location.pathname === `/report/${responseId}`) {
          router.push(dashboardPath);
        }
      }, 300);
    } else {
      router.push(dashboardPath);
    }
  }, [authRole, responseId, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName.toLowerCase() || '')) return;

      if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  if (loading || (!reportData && !accessDenied)) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D62027] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#0f172a] font-bold uppercase tracking-widest text-sm">Loading AI Insights...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="bg-white p-12 rounded-4xl shadow-xl max-w-md text-center border border-red-50/50">
          <h2 className="text-2xl font-black tracking-[-0.05em] text-[#0f172a] mb-3 uppercase">Access Restricted</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            Your psychometric evaluation has not met the required thresholds, or the results have not been published by your institution yet.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-[#D62027] text-white rounded-2xl font-black tracking-widest text-xs uppercase hover:bg-[#b01a20] transition-colors shadow-lg shadow-red-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!reportData?.studentInfo) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="bg-white p-12 rounded-4xl shadow-xl max-w-md text-center border border-red-50/50">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black tracking-[-0.05em] text-[#0f172a] mb-3 uppercase">Report Not Found</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            The report details for ID <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[#D62027] font-bold">{responseId}</span> could not be retrieved or the data structure is invalid.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-[#D62027] text-white rounded-2xl font-black tracking-widest text-xs uppercase hover:bg-[#b01a20] transition-colors shadow-lg shadow-red-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <PriReportView
      reportData={reportData}
      variant="page"
      onBack={handleBack}
      canRegenerate={canRegenerate}
      onRegenerate={handleRegenerate}
      regenerating={regenerating}
      canViewFailedDetails={isAdminViewer}
    />
  );
}
