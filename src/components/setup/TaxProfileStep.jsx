import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil',
  'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark',
  'Egypt', 'Finland', 'France', 'Germany', 'Hungary', 'India', 'Indonesia',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'Ukraine', 'United Kingdom', 'United States', 'Vietnam',
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
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

export default function TaxProfileStep({ data, onChange, errors, onNext, onBack }) {
  const isBusiness = data.tax_classification === 'business';
  const isUSResident = data.us_person === true;
  const isUSResident_notSure = data.us_person === 'not_sure';
  const taxCountry = data.tax_address_country || 'United States';

  return (
    <div className="space-y-6">
      <div>
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
            Complete your tax profile to avoid payment delays. You must complete your tax profile to receive royalty payments. Failure to complete your tax profile may result in payment delays.
          </p>
        </div>
      )}

      {/* Get Started */}
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Get Started</h3>
          <p className="text-xs text-muted-foreground mb-3">What is your tax classification?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ tax_classification: 'individual' })}
              className={cn(
                'px-4 py-1.5 rounded border text-sm font-medium transition-colors',
                !isBusiness
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/40'
              )}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => onChange({ tax_classification: 'business' })}
              className={cn(
                'px-4 py-1.5 rounded border text-sm font-medium transition-colors',
                isBusiness
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/40'
              )}
            >
              Business
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            "Individual" includes Sole Proprietors or Disregarded Entity where the owner is an individual.
          </p>
        </div>

        {isBusiness && (
          <div className="space-y-1.5">
            <Label>Federal tax classification <span className="text-destructive">*</span></Label>
            <Select value={data.federal_tax_classification || ''} onValueChange={(v) => onChange({ federal_tax_classification: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                {FEDERAL_TAX_CLASSIFICATIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError msg={errors.federal_tax_classification} />
          </div>
        )}

        {/* US person question */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {isBusiness
              ? 'Are you a U.S. resident entity?'
              : 'Are you a United States (U.S.) citizen, U.S. permanent resident (green card holder), or other U.S. resident alien?'}
          </p>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
              ...(!isBusiness ? [{ value: 'not_sure', label: "I'm not sure if I'm a U.S. resident alien" }] : []),
            ].map(({ value, label }) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => onChange({ us_person: value })}
                className={cn(
                  'px-4 py-1.5 rounded border text-sm font-medium transition-colors',
                  data.us_person === value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-primary/40'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <FieldError msg={errors.us_person} />
        </div>
      </div>

      {/* Tax Identity Information — shown once US status is selected */}
      {data.us_person !== undefined && (
        <div className="space-y-5 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">Tax Identity Information</h3>

          <div className="space-y-1.5">
            <Label>Full name <span className="text-destructive">*</span></Label>
            <Input
              value={data.tax_full_name || data.full_name || ''}
              onChange={(e) => onChange({ tax_full_name: e.target.value })}
              placeholder="Full legal name"
              className={errors.tax_full_name ? 'border-destructive' : ''}
            />
            <p className="text-xs text-primary cursor-pointer hover:underline">Learn about which name to enter ▾</p>
            <FieldError msg={errors.tax_full_name} />
          </div>

          <div className="space-y-1.5">
            <Label>Doing business as "DBA" or trade name <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <Input
              value={data.dba_name || ''}
              onChange={(e) => onChange({ dba_name: e.target.value })}
              placeholder="Trade name or DBA (optional)"
            />
          </div>

          {(isUSResident || isUSResident_notSure) && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>U.S. Taxpayer Identification Number (TIN) Type <span className="text-destructive">*</span></Label>
                <div className="flex items-end gap-3">
                  <Select
                    value={data.tax_id_type || 'ssn'}
                    onValueChange={(v) => onChange({ tax_id_type: v })}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ssn">Social Security Number (SSN)</SelectItem>
                      <SelectItem value="ein">Employer Identification Number (EIN)</SelectItem>
                      <SelectItem value="itin">Individual Taxpayer Identification Number (ITIN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Input
                  value={data.tax_id || ''}
                  onChange={(e) => onChange({ tax_id: e.target.value })}
                  placeholder={data.tax_id_type === 'ein' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                  className={cn('max-w-xs', errors.tax_id ? 'border-destructive' : '')}
                />
                <FieldError msg={errors.tax_id} />
              </div>
              <p className="text-xs text-primary cursor-pointer hover:underline">Learn which TIN type to select and where to find it ▾</p>
            </div>
          )}

          {data.us_person === false && (
            <div className="space-y-1.5">
              <Label>Foreign Taxpayer ID (if applicable)</Label>
              <Input
                value={data.tax_id || ''}
                onChange={(e) => onChange({ tax_id: e.target.value })}
                placeholder="Your country's tax ID number"
              />
              <p className="text-xs text-muted-foreground">Leave blank if you don't have a foreign tax ID.</p>
            </div>
          )}

          {/* Address */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Tax Address</h4>
              <span className="text-xs text-primary cursor-pointer hover:underline">Learn about which address to use ▾</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This should be your permanent residence or principal place of business for tax purposes.
            </p>

            {/* Use same address toggle */}
            {data.address_line1 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tax-same-addr"
                  checked={data.tax_use_same_address !== false}
                  onCheckedChange={(v) => onChange({ tax_use_same_address: !!v })}
                />
                <label htmlFor="tax-same-addr" className="text-sm cursor-pointer text-foreground">
                  Same as my identity address
                </label>
              </div>
            )}

            {/* Show address summary if using same */}
            {(data.tax_use_same_address !== false && data.address_line1) ? (
              <div className="text-sm text-foreground border border-border rounded-md px-3 py-2.5 bg-secondary/20 leading-relaxed">
                <p>{data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}</p>
                <p>{[data.city, data.state, data.zip].filter(Boolean).join(', ')}</p>
                <p>{data.country}</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Select value={taxCountry} onValueChange={(v) => onChange({ tax_address_country: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Address line 1 <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.tax_address_line1 || ''}
                    onChange={(e) => onChange({ tax_address_line1: e.target.value })}
                    placeholder="Street address"
                    className={errors.tax_address_line1 ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.tax_address_line1} />
                </div>

                <div className="space-y-1.5">
                  <Label>Address line 2 <span className="text-muted-foreground text-xs">(Optional)</span></Label>
                  <Input
                    value={data.tax_address_line2 || ''}
                    onChange={(e) => onChange({ tax_address_line2: e.target.value })}
                    placeholder="Apartment, suite, unit, building, floor etc."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.tax_city || ''}
                    onChange={(e) => onChange({ tax_city: e.target.value })}
                    placeholder="City"
                    className={errors.tax_city ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.tax_city} />
                </div>

                <div className="space-y-1.5">
                  <Label>State / Province / Region</Label>
                  {taxCountry === 'United States' ? (
                    <Select
                      value={data.tax_state || ''}
                      onValueChange={(v) => onChange({ tax_state: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={data.tax_state || ''}
                      onChange={(e) => onChange({ tax_state: e.target.value })}
                      placeholder="State / Province / Region"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Zip / Postal code <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.tax_zip || ''}
                    onChange={(e) => onChange({ tax_zip: e.target.value })}
                    placeholder="Zip / Postal code"
                    className={errors.tax_zip ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.tax_zip} />
                </div>
              </>
            )}
          </div>

          {/* Certification */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              checked={!!data.tax_certified}
              onCheckedChange={(v) => onChange({ tax_certified: !!v })}
              className="mt-0.5"
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Under penalties of perjury, I certify that all information I have entered is true, correct, and complete. I understand that the submission of false or fraudulent information may subject me to civil or criminal penalties.
            </p>
          </div>
          <FieldError msg={errors.tax_certified} />

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
            Your tax information is encrypted using bank-level security and never shared with third parties.
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-8">
          Save & Preview <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}