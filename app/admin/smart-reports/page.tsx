'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Building2, 
  BookOpen, 
  Users, 
  ClipboardCheck 
} from 'lucide-react';
import DashboardLayout from '@/components/basic/dashboard-layout';
import SmartAdminReports from '@/components/admin/pri/SmartAdminReports';

export default function SmartReportsAdminPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState('Admin');

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('admin_token') || sessionStorage.getItem('auth_token');
      const role = sessionStorage.getItem('auth_role');
      
      if (!storedToken || role !== 'admin') {
        router.replace('/');
      } else {
        setToken(storedToken);
        const username = sessionStorage.getItem('auth_username') || 'Admin';
        setAdminUser(username);
      }
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_role');
    sessionStorage.removeItem('auth_username');
    window.location.href = '/';
  };

  const handleBack = () => {
    router.push('/admin');
  };

  if (!mounted || !token) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const sidebarItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'PRI Test Builder', icon: ClipboardList, href: '/admin/pri-test' },
    { label: 'SMART Reports', icon: ClipboardCheck, active: true },
    { label: 'Institution Management', icon: Building2, href: '/admin?tab=institutions' },
    { label: 'PRI Management', icon: ClipboardList, href: '/admin?tab=pri-tests' },
    { label: 'Approved Bank', icon: BookOpen, href: '/admin?tab=approved-bank' },
    { label: 'Contributors', icon: Users, href: '/admin?tab=contributors' },
    { label: 'Contribution Review', icon: ClipboardCheck, href: '/admin?tab=review' },
  ];

  return (
    <DashboardLayout
      userType="Admin"
      username={adminUser}
      onLogout={handleLogout}
      sidebarItems={sidebarItems}
      onBack={handleBack}
      headerTitle="SMART Candidate Reports"
      headerSubtitle="Full Stack SDE Simulation Diagnostics"
      institutionName="SMART Admin"
    >
      <div className="p-4 bg-slate-50 min-h-screen">
        <SmartAdminReports />
      </div>
    </DashboardLayout>
  );
}
