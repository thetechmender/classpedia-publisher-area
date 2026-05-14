import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, CheckCircle2, XCircle, FileEdit, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  draft:       { label: 'Draft',       icon: FileEdit,     className: 'bg-secondary text-secondary-foreground' },
  in_review:   { label: 'In Review',   icon: Clock,        className: 'bg-amber-100 text-amber-700' },
  published:   { label: 'Published',   icon: CheckCircle2, className: 'bg-primary/10 text-primary' },
  unpublished: { label: 'Unpublished', icon: XCircle,      className: 'bg-destructive/10 text-destructive' },
};

export default function BookCard({ book, onClick }) {
  const status = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const royalty = book.list_price ? (book.list_price * 0.7).toFixed(2) : null;

  return (
    <button
      onClick={() => onClick(book)}
      className="w-full text-left bg-card border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <div className="flex gap-4">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-20 h-28 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow shrink-0"
          />
        ) : (
          <div className="w-20 h-28 bg-secondary rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <Badge className={cn('text-[10px] shrink-0 gap-1', status.className)}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </Badge>
            </div>
            {book.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.subtitle}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">by {book.author_name}</p>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              {book.list_price ? (
                <div>
                  <span className="text-sm font-bold text-foreground">${book.list_price.toFixed(2)}</span>
                  {book.status === 'published' && royalty && (
                    <span className="text-xs text-green-600 font-medium ml-1.5">
                      +${royalty} royalty
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">No price set</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(book.created_date), 'MMM d, yyyy')}
              </span>
              {book.status === 'draft' && (
                <span className="text-xs text-primary font-medium flex items-center gap-0.5 group-hover:underline">
                  Continue <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}