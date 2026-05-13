import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, BookOpen, Shield, Globe, DollarSign,
  FileText, CheckCircle2, Clock, XCircle, FileEdit
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileEdit, className: 'bg-secondary text-secondary-foreground' },
  in_review: { label: 'In Review', icon: Clock, className: 'bg-accent text-accent-foreground' },
  published: { label: 'Published', icon: CheckCircle2, className: 'bg-primary/10 text-primary' },
  unpublished: { label: 'Unpublished', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

const AGE_LABELS = {
  not_specified: 'Not Specified',
  '4_6': '4–6 years',
  '7_9': '7–9 years',
  '10_12': '10–12 years',
  '13_17': '13–17 years',
  '18_plus': '18+ years',
};

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
};

export default function BookDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = window.location.pathname.split('/book/')[1];

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  const book = books.find(b => b.id === bookId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6">
            <Skeleton className="w-40 h-56 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Book not found</h2>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Bookshelf</Button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Book Details</h1>
            <p className="text-xs text-muted-foreground">Kindle Direct Publishing</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="bg-card border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 mb-6">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-40 h-56 object-cover rounded-xl shadow-lg mx-auto md:mx-0 shrink-0"
            />
          ) : (
            <div className="w-40 h-56 bg-secondary rounded-xl flex items-center justify-center mx-auto md:mx-0 shrink-0">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Badge className={`${status.className} gap-1 mb-3`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">{book.title}</h2>
            {book.subtitle && <p className="text-base text-muted-foreground mt-1">{book.subtitle}</p>}
            <p className="text-sm mt-2">by <span className="font-medium">{book.author_name}</span></p>
            {book.list_price && (
              <p className="text-3xl font-bold text-primary mt-4">${book.list_price.toFixed(2)}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {(book.categories || []).map(c => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Created {format(new Date(book.created_date), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="bg-card border rounded-2xl p-6 md:p-8 mb-6">
            <h3 className="text-base font-semibold mb-3">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{book.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Book Info
            </h3>
            <div className="divide-y divide-border">
              <DetailRow label="Language" value={book.language} />
              <DetailRow label="Series" value={book.series_name ? `${book.series_name}${book.series_number ? ` #${book.series_number}` : ''}` : null} />
              <DetailRow label="Edition" value={book.edition_number} />
              <DetailRow label="Publication Date" value={book.publication_date} />
              <DetailRow label="Age Range" value={AGE_LABELS[book.age_range]} />
              <DetailRow label="ISBN" value={book.isbn || 'To be assigned'} />
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-6">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Pricing & Rights
            </h3>
            <div className="divide-y divide-border">
              <DetailRow label="List Price" value={book.list_price ? `$${book.list_price.toFixed(2)} ${book.currency || 'USD'}` : '—'} />
              <DetailRow label="Royalty Plan" value={book.royalty_plan ? `${book.royalty_plan}%` : '—'} />
              <DetailRow
                label="Est. Royalty"
                value={book.list_price && book.royalty_plan
                  ? `$${(book.list_price * (parseFloat(book.royalty_plan) / 100)).toFixed(2)}`
                  : '—'
                }
              />
              <div className="flex justify-between py-3">
                <span className="text-sm text-muted-foreground">Territories</span>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {book.territories === 'specific' ? 'Specific' : 'Worldwide'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-muted-foreground">DRM</span>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{book.drm ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keywords */}
        {(book.keywords || []).length > 0 && (
          <div className="bg-card border rounded-2xl p-6 mt-6">
            <h3 className="text-base font-semibold mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {book.keywords.map(kw => (
                <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}