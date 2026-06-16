import React from 'react';
import {
  BookOpen, CreditCard, User, LayoutDashboard,
  TrendingUp, HelpCircle, LogOut, Bell, AlertTriangle, Megaphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

const NAV_SECTIONS = [
  {
    items: [
      { id: 'overview',  label: 'Overview',        icon: LayoutDashboard },
    ]
  },
  {
    label: 'Publishing',
    items: [
      { id: 'books',      label: 'My Books',    icon: BookOpen },
      { id: 'issues',     label: 'Publishing Issues',      icon: AlertTriangle },
      { id: 'promotions', label: 'Promotions',  icon: Megaphone },
    ]
  },
  {
    label: 'Earnings',
    items: [
      { id: 'royalties', label: 'Sales & Royalties', icon: TrendingUp },
      { id: 'payments',  label: 'Payments',    icon: CreditCard },
    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'profile',        label: 'Author Profile',   icon: User },
    ]
  },
  {
    label: 'Help',
    items: [
      { id: 'support',   label: 'Support',           icon: HelpCircle },
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
  const firstName = authorProfile?.full_name?.split(' ')[0] || 'Author';
  const notifCount = getNotificationCount(authorProfile, books);

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r bg-card min-h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-3 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Classpedia</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Publishing Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 p-3 flex-1 overflow-y-auto">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0">
              {section.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left w-full',
                    activeTab === id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {id === 'overview' && notifCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                      {notifCount}
                    </span>
                  )}
                  {id === 'issues' && (() => {
                    const QUALITY_CHECKS_QUICK = [
                      (b) => !!b.cover_url,
                      (b) => b.description && b.description.trim().length >= 100,
                      (b) => b.keywords && b.keywords.length >= 3,
                    ];
                    const issueCount = books.filter(b =>
                      (b.status === 'draft' || b.status === 'in_review') &&
                      QUALITY_CHECKS_QUICK.some(fn => !fn(b))
                    ).length;
                    return issueCount > 0 ? (
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {issueCount}
                      </span>
                    ) : null;
                  })()}
                </button>
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
            <p className="text-xs font-medium truncate">{authorProfile?.full_name || 'Author'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{authorProfile?.email || ''}</p>
          </div>
          <button
            onClick={() => base44.auth.logout()}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}