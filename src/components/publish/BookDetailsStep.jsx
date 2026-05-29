import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { X, Plus, ChevronRight, BookOpen, Info, Users, Tag, Clock, AlertCircle, CheckCircle2, Search, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { generalSettingsService } from '@/services/generalSettings.service';



const READING_AGES = ['0-2', '3-5', '6-8', '9-11', '12-14', '15-17', '18+', 'Adult'];

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

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  ) : null;

// ── Series Details Component ──────────────────────────────────────────────────
function SeriesDetails({ data, onChange }) {
  return (
    <div className="mt-3 p-3 bg-secondary/40 border border-border rounded-lg space-y-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Series Details</p>
      <div>
        <FieldLabel label="Book Number in Series" tooltip="Which number is this book in the series? (e.g. 3 = Book 3)" />
        <Input
          type="number"
          min="1"
          value={data.seriesNumber ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            const n = parseInt(val);
            onChange({ seriesNumber: !val || isNaN(n) ? null : n });
          }}
          placeholder="e.g. 3"
          className="bg-background max-w-[120px]"
        />
        <p className="text-xs text-muted-foreground mt-1">Leave blank if this is the only book or Book 1.</p>
      </div>
    </div>
  );
}

// ── Category Picker Component ─────────────────────────────────────────────────
function CategoryPicker({ selected, onChange, error, categories = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const atMax = selected.length >= 3;

  const filtered = query.trim()
    ? categories.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) && !selected.includes(c.id))
    : categories.filter(c => !selected.includes(c.id));

  const showAddCustom = query.trim() &&
    !categories.some(c => c.title.toLowerCase() === query.toLowerCase()) &&
    !selected.some(id => categories.find(c => c.id === id)?.title.toLowerCase() === query.toLowerCase());

  const add = (catId) => {
    if (!atMax && !selected.includes(catId)) {
      const next = [...selected, catId];
      onChange(next);
      setQuery('');
      if (next.length >= 3) setOpen(false);
    }
  };

  const remove = (catId) => onChange(selected.filter(id => id !== catId));

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      {error && <ErrorMsg msg={error} />}

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(id => {
            const cat = categories.find(c => c.id === id);
            return cat ? (
              <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/25">
                {cat.title}
                <button type="button" onClick={() => remove(id)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Trigger / search input */}
      {!atMax ? (
        <div className="relative">
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 cursor-text',
              open && 'ring-1 ring-ring border-ring'
            )}
            onClick={() => setOpen(true)}
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Search or type a custom category…"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </div>

          {open && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
              {!query.trim() && (
                <p className="px-3 pt-2 pb-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  All Categories
                </p>
              )}
              <div className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 && !showAddCustom && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No categories found.</p>
                )}
                {filtered.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); add(cat.id); }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {cat.title}
                  </button>
                ))}
                {showAddCustom && (
                  <button
                    type="button"
                    onMouseDown={e => { e.preventDefault(); add(query.trim()); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 transition-colors border-t border-border"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add "{query.trim()}"
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border">
          Maximum 3 categories selected — remove one to change.
        </p>
      )}
    </div>
  );
}

