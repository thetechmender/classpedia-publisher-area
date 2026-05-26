import React, { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, BookOpen, DollarSign, FileText, CheckCircle2, Clock,
  XCircle, FileEdit, TrendingUp, ShoppingCart, Users, Star, BarChart3,
  Tag, Calendar, Eye, Globe, Shield, Cpu, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { PublishBookService, getApiError } from '@/services/publishBook.service';

// Normalize the API book record (handles nested response shape from
// /publisher-book/details/{bookId}) so the existing UI keeps working.
function normalizeBook(b) {
  if (!b) return b;
  const pub = b.publication || {};
  const rights = b.rights || {};
  const content = b.contentFiles || b.content_files || {};

  // Flatten array-of-{id,name} into array-of-strings for plain rendering
  const toNames = (arr) =>
    Array.isArray(arr)
      ? arr.map((x) => (typeof x === 'string' ? x : x?.name)).filter(Boolean)
      : [];

  const contributors = Array.isArray(b.contributors)
    ? b.contributors.map((c) => ({
        id: c.id,
        name: c.name ?? [c.firstName, c.lastName].filter(Boolean).join(' '),
        role: c.role ?? c.contributorRoleName ?? c.contributor_role_name ?? '',
      }))
    : [];

  const authorName =
    b.author_name ??
    b.authorName ??
    b.author ??
    ([b.authorFirstName, b.authorLastName].filter(Boolean).join(' ').trim() || undefined);

  let territories;
  if (rights.isAllTerritory) territories = 'All territories';
  else if (Array.isArray(rights.selectedCountries) && rights.selectedCountries.length)
    territories = toNames(rights.selectedCountries).join(', ');
  else if (typeof b.territories === 'string') territories = b.territories;

  return {
    id: b.id ?? b.bookId ?? b.book_id,
    title: b.title,
    subtitle: b.subtitle ?? b.subTitle,
    description: b.description,
    status: b.status ?? b.bookStatusCode ?? b.book_status_code,
    statusLabel: b.bookStatusName ?? b.book_status_name,
    isbn: b.isbn,
    language: b.language ?? b.languageName,
    territories,
    drm: b.drm ?? rights.drmProtection,
    isBookEnroll: b.isBookEnroll ?? b.is_book_enroll ?? rights.classpediaSelectEnrolled,
    ai_generated: b.ai_generated ?? b.aiGenerated ?? rights.aiGenerated,
    edition_number: b.edition_number ?? b.editionNumber ?? b.edition,
    seriesName: b.seriesName ?? b.series_name,
    seriesNumber: b.seriesNumber ?? b.series_number,
    author_name: authorName,
    contributors,
    keywords: toNames(b.keywords),
    categories: toNames(b.categories),
    cover_url: b.cover_url ?? b.coverUrl ?? b.frontCover,
    list_price: Number(b.list_price ?? b.listPrice ?? b.price ?? 0),
    currency: b.currency,
    royalty_plan: b.royalty_plan ?? b.royaltyPlan ?? b.royaltyPercentage,
    created_date: b.created_date ?? b.createdDate ?? b.createdAt ?? pub.createdAt,
    publication_date:
      b.publication_date ?? b.publicationDate ?? b.publishedAt ?? pub.publishedAt,
    manuscript_filename:
      b.manuscript_filename ?? b.manuscriptFilename ?? content.manuscriptFilename,
    sample_filename: b.sample_filename ?? b.sampleFilename ?? content.sampleFilename,
  };
}

const STATUS_CONFIG = {
  draft:       { label: 'Draft',       icon: FileEdit,     bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400' },
  in_review:   { label: 'In Review',   icon: Clock,        bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  published:   { label: 'Published',   icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  unpublished: { label: 'Unpublished', icon: XCircle,      bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
  rejected:    { label: 'Rejected',    icon: XCircle,      bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
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

function StatBox({ icon: Icon, label, value, sub, color = 'text-foreground', bg = 'bg-secondary' }) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function BookDetail() {
  const navigate = useNavigate();
  const { id: bookId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['publisherBookDetails', bookId],
    queryFn: () => PublishBookService.details(bookId),
    enabled: !!bookId,
  });

  useEffect(() => {
    if (error) toast.error(getApiError(error, 'Failed to load book'));
  }, [error]);

  // Tolerate { data: {...} } or direct object
  const rawBook = data?.data ?? data?.book ?? data;
  const book = normalizeBook(rawBook);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6">
            <Skeleton className="w-40 h-56 rounded-xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-3/4" />
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
          <Button variant="outline" onClick={() => navigate('/books')}>Back to Books</Button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusCfg.icon;
  const royaltyPct = parseFloat(String(book.royalty_plan || 70));
  const estRoyalty = book.list_price ? (book.list_price * royaltyPct / 100).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/books')} className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base font-semibold line-clamp-1">{book.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Link to="/dashboard" className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5">
                  Dashboard <ChevronRight className="w-3 h-3" />
                </Link>
                <span className="text-[11px] text-muted-foreground">Book Details</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
              <StatusIcon className="w-3 h-3" />
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Hero section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover */}
          <div className="w-40 h-56 rounded-xl bg-secondary shrink-0 overflow-hidden shadow-lg">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-1">{book.title}</h2>
            {book.subtitle && <p className="text-muted-foreground mb-3">{book.subtitle}</p>}
            
            <div className="flex flex-wrap gap-2 mb-4">
              {book.categories?.map((cat, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{cat}</Badge>
              ))}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{book.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Price</p>
                <p className="text-lg font-bold">${book.list_price || '0.00'}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Royalty</p>
                <p className="text-lg font-bold text-emerald-600">${estRoyalty}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Language</p>
                <p className="text-lg font-bold">{book.language || 'English'}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ISBN</p>
                <p className="text-sm font-bold truncate">{book.isbn || 'Not assigned'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Publication Details */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Publication Details
            </h3>
            <div className="space-y-0">
              <DetailRow label="Created" value={book.created_date ? format(new Date(book.created_date), 'MMM d, yyyy') : null} />
              <DetailRow label="Published" value={book.publication_date ? format(new Date(book.publication_date), 'MMM d, yyyy') : 'Not published'} />
              <DetailRow label="Edition" value={book.edition_number} />
              <DetailRow label="Series" value={book.seriesName ? `${book.seriesName} #${book.seriesNumber}` : null} />
            </div>
          </div>

          {/* Rights & Distribution */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Rights & Distribution
            </h3>
            <div className="space-y-0">
              <DetailRow label="Territories" value={book.territories} />
              <DetailRow label="DRM Protection" value={book.drm ? 'Enabled' : 'Disabled'} />
              <DetailRow label="Classpedia Select" value={book.isBookEnroll ? 'Enrolled' : 'Not enrolled'} />
              <DetailRow label="AI Generated" value={book.ai_generated ? 'Yes' : 'No'} />
            </div>
          </div>

          {/* Content Files */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Content Files
            </h3>
            <div className="space-y-0">
              <DetailRow label="Manuscript" value={book.manuscript_filename || 'Not uploaded'} />
              <DetailRow label="Sample" value={book.sample_filename || 'Not uploaded'} />
            </div>
          </div>

          {/* Contributors */}
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Contributors
            </h3>
            {book.contributors && book.contributors.length > 0 ? (
              <div className="space-y-2">
                {book.contributors.map((c, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No contributors added</p>
            )}
          </div>
        </div>

        {/* Keywords */}
        {book.keywords && book.keywords.length > 0 && (
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {book.keywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sales & Performance (only for published books) */}
        {book.status === 'published' && (
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Sales & Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox icon={ShoppingCart} label="Total Sales" value="0" sub="All time" />
              <StatBox icon={DollarSign} label="Revenue" value="$0.00" sub="All time" color="text-emerald-600" bg="bg-emerald-100" />
              <StatBox icon={Eye} label="Page Reads" value="0" sub="KU/KOLL" />
              <StatBox icon={Star} label="Avg Rating" value="N/A" sub="No reviews yet" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
