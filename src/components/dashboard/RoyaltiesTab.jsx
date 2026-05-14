import React from 'react';
import { TrendingUp, DollarSign, BookOpen, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const monthlySales = [
  { month: 'Dec', units: 12, revenue: 58 },
  { month: 'Jan', units: 19, revenue: 92 },
  { month: 'Feb', units: 15, revenue: 71 },
  { month: 'Mar', units: 28, revenue: 134 },
  { month: 'Apr', units: 24, revenue: 116 },
  { month: 'May', units: 31, revenue: 149 },
];

const bookBreakdown = [
  { title: 'The Silent Algorithm', units: 64, revenue: 307.2, royaltyRate: '70%' },
  { title: 'Echoes of Tomorrow', units: 25, revenue: 87.5, royaltyRate: '35%' },
];

export default function RoyaltiesTab() {
  const totalRevenue = bookBreakdown.reduce((s, b) => s + b.revenue, 0);
  const totalUnits = bookBreakdown.reduce((s, b) => s + b.units, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Sales & Royalties</h1>
        <p className="text-muted-foreground mt-1">Track your earnings and unit sales across all titles.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Units Sold', value: totalUnits, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg. per Unit', value: `$${(totalRevenue / totalUnits).toFixed(2)}`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
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
        <h2 className="font-semibold mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => [`$${v}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Units chart */}
      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Units Sold per Month</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="units" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-book breakdown */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Per-Book Breakdown</h2>
        </div>
        <div className="divide-y">
          {bookBreakdown.map(book => (
            <div key={book.title} className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{book.title}</p>
                <p className="text-xs text-muted-foreground">{book.royaltyRate} royalty plan</p>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">Units</p>
                  <p className="text-sm font-semibold">{book.units}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-sm font-semibold text-green-600">${book.revenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}