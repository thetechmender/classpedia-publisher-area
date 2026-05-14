import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Plus, BookOpen, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function TopBar({ authorProfile, books = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const results = searchQuery.trim().length > 1
    ? books.filter(b =>
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="hidden md:flex h-14 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30 items-center px-6 gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          placeholder="Search books, payments…"
          className="pl-9 h-8 text-sm bg-secondary border-0 focus-visible:ring-1"
        />
        {searchOpen && results.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-card border rounded-xl shadow-lg z-50 overflow-hidden">
            {results.map(book => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary transition-colors text-sm"
              >
                {book.cover_url
                  ? <img src={book.cover_url} className="w-6 h-8 object-cover rounded shrink-0" alt="" />
                  : <div className="w-6 h-8 bg-secondary rounded flex items-center justify-center shrink-0">
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                    </div>
                }
                <div className="min-w-0">
                  <p className="font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{book.status?.replace('_', ' ')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        {searchOpen && searchQuery.trim().length > 1 && results.length === 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-card border rounded-xl shadow-lg z-50 px-4 py-3 text-sm text-muted-foreground">
            No results for "{searchQuery}"
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <Link to="/publish">
          <Button size="sm" className="gap-1.5 h-8 text-xs px-3">
            <Plus className="w-3.5 h-3.5" /> Publish New Book
          </Button>
        </Link>
      </div>
    </header>
  );
}