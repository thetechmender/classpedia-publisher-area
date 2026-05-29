import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { DashboardService } from '@/services/dashboard.service';

export default function RoyaltiesTab() {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await DashboardService.getEarnings();
        if (response.isSuccess) {
          setEarningsData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const monthlyData = earningsData?.monthlyData || [];
  const stats = earningsData?.stats || {};
  const bookSales = earningsData?.bookSales || [];

  // Per-book data from API
  const perBookData = bookSales.map(sale => ({
    title: sale.bookTitle,
    unitsSold: sale.unitsSold,
    revenue: sale.revenue,
    totalRoyalties: sale.royalties,
  }));

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold font-serif">Sales & Royalties</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Track your earnings and unit sales across all titles.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Earned',     value: `$${stats.lifetimeEarnings?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Units Sold',       value: `${stats.totalUnitsSold || 0}`, icon: BookOpen,   color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Payout',   value: `$${stats.pendingPayout?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'text-primary bg-primary/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => [`$${Number(v).toFixed(2)}`, 'Revenue']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Units chart */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">Units Sold per Month</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="units" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-book breakdown — uses real books, always 70% */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-secondary/30">
          <h3 className="font-semibold text-sm">Per-Book Royalty Breakdown</h3>
          <p className="text-xs text-muted-foreground mt-0.5">All titles earn a fixed 25% royalty rate.</p>
        </div>
        {perBookData.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <DollarSign className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No sales data yet. Publish a title to see royalty potential.</p>
          </div>
        ) : (
          <div className="divide-y">
            {perBookData.map(book => (
              <div key={book.title} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{book.title}</p>
                  <p className="text-xs text-muted-foreground">Revenue ${book.revenue?.toFixed(2) || '0.00'} · {book.unitsSold} units sold</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Royalties</p>
                  <p className="text-sm font-bold text-emerald-600">${book.totalRoyalties?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}