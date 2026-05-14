import React from 'react';
import { DollarSign, CreditCard, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function PaymentsTab({ books, authorProfile }) {
  const published = books.filter(b => b.status === 'published' && b.list_price);
  const totalEstimated = published.reduce((sum, b) => sum + b.list_price * 0.7, 0);

  const paymentMethod = authorProfile?.payment_method;
  const paymentLabel = paymentMethod === 'paypal'
    ? `PayPal — ${authorProfile.paypal_email}`
    : paymentMethod === 'bank_transfer'
      ? `Bank Transfer — ${authorProfile.bank_account_name}`
      : 'Not configured';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Payments & Royalties</h2>
        <p className="text-sm text-muted-foreground">Track your earnings and payment settings.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Est. Total Royalties</span>
          </div>
          <p className="text-2xl font-bold text-green-600">${totalEstimated.toFixed(2)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Across {published.length} published book{published.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Pending Payout</span>
          </div>
          <p className="text-2xl font-bold">$0.00</p>
          <p className="text-[11px] text-muted-foreground mt-1">Paid out monthly</p>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Paid Out</span>
          </div>
          <p className="text-2xl font-bold">$0.00</p>
          <p className="text-[11px] text-muted-foreground mt-1">All time earnings</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Payment Method</h3>
          </div>
          {!paymentMethod && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5" /> Not set up
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{paymentLabel}</p>
        <p className="text-xs text-muted-foreground mt-3">
          To update payment details, go to your <span className="text-primary font-medium">Author Profile</span> tab.
        </p>
      </div>

      {/* Royalty per book */}
      {published.length > 0 ? (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-sm">Royalty Breakdown by Book</h3>
          </div>
          <div className="divide-y">
            {published.map(book => (
              <div key={book.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">List price: ${book.list_price.toFixed(2)} · 70% royalty plan</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-600">+${(book.list_price * 0.7).toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">per sale</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border rounded-xl p-8 text-center">
          <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No published books yet</p>
          <p className="text-xs text-muted-foreground mt-1">Publish a book to start earning royalties.</p>
        </div>
      )}
    </div>
  );
}