import React, { useMemo } from 'react';
import { AlertTriangle, XCircle, BookOpen, CheckCircle2, ArrowRight, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateIssues } from '@/components/quality/qualityData';

export default function IssuesWidget({ books = [], onTabChange }) {
  const eligibleBooks = useMemo(
    () => books.filter(b => b.manuscript_url && (b.status === 'draft' || b.status === 'in_review')),
    [books]
  );

  const readyBooks = useMemo(
    () => books.filter(b => b.manuscript_url && b.status === 'draft' && !generateIssues(b).issues.length),
    [books]
  );

  // Build per-book issue summary
  const booksWithIssues = useMemo(() =>
    eligibleBooks.map(b => {
      const { issues } = generateIssues(b);
      const critical = issues.filter(i => i.severity === 'critical');
      const warnings = issues.filter(i => i.severity === 'warning');
      return { book: b, issues, critical, warnings };
    }).filter(x => x.issues.length > 0),
    [eligibleBooks]
  );

  const totalCritical = booksWithIssues.reduce((s, x) => s + x.critical.length, 0);
  const totalWarnings = booksWithIssues.reduce((s, x) => s + x.warnings.length, 0);
  const booksWithIssuesCount = booksWithIssues.length;
  const allClear = booksWithIssues.length === 0;

  return (
    <div
      className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md hover:border-border/60 transition-all group h-full"
      onClick={() => onTabChange('issues')}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center',
            totalCritical > 0 ? 'bg-red-100' : totalWarnings > 0 ? 'bg-amber-100' : 'bg-emerald-100'
          )}>
            {allClear
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              : <AlertTriangle className={cn('w-4 h-4', totalCritical > 0 ? 'text-red-500' : 'text-amber-500')} />
            }
          </div>
          <div>
            <h2 className="text-sm font-semibold">Pre-Submission Issues</h2>
            <p className="text-xs text-muted-foreground">Quality checks per book</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-primary flex items-center gap-1 group-hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      {/* Metrics Table */}
      <div className="px-5 py-4 border-b">
        <div className="space-y-3">
          {/* Books with Issues */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <FileWarning className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Books with Issues</span>
            </div>
            <span className="text-sm font-bold text-foreground">{booksWithIssuesCount}</span>
          </div>

          {/* Critical Issues */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Critical Issues</span>
            </div>
            <span className="text-sm font-bold text-red-600">{totalCritical}</span>
          </div>

          {/* Grammar Warnings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Grammar Warnings</span>
            </div>
            <span className="text-sm font-bold text-amber-600">{totalWarnings}</span>
          </div>

          {/* Ready After Fixes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Ready After Fixes</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">{readyBooks.length}</span>
          </div>
        </div>
      </div>

      {/* Book List */}
      {booksWithIssues.length > 0 && (
        <div className="flex-1 divide-y overflow-y-auto">
          {booksWithIssues.slice(0, 3).map(({ book, critical, warnings }) => {
            const topIssue = critical[0] || warnings[0];
            return (
              <div key={book.id} className="px-4 py-3 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-2">
                  {book.cover_url
                    ? <img src={book.cover_url} alt={book.title} className="w-5 h-7 object-cover rounded shrink-0" />
                    : <div className="w-5 h-7 bg-secondary rounded flex items-center justify-center shrink-0">
                        <BookOpen className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                  }
                  <p className="text-[11px] font-semibold text-foreground truncate flex-1">{book.title}</p>
                  {critical.length > 0 && (
                    <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{critical.length}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {booksWithIssues.length > 0 && (
        <div className="px-5 py-2.5 border-t bg-muted/20">
          <p className="text-[10px] text-muted-foreground text-center">
            {booksWithIssuesCount} book{booksWithIssuesCount !== 1 ? 's' : ''} need{booksWithIssuesCount !== 1 ? '' : 's'} attention
          </p>
        </div>
      )}
    </div>
  );
}