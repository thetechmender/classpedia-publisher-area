import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, CheckCircle2, Clock, FileEdit, TrendingUp, DollarSign } from 'lucide-react';

export default function OverviewTab({ books, authorProfile, onTabChange }) {
  const stats = {
    total: books.length,
    published: books.filter(b => b.status === 'published').length,
    in_review: books.filter(b => b.status === 'in_review').length,
    draft: books.filter(b => b.status === 'draft').length,
  };

  const estimatedEarnings = books
    .filter(b => b.status === 'published' && b.list_price)
    .reduce((sum, b) => sum + b.list_price * 0.7, 0);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/40 border border-primary/20 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            Welcome back{authorProfile?.pen_name ? `, ${authorProfile.pen_name}` : ''}!
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total === 0
              ? 'Start publishing your first eBook today.'
              : `You have ${stats.total} book${stats.total > 1 ? 's' : ''} in your catalog.`}
          </p>
        </div>
        <Link to="/publish">
          <Button className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> New eBook
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Books',  value: stats.total,     icon: BookOpen,     color: 'text-foreground',         tab: 'books' },
          { label: 'Published',    value: stats.published, icon: CheckCircle2, color: 'text-primary',            tab: 'books' },
          { label: 'In Review',    value: stats.in_review, icon: Clock,        color: 'text-amber-600',          tab: 'books' },
          { label: 'Drafts',       value: stats.draft,     icon: FileEdit,     color: 'text-muted-foreground',   tab: 'books' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => onTabChange(s.tab)}
            className="bg-card border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* Earnings snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated Royalties</p>
            <p className="text-xl font-bold text-green-600">${estimatedEarnings.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground">based on published prices × 70%</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Listings</p>
            <p className="text-xl font-bold">{stats.published}</p>
            <button onClick={() => onTabChange('payments')} className="text-[11px] text-primary hover:underline">
              View payment history →
            </button>
          </div>
        </div>
      </div>

      {/* Recent books */}
      {books.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Recent Books</h3>
            <button onClick={() => onTabChange('books')} className="text-xs text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2">
            {books.slice(0, 3).map(book => (
              <div key={book.id} className="bg-card border rounded-lg px-4 py-3 flex items-center gap-3">
                {book.cover_url
                  ? <img src={book.cover_url} alt={book.title} className="w-8 h-11 object-cover rounded shadow-sm shrink-0" />
                  : <div className="w-8 h-11 bg-secondary rounded flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-muted-foreground" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">by {book.author_name}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  book.status === 'published' ? 'bg-primary/10 text-primary' :
                  book.status === 'in_review' ? 'bg-amber-100 text-amber-700' :
                  'bg-secondary text-secondary-foreground'
                }`}>{book.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}