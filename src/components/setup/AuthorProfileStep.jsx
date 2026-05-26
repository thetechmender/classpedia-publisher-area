import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, Globe, Twitter, Instagram, Facebook, Linkedin, Youtube, Tag, Search, X, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOOK_CATEGORIES = [
  'Arts & Photography', 'Biographies & Memoirs', 'Business & Money',
  'Children\'s Books', 'Comics & Graphic Novels', 'Computers & Technology',
  'Cookbooks, Food & Wine', 'Crafts, Hobbies & Home', 'Education & Teaching',
  'Engineering & Transportation', 'Health, Fitness & Dieting', 'History',
  'Humor & Entertainment', 'Law', 'LGBTQ+', 'Literature & Fiction',
  'Medical Books', 'Mystery, Thriller & Suspense', 'Parenting & Relationships',
  'Politics & Social Sciences', 'Reference', 'Religion & Spirituality',
  'Romance', 'Science & Math', 'Science Fiction & Fantasy', 'Self-Help',
  'Sports & Outdoors', 'Teen & Young Adult', 'Travel',
];

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

function CategoryPicker({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [customInput, setCustomInput] = useState('');

  // Prevent duplicate categories
  const uniqueSelected = [...new Set(selected)];
  const containerRef = useRef(null);
  const atMax = selected.length >= 3;

  const filtered = query.trim()
    ? BOOK_CATEGORIES.filter(c => c.toLowerCase().includes(query.toLowerCase()) && !selected.includes(c))
    : BOOK_CATEGORIES.filter(c => !selected.includes(c));

  const showAddCustom = query.trim() &&
    !BOOK_CATEGORIES.some(c => c.toLowerCase() === query.toLowerCase()) &&
    !selected.some(c => c.toLowerCase() === query.toLowerCase());

  const add = (cat) => {
    if (!atMax && !selected.includes(cat)) {
      const next = [...selected, cat];
      onChange(next);
      setQuery('');
      // keep open unless now at max
      if (next.length >= 3) setOpen(false);
    }
  };

  const remove = (cat) => onChange(selected.filter(c => c !== cat));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected chips */}
      {uniqueSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uniqueSelected.map(cat => (
            <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/25">
              {cat}
              <button type="button" onClick={() => remove(cat)} className="hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
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
                    key={cat}
                    type="button"
                    onMouseDown={e => { e.preventDefault(); add(cat); }}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {cat}
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

export default function AuthorProfileStep({ data, onChange, errors, onSubmit = undefined, onNext, onBack, saving = false }) {
  const bioLen = (data.bio || '').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">Your Author Profile</h2>
          <p className="text-sm text-muted-foreground">This is what readers will see on your book pages</p>
        </div>
      </div>

      {/* Bio */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Author Biography</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Write in third person. This helps readers connect with you.</p>
        </div>
        <div className="px-5 py-5 space-y-3">
          <Textarea
            value={data.bio || ''}
            onChange={e => onChange({ bio: e.target.value })}
            placeholder="e.g., Jane Smith is an award-winning author of mystery novels. She lives in Portland, Oregon with her two cats and a very old typewriter..."
            className={cn('min-h-[140px] resize-none', errors.bio ? 'border-destructive' : '')}
            maxLength={2000}
          />
          <div className="flex justify-between">
            <FieldError msg={errors.bio} />
            <p className={cn('text-xs ml-auto', bioLen > 1800 ? 'text-destructive' : 'text-muted-foreground')}>
              {bioLen} / 2000
            </p>
          </div>


        </div>
      </div>

      {/* Preferred Categories */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" /> Preferred Categories
              <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Up to 3 genres you primarily write in</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {[0, 1, 2].map(i => (
              <div key={i} className={cn('w-2 h-2 rounded-full transition-all duration-200', i < (data.preferredCategories || []).length ? 'bg-primary' : 'bg-border')} />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{(data.preferredCategories || []).length}/3</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <CategoryPicker
            selected={data.preferredCategories || []}
            onChange={cats => onChange({ preferredCategories: cats })}
          />
        </div>
      </div>

      {/* Online Presence */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Online Presence <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span></h3>
          <p className="text-xs text-muted-foreground mt-0.5">Help readers find you across the web</p>
        </div>
        <div className="px-5 py-5 space-y-3">

          {/* Website — full width */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              type="url"
              value={data.website || ''}
              onChange={e => onChange({ website: e.target.value })}
              placeholder="Your website (https://...)"
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
            />
          </div>

          {/* Social grid — 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Twitter className="w-4 h-4 text-[#1DA1F2] shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0">x.com/</span>
              <Input
                value={data.twitterHandle || ''}
                onChange={e => onChange({ twitterHandle: e.target.value.replace(/^@/, '') })}
                placeholder="username"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Instagram className="w-4 h-4 text-[#E1306C] shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0">instagram.com/</span>
              <Input
                value={data.instagramHandle || ''}
                onChange={e => onChange({ instagramHandle: e.target.value.replace(/^@/, '') })}
                placeholder="username"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
              <Input
                type="url"
                value={data.facebookUrl || ''}
                onChange={e => onChange({ facebookUrl: e.target.value })}
                placeholder="facebook.com/yourpage"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
              <Input
                type="url"
                value={data.linkedinUrl || ''}
                onChange={e => onChange({ linkedinUrl: e.target.value })}
                placeholder="linkedin.com/in/yourprofile"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 sm:col-span-2">
              <Youtube className="w-4 h-4 text-[#FF0000] shrink-0" />
              <Input
                type="url"
                value={data.youtubeUrl || ''}
                onChange={e => onChange({ youtubeUrl: e.target.value })}
                placeholder="youtube.com/@yourchannel"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {onNext ? (
          <Button onClick={onNext} disabled={saving} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20">
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <>Save & Continue <ChevronRight className="w-4 h-4" /></>
            )}
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={saving}
            className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20"
          >
            {saving ? 'Setting up your account…' : 'Complete Setup & Go to Dashboard'}
          </Button>
        )}
      </div>
    </div>
  );
}