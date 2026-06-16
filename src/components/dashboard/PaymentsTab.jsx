import React, { useState } from 'react';
import { AlertCircle, Download, CalendarDays, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/shared/PageHeader';
import BookRoyaltiesTable from '@/components/dashboard/BookRoyaltiesTable';
import FilterPills from '@/components/shared/FilterPills';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const STATUS_FILTERS = [
  { label: 'All', value: 'All', color: null },
  { label: 'Paid', value: 'Paid', color: 'green' },
  { label: 'Pending', value: 'Pending', color: 'amber' },
  { label: 'Failed', value: 'Failed', color: 'red' }
];

const PERIOD_PRESETS = [
  { label: 'Last 30 Days', months: 1 },
  { label: 'Last 3 Months', months: 3 },
  { label: 'Last 6 Months', months: 6 },
  { label: 'This Year', months: 12 },
  { label: 'All Time', months: null },
];

export default function PaymentsTab({ books, authorProfile }) {
  const paymentMethod = authorProfile?.payment_method;
  const [statusFilter, setStatusFilter] = useState('All');
  const [presetIdx, setPresetIdx] = useState(2);
  const [showPresets, setShowPresets] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Payments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your earnings, payout history, and payment settings.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Statement
          </Button>

          <div className="relative">
            <button
              onClick={() => setShowPresets(v => !v)}
              className="flex items-center gap-2 px-3 py-2 bg-card border rounded-lg text-sm font-medium hover:bg-secondary/40 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              {presetIdx === PERIOD_PRESETS.length && startDate && endDate 
                ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                : presetIdx === PERIOD_PRESETS.length 
                  ? 'Custom Range' 
                  : PERIOD_PRESETS[presetIdx].label}
              <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', showPresets && 'rotate-180')} />
            </button>
            {showPresets && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-card border rounded-xl shadow-lg overflow-hidden min-w-[180px]">
                {PERIOD_PRESETS.map((p, i) => (
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
                    setPresetIdx(PERIOD_PRESETS.length); 
                    setShowPresets(false); 
                    setShowCustomRange(true); 
                  }}
                  className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/40 transition-colors', presetIdx === PERIOD_PRESETS.length && 'font-semibold text-primary')}>
                  Custom Range
                </button>
              </div>
            )}
          </div>

          {/* Custom date range dialog */}
          <Dialog open={showCustomRange} onOpenChange={(open) => {
            if (!open) {
              setShowCustomRange(false);
              if (presetIdx === PERIOD_PRESETS.length && !startDate) {
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

      <BookRoyaltiesTable books={books} statusFilter={statusFilter} onFilterChange={setStatusFilter} />
    </div>
  );
}