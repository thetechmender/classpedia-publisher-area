import React, { useState } from 'react';
import {
  DollarSign, CreditCard, AlertCircle, CheckCircle2, Clock,
  TrendingUp, Download, Info, Banknote, Wallet, FileText,
  ArrowDownToLine, BarChart3, CalendarDays, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHLY_DATA = [
  { month: 'Dec', royalties: 0 }, { month: 'Jan', royalties: 0 },
  { month: 'Feb', royalties: 0 }, { month: 'Mar', royalties: 0 },
  { month: 'Apr', royalties: 0 }, { month: 'May', royalties: 0 },
];

const PAYOUT_STEPS = [
  { icon: BarChart3, color: 'bg-blue-100 text-blue-600', title: 'Sales Recorded', desc: 'Sales are recorded in real-time on the platform.' },
  { icon: DollarSign, color: 'bg-green-100 text-green-600', title: 'Royalties Calculated', desc: 'At end of each calendar month, total royalties are finalized.' },
  { icon: ArrowDownToLine, color: 'bg-purple-100 text-purple-600', title: 'Payment Processed', desc: '30 days after month-end, your payment is processed via your chosen method.' },
  { icon: CheckCircle2, color: 'bg-primary/10 text-primary', title: 'Funds Received', desc: 'PayPal: 1–3 days. Bank transfer: 5–7 business days.' },
];

function StatCard({ icon: Icon, label, value, sub, color = 'text-foreground', accent }) {
  return (
    <div className={`bg-card border rounded-xl p-5 ${accent ? 'border-primary/30 bg-primary/5' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'royalties', label: 'By Book' },
  { id: 'method', label: 'Payment Method' },
  { id: 'tax', label: 'Tax Info' },
];

export default function PaymentsTab({ books, authorProfile }) {
  const [tab, setTab] = useState('overview');

  const published = books.filter(b => b.status === 'published' && b.list_price);
  const paymentMethod = authorProfile?.payment_method;

  const paymentDisplay = paymentMethod === 'paypal'
    ? { type: 'PayPal', detail: authorProfile.paypal_email, icon: Wallet }
    : paymentMethod === 'bank_transfer'
      ? { type: 'Bank Transfer', detail: `Account: ${authorProfile.bank_account_name || '—'}`, icon: Banknote }
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Payments & Royalties</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your earnings, payout history, and payment settings.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> Export Statement
        </Button>
      </div>

      {/* Alert */}
      {!paymentMethod && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No payment method configured</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add your bank account or PayPal in your profile to receive royalty payouts.
            </p>
          </div>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign}   label="Lifetime Earnings"  value="$0.00" sub="All time"              color="text-emerald-600" accent />
            <StatCard icon={Clock}        label="Pending Payout"     value="$0.00" sub="Next payout: Jun 30"  />
            <StatCard icon={CheckCircle2} label="Total Paid Out"     value="$0.00" sub="All time"             />
            <StatCard icon={BarChart3}    label="Published Titles"   value={`${published.length}`} sub="Earning royalties" />
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-sm">Monthly Royalties</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground">No sales yet</Badge>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={MONTHLY_DATA} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${Number(v).toFixed(2)}`, 'Royalties']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="royalties" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Your Royalty Rate: 70%</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You earn 70% of the list price for every sale on Classpedia.
                {published.length > 0 && ` ${published.length} published title${published.length > 1 ? 's' : ''} currently generating royalties.`}
              </p>
            </div>
            <button onClick={() => setTab('royalties')} className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline shrink-0">
              See breakdown <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* BY BOOK */}
      {tab === 'royalties' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-secondary/30">
              <h3 className="text-sm font-semibold">Royalty Breakdown by Book</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated earnings per sale based on your pricing and royalty plan.</p>
            </div>
            {books.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No books yet. Publish a title to see your royalty breakdown.</p>
              </div>
            ) : (
              <>
                <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2.5 border-b bg-secondary/20">
                  <span className="col-span-5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Book</span>
                  <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Status</span>
                  <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Price</span>
                  <span className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Rate</span>
                  <span className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Per Sale</span>
                </div>
                <div className="divide-y">
                  {books.map(book => {
                    const rate = parseFloat(book.royalty_plan || 70) / 100;
                    const perSale = book.list_price ? book.list_price * rate : null;
                    return (
                      <div key={book.id} className="px-5 py-4 grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          {book.cover_url
                            ? <img src={book.cover_url} alt={book.title} className="w-8 h-11 object-cover rounded shadow-sm shrink-0" />
                            : <div className="w-8 h-11 bg-secondary rounded flex items-center justify-center shrink-0 text-muted-foreground text-xs font-bold">?</div>
                          }
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{book.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{book.author_name}</p>
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            book.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                            book.status === 'in_review' ? 'bg-amber-100 text-amber-700' :
                            'bg-secondary text-muted-foreground'
                          }`}>{book.status.replace('_', ' ')}</span>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-medium">{book.list_price ? `$${book.list_price.toFixed(2)}` : '—'}</p>
                        </div>
                        <div className="col-span-1 text-center">
                          <p className="text-sm text-muted-foreground">{book.royalty_plan || 70}%</p>
                        </div>
                        <div className="col-span-2 text-right">
                          <p className={`text-sm font-bold ${perSale ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {perSale ? `$${perSale.toFixed(2)}` : '—'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>


        </div>
      )}

      {tab === 'payouts_disabled' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/30">
              <h3 className="font-semibold text-sm">Payout Timeline</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Exactly how and when you receive your earnings</p>
            </div>
            <div className="p-5 space-y-4">
              {PAYOUT_STEPS.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-4 border-b last:border-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Step {i + 1}</span>
                    </div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/30">
              <h3 className="font-semibold text-sm">Payout Rules</h3>
            </div>
            <div className="divide-y">
              {[
                { label: 'Royalties Calculated', value: 'End of each calendar month' },
                { label: 'Payment Sent', value: '30 days after month-end' },
                { label: 'Minimum Threshold', value: '$10.00' },
                { label: 'Currency', value: 'USD' },
              ].map(row => (
                <div key={row.label} className="flex justify-between px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/30 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Transaction History</h3>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" /> Filter by date
              </Button>
            </div>
            <div className="px-5 py-14 text-center">
              <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your payout history will appear here once sales begin.</p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT METHOD */}
      {tab === 'method' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Payment Method on File</h3>
            </div>

            {paymentDisplay ? (
              <div className="flex items-center gap-4 p-4 bg-secondary/40 rounded-xl border">
                <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center border shrink-0">
                  <paymentDisplay.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{paymentDisplay.type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{paymentDisplay.detail}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">No payment method set up</p>
                  <p className="text-xs text-amber-700 mt-0.5">Required to receive royalty payouts. Go to Profile → Payment Method to add one.</p>
                </div>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="divide-y border rounded-lg overflow-hidden">
                {[
                  { label: 'Account Holder', value: authorProfile?.bank_account_name },
                  { label: 'Account Number', value: authorProfile?.bank_account_number ? `****${authorProfile.bank_account_number.slice(-4)}` : null },
                  { label: 'Routing / IBAN',  value: authorProfile?.bank_routing_number ? `****${authorProfile.bank_routing_number.slice(-4)}` : null },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex justify-between px-4 py-3 bg-secondary/20">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="border rounded-lg overflow-hidden">
                <div className="flex justify-between px-4 py-3 bg-secondary/20">
                  <span className="text-xs text-muted-foreground">PayPal Email</span>
                  <span className="text-xs font-medium">{authorProfile?.paypal_email}</span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              To update payment details, contact Classpedia support — changes cannot be made self-service for security.
            </div>
          </div>

        </div>
      )}

      {/* TAX INFO */}
      {tab === 'tax' && (
        <div className="space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-secondary/30">
              <h3 className="font-semibold text-sm">Tax Profile</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your tax information as submitted during account setup.</p>
            </div>
            <div className="divide-y">
              {[
                { label: 'Tax Form', value: authorProfile?.us_person === true ? 'W-9 (US Person)' : authorProfile?.us_person === false ? 'W-8BEN (Non-US)' : '—' },
                { label: 'Tax Country', value: authorProfile?.tax_country || authorProfile?.country || '—' },
                { label: 'Tax ID Type', value: authorProfile?.tax_id_type?.toUpperCase() || '—' },
                { label: 'Tax ID', value: authorProfile?.tax_id ? `****${authorProfile.tax_id.slice(-4)}` : '—' },
              ].map(row => (
                <div key={row.label} className="flex justify-between px-5 py-3.5">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium">{row.value}</span>
                </div>
              ))}
            </div>
            {authorProfile?.us_person !== undefined && (
              <div className="px-5 py-4 border-t flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">IRS Form {authorProfile.us_person ? 'W-9' : 'W-8BEN'}</p>
                    <p className="text-xs text-muted-foreground">
                      Signed during account setup{authorProfile.esignature ? ` · Signed by ${authorProfile.esignature}` : ' · On file'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => toast.info('Document download is available via Classpedia support.')}>
                  <Download className="w-3.5 h-3.5" /> Download Form
                </Button>
              </div>
            )}
            <div className="px-5 py-3 border-t bg-secondary/10">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Tax information is legally sensitive. Contact support to make any changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}