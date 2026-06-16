import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, Globe, Instagram, Facebook, Linkedin, Youtube, Tag, Search, X, Plus, ChevronDown, Camera, Loader2, User } from 'lucide-react';

const XIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

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
  const containerRef = useRef(null);
  const atMax = selected.length >= 3;

  const filtered = query.trim()
    ? BOOK_CATEGORIES.filter(c => c.toLowerCase().includes(query.toLowerCase()) && !selected.includes(c))
    : BOOK_CATEGORIES.filter(c => !selected.includes(c));

  const showAddCustom = query.trim() &&
    !BOOK_CATEGORIES.some(c => c.toLowerCase() === query.toLowerCase()) &&
    !selected.some(c => c.toLowerCase() === query.toLowerCase());

  const toggle = (cat) => {
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else if (!atMax) {
      onChange([...selected, cat]);
    }
  };

  const remove = (cat) => onChange(selected.filter(c => c !== cat));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allFiltered = query.trim()
    ? BOOK_CATEGORIES.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : BOOK_CATEGORIES;

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Trigger button */}
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
            {/* Search inside dropdown */}
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
                Maximum 3 selected. Uncheck one to change.
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

export default function AuthorProfileStep({ data, onChange, errors, onSubmit, onNext, onBack, saving }) {
  const bioLen = (data.author_bio || '').length;
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange({ profile_photo_url: file_url });
    setUploadingPhoto(false);
  };

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

      {/* Profile Photo */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Profile Photo <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span></h3>
          <p className="text-xs text-muted-foreground mt-0.5">A clear headshot helps readers recognize you</p>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center gap-5">
            {/* Avatar preview */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-secondary flex items-center justify-center">
                {data.profile_photo_url
                  ? <img src={data.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-muted-foreground" />
                }
              </div>
              {data.profile_photo_url && (
                <button
                  type="button"
                  onClick={() => onChange({ profile_photo_url: '' })}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Upload button */}
            <div className="space-y-2">
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingPhoto}
                onClick={() => photoInputRef.current?.click()}
                className="gap-2 h-9"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploadingPhoto ? 'Uploading…' : data.profile_photo_url ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5MB</p>
            </div>
          </div>
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
            value={data.author_bio || ''}
            onChange={e => onChange({ author_bio: e.target.value })}
            placeholder="e.g., Jane Smith is an award-winning author of mystery novels. She lives in Portland, Oregon with her two cats and a very old typewriter..."
            className={cn('min-h-[140px] resize-none', errors.author_bio ? 'border-destructive' : '')}
            maxLength={2000}
          />
          <div className="flex justify-between">
            <FieldError msg={errors.author_bio} />
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
              <div key={i} className={cn('w-2 h-2 rounded-full transition-all duration-200', i < (data.preferred_categories || []).length ? 'bg-primary' : 'bg-border')} />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{(data.preferred_categories || []).length}/3</span>
          </div>
        </div>
        <div className="px-5 py-4">
          <CategoryPicker
            selected={data.preferred_categories || []}
            onChange={cats => onChange({ preferred_categories: cats })}
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
              <XIcon />
              <span className="text-xs text-muted-foreground shrink-0">x.com/</span>
              <Input
                value={data.twitter_handle || ''}
                onChange={e => onChange({ twitter_handle: e.target.value.replace(/^@/, '') })}
                placeholder="username"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Instagram className="w-4 h-4 text-[#E1306C] shrink-0" />
              <span className="text-xs text-muted-foreground shrink-0">instagram.com/</span>
              <Input
                value={data.instagram_handle || ''}
                onChange={e => onChange({ instagram_handle: e.target.value.replace(/^@/, '') })}
                placeholder="username"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
              <Input
                type="url"
                value={data.facebook_url || ''}
                onChange={e => onChange({ facebook_url: e.target.value })}
                placeholder="facebook.com/yourpage"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
              <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
              <Input
                type="url"
                value={data.linkedin_url || ''}
                onChange={e => onChange({ linkedin_url: e.target.value })}
                placeholder="linkedin.com/in/yourprofile"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 sm:col-span-2">
              <Youtube className="w-4 h-4 text-[#FF0000] shrink-0" />
              <Input
                type="url"
                value={data.youtube_url || ''}
                onChange={e => onChange({ youtube_url: e.target.value })}
                placeholder="youtube.com/@yourchannel"
                className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 shadow-none"
              />
            </div>

          </div>
        </div>
      </div>

      <div className="flex justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" className="gap-2 text-foreground">
            💾 Save as Draft
          </Button>
        </div>
        {onNext ? (
          <Button onClick={onNext} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20">
            Save & Continue <ChevronRight className="w-4 h-4" />
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