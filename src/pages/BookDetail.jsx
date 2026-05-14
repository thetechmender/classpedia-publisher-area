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
  FileText, CheckCircle2, Clock, XCircle, FileEdit,
  TrendingUp, ShoppingCart, Users, Star, BarChart3,
  Tag, Calendar, Hash, Layers, Cpu, Eye
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  draft:       { label: 'Draft',       icon: FileEdit,     className: 'bg-secondary text-secondary-foreground' },
  in_review:   { label: 'In Review',   icon: Clock,        className: 'bg-amber-100 text-amber-700' },
  published:   { label: 'Published',   icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  unpublished: { label: 'Unpublished', icon: XCircle,      className: 'bg-destructive/10 text-destructive' },
};

const AGE_LABELS = {
  not_specified: 'Not Specified',
  '4_6':   '4–6 years',
  '7_9':   '7–9 years',
  '10_12': '10–12 years',
  '13_17': '13–17 years',
  '18_plus': '18+ years',
};

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-3 border-b last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, sub, color = 'text-foreground' }) {
  return (
    <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function BookDetail() {
  const navigate = useNavigate();
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
          <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const royaltyRate = parseFloat(book.royalty_plan || 70) / 100;
  const royaltyPerSale = book.list_price ? book.list_price * royaltyRate : 0;
  const isPublished = book.status === 'published';

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold line-clamp-1">{book.title}</h1>
              <p className="text-xs text-muted-foreground">Book Details</p>
            </div>
          </div>
          <Badge className={`gap-1 ${status.className}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Hero Card */}
        <div className="bg-card border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-36 h-52 object-cover rounded-xl shadow-lg mx-auto md:mx-0 shrink-0" />
          ) : (
            <div className="w-36 h-52 bg-secondary rounded-xl flex items-center justify-center mx-auto md:mx-0 shrink-0">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">{book.title}</h2>
            {book.subtitle && <p className="text-base text-muted-foreground mt-1">{book.subtitle}</p>}
            <p className="text-sm mt-2">by <span className="font-medium">{book.author_name}</span></p>
            {book.series_name && (
              <p className="text-xs text-muted-foreground mt-1">
                {book.series_name}{book.series_number ? ` · Vol. ${book.series_number}` : ''}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {(book.categories || []).map(c => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
            <div className="mt-4 flex items-end gap-4">
              {book.list_price ? (
                <div>
                  <p className="text-3xl font-bold text-primary">${book.list_price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{book.currency || 'USD'} · {book.royalty_plan || 70}% royalty plan</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No price set</p>
              )}
              {isPublished && book.list_price && (
                <div className="pb-1">
                  <p className="text-sm font-semibold text-green-600">+${royaltyPerSale.toFixed(2)} per sale</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Created {format(new Date(book.created_date), 'MMMM d, yyyy')}
              {book.publication_date && ` · Published ${format(new Date(book.publication_date), 'MMMM d, yyyy')}`}
            </p>
          </div>
        </div>

        {/* Sales & Performance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Sales & Performance</h3>
          </div>
          {!isPublished ? (
            <div className="bg-card border rounded-xl p-6 text-center">
              <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                {book.status === 'draft' ? 'Publish this book to start tracking sales.' : 'Sales data will appear once this book is published.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox icon={ShoppingCart} label="Total Sales"      value="0"    sub="All time"              color="text-primary" />
                <StatBox icon={DollarSign}   label="Total Revenue"    value="$0.00" sub="Gross sales"           color="text-green-600" />
                <StatBox icon={TrendingUp}   label="Royalties Earned" value="$0.00" sub="Author earnings"       color="text-green-600" />
                <StatBox icon={Star}         label="Avg. Rating"      value="—"    sub="No reviews yet" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border rounded-xl p-5">
                  <h4 className="text-sm font-semibold mb-3">Sales by Period</h4>
                  <div className="divide-y">
                    {[
                      { period: 'This Month', value: '0 sales' },
                      { period: 'Last Month',  value: '0 sales' },
                      { period: 'Last 3 Months', value: '0 sales' },
                      { period: 'All Time',    value: '0 sales' },
                    ].map(row => (
                      <div key={row.period} className="flex justify-between py-2.5">
                        <span className="text-sm text-muted-foreground">{row.period}</span>
                        <span className="text-sm font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-card border rounded-xl p-5">
                  <h4 className="text-sm font-semibold mb-3">Revenue Split</h4>
                  <div className="divide-y">
                    <div className="flex justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Gross Revenue</span>
                      <span className="text-sm font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Platform Fee ({100 - parseInt(book.royalty_plan || 70)}%)</span>
                      <span className="text-sm font-medium text-destructive">−$0.00</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-sm font-semibold">Your Royalties ({book.royalty_plan || 70}%)</span>
                      <span className="text-sm font-bold text-green-600">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-accent/30 border border-accent rounded-xl px-5 py-4 text-sm text-accent-foreground">
                Sales data updates daily. Royalties are calculated at month-end and paid 30 days later.
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {book.description && (
          <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{book.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Book Info */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/20 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Book Information</h3>
            </div>
            <div className="px-5">
              <DetailRow label="Language"     value={book.language} />
              <DetailRow label="Series"       value={book.series_name ? `${book.series_name}${book.series_number ? ` #${book.series_number}` : ''}` : null} />
              <DetailRow label="Edition"      value={book.edition_number} />
              <DetailRow label="Pub. Date"    value={book.publication_date} />
              <DetailRow label="Age Range"    value={AGE_LABELS[book.age_range]} />
              <DetailRow label="ISBN"         value={book.isbn || 'To be assigned'} />
              <DetailRow label="AI Generated" value={book.ai_generated ? 'Yes — AI tools used' : 'No'} />
            </div>
          </div>

          {/* Pricing & Rights */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/20 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Pricing & Rights</h3>
            </div>
            <div className="px-5">
              <DetailRow label="List Price"    value={book.list_price ? `$${book.list_price.toFixed(2)} ${book.currency || 'USD'}` : '—'} />
              <DetailRow label="Royalty Plan"  value={book.royalty_plan ? `${book.royalty_plan}%` : '—'} />
              <DetailRow
                label="Est. Royalty"
                value={book.list_price && book.royalty_plan
                  ? `$${(book.list_price * (parseFloat(book.royalty_plan) / 100)).toFixed(2)} per sale`
                  : '—'
                }
              />
              <DetailRow label="Territories"  value={book.territories === 'specific' ? 'Specific Countries' : 'Worldwide'} />
              <DetailRow label="DRM"          value={book.drm ? 'Enabled' : 'Disabled'} />
              <DetailRow label="Classpedia Select" value={book.classpedia_select ? 'Enrolled' : 'Not enrolled'} />
              {book.preorder_type === 'preorder' && (
                <DetailRow label="Pre-order Date" value={book.preorder_date} />
              )}
            </div>
          </div>
        </div>

        {/* Content Files */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b bg-secondary/20 flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Content Files</h3>
          </div>
          <div className="divide-y px-5">
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-muted-foreground">Manuscript</span>
              <span className="text-sm font-medium">
                {book.manuscript_filename
                  ? <span className="text-primary">{book.manuscript_filename}</span>
                  : <span className="text-muted-foreground italic">Not uploaded</span>}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-muted-foreground">Sample Chapter</span>
              <span className="text-sm font-medium">
                {book.sample_filename
                  ? <span className="text-primary">{book.sample_filename}</span>
                  : <span className="text-muted-foreground italic">Not uploaded</span>}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-muted-foreground">Cover Image</span>
              <span className="text-sm font-medium">
                {book.cover_url
                  ? <span className="text-green-600">Uploaded ✓</span>
                  : <span className="text-muted-foreground italic">Not uploaded</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Contributors */}
        {(book.contributors || []).length > 0 && (
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/20 flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Contributors</h3>
            </div>
            <div className="divide-y px-5">
              {book.contributors.map((c, i) => (
                <div key={i} className="flex justify-between py-3">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-sm text-muted-foreground">{c.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {(book.keywords || []).length > 0 && (
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Search Keywords</h3>
            </div>
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