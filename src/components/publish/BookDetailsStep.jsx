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
import ValidationSummary from '@/components/shared/ValidationSummary';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Chinese', 'Korean', 'Hindi', 'Arabic', 'Russian',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish'
];

const CATEGORIES = [
  'Arts & Photography', 'Biographies & Memoirs', 'Business & Money',
  "Children's eBooks", 'Comics & Graphic Novels', 'Computers & Technology',
  'Cookbooks, Food & Wine', 'Crafts, Hobbies & Home', 'Education & Teaching',
  'Engineering & Transportation', 'Health, Fitness & Dieting', 'History',
  'Humor & Entertainment', 'Law', 'Literature & Fiction', 'Medical eBooks',
  'Mystery, Thriller & Suspense', 'Parenting & Relationships',
  'Politics & Social Sciences', 'Reference', 'Religion & Spirituality',
  'Romance', 'Science & Math', 'Science Fiction & Fantasy',
  'Self-Help', 'Sports & Outdoors', 'Teen & Young Adult', 'Travel'
];

const CONTRIBUTOR_ROLES = [
  'Co-author', 'Editor', 'Illustrator', 'Translator', 'Foreword', 'Narrator', 'Photographer'
];

const READING_AGES = ['0-2', '3-5', '6-8', '9-11', '12-14', '15-17', '18+', 'Adult'];

// Shared section wrapper used across all steps
const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className="rounded-xl border border-border bg-card">
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground leading-none flex items-center gap-1">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

const FieldLabel = ({ label, required, tooltip, hint }) => (
  <div className="mb-1.5">
    <div className="flex items-center gap-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
  </div>
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  ) : null;

function SeriesDetails({ data, onChange }) {
  return (
    <div className="mt-3 p-3 bg-secondary/40 border border-border rounded-lg">
      <p className="text-xs font-medium text-muted-foreground mb-2">Series Position</p>
      <Input
        type="number"
        min="1"
        value={data.series_number ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          const n = parseInt(val);
          onChange({ series_number: !val || isNaN(n) ? null : n });
        }}
        placeholder="e.g. 3"
        className="bg-background max-w-[120px]"
      />
      <p className="text-xs text-muted-foreground mt-1.5">Volume number within the series</p>
    </div>
  );
}

