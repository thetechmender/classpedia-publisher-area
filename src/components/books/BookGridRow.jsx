import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Eye, Pencil, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/utils/date';
import UnpublishDialog from './UnpublishDialog';

const STATUS_CONFIG = {
  draft:       { label: 'Draft',       bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400',   ring: 'ring-slate-200/80' },
  in_review:   { label: 'In Review',   bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400',   ring: 'ring-amber-200/80' },
  published:   { label: 'Published',   bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200/80' },
  unpublished: { label: 'Unpublished', bg: 'bg-red-50',      text: 'text-red-600',     dot: 'bg-red-400',     ring: 'ring-red-200/80' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1',
      cfg.bg, cfg.text, cfg.ring
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export default function BookGridRow({ book, colClass }) {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);

  const perSale = book.list_price ? book.list_price * 0.70 : null;
  const publishedUrl = `https://classpedia.ai/book/${book.id}`;

  const handleUnpublishConfirm = async (reason) => {
    await base44.entities.Book.update(book.id, { status: 'unpublished' });
    queryClient.invalidateQueries({ queryKey: ['books'] });
    toast.success('Book delisted from marketplace');
  };

  const handleEdit  = (e) => { e.stopPropagation(); navigate(`/publish?bookId=${book.id}`); };
  const handleView  = (e) => { e.stopPropagation(); navigate(`/book/${book.id}`); };


  return (
    <div className="group hover:bg-accent/20 transition-colors duration-100">
      <div className={cn('grid items-center gap-4 px-5 py-2.5', colClass)}>

        {/* Book + Meta */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <p className="font-semibold text-[13px] text-foreground leading-tight truncate max-w-[220px]">{book.title}</p>
              {book.classpedia_select && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full ring-1 ring-primary/20 shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> SELECT
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Author */}
        <div className="min-w-0">
          <p className="text-[12px] text-foreground font-medium truncate">{book.author_name || '—'}</p>
        </div>

        {/* Date Added */}
        <div>
          <p className="text-[12px] text-foreground">{formatDate(book.created_date)}</p>
        </div>

        {/* Status */}
        <div>
          <p className={cn('text-[12px] font-medium', STATUS_CONFIG[book.status]?.text || 'text-slate-600')}>
            {STATUS_CONFIG[book.status]?.label || book.status}
          </p>
        </div>

        {/* Price */}
        <div>
          {book.list_price
            ? <p className="text-sm font-bold text-foreground">${book.list_price.toFixed(2)} <span className="text-[10px] font-normal text-muted-foreground">{book.currency || 'USD'}</span></p>
            : <span className="text-sm font-medium text-muted-foreground/50">—</span>
          }
        </div>

        {/* Actions — inline icons */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={handleView}
                  className="h-8 w-8 px-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
            {book.status !== 'in_review' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={handleEdit}
                    className="h-8 w-8 px-0 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Book</TooltipContent>
              </Tooltip>
            )}
            {book.status === 'published' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setShowUnpublishDialog(true); }}
                    className="h-8 w-8 px-0 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-50">
                    <EyeOff className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unpublish / Delist</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

      </div>

      <UnpublishDialog
        book={book}
        open={showUnpublishDialog}
        onClose={() => setShowUnpublishDialog(false)}
        onConfirm={handleUnpublishConfirm}
      />
    </div>
  );
}