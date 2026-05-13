import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle2, XCircle, FileEdit } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileEdit, className: 'bg-secondary text-secondary-foreground' },
  in_review: { label: 'In Review', icon: Clock, className: 'bg-accent text-accent-foreground' },
  published: { label: 'Published', icon: CheckCircle2, className: 'bg-primary/10 text-primary' },
  unpublished: { label: 'Unpublished', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export default function BookCard({ book, onClick }) {
  const status = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

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
        <div className="flex-1 min-w-0">
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
          <div className="flex items-center gap-4 mt-3">
            {book.list_price && (
              <span className="text-sm font-semibold text-primary">${book.list_price.toFixed(2)}</span>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(book.created_date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}