function CategoryPicker({ selected, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const atMax = selected.length >= 3;

  const allFiltered = query.trim()
    ? CATEGORIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : CATEGORIES;

  const toggle = (cat) => {
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else if (!atMax) {
      onChange([...selected, cat]);
    }
  };

  const remove = (cat) => onChange(selected.filter(c => c !== cat));

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      {error && <ErrorMsg msg={error} />}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={cn(
            'w-full flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-left transition-all min-h-[38px]',
            open && 'ring-1 ring-ring border-ring'
          )}
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="flex-1 flex flex-wrap gap-1.5">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Select up to 3 categories…</span>
            ) : (
              selected.map(cat => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/25"
                >
                  {cat}
                  <span
                    role="button"
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); remove(cat); }}
                    className="hover:text-destructive transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
            <div className="p-2 border-b border-border">
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search categories…"
                className="w-full text-sm px-2 py-1.5 bg-background border border-border rounded-md outline-none"
              />
            </div>
            {atMax && (
              <p className="px-3 py-1.5 text-[11px] text-amber-700 bg-amber-50 border-b border-amber-100">
                Maximum 3 selected. Remove one to change.
              </p>
            )}
            <div className="max-h-56 overflow-y-auto py-1">
              {allFiltered.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">No categories found.</p>
              )}
              {allFiltered.map(cat => {
                const isSelected = selected.includes(cat);
                const isDisabled = atMax && !isSelected;
                return (
                  <button
                    key={cat}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); toggle(cat); }}
                    disabled={isDisabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors',
                      isSelected ? 'bg-primary/5 text-primary' : isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40 bg-background'
                    )}>
                      {isSelected && <span className="text-white text-[9px] font-bold">✓</span>}
                    </div>
                    {cat}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border px-3 py-2 flex justify-between items-center bg-secondary/20">
              <span className="text-xs text-muted-foreground">{selected.length}/3 selected</span>
              <button type="button" onMouseDown={e => { e.preventDefault(); setOpen(false); }} className="text-xs text-primary font-medium hover:underline">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookDetailsStep({ data, onChange, errors, onNext }) {
  const [keywordInput, setKeywordInput] = useState('');
  const [newContributor, setNewContributor] = useState({ name: '', role: '' });

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

  return (
    <div className="space-y-5">
      {/* Step header */}
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Book Details</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Metadata that appears on your book's product page</p>
      </div>

      {/* ── 1. BOOK IDENTITY ── */}
      <Section icon={BookOpen} title="Book Identity" subtitle="Title, author, and series information">

        <div className="mb-4">
          <FieldLabel label="Language" required />
          <Select value={data.language || ''} onValueChange={(v) => onChange({ language: v })}>
            <SelectTrigger className={cn('bg-background', errors.language && 'border-destructive')}>
              <SelectValue placeholder="Select language…" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <ErrorMsg msg={errors.language} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel label="Book Title" required />
            <Input
              value={data.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Enter your book title"
              className={cn('bg-background', errors.title && 'border-destructive')}
            />
            <ErrorMsg msg={errors.title} />
          </div>
          <div>
            <FieldLabel label="Subtitle (Optional)" />
            <Input
              value={data.subtitle || ''}
              onChange={(e) => onChange({ subtitle: e.target.value })}
              placeholder="Enter subtitle"
              className="bg-background"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel label="Series Name (Optional)" hint="If this book is part of a series" />
            <Input
              value={data.series_name || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ series_name: val, ...(val === '' ? { series_number: '', series_books: [] } : {}) });
              }}
              placeholder="Series name"
              className="bg-background"
            />
            {data.series_name && (
              <SeriesDetails data={data} onChange={onChange} />
            )}
          </div>
          <div>
            <FieldLabel label="Edition (Optional)" hint="Leave blank for first edition" />
            <Input
              value={data.edition_number || ''}
              onChange={(e) => onChange({ edition_number: e.target.value })}
              placeholder="e.g. 2nd Edition"
              className="bg-background"
            />
          </div>
        </div>

        <div className="mb-4">
          <FieldLabel
            label="Author Name"
            required
            hint="Pen names are allowed. Include middle names or prefixes in the first name field."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={data.author_first_name || ''}
              onChange={(e) => {
                const first = e.target.value;
                const last = data.author_last_name || '';
                onChange({ author_first_name: first, author_name: `${first} ${last}`.trim() });
              }}
              placeholder="First name"
              className={cn('bg-background', errors.author_name && 'border-destructive')}
            />
            <Input
              value={data.author_last_name || ''}
              onChange={(e) => {
                const last = e.target.value;
                const first = data.author_first_name || '';
                onChange({ author_last_name: last, author_name: `${first} ${last}`.trim() });
              }}
              placeholder="Last name"
              className={cn('bg-background', errors.author_name && 'border-destructive')}
            />
          </div>
          <ErrorMsg msg={errors.author_name} />
        </div>

        <div>
          <FieldLabel label="Additional Contributors (Optional)" hint="Editors, illustrators, translators, etc." />
          {(data.contributors || []).length > 0 && (
            <div className="space-y-2 mb-3">
              {data.contributors.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary/60 rounded-lg px-3 py-2 border border-border">
                  <span className="text-sm flex-1 font-medium">{c.name}</span>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">{c.role}</Badge>
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
              placeholder="Full Name"
              className="flex-1 bg-background"
            />
            <Select value={newContributor.role} onValueChange={(v) => setNewContributor({ ...newContributor, role: v })}>
              <SelectTrigger className="w-36 bg-background">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {CONTRIBUTOR_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
      <Section icon={Tag} title="Description & Keywords" subtitle="Helps readers find and decide on your book">
        <div className="mb-5">
          <FieldLabel label="Book Description" required hint="50–4,000 characters. This appears on your book's product page." />
          <Textarea
            value={data.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Write a compelling description that hooks readers…"
            className={cn('min-h-[160px] bg-background resize-none', errors.description && 'border-destructive')}
            maxLength={4000}
          />
          <div className="flex justify-between items-center mt-1.5 gap-2">
            <div className="flex-1">
              <ErrorMsg msg={errors.description} />
              {(data.description || '').length > 0 && (data.description || '').length < 50 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {50 - (data.description || '').length} more characters needed
                </p>
              )}
            </div>
            <span className={cn('text-xs shrink-0 tabular-nums', (data.description || '').length > 3800 ? 'text-destructive font-medium' : 'text-muted-foreground')}>
              {(data.description || '').length.toLocaleString()} / 4,000
            </span>
          </div>
        </div>

        <div>
          <FieldLabel label="Search Keywords" required hint="Up to 7 keywords that help readers discover your book." />
          {errors.keywords && <ErrorMsg msg={errors.keywords} />}
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
          {(data.keywords || []).length < 7 ? (
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Type a keyword and press Enter"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                className="flex-1 bg-background"
              />
              <Button type="button" variant="outline" onClick={addKeyword} disabled={!keywordInput.trim()}
                className="border-primary/30 hover:bg-primary/10 hover:text-primary">
                Add
              </Button>
            </div>
          ) : (
            <p className="text-xs text-primary font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 7/7 keywords added
            </p>
          )}
          {(data.keywords || []).length > 0 && (data.keywords || []).length < 7 && (
            <p className="text-xs text-muted-foreground mt-1">{(data.keywords || []).length}/7 added</p>
          )}
        </div>
      </Section>

      {/* ── 3. CATEGORIES ── */}
      <Section icon={Tag} title={<>Browse Categories <span className="text-destructive">*</span></>} subtitle="Select up to 3 categories — readers browse these to find your book">
        <CategoryPicker
          selected={data.categories || []}
          onChange={(cats) => onChange({ categories: cats })}
          error={errors.categories}
        />
      </Section>

      {/* ── 4. PRIMARY AUDIENCE ── */}
      <Section icon={Users} title="Audience" subtitle="Content rating and target age group">

        <div className="mb-5">
          <p className="text-sm font-medium text-foreground mb-1">Sexually Explicit Content</p>
          <p className="text-xs text-muted-foreground mb-3">
            Does this book's cover, title, or interior contain sexually explicit material?
          </p>
          <RadioGroup
            value={data.sexually_explicit ? 'yes' : 'no'}
            onValueChange={(v) => onChange({ sexually_explicit: v === 'yes' })}
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
          {data.sexually_explicit && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Explicit content has restricted distribution and may not be available in all territories.
              </p>
            </div>
          )}
        </div>

        <Separator className="mb-5" />

        <div>
          <p className="text-sm font-medium text-foreground mb-0.5">Reading Age <span className="text-muted-foreground font-normal">(Optional)</span></p>
          <p className="text-xs text-muted-foreground mb-3">Recommended for children's and young adult books.</p>
          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div>
              <FieldLabel label="Min Age" />
              <Select value={data.reading_age_min || ''} onValueChange={(v) => onChange({ reading_age_min: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {READING_AGES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel label="Max Age" />
              <Select value={data.reading_age_max || ''} onValueChange={(v) => onChange({ reading_age_max: v })}>
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

      {/* ── 5. RELEASE ── */}
      <Section icon={Clock} title="Release" subtitle="Choose when your book becomes available">
        <RadioGroup
          value={data.preorder_type || 'release_now'}
          onValueChange={(v) => onChange({ preorder_type: v, preorder_date: v === 'release_now' ? '' : data.preorder_date })}
          className="space-y-3"
        >
          <label className={cn(
            'flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
            (data.preorder_type || 'release_now') === 'release_now'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="release_now" className="mt-0.5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Release now</p>
              <p className="text-xs text-muted-foreground mt-0.5">Goes live within 72 hours of submission. Edits are locked during review.</p>
            </div>
          </label>

          <label className={cn(
            'flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
            data.preorder_type === 'preorder'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="preorder" className="mt-0.5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Make available for pre-order</p>
              <p className="text-xs text-muted-foreground mt-0.5">Readers can purchase before launch. Pre-orders count toward your sales rank.</p>
              {data.preorder_type === 'preorder' && (
                <div className="mt-4 pt-3 border-t border-primary/15">
                  <FieldLabel label="Pre-order Release Date" required />
                  <Input
                    type="date"
                    value={data.preorder_date || ''}
                    onChange={(e) => onChange({ preorder_date: e.target.value })}
                    min={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="bg-background max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Must be at least 10 days from today to allow listing setup time.</p>
                  {data.preorder_date && (
                    <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Scheduled for {new Date(data.preorder_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </label>
        </RadioGroup>
      </Section>

      <ValidationSummary errors={errors} />
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" className="gap-2 h-10 text-sm font-medium text-foreground">
          💾 Save as Draft
        </Button>
        <Button onClick={onNext} className="gap-2 h-10 px-8 text-sm font-medium">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}