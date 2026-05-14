import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

function SearchResultItem({ icon: Icon, title, subtitle, type, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-accent rounded-lg transition-colors text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0">{type}</Badge>
    </button>
  );
}

export default function GlobalSearch({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const { data: books = [] } = useQuery({
    queryKey: ['search-books', query],
    queryFn: async () => {
      if (!query) return [];
      const all = await base44.entities.Book.list();
      return all.filter(b => 
        b.title?.toLowerCase().includes(query.toLowerCase()) ||
        b.author_name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    },
    enabled: query.length > 0,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['search-reviews', query],
    queryFn: async () => {
      if (!query) return [];
      const all = await base44.entities.Review.list();
      return all.filter(r => 
        r.book_title?.toLowerCase().includes(query.toLowerCase()) ||
        r.reviewer_name?.toLowerCase().includes(query.toLowerCase()) ||
        r.comment?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    },
    enabled: query.length > 0,
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['search-issues', query],
    queryFn: async () => {
      if (!query) return [];
      const all = await base44.entities.Issue.list();
      return all.filter(i => 
        i.title?.toLowerCase().includes(query.toLowerCase()) ||
        i.book_title?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
    },
    enabled: query.length > 0,
  });

  const handleSelect = (type, item) => {
    if (type === 'Book') navigate(`/book/${item.id}`);
    if (type === 'Review') navigate('/reviews');
    if (type === 'Issue') navigate('/reviews');
    onClose?.();
  };

  const hasResults = books?.length > 0 || reviews?.length > 0 || issues?.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[10vh] p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border animate-in fade-in zoom-in duration-200">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, reviews, issues..."
            className="border-0 shadow-none focus-visible:ring-0 px-0 text-base"
          />
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length === 0 && (
            <div className="text-center py-12">
              <Command className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Search anything</p>
              <p className="text-xs text-muted-foreground mt-1">Type to search books, reviews, and issues</p>
            </div>
          )}

          {query.length > 0 && !hasResults && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search terms</p>
            </div>
          )}

          {hasResults && (
            <div className="space-y-4">
              {books?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">Books</p>
                  <div className="space-y-1">
                    {books.map(book => (
                      <SearchResultItem
                        key={book.id}
                        icon={() => <span className="text-lg">📖</span>}
                        title={book.title}
                        subtitle={book.author_name}
                        type={book.status}
                        onClick={() => handleSelect('Book', book)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {reviews?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">Reviews</p>
                  <div className="space-y-1">
                    {reviews.map(review => (
                      <SearchResultItem
                        key={review.id}
                        icon={() => <span className="text-lg">⭐</span>}
                        title={`${review.reviewer_name} - ${review.book_title}`}
                        subtitle={`${review.rating}★ · ${review.comment?.slice(0, 60)}...`}
                        type="Review"
                        onClick={() => handleSelect('Review', review)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {issues?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">Issues</p>
                  <div className="space-y-1">
                    {issues.map(issue => (
                      <SearchResultItem
                        key={issue.id}
                        icon={() => <span className="text-lg">🚩</span>}
                        title={issue.title}
                        subtitle={`${issue.book_title} · ${issue.severity}`}
                        type={issue.status}
                        onClick={() => handleSelect('Issue', issue)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-secondary/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {books?.length || 0} books · {reviews?.length || 0} reviews · {issues?.length || 0} issues
          </p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}