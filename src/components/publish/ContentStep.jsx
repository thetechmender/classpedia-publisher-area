import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, ChevronRight, Upload, FileText, ImageIcon,
  X, Info, Cpu, Eye, BookOpen, CheckCircle2, AlertCircle, Layers, BookOpenCheck
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import BookPreviewer from './BookPreviewer';

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className="rounded-xl border border-border bg-card shadow-sm">
    <div className="flex items-start gap-3 px-5 py-4 bg-secondary/40 border-b border-border">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

const FieldLabel = ({ label, required, tooltip }) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

// const SUPPORTED_FORMATS = ['EPUB', 'MOBI', 'KPF', 'DOC', 'DOCX', 'PDF'];
const SUPPORTED_FORMATS = ['EPUB'];

const escapeHtml = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');


// Sample chapter page-range selector
function SampleChapterSection({ data, onChange }) {
  const totalPages = data.totalPages || '';
  const sampleStart = data.samplePageStart || 1;
  const sampleEnd = data.samplePageEnd || '';
  const hasSample = !!data.samplePageEnd;

  const maxAllowed = totalPages ? Math.floor(totalPages * 0.2) : null;
  const selectedPages = sampleEnd && sampleStart ? sampleEnd - sampleStart + 1 : 0;
  const exceedsLimit = maxAllowed && selectedPages > maxAllowed;

  const handleTotalPagesChange = (val) => {
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) {
      const max20 = Math.floor(n * 0.2);
      onChange({
        totalPages: n,
        samplePageStart: 1,
        samplePageEnd: Math.min(data.samplePageEnd || max20, max20),
      });
    } else {
      onChange({ totalPages: '', samplePageStart: 1, samplePageEnd: '' });
    }
  };

  const clearSample = () => onChange({ samplePageStart: 1, samplePageEnd: '', totalPages: '' });

  return (
    <Section icon={Layers} title="Sample Chapter" subtitle="Let readers preview pages before buying — no file upload needed">
      <p className="text-sm text-muted-foreground mb-1">
        Classpedia generates your sample directly from the uploaded manuscript. Just specify which pages you'd like to share as a free preview.
      </p>

      {/* 20% rule callout */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-5">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">20% rule:</span> You may only show up to 20% of your book's total pages as a sample. Classpedia enforces this limit automatically to protect your full content.
        </p>
      </div>

      {/* Step 1: Total pages */}
      <div className="mb-5">
        <FieldLabel
          label="Total Pages in Your Book"
          tooltip="Enter the approximate total page count so Classpedia can calculate the 20% sample limit"
        />
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min="1"
            value={totalPages}
            onChange={(e) => handleTotalPagesChange(e.target.value)}
            placeholder="e.g. 250"
            className="bg-background max-w-[140px]"
          />
          {totalPages && (
            <span className="text-xs text-muted-foreground">
              Max sample: <span className="font-semibold text-foreground">{maxAllowed} pages</span> (20% of {totalPages})
            </span>
          )}
        </div>
      </div>

      {/* Step 2: Page range */}
      {totalPages ? (
        <div className="space-y-4">
          <div>
            <FieldLabel label="Sample Page Range" tooltip="Select the start and end page of the excerpt shown to readers" />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10">From</span>
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={sampleStart}
                  onChange={(e) => onChange({ samplePageStart: parseInt(e.target.value) || 1 })}
                  className="bg-background w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10">To</span>
                <Input
                  type="number"
                  min={sampleStart}
                  max={totalPages}
                  value={sampleEnd}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || '';
                    onChange({ samplePageEnd: v });
                  }}
                  className={cn('bg-background w-20', exceedsLimit && 'border-destructive')}
                  placeholder="—"
                />
              </div>
              {hasSample && (
                <Button variant="ghost" size="sm" onClick={clearSample} className="text-muted-foreground gap-1 h-8">
                  <X className="w-3.5 h-3.5" /> Clear
                </Button>
              )}
            </div>

            {exceedsLimit && (
              <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">
                <AlertCircle className="w-3 h-3" />
                Selected range ({selectedPages} pages) exceeds the 20% limit of {maxAllowed} pages.
              </p>
            )}
          </div>

          {/* Quick select presets */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'First 10%', pages: Math.floor(totalPages * 0.1) },
                { label: 'First 15%', pages: Math.floor(totalPages * 0.15) },
                { label: 'First 20% (max)', pages: maxAllowed },
              ].map(({ label, pages }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onChange({ samplePageStart: 1, samplePageEnd: pages })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                    sampleStart === 1 && sampleEnd === pages
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/40 text-foreground'
                  )}
                >
                  {label} ({pages} pages)
                </button>
              ))}
            </div>
          </div>

          {/* Confirmation */}
          {hasSample && !exceedsLimit && (
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Sample set: Pages {sampleStart}–{sampleEnd}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {selectedPages} pages · {((selectedPages / totalPages) * 100).toFixed(1)}% of your book
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-5 py-6 text-center">
          <Layers className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Enter your total page count above to configure the sample range.</p>
          <p className="text-xs text-muted-foreground mt-1">Optional — you can skip this section if you prefer no sample preview.</p>
        </div>
      )}
    </Section>
  );
}

