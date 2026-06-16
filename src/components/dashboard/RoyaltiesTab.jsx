import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, BookOpen, Download, ChevronDown, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

// ─── Mock monthly data keyed by year ─────────────────────────────────────────
const MOCK_DATA = {
  2026: [
    { month: 'Jan', paidUnits: 4,  revenue: 41.96,  freeDownloads: 87  },
    { month: 'Feb', paidUnits: 7,  revenue: 73.43,  freeDownloads: 0   },
    { month: 'Mar', paidUnits: 11, revenue: 114.89, freeDownloads: 142 },
    { month: 'Apr', paidUnits: 9,  revenue: 94.41,  freeDownloads: 58  },
    { month: 'May', paidUnits: 14, revenue: 146.86, freeDownloads: 0   },
    { month: 'Jun', paidUnits: 6,  revenue: 62.94,  freeDownloads: 0   },
  ],
  2025: [
    { month: 'Jan', paidUnits: 2,  revenue: 17.98, freeDownloads: 0  },
    { month: 'Feb', paidUnits: 0,  revenue: 0,     freeDownloads: 0  },
    { month: 'Mar', paidUnits: 3,  revenue: 26.97, freeDownloads: 0  },
    { month: 'Apr', paidUnits: 5,  revenue: 44.95, freeDownloads: 0  },
    { month: 'May', paidUnits: 8,  revenue: 71.92, freeDownloads: 0  },
    { month: 'Jun', paidUnits: 6,  revenue: 53.94, freeDownloads: 0  },
    { month: 'Jul', paidUnits: 10, revenue: 89.90, freeDownloads: 0  },
    { month: 'Aug', paidUnits: 12, revenue: 107.88,freeDownloads: 0  },
    { month: 'Sep', paidUnits: 9,  revenue: 80.91, freeDownloads: 0  },
    { month: 'Oct', paidUnits: 7,  revenue: 62.93, freeDownloads: 0  },
    { month: 'Nov', paidUnits: 11, revenue: 98.89, freeDownloads: 0  },
    { month: 'Dec', paidUnits: 15, revenue: 134.85,freeDownloads: 0  },
  ],
};

const CHART_FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'paid',      label: 'Paid Sales' },
  { id: 'free',      label: 'Free Downloads' },
  { id: 'royalties', label: 'Royalties' },
];

// Map preset labels to how many months of mock data to show
const PRESETS = [
  { label: 'Last 30 Days', months: 1  },
  { label: 'Last 3 Months', months: 3  },
  { label: 'Last 6 Months', months: 6  },
  { label: 'This Year',     months: 12 },
  { label: 'All Time',      months: null },
];

// Flatten all mock data newest-first for slicing by preset
const ALL_MOCK = [
  ...MOCK_DATA[2026],
  ...MOCK_DATA[2025],
];

