import { Suspense } from 'react';
import ExamPortalMain from '@/components/exam-portal/ExamPortalMain';
import '../exam.css';

export const metadata = {
  title: 'PRI Test Engine — Grad360MBA',
};

export default function StudentTestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold">Preparing your test environment...</div>}>
      <ExamPortalMain />
    </Suspense>
  );
}
