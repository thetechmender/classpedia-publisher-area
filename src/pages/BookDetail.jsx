import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, BookOpen, DollarSign, FileText, CheckCircle2, Clock,
  FileEdit, TrendingUp, ShoppingCart, Users, Star, BarChart3,
  Tag, Calendar, Eye, Globe, ChevronRight, Zap, Pencil,
  Download, ExternalLink, Copy, Share2, Linkedin } from
'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import EnrollmentScheduler from '@/components/books/EnrollmentScheduler';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileEdit, bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  in_review: { label: 'In Review', icon: Clock, bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  published: { label: 'Published', icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' }
};

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-3 border-b last:border-0 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>);

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
    </div>);

}

export default function BookDetail() {
  const navigate = useNavigate();
  const bookId = window.location.pathname.split('/book/')[1];

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const book = books.find((b) => b.id === bookId);

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
      </div>);

  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Book not found</h2>
          <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>);

  }

  const status = STATUS_CONFIG[book.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const royaltyRate = parseFloat(book.royalty_plan || 70) / 100;
  const royaltyPerSale = book.list_price ? book.list_price * royaltyRate : 0;
  const isPublished = book.status === 'published';

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base font-semibold line-clamp-1">{book.title}</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <Link to="/" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[11px] text-muted-foreground">Book Details</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs"
            onClick={() => navigate(`/publish?bookId=${book.id}`)}>
              <Pencil className="w-3.5 h-3.5" /> Edit in Publishing Form
            </Button>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-6 py-6 space-y-5 relative">

        {/* Hero Card */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-6 flex flex-col md:flex-row gap-5 md:gap-6">
            {book.cover_url ?
            <img src={book.cover_url} alt={book.title} className="w-32 h-44 object-cover rounded-xl shadow-md mx-auto md:mx-0 shrink-0" /> :
            <div className="w-32 h-44 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto md:mx-0 shrink-0 border border-border">
                <BookOpen className="w-10 h-10 text-muted-foreground/40" />
              </div>
            }
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(book.categories || []).map((c) =>
                <Badge key={c} variant="secondary" className="text-xs font-medium">{c}</Badge>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold leading-tight">{book.title}</h2>
              {book.subtitle && <p className="text-sm text-muted-foreground mt-1">{book.subtitle}</p>}
              <p className="text-sm mt-1.5 text-muted-foreground">by <span className="font-semibold text-foreground">{book.author_name}</span></p>
              {book.series_name &&
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {book.series_name}{book.series_number ? ` · Vol. ${book.series_number}` : ''}
                </p>
              }
              <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center gap-4">
                {book.list_price ?
                <div>
                    <p className="text-2xl font-bold text-primary">${book.list_price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{book.currency || 'USD'} · {book.royalty_plan || 70}% royalty plan</p>
                  </div> :
                <p className="text-sm text-muted-foreground italic">No price set</p>
                }
                {isPublished && book.list_price &&
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <p className="text-sm font-bold text-emerald-700">+${royaltyPerSale.toFixed(2)} per sale</p>
                    <p className="text-[10px] text-emerald-600">Your royalty earnings</p>
                  </div>
                }
                <div className="md:ml-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created {format(new Date(book.created_date), 'MMM d, yyyy')}</span>
                  {book.publication_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Published {format(new Date(book.publication_date), 'MMM d, yyyy')}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Status bar */}
          {book.status === 'in_review' &&
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
              <p className="text-sm text-amber-800 font-medium">Under review — Typically takes 24–72 hours. You cannot edit while under review.</p>
            </div>
          }
          {book.status === 'draft' &&
          <div className="px-6 py-3 bg-secondary/50 border-t flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">This book is a draft. Complete all required fields to submit for review.</p>
              </div>
              <Link to="/publish">
                <Button size="sm" className="gap-1.5 shrink-0 text-xs">Continue Editing <ChevronRight className="w-3.5 h-3.5" /></Button>
              </Link>
            </div>
          }
        </div>

        {/* Sales & Performance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Sales & Performance</h3>
          </div>
          {!isPublished ?
          <div className="bg-card border rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                {book.status === 'draft' ? 'Complete and publish this book to start tracking sales.' : 'Sales data will appear once this book is live.'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {book.status === 'in_review' ? 'Expected to go live within 24–72 hours.' : ''}
              </p>
            </div> :

          <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBox icon={ShoppingCart} label="Total Sales" value="0" sub="All time" color="text-primary" bg="bg-primary/10" />
                <StatBox icon={DollarSign} label="Gross Revenue" value="$0.00" sub="All time" color="text-emerald-600" bg="bg-emerald-50" />
                <StatBox icon={TrendingUp} label="Your Royalties" value="$0.00" sub="After platform fee" color="text-emerald-600" bg="bg-emerald-50" />
                <StatBox icon={Star} label="Avg. Rating" value="—" sub="No reviews yet" color="text-amber-500" bg="bg-amber-50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b bg-secondary/20">
                    <h4 className="text-sm font-semibold">Sales by Period</h4>
                  </div>
                  <div className="divide-y px-5">
                    {[['This Month', '0'], ['Last Month', '0'], ['Last 3 Months', '0'], ['All Time', '0']].map(([period, val]) =>
                  <div key={period} className="flex justify-between py-3">
                        <span className="text-sm text-muted-foreground">{period}</span>
                        <span className="text-sm font-semibold">{val} sales</span>
                      </div>
                  )}
                  </div>
                </div>
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b bg-secondary/20">
                    <h4 className="text-sm font-semibold">Revenue Split</h4>
                  </div>
                  <div className="divide-y px-5">
                    <div className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">Gross Revenue</span>
                      <span className="text-sm font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-sm text-muted-foreground">Platform Fee ({100 - parseInt(book.royalty_plan || 70)}%)</span>
                      <span className="text-sm font-semibold text-destructive">−$0.00</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-sm font-semibold">Your Royalties ({book.royalty_plan || 70}%)</span>
                      <span className="text-sm font-bold text-emerald-600">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        {/* Description */}
        {book.description &&
        <div className="bg-card border rounded-2xl p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" /> Description
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-6">{book.description}</p>
          </div>
        }

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/20 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Book Information</h3>
            </div>
            <div className="px-5">
              <DetailRow label="Language" value={book.language} />
              <DetailRow label="Edition" value={book.edition_number} />
              <DetailRow label="Series" value={book.series_name ? `${book.series_name}${book.series_number ? ` #${book.series_number}` : ''}` : null} />
              <DetailRow label="Reading Age" value={book.reading_age_min ? `${book.reading_age_min}${book.reading_age_max ? ` – ${book.reading_age_max}` : ''}` : null} />
              <DetailRow label="ISBN" value={book.isbn || 'To be assigned'} />
              <DetailRow label="AI Generated" value={book.ai_generated ? 'Yes — AI tools used' : 'No'} />
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/20 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Pricing & Rights</h3>
            </div>
            <div className="px-5">
              <DetailRow label="List Price" value={book.list_price ? `$${book.list_price.toFixed(2)} ${book.currency || 'USD'}` : '—'} />
              <DetailRow label="Royalty Plan" value={book.royalty_plan ? `${book.royalty_plan}%` : '—'} />
              <DetailRow label="Per Sale" value={book.list_price && book.royalty_plan ? `$${(book.list_price * (parseFloat(book.royalty_plan) / 100)).toFixed(2)}` : '—'} />
              <DetailRow label="Territories" value={book.territories === 'specific' ? 'Specific Countries' : 'Worldwide'} />
              <DetailRow label="DRM" value={book.drm ? 'Enabled' : 'Disabled'} />
              <DetailRow label="Select Program" value={book.classpedia_select ? 'Enrolled' : 'Not enrolled'} />
              {book.preorder_type === 'preorder' &&
              <DetailRow label="Pre-order Date" value={book.preorder_date} />
              }
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
            {[
            { label: 'Manuscript', url: book.manuscript_url },
            { label: 'Sample Chapter', url: book.sample_url },
            { label: 'Cover Image', url: book.cover_url }].
            map(({ label, url }) =>
            <div key={label} className="flex justify-between items-center py-3.5">
                <span className="text-sm text-muted-foreground">{label}</span>
                <button
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 border border-primary px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Keywords */}
        {(book.keywords || []).length > 0 &&
        <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Search Keywords</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {book.keywords.map((kw) =>
            <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
            )}
            </div>
          </div>
        }

        {/* Contributors */}
        {(book.contributors || []).length > 0 &&
        <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/20 flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Contributors</h3>
            </div>
            <div className="divide-y px-5">
              {book.contributors.map((c, i) =>
            <div key={i} className="flex justify-between py-3">
                  <span className="text-sm font-medium">{c.name}</span>
                  <Badge variant="outline" className="text-xs">{c.role}</Badge>
                </div>
            )}
            </div>
          </div>
        }

        {/* Live Book — only for published books */}
        {isPublished && (() => {
          const publishedUrl = `https://classpedia.ai/book/${book.id}`;
          const handleCopy = () => {navigator.clipboard.writeText(publishedUrl);toast.success('Link copied!');};
          return (
            <div className="rounded-2xl border border-emerald-200 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Globe className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <p className="text-sm font-bold text-white">Live on Classpedia</p>
                    </div>
                    <p className="text-xs text-emerald-100 mt-0.5">Your book is published and available for purchase</p>
                  </div>
                </div>
                <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-white text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5" /> View Live Book
                  </button>
                </a>
              </div>

              {/* URL Bar */}
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0 bg-white border border-emerald-200 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs text-slate-600 font-mono truncate flex-1">{publishedUrl}</span>
                </div>
                <button onClick={handleCopy}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-emerald-200 bg-white text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors shrink-0">
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </button>
              </div>


            </div>);

        })()}

        {/* Classpedia Select Enrollment — only for published books */}
        {isPublished &&
        <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Classpedia Select Program</h3>
            </div>
            <EnrollmentScheduler book={book} />
          </div>
        }

      </div>
    </div>);

}