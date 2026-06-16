import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ChevronLeft, ChevronRight, Upload, FileText, ImageIcon,
  X, Info, Cpu, Eye, BookOpen, CheckCircle2, AlertCircle, Layers, BookOpenCheck, Shield, ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ValidationSummary from '@/components/shared/ValidationSummary';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import BookPreviewer from './BookPreviewer';

const Section = ({ icon: Icon, title, subtitle, subtitleBadge, children }) => (
  <div className="rounded-xl border border-border bg-card">
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-none flex items-center gap-1">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {subtitleBadge && <div className="shrink-0">{subtitleBadge}</div>}
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

const FieldLabel = ({ label, required, hint }) => (
  <div className="mb-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
  </div>
);

const SUPPORTED_FORMATS = ['EPUB', 'DOC', 'DOCX', 'PDF'];

const COVER_SPECS = [
  { key: 'front',  label: 'Front Cover', dim: '1600 × 2560 px', note: 'Portrait · Min 1,000 px on shortest side', required: true  },
  { key: 'spine',  label: 'Spine',       dim: 'Width: auto',     note: 'Adjusts to book thickness',               required: true  },
  { key: 'back',   label: 'Back Cover',  dim: '1600 × 2560 px', note: 'Same dimensions as front',                required: true  },
];

function SampleChapterSection({ data, onChange }) {
  const totalPages = data.total_pages || '';
  const sampleStart = data.sample_page_start || 1;
  const sampleEnd = data.sample_page_end || '';
  const hasSample = !!data.sample_page_end;
  const maxAllowed = totalPages ? Math.floor(totalPages * 0.2) : null;
  const selectedPages = sampleEnd && sampleStart ? sampleEnd - sampleStart + 1 : 0;
  const exceedsLimit = maxAllowed && selectedPages > maxAllowed;
  const clearSample = () => onChange({ sample_page_start: 1, sample_page_end: '' });
  const manuscriptUploaded = !!data.manuscript_url;

  return (
    <Section icon={Layers} title={<>Sample Chapter <span className="text-destructive">*</span></>} subtitle="Let readers preview pages before buying — no file upload needed">
      <p className="text-sm text-muted-foreground mb-4">
        Specify which pages to share as a free preview. Classpedia generates the sample directly from your uploaded manuscript.
      </p>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-5">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">20% limit:</span> You can show at most 20% of your book's total pages as a sample.
        </p>
      </div>

      <div className="mb-5">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Total Pages</p>
        {manuscriptUploaded ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium">
                {totalPages ? `${totalPages} pages detected` : 'Detecting…'}
              </span>
            </div>
            {totalPages && (
              <span className="text-xs text-muted-foreground">Max sample: <span className="font-semibold text-foreground">{maxAllowed} pages</span></span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Upload your manuscript above to detect the page count.</p>
        )}
      </div>

      {totalPages ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Page Range</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">From</span>
                <Input type="number" min="1" max={totalPages} value={sampleStart}
                  onChange={(e) => onChange({ sample_page_start: parseInt(e.target.value) || 1 })}
                  className="bg-background w-20" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">To</span>
                <Input type="number" min={sampleStart} max={totalPages} value={sampleEnd}
                  onChange={(e) => { const v = parseInt(e.target.value) || ''; onChange({ sample_page_end: v }); }}
                  className={cn('bg-background w-20', exceedsLimit && 'border-destructive')}
                  placeholder="—" />
              </div>
              {hasSample && (
                <Button variant="ghost" size="sm" onClick={clearSample} className="text-muted-foreground gap-1 h-8">
                  <X className="w-3.5 h-3.5" /> Clear
                </Button>
              )}
            </div>
            {exceedsLimit && (
              <p className="flex items-center gap-1 text-xs text-destructive mt-2">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {selectedPages} pages exceeds the 20% limit ({maxAllowed} pages).
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'First 10%', pages: Math.floor(totalPages * 0.1) },
                { label: 'First 15%', pages: Math.floor(totalPages * 0.15) },
                { label: 'First 20% (max)', pages: maxAllowed },
              ].map(({ label, pages }) => (
                <button key={label} type="button"
                  onClick={() => onChange({ sample_page_start: 1, sample_page_end: pages })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                    sampleStart === 1 && sampleEnd === pages
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/40 text-foreground'
                  )}>
                  {label} ({pages}p)
                </button>
              ))}
            </div>
          </div>

          {hasSample && !exceedsLimit && (
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-3.5">
              <BookOpenCheck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Sample: Pages {sampleStart}–{sampleEnd}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedPages} pages · {((selectedPages / totalPages) * 100).toFixed(1)}% of your book
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-5 py-6 text-center">
          <Layers className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Upload a manuscript to configure the sample range.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">You can skip this if you don't want a sample preview.</p>
        </div>
      )}
    </Section>
  );
}