export default function RoyaltiesTab({ books = [] }) {
  const [chartFilter, setChartFilter] = useState('all');
  const [presetIdx, setPresetIdx] = useState(2);
  const [showPresets, setShowPresets] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);

  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => base44.entities.Promotion.list(),
  });

  const published = books.filter(b => b.status === 'published' && b.list_price);
  const activePromos = promotions.filter(p => p.status === 'active');

  // Slice mock data by preset or custom date range
  const filteredData = useMemo(() => {
    const preset = PRESETS[presetIdx];
    
    // Custom date range filtering
    if (presetIdx === PRESETS.length) {
      if (!startDate || !endDate) return [];
      
      const startMonth = format(startDate, 'MMM');
      const endMonth = format(endDate, 'MMM');
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      
      return ALL_MOCK.filter(d => {
        const monthIndex = ALL_MOCK.findIndex(m => m.month === d.month);
        const startIndex = ALL_MOCK.findIndex(m => m.month === startMonth);
        const endIndex = ALL_MOCK.findIndex(m => m.month === endMonth);
        return monthIndex >= startIndex && monthIndex <= endIndex;
      });
    }
    
    if (!preset.months) return ALL_MOCK;
    return ALL_MOCK.slice(0, preset.months);
  }, [presetIdx, startDate, endDate]);

  const totalPaidUnits = filteredData.reduce((s, d) => s + d.paidUnits, 0);
  const totalRevenue = filteredData.reduce((s, d) => s + d.revenue, 0);
  const totalFreeInPeriod = filteredData.reduce((s, d) => s + d.freeDownloads, 0);

  const chartData = filteredData.map(d => {
    if (chartFilter === 'paid')      return { month: d.month, value: d.paidUnits };
    if (chartFilter === 'free')      return { month: d.month, value: d.freeDownloads };
    if (chartFilter === 'royalties') return { month: d.month, revenue: d.revenue };
    return d;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sales & Royalties</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Track your earnings and unit sales across all titles.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.success('Statement export will be available soon.')}>
            <Download className="w-3.5 h-3.5" /> Export Statement
          </Button>

        {/* Period preset picker */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(v => !v)}
            className="flex items-center gap-2 px-3 py-2 bg-card border rounded-lg text-sm font-medium hover:bg-secondary/40 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            {presetIdx === PRESETS.length && startDate && endDate 
              ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
              : presetIdx === PRESETS.length 
                ? 'Custom Range' 
                : PRESETS[presetIdx].label}
            <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', showPresets && 'rotate-180')} />
          </button>
          {showPresets && (
            <div className="absolute right-0 top-full mt-1 z-10 bg-card border rounded-xl shadow-lg overflow-hidden min-w-[180px]">
              {PRESETS.map((p, i) => (
                <button key={p.label} onClick={() => { setPresetIdx(i); setShowPresets(false); setShowCustomRange(false); }}
                  className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/40 transition-colors', i === presetIdx && 'font-semibold text-primary')}>
                  {p.label}
                </button>
              ))}
              <div className="border-t my-1"></div>
              <button 
                onClick={() => { 
                  setTempStartDate(startDate);
                  setTempEndDate(endDate);
                  setPresetIdx(PRESETS.length); 
                  setShowPresets(false); 
                  setShowCustomRange(true); 
                }}
                className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/40 transition-colors', presetIdx === PRESETS.length && 'font-semibold text-primary')}>
                Custom Range
              </button>
            </div>
          )}
        </div>

        {/* Custom date range dialog */}
        <Dialog open={showCustomRange} onOpenChange={(open) => {
          if (!open) {
            setShowCustomRange(false);
            if (presetIdx === PRESETS.length && !startDate) {
              setPresetIdx(2);
            }
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Custom Date Range</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {tempStartDate ? format(tempStartDate, 'MMM d, yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempStartDate}
                      onSelect={(date) => { setTempStartDate(date); if (tempEndDate && date > tempEndDate) setTempEndDate(null); }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {tempEndDate ? format(tempEndDate, 'MMM d, yyyy') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempEndDate}
                      onSelect={setTempEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCustomRange(false)}>Cancel</Button>
              <Button 
                onClick={() => {
                  setStartDate(tempStartDate);
                  setEndDate(tempEndDate);
                  setShowCustomRange(false);
                }}
                disabled={!tempStartDate || !tempEndDate}
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { label: 'Books Published',       value: `${published.length}`,          icon: TrendingUp, color: 'text-primary bg-primary/10' },
          { label: 'Paid Units Sold',       value: `${totalPaidUnits}`,            icon: BookOpen,   color: 'text-blue-600 bg-blue-50' },
          { label: 'Free Downloads',        value: `${totalFreeInPeriod}`,         icon: Download,   color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Earned',          value: `$${totalRevenue.toFixed(2)}`,  icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },

        ].map(({ label, value, icon: Icon, color }) => (
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



      {/* Chart */}
      <div className="bg-card border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-sm">
              Performance — {presetIdx === PRESETS.length ? 'Custom Range' : PRESETS[presetIdx].label}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Paid sales and free promo downloads shown separately</p>
          </div>
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {CHART_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setChartFilter(f.id)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                  chartFilter === f.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {chartFilter === 'royalties' ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${Number(v).toFixed(2)}`, 'Royalties']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" name="Royalties ($)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : chartFilter === 'all' ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="paidUnits" name="Paid Units" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="freeDownloads" name="Free Downloads" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value"
                name={chartFilter === 'paid' ? 'Paid Units' : 'Free Downloads'}
                fill={chartFilter === 'free' ? '#a855f7' : 'hsl(var(--primary))'}
                radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b bg-muted/30">
          <h3 className="font-semibold text-sm text-foreground">Monthly Sales & Royalties</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track paid units, free downloads, and estimated earnings per month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-5 py-2.5 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Month</th>
                <th className="text-left px-4 py-2.5 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Paid Units</th>
                <th className="text-left px-4 py-2.5 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Free Downloads</th>
                <th className="text-left px-5 py-2.5 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Est. Royalties</th>
                <th className="text-left px-5 py-2.5 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((row, idx) => {
                const isExpanded = expandedMonth === idx;
                const publishedBooks = books.filter(b => b.status === 'published');
                
                return (
                  <React.Fragment key={idx}>
                    {/* Month summary row */}
                    <tr className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3 font-medium">{row.month}</td>
                      <td className="px-4 py-3 text-left text-blue-600 font-semibold">{row.paidUnits}</td>
                      <td className="px-4 py-3 text-left text-purple-600 font-semibold">{row.freeDownloads}</td>
                      <td className="px-5 py-3 text-left text-emerald-600 font-semibold">${(row.revenue * 0.7).toFixed(2)}</td>
                      <td className="px-5 py-3 text-left">
                        <button
                          onClick={() => setExpandedMonth(isExpanded ? null : idx)}
                          className="text-sm font-medium text-primary hover:text-primary/80 underline transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded breakdown */}
                    {isExpanded && publishedBooks.length > 0 && (
                      <tr>
                        <td colSpan={5} className="bg-accent/20 px-5 pb-4 pt-2">
                          <div className="bg-card rounded-lg border overflow-hidden">
                            <div className="grid grid-cols-5 px-4 py-2 bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b">
                              <div className="col-span-2 text-left">Book Title</div>
                              <div className="col-span-1 text-right">Date</div>
                              <div className="col-span-1 text-right">Price</div>
                              <div className="col-span-1 text-right">Royalty</div>
                            </div>
                            {(() => {
                              const allUnits = [];
                              for (let i = 0; i < row.paidUnits; i++) {
                                const bookIndex = i % publishedBooks.length;
                                const book = publishedBooks[bookIndex];
                                const price = book.list_price || 0;
                                const royalty = price * 0.7;
                                const day = Math.floor(i / publishedBooks.length) + 1;
                                allUnits.push({
                                  book,
                                  price,
                                  royalty,
                                  unitNumber: i + 1,
                                  saleDate: `${row.month.split(' ')[0]} ${day}, 2025`
                                });
                              }
                              
                              return allUnits.map((unit, idx) => (
                                <div key={idx} className="grid grid-cols-5 px-4 py-2.5 border-b last:border-0 hover:bg-muted/20 transition-colors">
                                  <div className="col-span-2 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center shrink-0">
                                      <BookOpen className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-sm font-medium">{unit.book.title}</span>
                                  </div>
                                  <div className="col-span-1 text-sm text-right text-muted-foreground self-center">{unit.saleDate}</div>
                                  <div className="col-span-1 text-sm text-right text-muted-foreground self-center">${unit.price.toFixed(2)}</div>
                                  <div className="col-span-1 text-sm text-right text-emerald-600 font-semibold self-center">${unit.royalty.toFixed(2)}</div>
                                </div>
                              ));
                            })()}
                            <div className="grid grid-cols-5 px-4 py-2.5 bg-muted/30 border-t text-xs font-bold">
                              <div className="col-span-2">Total ({row.paidUnits} units)</div>
                              <div className="col-span-1 text-right text-muted-foreground">—</div>
                              <div className="col-span-1 text-right text-muted-foreground">—</div>
                              <div className="col-span-1 text-right text-emerald-600">${(row.revenue * 0.7).toFixed(2)}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
            <tr className="border-t bg-secondary/30 font-semibold text-sm">
              <td className="px-5 py-3">Total</td>
              <td className="px-4 py-3 text-left text-blue-600">{filteredData.reduce((s,d)=>s+d.paidUnits,0)}</td>
              <td className="px-4 py-3 text-left text-purple-600">{filteredData.reduce((s,d)=>s+d.freeDownloads,0)}</td>
              <td className="px-5 py-3 text-left text-emerald-600">${(filteredData.reduce((s,d)=>s+d.revenue,0)*0.7).toFixed(2)}</td>
            </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Promo summary */}
      {promotions.length > 0 && (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">Promotional Program Summary</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Free downloads excluded from royalty calculations.</p>
          </div>
          <div className="divide-y">
            {promotions.map(p => (
              <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{p.book_title}</p>
                  <p className="text-xs text-muted-foreground">60-Day Visibility · {p.free_promo_days_used || 0}/3 promo days used</p>
                </div>
                <div className="flex gap-6 text-right text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Free Downloads</p>
                    <p className="font-semibold text-purple-600">{p.free_downloads || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Royalty Impact</p>
                    <p className="font-semibold text-muted-foreground">$0.00</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}