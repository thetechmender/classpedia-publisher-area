import React from 'react';
import { BookOpen, Clock, CheckCircle2, XCircle, FileEdit, ChevronRight, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  draft:       { label: 'Draft',       icon: FileEdit,     bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400',   border: 'border-slate-200' },
  in_review:   { label: 'In Review',   icon: Clock,        bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   border: 'border-amber-200' },
  published:   { label: 'Published',   icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  unpublished: { label: 'Unpublished', icon: XCircle,      bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     border: 'border-red-200' },
};

export default function BookCard({ book, onClick }) {
  const status = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const royalty = book.list_price ? (book.list_price * (parseFloat(book.royalty_plan || 70) / 100)).toFixed(2) : null;

  return (
    <button
      onClick={() => onClick(book)}
      className="w-full text-left bg-card border rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all group"
    >
      <div className="flex gap-4">
        {/* Cover */}
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-[52px] h-[72px] object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow shrink-0"
          />
        ) : (
          <div className="w-[52px] h-[72px] bg-gradient-to-br from-secondary to-muted rounded-xl flex items-center justify-center shrink-0 border border-border">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            {/* Title + status */}
            <div className="flex items-start gap-2 justify-between">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {book.title}
              </h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            {book.subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{book.subtitle}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">by {book.author_name}</p>
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/50">
            <div className="flex items-center gap-2.5">
              {book.list_price ? (
                <span className="text-sm font-bold">${book.list_price.toFixed(2)}</span>
              ) : (
                <span className="text-xs text-muted-foreground italic">No price</span>
              )}
              {book.status === 'published' && royalty && (
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                  <DollarSign className="w-3 h-3" />{royalty}/sale
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">{format(new Date(book.created_date), 'MMM d, yy')}</span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 group-hover:underline ${
                book.status === 'draft' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {book.status === 'draft' ? 'Continue' : 'View'}
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}