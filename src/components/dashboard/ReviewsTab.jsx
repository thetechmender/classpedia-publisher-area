import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, MessageSquare, AlertCircle, CheckCircle2, Flag,
  Search, Eye, EyeOff, Reply, ChevronLeft, ChevronRight
} from 'lucide-react';
import { formatDate } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function Stars({ rating, size = 'sm' }) {
  const cls = size === 'lg' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={cn(cls, s <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20')} />
      ))}
    </div>
  );
}

const STATUS_STYLES = {
  published: 'bg-emerald-100 text-emerald-700',
  hidden:    'bg-slate-100 text-slate-600',
  flagged:   'bg-red-100 text-red-700',
};

const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-blue-100 text-blue-700',
};

const TABS = [
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'issues',  label: 'Issues',  icon: AlertCircle },
];

const ITEMS_PER_PAGE = 10;

export default function ReviewsTab() {
  const [tab, setTab] = useState('reviews');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [replyDialogReview, setReplyDialogReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 200),
  });

  const { data: issues = [], isLoading: loadingIssues } = useQuery({
    queryKey: ['issues'],
    queryFn: () => base44.entities.Issue.list('-created_date', 200),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Review.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const issueMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Issue.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
  });

  // Stats
  const stats = useMemo(() => {
    const avg = reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : '—';
    const dist = [5, 4, 3, 2, 1].map(r => ({
      rating: r,
      count: reviews.filter(x => x.rating === r).length,
      pct: reviews.length > 0 ? (reviews.filter(x => x.rating === r).length / reviews.length) * 100 : 0,
    }));
    return {
      total: reviews.length,
      avg,
      published: reviews.filter(r => r.status === 'published').length,
      hidden: reviews.filter(r => r.status === 'hidden').length,
      flagged: reviews.filter(r => r.status === 'flagged').length,
      openIssues: issues.filter(i => i.status === 'open').length,
      criticalIssues: issues.filter(i => i.status === 'open' && (i.severity === 'critical' || i.severity === 'high')).length,
      dist,
    };
  }, [reviews, issues]);

  // Filtered reviews
  const allFiltered = useMemo(() => {
    return reviews
      .filter(r => {
        if (search && !r.book_title?.toLowerCase().includes(search.toLowerCase()) &&
          !r.reviewer_name?.toLowerCase().includes(search.toLowerCase()) &&
          !r.comment?.toLowerCase().includes(search.toLowerCase())) return false;
        if (ratingFilter !== 'all' && r.rating !== parseInt(ratingFilter)) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'newest') return new Date(b.created_date) - new Date(a.created_date);
        if (sort === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
        if (sort === 'highest') return b.rating - a.rating;
        if (sort === 'lowest') return a.rating - b.rating;
        return 0;
      });
  }, [reviews, search, ratingFilter, statusFilter, sort]);

  const pagedReviews = allFiltered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(allFiltered.length / ITEMS_PER_PAGE);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues
      .filter(i => {
        if (search && !i.title?.toLowerCase().includes(search.toLowerCase()) &&
          !i.book_title?.toLowerCase().includes(search.toLowerCase())) return false;
        if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (b.status === 'open' && a.status !== 'open') return 1;
        return new Date(b.created_date) - new Date(a.created_date);
      });
  }, [issues, search, severityFilter]);

  const handleReply = async () => {
    if (!replyText.trim() || !replyDialogReview) return;
    reviewMutation.mutate({ id: replyDialogReview.id, data: { author_response: replyText } });
    toast.success('Response posted');
    setReplyDialogReview(null);
    setReplyText('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reviews & Issues</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Monitor reader feedback and track content issues.</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total Reviews',  value: stats.total,         color: 'text-foreground' },
          { label: 'Avg Rating',     value: stats.avg,           color: 'text-amber-600' },
          { label: 'Published',      value: stats.published,     color: 'text-emerald-600' },
          { label: 'Hidden',         value: stats.hidden,        color: 'text-slate-500' },
          { label: 'Open Issues',    value: stats.openIssues,    color: 'text-destructive' },
          { label: 'Critical',       value: stats.criticalIssues, color: 'text-orange-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-2xl px-4 py-3.5 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch(''); setPage(1); }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.id === 'reviews' && reviews.length > 0 && (
              <span className="ml-1 text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-normal">{reviews.length}</span>
            )}
            {t.id === 'issues' && stats.openIssues > 0 && (
              <span className="ml-1 text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-normal">{stats.openIssues}</span>
            )}
          </button>
        ))}
      </div>

      {/* REVIEWS */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search reviews…" className="pl-9" />
            </div>
            <Select value={ratingFilter} onValueChange={v => { setRatingFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                {[5,4,3,2,1].map(n => <SelectItem key={n} value={String(n)}>{n} Stars</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="highest">Highest rated</SelectItem>
                <SelectItem value="lowest">Lowest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating distribution bar */}
          {reviews.length > 0 && (
            <div className="bg-card border rounded-2xl px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Rating Distribution</p>
              <div className="space-y-1.5">
                {stats.dist.map(({ rating, count, pct }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-10 text-right">{rating} ★</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-5">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews list */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            {loadingReviews ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Loading reviews…</div>
            ) : pagedReviews.length === 0 ? (
              <div className="py-16 text-center">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium">No reviews found</p>
                <p className="text-xs text-muted-foreground mt-1">Reviews from readers will appear here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pagedReviews.map(review => (
                  <div key={review.id} className="p-5 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                          {(review.reviewer_name || 'R')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold">{review.reviewer_name || 'Anonymous'}</span>
                            <Stars rating={review.rating} />
                            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', STATUS_STYLES[review.status] || 'bg-secondary text-muted-foreground')}>
                              {review.status}
                            </span>
                            {review.verified_purchase && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Verified</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{review.book_title} · {formatDate(review.created_date)}</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                          {review.author_response && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mt-3">
                              <p className="text-xs font-semibold text-primary mb-1">Your Response</p>
                              <p className="text-sm text-foreground/80">{review.author_response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => reviewMutation.mutate({ id: review.id, data: { status: review.status === 'published' ? 'hidden' : 'published' } })}>
                          {review.status === 'published' ? <><EyeOff className="w-3 h-3 mr-1" />Hide</> : <><Eye className="w-3 h-3 mr-1" />Show</>}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => { setReplyDialogReview(review); setReplyText(review.author_response || ''); }}>
                          <Reply className="w-3 h-3 mr-1" />Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t bg-secondary/20">
                <p className="text-xs text-muted-foreground">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, allFiltered.length)} of {allFiltered.length}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <span className="text-xs font-medium px-2">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ISSUES */}
      {tab === 'issues' && (
        <div className="space-y-4">
          {/* Critical alert */}
          {stats.criticalIssues > 0 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                <strong>{stats.criticalIssues} critical issue{stats.criticalIssues > 1 ? 's' : ''}</strong> require your immediate attention.
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issues…" className="pl-9" />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card border rounded-2xl overflow-hidden">
            {loadingIssues ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
            ) : filteredIssues.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-medium">No issues found</p>
                <p className="text-xs text-muted-foreground mt-1">All clear — no content issues reported.</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredIssues.map(issue => (
                  <div key={issue.id} className="p-5 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0',
                          issue.severity === 'critical' ? 'bg-red-500' :
                          issue.severity === 'high' ? 'bg-orange-500' :
                          issue.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold">{issue.title}</span>
                            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', SEVERITY_STYLES[issue.severity])}>
                              {issue.severity}
                            </span>
                            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                              issue.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            )}>
                              {issue.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1.5">{issue.book_title} · Reported {formatDate(issue.created_date)}</p>
                          {issue.description && <p className="text-sm text-foreground/80 leading-relaxed">{issue.description}</p>}
                          {issue.reporter_name && <p className="text-xs text-muted-foreground mt-1.5">By: {issue.reporter_name}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => issueMutation.mutate({ id: issue.id, data: { status: issue.status === 'open' ? 'resolved' : 'open' } })}>
                          {issue.status === 'open'
                            ? <><CheckCircle2 className="w-3 h-3 mr-1" />Resolve</>
                            : <><Flag className="w-3 h-3 mr-1" />Reopen</>
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!replyDialogReview} onOpenChange={open => { if (!open) { setReplyDialogReview(null); setReplyText(''); }}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {replyDialogReview && (
              <div className="bg-secondary/40 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{replyDialogReview.reviewer_name || 'Anonymous'}</span>
                  <Stars rating={replyDialogReview.rating} />
                </div>
                <p className="text-sm text-muted-foreground">{replyDialogReview.comment}</p>
              </div>
            )}
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write your author response…"
              className="min-h-[100px]"
            />
            <Button className="w-full" onClick={handleReply} disabled={!replyText.trim()}>
              Post Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}