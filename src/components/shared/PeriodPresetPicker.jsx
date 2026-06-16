import React, { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PRESETS = [
  { label: 'Last 30 Days', months: 1 },
  { label: 'Last 3 Months', months: 3 },
  { label: 'Last 6 Months', months: 6 },
  { label: 'This Year', months: 12 },
  { label: 'All Time', months: null },
];

export default function PeriodPresetPicker({ 
  presets = DEFAULT_PRESETS, 
  presetIdx, 
  onPresetChange,
  align = 'right'
}) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPresets(v => !v)}
        className="flex items-center gap-2 px-3 py-2 bg-card border rounded-lg text-sm font-medium hover:bg-secondary/40 transition-colors"
      >
        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
        {presets[presetIdx].label}
        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', showPresets && 'rotate-180')} />
      </button>
      {showPresets && (
        <div className={cn(
          'absolute top-full mt-1 z-10 bg-card border rounded-xl shadow-lg overflow-hidden min-w-[160px]',
          align === 'left' ? 'left-0' : 'right-0'
        )}>
          {presets.map((p, i) => (
            <button 
              key={p.label} 
              onClick={() => { 
                onPresetChange(i); 
                setShowPresets(false); 
              }}
              className={cn(
                'w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/40 transition-colors', 
                i === presetIdx && 'font-semibold text-primary'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}