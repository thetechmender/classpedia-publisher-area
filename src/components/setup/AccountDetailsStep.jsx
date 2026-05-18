import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';

// All KDP-supported bank countries, alphabetically
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

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

function AddressDisplay({ data }) {
  if (!data.address_line1) return null;
  return (
    <div className="text-sm text-foreground border border-border rounded-md px-3 py-2.5 bg-secondary/20 leading-relaxed">
      <p>{data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}</p>
      <p>{[data.city, data.state, data.zip].filter(Boolean).join(', ')}</p>
      <p>{data.country}</p>
    </div>
  );
}

function InlineAddressFields({ prefix, data, onChange, errors }) {
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
  const field = (name) => `${prefix}_${name}`;
  return (
    <div className="space-y-3 border border-border rounded-lg p-4 bg-secondary/10">
      <div className="space-y-1.5">
        <Label>Country <span className="text-destructive">*</span></Label>
        <Select value={data[field('country')] || ''} onValueChange={(v) => onChange({ [field('country')]: v })}>
          <SelectTrigger className={errors[field('country')] ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <FieldError msg={errors[field('country')]} />
      </div>
      <div className="space-y-1.5">
        <Label>Address Line 1 <span className="text-destructive">*</span></Label>
        <Input
          value={data[field('line1')] || ''}
          onChange={(e) => onChange({ [field('line1')]: e.target.value })}
          placeholder="Street address, P.O. box"
          className={errors[field('line1')] ? 'border-destructive' : ''}
        />
        <FieldError msg={errors[field('line1')]} />
      </div>
      <div className="space-y-1.5">
        <Label>Address Line 2 <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
        <Input
          value={data[field('line2')] || ''}
          onChange={(e) => onChange({ [field('line2')]: e.target.value })}
          placeholder="Apartment, suite, unit, etc."
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>City <span className="text-destructive">*</span></Label>
          <Input
            value={data[field('city')] || ''}
            onChange={(e) => onChange({ [field('city')]: e.target.value })}
            placeholder="City"
            className={errors[field('city')] ? 'border-destructive' : ''}
          />
          <FieldError msg={errors[field('city')]} />
        </div>
        <div className="space-y-1.5">
          <Label>State / Region</Label>
          <Input
            value={data[field('state')] || ''}
            onChange={(e) => onChange({ [field('state')]: e.target.value })}
            placeholder="State"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Postal Code <span className="text-destructive">*</span></Label>
          <Input
            value={data[field('zip')] || ''}
            onChange={(e) => onChange({ [field('zip')]: e.target.value })}
            placeholder="ZIP / Postal"
            className={errors[field('zip')] ? 'border-destructive' : ''}
          />
          <FieldError msg={errors[field('zip')]} />
        </div>
      </div>
    </div>
  );
}

export default function AccountDetailsStep({ data, onChange, errors, onNext, onBack }) {
  const isCorporation = data.business_type === 'corporation';
  // Bank recipient type — defaults to mirror top-level business type
  const bankBizType = data.bank_business_type || (isCorporation ? 'corporation' : 'individual');
  const isBankCorp = bankBizType === 'corporation';

  // Address mode for account holder address
  const [useExistingAddr, setUseExistingAddr] = useState(true);
  const hasIdentityAddress = !!(data.address_line1 && data.city);

  const handleUseSameAddress = (checked) => {
    setUseExistingAddr(checked);
    if (checked) {
      // Clear custom bank address fields when switching back to "use existing"
      onChange({
        bank_addr_country: undefined, bank_addr_line1: undefined, bank_addr_line2: undefined,
        bank_addr_city: undefined, bank_addr_state: undefined, bank_addr_zip: undefined,
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* ───────────────────────────────
          SECTION 1: ACCOUNT DETAILS
      ─────────────────────────────── */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Account Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select your business type and confirm your account information.
          </p>
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Business Type <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={data.business_type || 'individual'}
            onValueChange={(v) => onChange({ business_type: v, bank_business_type: v })}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="individual" />
              <span className="text-sm font-medium">Individual / Sole Proprietor</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="corporation" />
              <span className="text-sm font-medium">Corporation / Business Entity</span>
            </label>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Select "Corporation" if you are publishing on behalf of a company. For individual authors (including sole proprietors), select "Individual".
          </p>
        </div>

        {/* Account holder block */}
        <div className="rounded-lg border border-border bg-secondary/10 p-4 space-y-3">
          {!isCorporation ? (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Holder</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{data.full_name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{data.phone || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                {hasIdentityAddress ? (
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}, {[data.city, data.state, data.zip].filter(Boolean).join(', ')}, {data.country}
                  </p>
                ) : <p className="text-sm text-muted-foreground mt-0.5">Not provided</p>}
              </div>
              <button onClick={onBack} className="text-xs text-primary hover:underline">← Edit identity information</button>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Corporate Account Details</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Company / Publishing Entity Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.company_name || ''}
                    onChange={(e) => onChange({ company_name: e.target.value })}
                    placeholder="Legal company name"
                    className={errors.company_name ? 'border-destructive' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the legal name of your company. If not yet incorporated, you may use your full name.
                  </p>
                  <FieldError msg={errors.company_name} />
                </div>
                <div className="space-y-1.5">
                  <Label>Business Phone <span className="text-destructive">*</span></Label>
                  <Input
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    placeholder="+1 555 000 0000"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.phone} />
                </div>
                <div className="space-y-1.5">
                  <Label>Registered Address</Label>
                  {hasIdentityAddress ? (
                    <AddressDisplay data={data} />
                  ) : <p className="text-sm text-muted-foreground">No address on file.</p>}
                  <button onClick={onBack} className="text-xs text-primary hover:underline">← Edit in Your Identity step</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ───────────────────────────────
          SECTION 2: GETTING PAID
      ─────────────────────────────── */}
      <div className="space-y-5 border-t border-border pt-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Getting Paid</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Provide your bank account details to receive electronic royalty payments. Royalties are paid approximately 60 days after the end of the month in which sales are reported.
          </p>
        </div>

        {/* ── Tell us about your bank ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Tell us about your bank</h3>

          {/* Bank Country — no default, force active selection */}
          <div className="space-y-1.5">
            <Label>Where is your bank located? <span className="text-destructive">*</span></Label>
            <Select
              value={data.bank_country || ''}
              onValueChange={(v) => onChange({ bank_country: v })}
            >
              <SelectTrigger className={`${!data.bank_country || errors.bank_country ? 'border-destructive' : ''}`}>
                <SelectValue placeholder="— Select a country —" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {BANK_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {!data.bank_country && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Info className="w-3 h-3" /> Please select the country where your bank is located.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Your bank account must be able to receive electronic payments (ACH or wire transfer). We support banks in most countries.
            </p>
            <FieldError msg={errors.bank_country} />
          </div>

          {/* Account type — only show for US or when country is selected */}
          {data.bank_country && (
            <>
              {data.bank_country === 'United States' && (
                <div className="space-y-1.5">
                  <Label>Type of Account <span className="text-destructive">*</span></Label>
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

              {/* Account Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Account Number <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.bank_account_number || ''}
                    onChange={(e) => onChange({ bank_account_number: e.target.value })}
                    placeholder="Bank account number"
                    className={errors.bank_account_number ? 'border-destructive' : ''}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {data.bank_country === 'United States'
                      ? 'Appears at the bottom of your check — the second set of numbers.'
                      : 'Your bank account number or IBAN.'}
                  </p>
                  <FieldError msg={errors.bank_account_number} />
                </div>
                <div className="space-y-1.5">
                  <Label>Re-enter Account Number <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.bank_account_number_confirm || ''}
                    onChange={(e) => onChange({ bank_account_number_confirm: e.target.value })}
                    placeholder="Re-enter account number"
                    className={errors.bank_account_number_confirm ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.bank_account_number_confirm} />
                </div>
              </div>

              {/* Routing / IBAN */}
              <div className="space-y-1.5">
                <Label>
                  {data.bank_country === 'United States' ? 'Routing Number' : 'IBAN / Sort Code / Routing Number'}
                  {data.bank_country === 'United States' && <span className="text-destructive"> *</span>}
                </Label>
                <Input
                  value={data.bank_routing_number || ''}
                  onChange={(e) => onChange({ bank_routing_number: e.target.value })}
                  placeholder={data.bank_country === 'United States' ? '9-digit routing number' : 'IBAN or bank routing code'}
                  className={errors.bank_routing_number ? 'border-destructive' : ''}
                />
                <p className="text-[10px] text-muted-foreground">
                  {data.bank_country === 'United States'
                    ? '9-digit bank routing code. Appears at the bottom of your check — the first set of numbers.'
                    : 'For international transfers: IBAN (Europe), sort code (UK), BSB (Australia), or SWIFT/BIC.'}
                </p>
                <FieldError msg={errors.bank_routing_number} />
              </div>

              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  We'll verify that your bank account can receive payments from us before your first payment is issued. <span className="underline cursor-pointer font-medium">View bank account requirements →</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* ── Tell us about the recipient ── */}
        {data.bank_country && (
          <div className="space-y-4 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Tell us about the bank account recipient</h3>

            {/* Recipient Business Type */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Recipient Type <span className="text-destructive">*</span></Label>
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
              <p className="text-xs text-muted-foreground">
                Select "Corporation" if the bank account belongs to a business entity rather than a private individual.
              </p>
            </div>

            {/* Date of Birth OR Incorporation */}
            {!isBankCorp ? (
              <div className="space-y-1.5">
                <Label>Date of Birth <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={data.date_of_birth || ''}
                  onChange={(e) => onChange({ date_of_birth: e.target.value })}
                  className={errors.date_of_birth ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the date of birth of the individual receiving funds. Required for identity verification.
                </p>
                <FieldError msg={errors.date_of_birth} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Place of Incorporation <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.place_of_incorporation || ''}
                    onChange={(e) => onChange({ place_of_incorporation: e.target.value })}
                    placeholder="e.g., Delaware, USA"
                  />
                  <p className="text-xs text-muted-foreground">State or country where the business was incorporated.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Incorporation <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={data.date_of_incorporation || ''}
                    onChange={(e) => onChange({ date_of_incorporation: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Date the company was legally incorporated.</p>
                </div>
              </div>
            )}

            {/* Account Holder Name */}
            <div className="space-y-1.5">
              <Label>Account Holder Name <span className="text-destructive">*</span></Label>
              <Input
                value={data.bank_account_name || (isBankCorp ? data.company_name : data.full_name) || ''}
                onChange={(e) => onChange({ bank_account_name: e.target.value })}
                placeholder={isBankCorp ? 'Company name on bank account' : 'Full name on bank account'}
              />
              <p className="text-xs text-muted-foreground">
                This must exactly match the name registered with your bank. Mismatches may delay or prevent payment.
              </p>
            </div>

            {/* Account Holder Address */}
            <div className="space-y-2">
              <Label>Account Holder Address <span className="text-destructive">*</span></Label>

              {hasIdentityAddress && (
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="use-same-addr"
                    checked={useExistingAddr}
                    onCheckedChange={handleUseSameAddress}
                  />
                  <label htmlFor="use-same-addr" className="text-sm cursor-pointer text-foreground">
                    Use my identity address
                  </label>
                </div>
              )}

              {useExistingAddr && hasIdentityAddress ? (
                <AddressDisplay data={data} />
              ) : (
                <InlineAddressFields
                  prefix="bank_addr"
                  data={data}
                  onChange={onChange}
                  errors={errors}
                />
              )}

              {!hasIdentityAddress && (
                <p className="text-xs text-muted-foreground">
                  No identity address found. Please enter the address for the bank account holder.
                </p>
              )}
              <FieldError msg={errors.bank_holder_address} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t">
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