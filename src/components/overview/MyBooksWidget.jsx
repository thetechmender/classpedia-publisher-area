import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, BookOpen, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { formatDate } from '@/utils/date';

import StatusBadge from '@/components/shared/StatusBadge';

function BookRow({ book }) {
  const navigate = useNavigate();
  const perSale = book.list_price ? book.list_price * 0.70 : null;

  return (
    <div
      className="grid grid-cols-[1fr_105px_70px_100px] gap-3 items-center px-4 py-3 hover:bg-accent/20 transition-colors cursor-pointer border-b border-border/50 last:border-b-0"
      onClick={() => navigate(`/book/${book.id}`)}>
      
      {/* Title + meta */}
      <div className="flex items-center gap-2.5 min-w-0">
        {book.cover_url ?
        <img src={book.cover_url} alt={book.title} className="w-8 h-[46px] object-cover rounded-md shadow-sm ring-1 ring-black/8 shrink-0" /> :
        <div className="w-8 h-[46px] bg-secondary rounded-md flex items-center justify-center border border-border/60 shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
        }
        <div className="min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <p className="font-semibold text-[12px] text-foreground leading-tight truncate">{book.title}</p>
            {book.classpedia_select &&
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-primary/10 text-primary px-1 py-0.5 rounded-full ring-1 ring-primary/20 shrink-0">
                <Sparkles className="w-2 h-2" /> SELECT
              </span>
            }
          </div>
          <p className="text-[10px] text-muted-foreground truncate">by {book.author_name}</p>
          <p className="text-[9px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
            <Calendar className="w-2 h-2 shrink-0" />{formatDate(book.created_date)}
          </p>
        </div>
      </div>

      {/* Status */}
      <div><StatusBadge status={book.status} /></div>

      {/* Price */}
      <div>
        {book.list_price ?
        <p className="text-sm font-bold text-foreground">${book.list_price.toFixed(2)}</p> :
        <span className="text-sm text-muted-foreground/40">—</span>
        }
      </div>

      {/* Earnings per sale */}
      <div>
        {perSale ?
        <>
              <p className="text-sm font-bold text-emerald-600">${perSale.toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">per sale</p>
            </> :
        <span className="text-sm text-muted-foreground/40">—</span>
        }
      </div>
    </div>);

}

export default function MyBooksWidget({ books = [], onTabChange }) {
  const sorted = [...books].sort((a, b) => {
    const order = { published: 0, in_review: 1, draft: 2, unpublished: 3 };
    const diff = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (diff !== 0) return diff;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const visible = sorted.slice(0, 5);

  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">My Books</h2>
            <p className="text-xs text-muted-foreground">{books.length} title{books.length !== 1 ? 's' : ''} in catalog</p>
          </div>
        </div>
        <button
          onClick={() => onTabChange('books')}
          className="text-[12px] font-semibold text-primary flex items-center gap-1 hover:underline">
          View Books <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Column headers */}
      {books.length > 0 &&
      <div className="grid grid-cols-[1fr_105px_70px_100px] gap-3 items-center px-4 py-2 bg-muted/40 border-b border-border/60">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Book TITLE</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Earnings</p>
        </div>
      }

      {/* Rows */}
      {books.length === 0 ?
      <div className="flex flex-col items-center justify-center py-14 text-center px-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-primary/50" />
          </div>
          <p className="text-sm font-semibold text-foreground">No books yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-[200px] leading-relaxed">
            Publish your first eBook to start earning royalties.
          </p>
          <Link to="/publish">
            <Button size="sm" className="gap-1.5 h-8 text-xs rounded-xl">
              <Plus className="w-3.5 h-3.5" /> Publish Now
            </Button>
          </Link>
        </div> :

      <div className="pb-2">
          {visible.map((book) => <BookRow key={book.id} book={book} />)}
        </div>
      }


    </div>);

}