function CoverSection({ data, onChange, errors, uploading, setUploading, coverRef }) {
  const backCoverRef = useRef(null);
  const spineRef = useRef(null);
  const refMap = { cover: coverRef, spine: spineRef, back_cover: backCoverRef };

  const handleUpload = async (type, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === 'cover') onChange({ cover_url: file_url });
    else if (type === 'back_cover') onChange({ back_cover_url: file_url });
    else if (type === 'spine') onChange({ spine_url: file_url });
    setUploading(prev => ({ ...prev, [type]: false }));
  };

  const urlMap = { cover: data.cover_url, spine: data.spine_url, back_cover: data.back_cover_url };
  const removeMap = {
    cover: () => onChange({ cover_url: '' }),
    spine: () => onChange({ spine_url: '' }),
    back_cover: () => onChange({ back_cover_url: '' }),
  };
  const uploadKeyMap = { front: 'cover', spine: 'spine', back: 'back_cover' };

  return (
    <Section icon={ImageIcon} title="Book Cover" subtitle="High resolution JPG or PNG, RGB colour mode, max 50 MB">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {COVER_SPECS.map(spec => (
          <div key={spec.key} className="rounded-lg border border-border bg-secondary/20 px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-semibold text-foreground">{spec.label}</p>
              {spec.required
                ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Required</span>
                : <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">Optional</span>}
            </div>
            <p className="text-xs font-semibold text-foreground">{spec.dim}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{spec.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {COVER_SPECS.map(spec => {
          const uploadKey = uploadKeyMap[spec.key];
          const url = urlMap[uploadKey];
          const inputRef = refMap[uploadKey];
          const isLoading = uploading[uploadKey];
          const hasError = spec.key === 'front' && errors.cover_url;

          return (
            <div key={spec.key} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-foreground">{spec.label}</p>
                {spec.required && <span className="text-destructive text-xs">*</span>}
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handleUpload(uploadKey, e.target.files[0])} />
              {url ? (
                <div className="relative group rounded-xl border border-primary/25 overflow-hidden bg-primary/5 aspect-[2/3]">
                  <img src={url} alt={spec.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Button variant="secondary" size="sm" className="h-7 text-xs w-24" onClick={() => inputRef.current?.click()}>Replace</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-white hover:text-white hover:bg-white/20 w-24" onClick={removeMap[uploadKey]}>
                      <X className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Done
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={isLoading}
                  className={cn(
                    'w-full aspect-[2/3] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all',
                    'hover:border-primary hover:bg-primary/5',
                    hasError ? 'border-destructive bg-destructive/5' : 'border-border bg-secondary/20'
                  )}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                  <p className="text-xs text-muted-foreground">{isLoading ? 'Uploading…' : 'Upload'}</p>
                </button>
              )}
              {errors[`${uploadKey}_url`] && uploadKey !== 'cover' && (
                <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors[`${uploadKey}_url`]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export default function ContentStep({ data, onChange, errors, onNext, onBack, previewApproved, onApprove }) {
  const manuscriptRef = useRef(null);
  const coverRef = useRef(null);
  const [uploading, setUploading] = useState({ manuscript: false, cover: false, back_cover: false, spine: false });
  const [showPreviewer, setShowPreviewer] = useState(false);

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [type]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === 'manuscript') {
      const ext = file.name.split('.').pop().toLowerCase();
      const kb = file.size / 1024;
      let estimatedPages = ext === 'pdf' ? Math.max(1, Math.round(kb / 80)) : Math.max(1, Math.round(kb / 2));
      onChange({ manuscript_url: file_url, manuscript_filename: file.name, total_pages: estimatedPages });
    }
    setUploading((prev) => ({ ...prev, [type]: false }));
  };

  return (
    <div className="space-y-5">
      {/* Step header */}
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">eBook Content</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Upload your manuscript and cover, then configure content settings</p>
      </div>

      {/* ── 1. TRIM SIZE ── */}
      <Section icon={Layers} title="Trim Size" subtitle="Select your book's dimensions and orientation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Orientation */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-semibold text-foreground">Orientation</Label>
            </div>
            <RadioGroup
              value={data.orientation || 'portrait'}
              onValueChange={(v) => onChange({ orientation: v })}
              className="flex gap-3"
            >
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border border-border bg-background hover:border-primary/40 transition-colors">
                <RadioGroupItem value="portrait" className="text-primary" />
                <span className="text-sm font-medium">Portrait</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-lg border border-border bg-background hover:border-primary/40 transition-colors">
                <RadioGroupItem value="landscape" className="text-primary" />
                <span className="text-sm font-medium">Landscape</span>
              </label>
            </RadioGroup>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-semibold text-foreground">Size</Label>
            </div>
            <div className="relative">
              <select
                value={data.trim_size || 'us_trade_6x9'}
                onChange={(e) => onChange({ trim_size: e.target.value })}
                className="w-full h-10 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option value="us_trade_6x9">US Trade (6" × 9")</option>
                <option value="us_letter_8.5x11">US Letter (8.5" × 11")</option>
                <option value="digest_5.5x8.5">Digest (5.5" × 8.5")</option>
                <option value="royal_6x10">Royal (6" × 10")</option>
                <option value="a4_8.27x11.69">A4 (8.27" × 11.69")</option>
                <option value="a5_5.83x8.27">A5 (5.83" × 8.27")</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── 2. MANUSCRIPT ── */}
      <Section icon={FileText} title="Manuscript" subtitle="Your book's interior content — EPUB recommended for best results">
        <input
          ref={manuscriptRef}
          type="file"
          accept=".epub,.doc,.docx,.pdf"
          className="hidden"
          onChange={(e) => handleFileUpload('manuscript', e.target.files[0])}
        />

        {data.manuscript_url ? (
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{data.manuscript_filename || 'Manuscript uploaded'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Uploaded successfully
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => manuscriptRef.current?.click()} className="shrink-0">Replace</Button>
            <Button variant="ghost" size="icon" onClick={() => onChange({ manuscript_url: '', manuscript_filename: '', total_pages: '' })}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => manuscriptRef.current?.click()}
            disabled={uploading.manuscript}
            className={cn(
              'w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors',
              'hover:border-primary hover:bg-primary/5',
              errors.manuscript_url ? 'border-destructive' : 'border-border'
            )}
          >
            {uploading.manuscript ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{uploading.manuscript ? 'Uploading…' : 'Upload Manuscript'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Supported: {SUPPORTED_FORMATS.join(', ')}</p>
            </div>
          </button>
        )}
        {errors.manuscript_url && (
          <p className="flex items-center gap-1 text-xs text-destructive mt-2">
            <AlertCircle className="w-3 h-3" /> {errors.manuscript_url}
          </p>
        )}
      </Section>

      {/* ── 2. DRM NOTE ── */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Digital Rights Management (DRM)</span> is applied to this book to protect copyright ownership and prevent unauthorized copying or distribution.
        </p>
      </div>

      {/* ── 3. SAMPLE CHAPTER ── */}
      <SampleChapterSection data={data} onChange={onChange} />

      {/* ── 4. BOOK COVER ── */}
      <CoverSection data={data} onChange={onChange} errors={errors} uploading={uploading} setUploading={setUploading} coverRef={coverRef} />

      {/* ── 5. AI-GENERATED CONTENT ── */}
      <Section icon={Cpu} title="AI-Generated Content" subtitle="Disclosure required for platform transparency">
        <p className="text-sm text-muted-foreground mb-3">Did you use AI tools to create any text, images, or translations in this book?</p>
        <RadioGroup
          value={data.ai_generated != null ? (data.ai_generated ? 'yes' : 'no') : 'no'}
          onValueChange={(v) => onChange({ ai_generated: v === 'yes' })}
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="yes" className="text-primary" />
            <span className="text-sm">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="no" className="text-primary" />
            <span className="text-sm">No</span>
          </label>
        </RadioGroup>
        {data.ai_generated && (
          <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">AI-generated content is permitted. Disclosure helps maintain reader trust.</p>
          </div>
        )}
      </Section>

      {/* ── 6. PREVIEW ── */}
      <Section
        icon={Eye}
        title="eBook Preview"
        subtitle="See how your book will look to readers before publishing"
        subtitleBadge={previewApproved && (
          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        )}
      >
        <Button
          variant="outline"
          onClick={() => setShowPreviewer(true)}
          disabled={!data.manuscript_url && !data.cover_url}
          className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary"
        >
          <Eye className="w-4 h-4" />
          Launch Preview
        </Button>
        {!data.manuscript_url && !data.cover_url && (
          <p className="text-xs text-muted-foreground mt-2">Upload a manuscript or cover image to enable the preview.</p>
        )}
      </Section>

      {/* ── 7. ISBN ── */}
      <Section icon={BookOpen} title="ISBN (Optional)" subtitle="eBooks on Classpedia don't require an ISBN">
        <div className="max-w-sm">
          <Input
            value={data.isbn || ''}
            onChange={(e) => onChange({ isbn: e.target.value })}
            placeholder="e.g. 978-3-16-148410-0"
            className="bg-background"
          />
        </div>
      </Section>

      {/* Navigation */}
      <ValidationSummary errors={errors} />
      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2 h-10 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" className="gap-2 h-10 text-sm font-medium text-foreground">
            💾 Save as Draft
          </Button>
        </div>
        <Button onClick={onNext} className="gap-2 h-10 px-8 text-sm font-medium">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {showPreviewer && (
        <BookPreviewer book={data} onClose={() => setShowPreviewer(false)} onApprove={onApprove} />
      )}
    </div>
  );
}