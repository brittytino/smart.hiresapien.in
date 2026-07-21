'use client';

import React, { useEffect, useState } from 'react';
import DomainSelector from './questions/DomainSelector';
import QuestionForm from './questions/QuestionForm';
import MyQuestions from './questions/MyQuestions';
import DomainNavbar from './questions/DomainNavbar';
import DashboardLayout from '../basic/dashboard-layout';
import { DOMAINS, Domain } from '@/lib/domains';
import { CONTRIBUTOR_SIDEBAR_ITEMS } from '@/lib/navigation-constants';
import { ArrowRight } from 'lucide-react';

type View = 'categories' | 'form' | 'submissions';

export default function ContributorLanding() {
  const [auth] = useState<{ token: string | null; username: string | null }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const t = sessionStorage.getItem('contributor_token');
        if (t) {
          const payload = JSON.parse(atob(t.split('.')[1]));
          return { token: t, username: payload.username ?? null };
        }
      } catch {
        // Fallback
      }
    }
    return { token: null, username: null };
  });

  const [view, setView] = useState<View>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [profile, setProfile] = useState<{ fullName: string; username: string } | null>(null);

  useEffect(() => {
    if (auth.token) {
      fetch('/api/contributor/profile', {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setProfile(data.user);
        })
        .catch(err => console.error('Failed to fetch contributor profile:', err));
    }
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [auth.token]);

  function handleLogout() {
    sessionStorage.removeItem('contributor_token');
    window.location.href = '/';
  }

  function handleCategorySelect(category: string) {
    setSelectedCategory(category);
    setSelectedDomain(DOMAINS[0]);
    setView('form');
  }

  function handleDomainSelect(domain: Domain) {
    setSelectedDomain(domain);
    setView('form');
  }

  function handleStartContributing() {
    setView('form');
  }

  function handleFormSuccess() {
    setRefreshKey((k) => k + 1);
    setView('submissions');
  }

  function handleBack() {
    if (view === 'form') {
      setView('categories');
      setSelectedDomain(null);
    } else if (view === 'submissions') {
      setView('categories');
    } else {
      window.history.back();
    }
  }

  if (!auth.token || !auth.username) return null;

  const sidebarItems = CONTRIBUTOR_SIDEBAR_ITEMS.map((item) => ({
    ...item,
    active: item.tab === 'categories' ? view !== 'submissions' : view === 'submissions',
    onClick: () => {
      if (item.tab === 'categories') {
        setView('categories');
        setSelectedDomain(null);
        setSelectedCategory(null);
      } else if (item.tab === 'submissions') {
        setView('submissions');
      }
    },
  }));

  return (
    <DashboardLayout
      userType="Contributor"
      username={profile?.fullName || profile?.username || auth.username || 'Contributor'}
      onLogout={handleLogout}
      sidebarItems={sidebarItems}
      headerTitle={
        view === 'categories' ? 'CONTRIBUTOR' :
        view === 'form' ? selectedDomain?.name || 'Add Question' :
        view === 'submissions' ? 'SUBMISSION' : 'CONTRIBUTOR'
      }
      onBack={handleBack}
      headerSubtitle={
        view === 'categories'
          ? 'Choose a program category to contribute to.'
          : view === 'form' 
            ? 'Fill in the details below to create a new assessment question.' 
            : 'Manage and review your question submissions.'
      }
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="relative">
          {view === 'submissions' ? (
            <div className="w-full">
              <MyQuestions token={auth.token!} refreshKey={refreshKey} />
            </div>
          ) : (
            <div className="w-full">
              {view === 'categories' && (
                <div className="pl-[10px] pr-8 md:pl-[10px] md:pr-12 py-8 md:py-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10">
                    <button
                      onClick={() => handleCategorySelect('MBA')}
                      className="group relative w-full bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 text-center transition-all duration-500 hover:border-[#D62027] hover:shadow-[0_40px_80px_-20px_rgba(230,39,39,0.15)] hover:-translate-y-2 active:scale-95 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-linear-to-br from-[#D62027]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-[#000000] rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-3xl font-black shadow-xl group-hover:bg-[#D62027] transition-colors duration-500">
                          MBA
                        </div>
                        <h3 className="text-2xl font-black text-[#000000] mb-4 tracking-tight uppercase">
                          Business & Management
                        </h3>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                          Contribute to Cognitive Intelligence, Business Intelligence, Digital Business, and more.
                        </p>
                        <div className="inline-flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest bg-[#D62027] px-6 py-3 rounded-full hover:bg-[#cc1f1f] transition-all">
                          <span>Explore Domains</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {view === 'form' && selectedDomain && (
                <div className="w-full">
                  <QuestionForm
                    domain={selectedDomain}
                    token={auth.token!}
                    onSuccess={handleFormSuccess}
                    onCancel={() => {
                      setView('categories');
                      setSelectedDomain(null);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {(view === 'form') && (
        <DomainNavbar 
          selectedDomain={selectedDomain} 
          onSelect={(d) => setSelectedDomain(d)}
        />
      )}
    </DashboardLayout>
  );
}
