import React from 'react';
import { Eye, MousePointerClick, TrendingUp, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const pageViews = [
  { date: 'May 8', views: 120, clicks: 18 },
  { date: 'May 9', views: 98,  clicks: 14 },
  { date: 'May 10', views: 145, clicks: 22 },
  { date: 'May 11', views: 210, clicks: 35 },
  { date: 'May 12', views: 178, clicks: 29 },
  { date: 'May 13', views: 230, clicks: 41 },
  { date: 'May 14', views: 195, clicks: 33 },
];

const trafficSources = [
  { name: 'Direct', value: 42 },
  { name: 'Search', value: 31 },
  { name: 'Social', value: 18 },
  { name: 'Referral', value: 9 },
];

const COLORS = ['hsl(221,83%,53%)', 'hsl(173,58%,39%)', 'hsl(43,74%,56%)', 'hsl(0,70%,55%)'];

export default function AnalyticsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Understand how readers discover and engage with your books.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Page Views (7d)', value: '1,176', icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Store Clicks (7d)', value: '192', icon: MousePointerClick, color: 'text-green-600 bg-green-50' },
          { label: 'Click-through Rate', value: '16.3%', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          { label: 'Top Country', value: '🇺🇸 USA', icon: Globe, color: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-base font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Views & clicks chart */}
      <div className="bg-card border rounded-xl p-5">
        <h2 className="font-semibold mb-4">Views & Store Clicks (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={pageViews}>
            <defs>
              <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221,83%,53%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(221,83%,53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="views" stroke="hsl(221,83%,53%)" fill="url(#gViews)" strokeWidth={2} name="Page Views" />
            <Area type="monotone" dataKey="clicks" stroke="hsl(173,58%,39%)" fill="none" strokeWidth={2} name="Store Clicks" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Traffic sources */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {trafficSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, name) => [`${v}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {trafficSources.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i] }} />
                {s.name} {s.value}%
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Top Performing Book</h2>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">The Silent Algorithm</span>
              <span className="font-semibold">64% of views</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '64%' }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Echoes of Tomorrow</span>
              <span className="font-semibold">36% of views</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary/50 h-2 rounded-full" style={{ width: '36%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}