// ── Cover Section with Front, Spine, Back ─────────────────────────────────────
function CoverSection({ data, onChange, errors, uploading, setUploading, coverRef, localPreviews, setLocalPreviews }) {
  const backCoverRef = useRef(null);
  const spineRef = useRef(null);

  // Convert file to base64 string
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async (type, file) => {
    if (!file) return;

    // Create local preview URL immediately for instant feedback
    const localUrl = URL.createObjectURL(file);
    setLocalPreviews(prev => ({ ...prev, [type]: localUrl }));

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      // Convert file to base64 for payload
      const base64String = await fileToBase64(file);
      
      if (type === 'cover') onChange({ coverUrl: base64String });
      else if (type === 'back_cover') onChange({ backCoverUrl: base64String });
      else if (type === 'spine') onChange({ spineUrl: base64String });
    } catch (err) {
      console.error('Cover upload error:', err);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleRemove = (type, onRemove) => {
    // Clear local preview
    if (localPreviews[type]) {
      URL.revokeObjectURL(localPreviews[type]);
      setLocalPreviews(prev => ({ ...prev, [type]: null }));
    }
    onRemove();
  };

  const CoverUploadSlot = ({ label, required, hint, uploadKey, url, inputRef, onRemove }) => {
    // Use local preview if available, otherwise use uploaded URL
    const displayUrl = localPreviews[uploadKey] || url;
    const isUploading = uploading[uploadKey];
    const hasPreview = !!displayUrl;
    const isFullyUploaded = !!url; // Has server URL

    return (
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground mb-1">
          {label} {required && <span className="text-destructive">*</span>}
        </p>
        {hint && <p className="text-[10px] text-muted-foreground mb-2 leading-snug">{hint}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleUpload(uploadKey, e.target.files[0])} />
        {hasPreview ? (
          <div className={cn(
            "relative group rounded-lg overflow-hidden",
            isFullyUploaded
              ? "border border-primary/20 bg-primary/5"
              : "border-2 border-dashed border-amber-400 bg-amber-50"
          )}>
            <img src={displayUrl} alt={label}
              className={cn('w-full object-cover rounded-lg', uploadKey === 'spine' ? 'h-28' : 'h-40')} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
              <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => inputRef.current?.click()}>Replace</Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-white hover:text-white" onClick={onRemove}><X className="w-3.5 h-3.5" /></Button>
            </div>
            <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center">
              {isUploading ? (
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Uploading...
                </span>
              ) : isFullyUploaded ? (
                <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-green-400" /> Uploaded
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5" /> Preview Only
                </span>
              )}
            </div>
          </div>
        ) : (
          <button onClick={() => inputRef.current?.click()} disabled={isUploading}
            className={cn(
              'w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors',
              uploadKey === 'spine' ? 'py-6' : 'py-8',
              'hover:border-primary hover:bg-primary/5',
              errors[`${uploadKey}_url`] ? 'border-destructive' : 'border-border'
            )}>
            {isUploading
              ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
            <p className="text-xs text-muted-foreground font-medium">
              {isUploading ? 'Uploading…' : 'Upload'}
            </p>
          </button>
        )}
      </div>
    );
  };

  return (
    <Section icon={ImageIcon} title="Book Cover" subtitle="Upload front cover (required), plus optional spine and back cover">
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Your cover is the first thing readers see. Use a high-resolution image for the best impression.
        Front cover: <strong>1600 × 2560 px</strong> recommended (portrait), JPEG or PNG.
      </p>

      <div className="flex gap-3">
        <CoverUploadSlot
          label="Front Cover" required
          hint="Main cover shown on the product page"
          uploadKey="cover"
          url={data.coverUrl}
          inputRef={coverRef}
          onRemove={() => handleRemove('cover', () => onChange({ coverUrl: '' }))}
        />
        <CoverUploadSlot
          label="Spine"
          hint="Narrow strip between front and back cover"
          uploadKey="spine"
          url={data.spineUrl}
          inputRef={spineRef}
          onRemove={() => handleRemove('spine', () => onChange({ spineUrl: '' }))}
        />
        <CoverUploadSlot
          label="Back Cover"
          hint="Shown in full-spread view"
          uploadKey="back_cover"
          url={data.backCoverUrl}
          inputRef={backCoverRef}
          onRemove={() => handleRemove('back_cover', () => onChange({ backCoverUrl: '' }))}
        />
      </div>

      {errors.coverUrl && (
        <p className="flex items-center gap-1 text-xs text-destructive mt-2">
          <AlertCircle className="w-3 h-3" /> {errors.coverUrl}
        </p>
      )}
    </Section>
  );
}

export default function ContentStep({ data, onChange, errors, onNext, onBack, submitting = false, contentProgress = { done: 0, total: 0 } }) {
  const manuscriptRef = useRef(null);
  const coverRef = useRef(null);
  const [uploading, setUploading] = useState({ manuscript: false, cover: false, back_cover: false, spine: false });
  const [showPreviewer, setShowPreviewer] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);
  // Local preview URLs for immediate display before upload completes
  const [localPreviews, setLocalPreviews] = useState({ cover: null, back_cover: null, spine: null, manuscript: null });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const startTimer = () => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const parseEpubToStructure = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const book = ePub(arrayBuffer);
    await book.opened;

    /** @type {any} */
    const spine = book.spine;
    const chapters = [];

    // Allowed element types we want to capture
    const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'li'];

    // Build a map of href → chapter title from the EPUB navigation (NCX/nav.xhtml).
    // This is the most reliable source of real chapter titles, since EPUBs often
    // store the chapter heading only in the nav and not as an <h1>/<h2> in body.
    const navTitleByHref = new Map();
    try {
      await book.loaded.navigation;
      /** @type {any} */
      const nav = book.navigation;
      const flatten = (items) => {
        if (!Array.isArray(items)) return;
        for (const it of items) {
          if (it && it.href && it.label) {
            // Strip the in-page anchor so different anchors in the same file
            // all resolve to the same href.
            const cleanHref = String(it.href).split('#')[0];
            const label = String(it.label).replace(/\s+/g, ' ').trim();
            if (cleanHref && label && !navTitleByHref.has(cleanHref)) {
              navTitleByHref.set(cleanHref, label);
            }
          }
          if (it && it.subitems) flatten(it.subitems);
        }
      };
      flatten(nav?.toc);
    } catch (_) { /* navigation is best-effort */ }

    for (let i = 0; i < spine.length; i++) {
      const section = spine.get(i);
      if (!section) continue;

      try {
        await section.load(book.load.bind(book));
      } catch (e) {
        continue;
      }
      const doc = section.document;
      if (!doc) continue;

      // Determine chapter title — prefer the EPUB navigation entry when
      // available, then fall back to in-document headings.
      let chapterTitle = '';
      const sectionHref = String(section.href || '').split('#')[0];
      if (sectionHref && navTitleByHref.has(sectionHref)) {
        chapterTitle = navTitleByHref.get(sectionHref);
      }
      if (!chapterTitle) {
        const h1 = doc.querySelector('h1');
        const h2 = doc.querySelector('h2');
        const titleEl = doc.querySelector('title');
        if (h1) chapterTitle = h1.textContent.trim();
        else if (h2) chapterTitle = h2.textContent.trim();
        else if (titleEl) chapterTitle = titleEl.textContent.trim();
        else chapterTitle = `Chapter ${i + 1}`;
      }

      // Walk the body and pick up known elements in order
      const elements = [];
      const body = doc.body || doc.documentElement;
      if (!body) continue;

      const walker = doc.createTreeWalker(body, 1 /* NodeFilter.SHOW_ELEMENT */);
      let node = walker.currentNode;
      // Iterate elements in document order
      while (node) {
        const tag = (node.tagName || '').toLowerCase();
        if (allowedTags.includes(tag)) {
          const text = (node.textContent || '').trim();
          if (text) {
            elements.push({ type: tag, content: text });
          }
        }
        node = walker.nextNode();
      }

      // Skip empty chapters
      if (elements.length === 0) continue;

      chapters.push({
        chapterIndex: chapters.length + 1,
        title: chapterTitle,
        elements,
      });
    }

    // Best-effort book metadata
    let metaTitle = '';
    try {
      const md = await book.loaded.metadata;
      metaTitle = md?.title || '';
    } catch (_) { }

    return {
      bookId: `local-${Date.now()}`,
      title: metaTitle || file.name.replace(/\.epub$/i, ''),
      chapters,
    };
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;

    // For manuscript, store filename immediately for instant feedback
    if (type === 'manuscript') {
      setLocalPreviews((prev) => ({ ...prev, manuscript: file.name }));
    }

    setUploading((prev) => ({ ...prev, [type]: true }));
    startTimer();

    try {
      let parsedStructure = null;

      if (type === 'manuscript' && file.name.toLowerCase().endsWith('.epub')) {
        try {
          parsedStructure = await parseEpubToStructure(file);
          console.log('[EPUB parsed structure]', parsedStructure);
        } catch (err) {
          console.error('EPUB parsing error:', err);
        }
      }

      let file_url = '';
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        file_url = res?.file_url || '';
      } catch (err) {
        console.error('Upload error:', err);
        // Fallback: use local blob URL so the demo can still proceed
        file_url = URL.createObjectURL(file);
      }

      if (type === 'manuscript') {
        onChange({
          manuscript_url: file_url,
          manuscriptFilename: file.name,
          manuscriptStructure: parsedStructure,
        });
        // Clear local preview after successful upload
        setLocalPreviews((prev) => ({ ...prev, manuscript: null }));
      }
    } catch (err) {
      console.error('handleFileUpload fatal error:', err);
      // On fatal error, also clear the local preview so user isn't stuck
      if (type === 'manuscript') {
        setLocalPreviews((prev) => ({ ...prev, manuscript: null }));
      }
    } finally {
      stopTimer();
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className={cn("space-y-5 relative", submitting && "pointer-events-none")}>
      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border rounded-xl px-6 py-5 shadow-lg flex items-center gap-4 max-w-md">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <p className="text-sm font-semibold">Uploading your content…</p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take a few minutes. Please don&apos;t close this page or change the cover or manuscript while it finishes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif text-foreground">eBook Content</h2>
          <p className="text-sm text-muted-foreground">Upload your manuscript, cover image, and configure content settings</p>
        </div>
      </div>

      {/* ── 1. MANUSCRIPT ── */}
      <Section icon={FileText} title="Manuscript" subtitle="Upload your book's interior content file">
        <p className="text-sm text-muted-foreground mb-1">
          Upload your manuscript (your book's interior content). We recommend using an EPUB file for best results.
        </p>

        <input
          ref={manuscriptRef}
          type="file"
          accept=".epub"
          className="hidden"
          onChange={(e) => handleFileUpload('manuscript', e.target.files[0])}
        />

        {(() => {
          const isUploading = uploading.manuscript;
          const isFullyUploaded = !!data.manuscript_url;
          const hasLocalPreview = !!localPreviews.manuscript;
          const displayFilename = data.manuscriptFilename || localPreviews.manuscript || 'Manuscript';

          // Show uploaded state if fully uploaded OR if uploading with local preview
          if (isFullyUploaded || hasLocalPreview) {
            return (
              <div className={cn(
                "flex items-center gap-3 rounded-xl p-4 mb-4",
                isFullyUploaded
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-amber-50 border-2 border-dashed border-amber-400"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isFullyUploaded ? "bg-primary/10" : "bg-amber-100"
                )}>
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className={cn("w-5 h-5", isFullyUploaded ? "text-primary" : "text-amber-600")} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayFilename}</p>
                  <span className={cn("text-xs flex items-center gap-1 mt-0.5", isFullyUploaded ? "text-muted-foreground" : "text-amber-600")}>
                    {isUploading ? (
                      <>
                        <span className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
                        Uploading... {formatTime(elapsedSeconds)}
                      </>
                    ) : isFullyUploaded ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Uploaded successfully
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Processing...
                      </>
                    )}
                  </span>
                </div>
                {!isUploading && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => manuscriptRef.current?.click()} className="shrink-0">
                      Replace
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setLocalPreviews(prev => ({ ...prev, manuscript: null }));
                      onChange({ manuscript_url: '', manuscriptFilename: '' });
                    }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            );
          }

          // Show upload button
          return (
            <button
              onClick={() => manuscriptRef.current?.click()}
              disabled={isUploading}
              className={cn(
                'w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors mb-4',
                'hover:border-primary hover:bg-primary/5',
                errors.manuscript_url ? 'border-destructive' : 'border-border'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Upload Manuscript</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported file types: {SUPPORTED_FORMATS.join(', ')}
                </p>
              </div>
            </button>
          );
        })()}
        {errors.manuscript_url && (
          <p className="flex items-center gap-1 text-xs text-destructive mb-4">
            <AlertCircle className="w-3 h-3" /> {errors.manuscript_url}
          </p>
        )}

        <Separator className="my-5" />

        {/* DRM */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Digital Rights Management (DRM)</p>
          <p className="text-sm text-muted-foreground mb-1">
            DRM protects the rights of copyright holders, and limits unauthorized access and distribution of the content.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Would you like to apply Digital Rights Management (DRM) to your files?
          </p>
          <RadioGroup
            value={data.drm ? 'yes' : 'no'}
            onValueChange={(v) => onChange({ drm: v === 'yes' })}
            className="space-y-2"
          >
            <label className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
              data.drm ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="yes" className="text-primary" />
              <div>
                <p className="text-sm font-medium">Yes, apply Digital Rights Management</p>
                <p className="text-xs text-muted-foreground mt-0.5">Readers will need the Classpedia app to access this title. Cannot be changed after publication.</p>
              </div>
            </label>
            <label className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
              !data.drm ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="no" className="text-primary" />
              <div>
                <p className="text-sm font-medium">No, do not apply DRM</p>
                <p className="text-xs text-muted-foreground mt-0.5">Allow customers who buy this book to download it as a PDF or EPUB file.</p>
              </div>
            </label>
          </RadioGroup>
        </div>
      </Section>

      {/* ── 2. SAMPLE CHAPTER ── */}
      <SampleChapterSection data={data} onChange={onChange} />

      {/* ── 3. BOOK COVER ── */}
      <CoverSection
        data={data}
        onChange={onChange}
        errors={errors}
        uploading={uploading}
        setUploading={setUploading}
        coverRef={coverRef}
        localPreviews={localPreviews}
        setLocalPreviews={setLocalPreviews}
      />

      {/* ── 4. AI-GENERATED CONTENT ── */}
      <Section icon={Cpu} title="AI-Generated Content" subtitle="Transparency about the use of AI tools in your book">
        <p className="text-sm text-muted-foreground mb-1">
          Classpedia is collecting information about the use of Artificial Intelligence (AI) tools in creating content.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Did you use AI tools in creating texts, images, and/or translations in your book?
        </p>
        <RadioGroup
          value={data.aiGenerated != null ? data.aiGenerated ? 'yes' : 'no' : ''}
          onValueChange={(v) => onChange({ aiGenerated: v === 'yes' })}
          className="space-y-2"
        >
          <label className={cn(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            data.aiGenerated === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="yes" className="text-primary" />
            <span className="text-sm font-medium">Yes</span>
          </label>
          <label className={cn(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            data.aiGenerated === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="no" className="text-primary" />
            <span className="text-sm font-medium">No</span>
          </label>
        </RadioGroup>
        {data.aiGenerated && (
          <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              AI-generated content is permitted on Classpedia. Disclosing its use helps maintain reader trust and platform transparency.
            </p>
          </div>
        )}
      </Section>

      {/* ── 5. CLASSPEDIA PREVIEW ── */}
      <Section icon={Eye} title="Classpedia eBook Preview" subtitle="Preview your book before publishing">
        <p className="text-sm text-muted-foreground mb-1 font-medium">Online Preview & Quality Check</p>
        <p className="text-sm text-muted-foreground mb-5">
          Preview your book to check quality and see how it will appear to readers on Classpedia across devices.
          Make sure your formatting looks great before publishing.
        </p>
        {(() => {
          const hasCover = !!(localPreviews.cover || data.coverUrl);
          const hasManuscript = !!data.manuscript_url;
          const canPreview = hasCover || hasManuscript;
          return (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPreviewer(true)}
                disabled={!canPreview}
                className={cn(
                  'gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary',
                  !canPreview && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Eye className="w-4 h-4" />
                Launch Preview
              </Button>
              {!canPreview && (
                <p className="text-xs text-muted-foreground mt-2">Upload a manuscript or cover to enable the preview.</p>
              )}
            </>
          );
        })()}
      </Section>

      {/* ── 6. ISBN ── */}
      <Section icon={BookOpen} title="eBook ISBN" subtitle="Optional identifier for your book">
        <p className="text-sm text-muted-foreground mb-4">
          eBooks published on Classpedia are not required to have an ISBN. You may enter one if you have it.
        </p>
        <div className="mb-4">
          <FieldLabel label="ISBN (Optional)" tooltip="International Standard Book Number — a unique identifier for your book" />
          <Input
            value={data.isbn || ''}
            onChange={(e) => onChange({ isbn: e.target.value })}
            placeholder="e.g. 978-3-16-148410-0"
            className="bg-background max-w-sm"
          />
        </div>
      </Section>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} disabled={submitting} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={uploading.manuscript || submitting} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>Save & Continue <ChevronRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>

      {/* Book Previewer Modal */}
      {showPreviewer && (
        <BookPreviewer
          book={{
            ...data,
            // BookPreviewer expects snake_case keys — map camelCase form data
            title: data.title,
            subtitle: data.subtitle,
            description: data.description,
            author_name: data.authorName || data.author_name,
            contributors: data.contributors,
            edition_number: data.editionNumber || data.edition_number,
            seriesName: data.seriesName,
            cover_url: localPreviews.cover || data.coverUrl || data.cover_url,
            back_cover_url: localPreviews.back_cover || data.backCoverUrl || data.back_cover_url,
            spine_url: localPreviews.spine || data.spineUrl || data.spine_url,
            manuscript_url: data.manuscript_url || data.manuscriptUrl,
            manuscript_filename: data.manuscriptFilename || data.manuscript_filename,
            manuscript_structure: data.manuscriptStructure || data.manuscript_structure,
            // Keep originals for any UI that may still reference camelCase
            coverUrl: localPreviews.cover || data.coverUrl,
            backCoverUrl: localPreviews.back_cover || data.backCoverUrl,
            spineUrl: localPreviews.spine || data.spineUrl,
          }}
          onClose={() => setShowPreviewer(false)}
        />
      )}

    </div>
  );
}