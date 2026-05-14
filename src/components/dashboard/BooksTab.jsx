import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Plus, Search, BookOpen, ArrowUpDown, CheckCircle2, Clock,
  FileEdit, XCircle, ChevronRight, DollarSign, Calendar, Filter
} from 'lucide-react';
import { format } from 'date-fns';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'oldest',     label: 'Oldest first' },
  { value: 'title',      label: 'Title A–Z' },
  { value: 'price_desc', label: 'Price (high–low)' },
];

const STATUS_CONFIG = {
  draft:       { label: 'Draft',       icon: FileEdit,     bg: 'bg-slate-100',    text: 'text-slate-600',  dot: 'bg-slate-400' },
  in_review:   { label: 'In Review',   icon: Clock,        bg: 'bg-amber-100',    text: 'text-amber-700',  dot: 'bg-amber-500' },
  published:   { label: 'Published',   icon: CheckCircle2, bg: 'bg-emerald-100',  text: 'text-emerald-700',dot: 'bg-emerald-500' },
  unpublished: { label: 'Unpublished', icon: XCircle,      bg: 'bg-red-100',      text: 'text-red-700',    dot: 'bg-red-500' },
};

const STATUS_FILTERS = ['all', 'published', 'in_review', 'draft', 'unpublished'];

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function BooksTab({ books, isLoading }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const stats = useMemo(() => ({
    total:      books.length,
    published:  books.filter(b => b.status === 'published').length,
    in_review:  books.filter(b => b.status === 'in_review').length,
    draft:      books.filter(b => b.status === 'draft').length,
    unpublished: books.filter(b => b.status === 'unpublished').length,
  }), [books]);

  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      const matchesSearch = !search ||
        book.title?.toLowerCase().includes(search.toLowerCase()) ||
        book.author_name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    switch (sort) {
      case 'oldest':     result = [...result].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); break;
      case 'title':      result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
      case 'price_desc': result = [...result].sort((a, b) => (b.list_price || 0) - (a.list_price || 0)); break;
      default:           result = [...result].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    return result;
  }, [books, search, statusFilter, sort]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif">My Books</h2>
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
          { label: 'Total',       value: stats.total,      color: 'text-foreground',    bg: 'bg-secondary/50' },
          { label: 'Published',   value: stats.published,  color: 'text-emerald-600',   bg: 'bg-emerald-50' },
          { label: 'In Review',   value: stats.in_review,  color: 'text-amber-600',     bg: 'bg-amber-50' },
          { label: 'Drafts',      value: stats.draft,      color: 'text-slate-500',     bg: 'bg-slate-50' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.label === 'Total' ? 'all' : s.label.toLowerCase().replace(' ', '_'))}
            className={`${s.bg} border rounded-xl px-4 py-3 text-left hover:shadow-sm transition-all`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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
               `Unpublished (${stats.unpublished})`}
            </button>
          ))}
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
            <span className="col-span-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Book</span>
            <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</span>
            <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Price</span>
            <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Royalty/Sale</span>
            <span className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</span>
          </div>
          <div className="divide-y">
            {filteredBooks.map(book => {
              const rate = parseFloat(book.royalty_plan || 70) / 100;
              const perSale = book.list_price ? book.list_price * rate : null;
              return (
                <div
                  key={book.id}
                  className="flex md:grid md:grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  {/* Book */}
                  <div className="col-span-5 flex items-center gap-3 flex-1 min-w-0">
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
                        {format(new Date(book.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  {/* Status */}
                  <div className="col-span-2 hidden md:block">
                    <StatusPill status={book.status} />
                  </div>
                  {/* Price */}
                  <div className="col-span-2 hidden md:block text-right">
                    <p className="text-sm font-semibold">{book.list_price ? `$${book.list_price.toFixed(2)}` : '—'}</p>
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
                    <span className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline">
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
    </div>
  );
}