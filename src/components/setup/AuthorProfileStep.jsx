import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Sparkles, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

export default function AuthorProfileStep({ data, onChange, errors, onSubmit, onBack, saving }) {
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

      {/* Pen Name */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Author Name</h3>
          <p className="text-xs text-muted-foreground mt-0.5">The name that will appear on your book covers and listings</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Pen Name / Author Name <span className="text-destructive">*</span></Label>
            <Input
              value={data.pen_name || ''}
              onChange={e => onChange({ pen_name: e.target.value })}
              placeholder="e.g., J.K. Rowling or your real name"
              className={errors.pen_name ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground mt-1">This can be different from your legal name. You can use a pen name.</p>
            <FieldError msg={errors.pen_name} />
          </div>
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

      {/* Website */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Online Presence <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span></h3>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Author Website</Label>
            <Input
              type="url"
              value={data.website || ''}
              onChange={e => onChange({ website: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
            <p className="text-xs text-muted-foreground mt-1">Shown on your author page to help readers find you.</p>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm font-semibold text-foreground mb-2">🎉 Almost there!</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Once you complete your profile, you'll be taken to your Author Dashboard where you can start publishing your first eBook.
          You can update your profile information at any time.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={saving}
          className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20"
        >
          {saving ? 'Setting up your account…' : 'Complete Setup & Go to Dashboard'}
        </Button>
      </div>
    </div>
  );
}