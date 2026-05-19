import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, FileText, AlertCircle, Info, Shield, CheckCircle2 } from 'lucide-react';
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

export default function TaxStep({ data, onChange, errors, onNext, onBack }) {
  const isUS = data.us_person === true;
  const formName = isUS ? 'W-9' : 'W-8BEN';
  const formTitle = isUS
    ? 'Request for Taxpayer Identification Number and Certification'
    : 'Certificate of Foreign Status of Beneficial Owner for United States Tax Withholding and Reporting (Individuals)';

  // Show preview+sign block once required fields are filled
  const canShowPreview = data.us_person !== undefined && (
    isUS
      ? (data.tax_id_type && data.tax_id?.trim())
      : (data.tax_country)
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
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">US Tax Status <span className="text-destructive">*</span></h3>
        </div>
        <div className="px-5 py-5 space-y-3">
          <RadioGroup
            value={data.us_person === true ? 'yes' : data.us_person === false ? 'no' : ''}
            onValueChange={v => onChange({ us_person: v === 'yes' })}
            className="space-y-3"
          >
            <label className={cn(
              'flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
              data.us_person === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="yes" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">I am a U.S. person</p>
                <p className="text-xs text-muted-foreground mt-0.5">U.S. citizen, resident alien, or U.S. entity. You'll complete a W-9 equivalent.</p>
              </div>
            </label>
            <label className={cn(
              'flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
              data.us_person === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="no" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium">I am not a U.S. person</p>
                <p className="text-xs text-muted-foreground mt-0.5">Non-U.S. individual or entity. You'll complete a W-8 equivalent.</p>
              </div>
            </label>
          </RadioGroup>
          <FieldError msg={errors.us_person} />
        </div>
      </div>

      {/* Tax ID fields */}
      {data.us_person !== undefined && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
            <h3 className="text-sm font-semibold">{isUS ? 'U.S. Tax Identification' : 'Foreign Tax Information'}</h3>
          </div>
          <div className="px-5 py-5 space-y-4">
            {isUS ? (
              <>
                <div className="space-y-1.5">
                  <Label>Tax ID Type <span className="text-destructive">*</span></Label>
                  <RadioGroup
                    value={data.tax_id_type || ''}
                    onValueChange={v => onChange({ tax_id_type: v })}
                    className="flex gap-4"
                  >
                    {['ssn', 'ein'].map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <RadioGroupItem value={t} />
                        <span className="text-sm font-medium uppercase">{t}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <FieldError msg={errors.tax_id_type} />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {data.tax_id_type === 'ein' ? 'Employer Identification Number (EIN)' : 'Social Security Number (SSN)'}
                    {' '}<span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={data.tax_id || ''}
                    onChange={e => onChange({ tax_id: e.target.value })}
                    placeholder={data.tax_id_type === 'ein' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                    className={errors.tax_id ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.tax_id} />
                </div>
                <InfoBox>
                  Your SSN/EIN is encrypted using bank-level security. It is used solely for IRS reporting and will never be shared.
                </InfoBox>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Country of Tax Residence <span className="text-destructive">*</span></Label>
                  <Select value={data.tax_country || ''} onValueChange={v => onChange({ tax_country: v })}>
                    <SelectTrigger className={errors.tax_country ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError msg={errors.tax_country} />
                </div>
                <div className="space-y-1.5">
                  <Label>Foreign Tax ID (if applicable)</Label>
                  <Input
                    value={data.tax_id || ''}
                    onChange={e => onChange({ tax_id: e.target.value })}
                    placeholder="Your country's tax ID"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave blank if you don't have a foreign tax ID.</p>
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
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
            <h3 className="text-sm font-semibold">Preview and Sign</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Please review your information, then provide your electronic signature to submit.
            </p>
          </div>
          <div className="px-5 py-5 space-y-4">

            {/* E-signature consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={!!data.esign_consent}
                onCheckedChange={v => onChange({ esign_consent: !!v })}
                className="mt-0.5"
              />
              <p className="text-sm leading-relaxed">
                I consent to provide electronic signature for the information provided as per IRS Form {formName}
              </p>
            </label>

            {data.esign_consent && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  If you provide an electronic signature, you will be able to submit your tax information immediately.
                </p>
              </div>
            )}

            {/* Form preview card */}
            <div className="border border-border rounded-lg overflow-hidden text-xs">
              <div className="bg-muted/50 px-4 py-2 border-b border-border text-center text-muted-foreground font-mono">
                Reference Id: {FORM_REF_ID}
              </div>
              <div className="grid grid-cols-[80px_1fr_80px] border-b border-border">
                <div className="px-3 py-2 border-r border-border text-muted-foreground">
                  <p className="font-medium text-[10px]">Form {formName}</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="font-bold text-sm leading-snug">SUBSTITUTE</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{formTitle}</p>
                </div>
                <div className="px-2 py-2 border-l border-border text-[9px] text-muted-foreground text-center">
                  SUBSTITUTE<br />(Rev. October 2021)
                </div>
              </div>

              {/* Fields preview */}
              <div className="divide-y divide-border">
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-1">1 Name of individual who is the beneficial owner</p>
                    <p className="font-medium">{[data.first_name, data.last_name].filter(Boolean).join(' ') || '—'}</p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-1">2 {isUS ? 'Tax ID Type' : 'Country of citizenship'}</p>
                    <p className="font-medium">{isUS ? (data.tax_id_type?.toUpperCase() || '—') : (data.tax_country || data.country || '—')}</p>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[10px] text-muted-foreground mb-1">3 Permanent residence address</p>
                  <p className="font-medium">{[data.address_line1, data.city, data.state, data.zip, data.country].filter(Boolean).join(', ') || '—'}</p>
                </div>
                {isUS && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-1">4 {data.tax_id_type === 'ein' ? 'Employer Identification Number (EIN)' : 'Social Security Number (SSN)'}</p>
                    <p className="font-medium tracking-widest">{data.tax_id ? '•'.repeat(data.tax_id.length) : '—'}</p>
                  </div>
                )}
                {!isUS && data.tax_id && (
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-1">4 Foreign Tax ID</p>
                    <p className="font-medium">{data.tax_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certification */}
            <div className="pt-2 border-t border-border">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={!!data.tax_certified}
                  onCheckedChange={v => onChange({ tax_certified: !!v })}
                  className="mt-0.5"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Under penalties of perjury, I certify that all information I have entered is true, correct, and complete.
                  I understand that any false statement may subject me to penalties.
                </p>
              </label>
              <FieldError msg={errors.tax_certified} />
            </div>

            {data.tax_certified && data.esign_consent && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  Your tax form is signed and ready to submit.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}