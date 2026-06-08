import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, FileText, AlertCircle, Info, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

const InfoBox = ({ children }) => (
  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mt-3">
    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
    <p className="text-xs text-blue-700 leading-relaxed">{children}</p>
  </div>
);

const TAX_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Brazil', 'Spain', 'Italy', 'Netherlands', 'Sweden',
  'Other',
];

// Generate a reference ID like KDP does
const generateRefId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 18 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const FORM_REF_ID = generateRefId();

export default function TaxStep({ data, onChange, errors, onNext, onBack, saving = false }) {
  const isUS = data.usPerson === true;
  const formName = isUS ? 'W-9' : 'W-8BEN';

  // Show preview+sign block once required fields are filled
  const canShowPreview = data.usPerson !== undefined && (
    isUS
      ? (data.taxIdType && data.taxId?.trim())
      : (data.taxCountry)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">Tax Information</h2>
          <p className="text-sm text-muted-foreground">Required by law to process your royalty payments</p>
        </div>
      </div>

      {/* Why we collect this */}
      <div className="rounded-xl border border-border bg-card shadow-sm ">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Why We Collect This</h3>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            As a publisher paying royalties, Classpedia is required to collect tax information from all authors.
            This information is used to prepare year-end tax forms and to determine any applicable withholding.
          </p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
            Your tax information is encrypted and never shared with third parties.
          </div>
        </div>
      </div>

      {/* US Person Status */}
      <div className="rounded-xl border border-border bg-card shadow-sm ">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">US Tax Status <span className="text-destructive">*</span></h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select the option that best describes your tax residency</p>
        </div>
        <div className="px-5 py-5 space-y-2.5">
          {[
            {
              value: true,
              label: 'U.S. person',
              description: 'U.S. citizen, resident alien, or U.S.-incorporated entity',
              form: 'W-9',
            },
            {
              value: false,
              label: 'Non-U.S. person',
              description: 'Individual or entity outside the United States',
              form: 'W-8BEN',
            },
          ].map(opt => {
            const selected = data.usPerson === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => onChange({ usPerson: opt.value, taxIdType: undefined, taxId: '', taxCountry: '' })}
                className={cn(
                  'w-full flex items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-all duration-150',
                  selected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-background hover:border-primary/30 hover:bg-muted/30'
                )}
              >
                {/* Radio indicator */}
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  selected ? 'border-primary' : 'border-muted-foreground/30'
                )}>
                  {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                </div>

                <span className={cn(
                  'shrink-0 text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded border font-mono',
                  selected
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-muted/60 text-muted-foreground border-border'
                )}>
                  {opt.form}
                </span>
              </button>
            );
          })}
          <FieldError msg={errors.usPerson} />
        </div>
      </div>

      {/* Tax ID fields */}
      {data.usPerson !== undefined && (
        <div className="rounded-xl border border-border bg-card shadow-sm ">
          <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
            <h3 className="text-sm font-semibold">{isUS ? 'U.S. Tax Identification' : 'Foreign Tax Information'}</h3>
          </div>
          <div className="px-5 py-5 space-y-4">
            {isUS ? (
              <>
                <div className="space-y-2">
                  <Label>Tax ID Type <span className="text-destructive">*</span></Label>
                  <div className="flex gap-3">
                    {[
                      { value: 'ssn', label: 'SSN', description: 'Social Security Number' },
                      { value: 'ein', label: 'EIN', description: 'Employer Identification Number' },
                    ].map(opt => {
                      const sel = data.taxIdType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onChange({ taxIdType: opt.value })}
                          className={cn(
                            'flex-1 flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-150',
                            sel ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/40'
                          )}
                        >
                          <div className={cn(
                            'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                            sel ? 'border-primary' : 'border-muted-foreground/40'
                          )}>
                            {sel && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError msg={errors.taxIdType} />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {data.taxIdType === 'ein' ? 'Employer Identification Number (EIN)' : 'Social Security Number (SSN)'}
                    {' '}<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={data.taxId || ''}
                    onChange={e => onChange({ taxId: e.target.value })}
                    placeholder={data.taxIdType === 'ein' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                    className={errors.taxId ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.taxId} />
                </div>
                <InfoBox>
                  Your SSN/EIN is encrypted using bank-level security. It is used solely for IRS reporting and will never be shared.
                </InfoBox>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Country of Tax Residence <span className="text-destructive">*</span></Label>
                  <Select value={data.taxCountry || ''} onValueChange={v => onChange({ taxCountry: v })}>
                    <SelectTrigger className={errors.taxCountry ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError msg={errors.taxCountry} />
                </div>
                <div className="space-y-1.5">
                  <Label>Foreign Tax ID <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.taxId || ''}
                    onChange={e => onChange({ taxId: e.target.value })}
                    placeholder="Your country's tax ID"
                    className={errors.taxId ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.taxId} />
                  <p className="text-xs text-muted-foreground mt-1">Enter your tax identification number from your country of residence.</p>
                </div>
                <InfoBox>
                  Non-US authors may be subject to withholding tax depending on your country's tax treaty with the United States. You may qualify for a reduced rate.
                </InfoBox>
              </>
            )}

          </div>
        </div>
      )}

      {/* Preview & Sign — shown once required fields are complete */}
      {canShowPreview && (
        <div className="rounded-xl border border-border bg-card shadow-sm ">
          <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
            <h3 className="text-sm font-semibold">Preview and Sign</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Please review your information, then provide your electronic signature to submit.
            </p>
          </div>
          <div className="px-5 py-5 space-y-5">

            {/* Step 1: E-signature consent — always shown */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={!!data.esignConsent}
                  onCheckedChange={v => onChange({ esignConsent: !!v, ...(!v && { esignature: '', taxCertified: false }) })}
                  className="mt-0.5 shrink-0"
                />
                <p className="text-sm leading-relaxed">
                  I consent to provide an electronic signature for the information provided as per IRS Form <strong>{formName}</strong>
                </p>
              </label>
              <FieldError msg={errors.esignConsent} />
            </div>

            {/* Step 2: Form preview + signature — only after consent */}
            {data.esignConsent && (
              <>
                {/* Form document preview */}
                <div className="border-2 border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b border-border text-center text-muted-foreground font-mono text-[11px]">
                    Reference ID: {FORM_REF_ID}
                  </div>
                  <div className="bg-white px-6 py-6 space-y-4">
                    {/* Form Header */}
                    <div className="text-center border-b-2 border-black pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold">Form {formName}</span>
                        <span className="text-[10px]">Department of the Treasury - Internal Revenue Service</span>
                      </div>
                      <h3 className="text-sm font-bold uppercase tracking-wide">
                        {isUS ? 'Request for Taxpayer Identification Number and Certification' : 'Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding'}
                      </h3>
                    </div>

                    {/* Form Content */}
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Name</p>
                          <p className="font-medium">{data.legalFirstName || '[First Name]'} {data.legalLastName || '[Last Name]'}</p>
                        </div>
                        {isUS && data.taxIdType && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">
                              {data.taxIdType === 'ein' ? 'Employer ID Number' : 'Social Security Number'}
                            </p>
                            <p className="font-mono">{data.taxId ? '***-**-' + data.taxId.slice(-4) : '[Not Provided]'}</p>
                          </div>
                        )}
                        {!isUS && (
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Country of Tax Residence</p>
                            <p className="font-medium">{data.taxCountry || '[Not Selected]'}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Address</p>
                        <p className="text-xs">
                          {data.addressLine1 || '[Address Line 1]'}<br />
                          {data.city || '[City]'}, {data.state || '[State]'} {data.zip || '[ZIP]'}<br />
                          {data.country || '[Country]'}
                        </p>
                      </div>

                      {/* Signature Section */}
                      <div className="border-t-2 border-dashed border-muted-foreground/30 pt-4 mt-4">
                        <p className="text-[11px] font-semibold mb-3">CERTIFICATION</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">
                          Under penalties of perjury, I certify that the information provided on this form is true, correct, and complete.
                        </p>
                        
                        {/* Signature Display Box */}
                        <div className="border-2 border-primary/30 bg-primary/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Electronic Signature</p>
                            <FileText className="w-4 h-4 text-primary/50" />
                          </div>
                          {data.esignature?.trim() ? (
                            <p className="text-2xl font-serif italic text-primary mt-2 border-b-2 border-primary/40 pb-2">
                              {data.esignature}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground/50 italic border-b-2 border-dashed border-muted-foreground/30 pb-2">
                              [Your signature will appear here]
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-2">
                            Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 px-4 py-2 border-t border-border text-center">
                    <p className="text-[10px] text-muted-foreground">IRS Form {formName} — Document Preview</p>
                  </div>
                </div>

                {/* E-signature input */}
                <div className="space-y-1.5">
                  <Label>Electronic Signature <span className="text-destructive">*</span></Label>
                  <p className="text-xs text-muted-foreground">Type your full legal name exactly as it appears on your ID</p>
                  <Input
                    value={data.esignature || ''}
                    onChange={e => onChange({ esignature: e.target.value })}
                    placeholder="Your full legal name"
                    className={cn('font-serif text-base italic', errors.esignature ? 'border-destructive' : '')}
                  />
                  <FieldError msg={errors.esignature} />
                </div>

                {/* Perjury certification */}
                <div className="pt-2 border-t border-border space-y-1">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={!!data.taxCertified}
                      onCheckedChange={v => onChange({ taxCertified: !!v })}
                      className="mt-0.5 shrink-0"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Under penalties of perjury, I certify that all information I have entered is true, correct, and complete.
                      I understand that any false statement may subject me to penalties.
                    </p>
                  </label>
                  <FieldError msg={errors.taxCertified} />
                </div>

                {data.taxCertified && data.esignature?.trim() && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700 font-medium">Your tax form is signed and ready to submit.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={saving} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            <>Complete Setup <ChevronRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}