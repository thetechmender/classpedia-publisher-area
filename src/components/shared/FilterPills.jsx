import React from 'react';
import { cn } from '@/lib/utils';

const DOT_COLORS = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-400',
  slate: 'bg-slate-400',
  red: 'bg-red-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  violet: 'bg-violet-400',
};

export default function FilterPills({ filters, activeFilter, onFilterChange, getCount }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {filters.map((f) => {
        const count = getCount ? getCount(f.value) : f.count;
        const active = activeFilter === f.value;
        const dot = f.color ? DOT_COLORS[f.color] : null;
        
        return (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all duration-150 border',
              active
                ? 'bg-foreground text-background border-foreground shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
            )}
          >
            {dot && !active && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />}
            {f.label}
            {count !== undefined && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums',
                active ? 'bg-white/20 text-background' : 'bg-secondary text-muted-foreground'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}