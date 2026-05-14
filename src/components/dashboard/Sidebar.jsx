import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, CreditCard, User, LayoutDashboard, Plus,
  TrendingUp, FileText, HelpCircle, Settings, Star, BarChart3, LogOut
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
      { id: 'books',     label: 'My Books',         icon: BookOpen },
      { id: 'publish',   label: 'Publish New Book', icon: Plus, isAction: true },
      { id: 'reviews',   label: 'Reviews & Issues', icon: Star },
    ]
  },
  {
    label: 'Earnings',
    items: [
      { id: 'royalties', label: 'Sales & Royalties', icon: TrendingUp },
      { id: 'payments',  label: 'Payments',          icon: CreditCard },

    ]
  },
  {
    label: 'Account',
    items: [
      { id: 'profile',   label: 'Author Profile',   icon: User },
      { id: 'tax',       label: 'Tax Info',          icon: FileText },
    ]
  },
  {
    label: 'Help',
    items: [
      { id: 'support',   label: 'Support',           icon: HelpCircle },
    ]
  },
];

export default function Sidebar({ activeTab, onTabChange, authorProfile }) {
  const firstName = authorProfile?.full_name?.split(' ')[0] || 'Author';

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col border-r bg-card min-h-screen sticky top-0">
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
              {section.items.map(({ id, label, icon: Icon, isAction }) =>
                id === 'publish' ? (
                  <Link key={id} to="/publish"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </Link>
                ) : (
                  <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full',
                      activeTab === id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                )
              )}
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