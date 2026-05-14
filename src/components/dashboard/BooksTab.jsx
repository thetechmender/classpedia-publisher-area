import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import BookCard from './BookCard';
import { Plus, Search, BookOpen, ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'oldest',     label: 'Oldest first' },
  { value: 'title',      label: 'Title A–Z' },
  { value: 'price_desc', label: 'Price (high–low)' },
];

export default function BooksTab({ books, isLoading }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const stats = useMemo(() => ({
    total: books.length,
    published: books.filter(b => b.status === 'published').length,
    in_review: books.filter(b => b.status === 'in_review').length,
    draft: books.filter(b => b.status === 'draft').length,
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">My Books</h2>
          <p className="text-sm text-muted-foreground">Manage your published and draft eBooks.</p>
        </div>
        <Link to="/publish">
          <Button className="gap-2"><Plus className="w-4 h-4" /> New eBook</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author..." className="pl-9" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
            <TabsTrigger value="in_review">In Review ({stats.in_review})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40 gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-4 flex gap-4">
              <Skeleton className="w-20 h-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {books.length === 0 ? 'No books yet' : 'No matching books'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {books.length === 0 ? 'Start publishing your first eBook today' : 'Try adjusting your search or filters'}
          </p>
          {books.length === 0 && (
            <Link to="/publish"><Button className="gap-2"><Plus className="w-4 h-4" /> Create New eBook</Button></Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}