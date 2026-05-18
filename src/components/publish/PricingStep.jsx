import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, ChevronRight, DollarSign, Globe, Info,
  Percent, AlertCircle, X, Search } from
'lucide-react';
import { cn } from '@/lib/utils';

// ── Policy constants ──────────────────────────────────────────────────────────
const SELECT_MIN_PRICE_FREE = 1.99;
const SELECT_FREE_DAYS = 3;
const SELECT_ENROLLMENT_DAYS = 60;
const AUTHOR_ROYALTY = 70;
const PLATFORM_CUT = 30;
const PRICE_MIN = 1.99;
const PRICE_MAX = 199.99;
// ─────────────────────────────────────────────────────────────────────────────

const COUNTRIES = [
'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria',
'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina',
'Brazil', 'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica',
'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador',
'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany',
'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hungary', 'India', 'Indonesia', 'Iran',
'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 'Malta', 'Mexico',
'Morocco', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Norway',
'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
'Romania', 'Russia', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia',
'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
'Taiwan', 'Tanzania', 'Thailand', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Uganda',
'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
'Uzbekistan', 'Venezuela', 'Vietnam', 'Zimbabwe'];


const Section = ({ title, children }) =>
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
    <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>;


const InfoBox = ({ children }) =>
<div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mt-3">
    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
    <p className="text-xs text-blue-700 leading-relaxed">{children}</p>
  </div>;


