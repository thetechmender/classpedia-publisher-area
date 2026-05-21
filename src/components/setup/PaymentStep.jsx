import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CreditCard, AlertCircle, Info, Building2, Wallet, Loader2 } from 'lucide-react';
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

export default function PaymentStep({ data, onChange, errors, onNext, onBack, saving = false }) {
  const method = data.paymentMethod || 'bank_transfer';

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
      <div className="rounded-xl border border-border bg-card shadow-sm">
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
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Payment Method <span className="text-destructive">*</span></h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose how you'd like to receive payments</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-2.5">
            {[
              { value: 'bank_transfer', label: 'Electronic Funds Transfer (EFT)', description: 'Direct deposit to your bank account. Available for most countries.', Icon: Building2 },
              { value: 'paypal', label: 'PayPal', description: 'Receive payments directly to your PayPal account.', Icon: Wallet },
            ].map(opt => {
              const selected = method === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ paymentMethod: opt.value })}
                  className={cn(
                    'w-full flex items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-all duration-150',
                    selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background hover:border-primary/30 hover:bg-muted/30'
                  )}
                >
                  <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors', selected ? 'border-primary' : 'border-muted-foreground/30')}>
                    {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div className={cn('w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors', selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                    <opt.Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {method === 'bank_transfer' && (
            <div className="mt-4 space-y-4 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <Label>Account Holder Name <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bankAccountName || ''}
                  onChange={e => onChange({ bankAccountName: e.target.value })}
                  placeholder="John Doe"
                  className={errors.bankAccountName ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.bankAccountName} />
              </div>
              <div className="space-y-1.5">
                <Label>Account Number <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bankAccountNumber || ''}
                  onChange={e => onChange({ bankAccountNumber: e.target.value })}
                  placeholder="000123456789"
                  className={errors.bankAccountNumber ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.bankAccountNumber} />
              </div>
              <div className="space-y-1.5">
                <Label>Routing Number / IBAN <span className="text-destructive">*</span></Label>
                <Input
                  value={data.bankRoutingNumber || ''}
                  onChange={e => onChange({ bankRoutingNumber: e.target.value })}
                  placeholder="021000021 or IBAN"
                  className={errors.bankRoutingNumber ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.bankRoutingNumber} />
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
                  value={data.paypalEmail || ''}
                  onChange={e => onChange({ paypalEmail: e.target.value })}
                  placeholder="you@paypal.com"
                  className={errors.paypalEmail ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.paypalEmail} />
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
        <Button onClick={onNext} disabled={saving} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <>Save & Continue <ChevronRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}