import React, { useState } from 'react';
import {
  DollarSign, CreditCard, AlertCircle, CheckCircle2, Clock,
  TrendingUp, CalendarDays, Download, ChevronRight, Info,
  Banknote, Wallet, ArrowDownToLine, BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Mock monthly royalty chart data (last 6 months)
const MONTHLY_DATA = [
  { month: 'Dec', royalties: 0 },
  { month: 'Jan', royalties: 0 },
  { month: 'Feb', royalties: 0 },
  { month: 'Mar', royalties: 0 },
  { month: 'Apr', royalties: 0 },
  { month: 'May', royalties: 0 },
];

const PAYOUT_SCHEDULE = [
  { label: 'Royalties Calculated', day: 'End of each month' },
  { label: 'Payment Processed', day: '30 days after month-end' },
  { label: 'Minimum Threshold', day: '$10.00' },
  { label: 'Currency', day: 'USD' },
];

function StatCard({ icon: Icon, label, value, sub, color = 'text-foreground', highlight }) {
  return (
    <div className={`bg-card border rounded-xl p-5 ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function PaymentsTab({ books, authorProfile }) {
  const [activeSection, setActiveSection] = useState('overview');

  const published = books.filter(b => b.status === 'published' && b.list_price);
  const totalEstimatedPerSale = published.reduce((sum, b) => sum + b.list_price * (parseFloat(b.royalty_plan || 70) / 100), 0);

  const paymentMethod = authorProfile?.payment_method;
  const hasPaymentMethod = !!paymentMethod;

  const paymentDisplay = paymentMethod === 'paypal'
    ? { type: 'PayPal', detail: authorProfile.paypal_email, icon: Wallet }
    : paymentMethod === 'bank_transfer'
      ? { type: 'Bank Transfer', detail: `Account holder: ${authorProfile.bank_account_name}`, icon: Banknote }
      : null;

  const royaltyPlan = published.length > 0 ? (published[0].royalty_plan || '70') : '70';

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'royalties', label: 'Royalty Breakdown' },
    { id: 'payouts', label: 'Payout Schedule' },
    { id: 'payment-method', label: 'Payment Method' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Payments & Royalties</h2>
          <p className="text-sm text-muted-foreground">Track your earnings, royalties, and payout settings.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> Export Statement
        </Button>
      </div>

      {/* Alert if no payment method */}
      {!hasPaymentMethod && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Payment method not configured</p>
            <p className="text-xs text-amber-700 mt-0.5">Add your bank or PayPal details in Author Profile to receive royalty payouts.</p>
          </div>
        </div>
      )}

      {/* Sub-nav */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSection === s.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign}   label="Lifetime Earnings"  value="$0.00"  sub="All time"          color="text-green-600" highlight />
            <StatCard icon={Clock}        label="Pending Payout"     value="$0.00"  sub="Next payout: Jun 30" />
            <StatCard icon={CheckCircle2} label="Total Paid Out"     value="$0.00"  sub="All time" />
            <StatCard icon={BarChart3}    label="Published Titles"   value={`${published.length}`} sub="Generating royalties" />
          </div>

          {/* Earnings Chart */}
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-sm">Monthly Royalties</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
              </div>
              <Badge variant="outline" className="text-xs">No sales yet</Badge>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MONTHLY_DATA} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Royalties']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="royalties" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Royalty Rate Info */}
          <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Your Royalty Rate: {royaltyPlan}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You earn {royaltyPlan}% of the list price for every sale on Classpedia.
                {published.length > 0 && ` Potential earnings: $${totalEstimatedPerSale.toFixed(2)} per combined sale across all books.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ROYALTY BREAKDOWN */}
      {activeSection === 'royalties' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/30 grid grid-cols-12 gap-4">
              <span className="col-span-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Book</span>
              <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</span>
              <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Price</span>
              <span className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Rate</span>
              <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Per Sale</span>
            </div>
            {books.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No books yet. Publish a book to see royalty breakdown.</p>
              </div>
            ) : (
              <div className="divide-y">
                {books.map(book => {
                  const rate = parseFloat(book.royalty_plan || 70) / 100;
                  const perSale = book.list_price ? book.list_price * rate : null;
                  return (
                    <div key={book.id} className="px-5 py-4 grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5 min-w-0">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author_name}</p>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Badge className={`text-[10px] ${
                          book.status === 'published' ? 'bg-primary/10 text-primary' :
                          book.status === 'in_review' ? 'bg-amber-100 text-amber-700' :
                          'bg-secondary text-secondary-foreground'
                        }`}>
                          {book.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-medium">{book.list_price ? `$${book.list_price.toFixed(2)}` : '—'}</p>
                      </div>
                      <div className="col-span-1 text-center">
                        <p className="text-sm text-muted-foreground">{book.royalty_plan || 70}%</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className={`text-sm font-bold ${perSale ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {perSale ? `$${perSale.toFixed(2)}` : '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Royalty rules */}
          <div className="bg-accent/40 border border-accent rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-accent-foreground space-y-1">
              <p className="font-semibold">How royalties work</p>
              <p>• 70% plan: Available for books priced $2.99–$9.99, delivered to supported marketplaces.</p>
              <p>• 35% plan: Available for all price ranges and all territories.</p>
              <p>• Classpedia Select: Earn additional bonuses from the global fund during free promotion days.</p>
              <p>• Royalties are calculated at end of each month and paid 30 days later.</p>
            </div>
          </div>
        </div>
      )}

      {/* PAYOUT SCHEDULE */}
      {activeSection === 'payouts' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-sm">Payout Timeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5">How and when you get paid</p>
            </div>
            <div className="p-5 space-y-4">
              {[
                { step: '1', title: 'Sales Recorded', desc: 'Sales are recorded daily on the Classpedia platform.', icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
                { step: '2', title: 'Royalties Calculated', desc: 'At the end of each calendar month, total royalties are calculated for all your published books.', icon: DollarSign, color: 'bg-green-100 text-green-600' },
                { step: '3', title: 'Payment Processed', desc: '30 days after the close of the month, Classpedia processes your payment via your selected method.', icon: ArrowDownToLine, color: 'bg-purple-100 text-purple-600' },
                { step: '4', title: 'Funds Received', desc: 'PayPal payments arrive within 1-3 days. Bank transfers take 5-7 business days depending on location.', icon: CheckCircle2, color: 'bg-primary/10 text-primary' },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-4 border-b last:border-0">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-sm">Payout Rules</h3>
            </div>
            <div className="divide-y">
              {PAYOUT_SCHEDULE.map(row => (
                <div key={row.label} className="flex justify-between px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium">{row.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History Placeholder */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">Transaction History</h3>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" /> Filter by date
              </Button>
            </div>
            <div className="px-5 py-12 text-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your payout history will appear here once sales begin.</p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT METHOD */}
      {activeSection === 'payment-method' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Current Payment Method</h3>
            </div>

            {paymentDisplay ? (
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center border shrink-0">
                  <paymentDisplay.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{paymentDisplay.type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{paymentDisplay.detail}</p>
                </div>
                <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">No payment method set up</p>
                  <p className="text-xs text-amber-700 mt-0.5">You must add a payment method to receive royalty payouts.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="mt-4 divide-y border rounded-lg overflow-hidden">
                {[
                  { label: 'Account Holder', value: authorProfile?.bank_account_name },
                  { label: 'Account Number', value: authorProfile?.bank_account_number ? `****${authorProfile.bank_account_number.slice(-4)}` : '—' },
                  { label: 'Routing / IBAN', value: authorProfile?.bank_routing_number ? `****${authorProfile.bank_routing_number.slice(-4)}` : '—' },
                ].filter(r => r.value && r.value !== '—').map(row => (
                  <div key={row.label} className="flex justify-between px-4 py-3 bg-secondary/20">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="flex justify-between px-4 py-3 bg-secondary/20">
                  <span className="text-xs text-muted-foreground">PayPal Email</span>
                  <span className="text-xs font-medium">{authorProfile?.paypal_email}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              To update your payment method, please contact Classpedia support. Payment details cannot be changed self-service for security reasons.
            </p>
          </div>

          {/* Tax Summary */}
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Tax Information</h3>
            </div>
            <div className="divide-y border rounded-lg overflow-hidden">
              {[
                { label: 'US Person', value: authorProfile?.us_person ? 'Yes — W-9 on file' : 'No — W-8BEN on file' },
                { label: 'Tax Country', value: authorProfile?.tax_country || authorProfile?.country || '—' },
                { label: 'Tax ID Type', value: authorProfile?.tax_id_type?.toUpperCase() || '—' },
                { label: 'Tax ID', value: authorProfile?.tax_id ? `****${authorProfile.tax_id.slice(-4)}` : '—' },
              ].map(row => (
                <div key={row.label} className="flex justify-between px-4 py-3 bg-secondary/20">
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="text-xs font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Classpedia may withhold taxes depending on your tax status and country. Review your tax form annually.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}