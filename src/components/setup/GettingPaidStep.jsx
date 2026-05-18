import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function GettingPaidStep({ data, onChange, errors, onNext, onBack }) {
  const isCorperation = data.business_type === 'corporation';
  const [showBankForm, setShowBankForm] = useState(!data.bank_account_number);

  const hasBankAccount = !!data.bank_account_number;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Getting Paid</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provide your bank information to receive electronic royalty payments.
        </p>
      </div>

      {hasBankAccount && !showBankForm ? (
        /* Already has bank account — show summary */
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700 leading-relaxed">
              <p className="font-semibold">You're all set! We added your bank account.</p>
              <p className="mt-1">We'll verify your bank details to ensure we can successfully deposit your payments. This typically takes up to 3 days.</p>
              <p className="mt-1 text-blue-600">Security Tip: We'll never ask for your full bank details over email, phone, or chat.</p>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 bg-secondary/40 px-4 py-2 text-xs font-semibold text-muted-foreground border-b">
              <span>Bank Account</span>
              <span>Payment Details</span>
            </div>
            <div className="grid grid-cols-2 px-4 py-3 text-sm">
              <div>
                <p>{data.bank_country || 'United States'} ****{(data.bank_account_number || '').slice(-3)}</p>
                <button onClick={() => setShowBankForm(true)} className="text-xs text-primary hover:underline mt-1">Update Bank</button>
              </div>
              <div>
                <p className="text-muted-foreground">You will be paid in: <span className="font-medium text-foreground">USD ($)</span></p>
                <p className="text-muted-foreground text-xs mt-0.5">For customer transactions made in: All Marketplaces</p>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowBankForm(true)}>
            Add another bank account
          </Button>
        </div>
      ) : (
        /* Bank account form */
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Tell us about your bank</h3>

            <div className="space-y-4">
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
                    <RadioGroupItem value="checking" />
                    <span className="text-sm">Checking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="savings" />
                    <span className="text-sm">Savings</span>
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

              <div className="flex items-start gap-2 text-xs text-primary">
                <span>▾</span>
                <p>We'll verify your bank account can receive payments from us. <span className="underline cursor-pointer">Bank account requirements.</span></p>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                {/* Bank account business type */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Business Type <span className="text-destructive">*</span></Label>
                  <RadioGroup
                    value={data.bank_business_type || (isCorperation ? 'corporation' : 'individual')}
                    onValueChange={(v) => onChange({ bank_business_type: v })}
                    className="flex gap-6"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="individual" />
                      <span className="text-sm">Individual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="corporation" />
                      <span className="text-sm">Corporation</span>
                    </label>
                  </RadioGroup>
                  <p className="text-xs text-muted-foreground">
                    Select corporation if you are representing a corporate entity and you are providing information for the corporate entity in this form.
                  </p>
                </div>

                {data.bank_business_type === 'corporation' ? (
                  <div className="space-y-1.5">
                    <Label>Place of Incorporation <span className="text-destructive">*</span></Label>
                    <Input
                      value={data.place_of_incorporation || ''}
                      onChange={(e) => onChange({ place_of_incorporation: e.target.value })}
                      placeholder="State / Country of incorporation"
                    />
                    <Label className="mt-3">Date of Incorporation <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      value={data.date_of_incorporation || ''}
                      onChange={(e) => onChange({ date_of_incorporation: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter the Date of Incorporation for the recipient of the funds.</p>
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

                {/* Account Holder Name */}
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

                {/* Account Holder Address */}
                <div className="space-y-1.5">
                  <Label>Account holder address <span className="text-destructive">*</span></Label>
                  {data.address_line1 ? (
                    <div className="text-sm text-foreground border border-border rounded-md px-3 py-2 bg-secondary/20">
                      <p>{data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}</p>
                      <p>{[data.city, data.state, data.zip].filter(Boolean).join(', ')}</p>
                      <p>{data.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not selected</p>
                  )}
                  <FieldError msg={errors.bank_holder_address} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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