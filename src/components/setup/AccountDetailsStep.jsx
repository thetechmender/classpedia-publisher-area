import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, ChevronRight, AlertCircle, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

export default function AccountDetailsStep({ data, onChange, errors, onNext, onBack }) {
  const isCorperation = data.business_type === 'corporation';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Account Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Select your business type and confirm your information.</p>
      </div>

      {/* Business Type */}
      <div className="space-y-3">
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

      <div className="border-t border-border" />

      {!isCorperation ? (
        /* Individual: show account holder (name from identity step) */
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Account Holder</p>
          <p className="text-base text-foreground">{data.full_name || '—'}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="mt-1 text-xs"
          >
            Edit identity
          </Button>
        </div>
      ) : (
        /* Corporation fields */
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
              The name of your publishing company. If you have not established a separate company entity (corporation, etc), this can be your first and last name.
            </p>
            <FieldError msg={errors.company_name} />
          </div>

          <div className="space-y-1.5">
            <Label>Address <span className="text-destructive">*</span></Label>
            {data.address_line1 ? (
              <div className="text-sm text-foreground">
                <p>{data.address_line1}{data.address_line2 ? `, ${data.address_line2}` : ''}</p>
                <p>{[data.city, data.state, data.zip].filter(Boolean).join(', ')}</p>
                <p>{data.country}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not selected</p>
            )}
            <Button variant="outline" size="sm" onClick={onBack} className="text-xs mt-1">
              Enter a New Address
            </Button>
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