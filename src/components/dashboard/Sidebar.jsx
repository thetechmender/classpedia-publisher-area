import React from 'react';
import { BookOpen, CreditCard, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',       icon: LayoutDashboard },
  { id: 'books',     label: 'My Books',        icon: BookOpen },
  { id: 'payments',  label: 'Payments',        icon: CreditCard },
  { id: 'profile',   label: 'Author Profile',  icon: User },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-56 shrink-0 hidden md:flex flex-col border-r bg-card min-h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Classpedia</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Publishing Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
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
        ))}
      </nav>
    </aside>
  );
}