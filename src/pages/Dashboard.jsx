import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, BookOpen, CreditCard, User, Menu, X, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import OverviewTab from '@/components/dashboard/OverviewTab';
import BooksTab from '@/components/dashboard/BooksTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import AuthorProfileTab from '@/components/dashboard/AuthorProfileTab';
import ReviewsTab from '@/components/dashboard/ReviewsTab';
import RoyaltiesTab from '@/components/dashboard/RoyaltiesTab';

import SupportTab from '@/components/dashboard/SupportTab';
import NotificationsTab from '@/components/dashboard/NotificationsTab';

const TAB_ALIAS = {};

const MOBILE_NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'books',    label: 'Books',    icon: BookOpen },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile',  label: 'Profile',  icon: User },
];

export default function Dashboard({ initialTab = 'overview' }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(initialTab);       // raw sidebar id
  const [resolvedTab, setResolvedTab] = useState(initialTab);   // actual component to render
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync tab state when initialTab prop changes (route change)
  useEffect(() => {
    setActiveTab(initialTab);
    setResolvedTab(TAB_ALIAS[initialTab] || initialTab);
  }, [initialTab]);

  const { data: authorProfiles, isFetched: isProfileFetched } = useQuery({
    queryKey: ['author-profile'],
    queryFn: () => base44.entities.AuthorProfile.list('-created_date', 1),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (isProfileFetched && authorProfiles && authorProfiles.length === 0) {
      // Only redirect if they have truly never set up (no profile record at all)
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
    setActiveTab(tab);
    setResolvedTab(TAB_ALIAS[tab] || tab);
    setMobileSidebarOpen(false);
  };

  if (!isProfileFetched) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background relative">

      {/* Subtle grid background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      {/* Ambient gradient blobs */}
      <div className="fixed top-0 right-0 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[300px] bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar — desktop */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} authorProfile={authorProfile} books={books} />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card shadow-xl z-50">
            <Sidebar activeTab={activeTab} onTabChange={handleTabChange} authorProfile={authorProfile} books={books} mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Desktop top bar */}
        <TopBar authorProfile={authorProfile} books={books} />

        {/* Mobile top bar */}
        <div className="md:hidden border-b bg-card/90 backdrop-blur-sm sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileSidebarOpen(true)} className="text-muted-foreground hover:text-foreground mr-1">
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">Classpedia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground capitalize px-2.5 py-1 rounded-full bg-secondary">{activeTab}</span>
            <div className="relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {(() => {
                const c = [!authorProfile?.payment_method, !authorProfile?.tax_id, books.filter(b => b.status === 'draft').length > 0].filter(Boolean).length;
                return c > 0 ? (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{c}</span>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8">
          {resolvedTab === 'overview'  && <OverviewTab books={books} authorProfile={authorProfile} onTabChange={handleTabChange} />}
          {resolvedTab === 'books'     && <BooksTab books={books} isLoading={isBooksLoading} />}
          {resolvedTab === 'reviews'   && <ReviewsTab books={books} />}
          {resolvedTab === 'royalties' && <RoyaltiesTab books={books} />}
          {resolvedTab === 'payments'  && <PaymentsTab books={books} authorProfile={authorProfile} />}

          {resolvedTab === 'profile'   && <AuthorProfileTab authorProfile={authorProfile} onProfileUpdated={() => queryClient.invalidateQueries({ queryKey: ['author-profile'] })} onShowNotifications={() => handleTabChange('notifications')} />}
          {resolvedTab === 'notifications' && <NotificationsTab books={books} authorProfile={authorProfile} onTabChange={handleTabChange} />}
          {resolvedTab === 'support'   && <SupportTab />}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t flex z-30">
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