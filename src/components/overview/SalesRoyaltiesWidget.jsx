import React from 'react';
import { DollarSign, TrendingUp, ArrowRight, BarChart3, Banknote, CalendarDays } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SPARKLINE = [
  { m: 'Jan', v: 0 }, { m: 'Feb', v: 0 }, { m: 'Mar', v: 0 },
  { m: 'Apr', v: 0 }, { m: 'May', v: 0 }, { m: 'Jun', v: 0 },
];

export default function SalesRoyaltiesWidget({ books = [], onTabChange }) {
  const publishedBooks = books.filter(b => b.status === 'published');

  const estimatedRoyalties = publishedBooks.reduce((sum, b) => {
    return sum + (b.list_price || 0) * (parseFloat(b.royalty_plan || 70) / 100);
  }, 0);

  const totalCatalogValue = publishedBooks.reduce((sum, b) => sum + (b.list_price || 0), 0);
  const avgRoyaltyRate = publishedBooks.length
    ? Math.round(publishedBooks.reduce((s, b) => s + parseFloat(b.royalty_plan || 70), 0) / publishedBooks.length)
    : 70;

  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Sales & Royalties</h2>
            <p className="text-xs text-muted-foreground">Current period snapshot</p>
          </div>
        </div>
        <button
          onClick={() => onTabChange('royalties')}
          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Full report <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col">
        {/* Big royalty number */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/80 p-4">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest mb-1">Estimated Royalties</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-extrabold text-emerald-700 leading-none">${estimatedRoyalties.toFixed(2)}</p>
            {estimatedRoyalties > 0 && (
              <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 mb-0.5">
                <TrendingUp className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-600/70 mt-1">From {publishedBooks.length} published title{publishedBooks.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Sparkline */}
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SPARKLINE} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={v => [`$${Number(v).toFixed(2)}`, 'Royalties']}
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
              />
              <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#rGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-secondary/40 p-3 text-center">
            <p className="text-base font-bold text-foreground">{publishedBooks.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Live Titles</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-3 text-center">
            <p className="text-base font-bold text-foreground">{avgRoyaltyRate}%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Avg Royalty</p>
          </div>
          <div className="rounded-xl bg-secondary/40 p-3 text-center">
            <p className="text-base font-bold text-foreground">${totalCatalogValue.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Catalog Value</p>
          </div>
        </div>

        {/* Payout info */}
        <div className="space-y-2 pt-1 border-t">
          <div className="flex justify-between items-center py-1.5">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Pending Payout</span>
            </div>
            <span className="text-xs font-bold text-foreground bg-secondary px-2.5 py-0.5 rounded-full">$0.00</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Next Payout</span>
            </div>
            <span className="text-xs font-bold text-foreground bg-secondary px-2.5 py-0.5 rounded-full">Jun 30, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}