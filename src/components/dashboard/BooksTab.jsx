import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import {
  Plus, Search, BookOpen, ArrowUpDown, CheckCircle2, Clock,
  FileEdit, XCircle, ChevronRight, DollarSign, Calendar, Filter, Trash2, Archive, Eye, EyeOff
} from 'lucide-react';
import { formatDate } from '@/utils/date';
import { PublishBookService, getApiError } from '@/services/publishBook.service';

// Normalize a book record so the UI can use a single shape regardless of API casing.
function normalizeBook(b) {
  if (!b) return b;
  const authorName =
    b.author_name ??
    b.authorName ??
    b.author ??
    ([b.authorFirstName, b.authorLastName].filter(Boolean).join(' ').trim() || undefined);
  return {
    id: b.id ?? b.bookId ?? b.book_id,
    title: b.title,
    subtitle: b.subtitle ?? b.subTitle,
    status: b.status ?? b.bookStatusCode ?? b.book_status_code,
    author_name: authorName,
    cover_url: b.cover_url ?? b.coverUrl ?? b.frontCover,
    list_price: Number(b.list_price ?? b.listPrice ?? b.price ?? 0),
    currency: b.currency,
    royalty_plan: b.royalty_plan ?? b.royaltyPlan ?? b.royaltyPercentage,
    created_date: b.created_date ?? b.createdDate ?? b.createdAt ?? b.publication?.createdAt,
  };
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'price_desc', label: 'Price (high–low)' },
];

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileEdit, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  in_review: { label: 'In Review', icon: Clock, bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  published: { label: 'Published', icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  unpublished: { label: 'Unpublished', icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  rejected: { label: 'Rejected', icon: XCircle, bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const STATUS_FILTERS = ['all', 'published', 'in_review', 'draft', 'unpublished', 'rejected'];

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function BooksTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || 'all');
  const [sort, setSort] = useState('newest');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [selectedBooks, setSelectedBooks] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Honor incoming navigation state (e.g. redirected from publish flow with "in_review")
  useEffect(() => {
    if (location.state?.statusFilter) {
      setStatusFilter(location.state.statusFilter);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPageNumber(1); }, [debouncedSearch, statusFilter, sort]);

  const queryParams = {
    pageNumber,
    pageSize,
    searchTerm: debouncedSearch,
    status: statusFilter,
    sortBy: sort,
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['publisherBooks', queryParams],
    queryFn: () => PublishBookService.list(queryParams),
    keepPreviousData: true,
  });

  // Be tolerant to a few possible response shapes
  const rawBooks = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.items || data.books || data.data?.items || data.data?.books || data.data || [];
  }, [data]);

  const books = useMemo(() => rawBooks.map(normalizeBook), [rawBooks]);
  const totalCount = data?.totalCount ?? data?.total ?? data?.data?.totalCount ?? books.length;

  // Stats from current page (no separate counts endpoint exposed)
  const stats = useMemo(() => ({
    total: totalCount,
    published: books.filter(b => b.status === 'published').length,
    in_review: books.filter(b => b.status === 'in_review').length,
    draft: books.filter(b => b.status === 'draft').length,
    unpublished: books.filter(b => b.status === 'unpublished').length,
    rejected: books.filter(b => b.status === 'rejected').length,
  }), [books, totalCount]);

  // Server already filters/sorts; use as-is
  const filteredBooks = books;

  useEffect(() => {
    if (error) toast.error(getApiError(error, 'Failed to load books'));
  }, [error]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const toggleSelect = (bookId) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedBooks.size === filteredBooks.length) {
      setSelectedBooks(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedBooks(new Set(filteredBooks.map(b => b.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedBooks.size} selected books? This cannot be undone.`)) return;
    try {
      for (const bookId of selectedBooks) {
        await base44.entities.Book.delete(bookId);
      }
      toast.success(`Deleted ${selectedBooks.size} book${selectedBooks.size > 1 ? 's' : ''}`);
      setSelectedBooks(new Set());
      setShowBulkActions(false);
    } catch {
      toast.error('Failed to delete books');
    }
  };

  const handleBulkUnpublish = async () => {
    if (!confirm(`Unpublish ${selectedBooks.size} selected books?`)) return;
    try {
      for (const bookId of selectedBooks) {
        const book = books.find(b => b.id === bookId);
        if (book?.status === 'published') {
          await base44.entities.Book.update(bookId, { status: 'unpublished' });
        }
      }
      toast.success(`Unpublished ${selectedBooks.size} book${selectedBooks.size > 1 ? 's' : ''}`);
      setSelectedBooks(new Set());
      setShowBulkActions(false);
    } catch {
      toast.error('Failed to unpublish books');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Books</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your eBook catalog and publishing pipeline.</p>
        </div>
        <Link to="/publish">
          <Button className="gap-2 shadow-sm shadow-primary/20">
            <Plus className="w-4 h-4" /> Publish New Book
          </Button>
        </Link>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-secondary/50' },
          { label: 'Published', value: stats.published, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'In Review', value: stats.in_review, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Drafts', value: stats.draft, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((s, idx) => (
          <button
            key={`${s.label}-${idx}`}
            // onClick={() => setStatusFilter(s.label === 'Total' ? 'all' : s.label.toLowerCase().replace(' ', '_'))}
            className={`${s.bg} border rounded-xl px-4 py-3 text-left hover:shadow-sm transition-all`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
                )}
              >
                {s === 'all' ? `All (${stats.total})` :
                  s === 'published' ? `Published (${stats.published})` :
                    s === 'in_review' ? `In Review (${stats.in_review})` :
                      s === 'draft' ? `Drafts (${stats.draft})` :
                        s === 'unpublished' ? `Unpublished (${stats.unpublished})` :
                          `Rejected (${stats.rejected})`}
              </button>
            ))}
          </div>
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40 gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions Toolbar */}
      {showBulkActions && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedBooks.size === filteredBooks.length && filteredBooks.length > 0}
              onCheckedChange={toggleSelectAll}
              className="shrink-0"
            />
            <p className="text-sm font-medium text-primary">{selectedBooks.size} selected</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBulkUnpublish} className="text-xs gap-1.5">
              <EyeOff className="w-3.5 h-3.5" /> Unpublish
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="text-xs gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedBooks(new Set()); setShowBulkActions(false); }} className="text-xs">
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Book List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 flex gap-4">
              <Skeleton className="w-16 h-22 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 bg-card border rounded-2xl">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {books.length === 0 ? 'No books yet' : 'No matching books'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {books.length === 0 ? 'Publish your first eBook to start earning royalties.' : 'Try adjusting your search or filters.'}
          </p>
          {books.length === 0 && (
            <Link to="/publish"><Button className="gap-2"><Plus className="w-4 h-4" /> Publish New Book</Button></Link>
          )}
        </div>
      ) : (
        <div className="bg-card border rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b bg-secondary/30">
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={selectedBooks.size === filteredBooks.length && filteredBooks.length > 0}
                onCheckedChange={toggleSelectAll}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <span className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Book</span>
            <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
            <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Price</span>
            <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Royalty/Sale</span>
            <span className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</span>
          </div>
          <div className="divide-y">
            {filteredBooks.map(book => {
              const rate = parseFloat(book.royalty_plan || 70) / 100;
              const priceNum = Number(book.list_price) || 0;
              const perSale = priceNum > 0 ? priceNum * rate : null;
              return (
                <div
                  key={book.id}
                  className="flex md:grid md:grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-secondary/20 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-center md:flex hidden" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedBooks.has(book.id)}
                      onCheckedChange={() => toggleSelect(book.id)}
                    />
                  </div>
                  {/* Book */}
                  <div className="col-span-4 flex items-center gap-3 flex-1 min-w-0">
                    {book.cover_url
                      ? <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0" />
                      : <div className="w-10 h-14 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                    }
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">by {book.author_name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(book.created_date)}
                      </p>
                    </div>
                  </div>
                  {/* Status */}
                  <div className="col-span-2 hidden md:block">
                    <StatusPill status={book.status} />
                  </div>
                  {/* Price */}
                  <div className="col-span-2 hidden md:block text-right">
                    <p className="text-sm font-semibold">{priceNum > 0 ? `$${priceNum.toFixed(2)}` : '—'}</p>
                    <p className="text-[10px] text-muted-foreground">{book.currency || 'USD'}</p>
                  </div>
                  {/* Royalty */}
                  <div className="col-span-2 hidden md:block text-right">
                    <p className={`text-sm font-bold ${perSale ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      {perSale ? `$${perSale.toFixed(2)}` : '—'}
                    </p>
                    {perSale && <p className="text-[10px] text-muted-foreground">{book.royalty_plan || 70}% plan</p>}
                  </div>
                  {/* Action */}
                  <div className="col-span-1 flex justify-end">
                    <span className="text-xs text-primary font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {book.status === 'draft' ? 'Continue' : 'View'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {pageNumber} of {totalPages}{isFetching ? ' · updating…' : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pageNumber <= 1 || isFetching}
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={pageNumber >= totalPages || isFetching}
              onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}