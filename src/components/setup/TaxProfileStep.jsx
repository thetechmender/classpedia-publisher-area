import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Shield } from 'lucide-react';
import ValidationSummary from './ValidationSummary';
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
  'C Corporation', 'S Corporation', 'Partnership',
  'Trust / Estate', 'Disregarded Entity',
];

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
  </p>
) : null;

export default function TaxProfileStep({ data, onChange, errors, onNext, onBack }) {
  const isBusiness = data.tax_classification === 'business';
  const taxClass = data.tax_classification || 'individual';
  const usStatus = data.us_person; // true | false | 'not_sure' | undefined
  const taxAddressCountry = data.tax_address_country || data.country || 'United States';
  // Pre-fill tax address from identity if not set
  const taxLine1 = data.tax_address_line1 ?? data.address_line1 ?? '';
  const taxLine2 = data.tax_address_line2 ?? data.address_line2 ?? '';
  const taxCity = data.tax_city ?? data.city ?? '';
  const taxState = data.tax_state ?? data.state ?? '';
  const taxZip = data.tax_zip ?? data.zip ?? '';
  const showTaxIdentity = usStatus !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-1">
        <h2 className="text-xl font-semibold text-foreground">Tax Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Failure to provide the information below may cause a delay in our ability to issue payments and/or result in maximum U.S. tax withholding on your earnings.
        </p>
      </div>

      {/* Incomplete warning */}
      {!data.tax_certified && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Action required:</span> You must complete your tax profile to receive royalty payments.
          </p>
        </div>
      )}

      {/* ── GET STARTED ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 bg-secondary/40 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Get Started</p>
        </div>
        <div className="px-5 py-5 space-y-5">

          {/* Tax Classification */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">What is your tax classification?</p>
            <div className="flex gap-0">
              {['individual', 'business'].map((val, i) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange({ tax_classification: val })}
                  className={cn(
                    'px-5 py-1.5 text-sm border transition-all',
                    i === 0 ? 'rounded-l-md' : 'rounded-r-md -ml-px',
                    taxClass === val
                      ? 'bg-primary text-primary-foreground border-primary z-10'
                      : 'bg-background text-foreground border-border hover:bg-secondary'
                  )}
                >
                  {val === 'individual' ? 'Individual' : 'Business'}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              "Individual" includes Sole Proprietors or Disregarded Entity where the owner is an individual.
            </p>
            <FieldError msg={errors.tax_classification} />
          </div>

          {/* US residency */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isBusiness
                ? 'Are you a U.S. resident entity?'
                : 'Are you a United States (U.S.) citizen, or U.S. permanent resident (green card holder)?'}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' },

              ].map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => onChange({ us_person: value })}
                  className={cn(
                    'px-4 py-1.5 text-sm border rounded-md transition-all',
                    usStatus === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-secondary'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-primary cursor-pointer hover:underline">Learn about U.S. citizenship and residency ▾</p>
            <FieldError msg={errors.us_person} />
          </div>

          {/* Business: federal classification — shown after residency answer */}
          {isBusiness && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Federal tax classification</p>
              <Select value={data.federal_tax_classification || ''} onValueChange={(v) => onChange({ federal_tax_classification: v })}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {FEDERAL_TAX_CLASSIFICATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError msg={errors.federal_tax_classification} />
            </div>
          )}

        </div>
      </div>

      {/* ── TAX IDENTITY INFORMATION — shown after US status answered ── */}
      {showTaxIdentity && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 bg-secondary/40 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Tax Identity Information</p>
            </div>
            <div className="px-5 py-5 space-y-4">

              {/* Full name */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Full name</Label>
                <Input
                  value={data.tax_full_name || data.full_name || ''}
                  onChange={(e) => onChange({ tax_full_name: e.target.value })}
                  placeholder="Full legal name as on your tax return"
                  className={cn('max-w-sm', errors.tax_full_name ? 'border-destructive' : '')}
                />
                <p className="text-xs text-primary cursor-pointer hover:underline">Learn about which name to enter ▾</p>
                <FieldError msg={errors.tax_full_name} />
              </div>

              {/* DBA */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">
                  Doing business as "DBA" or trade name{' '}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  value={data.dba_name || ''}
                  onChange={(e) => onChange({ dba_name: e.target.value })}
                  className="max-w-sm"
                />
              </div>

              {/* US TIN */}
              {usStatus === true && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    U.S. Taxpayer Identification Number (TIN) Type
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={data.tax_id_type || 'ssn'}
                      onValueChange={(v) => onChange({ tax_id_type: v })}
                    >
                      <SelectTrigger className="w-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ssn">Social Security Number (SSN)</SelectItem>
                        <SelectItem value="ein">Employer Identification Number (EIN)</SelectItem>
                        <SelectItem value="itin">Individual Taxpayer ID Number (ITIN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={data.tax_id || ''}
                    onChange={(e) => onChange({ tax_id: e.target.value })}
                    placeholder={data.tax_id_type === 'ein' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                    className={cn('max-w-xs', errors.tax_id ? 'border-destructive' : '')}
                  />
                  <FieldError msg={errors.tax_id} />
                  <p className="text-xs text-primary cursor-pointer hover:underline">Learn which TIN type to select and where to find it ▾</p>
                </div>
              )}

              {/* Non-US foreign TIN */}
              {usStatus === false && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">
                    Taxpayer Identification Number (TIN)
                  </Label>
                  <Input
                    value={data.tax_id || ''}
                    onChange={(e) => onChange({ tax_id: e.target.value })}
                    placeholder="Your country's tax identification number"
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">Leave blank if your country does not issue a tax ID number.</p>
                </div>
              )}

            </div>
          </div>

          {/* ── ADDRESS ── */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 bg-secondary/40 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Address</p>
            </div>
            <div className="px-5 py-5 space-y-3">
              <p className="text-xs text-primary cursor-pointer hover:underline">Learn about which address to use ▾</p>

              {/* Country */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Country</Label>
                <Select value={taxAddressCountry} onValueChange={(v) => onChange({ tax_address_country: v })}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Address line 1 */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Address line 1</Label>
                <Input
                  value={taxLine1}
                  onChange={(e) => onChange({ tax_address_line1: e.target.value })}
                  placeholder="Street address, P.O. box"
                  className={cn('max-w-sm', errors.tax_address_line1 ? 'border-destructive' : '')}
                />
                <FieldError msg={errors.tax_address_line1} />
              </div>

              {/* Address line 2 */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">
                  Address line 2 <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  value={taxLine2}
                  onChange={(e) => onChange({ tax_address_line2: e.target.value })}
                  placeholder="Apartment, suite, unit, building, floor etc."
                  className="max-w-sm"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">City</Label>
                <Input
                  value={taxCity}
                  onChange={(e) => onChange({ tax_city: e.target.value })}
                  placeholder="City"
                  className={cn('max-w-xs', errors.tax_city ? 'border-destructive' : '')}
                />
                <FieldError msg={errors.tax_city} />
              </div>

              {/* State / Province / Region */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">State / Province / Region</Label>
                {taxAddressCountry === 'United States' ? (
                  <Select value={taxState} onValueChange={(v) => onChange({ tax_state: v })}>
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={taxState}
                    onChange={(e) => onChange({ tax_state: e.target.value })}
                    placeholder="State / Province / Region"
                    className="max-w-xs"
                  />
                )}
              </div>

              {/* Zip / Postal code */}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Zip / Postal code</Label>
                <Input
                  value={taxZip}
                  onChange={(e) => onChange({ tax_zip: e.target.value })}
                  placeholder="Zip / Postal code"
                  className={cn('max-w-xs', errors.tax_zip ? 'border-destructive' : '')}
                />
                <FieldError msg={errors.tax_zip} />
              </div>

            </div>
          </div>

          {/* ── CERTIFICATION ── */}
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

      <ValidationSummary errors={errors} />

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