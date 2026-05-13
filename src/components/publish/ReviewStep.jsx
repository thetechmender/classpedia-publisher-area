import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, Send, BookOpen, FileText, DollarSign,
  CheckCircle2, AlertTriangle, Shield, Globe, Pencil
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
          <p className="text-sm text-muted-foreground">Review all details before publishing</p>
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

      {/* Preview Card */}
      <div className="bg-card border rounded-xl p-6 flex gap-6">
        {data.cover_url ? (
          <img src={data.cover_url} alt="Cover" className="w-32 h-48 object-cover rounded-lg shadow-lg shrink-0" />
        ) : (
          <div className="w-32 h-48 bg-secondary rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-serif font-semibold">{data.title || 'Untitled'}</h3>
          {data.subtitle && <p className="text-base text-muted-foreground mt-1">{data.subtitle}</p>}
          <p className="text-sm mt-2">by <span className="font-medium">{data.author_name || '—'}</span></p>
          {data.list_price && (
            <p className="text-2xl font-bold text-primary mt-3">${data.list_price?.toFixed(2)}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {(data.categories || []).map(c => (
              <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Book Details Section */}
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
          {(data.contributors || []).length > 0 && (
            <div className="py-2">
              <p className="text-sm text-muted-foreground mb-2">Contributors</p>
              {data.contributors.map((c, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground"> — {c.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
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

      {/* Pricing Section */}
      <div className="bg-card border rounded-xl p-6">
        <SectionHeader icon={DollarSign} title="Pricing" step={3} onEdit={onEdit} />
        <div className="divide-y divide-border">
          <DetailRow label="List Price" value={data.list_price ? `$${data.list_price.toFixed(2)} ${data.currency || 'USD'}` : '—'} />
          <DetailRow label="Royalty Plan" value={data.royalty_plan ? `${data.royalty_plan}%` : '—'} />
          <DetailRow
            label="Estimated Royalty"
            value={data.list_price && data.royalty_plan
              ? `$${(data.list_price * (parseFloat(data.royalty_plan) / 100)).toFixed(2)}`
              : '—'
            }
          />
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">Territories</span>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">
                {data.territories === 'specific' ? 'Specific Territories' : 'Worldwide'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Notice */}
      <div className="bg-accent/40 border border-primary/10 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium">Ready to publish?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Once submitted, your eBook will go through a review process. You'll be notified when it's live.
              You can make changes to your book at any time.
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
          <Button
            variant="outline"
            onClick={() => onPublish('draft')}
            disabled={publishing}
          >
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