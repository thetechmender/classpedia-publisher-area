import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { SEVERITY } from './qualityData';
import { ChevronDown, Upload, Wrench, EyeOff, Eye, XCircle, AlertTriangle, Lightbulb } from 'lucide-react';

const SEV_ICONS = {
  critical:   XCircle,
  warning:    AlertTriangle,
  suggestion: Lightbulb,
};

export default function IssueCard({ issue, ignored, onIgnore }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY[issue.severity];
  const Icon = SEV_ICONS[issue.severity] ?? Lightbulb;

  return (
    <div className={cn(
      'rounded-2xl border bg-card transition-all duration-200 overflow-hidden',
      ignored && 'opacity-40',
      expanded ? `${cfg.border} shadow-md` : 'border-border hover:border-border hover:shadow-sm'
    )}>
      {/* Row header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left group"
      >
        {/* Severity icon block */}
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
          <Icon className={cn('w-4 h-4', cfg.color)} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-foreground leading-snug">{issue.title}</p>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={cn('text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full', cfg.pillBg, cfg.color)}>
              {cfg.label}
            </span>
            <span className="text-[11px] text-muted-foreground">{issue.area}</span>
            {issue.page && (
              <>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-[11px] text-muted-foreground">Page {issue.page}</span>
              </>
            )}
          </div>
        </div>

        <ChevronDown className={cn(
          'w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200',
          expanded && 'rotate-180'
        )} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/50 mx-5 mb-5 pt-4 space-y-4">
          {/* Summary */}
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{issue.summary}</p>

          {/* Why + Fix in two-column info blocks */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className={cn('rounded-xl px-4 py-3 border', cfg.bg, cfg.border)}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'inherit' }}>
                <span className={cfg.color}>Why it matters</span>
              </p>
              <p className="text-[12px] text-foreground/70 leading-relaxed">{issue.why}</p>
            </div>
            <div className="rounded-xl px-4 py-3 border bg-secondary/40 border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">How to fix</p>
              <p className="text-[12px] text-foreground/70 leading-relaxed">{issue.fix}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {(issue.action === 'upload' || issue.action === 'reupload') && (
              <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground bg-card border border-border rounded-xl px-3 py-1.5 hover:bg-secondary transition-colors shadow-sm">
                <Upload className="w-3 h-3" />
                {issue.action === 'upload' ? 'Upload file' : 'Re-upload file'}
              </button>
            )}
            {issue.action === 'fix' && (
              <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground bg-card border border-border rounded-xl px-3 py-1.5 hover:bg-secondary transition-colors shadow-sm">
                <Wrench className="w-3 h-3" /> Fix in settings
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onIgnore?.(issue.id); }}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground ml-auto rounded-xl px-3 py-1.5 hover:bg-secondary transition-colors"
            >
              <EyeOff className="w-3 h-3" />
              {ignored ? 'Unignore' : 'Ignore issue'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}