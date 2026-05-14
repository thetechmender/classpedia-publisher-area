import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, Send, BookOpen, FileText, DollarSign,
  CheckCircle2, AlertTriangle, Shield, Globe, Pencil,
  Star, ShoppingCart, Heart, Share2, ChevronDown, ChevronUp,
  Package, RotateCcw, Lock, Award
} from 'lucide-react';

const SectionHeader = ({ icon: Icon, title, step, onEdit }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
    <Button variant="ghost" size="sm" onClick={() => onEdit(step)} className="text-primary gap-1.5 h-8">
      <Pencil className="w-3.5 h-3.5" /> Edit
    </Button>
  </div>
);

const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
};

const AGE_LABELS = {
  not_specified: 'Not Specified',
  '4_6': '4–6 years',
  '7_9': '7–9 years',
  '10_12': '10–12 years',
  '13_17': '13–17 years',
  '18_plus': '18+ years',
};

// ── Amazon-style storefront preview ─────────────────────────────────────────
function StorefrontPreview({ data }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const price = parseFloat(data.list_price) || 0;
  const authorEarning = (price * 0.7).toFixed(2);

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white text-slate-800 font-sans text-sm shadow-sm">
      {/* Store top bar */}
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="text-white text-xs font-bold tracking-wide">Classpedia</span>
        </div>
        <div className="flex-1 bg-white/10 rounded h-6 flex items-center px-2">
          <span className="text-white/40 text-xs truncate">Search books, authors, topics…</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs hidden sm:block">Sign in</span>
          <ShoppingCart className="w-4 h-4 text-white/60" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-400">
        Books &rsaquo; {(data.categories || [])[0] || 'Education'} &rsaquo;{' '}
        <span className="text-indigo-600">{data.title || 'Your Book'}</span>
      </div>

      {/* Main product layout */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-6">
        {/* Cover */}
        <div className="flex flex-col items-center gap-2 sm:block">
          <div className="relative">
            {data.cover_url ? (
              <img
                src={data.cover_url}
                alt="Cover"
                className="w-36 h-52 object-cover rounded shadow-lg border border-slate-200"
              />
            ) : (
              <div className="w-36 h-52 bg-gradient-to-br from-indigo-100 to-slate-100 rounded shadow-lg border border-slate-200 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-indigo-300" />
              </div>
            )}
            <div className="absolute top-2 left-2 bg-amber-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
              NEW
            </div>
          </div>
          <button className="text-xs text-indigo-600 hover:underline mt-1 hidden sm:block">
            Look inside ›
          </button>
        </div>

        {/* Main info */}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            {data.title || 'Book Title'}
          </h1>
          {data.subtitle && (
            <p className="text-base text-slate-500 mt-0.5">{data.subtitle}</p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {data.author_name && (
              <span className="text-sm">
                by <span className="text-indigo-600 hover:underline cursor-pointer font-medium">{data.author_name}</span>
              </span>
            )}
            {(data.contributors || []).slice(0, 1).map((c, i) => (
              <span key={i} className="text-sm text-slate-500">({c.role}: {c.name})</span>
            ))}
          </div>

          {/* Star rating (sample) */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
              ))}
            </div>
            <span className="text-xs text-indigo-600 hover:underline cursor-pointer">4.2 · 124 ratings</span>
          </div>

          <Separator className="my-3" />

          {/* Categories */}
          {(data.categories || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {data.categories.map(c => (
                <span key={c} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{c}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="text-sm text-slate-700 leading-relaxed">
            <p className={descExpanded ? '' : 'line-clamp-4'}>
              {data.description || 'Your book description will appear here, giving readers a compelling overview of what they can expect from your eBook.'}
            </p>
            {data.description && data.description.length > 220 && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="text-indigo-600 hover:underline text-xs mt-1 flex items-center gap-0.5"
              >
                {descExpanded ? <><ChevronUp className="w-3 h-3" /> Read less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
              </button>
            )}
          </div>

          {/* Book details */}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500">
            <div><span className="font-medium text-slate-700">Language:</span> {data.language || '—'}</div>
            <div><span className="font-medium text-slate-700">Format:</span> eBook</div>
            {data.isbn && <div><span className="font-medium text-slate-700">ISBN:</span> {data.isbn}</div>}
            {data.publication_date && <div><span className="font-medium text-slate-700">Published:</span> {data.publication_date}</div>}
            {data.edition_number && <div><span className="font-medium text-slate-700">Edition:</span> {data.edition_number}</div>}
            {data.series_name && <div><span className="font-medium text-slate-700">Series:</span> {data.series_name}</div>}
          </div>

          {/* Keywords */}
          {(data.keywords || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {data.keywords.map(kw => (
                <span key={kw} className="border border-slate-200 text-slate-500 text-[11px] px-2 py-0.5 rounded hover:bg-slate-50 cursor-pointer">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div className="sm:w-52 rounded-lg border border-slate-200 p-4 flex flex-col gap-3 self-start">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">eBook</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {price > 0 ? `$${price.toFixed(2)}` : <span className="text-slate-300 text-base">Set price</span>}
            </p>
            {price > 0 && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                Includes free worldwide delivery
              </p>
            )}
          </div>

          <button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <ShoppingCart className="w-4 h-4" /> Buy Now
          </button>
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
            Read Sample
          </button>

          <div className="text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Delivered instantly</div>
            <div className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> 14-day return policy</div>
            <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secure checkout</div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              <Heart className="w-3.5 h-3.5" /> Wishlist
            </button>
            <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {data.classpedia_select && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500 shrink-0" />
              <p className="text-[11px] text-indigo-700 font-medium">Included in Classpedia Select</p>
            </div>
          )}
        </div>
      </div>

      {/* About the author strip */}
      {data.author_name && (
        <div className="border-t border-slate-100 px-4 sm:px-6 py-4 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">About the Author</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {data.author_name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{data.author_name}</p>
              <p className="text-xs text-indigo-600 hover:underline cursor-pointer">View all books by this author</p>
            </div>
          </div>
        </div>
      )}

      {/* Sample reviews strip */}
      <div className="border-t border-slate-100 px-4 sm:px-6 py-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Customer Reviews</p>
        <div className="space-y-3">
          {[
            { name: 'Sarah M.', stars: 5, text: 'An outstanding read — clear, engaging, and packed with insights.' },
            { name: 'James T.', stars: 4, text: 'Very well written. I learned a lot and finished it in one sitting.' },
          ].map((r, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {r.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-700">{r.name}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= r.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReviewStep({ data, onBack, onPublish, onEdit, publishing, validationErrors }) {
  const hasErrors = validationErrors && validationErrors.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <Send className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">Review & Publish</h2>
          <p className="text-sm text-muted-foreground">Review your listing preview and confirm details before publishing</p>
        </div>
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Please fix the following issues:</span>
          </div>
          <ul className="space-y-1 ml-6">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-sm text-destructive list-disc">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Storefront Preview */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm font-medium text-foreground">Customer-facing listing preview</p>
          <span className="text-xs text-muted-foreground">— this is how your book will appear on Classpedia</span>
        </div>
        <StorefrontPreview data={data} />
      </div>

      {/* Metadata summary */}
      <div className="bg-card border rounded-xl p-6">
        <SectionHeader icon={BookOpen} title="Book Details" step={1} onEdit={onEdit} />
        <div className="divide-y divide-border">
          <DetailRow label="Title" value={data.title} />
          <DetailRow label="Subtitle" value={data.subtitle} />
          <DetailRow label="Author" value={data.author_name} />
          <DetailRow label="Language" value={data.language} />
          <DetailRow label="Series" value={data.series_name ? `${data.series_name}${data.series_number ? ` #${data.series_number}` : ''}` : null} />
          <DetailRow label="Edition" value={data.edition_number} />
          <DetailRow label="Publication Date" value={data.publication_date} />
          <DetailRow label="Age Range" value={AGE_LABELS[data.age_range]} />
          {(data.keywords || []).length > 0 && (
            <div className="py-2">
              <p className="text-sm text-muted-foreground mb-2">Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {data.keywords.map(kw => (
                  <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <SectionHeader icon={FileText} title="Content" step={2} onEdit={onEdit} />
        <div className="divide-y divide-border">
          <DetailRow label="Manuscript" value={data.manuscript_filename || (data.manuscript_url ? 'Uploaded' : 'Not uploaded')} />
          <DetailRow label="Cover" value={data.cover_url ? 'Uploaded' : 'Not uploaded'} />
          <DetailRow label="ISBN" value={data.isbn || 'Will be assigned'} />
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">DRM</span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">{data.drm ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <SectionHeader icon={DollarSign} title="Pricing" step={3} onEdit={onEdit} />
        <div className="divide-y divide-border">
          <DetailRow label="List Price" value={data.list_price ? `$${data.list_price.toFixed(2)} USD` : '—'} />
          <DetailRow label="Your Royalty (70%)" value={data.list_price ? `$${(data.list_price * 0.7).toFixed(2)}` : '—'} />
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">Territories</span>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {data.territories === 'specific'
                  ? `${(data.selected_countries || []).length} countries`
                  : 'Worldwide'}
              </span>
            </div>
          </div>
          <DetailRow label="Classpedia Select" value={data.classpedia_select ? 'Enrolled' : 'Not enrolled'} />
        </div>
      </div>

      {/* Publish Notice */}
      <div className="bg-accent/40 border border-primary/10 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Ready to publish?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Once submitted, your eBook will go through a review process (up to 72 hours). You'll be notified when it's live.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onPublish('draft')} disabled={publishing}>
            Save as Draft
          </Button>
          <Button
            onClick={() => onPublish('in_review')}
            disabled={publishing || hasErrors}
            className="gap-2 px-8"
          >
            {publishing ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Publish eBook
          </Button>
        </div>
      </div>
    </div>
  );
}