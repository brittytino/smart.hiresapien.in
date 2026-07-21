import { Suspense } from 'react';
import StudentDashboard from '@/components/student/dashboard';
import FullScreenLoader from '@/components/basic/FullScreenLoader';

export const metadata = {
  title: 'Student Dashboard — Grad360MBA',
};

export default function StudentPage() {
  return (
    <Suspense fallback={<FullScreenLoader message="Loading your student dashboard..." />}>
      <StudentDashboard />
    </Suspense>
  );
}
