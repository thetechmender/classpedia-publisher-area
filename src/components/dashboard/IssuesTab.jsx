import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, BookOpen,
  AlertTriangle, XCircle, Pencil, ChevronDown,
  FileText, AlignLeft, Eye, Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { generateIssues, SEVERITY } from '@/components/quality/qualityData';

// ── Issue row (expandable) ────────────────────────────────────────────────────
function IssueRow({ issue }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY[issue.severity];

  return (
    <div className={cn('border rounded-xl overflow-hidden transition-all', expanded ? `${cfg.border}` : 'border-border')}>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/20 transition-colors">
        
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
          <AlertTriangle className={cn('w-3.5 h-3.5', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{issue.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn('text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full', cfg.pillBg, cfg.color)}>
              {issue.area}
            </span>
            {issue.page && <span className="text-[11px] text-muted-foreground">Page {issue.page}</span>}
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded &&
      <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-3 bg-muted/10">
          <p className="text-sm text-foreground/80 leading-relaxed">{issue.summary}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className={cn('rounded-lg px-3 py-2.5 border', cfg.bg, cfg.border)}>
              <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', cfg.color)}>Why it matters</p>
              <p className="text-[12px] text-foreground/70 leading-relaxed">{issue.why}</p>
            </div>
            <div className="rounded-lg px-3 py-2.5 border bg-secondary/40 border-border">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">How to fix</p>
              <p className="text-[12px] text-foreground/70 leading-relaxed">{issue.fix}</p>
            </div>
          </div>
        </div>
      }
    </div>);

}

// ── Detail view ───────────────────────────────────────────────────────────────
function QualityDetail({ book, onBack }) {
  const navigate = useNavigate();
  const { issues } = useMemo(() => generateIssues(book), [book]);

  const formattingIssues = issues.filter((i) => i.category === 'formatting');
  const grammarIssues = issues.filter((i) => i.category === 'grammar');

  const criticals = issues.filter((i) => i.severity === 'critical');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return (
    <div className="space-y-5">

      {/* Back + header */}
      <div className="bg-card border rounded-2xl px-6 py-5 shadow-sm">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-0.5 w-8 h-8 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0">
            
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                {book.cover_url ?
                <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0" /> :
                <div className="w-10 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center shrink-0 border border-border">
                      <BookOpen className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                }
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-foreground truncate">{book.title}</h2>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 shrink-0">
                      Needs Attention
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5">by {book.author_name || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/publish?bookId=${book.id}`)}
                  className="gap-1.5 h-8 px-3 text-xs rounded-xl">
                  
                  <Pencil className="w-3.5 h-3.5" /> Edit Book
                </Button>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border/50 flex-wrap">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[12px] font-semibold text-red-600">{criticals.length} critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[12px] font-semibold text-amber-600">{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <AlignLeft className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-blue-600">{formattingIssues.length}</p>
            <p className="text-xs text-muted-foreground">Formatting</p>
          </div>
        </div>
        <div className="bg-card border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-amber-600">{grammarIssues.length}</p>
            <p className="text-xs text-muted-foreground">Grammar</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{issues.length}</p>
            <p className="text-xs text-muted-foreground">Total Issues</p>
          </div>
        </div>
      </div>

      {/* Formatting Issues */}
      {formattingIssues.length > 0 &&
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b bg-blue-50/50 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-blue-700">Formatting Issues</h3>
            <Badge className="ml-auto text-xs bg-blue-100 text-blue-700 border-0">{formattingIssues.length}</Badge>
          </div>
          <div className="p-4 space-y-3">
            {formattingIssues.map((issue) => <IssueRow key={issue.id} issue={issue} />)}
          </div>
        </div>
      }

      {/* Grammar Issues */}
      {grammarIssues.length > 0 &&
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b bg-amber-50/50 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-700">Grammar & Spelling</h3>
            <Badge className="ml-auto text-xs bg-amber-100 text-amber-700 border-0">{grammarIssues.length}</Badge>
          </div>
          <div className="p-4 space-y-3">
            {grammarIssues.map((issue) => <IssueRow key={issue.id} issue={issue} />)}
          </div>
        </div>
      }

    </div>);

}

// ── Book card ─────────────────────────────────────────────────────────────────
function BookQualityCard({ book, onClick }) {
  const { issues } = useMemo(() => generateIssues(book), [book]);
  const criticals = issues.filter((i) => i.severity === 'critical');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const topIssue = criticals[0] || warnings[0];
  const hasCritical = criticals.length > 0;

  const STATUS_CONFIG = {
    draft:    { label: 'Draft',     bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    in_review:{ label: 'In Review', bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400' },
  };
  const statusCfg = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;

  return (
    <div
      className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col"
      onClick={onClick}
    >
      {/* Top accent bar */}
      <div className={cn('h-1 w-full', hasCritical ? 'bg-red-400' : 'bg-amber-400')} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Book identity */}
        <div className="flex items-start gap-3">
          {book.cover_url
            ? <img src={book.cover_url} alt={book.title} className="w-12 h-[68px] object-cover rounded-lg shadow-sm ring-1 ring-black/8 shrink-0" />
            : <div className="w-12 h-[68px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border border-border/60 shrink-0">
                <BookOpen className="w-5 h-5 text-muted-foreground/50" />
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">{book.title || 'Untitled'}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">by {book.author_name || '—'}</p>
            <span className={cn('inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full', statusCfg.bg, statusCfg.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Issue count badges */}
        <div className="flex items-center gap-2">
          {criticals.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 flex-1 justify-center">
              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-[12px] font-bold text-red-600">{criticals.length} Critical</span>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 flex-1 justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[12px] font-bold text-amber-600">{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Top issue preview */}
        {topIssue && (
          <div className={cn(
            'rounded-xl border p-3',
            topIssue.severity === 'critical' ? 'bg-red-50/60 border-red-200' : 'bg-amber-50/60 border-amber-200'
          )}>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">Top Issue</p>
            <p className="text-[12px] font-semibold text-foreground leading-snug">{topIssue.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{topIssue.summary}</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 border-t bg-muted/20 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">{issues.length} issue{issues.length !== 1 ? 's' : ''} to fix</p>
        <span className="text-[11px] font-bold text-primary flex items-center gap-1 group-hover:underline">
          Review <ChevronLeft className="w-3 h-3 rotate-180" />
        </span>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
];

// ── Tab root ──────────────────────────────────────────────────────────────────
export default function IssuesTab({ books }) {
  const navigate = useNavigate();
  const eligibleBooks = useMemo(
    () => books.filter((b) => b.manuscript_url && b.status === 'draft'),
    [books]
  );

  const [selectedBookId, setSelectedBookId] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Filter books based on search
  const filteredBooks = useMemo(() => {
    let r = eligibleBooks.filter((b) => {
      const q = search.toLowerCase();
      return !search || b.title?.toLowerCase().includes(q) || b.author_name?.toLowerCase().includes(q);
    });
    
    // Sort
    switch (sort) {
      case 'oldest': r = [...r].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); break;
      case 'title': r = [...r].sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
      default: r = [...r].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    return r;
  }, [eligibleBooks, search, sort]);

  const selectedBook = eligibleBooks.find((b) => b.id === selectedBookId);
  const activeBook = selectedBook;

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Sort';
  const hasActiveFilters = !!search;

  if (activeBook) {
    return <QualityDetail book={activeBook} onBack={() => setSelectedBookId(null)} />;
  }

  if (eligibleBooks.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Publishing Issues</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Review quality checks before submitting your books</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-border rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">No books to review</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Quality checks run on uploaded drafts. Upload your manuscript to see quality results here.
          </p>
        </div>
      </div>
    );
  }

  const totalCritical = eligibleBooks.reduce((sum, b) => sum + generateIssues(b).issues.filter(i => i.severity === 'critical').length, 0);
  const totalWarnings = eligibleBooks.reduce((sum, b) => sum + generateIssues(b).issues.filter(i => i.severity === 'warning').length, 0);
  const totalChecked = eligibleBooks.length;
  const needsAttention = eligibleBooks.filter(b => generateIssues(b).issues.length > 0).length;

  const STATUS_CONFIG = {
    draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    in_review: { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Publishing Issues</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Quality checks for books with issues requiring attention</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Total Issues</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalCritical + totalWarnings}</p>
          <p className="text-xs text-muted-foreground mt-1">Across all books</p>
        </div>
        
        <div className="bg-card border border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <AlignLeft className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Formatting</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{eligibleBooks.reduce((sum, b) => sum + generateIssues(b).issues.filter(i => i.category === 'formatting').length, 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Layout & design issues</p>
        </div>

        <div className="bg-card border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Grammatical</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">{eligibleBooks.reduce((sum, b) => sum + generateIssues(b).issues.filter(i => i.category === 'grammar').length, 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Spelling & grammar</p>
        </div>
      </div>



      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Quality Review Queue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Review and resolve manuscript quality issues</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9 px-3 text-xs font-medium border-border rounded-lg bg-card shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                {sortLabel}
                <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-border/80">
              {SORT_OPTIONS.map((o) =>
              <DropdownMenuItem
                key={o.value}
                onClick={() => setSort(o.value)}
                className={cn('text-sm cursor-pointer rounded-lg mx-1 my-0.5', sort === o.value && 'bg-accent font-medium text-accent-foreground')}>
                {o.label}
              </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_1fr] gap-4 px-6 py-3 bg-muted/40 border-b border-border/60 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div>Book Title</div>
          <div>Status</div>
          <div>Critical</div>
          <div>Warnings</div>
          <div>Last Updated</div>
          <div>Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {filteredBooks.map((book) => {
            const { issues } = generateIssues(book);
            const criticals = issues.filter(i => i.severity === 'critical');
            const warnings = issues.filter(i => i.severity === 'warning');
            const statusCfg = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
            const lastUpdated = new Date(book.updated_date || book.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div key={book.id} className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-muted/20 transition-colors">
                {/* Book Title */}
                <div className="flex items-center gap-3 min-w-0">
                  {book.cover_url ?
                    <img src={book.cover_url} alt={book.title} className="w-8 h-10 object-cover rounded shrink-0" /> :
                    <div className="w-8 h-10 bg-secondary rounded flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground/50" />
                    </div>
                  }
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{book.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">by {book.author_name}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full', statusCfg.bg, statusCfg.text)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Critical */}
                <div className="text-center">
                  {criticals.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-red-600">
                      <XCircle className="w-3.5 h-3.5" /> {criticals.length}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </div>

                {/* Warnings */}
                <div className="text-center">
                  {warnings.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-600">
                      <AlertTriangle className="w-3.5 h-3.5" /> {warnings.length}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </div>

                {/* Last Updated */}
                <div className="text-[12px] text-muted-foreground">{lastUpdated}</div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/publish?bookId=${book.id}`)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedBookId(book.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-primary hover:text-primary hover:bg-accent transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredBooks.length === 0 && (
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <p className="text-sm font-semibold text-foreground">No books found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}