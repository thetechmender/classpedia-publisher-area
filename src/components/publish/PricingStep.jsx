import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft, ChevronRight, DollarSign, Globe, Info,
  AlertCircle, X, Search } from 'lucide-react';
import ValidationSummary from '@/components/shared/ValidationSummary';
import { cn } from '@/lib/utils';

const PRICE_MIN = 1.99;
const PRICE_MAX = 49.99;
const AUTHOR_ROYALTY = 70;
const PLATFORM_CUT = 30;
const SELECT_MIN_PRICE_FREE = 1.99;
const SELECT_FREE_DAYS = 3;
const SELECT_ENROLLMENT_DAYS = 60;

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
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Zimbabwe'
];

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className="rounded-xl border border-border bg-card">
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-foreground leading-none">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

function TerritoryPicker({ selected = [], onChange }) {
  const [search, setSearch] = useState('');
  const filtered = COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const toggle = (country) => {
    if (selected.includes(country)) onChange(selected.filter(c => c !== country));
    else onChange([...selected, country]);
  };

  return (
    <div className="mt-4 rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/30 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search countries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button onClick={() => onChange([...COUNTRIES])} className="text-xs text-primary hover:underline shrink-0">All</button>
        <span className="text-muted-foreground text-xs">·</span>
        <button onClick={() => onChange([])} className="text-xs text-muted-foreground hover:underline shrink-0">None</button>
      </div>
      <div className="max-h-52 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
        {filtered.map(country => (
          <button key={country} onClick={() => toggle(country)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors',
              selected.includes(country) ? 'bg-primary/8 text-primary font-medium' : 'bg-card text-foreground hover:bg-secondary/60'
            )}>
            <div className={cn('w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center',
              selected.includes(country) ? 'bg-primary border-primary' : 'border-border')}>
              {selected.includes(country) && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {country}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 px-4 py-6 text-center text-xs text-muted-foreground bg-card">No countries found</div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="px-3 py-2.5 border-t border-border bg-card flex flex-wrap gap-1.5">
          {selected.map(c => (
            <span key={c} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-medium rounded-full px-2 py-0.5">
              {c}
              <button onClick={() => toggle(c)} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="px-3 py-2 border-t border-border bg-secondary/20">
        <p className="text-xs text-muted-foreground">
          {selected.length === 0 ? 'No countries selected' : `${selected.length} ${selected.length === 1 ? 'country' : 'countries'} selected`}
        </p>
      </div>
    </div>
  );
}

export default function PricingStep({ data, onChange, errors, onNext, onBack }) {
  const [selectExpanded, setSelectExpanded] = useState(false);

  const price = parseFloat(data.list_price) || 0;
  const authorEarning = price * (AUTHOR_ROYALTY / 100);

  return (
    <div className="space-y-5">
      {/* Step header */}
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">Pricing & Distribution</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Set your price, royalty plan, and where your book will be sold</p>
      </div>

      {/* ── 1. Classpedia Select ── */}
      <Section icon={DollarSign} title="Classpedia Select" subtitle={`Free ${SELECT_ENROLLMENT_DAYS}-day exclusive program with promotional tools`}>
        <div className="flex gap-3 mb-4">
          {[
            { value: true,  label: 'Yes, enroll me',   desc: `Exclusive to Classpedia for ${SELECT_ENROLLMENT_DAYS} days` },
            { value: false, label: 'No, skip for now', desc: 'You can enroll later from your dashboard' },
          ].map(opt => {
            const selected = !!data.classpedia_select === opt.value;
            return (
              <button key={String(opt.value)} type="button"
                onClick={() => onChange({ classpedia_select: opt.value })}
                className={cn(
                  'flex-1 flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all',
                  selected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/30'
                )}>
                <div className={cn('w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center shrink-0 transition-colors',
                  selected ? 'border-primary' : 'border-muted-foreground/40')}>
                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectExpanded(!selectExpanded)}
          className="text-xs text-primary hover:underline flex items-center gap-1">
          Program rules & requirements {selectExpanded ? '▲' : '▼'}
        </button>
        {selectExpanded && (
          <div className="mt-3 bg-secondary/40 rounded-lg px-4 py-3 text-xs text-muted-foreground space-y-1.5 border border-border">
            <p>• Exclusive to Classpedia for the {SELECT_ENROLLMENT_DAYS}-day enrollment period.</p>
            <p>• Offer your eBook free for up to <strong>{SELECT_FREE_DAYS} days</strong> per {SELECT_ENROLLMENT_DAYS}-day window.</p>
            <p>• Minimum list price after a free promotion: <strong>${SELECT_MIN_PRICE_FREE.toFixed(2)}</strong>.</p>
            <p>• Enrollment auto-renews unless you opt out before the period ends.</p>
            <p>• You retain copyright at all times.</p>
          </div>
        )}

        {data.classpedia_select && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mt-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              By enrolling, you confirm this eBook will be exclusive to Classpedia for {SELECT_ENROLLMENT_DAYS} days and you can run up to {SELECT_FREE_DAYS} free-promotion days per window.
            </p>
          </div>
        )}
      </Section>

      {/* ── 2. Territories ── */}
      <Section icon={Globe} title="Distribution Territories" subtitle="Select the territories where you hold rights to sell this book">
        <RadioGroup
          value={data.territories || 'worldwide'}
          onValueChange={(v) => onChange({ territories: v, selected_countries: v === 'worldwide' ? [] : data.selected_countries || [] })}
          className="space-y-2">
          <label className={cn('flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            (data.territories || 'worldwide') === 'worldwide' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
            <RadioGroupItem value="worldwide" />
            <div>
              <p className="text-sm font-medium text-foreground">All territories (worldwide)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Distribute everywhere Classpedia operates</p>
            </div>
          </label>
          <label className={cn('flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            data.territories === 'specific' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40')}>
            <RadioGroupItem value="specific" />
            <div>
              <p className="text-sm font-medium text-foreground">Specific territories only</p>
              <p className="text-xs text-muted-foreground mt-0.5">Choose countries where you hold distribution rights</p>
            </div>
          </label>
        </RadioGroup>

        {data.territories === 'specific' && (
          <TerritoryPicker
            selected={data.selected_countries || []}
            onChange={(countries) => onChange({ selected_countries: countries })} />
        )}
      </Section>

      {/* ── 3. Pricing & Royalty ── */}
      <Section icon={DollarSign} title="Pricing & Royalty" subtitle="Set your list price — you earn 70% of every sale">

        {/* Royalty split visual */}
        <div className="rounded-xl border border-border bg-secondary/20 px-5 py-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-primary shrink-0" />
              <span className="text-sm font-semibold text-foreground">{AUTHOR_ROYALTY}% — Your Royalty</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-border shrink-0" />
              <span className="text-sm text-muted-foreground">{PLATFORM_CUT}% — Classpedia Fee</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-3 rounded-full bg-border overflow-hidden flex">
            <div className="bg-primary h-full rounded-l-full" style={{ width: `${AUTHOR_ROYALTY}%` }} />
            <div className="bg-secondary h-full rounded-r-full flex-1" />
          </div>
          <p className="text-xs text-muted-foreground">Fixed split — no hidden fees or per-sale delivery charges</p>
        </div>

        {/* Price input */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">
              List Price <span className="text-destructive">*</span>
            </p>
            <span className="text-xs text-muted-foreground">${PRICE_MIN.toFixed(2)} – ${PRICE_MAX.toFixed(2)} USD</span>
          </div>
          <div className="flex items-center gap-2 max-w-xs">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
              <Input
                type="number"
                step="0.01"
                min={PRICE_MIN}
                max={PRICE_MAX}
                value={data.list_price || ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '' || raw === '.') { onChange({ list_price: '' }); return; }
                  const v = parseFloat(raw);
                  if (!isNaN(v)) onChange({ list_price: Math.min(Math.max(v, PRICE_MIN), PRICE_MAX) });
                }}
                onBlur={(e) => {
                  const v = parseFloat(e.target.value);
                  if (isNaN(v) || v < PRICE_MIN) onChange({ list_price: PRICE_MIN });
                  else if (v > PRICE_MAX) onChange({ list_price: PRICE_MAX });
                }}
                placeholder="0.00"
                className={cn('pl-7', errors.list_price && 'border-destructive')}
              />
            </div>
            <span className="text-sm text-muted-foreground font-medium">USD</span>
          </div>
          {errors.list_price && (
            <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">
              <AlertCircle className="w-3 h-3" /> {errors.list_price}
            </p>
          )}
        </div>

        {price > 0 && (
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-primary/15 bg-accent/40 overflow-hidden">
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">List Price</p>
              <p className="text-xl font-bold text-foreground">${price.toFixed(2)}</p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Your Royalty ({AUTHOR_ROYALTY}%)</p>
              <p className="text-xl font-bold text-primary">${authorEarning.toFixed(2)}</p>
            </div>
            <div className="px-5 py-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Classpedia Fee ({PLATFORM_CUT}%)</p>
              <p className="text-xl font-bold text-muted-foreground">${(price - authorEarning).toFixed(2)}</p>
            </div>
          </div>
        )}
      </Section>

      {/* ── 4. Terms ── */}
      <Section icon={Info} title="Terms & Conditions">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700 leading-relaxed">
            <p className="font-semibold text-blue-800 mb-1">Review process: up to 72 hours</p>
            <p>After submission your book will be reviewed before going live. If it hasn't gone live after 72 hours, contact Classpedia support.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By clicking <span className="font-medium text-foreground">Review & Submit</span>, I confirm I agree to the{' '}
          <span className="text-primary cursor-pointer hover:underline">Classpedia Terms and Conditions</span>{' '}
          and that I hold all rights necessary to distribute this content in the selected territories.
        </p>
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
          Review & Submit <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}