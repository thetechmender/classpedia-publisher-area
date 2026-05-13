import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, BookOpen, FileEdit, Clock, CheckCircle2, Library } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BookCard from '@/components/dashboard/BookCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date'),
  });

  const filteredBooks = books.filter(book => {
    const matchesSearch = !search || book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: books.length,
    published: books.filter(b => b.status === 'published').length,
    in_review: books.filter(b => b.status === 'in_review').length,
    draft: books.filter(b => b.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Bookshelf</h1>
              <p className="text-xs text-muted-foreground">Kindle Direct Publishing</p>
            </div>
          </div>
          <Link to="/publish">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create New eBook
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Books', value: stats.total, icon: Library, color: 'text-foreground' },
            { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-primary' },
            { label: 'In Review', value: stats.in_review, icon: Clock, color: 'text-accent-foreground' },
            { label: 'Drafts', value: stats.draft, icon: FileEdit, color: 'text-muted-foreground' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author..."
              className="pl-9"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="in_review">In Review</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Book List */}
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
              {books.length === 0
                ? 'Start publishing your first eBook today'
                : 'Try adjusting your search or filters'}
            </p>
            {books.length === 0 && (
              <Link to="/publish">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Create New eBook
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/book/${book.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}