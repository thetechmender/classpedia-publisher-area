import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, BookOpen, CreditCard, User,
  TrendingUp, HelpCircle, Star, BarChart3, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import OverviewTab from '@/components/dashboard/OverviewTab';
import BooksTab from '@/components/dashboard/BooksTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import AuthorProfileTab from '@/components/dashboard/AuthorProfileTab';

// Map extended nav IDs to the actual tab components
const TAB_ALIAS = {
  royalties: 'payments',
  tax:       'payments',
  reviews:   'books',
  analytics: 'payments',
  support:   'overview',
};

const MOBILE_NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'books',    label: 'Books',    icon: BookOpen },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile',  label: 'Profile',  icon: User },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: authorProfiles, isFetched: isProfileFetched } = useQuery({
    queryKey: ['author-profile'],
    queryFn: () => base44.entities.AuthorProfile.filter({ setup_complete: true }),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (isProfileFetched && authorProfiles && authorProfiles.length === 0) {
      navigate('/account-setup');
    }
  }, [isProfileFetched, authorProfiles, navigate]);

  const authorProfile = authorProfiles?.[0] ?? null;

  const { data: books = [], isLoading: isBooksLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date'),
    enabled: (authorProfiles?.length ?? 0) > 0,
  });

  const handleTabChange = (tab) => {
    setActiveTab(TAB_ALIAS[tab] || tab);
  };

  // Resolved tab for rendering
  const resolvedTab = TAB_ALIAS[activeTab] || activeTab;

  if (!isProfileFetched) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} authorProfile={authorProfile} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Desktop top bar */}
        <TopBar authorProfile={authorProfile} books={books} />

        {/* Mobile top bar */}
        <div className="md:hidden border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Classpedia</span>
          </div>
          <span className="text-sm font-medium capitalize">{activeTab}</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8">
          {resolvedTab === 'overview' && (
            <OverviewTab books={books} authorProfile={authorProfile} onTabChange={handleTabChange} />
          )}
          {resolvedTab === 'books' && (
            <BooksTab books={books} isLoading={isBooksLoading} />
          )}
          {resolvedTab === 'payments' && (
            <PaymentsTab books={books} authorProfile={authorProfile} />
          )}
          {resolvedTab === 'profile' && (
            <AuthorProfileTab
              authorProfile={authorProfile}
              onProfileUpdated={() => queryClient.invalidateQueries({ queryKey: ['author-profile'] })}
            />
          )}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex z-30">
          {MOBILE_NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                (TAB_ALIAS[activeTab] || activeTab) === id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}