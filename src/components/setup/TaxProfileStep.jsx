import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Shield, FileText, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil',
  'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark',
  'Egypt', 'Finland', 'France', 'Germany', 'Hungary', 'India', 'Indonesia',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

const FEDERAL_TAX_CLASSIFICATIONS = [
  'Sole Proprietor', 'Single-Member LLC', 'C Corporation', 'S Corporation',
  'Partnership / Multi-Member LLC', 'Trust / Estate',
];

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
  </p>
) : null;

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-secondary/40 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function TaxProfileStep({ data, onChange, errors, onNext, onBack }) {
  const isBusiness = data.tax_classification === 'business';
  const isUSResident = data.us_person === true;
  const isUSResident_notSure = data.us_person === 'not_sure';
  const taxCountry = data.tax_address_country || data.country || 'United States';
  const usingSameAddress = data.tax_use_same_address !== false;
  const hasIdentityAddress = !!(data.address_line1 && data.city);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-semibold text-foreground">Tax Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Required for royalty payments. Failure to provide accurate tax information may result in delayed payments or maximum U.S. tax withholding.
        </p>
      </div>

      {/* Incomplete warning */}
      {!data.tax_certified && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Action required:</span> You must complete your tax profile to receive royalty payments.
          </p>
        </div>
      )}

      {/* ── Get Started: Classification + US Status ── */}
      <SectionCard icon={FileText} title="Get Started" description="Tell us your tax classification and residency status">

        {/* Tax classification toggle */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tax Classification <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'individual', label: 'Individual', desc: 'Includes sole proprietors and single-member LLC owners' },
              { value: 'business', label: 'Business', desc: 'Corporations, partnerships, trusts, or multi-member LLCs' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ tax_classification: opt.value })}
                className={cn(
                  'text-left rounded-xl border-2 px-4 py-3 transition-all',
                  data.tax_classification === opt.value || (!data.tax_classification && opt.value === 'individual')
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Business: federal classification dropdown */}
        {isBusiness && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Federal Tax Classification <span className="text-destructive">*</span></Label>
            <Select value={data.federal_tax_classification || ''} onValueChange={(v) => onChange({ federal_tax_classification: v })}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                {FEDERAL_TAX_CLASSIFICATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.federal_tax_classification} />
          </div>
        )}

        {/* U.S. residency question */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">U.S. Tax Status <span className="text-destructive">*</span></Label>
          <p className="text-xs text-muted-foreground">
            {isBusiness
              ? 'Is this a U.S. resident entity (incorporated or domiciled in the U.S.)?'
              : 'Are you a U.S. citizen, U.S. permanent resident (green card holder), or U.S. resident alien?'}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
              ...(!isBusiness ? [{ value: 'not_sure', label: "Not sure" }] : []),
            ].map(({ value, label }) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => onChange({ us_person: value })}
                className={cn(
                  'px-5 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  data.us_person === value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:border-primary/40'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <FieldError msg={errors.us_person} />
        </div>
      </SectionCard>

      {/* ── Tax Identity + TIN — shown once US status chosen ── */}
      {data.us_person !== undefined && (
        <>
          <SectionCard icon={FileText} title="Tax Identity Information" description="Your name and tax ID as they appear on your tax return">

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Legal Name <span className="text-destructive">*</span></Label>
                <Input
                  value={data.tax_full_name || data.full_name || ''}
                  onChange={(e) => onChange({ tax_full_name: e.target.value })}
                  placeholder="Full legal name as it appears on your tax return"
                  className={cn('max-w-sm', errors.tax_full_name ? 'border-destructive' : '')}
                />
                <p className="text-xs text-primary cursor-pointer hover:underline">Which name should I enter? ▾</p>
                <FieldError msg={errors.tax_full_name} />
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">DBA / Trade Name <span className="font-normal normal-case text-muted-foreground">(optional)</span></Label>
                <Input
                  value={data.dba_name || ''}
                  onChange={(e) => onChange({ dba_name: e.target.value })}
                  placeholder="Doing business as — if different from legal name"
                  className="max-w-sm"
                />
              </div>
            </div>

            {/* US TIN */}
            {(isUSResident || isUSResident_notSure) && (
              <div className="space-y-3 pt-1 border-t border-border">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">U.S. Taxpayer Identification Number (TIN) <span className="text-destructive">*</span></Label>
                <div className="flex items-end gap-3 flex-wrap">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">TIN Type</Label>
                    <Select
                      value={data.tax_id_type || 'ssn'}
                      onValueChange={(v) => onChange({ tax_id_type: v })}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ssn">Social Security Number (SSN)</SelectItem>
                        <SelectItem value="ein">Employer Identification Number (EIN)</SelectItem>
                        <SelectItem value="itin">Individual Taxpayer ID Number (ITIN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">TIN Number</Label>
                    <Input
                      value={data.tax_id || ''}
                      onChange={(e) => onChange({ tax_id: e.target.value })}
                      placeholder={data.tax_id_type === 'ein' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                      className={cn('w-44', errors.tax_id ? 'border-destructive' : '')}
                    />
                  </div>
                </div>
                <FieldError msg={errors.tax_id} />
                <p className="text-xs text-primary cursor-pointer hover:underline">Which TIN type should I select? ▾</p>
              </div>
            )}

            {/* Non-US: foreign TIN */}
            {data.us_person === false && (
              <div className="space-y-1.5 pt-1 border-t border-border">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Foreign Tax ID <span className="font-normal normal-case text-muted-foreground">(if applicable)</span></Label>
                <Input
                  value={data.tax_id || ''}
                  onChange={(e) => onChange({ tax_id: e.target.value })}
                  placeholder="Your country's tax identification number"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">Leave blank if your country does not issue a tax ID number.</p>
              </div>
            )}

          </SectionCard>

          {/* ── Tax Address ── */}
          <SectionCard icon={MapPin} title="Tax Address" description="Your permanent residence or principal place of business for tax purposes">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">This address is used for tax withholding and form generation (W-9, W-8BEN, etc.).</p>
              <span className="text-xs text-primary cursor-pointer hover:underline whitespace-nowrap ml-3">Which address? ▾</span>
            </div>

            {/* Two clear address options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  mode: true,
                  label: 'Use identity address',
                  preview: hasIdentityAddress
                    ? `${data.address_line1}, ${data.city}, ${data.country}`
                    : 'No identity address on file',
                  disabled: !hasIdentityAddress,
                },
                {
                  mode: false,
                  label: 'Enter a different address',
                  preview: 'Provide a separate tax address',
                  disabled: false,
                },
              ].map(opt => (
                <button
                  key={String(opt.mode)}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => onChange({ tax_use_same_address: opt.mode })}
                  className={cn(
                    'relative text-left rounded-xl border-2 px-4 py-3 transition-all',
                    usingSameAddress === opt.mode && !opt.disabled
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40',
                    opt.disabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {usingSameAddress === opt.mode && !opt.disabled && (
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </span>
                  )}
                  <p className="text-xs font-semibold text-foreground mb-1">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{opt.preview}</p>
                </button>
              ))}
            </div>

            {/* Show chosen address */}
            {usingSameAddress && hasIdentityAddress ? (
              <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3 text-sm leading-relaxed">
                <p className="text-foreground">{data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {[data.city, data.state, data.zip].filter(Boolean).join(', ')} · {data.country}
                </p>
              </div>
            ) : !usingSameAddress && (
              <div className="space-y-3 rounded-xl border border-border bg-secondary/10 px-4 py-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Country</Label>
                  <Select value={taxCountry} onValueChange={(v) => onChange({ tax_address_country: v })}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address Line 1 <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.tax_address_line1 || ''}
                    onChange={(e) => onChange({ tax_address_line1: e.target.value })}
                    placeholder="Street address"
                    className={errors.tax_address_line1 ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.tax_address_line1} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address Line 2 <span className="font-normal normal-case text-muted-foreground">(optional)</span></Label>
                  <Input
                    value={data.tax_address_line2 || ''}
                    onChange={(e) => onChange({ tax_address_line2: e.target.value })}
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">City <span className="text-destructive">*</span></Label>
                    <Input value={data.tax_city || ''} onChange={(e) => onChange({ tax_city: e.target.value })} placeholder="City" className={errors.tax_city ? 'border-destructive' : ''} />
                    <FieldError msg={errors.tax_city} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State</Label>
                    {taxCountry === 'United States' ? (
                      <Select value={data.tax_state || ''} onValueChange={(v) => onChange({ tax_state: v })}>
                        <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={data.tax_state || ''} onChange={(e) => onChange({ tax_state: e.target.value })} placeholder="State / Region" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Postal <span className="text-destructive">*</span></Label>
                    <Input value={data.tax_zip || ''} onChange={(e) => onChange({ tax_zip: e.target.value })} placeholder="ZIP" className={errors.tax_zip ? 'border-destructive' : ''} />
                    <FieldError msg={errors.tax_zip} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Certification ── */}
          <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="tax-cert"
                checked={!!data.tax_certified}
                onCheckedChange={(v) => onChange({ tax_certified: !!v })}
                className="mt-0.5 shrink-0"
              />
              <label htmlFor="tax-cert" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Under penalties of perjury, I certify that all information I have entered is true, correct, and complete. I understand that providing false or fraudulent information may subject me to civil or criminal penalties under applicable law.
              </label>
            </div>
            <FieldError msg={errors.tax_certified} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
              Your tax information is encrypted with bank-level security and never shared with third parties.
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between pt-2 border-t border-border">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-8">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}