export default function BookDetailsStep({ data, onChange, errors, onNext, submitting = false }) {
  const [keywordInput, setKeywordInput] = useState('');
  const [newContributor, setNewContributor] = useState({ name: '', role: '' });
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [contributorRoles, setContributorRoles] = useState([]);

  useEffect(() => {
    generalSettingsService.getCategories()
      .then(setCategories)
      .catch(console.error);
    generalSettingsService.getLanguages()
      .then(setLanguages)
      .catch(console.error);
    generalSettingsService.getContributorRoles()
      .then(setContributorRoles)
      .catch(console.error);
  }, []);

  // Set English as default language when languages are loaded
  useEffect(() => {
    if (languages.length > 0 && !data.language) {
      const english = languages.find(l => l.title.toLowerCase() === 'english');
      if (english) onChange({ language: english.id });
    }
  }, [languages]);

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && (data.keywords || []).length < 7 && !data.keywords?.includes(kw)) {
      onChange({ keywords: [...(data.keywords || []), kw] });
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw) => onChange({ keywords: (data.keywords || []).filter(k => k !== kw) });

  const addContributor = () => {
    if (newContributor.name && newContributor.role) {
      onChange({ contributors: [...(data.contributors || []), { ...newContributor }] });
      setNewContributor({ name: '', role: '' });
    }
  };

  const removeContributor = (index) =>
    onChange({ contributors: (data.contributors || []).filter((_, i) => i !== index) });

  const addCategory = (cat) => {
    if (!(data.categories || []).includes(cat) && (data.categories || []).length < 3) {
      onChange({ categories: [...(data.categories || []), cat] });
    }
  };

  const removeCategory = (cat) =>
    onChange({ categories: (data.categories || []).filter(c => c !== cat) });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif text-foreground">Book Details</h2>
          <p className="text-sm text-muted-foreground">Enter the details that describe your eBook to readers</p>
        </div>
      </div>

      {/* ── 1. BOOK IDENTITY ── */}
      <Section icon={BookOpen} title="Book Identity" subtitle="Core information about your title and author">

        {/* Language */}
        <div className="mb-5">
          <FieldLabel label="Language" required tooltip="The primary language your book is written in" />
          <Select value={data.language ? String(data.language) : ''} onValueChange={(v) => onChange({ language: parseInt(v) })}>
            <SelectTrigger className={cn('bg-background', errors.language && 'border-destructive')}>
              <SelectValue placeholder="Select language…" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <ErrorMsg msg={errors.language} />
        </div>

        {/* Title & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <FieldLabel label="Book Title" required tooltip="The main title as it will appear on the product page" />
            <Input
              value={data.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Enter your book title"
              className={cn('bg-background', errors.title && 'border-destructive')}
            />
            <ErrorMsg msg={errors.title} />
          </div>
          <div>
            <FieldLabel label="Subtitle" tooltip="An optional subtitle for your book" />
            <Input
              value={data.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="Enter subtitle (optional)"
              className="bg-background"
            />
          </div>
        </div>

        {/* Series & Edition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <FieldLabel label="Series Name" tooltip="If this book is part of a series, enter the series name" />
            <Input
              value={data.seriesName || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ seriesName: val, ...(val === '' ? { seriesNumber: '', series_books: [] } : {}) });
              }}
              placeholder="Series name (optional)"
              className="bg-background"
            />
            {data.seriesName && (
              <SeriesDetails data={data} onChange={onChange} />
            )}
          </div>
          <div>
            <FieldLabel label="Edition" tooltip="Leave blank if this is the first edition" />
            <Input
              value={data.editionNumber || ''}
              onChange={(e) => onChange({ editionNumber: e.target.value })}
              placeholder="e.g. 2nd Edition"
              className="bg-background"
            />
          </div>
        </div>

        {/* Author */}
        <div className="mb-5">
          <FieldLabel label="Author Name" required tooltip="Enter the primary author or contributor. Pen names are allowed. To include a middle name or prefix, add it to the first name field. Suffixes should be added to the last name." />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                value={data.authorFirstName || ''}
                onChange={(e) => {
                  const first = e.target.value;
                  const last = data.authorLastName || '';
                  onChange({ authorFirstName: first, authorName: `${first} ${last}`.trim() });
                }}
                placeholder="First name"
                className={cn('bg-background', errors.authorName && 'border-destructive')}
              />
            </div>
            <div>
              <Input
                value={data.authorLastName || ''}
                onChange={(e) => {
                  const last = e.target.value;
                  const first = data.authorFirstName || '';
                  onChange({ authorLastName: last, authorName: `${first} ${last}`.trim() });
                }}
                placeholder="Last name"
                className={cn('bg-background', errors.authorName && 'border-destructive')}
              />
            </div>
          </div>
          <ErrorMsg msg={errors.authorName} />
        </div>

        {/* Contributors */}
        <div>
          <FieldLabel label="Contributors" tooltip="Add editors, illustrators, translators, and other contributors" />
          {(data.contributors || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {data.contributors.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-2 border border-border">
                  <span className="text-sm flex-1 font-medium">{c.name}</span>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">{contributorRoles.find(r => r.id === c.role)?.title || c.role}</Badge>
                  <button onClick={() => removeContributor(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newContributor.name}
              onChange={(e) => setNewContributor({ ...newContributor, name: e.target.value })}
              placeholder="Contributor name"
              className="flex-1 bg-background"
            />
            <Select value={newContributor.role ? String(newContributor.role) : ''} onValueChange={(v) => setNewContributor({ ...newContributor, role: parseInt(v) })}>
              <SelectTrigger className="w-36 bg-background">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {contributorRoles.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              type="button" variant="outline" size="icon" onClick={addContributor}
              disabled={!newContributor.name || !newContributor.role}
              className="border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* ── 2. DESCRIPTION & KEYWORDS ── */}
      <Section icon={Tag} title="Description & Keywords" subtitle="Help readers find and understand your book">
        <div className="mb-5">
          <FieldLabel label="Book Description" required tooltip="A compelling description that appears on your book's product page. Minimum 50 characters, maximum 4,000 characters." />
          <Textarea
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Write a compelling book description that hooks readers… (50–4,000 characters)"
            className={cn('min-h-[180px] bg-background resize-none', errors.description && 'border-destructive')}
            maxLength={4000}
          />
          <div className="flex justify-between items-start mt-1.5 gap-2">
            <div className="flex-1">
              <ErrorMsg msg={errors.description} />
              {(data.description || '').length > 0 && (data.description || '').length < 50 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {50 - (data.description || '').length} more characters needed
                </p>
              )}
            </div>
            <span className={cn('text-xs shrink-0 font-medium', (data.description || '').length > 3800 ? 'text-destructive' : 'text-muted-foreground')}>
              {(data.description || '').length} / 4,000
            </span>
          </div>
        </div>

        <div>
          <FieldLabel label="Keywords" tooltip="Up to 7 keywords to help readers discover your book through search" />
          {(data.keywords || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {data.keywords.map(kw => (
                <Badge key={kw} className="gap-1.5 py-1 px-2.5 bg-primary/10 text-primary border border-primary/20">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {(data.keywords || []).length < 7 && (
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Type a keyword and press Enter or Add"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 bg-background"
              />
              <Button type="button" variant="outline" onClick={addKeyword} disabled={!keywordInput.trim()}
                className="border-primary/30 hover:bg-primary/10 hover:text-primary">
                Add
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            {(data.keywords || []).length}/7 keywords
            {(data.keywords || []).length === 7 && <span className="ml-2 text-primary font-medium">✓ Maximum reached</span>}
          </p>
        </div>
      </Section>

      {/* ── 3. CATEGORIES ── */}
      <Section icon={Tag} title="Categories" subtitle="Choose up to 3 categories that best describe your book">
        <CategoryPicker
          selected={data.categories || []}
          onChange={(cats) => onChange({ categories: cats })}
          error={errors.categories}
          categories={categories}
        />
      </Section>

      {/* ── 4. PRIMARY AUDIENCE ── */}
      <Section icon={Users} title="Primary Audience" subtitle="Define who your book is intended for">

        {/* Sexually Explicit */}
        <div className="mb-5">
          <p className="text-sm font-medium text-foreground mb-1">Sexually Explicit Images or Title</p>
          <p className="text-xs text-muted-foreground mb-3">
            Does the book's cover or interior contain sexually explicit images, or does the book's title contain sexually explicit language?
          </p>
          <RadioGroup
            value={data.sexually_explicit ? 'yes' : 'no'}
            onValueChange={(v) => onChange({ sexually_explicit: v === 'yes' })}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 cursor-pointer group">
              <RadioGroupItem value="yes" className="text-primary" />
              <span className="text-sm group-hover:text-primary transition-colors">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <RadioGroupItem value="no" className="text-primary" />
              <span className="text-sm group-hover:text-primary transition-colors">No</span>
            </label>
          </RadioGroup>
          {data.sexually_explicit && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Books with explicit content have restricted distribution and may not be available in all territories.
              </p>
            </div>
          )}
        </div>

        <Separator className="mb-5" />

        {/* Reading Age */}
        <div>
          <p className="text-sm font-medium text-foreground mb-0.5">
            Reading Age <span className="text-muted-foreground font-normal">(Optional)</span>
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Select the appropriate age range. Recommended for children's and young adult books.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel label="Minimum Age" />
              <Select value={data.readingAgeMin || ''} onValueChange={(v) => onChange({ readingAgeMin: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {READING_AGES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel label="Maximum Age" />
              <Select value={data.readingAgeMax || ''} onValueChange={(v) => onChange({ readingAgeMax: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {READING_AGES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. PRE-ORDER ── */}
      <Section icon={Clock} title="Release & Pre-order" subtitle="Choose when your book becomes available to readers">
        <RadioGroup
          value={data.preorderType || 'release_now'}
          onValueChange={(v) => onChange({ preorderType: v, preorderDate: v === 'release_now' ? '' : data.preorderDate })}
          className="space-y-3"
        >
          <label className={cn(
            'flex items-start gap-3 rounded-xl border-2 px-4 py-4 cursor-pointer transition-all',
            (data.preorderType || 'release_now') === 'release_now'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="release_now" className="mt-0.5 text-primary" />
            <div>
              <p className={cn('text-sm font-medium', (data.preorderType || 'release_now') === 'release_now' ? 'text-primary' : 'text-foreground')}>
                I am ready to release my book now
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                After you submit for publication, it can take up to 72 hours to go live. During this time, edits cannot be made to your book.
              </p>
            </div>
          </label>

          <label className={cn(
            'flex items-start gap-3 rounded-xl border-2 px-4 py-4 cursor-pointer transition-all',
            data.preorderType === 'preorder'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="preorder" className="mt-0.5 text-primary" />
            <div className="flex-1">
              <p className={cn('text-sm font-medium', data.preorderType === 'preorder' ? 'text-primary' : 'text-foreground')}>
                Make my eBook available for Pre-order
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Allow readers to purchase before the release date. Pre-orders count toward your launch-day sales rank.
              </p>
              {data.preorderType === 'preorder' && (
                <div className="mt-4 pt-3 border-t border-primary/15">
                  <FieldLabel label="Pre-order Release Date" required tooltip="The date your book will be delivered to pre-order customers. Must be at least 10 days from today." />
                  <Input
                    type="date"
                    value={data.preorderDate || null}
                    onChange={(e) => onChange({ preorderDate: e.target.value })}
                    min={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="bg-background max-w-xs"
                  />
                  <div className="flex items-start gap-1.5 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Pre-order date must be <span className="font-medium text-foreground">at least 10 days from today</span>. The first 10 days from today are unavailable to allow Classpedia time to set up your pre-order listing.
                    </p>
                  </div>
                  {data.preorderDate && (
                    <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Release scheduled for {new Date(data.preorderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </label>
        </RadioGroup>
      </Section>

      {/* Next Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={onNext} disabled={submitting} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>Save & Continue <ChevronRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}