import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, ChevronRight, DollarSign, Globe, Info,
  Percent, AlertCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ── Policy constants (change these to update platform rules) ──────────────
const SELECT_MIN_PRICE_FREE = 1.99;   // minimum price after free promotion ends
const SELECT_FREE_DAYS = 3;           // number of free days per enrollment period
const SELECT_ENROLLMENT_DAYS = 60;    // enrollment window in days

const AUTHOR_ROYALTY = 70;   // % paid to the author
const PLATFORM_CUT   = 30;   // % kept by Classpedia
const PRICE_MIN = 1.99;
const PRICE_MAX = 199.99;
// ─────────────────────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

const InfoBox = ({ children }) => (
  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mt-3">
    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
    <p className="text-xs text-blue-700 leading-relaxed">{children}</p>
  </div>
);

export default function PricingStep({ data, onChange, errors, onNext, onBack }) {
  const [selectExpanded, setSelectExpanded] = useState(false);

  const price = parseFloat(data.list_price) || 0;
  const authorEarning = price * (AUTHOR_ROYALTY / 100);
  const priceRange = `$${PRICE_MIN.toFixed(2)}–$${PRICE_MAX.toFixed(2)}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif text-foreground">Pricing, Royalty & Distribution</h2>
          <p className="text-sm text-muted-foreground">Set your eBook price, royalty plan, and distribution rights</p>
        </div>
      </div>

      {/* ── 1. Classpedia Select Enrollment ── */}
      <Section title="Classpedia Select Enrollment">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Reach more readers. Maximize your sales potential.</span>
          {' '}<span className="text-xs text-muted-foreground">(Optional)</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Classpedia Select is a free, {SELECT_ENROLLMENT_DAYS}-day program for eBooks. It allows you to run
          promotions — including making your book free for up to{' '}
          <span className="font-medium text-foreground">{SELECT_FREE_DAYS} days</span> every{' '}
          {SELECT_ENROLLMENT_DAYS} days — and participate in programs like Classpedia Unlimited.
        </p>

        <button
          onClick={() => setSelectExpanded(!selectExpanded)}
          className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
        >
          Rules and requirements {selectExpanded ? '▲' : '▼'}
        </button>

        {selectExpanded && (
          <div className="mt-3 bg-secondary/40 rounded-lg px-4 py-3 text-xs text-muted-foreground space-y-1.5 border border-border">
            <p>• Your eBook must be exclusive to Classpedia during the {SELECT_ENROLLMENT_DAYS}-day enrollment period.</p>
            <p>• You may offer your eBook for free for up to <strong>{SELECT_FREE_DAYS} days</strong> per {SELECT_ENROLLMENT_DAYS}-day period.</p>
            <p>• After a free promotion, the minimum list price is <strong>${SELECT_MIN_PRICE_FREE.toFixed(2)}</strong>.</p>
            <p>• Enrollment auto-renews unless you opt out before the period ends.</p>
            <p>• You retain copyright of your work at all times.</p>
          </div>
        )}

        <div className="mt-4">
          <label className={cn(
            'flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
            data.classpedia_select ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <Checkbox
              checked={!!data.classpedia_select}
              onCheckedChange={(v) => onChange({ classpedia_select: !!v })}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Enroll this book in Classpedia Select
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SELECT_ENROLLMENT_DAYS}-day exclusive enrollment · Up to {SELECT_FREE_DAYS} free-promotion days · Min. price ${SELECT_MIN_PRICE_FREE.toFixed(2)} after free period
              </p>
            </div>
          </label>
        </div>

        {data.classpedia_select && (
          <InfoBox>
            By enrolling, you confirm this eBook will be exclusive to Classpedia for {SELECT_ENROLLMENT_DAYS} days.
            You can run up to {SELECT_FREE_DAYS} free-promotion days per enrollment window.
            Visit the Promotions page to manage your Classpedia Select promotions.
          </InfoBox>
        )}
      </Section>

      {/* ── 2. Territories ── */}
      <Section title="Territories">
        <p className="text-sm text-muted-foreground mb-4">
          Select the territories where you have rights to sell this book. This determines where your eBook will be available for sale.
        </p>
        <RadioGroup
          value={data.territories || 'worldwide'}
          onValueChange={(v) => onChange({ territories: v })}
          className="space-y-2"
        >
          <label className={cn(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            (data.territories || 'worldwide') === 'worldwide' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="worldwide" />
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                All territories (worldwide rights)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Distribute your eBook everywhere Classpedia operates</p>
            </div>
          </label>
          <label className={cn(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            data.territories === 'specific' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="specific" />
            <div>
              <p className="text-sm font-medium text-foreground">Individual territories</p>
              <p className="text-xs text-muted-foreground mt-0.5">Choose specific countries where you hold distribution rights</p>
            </div>
          </label>
        </RadioGroup>
      </Section>

      {/* ── 3. Pricing, Royalty & Distribution ── */}
      <Section title="Pricing, Royalty & Distribution">
        {/* Fixed royalty info */}
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-5">
          <Percent className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-foreground">
            Authors earn <span className="font-semibold text-primary">{AUTHOR_ROYALTY}%</span> royalty on every sale.
            Classpedia retains <span className="font-semibold">{PLATFORM_CUT}%</span> to cover platform, distribution, and support costs.
          </p>
        </div>

        <Separator className="mb-5" />

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b">
                <th className="text-left pb-2 font-medium">Marketplace</th>
                <th className="text-left pb-2 font-medium">List Price</th>
                <th className="text-left pb-2 font-medium hidden sm:table-cell">Rate</th>
                <th className="text-left pb-2 font-medium">Your Royalty</th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-top">
                <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">
                  classpedia.ai
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      value={data.list_price || ''}
                      onChange={(e) => onChange({ list_price: e.target.value ? parseFloat(e.target.value) : '' })}
                      placeholder="0.00"
                      className={cn('w-24', errors.list_price ? 'border-destructive' : '')}
                    />
                    <span className="text-xs text-muted-foreground">USD</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set a price between {priceRange}
                  </p>
                  {errors.list_price && (
                    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.list_price}
                    </p>
                  )}
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {AUTHOR_ROYALTY}%
                  </span>
                </td>
                <td className="py-3 font-semibold text-foreground">
                  {price > 0 ? `$${authorEarning.toFixed(2)}` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Royalty summary callout */}
        {price > 0 && (
          <div className="mt-4 bg-accent/60 rounded-xl p-4 border border-primary/10 flex flex-wrap gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">List Price</p>
              <p className="text-base font-semibold mt-0.5">${price.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Your Royalty ({AUTHOR_ROYALTY}%)</p>
              <p className="text-base font-semibold mt-0.5 text-primary">${authorEarning.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Classpedia Fee ({PLATFORM_CUT}%)</p>
              <p className="text-base font-semibold mt-0.5">${(price - authorEarning).toFixed(2)}</p>
            </div>
          </div>
        )}
      </Section>

      {/* ── 4. Terms & Conditions ── */}
      <Section title="Terms & Conditions">
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          It can take up to 72 hours for your title to be available for purchase on Classpedia.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By clicking <span className="font-medium text-foreground">Publish</span> below, I confirm that I agree to
          and am in compliance with the{' '}
          <span className="text-primary cursor-pointer hover:underline">Classpedia Terms and Conditions</span>{' '}
          and that I have all rights necessary to make the content I am uploading available for marketing,
          distribution and sale in each territory I have indicated above.
        </p>
      </Section>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}