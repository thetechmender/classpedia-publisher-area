import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, ChevronRight, CreditCard, AlertCircle, Info } from 'lucide-react';
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

export default function PaymentStep({ data, onChange, errors, onNext, onBack }) {
  const method = data.payment_method || 'bank_transfer';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">Getting Paid</h2>
          <p className="text-sm text-muted-foreground">Set up how you'll receive your royalty payments</p>
        </div>
      </div>

      {/* How royalties work */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">How Royalties Work</h3>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-secondary/40 p-4">
              <p className="text-2xl font-bold text-primary">70%</p>
              <p className="text-xs text-muted-foreground mt-1">Your royalty per sale</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-4">
              <p className="text-2xl font-bold text-foreground">Monthly</p>
              <p className="text-xs text-muted-foreground mt-1">Payment schedule</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-4">
              <p className="text-2xl font-bold text-foreground">$10</p>
              <p className="text-xs text-muted-foreground mt-1">Minimum threshold</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            Payments are sent monthly, approximately 60 days after the end of the month in which the sale occurred.
            You'll receive a payment once your balance exceeds the minimum threshold.
          </p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Payment Method <span className="text-destructive">*</span></h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose how you'd like to receive payments</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <RadioGroup
            value={method}
            onValueChange={v => onChange({ payment_method: v })}
            className="space-y-3"
          >
            <label className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
              method === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="bank_transfer" />
              <div>
                <p className="text-sm font-medium">Electronic Funds Transfer (EFT)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Direct deposit to your bank account. Available for most countries.</p>
              </div>
            </label>
            <label className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all',
              method === 'paypal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="paypal" />
              <div>
                <p className="text-sm font-medium">PayPal</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive payments directly to your PayPal account.</p>
              </div>
            </label>
          </RadioGroup>

          {method === 'bank_transfer' && (
            <div className="mt-4 space-y-4 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <Label>Account Holder Name <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bank_account_name || ''}
                  onChange={e => onChange({ bank_account_name: e.target.value })}
                  placeholder="John Doe"
                  className={errors.bank_account_name ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.bank_account_name} />
              </div>
              <div className="space-y-1.5">
                <Label>Account Number <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bank_account_number || ''}
                  onChange={e => onChange({ bank_account_number: e.target.value })}
                  placeholder="000123456789"
                  className={errors.bank_account_number ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.bank_account_number} />
              </div>
              <div className="space-y-1.5">
                <Label>Routing Number / IBAN <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bank_routing_number || ''}
                  onChange={e => onChange({ bank_routing_number: e.target.value })}
                  placeholder="021000021 or IBAN"
                  className={errors.bank_routing_number ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.bank_routing_number} />
              </div>
              <InfoBox>
                Your banking information is encrypted and stored securely. It is only used to send your royalty payments.
              </InfoBox>
            </div>
          )}

          {method === 'paypal' && (
            <div className="mt-4 space-y-4 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <Label>PayPal Email Address <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={data.paypal_email || ''}
                  onChange={e => onChange({ paypal_email: e.target.value })}
                  placeholder="you@paypal.com"
                  className={errors.paypal_email ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.paypal_email} />
              </div>
              <InfoBox>
                Make sure this is the email associated with your active PayPal account. Payments sent to an incorrect address cannot be recovered.
              </InfoBox>
            </div>
          )}
        </div>
      </div>

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