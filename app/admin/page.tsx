import AdminDashboard from '@/components/admin/dashboard';

export const metadata = {
  title: 'Admin Dashboard — Grad360MBA',
};

import { Suspense } from 'react';

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading Dashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
