import React from 'react';
import { cn } from '@/lib/utils';
import { XCircle, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

const STATS = [
  { key: 'critical',   icon: XCircle,      label: 'Critical',    activeColor: 'text-red-600',    activeBg: 'bg-red-50 border-red-200',       iconCl: 'text-red-500' },
  { key: 'warning',    icon: AlertTriangle, label: 'Warnings',    activeColor: 'text-amber-600',  activeBg: 'bg-amber-50 border-amber-200',   iconCl: 'text-amber-500' },
  { key: 'suggestion', icon: Lightbulb,     label: 'Suggestions', activeColor: 'text-blue-600',   activeBg: 'bg-blue-50 border-blue-200',     iconCl: 'text-blue-400' },
  { key: 'passed',     icon: CheckCircle2,  label: 'Passed',      activeColor: 'text-emerald-600',activeBg: 'bg-emerald-50 border-emerald-200',iconCl: 'text-emerald-500' },
];

export default function QualitySummaryBar({ issues, passed, activeFilter, onFilterChange }) {
  const counts = {
    critical:   issues.filter(i => i.severity === 'critical').length,
    warning:    issues.filter(i => i.severity === 'warning').length,
    suggestion: issues.filter(i => i.severity === 'suggestion').length,
    passed:     passed.length,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map(({ key, icon: Icon, label, activeColor, activeBg, iconCl }) => {
        const count  = counts[key];
        const active = activeFilter === key;
        const hasIssue = key !== 'passed' && count > 0;
        return (
          <button
            key={key}
            onClick={() => onFilterChange(active ? 'all' : key)}
            className={cn(
              'rounded-2xl border px-5 py-4 flex items-center gap-3.5 shadow-sm text-left transition-all duration-150 cursor-pointer hover:shadow-md',
              active ? `${activeBg} ring-2 ring-offset-1 ${key === 'critical' ? 'ring-red-300' : key === 'warning' ? 'ring-amber-300' : key === 'suggestion' ? 'ring-blue-300' : 'ring-emerald-300'}` : 'bg-card border-border hover:border-border'
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', active ? 'bg-white/80' : 'bg-secondary')}>
              <Icon className={cn('w-5 h-5', active || hasIssue ? iconCl : 'text-muted-foreground/40')} />
            </div>
            <div>
              <p className={cn('text-2xl font-bold tabular-nums leading-none', active || hasIssue ? activeColor : 'text-foreground')}>{count}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}