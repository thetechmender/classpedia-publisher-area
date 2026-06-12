import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, CreditCard, User, LayoutDashboard,
  TrendingUp, HelpCircle, Star, LogOut, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const NAV_SECTIONS = [
  {
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    ]
  },
  {
    label: 'Publishing',
    items: [
      { id: 'books', label: 'My Books', icon: BookOpen, path: '/books' },
      { id: 'reviews', label: 'Reviews & Issues', icon: Star, path: '/reviews' },
    ]
  },
  {
    label: 'Earnings',
    items: [
      { id: 'royalties', label: 'Sales & Royalties', icon: TrendingUp, path: '/royalties' },
      { id: 'payments', label: 'Payments & Tax', icon: CreditCard, path: '/payments' },
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'profile', label: 'Author Profile', icon: User, path: '/profile' },
      { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    ]
  },
  {
    label: 'Help',
    items: [
      { id: 'support', label: 'Support', icon: HelpCircle, path: '/support' },
    ]
  },
];

function getNotificationCount(authorProfile, books = []) {
  let count = 0;
  if (!authorProfile?.payment_method) count++;
  if (authorProfile?.us_person === undefined || !authorProfile?.tax_id) count++;
  if (books.filter(b => b.status === 'draft').length > 0) count++;
  return count;
}

export default function Sidebar({ activeTab, onTabChange, authorProfile, books = [] }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [localStorageData, setLocalStorageData] = useState({
    fullName: '',
    email: ''
  });

  useEffect(() => {
    const publisherFullName = localStorage.getItem('publisher_full_name');
    const publisherEmail = localStorage.getItem('publisher_email');
    
    setLocalStorageData({
      fullName: publisherFullName || '',
      email: publisherEmail || ''
    });
  }, []);

  const displayName = localStorageData.fullName || authorProfile?.full_name || user?.publisherFullName || 'Author';
  const displayEmail = localStorageData.email || authorProfile?.email || '';
  const firstName = displayName.split(' ')[0] || 'Author';
  const notifCount = getNotificationCount(authorProfile, books);

  // Determine active item based on current URL path
  const getIsActive = (path, id) => {
    if (location.pathname === path) return true;
    if (path === '/dashboard' && location.pathname === '/') return true;
    return activeTab === id;
  };

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r bg-card h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Classpedia</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Publishing Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-4 p-3 flex-1 overflow-y-auto">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ id, label, icon: Icon, path }) => (
                <Link
                  key={id}
                  to={path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full',
                    getIsActive(path, id)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {(id === 'overview' || id === 'notifications') && notifCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {notifCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
            {firstName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 font-bold" />
            <span className="text-xs px-1 font-bold">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}