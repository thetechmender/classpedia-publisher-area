import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Sparkles, AlertCircle, Globe, Twitter, Instagram, Facebook, Linkedin, Youtube, Tag } from 'lucide-react';
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

export default function AuthorProfileStep({ data, onChange, errors, onSubmit, onNext, onBack, saving }) {
  const bioLen = (data.author_bio || '').length;

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
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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

          {/* Bio tips */}
          <div className="bg-secondary/30 rounded-lg p-3 border border-border">
            <p className="text-xs font-medium text-foreground mb-2">Tips for a great bio:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Write in third person ("She is..." not "I am...")</li>
              <li>• Mention your writing background or expertise</li>
              <li>• Keep it concise — 100–300 words works best</li>
              <li>• You can add personal details to make it relatable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preferred Categories */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Tag className="w-4 h-4 text-muted-foreground" /> Preferred Categories <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span></h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select up to 3 genres you primarily write in — helps us tailor your experience</p>
        </div>
        <div className="px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {BOOK_CATEGORIES.map((cat) => {
              const selected = (data.preferred_categories || []).includes(cat);
              const atMax = (data.preferred_categories || []).length >= 3;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const current = data.preferred_categories || [];
                    if (selected) {
                      onChange({ preferred_categories: current.filter(c => c !== cat) });
                    } else if (!atMax) {
                      onChange({ preferred_categories: [...current, cat] });
                    }
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : atMax
                        ? 'bg-secondary/30 text-muted-foreground border-border cursor-not-allowed opacity-50'
                        : 'bg-background text-foreground border-border hover:border-primary hover:text-primary'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          {(data.preferred_categories || []).length > 0 && (
            <p className="text-xs text-muted-foreground mt-3">{(data.preferred_categories || []).length} / 3 selected</p>
          )}
        </div>
      </div>

      {/* Online Presence */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
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