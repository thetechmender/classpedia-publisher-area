import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Info, ChevronDown, ChevronUp, Zap, Sparkles, X, AlertCircle } from 'lucide-react';
import { format, addDays, isBefore, isAfter, startOfDay, addYears } from 'date-fns';
import { cn } from '@/lib/utils';

const PROGRAM_DAYS = 60;
const MAX_PROMO_DAYS = 3;

export default function EnrollmentScheduler({ book }) {
  const queryClient = useQueryClient();
  const [enrolled, setEnrolled] = useState(!!book.classpedia_select);
  const [wantsToEnroll, setWantsToEnroll] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [promoDates, setPromoDates] = useState([]);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const today = startOfDay(new Date());
  const minStart = addDays(today, 1);
  const maxStartDate = addYears(today, 8);
  const endDate = startDate ? addDays(startDate, PROGRAM_DAYS - 1) : null;
  
  const isDateInValidRange = (date) => {
    const d = startOfDay(date);
    return !isBefore(d, minStart) && !isAfter(d, maxStartDate);
  };
  
  const getDateValidationMessage = () => {
    if (!startDate) return null;
    if (!isDateInValidRange(startDate)) {
      return `You can modify the date to a date before or after the 6-8 year timeframe`;
    }
    return null;
  };

  const togglePromoDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setPromoDates(prev => {
      if (prev.includes(dateStr)) return prev.filter(d => d !== dateStr);
      if (prev.length >= MAX_PROMO_DAYS) {
        toast.error(`You can only select up to ${MAX_PROMO_DAYS} free promotion days`);
        return prev;
      }
      return [...prev, dateStr];
    });
  };

  const isInWindow = (date) => {
    if (!startDate || !endDate) return false;
    const d = startOfDay(date);
    return !isBefore(d, startDate) && !isAfter(d, endDate);
  };

  const handleEnroll = async () => {
    if (!startDate) return;
    setSaving(true);
    await base44.entities.Book.update(book.id, {
      classpedia_select: true,
      enrollment_start_date: format(startDate, 'yyyy-MM-dd'),
      enrollment_end_date: format(endDate, 'yyyy-MM-dd'),
      enrollment_promo_dates: promoDates,
    });
    queryClient.invalidateQueries({ queryKey: ['books'] });
    toast.success('Successfully enrolled in Classpedia Select!');
    setEnrolled(true);
    setSaving(false);
  };

  const handleUnenroll = async () => {
    if (!confirm('Remove this book from Classpedia Select? This will stop your enrollment benefits.')) return;
    setSaving(true);
    await base44.entities.Book.update(book.id, {
      classpedia_select: false,
      enrollment_start_date: null,
      enrollment_end_date: null,
      enrollment_promo_dates: null,
    });
    queryClient.invalidateQueries({ queryKey: ['books'] });
    toast.success('Removed from Classpedia Select.');
    setEnrolled(false);
    setSaving(false);
  };

  // Already enrolled — show summary
  if (enrolled) {
    const promoDatesDisplay = (book.enrollment_promo_dates || []);
    return (
      <div className="rounded-2xl border border-emerald-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Enrolled in Classpedia Select</p>
            <p className="text-xs text-emerald-100 mt-0.5">Your book is active in the 60-day exclusive program</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleUnenroll} disabled={saving}
            className="text-xs text-white/80 hover:text-white hover:bg-white/20 shrink-0 h-8">
            Unenroll
          </Button>
        </div>
        <div className="bg-white px-6 py-4 grid sm:grid-cols-2 gap-4">
          {book.enrollment_start_date && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Program Window</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {format(new Date(book.enrollment_start_date), 'MMM d')} →{' '}
                  {book.enrollment_end_date ? format(new Date(book.enrollment_end_date), 'MMM d, yyyy') : '—'}
                </p>
              </div>
            </div>
          )}
          {promoDatesDisplay.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Free Promo Days</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {promoDatesDisplay.map(d => format(new Date(d), 'MMM d')).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-accent/20 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-base">Classpedia Select Enrollment</h4>
          <p className="text-sm text-muted-foreground mt-0.5">
            A free 60-day exclusive program that lets you run promotions — including up to 3 free days per enrollment window.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Yes / No toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setWantsToEnroll(true); setStep(2); }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
              wantsToEnroll && step >= 2
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/40 hover:bg-secondary/30'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0',
              wantsToEnroll && step >= 2 ? 'border-primary bg-white' : 'border-muted-foreground/40 bg-white'
            )}>
              {wantsToEnroll && step >= 2 && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold">Yes, enroll me</p>
              <p className="text-xs text-muted-foreground mt-0.5">Exclusive to Classpedia for 60 days</p>
            </div>
          </button>

          <button
            onClick={() => { setWantsToEnroll(false); setStep(1); }}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
              !wantsToEnroll
                ? 'border-border bg-secondary/40'
                : 'border-border hover:border-muted-foreground/30 hover:bg-secondary/20'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0',
              !wantsToEnroll ? 'border-foreground bg-white' : 'border-muted-foreground/40 bg-white'
            )}>
              {!wantsToEnroll && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
            </div>
            <div>
              <p className="text-sm font-semibold">No, skip for now</p>
              <p className="text-xs text-muted-foreground mt-0.5">You can enroll later from your dashboard</p>
            </div>
          </button>
        </div>

        {/* Rules toggle */}
        <button
          onClick={() => setShowRules(r => !r)}
          className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
        >
          {showRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Rules and requirements
        </button>

        {showRules && (
          <div className="flex items-start gap-3 bg-accent/50 border border-primary/20 rounded-xl p-4 text-sm">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-accent-foreground leading-relaxed">By enrolling, you confirm this eBook will be exclusive to Classpedia for 60 days. You can run up to 3 free-promotion days per enrollment window.</p>
          </div>
        )}

        {/* Steps 2 & 3 */}
        {wantsToEnroll && step >= 2 && (
          <div className="space-y-6 border-t pt-6">

            {/* Step 2: Pick start date */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <h5 className="font-semibold text-sm">Select program start date</h5>
                {startDate && (
                  <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {format(startDate, 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="border rounded-xl overflow-hidden shadow-sm shrink-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => { setStartDate(d); setPromoDates([]); if (d) setStep(3); }}
                    disabled={(date) => !isDateInValidRange(date)}
                    className="rounded-none"
                  />
                </div>
                <div className="flex-1 w-full space-y-3">
                  {getDateValidationMessage() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700">{getDateValidationMessage()}</p>
                    </div>
                  )}
                  {startDate ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Program Window</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Start</span>
                          <span className="text-sm font-bold text-primary">{format(startDate, 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="h-px bg-primary/10" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">End</span>
                          <span className="text-sm font-bold text-primary">{format(endDate, 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="h-px bg-primary/10" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Duration</span>
                          <span className="text-sm font-semibold">60 days</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                      <CalendarDays className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">Pick a start date</p>
                      <p className="text-xs text-muted-foreground mt-1">Must be tomorrow or later</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Promo days */}
            {step >= 3 && startDate && (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  <h5 className="font-semibold text-sm">Mark up to 3 free promotion days</h5>
                  <span className={cn(
                    'ml-auto text-xs font-bold px-2.5 py-1 rounded-full',
                    promoDates.length === MAX_PROMO_DAYS
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-secondary text-muted-foreground'
                  )}>
                    {promoDates.length}/{MAX_PROMO_DAYS} selected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4 ml-8">
                  Select dates within your 60-day window when your book will be free to readers.
                </p>

                <div className="border rounded-xl overflow-hidden shadow-sm">
                  <Calendar
                    mode="multiple"
                    selected={promoDates.map(d => new Date(d))}
                    onDayClick={(date) => {
                      if (!isInWindow(date)) return;
                      togglePromoDate(date);
                    }}
                    disabled={(date) => !isInWindow(date)}
                    modifiers={{ promo: promoDates.map(d => new Date(d)) }}
                    modifiersClassNames={{ promo: 'bg-primary text-primary-foreground rounded-full' }}
                    fromDate={startDate}
                    toDate={endDate}
                    defaultMonth={startDate}
                    className="rounded-none"
                  />
                </div>

                {promoDates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {promoDates.map(d => (
                      <span key={d} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20">
                        <Zap className="w-3 h-3" />
                        {format(new Date(d), 'MMM d, yyyy')}
                        <button onClick={() => togglePromoDate(new Date(d))} className="hover:text-destructive transition-colors ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="pt-2 border-t space-y-2">
              <Button
                className="w-full gap-2 h-11 text-sm font-semibold"
                disabled={!startDate || saving}
                onClick={handleEnroll}
              >
                <Zap className="w-4 h-4" />
                {saving ? 'Enrolling…' : 'Confirm Enrollment'}
              </Button>
              {!startDate && (
                <p className="text-xs text-muted-foreground text-center">Select a start date to continue</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}