function TerritoryPicker({ selected = [], onChange }) {
  const [search, setSearch] = useState('');
  const filtered = COUNTRIES.filter((c) =>
  c.toLowerCase().includes(search.toLowerCase())
  );
  const toggle = (country) => {
    if (selected.includes(country)) {
      onChange(selected.filter((c) => c !== country));
    } else {
      onChange([...selected, country]);
    }
  };
  const selectAll = () => onChange([...COUNTRIES]);
  const clearAll = () => onChange([]);

  return (
    <div className="mt-4 rounded-xl border border-border overflow-hidden">
      {/* Search + actions bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/30 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search countries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        
        <button onClick={selectAll} className="text-xs text-primary hover:underline shrink-0">All</button>
        <span className="text-muted-foreground text-xs">·</span>
        <button onClick={clearAll} className="text-xs text-muted-foreground hover:underline shrink-0">None</button>
      </div>

      {/* Country grid */}
      <div className="max-h-52 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
        {filtered.map((country) =>
        <button
          key={country}
          onClick={() => toggle(country)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors',
            selected.includes(country) ?
            'bg-primary/8 text-primary font-medium' :
            'bg-card text-foreground hover:bg-secondary/60'
          )}>
          
            <div className={cn(
            'w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center',
            selected.includes(country) ? 'bg-primary border-primary' : 'border-border'
          )}>
              {selected.includes(country) &&
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
            </div>
            {country}
          </button>
        )}
        {filtered.length === 0 &&
        <div className="col-span-3 px-4 py-6 text-center text-xs text-muted-foreground bg-card">
            No countries found
          </div>
        }
      </div>

      {/* Selected chips */}
      {selected.length > 0 &&
      <div className="px-3 py-2.5 border-t border-border bg-card flex flex-wrap gap-1.5">
          {selected.map((c) =>
        <span key={c} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-medium rounded-full px-2 py-0.5">
              {c}
              <button onClick={() => toggle(c)} className="hover:text-destructive transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
        )}
        </div>
      }

      <div className="px-3 py-2 border-t border-border bg-secondary/20">
        <p className="text-xs text-muted-foreground">
          {selected.length === 0 ?
          'No countries selected' :
          `${selected.length} ${selected.length === 1 ? 'country' : 'countries'} selected`}
        </p>
      </div>
    </div>);

}

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
          <p className="text-sm text-muted-foreground">Set your eBook price and distribution rights</p>
        </div>
      </div>

      {/* ── 1. Classpedia Select ── */}
      <Section title="Classpedia Select Enrollment">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Reach more readers. Maximize your sales potential.</span>
          {' '}<span className="text-xs text-muted-foreground">(Optional)</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Classpedia Select is a free, 60-day program for eBooks. It allows you to run promotions — including making your book free for up to 3 days every 60 days.
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 italic">
          Not sure yet? You can opt into Classpedia Select later from your book's dashboard at any time.
        </p>

        <button
          onClick={() => setSelectExpanded(!selectExpanded)}
          className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
          
          Rules and requirements {selectExpanded ? '▲' : '▼'}
        </button>

        {selectExpanded &&
        <div className="mt-3 bg-secondary/40 rounded-lg px-4 py-3 text-xs text-muted-foreground space-y-1.5 border border-border">
            <p>• Your eBook must be exclusive to Classpedia during the {SELECT_ENROLLMENT_DAYS}-day enrollment period.</p>
            <p>• You may offer your eBook for free for up to <strong>{SELECT_FREE_DAYS} days</strong> per {SELECT_ENROLLMENT_DAYS}-day period.</p>
            <p>• After a free promotion, the minimum list price is <strong>${SELECT_MIN_PRICE_FREE.toFixed(2)}</strong>.</p>
            <p>• Enrollment auto-renews unless you opt out before the period ends.</p>
            <p>• You retain copyright of your work at all times.</p>
          </div>
        }

        <div className="mt-4">
          <label className={cn(
            'flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
            data.classpedia_select ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <Checkbox
              checked={!!data.classpedia_select}
              onCheckedChange={(v) => onChange({ classpedia_select: !!v })}
              className="mt-0.5" />
            
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

        {data.classpedia_select &&
        <InfoBox>
            By enrolling, you confirm this eBook will be exclusive to Classpedia for {SELECT_ENROLLMENT_DAYS} days.
            You can run up to {SELECT_FREE_DAYS} free-promotion days per enrollment window.
          </InfoBox>
        }
      </Section>

      {/* ── 2. Territories ── */}
      <Section title="Territories">
        <p className="text-sm text-muted-foreground mb-4">
          Select the territories where you have rights to sell this book.
        </p>
        <RadioGroup
          value={data.territories || 'worldwide'}
          onValueChange={(v) => onChange({ territories: v, selected_countries: v === 'worldwide' ? [] : data.selected_countries || [] })}
          className="space-y-2">
          
          <label className={cn(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            (data.territories || 'worldwide') === 'worldwide' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="worldwide" />
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                
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

        {data.territories === 'specific' &&
        <TerritoryPicker
          selected={data.selected_countries || []}
          onChange={(countries) => onChange({ selected_countries: countries })} />

        }
      </Section>

      {/* ── 3. Pricing & Royalty ── */}
      <Section title="Pricing & Royalty">
        {/* Royalty split visual */}
        <div className="rounded-xl border border-border overflow-hidden mb-5">
          <div className="flex">
            <div className="flex-1 bg-primary px-4 py-3 text-center" style={{ flex: AUTHOR_ROYALTY }}>
              <p className="text-2xl font-bold text-white">{AUTHOR_ROYALTY}%</p>
              <p className="text-xs text-white/80 font-medium mt-0.5">Your Royalty</p>
            </div>
            <div className="bg-secondary px-4 py-3 text-center" style={{ flex: PLATFORM_CUT }}>
              <p className="text-2xl font-bold text-foreground">{PLATFORM_CUT}%</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Classpedia Fee</p>
            </div>
          </div>
          <div className="px-4 py-2.5 bg-secondary/20 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Fixed revenue split — no hidden fees or per-sale delivery charges
            </p>
          </div>
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
                      className={cn('w-24', errors.list_price ? 'border-destructive' : '')} />
                    
                    <span className="text-xs text-muted-foreground">USD</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set a price between {priceRange}
                  </p>
                  {errors.list_price &&
                  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.list_price}
                    </p>
                  }
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
        {price > 0 &&
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
        }
      </Section>

      {/* ── 4. Terms & Conditions ── */}
      <Section title="Terms & Conditions">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700 space-y-1 leading-relaxed">
            <p className="font-semibold text-blue-800">Review process: up to 72 hours</p>
            <p>After submission, your book will be reviewed before going live. This typically takes <strong>up to 72 hours</strong>. If your book has not gone live after 72 hours, please <span className="font-medium underline cursor-pointer">contact Classpedia support</span> and our team will investigate promptly.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By clicking <span className="font-medium text-foreground">Review & Submit</span> below, I confirm that I agree to
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
          Review & Submit <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>);

}