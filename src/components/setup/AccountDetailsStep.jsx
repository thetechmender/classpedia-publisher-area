import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const BANK_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Brazil', 'Spain', 'Italy', 'Netherlands', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium',
  'Portugal', 'Ireland', 'New Zealand', 'Singapore', 'Japan', 'South Korea',
  'Mexico', 'Argentina', 'Colombia', 'Chile', 'South Africa', 'Poland',
  'Czech Republic', 'Hungary', 'Romania', 'Turkey', 'Israel', 'Other',
];

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

export default function AccountDetailsStep({ data, onChange, errors, onNext, onBack }) {
  const isCorporation = data.business_type === 'corporation';
  const isBankCorporation = data.bank_business_type === 'corporation';

  return (
    <div className="space-y-8">
      {/* ── ACCOUNT DETAILS ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Account Details</h2>
          <p className="text-sm text-muted-foreground mt-1">Select your business type and confirm your information.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Business Type <span className="text-destructive">*</span></Label>
          <RadioGroup
            value={data.business_type || 'individual'}
            onValueChange={(v) => onChange({ business_type: v })}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="individual" />
              <span className="text-sm font-medium">Individual</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="corporation" />
              <span className="text-sm font-medium">Corporation</span>
            </label>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Select corporation if you are representing a corporate entity and you are providing information for the corporate entity in this form.
          </p>
        </div>

        <div className="border-t border-border pt-4">
          {!isCorporation ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Account Holder</p>
              <p className="text-base text-foreground">{data.full_name || '—'}</p>
              <Button variant="outline" size="sm" onClick={onBack} className="text-xs mt-1">Edit identity</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Company Name <span className="text-destructive">*</span></Label>
                <Input
                  value={data.company_name || ''}
                  onChange={(e) => onChange({ company_name: e.target.value })}
                  placeholder="Company or publishing entity name"
                  className={errors.company_name ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  The name of your publishing company. If you have not established a separate company entity, this can be your first and last name.
                </p>
                <FieldError msg={errors.company_name} />
              </div>
              <div className="space-y-1.5">
                <Label>Address <span className="text-destructive">*</span></Label>
                {data.address_line1 ? (
                  <div className="text-sm text-foreground border border-border rounded-md px-3 py-2 bg-secondary/20">
                    <p>{data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}</p>
                    <p>{[data.city, data.state, data.zip].filter(Boolean).join(', ')}</p>
                    <p>{data.country}</p>
                  </div>
                ) : <p className="text-sm text-muted-foreground">Not selected</p>}
                <Button variant="outline" size="sm" onClick={onBack} className="text-xs mt-1">Enter a New Address</Button>
              </div>
              <div className="space-y-1.5">
                <Label>Phone <span className="text-destructive">*</span></Label>
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
        </div>
      </div>

      {/* ── GETTING PAID ── */}
      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Getting Paid</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Provide your bank information to receive electronic royalty payments.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Tell us about your bank</h3>

          {/* Bank Country */}
          <div className="space-y-1.5">
            <Label>Where is your bank? <span className="text-destructive">*</span></Label>
            <Select value={data.bank_country || 'United States'} onValueChange={(v) => onChange({ bank_country: v })}>
              <SelectTrigger className={errors.bank_country ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {BANK_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              ● We may require that the bank account be either issued by a bank or managed by a Payment Service Provider that is part of the Payment Service Provider Program.
            </p>
            <FieldError msg={errors.bank_country} />
          </div>

          {/* Account Type */}
          <div className="space-y-1.5">
            <Label className="text-sm">Type of account</Label>
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

          {/* Account Numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Account number <span className="text-destructive">*</span></Label>
              <Input
                value={data.bank_account_number || ''}
                onChange={(e) => onChange({ bank_account_number: e.target.value })}
                placeholder="Account number"
                className={errors.bank_account_number ? 'border-destructive' : ''}
              />
              <p className="text-[10px] text-muted-foreground">Appears on the bottom of your check as second set of numbers.</p>
              <FieldError msg={errors.bank_account_number} />
            </div>
            <div className="space-y-1.5">
              <Label>Re-enter account number <span className="text-destructive">*</span></Label>
              <Input
                value={data.bank_account_number_confirm || ''}
                onChange={(e) => onChange({ bank_account_number_confirm: e.target.value })}
                placeholder="Re-enter account number"
                className={errors.bank_account_number_confirm ? 'border-destructive' : ''}
              />
              <FieldError msg={errors.bank_account_number_confirm} />
            </div>
          </div>

          {/* Routing Number */}
          <div className="space-y-1.5">
            <Label>Routing number {data.bank_country === 'United States' && <span className="text-destructive">*</span>}</Label>
            <Input
              value={data.bank_routing_number || ''}
              onChange={(e) => onChange({ bank_routing_number: e.target.value })}
              placeholder={data.bank_country === 'United States' ? '9-digit routing number' : 'IBAN / Routing number'}
              className={errors.bank_routing_number ? 'border-destructive' : ''}
            />
            <p className="text-[10px] text-muted-foreground">
              {data.bank_country === 'United States'
                ? '9 digit bank code, which appears on the bottom of your check as first set of numbers.'
                : 'IBAN or local routing code for your country.'}
            </p>
            <FieldError msg={errors.bank_routing_number} />
          </div>

          <p className="text-xs text-primary">▾ We'll verify your bank account can receive payments from us. <span className="underline cursor-pointer">Bank account requirements.</span></p>

          <div className="border-t border-border pt-4 space-y-4">
            {/* Bank Business Type */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Business Type <span className="text-destructive">*</span></Label>
              <RadioGroup
                value={data.bank_business_type || (isCorporation ? 'corporation' : 'individual')}
                onValueChange={(v) => onChange({ bank_business_type: v })}
                className="flex gap-6"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="individual" /><span className="text-sm">Individual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="corporation" /><span className="text-sm">Corporation</span>
                </label>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Select corporation if you are representing a corporate entity and you are providing information for the corporate entity in this form.
              </p>
            </div>

            {isBankCorporation ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Place of Incorporation <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.place_of_incorporation || ''}
                    onChange={(e) => onChange({ place_of_incorporation: e.target.value })}
                    placeholder="State / Country of incorporation"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Incorporation <span className="text-destructive">*</span></Label>
                  <Input
                    type="date"
                    value={data.date_of_incorporation || ''}
                    onChange={(e) => onChange({ date_of_incorporation: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Enter the Date of Incorporation for the recipient of the funds.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Date of Birth <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={data.date_of_birth || ''}
                  onChange={(e) => onChange({ date_of_birth: e.target.value })}
                  className={errors.date_of_birth ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">Enter the Date of Birth for the recipient of the funds.</p>
                <FieldError msg={errors.date_of_birth} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Account holder name</Label>
              <Input
                value={data.bank_account_name || data.full_name || ''}
                onChange={(e) => onChange({ bank_account_name: e.target.value })}
                placeholder="Name on bank account"
              />
              <p className="text-xs text-muted-foreground">
                Enter the name of the person or entity associated with the bank account. If the name doesn't match your bank's records exactly, we may not be able to deposit payments to your account.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Account holder address <span className="text-destructive">*</span></Label>
              {data.address_line1 ? (
                <div className="text-sm text-foreground border border-border rounded-md px-3 py-2 bg-secondary/20">
                  <p>{data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}</p>
                  <p>{[data.city, data.state, data.zip].filter(Boolean).join(', ')}</p>
                  <p>{data.country}</p>
                </div>
              ) : <p className="text-sm text-muted-foreground">Not selected</p>}
              <FieldError msg={errors.bank_holder_address} />
            </div>
          </div>
        </div>
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