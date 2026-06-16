import React, { useState, useMemo } from 'react';
import { BookOpen, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import FilterPills from '@/components/shared/FilterPills';

const STATUS_FILTERS = ['All', 'Paid', 'Pending', 'Failed'];

const PERIOD_PRESETS = [
  { label: 'Last 3 Months', months: 3 },
  { label: 'Last 6 Months', months: 6 },
  { label: 'This Year',     months: 12 },
  { label: 'All Time',      months: null },
];

// ── Mock payment batches ──────────────────────────────────────────────────────
const MOCK_PAYMENTS = [
  {
    id: '100087724',
    status: 'Pending',
    date: '6/30/2026',
    method: 'EFT',
    amount: 23.77,
    books: [
      { title: 'The Art of Deep Learning', unitsSold: 3, perUnitRoyalty: 4.50, totalRoyalties: 13.50 },
      { title: 'Mindful Mornings', unitsSold: 2, perUnitRoyalty: 5.14, totalRoyalties: 10.27 },
    ],
  },
  {
    id: '100086511',
    status: 'Paid',
    date: '5/31/2026',
    method: 'EFT',
    amount: 49.40,
    books: [
      { title: 'The Art of Deep Learning', unitsSold: 2, perUnitRoyalty: 1.37, totalRoyalties: 2.74 },
      { title: 'Mindful Mornings', unitsSold: 4, perUnitRoyalty: 2.33, totalRoyalties: 9.32 },
      { title: 'Startup from Zero', unitsSold: 1, perUnitRoyalty: 1.60, totalRoyalties: 1.60 },
    ],
  },
  {
    id: '100085300',
    status: 'Failed',
    date: '4/30/2026',
    method: 'EFT',
    amount: 10.68,
    books: [
      { title: 'The Art of Deep Learning', unitsSold: 2, perUnitRoyalty: 2.67, totalRoyalties: 5.34 },
      { title: 'Startup from Zero', unitsSold: 3, perUnitRoyalty: 1.78, totalRoyalties: 5.34 },
    ],
  },
];

const STATUS_CONFIG = {
  Pending:    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  Paid:       { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  Failed:     { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500' },
  Processing: { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-secondary', text: 'text-foreground', dot: 'bg-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full', cfg.bg, cfg.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {status}
    </span>
  );
}

export default function BookRoyaltiesTable({ books = [], presetIdx = 1, statusFilter = 'All', onFilterChange }) {
  const [expandedId, setExpandedId] = useState(null);

  const visiblePayments = useMemo(() => {
    let list = MOCK_PAYMENTS;
    const preset = PERIOD_PRESETS[presetIdx];
    if (preset.months) list = list.slice(0, preset.months);
    if (statusFilter !== 'All') list = list.filter(p => p.status === statusFilter);
    return list;
  }, [statusFilter, presetIdx]);

  const totalPaid    = MOCK_PAYMENTS.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = MOCK_PAYMENTS.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalFailed  = MOCK_PAYMENTS.filter(p => p.status === 'Failed').reduce((s, p) => s + p.amount, 0);
  const totalAll     = MOCK_PAYMENTS.reduce((s, p) => s + p.amount, 0);

  const kpis = [
    { label: 'Total Paid Out',    value: `$${totalPaid.toFixed(2)}`,    icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Payout',    value: `$${totalPending.toFixed(2)}`, icon: Clock,        color: 'text-amber-600 bg-amber-50' },
    { label: 'Failed Payments',   value: `$${totalFailed.toFixed(2)}`,  icon: XCircle,      color: 'text-red-500 bg-red-50' },
    { label: 'Lifetime Earnings', value: `$${totalAll.toFixed(2)}`,     icon: DollarSign,   color: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-tight">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {onFilterChange && (
        <FilterPills
          filters={['All', 'Paid', 'Pending', 'Failed'].map(s => ({ label: s, value: s, color: s === 'All' ? null : s === 'Paid' ? 'green' : s === 'Pending' ? 'amber' : 'red' }))}
          activeFilter={statusFilter}
          onFilterChange={onFilterChange}
          getCount={() => 0}
        />
      )}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b bg-muted/30">
          <h3 className="font-semibold text-sm text-foreground">Payout History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">View royalty payment history and book-by-book breakdowns</p>
        </div>
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-0 px-5 py-2.5 border-b bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div>Payment Number</div>
          <div>Status</div>
          <div>Date</div>
          <div>Method</div>
          <div>Amount</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-border/40">
          {visiblePayments.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No payments found for this filter.</div>
          )}
          {visiblePayments.map(payment => {
            const isExpanded = expandedId === payment.id;
            return (
              <div key={payment.id}>
                {/* Payment summary row */}
                <div className={cn(
                  'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-0 px-5 py-4 transition-colors hover:bg-muted/20',
                  isExpanded && 'bg-muted/10'
                )}>
                  <div className="flex items-center text-sm font-semibold tabular-nums">{payment.id}</div>

                  <div className="flex items-center">
                    <StatusBadge status={payment.status} />
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">{payment.date}</div>
                  <div className="flex items-center text-sm text-muted-foreground">{payment.method}</div>
                  <div className="flex items-center text-sm font-bold">${payment.amount.toFixed(2)}</div>
                  <div className="flex items-center">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                      className="text-sm font-medium text-primary hover:text-primary/80 underline transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div className="border-t border-border/40 bg-accent/20 px-5 pb-4 pt-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Book Breakdown</p>
                    <div className="bg-card rounded-lg border overflow-hidden">
                      {/* Sub-header */}
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2 bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b">
                        <div>Title</div>
                        <div className="text-right">Units Sold</div>
                        <div className="text-right">Per Unit Royalty</div>
                        <div className="text-right">Total Royalties</div>
                      </div>
                      {/* Book rows */}
                      {payment.books.map((book, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center shrink-0">
                              <BookOpen className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{book.title}</span>
                          </div>
                          <div className="text-sm text-right text-muted-foreground self-center">{book.unitsSold}</div>
                          <div className="text-sm text-right text-muted-foreground self-center">${book.perUnitRoyalty.toFixed(2)}</div>
                          <div className="text-sm text-right font-bold text-emerald-600 self-center">${book.totalRoyalties.toFixed(2)}</div>
                        </div>
                      ))}
                      {/* Sub-total */}
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2.5 bg-muted/30 border-t text-xs font-bold text-muted-foreground">
                        <div>Total</div>
                        <div className="text-right">{payment.books.reduce((s, b) => s + b.unitsSold, 0)}</div>
                        <div />
                        <div className="text-right text-emerald-600">${payment.books.reduce((s, b) => s + b.totalRoyalties, 0).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground px-1">
        * Figures are estimates. Actual payouts may vary based on returns, promotions, currency exchange, and tax withholding.
      </p>
    </div>
  );
}