import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, Send, BookOpen, FileText, DollarSign,
  CheckCircle2, AlertTriangle, Shield, Globe, Pencil, Award,
  ShoppingCart, Share2, Gift, Star, Heart
} from 'lucide-react';

const SectionBlock = ({ icon: Icon, title, step, onEdit, children }) => (
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onEdit(step)} className="text-primary gap-1.5 h-7 text-xs">
        <Pencil className="w-3 h-3" /> Edit
      </Button>
    </div>
    <div className="divide-y divide-border">{children}</div>
  </div>
);

const DetailRow = ({ label, value, children }) => {
  if (!value && !children) return null;
  return (
    <div className="flex justify-between items-center px-5 py-2.5 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      {children || <span className="text-sm font-medium text-right">{value}</span>}
    </div>
  );
};

function BookPreviewCard({ data }) {
  const price = parseFloat(data.list_price) || 0;
  const originalPrice = price > 0 ? (price * 1.05).toFixed(2) : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <p className="text-sm font-medium text-foreground">Listing preview</p>
        <span className="text-xs text-muted-foreground">— how your book will appear on Classpedia</span>
      </div>

      {/* Mock Classpedia product page */}
      <div className="bg-[#f0f4fb] p-5">
        <div className="bg-white rounded-xl shadow-sm border border-border/60 p-6">
          <div className="flex gap-6">
            {/* Cover */}
            <div className="shrink-0 relative">
              {data.cover_url ? (
                <img src={data.cover_url} alt="Cover" className="w-32 h-48 object-cover rounded-lg shadow-md border border-border" />
              ) : (
                <div className="w-32 h-48 rounded-lg bg-gradient-to-br from-primary/10 to-accent/20 border border-border flex items-center justify-center shadow-md">
                  <BookOpen className="w-8 h-8 text-primary/40" />
                </div>
              )}
              <button className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Middle — book info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground leading-snug">{data.title || 'Untitled Book'}</h2>
              {data.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{data.subtitle}</p>}

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 max-w-xs">
                <div>
                  <p className="text-xs text-muted-foreground">Written by</p>
                  <p className="text-sm font-semibold text-foreground">{data.author_name || '—'}</p>
                </div>
                {data.series_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Series</p>
                    <p className="text-sm font-semibold text-primary">{data.series_name}</p>
                  </div>
                )}
                {data.edition_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Edition</p>
                    <p className="text-sm font-semibold text-foreground">{data.edition_number}</p>
                  </div>
                )}
                {data.series_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Book no. in series</p>
                    <p className="text-sm font-semibold text-foreground">{data.series_number}</p>
                  </div>
                )}
              </div>

              {/* Stars placeholder */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />)}
                </div>
                <span className="text-xs text-muted-foreground">No ratings yet</span>
              </div>

              {/* Description */}
              {data.description ? (
                <p className="text-xs text-muted-foreground leading-relaxed mt-3 line-clamp-2">{data.description}</p>
              ) : (
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 bg-muted/50 rounded-full w-full" />
                  <div className="h-2 bg-muted/50 rounded-full w-5/6" />
                  <p className="text-xs text-primary font-medium cursor-pointer">Read More</p>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {(data.categories || []).map(c => (
                  <span key={c} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary text-foreground border border-border">{c}</span>
                ))}
                {(data.categories || []).length === 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground border border-border">No categories selected</span>
                )}
              </div>
            </div>

            {/* Right — pricing card */}
            <div className="shrink-0 w-48">
              <div className="rounded-xl border border-border bg-white shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {price > 0 ? (
                    <>
                      <span className="text-xl font-bold text-foreground">${price.toFixed(2)}</span>
                      {originalPrice && <span className="text-xs text-muted-foreground line-through">${originalPrice}</span>}
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Price not set</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground -mt-1">Inclusive of all taxes</p>

                <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-sm font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <BookOpen className="w-3.5 h-3.5" /> Buy Ebook
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <button className="w-full border border-border text-sm font-medium py-2 rounded-lg text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex flex-col items-center gap-1 bg-teal-50 rounded-lg py-2 px-1">
                    <Share2 className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-[10px] font-medium text-teal-700 text-center leading-tight">SHARE<br/>this book</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-green-50 rounded-lg py-2 px-1">
                    <Gift className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[10px] font-medium text-green-700 text-center leading-tight">GIFT<br/>this book</span>
                  </div>
                </div>
              </div>

              {data.language && (
                <p className="text-xs text-muted-foreground text-center mt-2">{data.language}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewStep({ data, onBack, onPublish, onEdit, publishing, validationErrors }) {
  const hasErrors = validationErrors && validationErrors.length > 0;

  return (
    <div className="space-y-5">
      {/* Step header */}
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Review & Submit</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Confirm your listing details before submitting for review</p>
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Fix the following before submitting:</span>
          </div>
          <ul className="space-y-1 ml-6">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-sm text-destructive list-disc">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Listing preview */}
      <BookPreviewCard data={data} />

      {/* Book Details summary */}
      <SectionBlock icon={BookOpen} title="Book Details" step={1} onEdit={onEdit}>
        <DetailRow label="Title" value={data.title} />
        <DetailRow label="Subtitle" value={data.subtitle} />
        <DetailRow label="Author" value={data.author_name} />
        <DetailRow label="Language" value={data.language} />
        <DetailRow label="Series" value={data.series_name ? `${data.series_name}${data.series_number ? ` #${data.series_number}` : ''}` : null} />
        <DetailRow label="Edition" value={data.edition_number} />
        {(data.keywords || []).length > 0 && (
          <div className="px-5 py-2.5 flex justify-between items-start gap-4">
            <span className="text-sm text-muted-foreground shrink-0">Keywords</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {data.keywords.map(kw => (
                <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
              ))}
            </div>
          </div>
        )}
        {(data.categories || []).length > 0 && (
          <div className="px-5 py-2.5 flex justify-between items-start gap-4">
            <span className="text-sm text-muted-foreground shrink-0">Categories</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {data.categories.map(c => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
          </div>
        )}
      </SectionBlock>

      {/* Content summary */}
      <SectionBlock icon={FileText} title="Content" step={2} onEdit={onEdit}>
        <DetailRow label="Manuscript" value={data.manuscript_filename || (data.manuscript_url ? 'Uploaded' : 'Not uploaded')} />
        <DetailRow label="Front Cover" value={data.cover_url ? 'Uploaded' : 'Not uploaded'} />
        <DetailRow label="ISBN" value={data.isbn || 'Will be assigned'} />
        <DetailRow label="DRM">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">{data.drm ? 'Enabled' : 'Disabled'}</span>
          </div>
        </DetailRow>
        <DetailRow label="AI-Generated Content" value={data.ai_generated != null ? (data.ai_generated ? 'Yes' : 'No') : 'Not specified'} />
      </SectionBlock>

      {/* Pricing summary */}
      <SectionBlock icon={DollarSign} title="Pricing" step={3} onEdit={onEdit}>
        <DetailRow label="List Price" value={data.list_price ? `$${Number(data.list_price).toFixed(2)} USD` : '—'} />
        <DetailRow label="Your Royalty (70%)" value={data.list_price ? `$${(data.list_price * 0.7).toFixed(2)}` : '—'} />
        <DetailRow label="Territories">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {data.territories === 'specific' ? `${(data.selected_countries || []).length} countries` : 'Worldwide'}
            </span>
          </div>
        </DetailRow>
        <DetailRow label="Classpedia Select" value={data.classpedia_select ? 'Enrolled' : 'Not enrolled'} />
      </SectionBlock>

      {/* Ready notice */}
      <div className="bg-accent/40 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Ready to submit?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your eBook will go through editorial review (up to 72 hours). You'll be notified by email when it's live.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2 h-10 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" onClick={() => onPublish('draft')} disabled={publishing} className="gap-2 h-10 text-sm font-medium text-foreground">
            💾 Save as Draft
          </Button>
        </div>
        <Button
          onClick={() => onPublish('in_review')}
          disabled={publishing || hasErrors}
          className="gap-2 h-10 px-8 text-sm font-medium"
        >
          {publishing ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit for Review
        </Button>
      </div>
    </div>
  );
}