import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  published: { label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200/80' },
  in_review: { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400', ring: 'ring-amber-200/80' },
  draft: { label: 'Draft', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', ring: 'ring-slate-200/80' },
  unpublished: { label: 'Unpublished', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', ring: 'ring-red-200/80' },
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200/80' },
  completed: { label: 'Completed', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', ring: 'ring-slate-200/80' },
  expired: { label: 'Expired', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', ring: 'ring-red-200/80' },
  not_enrolled: { label: 'Not Enrolled', bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', ring: 'ring-slate-200/80' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-full ring-1 whitespace-nowrap',
      cfg.bg, cfg.text, cfg.ring,
      sizeClasses[size] || sizeClasses.sm
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}