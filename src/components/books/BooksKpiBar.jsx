import React from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, CheckCircle2, Clock, FileEdit } from 'lucide-react';

const CARDS = [
  {
    key: 'total',
    label: 'Total Books',
    icon: BookOpen,
    color: 'text-slate-600',
    iconBg: 'bg-slate-100',
    filter: 'all',
    sub: '',
  },
  {
    key: 'published',
    label: 'Published Books',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    filter: 'published',
    sub: 'Live on platform',
  },
  {
    key: 'in_review',
    label: 'Books in Review',
    icon: Clock,
    color: 'text-amber-600',
    iconBg: 'bg-amber-100',
    filter: 'in_review',
    sub: 'Estimated approval within 72 hrs',
  },
  {
    key: 'draft',
    label: 'Drafts',
    icon: FileEdit,
    color: 'text-violet-600',
    iconBg: 'bg-violet-100',
    filter: 'draft',
    sub: 'Incomplete · needs action',
  },
];

export default function BooksKpiBar({ stats, activeFilter, onFilterChange }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {CARDS.map(card => {
        const Icon = card.icon;
        const val = stats[card.key];
        const isActive = card.filter && activeFilter === card.filter;

        return (
          <button
            key={card.key}
            disabled={!card.filter}
            onClick={() => card.filter && onFilterChange(card.filter)}
            className={cn(
              'bg-card border border-border rounded-2xl p-4 text-left transition-all duration-200',
              card.filter ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
              isActive ? 'ring-2 ring-primary/40' : ''
            )}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5', card.iconBg)}>
                <Icon className={cn('w-4 h-4', card.color)} strokeWidth={1.8} />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">{card.label}</p>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">{val ?? 0}</p>
            {card.sub && (
              <p className="text-[12px] text-muted-foreground leading-snug">{card.sub}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}