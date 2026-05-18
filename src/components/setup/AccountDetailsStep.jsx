import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, AlertCircle, Info, Building2, Banknote, User2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const BANK_COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Bahrain', 'Bangladesh', 'Belgium',
  'Bolivia', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China', 'Colombia',
  'Costa Rica', 'Croatia', 'Czech Republic', 'Denmark', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Finland', 'France', 'Germany',
  'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hungary', 'India', 'Indonesia',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kenya', 'Kuwait', 'Latvia',
  'Lithuania', 'Luxembourg', 'Malaysia', 'Malta', 'Mexico', 'Morocco',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Norway', 'Oman',
  'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia',
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Taiwan', 'Thailand', 'Tunisia', 'Turkey', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam',
];

const ADDR_COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil',
  'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark',
  'Egypt', 'Finland', 'France', 'Germany', 'Hungary', 'India', 'Indonesia',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
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

// Address card selector: "Use existing" OR "Enter new"
function AddressSelector({ identityData, addrPrefix, data, onChange, errors }) {
  const hasIdentity = !!(identityData.address_line1 && identityData.city);
  // mode: 'existing' | 'new'
  const mode = data[`${addrPrefix}_mode`] || (hasIdentity ? 'existing' : 'new');
  const setMode = (m) => onChange({ [`${addrPrefix}_mode`]: m });

  return (
    <div className="space-y-3">
      {/* Option cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Option A: Use existing */}
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={!hasIdentity}
          className={cn(
            'relative text-left rounded-xl border-2 px-4 py-3 transition-all',
            mode === 'existing' && hasIdentity
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/40',
            !hasIdentity && 'opacity-40 cursor-not-allowed'
          )}
        >
          {mode === 'existing' && hasIdentity && (
            <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          )}
          <p className="text-xs font-semibold text-foreground mb-1">Use existing address</p>
          {hasIdentity ? (
            <p className="text-[11px] text-muted-foreground leading-snug">
              {identityData.address_line1}, {identityData.city}, {identityData.country}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">No identity address on file</p>
          )}
        </button>

        {/* Option B: Enter new */}
        <button
          type="button"
          onClick={() => setMode('new')}
          className={cn(
            'relative text-left rounded-xl border-2 px-4 py-3 transition-all',
            mode === 'new'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/40'
          )}
        >
          {mode === 'new' && (
            <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          )}
          <p className="text-xs font-semibold text-foreground mb-1">Enter a new address</p>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Provide a different address for this purpose
          </p>
        </button>
      </div>

      {/* If existing — show address preview */}
      {mode === 'existing' && hasIdentity && (
        <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3 text-sm text-foreground leading-relaxed">
          <p>{identityData.address_line1}{identityData.address_line2 ? `, ${identityData.address_line2}` : ''}</p>
          <p className="text-muted-foreground text-xs mt-0.5">{[identityData.city, identityData.state, identityData.zip].filter(Boolean).join(', ')} · {identityData.country}</p>
        </div>
      )}

      {/* If new — show inline fields */}
      {mode === 'new' && (
        <div className="space-y-3 rounded-xl border border-border bg-secondary/10 px-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Country <span className="text-destructive">*</span></Label>
            <Select value={data[`${addrPrefix}_country`] || ''} onValueChange={(v) => onChange({ [`${addrPrefix}_country`]: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {ADDR_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address Line 1 <span className="text-destructive">*</span></Label>
            <Input
              value={data[`${addrPrefix}_line1`] || ''}
              onChange={(e) => onChange({ [`${addrPrefix}_line1`]: e.target.value })}
              placeholder="Street address, P.O. box"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address Line 2 <span className="font-normal normal-case text-muted-foreground">(optional)</span></Label>
            <Input
              value={data[`${addrPrefix}_line2`] || ''}
              onChange={(e) => onChange({ [`${addrPrefix}_line2`]: e.target.value })}
              placeholder="Apartment, suite, unit, etc."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">City <span className="text-destructive">*</span></Label>
              <Input
                value={data[`${addrPrefix}_city`] || ''}
                onChange={(e) => onChange({ [`${addrPrefix}_city`]: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State</Label>
              <Input
                value={data[`${addrPrefix}_state`] || ''}
                onChange={(e) => onChange({ [`${addrPrefix}_state`]: e.target.value })}
                placeholder="State"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Postal <span className="text-destructive">*</span></Label>
              <Input
                value={data[`${addrPrefix}_zip`] || ''}
                onChange={(e) => onChange({ [`${addrPrefix}_zip`]: e.target.value })}
                placeholder="ZIP"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountDetailsStep({ data, onChange, errors, onNext, onBack }) {
  const isCorporation = data.business_type === 'corporation';
  const bankBizType = data.bank_business_type || (isCorporation ? 'corporation' : 'individual');
  const isBankCorp = bankBizType === 'corporation';
  const bankCountrySelected = !!data.bank_country;

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="pb-1">
        <h2 className="text-xl font-semibold text-foreground">Account Details & Getting Paid</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confirm your account type and set up your bank account to receive royalty payments.
        </p>
      </div>

      {/* ─────────────────────────────────────────
          PART 1: ACCOUNT DETAILS
      ───────────────────────────────────────── */}
      <SectionCard icon={Building2} title="Account Details" description="Select your business type and verify your account information">

        {/* Business Type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Type <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={data.business_type || 'individual'}
            onValueChange={(v) => onChange({ business_type: v, bank_business_type: v })}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="individual" /><span className="text-sm font-medium">Individual</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="corporation" /><span className="text-sm font-medium">Corporation</span>
            </label>
          </RadioGroup>
          {!isCorporation && (
            <p className="text-xs text-muted-foreground">
              Select corporation if you are representing a corporate entity and you are providing information for the corporate entity in this form.
            </p>
          )}
          <FieldError msg={errors.business_type} />
        </div>

        {/* Individual: Account Holder summary only */}
        {!isCorporation && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Holder</p>
            <p className="text-sm font-medium text-primary">{data.full_name || '—'}</p>
            <button type="button" onClick={onBack} className="mt-1 text-xs border border-border rounded px-3 py-1.5 text-foreground hover:bg-secondary transition-colors">
              Edit identity
            </button>
          </div>
        )}

        {/* Corporation: Company Name, Address, Phone */}
        {isCorporation && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Company Name <span className="text-destructive">*</span></Label>
              <Input
                value={data.company_name || ''}
                onChange={(e) => onChange({ company_name: e.target.value })}
                placeholder="Legal company name"
                className={errors.company_name ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">
                The name of your publishing company. If you have not established a separate company entity (corporation, etc), this can be your first and last name.
              </p>
              <FieldError msg={errors.company_name} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                Address <span className="text-destructive">*</span>
              </Label>
              <AddressSelector
                identityData={data}
                addrPrefix="corp_addr"
                data={data}
                onChange={onChange}
                errors={errors}
              />
              <FieldError msg={errors.corp_address} />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone Number <span className="text-destructive">*</span></Label>
              <Input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+1 555 000 0000"
                className={errors.phone ? 'border-destructive' : ''}
              />
              <FieldError msg={errors.phone} />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ─────────────────────────────────────────
          PART 2: GETTING PAID
      ───────────────────────────────────────── */}
      <SectionCard icon={Banknote} title="Getting Paid" description="Bank account to receive your royalty payments (paid ~60 days after month end)">

        {/* Bank country */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Where is your bank located? <span className="text-destructive">*</span></Label>
          <Select value={data.bank_country || ''} onValueChange={(v) => onChange({ bank_country: v })}>
            <SelectTrigger className={cn(!data.bank_country || errors.bank_country ? 'border-destructive' : '')}>
              <SelectValue placeholder="— Select country —" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {BANK_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {!data.bank_country && (
            <p className="flex items-center gap-1 text-xs text-amber-600">
              <Info className="w-3 h-3 shrink-0" /> Select the country where your bank account is held.
            </p>
          )}
          <FieldError msg={errors.bank_country} />
        </div>

        {bankCountrySelected && (
          <>
            {/* Account type — US only */}
            {data.bank_country === 'United States' && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type of Account <span className="text-destructive">*</span></Label>
                <RadioGroup
                  value={data.bank_account_type || 'checking'}
                  onValueChange={(v) => onChange({ bank_account_type: v })}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="checking" /><span className="text-sm">Checking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="savings" /><span className="text-sm">Savings</span>
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* Account numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Number <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bank_account_number || ''}
                  onChange={(e) => onChange({ bank_account_number: e.target.value })}
                  placeholder="Account number"
                  className={errors.bank_account_number ? 'border-destructive' : ''}
                />
                <p className="text-[10px] text-muted-foreground">
                  {data.bank_country === 'United States'
                    ? 'Second set of numbers at the bottom of your check.'
                    : 'Your bank account number or IBAN.'}
                </p>
                <FieldError msg={errors.bank_account_number} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Re-enter Account Number <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bank_account_number_confirm || ''}
                  onChange={(e) => onChange({ bank_account_number_confirm: e.target.value })}
                  placeholder="Confirm account number"
                  className={errors.bank_account_number_confirm ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.bank_account_number_confirm} />
              </div>
            </div>

            {/* Routing / IBAN */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {data.bank_country === 'United States' ? 'Routing Number' : 'IBAN / Sort Code / Routing Number'}
                {data.bank_country === 'United States' && <span className="text-destructive"> *</span>}
              </Label>
              <Input
                value={data.bank_routing_number || ''}
                onChange={(e) => onChange({ bank_routing_number: e.target.value })}
                placeholder={data.bank_country === 'United States' ? '9-digit routing number' : 'IBAN or local bank code'}
                className={cn('max-w-sm', errors.bank_routing_number ? 'border-destructive' : '')}
              />
              <p className="text-[10px] text-muted-foreground">
                {data.bank_country === 'United States'
                  ? 'First set of numbers at the bottom of your check (9 digits).'
                  : 'IBAN (Europe), sort code (UK), BSB (Australia), or SWIFT/BIC.'}
              </p>
              <FieldError msg={errors.bank_routing_number} />
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                We'll verify your bank can receive payments before your first royalty is issued.{' '}
                <span className="underline cursor-pointer font-medium">View requirements →</span>
              </p>
            </div>
          </>
        )}
      </SectionCard>

      {/* ─────────────────────────────────────────
          PART 3: BANK ACCOUNT RECIPIENT
      ───────────────────────────────────────── */}
      {bankCountrySelected && (
        <SectionCard icon={User2} title="Bank Account Recipient" description="Who owns the bank account that will receive payments">

          {/* Recipient Type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recipient Type <span className="text-destructive">*</span></Label>
            <RadioGroup
              value={bankBizType}
              onValueChange={(v) => onChange({ bank_business_type: v })}
              className="flex gap-6"
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="individual" /><span className="text-sm">Individual</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="corporation" /><span className="text-sm">Corporation / Business</span>
              </label>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">Select "Corporation" only if the bank account is registered under a business entity.</p>
          </div>

          {/* DOB or Incorporation */}
          {!isBankCorp ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={data.date_of_birth || ''}
                onChange={(e) => onChange({ date_of_birth: e.target.value })}
                className={cn('max-w-xs', errors.date_of_birth ? 'border-destructive' : '')}
              />
              <p className="text-xs text-muted-foreground">Date of birth of the individual receiving funds — required for identity verification.</p>
              <FieldError msg={errors.date_of_birth} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Place of Incorporation <span className="text-destructive">*</span></Label>
                <Input
                  value={data.place_of_incorporation || ''}
                  onChange={(e) => onChange({ place_of_incorporation: e.target.value })}
                  placeholder="e.g., Delaware, USA"
                />
                <p className="text-xs text-muted-foreground">State or country where the business was incorporated.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Incorporation <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={data.date_of_incorporation || ''}
                  onChange={(e) => onChange({ date_of_incorporation: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Account holder name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Account Holder Name <span className="text-destructive">*</span></Label>
            <Input
              value={data.bank_account_name || (isBankCorp ? data.company_name : data.full_name) || ''}
              onChange={(e) => onChange({ bank_account_name: e.target.value })}
              placeholder={isBankCorp ? 'Company name on bank account' : 'Full name on bank account'}
              className="max-w-sm"
            />
            <p className="text-xs text-muted-foreground">Must exactly match the name registered with your bank. Mismatches may delay payment.</p>
          </div>

          {/* Account holder address — two clear options */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Account Holder Address <span className="text-destructive">*</span>
            </Label>
            <AddressSelector
              identityData={data}
              addrPrefix="bank_addr"
              data={data}
              onChange={onChange}
              errors={errors}
            />
            <FieldError msg={errors.bank_holder_address} />
          </div>

        </SectionCard>
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