import { 
  LayoutDashboard, 
  ClipboardList, 
  Building2, 
  Users, 
  ClipboardCheck, 
  Target, 
  BarChart3, 
  BarChart,
  Activity,
  UserPlus, 
  TrendingUp,
  PlusCircle,
  ListTodo
} from 'lucide-react';
import React from 'react';
export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  tab?: string;
  active?: boolean;
}

export const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    tab: 'overview',
  },
  {
    label: 'PRI Test Builder',
    icon: ClipboardList,
    href: '/admin/pri-test',
  },
  {
    label: 'Institution Management',
    icon: Building2,
    tab: 'institutions',
  },
  {
    label: 'PRI Management',
    icon: ClipboardList,
    tab: 'pri-tests',
  },
  {
    label: 'Contributors',
    icon: Users,
    tab: 'contributors',
  },
  {
    label: 'Review Contributions',
    icon: ClipboardCheck,
    tab: 'review',
  },
];

export const FACULTY_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Overview Feed',
    icon: LayoutDashboard,
    tab: 'overview',
  },
  {
    label: 'Student Insights',
    icon: Activity,
    tab: 'students',
  },
  {
    label: 'Batch Insights',
    icon: BarChart3,
    tab: 'batch-insights',
  },
];

export const INSTITUTION_ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Overview Feed',
    icon: LayoutDashboard,
    tab: 'overview',
  },
  {
    label: 'Batches',
    icon: Users,
    tab: 'batches',
  },
  {
    label: 'Batch Insights',
    icon: BarChart3,
    tab: 'batch-insights',
  },
  {
    label: 'PRI Management',
    icon: ClipboardCheck,
    tab: 'pri-tests',
  },
  {
    label: 'Faculty Management',
    icon: Users,
    tab: 'faculty',
  },
  {
    label: 'Student Management',
    icon: UserPlus,
    tab: 'student',
  },
];

export const STUDENT_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'My Overview',
    icon: LayoutDashboard,
    tab: 'dashboard',
  },
  {
    label: 'My Results',
    icon: TrendingUp,
    tab: 'results',
  },
];

export const CONTRIBUTOR_SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Add Question',
    icon: PlusCircle,
    tab: 'categories',
  },
  {
    label: 'My Submissions',
    icon: ListTodo,
    tab: 'submissions',
  },
];
