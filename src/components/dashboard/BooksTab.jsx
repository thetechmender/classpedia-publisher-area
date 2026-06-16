import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Plus, Search, BookOpen, ChevronDown, X, SlidersHorizontal, CheckCircle2, Clock, FileEdit } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';

import BookGridRow from '@/components/books/BookGridRow';
import PageHeader from '@/components/shared/PageHeader';

const SORT_OPTIONS = [
{ value: 'newest', label: 'Newest first' },
{ value: 'oldest', label: 'Oldest first' },
{ value: 'title', label: 'Title A–Z' },
{ value: 'price_desc', label: 'Price ↓' },
{ value: 'price_asc', label: 'Price ↑' }];


const STATUS_FILTERS = [
{ value: 'all', label: 'All Books', color: null },
{ value: 'published', label: 'Published', color: 'emerald' },
{ value: 'in_review', label: 'In Review', color: 'amber' },
{ value: 'draft', label: 'Drafts', color: 'slate' }];


export const COL_CLASS = 'grid-cols-[1fr_160px_120px_90px_120px_150px]';

const DOT_COLORS = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-400',
  slate: 'bg-slate-400',
  red: 'bg-red-400'
};

function KpiCard({ icon: Icon, label, value, sub, subColor, iconColor, iconBg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border rounded-2xl p-5 text-left group w-full relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.8} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] flex-1">{label}</p>
        </div>
        <p className="text-4xl font-bold tracking-tight text-foreground leading-none mb-3">{value}</p>
        {sub &&
        <p className={`text-[11px] font-medium ${subColor || 'text-muted-foreground'} transition-opacity duration-200`}>{sub}</p>
        }
      </div>
    </button>);

}

function GridHeader() {
  return (
    <div className={cn('grid items-center gap-4 px-5 py-2.5 bg-muted/40 border-b border-border/60', COL_CLASS)}>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Book Title</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Author Name</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date Added</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</p>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</p>
    </div>);

}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-border/60">
      {Array(4).fill(0).map((_, i) =>
      <div key={i} className={cn('grid items-center gap-4 px-5 py-2.5', COL_CLASS)}>
          <div className="flex items-center gap-3.5">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      )}
    </div>);

}

export default function BooksTab({ books, isLoading }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const stats = useMemo(() => ({
    total: books.length,
    published: books.filter((b) => b.status === 'published').length,
    in_review: books.filter((b) => b.status === 'in_review').length,
    draft: books.filter((b) => b.status === 'draft').length,
    unpublished: books.filter((b) => b.status === 'unpublished').length,
    earnings: (() => {
      const pub = books.filter((b) => b.status === 'published');
      if (!pub.length) return null;
      return pub.reduce((s, b) => s + (b.list_price ? b.list_price * 0.70 : 0), 0) / pub.length;
    })()
  }), [books]);

  const filteredBooks = useMemo(() => {
    let r = books.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch = !search || b.title?.toLowerCase().includes(q) || b.author_name?.toLowerCase().includes(q) || b.isbn?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
    switch (sort) {
      case 'oldest':r = [...r].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));break;
      case 'title':r = [...r].sort((a, b) => (a.title || '').localeCompare(b.title || ''));break;
      case 'price_desc':r = [...r].sort((a, b) => (b.list_price || 0) - (a.list_price || 0));break;
      case 'price_asc':r = [...r].sort((a, b) => (a.list_price || 0) - (b.list_price || 0));break;
      default:r = [...r].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    return r;
  }, [books, search, statusFilter, sort]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Sort';
  const hasActiveFilters = search || statusFilter !== 'all';

  const getCount = (val) => val === 'all' ? books.length : stats[val] ?? 0;

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <PageHeader
        title="My Books"
        description={books.length > 0 ?
        `${books.length} ${books.length === 1 ? 'title' : 'titles'} in your catalog` :
        'Your eBook publishing catalog'}
        action={{
          label: 'Publish New Book',
          icon: Plus,
          component: Link,
          to: '/publish',
          className: 'shadow-sm shadow-primary/20 font-semibold'
        }} />
      

      {/* ── KPI Strip (first 4 cards from Overview) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={BookOpen}
          label="Total Books"
          value={stats.total}
          sub={stats.total === 0 ? 'No books yet' : `${stats.published} published · ${stats.in_review} in review · ${stats.draft} draft${stats.draft !== 1 ? 's' : ''}`}
          subColor="text-muted-foreground"
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          onClick={() => setStatusFilter('all')} />
        
        <KpiCard
          icon={CheckCircle2}
          label="Published Books"
          value={stats.published}
          sub={stats.published === 0 ? 'No published books' : 'Live on platform'}
          subColor={stats.published > 0 ? 'text-emerald-600' : 'text-muted-foreground'}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          onClick={() => setStatusFilter('published')} />
        
        <KpiCard
          icon={Clock}
          label="Books in Review"
          value={stats.in_review}
          sub={stats.in_review > 0 ? 'Estimated approval within 72 hrs' : 'No books in review'}
          subColor={stats.in_review > 0 ? 'text-amber-600' : 'text-muted-foreground'}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          onClick={() => setStatusFilter('in_review')} />
        
        <KpiCard
          icon={FileEdit}
          label="Drafts"
          value={stats.draft}
          sub={stats.draft > 0 ? 'Incomplete · needs action' : 'No drafts'}
          subColor={stats.draft > 0 ? 'text-violet-600' : 'text-muted-foreground'}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          onClick={() => setStatusFilter('draft')} />
      </div>



          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              



              
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



      {/* Table card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        


        
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Book Catalog</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Manage and track all your published and draft books</p>
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
        {isLoading ?
        <LoadingSkeleton /> :
        filteredBooks.length === 0 ?
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">
              {books.length === 0 ? 'No books yet' : 'No matching books'}
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
              {books.length === 0 ?
            'Publish your first eBook to start earning royalties on Classpedia.' :
            "Try adjusting your search or filter to find what you're looking for."}
            </p>
            {books.length === 0 ?
          <Link to="/publish"><Button className="gap-2"><Plus className="w-4 h-4" /> Publish New Book</Button></Link> :
          <Button variant="outline" onClick={() => {setSearch('');setStatusFilter('all');}} className="gap-2 rounded-xl"><X className="w-3.5 h-3.5" /> Clear Filters</Button>
          }
          </div> :

        <>
            <GridHeader />
            <div className="divide-y divide-border/50">
              {filteredBooks.map((book) =>
            <BookGridRow key={book.id} book={book} colClass={COL_CLASS} />
            )}
            </div>
            <div className="px-5 py-3 border-t border-border/60 bg-muted/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredBooks.length}</span>
                {filteredBooks.length !== books.length && <span> of <span className="font-semibold text-foreground">{books.length}</span></span>}
                {' '}books
              </p>
              {hasActiveFilters &&
            <button
              onClick={() => {setSearch('');setStatusFilter('all');}}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-medium">
              
                  <X className="w-3 h-3" /> Reset filters
                </button>
            }
            </div>
          </>
        }
      </div>

    </div>);

}