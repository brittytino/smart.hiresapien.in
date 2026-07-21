'use client';

import React from 'react';
import Image from 'next/image';
import { LogOut, LayoutDashboard, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FloatingElements from './floating-elements';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'Admin' | 'Institution Admin' | 'Contributor' | 'Faculty' | 'Student';
  username?: string | null;
  onLogout: () => void;
  sidebarItems: SidebarItem[];
  headerTitle?: string;
  headerSubtitle?: string;
  onBack?: () => void;
  sidebarActions?: React.ReactNode;
  headerActions?: React.ReactNode;
  isBlurred?: boolean;
  showBackButton?: boolean;
  institutionName?: string;
  sidebarExtras?: React.ReactNode;
}

export default function DashboardLayout({
  children,
  userType,
  username,
  onLogout,
  sidebarItems,
  headerTitle,
  headerSubtitle,
  onBack,
  sidebarActions,
  headerActions,
  isBlurred,
  showBackButton = true,
  institutionName,
  sidebarExtras,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Restore sidebar state from localStorage after mount
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') setIsCollapsed(true);
    setMounted(true);
  }, []);

  function toggleSidebar() {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  }

  if (!mounted) return null;


  return (
    <div className="flex h-screen w-full bg-page-bg font-sans overflow-hidden relative transition-colors duration-300">
      {/* Sidebar */}
      <aside 
        className={`relative z-20 hidden md:flex flex-col border-r border-gray-100 bg-white h-full transition-all duration-500 ease-in-out ${
          isCollapsed ? 'w-24' : 'w-64 md:w-72'
        } ${isBlurred ? 'blur-[2px] opacity-70 pointer-events-none' : ''}`}
      >
        {/* Logo Section & Toggle */}
        <div className={`flex items-center px-6 h-[80px] shrink-0 border-b border-gray-100 relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <Image
                src="/grad360.png"
                alt="grad360"
                width={130}
                height={44}
                style={{ objectFit: 'contain' }}
                priority
              />
            )}
            <button 
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
        </div>

        <nav className="flex-1 space-y-3 flex flex-col px-6 pt-6 overflow-x-hidden custom-scrollbar">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.active;
              
              const activeClass = isActive
                ? 'bg-[#D62027] text-white shadow-sm'
                : 'text-slate-600 hover:text-zinc-950 hover:bg-zinc-50';
                
              const iconClass = isActive 
                ? 'text-white' 
                : 'text-slate-500 group-hover:text-zinc-950';

              const content = (
                <>
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${iconClass}`} />
                  {!isCollapsed && (
                    <span className="font-medium text-[15px] tracking-tight truncate animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.label}
                    </span>
                  )}
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-[16px] transition-all duration-300 group ${activeClass} ${isCollapsed ? 'justify-center px-0' : ''} hover:scale-[1.02] active:scale-95`}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`flex w-full items-center gap-4 px-4 py-3 rounded-[16px] transition-all duration-300 group ${activeClass} ${isCollapsed ? 'justify-center px-0' : ''} hover:scale-[1.02] active:scale-95`}
                >
                  {content}
                </button>
              );
            })}
        </nav>
        
        {/* Sidebar Extras Slot (e.g., Batch Selector) */}
        {!isCollapsed && sidebarExtras && (
          <div className="px-6 py-4 animate-in fade-in slide-in-from-left-4 duration-500">
            {sidebarExtras}
          </div>
        )}

        {/* Sidebar Footer: Profile & Sign Out */}
        <div className={`mt-auto px-6 pb-6 pt-6 flex flex-col gap-6 w-full ${isCollapsed ? 'items-center' : ''}`}>
            {/* User Profile Info */}
            <div className={`flex items-center gap-3 px-2 w-full ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-11 h-11 flex shrink-0 items-center justify-center text-zinc-900 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100 shadow-sm transition-all hover:bg-white hover:border-zinc-200">
                    <User className="w-5 h-5 text-zinc-600" strokeWidth={2.5} />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-black text-zinc-950 truncate tracking-tight leading-none mb-1">
                      {username && username !== userType ? username : (userType || 'Member')}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center">
                        <span className="text-[10px] font-bold text-[#D62027] uppercase tracking-widest leading-none">
                          {userType || 'ROLE'}
                        </span>
                      </div>
                      {institutionName && (
                        <div className="flex items-center">
                          <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-[0.15em] truncate max-w-[160px]">
                            {institutionName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Logout Button */}
            <button 
                onClick={onLogout}
                className={`flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#0f172a] hover:bg-black text-white transition-all duration-300 shadow-md group active:scale-[0.98] ${
                  isCollapsed ? 'w-12 h-12 rounded-xl' : 'w-full'
                }`}
                title={isCollapsed ? "Sign Out" : ""}
            >
                <LogOut className="w-4 h-4 text-white/80 group-hover:text-white transition-colors shrink-0" />
                {!isCollapsed && <span className="text-xs font-black tracking-widest uppercase whitespace-nowrap">SIGN OUT</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`relative ${isBlurred ? 'z-50' : 'z-auto'} flex-1 flex flex-col h-full overflow-hidden bg-page-bg`}>
        <FloatingElements mode="dashboard" density="low" />
         <header className="h-[80px] shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 sticky top-0">
           <div className="max-w-[1600px] mx-auto w-full h-full flex items-center justify-between px-[15px]">
             {/* Left side: Mobile branding / Desktop context */}
              <div className="flex items-center gap-2">
                  {/* Mobile Logo */}
                  <div className="md:hidden flex items-center">
                    <Image src="/grad360.png" alt="grad360" width={110} height={36} style={{ objectFit: 'contain' }} priority />
                  </div>
                  
                  {/* Title and Subtitle in Header */}
                  <div className="hidden md:flex flex-col gap-1">
                      {headerTitle && (
                          <h2 className="text-[28px] font-black text-zinc-950 tracking-[-0.04em] leading-none uppercase">
                              {headerTitle}
                          </h2>
                      )}
                      {headerSubtitle && (
                          <p className="g360-subheading mt-1.5">
                              {headerSubtitle}
                          </p>
                      )}
                  </div>
              </div>

             {/* Right side: External Controls (Sign Out, etc.) */}
             <div className="flex items-center gap-4">
                 {headerActions}
                 {showBackButton && (
                   <button 
                      onClick={() => (onBack ? onBack() : router.back())}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-border-light text-[10px] font-black text-text-muted hover:text-[#D62027] hover:border-red-100 hover:bg-red-50/30 transition-all uppercase tracking-widest shadow-sm group"
                   >
                      <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                      <span>Back</span>
                   </button>
                 )}
             </div>
           </div>
         </header>

         {/* Content Scroll Container */}
         <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative z-auto">
            <div className="max-w-[1600px] mx-auto w-full p-[15px] pb-32">
               {children}
            </div>
         </div>

         {/* Mobile Bottom Navigation Bar */}
         <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 z-50 px-4 pb-safe-offset-2 pt-3 flex items-center justify-around shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.active;
              
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`flex flex-col items-center gap-1.5 px-3 py-1.5 transition-all duration-300 relative ${
                    isActive ? 'text-[#D62027]' : 'text-zinc-400'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'scale-100'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60'}`}>
                    {item.label.split(' ').pop()}
                  </span>
                  {isActive && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#D62027] rounded-full shadow-[0_0_10px_#D62027]" />
                  )}
                </button>
              );
            })}
         </nav>
      </main>
    </div>
  );
}
