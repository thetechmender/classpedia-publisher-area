import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone, BookOpen, Download, CheckCircle2, Clock, XCircle,
  Plus, ChevronRight, Info, TrendingUp, ChevronDown, ChevronUp, ArrowUpDown } from
'lucide-react';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import FilterPills from '@/components/shared/FilterPills';

const MOCK_PROMOTIONS = [
{
  id: 'mock-1',
  book_title: 'Introduction to Modern Physics',
  status: 'active',
  start_date: '2026-04-15',
  end_date: '2026-06-14',
  free_promo_days_used: 2,
  free_promo_dates: ['2026-04-20', '2026-05-10', '2026-06-08'],
  free_downloads: 142,
  paid_sales_after_promo: 18,
  original_price: 14.99
},
{
  id: 'mock-2',
  book_title: 'Advanced Calculus for Engineers',
  status: 'completed',
  start_date: '2026-01-01',
  end_date: '2026-03-02',
  free_promo_days_used: 3,
  free_promo_dates: ['2026-01-10', '2026-01-25', '2026-02-14'],
  free_downloads: 317,
  paid_sales_after_promo: 44,
  original_price: 12.99
},
{
  id: 'mock-3',
  book_title: 'Chemistry: Concepts & Applications',
  status: 'active',
  start_date: '2026-05-01',
  end_date: '2026-06-30',
  free_promo_days_used: 1,
  free_promo_dates: ['2026-05-15', '2026-06-20'],
  free_downloads: 58,
  paid_sales_after_promo: 7,
  original_price: 9.99
},
{
  id: 'mock-4',
  book_title: 'Biology: The Living World',
  status: 'expired',
  start_date: '2025-11-01',
  end_date: '2025-12-31',
  free_promo_days_used: 3,
  free_promo_dates: ['2025-11-05', '2025-11-20', '2025-12-10'],
  free_downloads: 203,
  paid_sales_after_promo: 29,
  original_price: 11.99
}];


const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  not_enrolled: { label: 'Not Enrolled', color: 'bg-secondary text-muted-foreground border-border', icon: Clock }
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_enrolled;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', cfg.color)}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>);

}

function DayDots({ used }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) =>
      <div key={i} className={cn('w-2 h-2 rounded-full', i < used ? 'bg-primary' : 'bg-border')} />
      )}
    </div>);

}

function ExpandedRow({ promo }) {
  const daysRemaining = promo.end_date ?
  Math.max(0, Math.ceil((new Date(promo.end_date) - new Date()) / (1000 * 60 * 60 * 24))) :
  0;
  const nextPromoDate = promo.free_promo_dates?.find((d) => isAfter(parseISO(d), new Date()));

  return (
    <tr>
      <td colSpan={7} className="px-0 pb-0">
        <div className="mx-5 mt-5 mb-5 bg-muted/30 border border-border/60 rounded-xl p-5 space-y-5">
          {/* Top section: 4-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Period */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Program Period</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {promo.start_date ? format(parseISO(promo.start_date), 'MMM d, yyyy') : '—'}
                </p>
                <span className="text-xs text-muted-foreground">→</span>
                <p className="text-sm font-semibold text-foreground">
                  {promo.end_date ? format(parseISO(promo.end_date), 'MMM d, yyyy') : '—'}
                </p>
              </div>
            </div>

            {/* Days remaining */}
            {promo.status === 'active' &&
            <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Days Remaining</p>
                <p className="text-lg font-bold text-primary">{daysRemaining} <span className="text-sm font-medium text-muted-foreground">days</span></p>
              </div>
            }

            {/* Next promo day */}
            {promo.status === 'active' && nextPromoDate &&
            <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Next Free Day</p>
                <p className="text-sm font-semibold text-foreground">{format(parseISO(nextPromoDate), 'MMM d, yyyy')}</p>
              </div>
            }

            {/* Original price */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Original Price</p>
              <p className="text-sm font-semibold text-foreground">${promo.original_price?.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">$0.00 on promo days</p>
            </div>
          </div>

          {/* Promo dates section */}
          <div className="border-t border-border/50 pt-5 space-y-2.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Scheduled Free Promo Days</p>
            <div className="flex flex-wrap gap-2">
              {promo.free_promo_dates?.map((d) => {
                const isPast = isBefore(parseISO(d), new Date());
                return (
                  <span key={d} className={cn(
                    'text-xs px-3 py-1.5 rounded-lg font-semibold border',
                    isPast ? 'bg-secondary/50 text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/20'
                  )}>
                    {format(parseISO(d), 'MMM d, yyyy')} <span className="text-[10px] font-medium">{isPast ? '✓' : '→'}</span>
                  </span>);

              })}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-2.5 pt-3 border-t border-border/50">
            <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">Free downloads do not generate royalty earnings. Paid sales after promo are tracked separately.</p>
          </div>
        </div>
      </td>
    </tr>);

}

function EnrollModal({ onClose, onEnrolled }) {
  const [step, setStep] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const queryClient = useQueryClient();

  const { data: allBooks = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list()
  });

  const publishedBooks = allBooks.filter((b) => b.status === 'published' && b.list_price);

  const endDate = startDate ? addDays(startDate, 60) : null;

  const toggleDate = (date) => {
    const iso = format(date, 'yyyy-MM-dd');
    if (selectedDates.includes(iso)) {
      setSelectedDates(selectedDates.filter((d) => d !== iso));
    } else if (selectedDates.length < 3) {
      setSelectedDates([...selectedDates, iso]);
    } else {
      toast.error('You can only select up to 3 free promo days');
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedBook) setStep(2);else
    if (step === 2 && startDate) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {setSelectedBook(null);setStep(1);} else
    if (step === 3) {setStartDate(null);setStep(2);}
  };

  const handleEnroll = async () => {
    if (!selectedBook || !startDate || selectedDates.length === 0) return;
    setEnrolling(true);
    await base44.entities.Promotion.create({
      book_id: selectedBook.id,
      book_title: selectedBook.title,
      program: '60_day_visibility',
      status: 'active',
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      free_promo_days_used: selectedDates.length,
      free_promo_dates: selectedDates,
      free_downloads: 0,
      paid_sales_after_promo: 0,
      original_price: selectedBook.list_price
    });
    queryClient.invalidateQueries({ queryKey: ['promotions'] });
    setEnrolling(false);
    toast.success(`"${selectedBook.title}" enrolled in 60-Day Visibility Program!`);
    onEnrolled();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Enroll in 60-Day Visibility Program</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Step {step} of 3</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
              <XCircle className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) =>
            <div key={s} className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
              s <= step ? 'bg-primary border-primary text-white' : 'bg-secondary border-border text-muted-foreground'
              )}>
                  {s}
                </div>
                {s < 3 && <div className={cn('w-12 h-0.5 rounded', s < step ? 'bg-primary' : 'bg-border')} />}
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Select Book */}
        {step === 1 &&
        <div className="px-6 py-5">
            <h4 className="text-sm font-semibold mb-1">Select a Book</h4>
            <p className="text-xs text-muted-foreground mb-4">Choose a published book to enroll in the program</p>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {publishedBooks.length === 0 ?
            <div className="text-center py-8 text-sm text-muted-foreground">No published books available</div> :

            publishedBooks.map((book) =>
            <button
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
              selectedBook?.id === book.id ?
              'border-primary bg-primary/5 ring-1 ring-primary' :
              'border-border hover:bg-secondary hover:border-primary/50'
              )}>
              
                    {book.cover_url ?
              <img src={book.cover_url} alt={book.title} className="w-10 h-14 object-cover rounded-lg shrink-0" /> :

              <div className="w-10 h-14 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-muted-foreground/50" />
                      </div>
              }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">by {book.author_name || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">${book.list_price?.toFixed(2)}</p>
                    </div>
                    {selectedBook?.id === book.id &&
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              }
                  </button>
            )
            }
            </div>
          </div>
        }

        {/* Step 2: Select Program Start Date */}
        {step === 2 &&
        <div className="px-6 py-5 space-y-4">
            <h4 className="text-sm font-semibold mb-1">Set Program Period</h4>
            <p className="text-xs text-muted-foreground mb-4">Choose when your 60-day program begins</p>
            
            <div className="bg-accent/30 border border-primary/20 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Megaphone className="w-4 h-4" /> Program Details
              </div>
              <ul className="text-muted-foreground space-y-1 list-disc pl-4">
                <li>Program runs for <strong>60 days</strong> from your start date</li>
                <li>Select up to <strong>3 free promo days</strong> within this window</li>
                <li>Book becomes <strong>$0.00</strong> on selected promo days</li>
                <li>Original price restores automatically after each promo day</li>
              </ul>
            </div>

            <div className="flex items-center justify-center">
              <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => setStartDate(date)}
              disabled={(date) => isBefore(date, new Date())}
              className="rounded-xl border" />
            
            </div>

            {startDate &&
          <div className="bg-secondary/30 border border-border rounded-xl p-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Program Period</p>
                  <p className="font-semibold">{format(startDate, 'MMM d, yyyy')} → {format(endDate, 'MMM d, yyyy')}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
          }
          </div>
        }

        {/* Step 3: Select Promo Days */}
        {step === 3 &&
        <div className="px-6 py-5 space-y-4">
            <h4 className="text-sm font-semibold mb-1">Choose Free Promo Days</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Select up to 3 days within your program period when the book will be free
              <span className="ml-2 font-medium text-primary">({selectedDates.length}/3 selected)</span>
            </p>

            <div className="bg-accent/30 border border-primary/20 rounded-xl p-3 text-xs space-y-1">
              <p><strong>Book:</strong> {selectedBook?.title}</p>
              <p><strong>Program:</strong> {startDate ? format(startDate, 'MMM d, yyyy') : '—'} → {endDate ? format(endDate, 'MMM d, yyyy') : '—'}</p>
            </div>

            <div className="flex items-center justify-center">
              <Calendar
              mode="multiple"
              selected={selectedDates.map((d) => parseISO(d))}
              onDayClick={toggleDate}
              disabled={(date) => {
                if (!startDate) return true;
                return isBefore(date, startDate) || isAfter(date, endDate);
              }}
              className="rounded-xl border" />
            
            </div>

            {selectedDates.length > 0 &&
          <div className="flex flex-wrap gap-2">
                {selectedDates.sort().map((d) => {
              const isPast = isBefore(parseISO(d), new Date());
              return (
                <span key={d} className={cn(
                  'text-xs px-2.5 py-1 rounded-lg font-medium border',
                  isPast ? 'bg-secondary text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/20'
                )}>
                      {format(parseISO(d), 'MMM d, yyyy')} {isPast ? '✓' : ''}
                    </span>);

            })}
              </div>
          }
          </div>
        }

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between gap-3">
          <Button variant="outline" onClick={step === 1 ? onClose : handleBack}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 3 ?
          <Button onClick={handleNext} disabled={step === 1 && !selectedBook || step === 2 && !startDate} className="gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button> :

          <Button onClick={handleEnroll} disabled={enrolling || selectedDates.length === 0} className="gap-2">
              {enrolling ? 'Enrolling...' : 'Confirm Enrollment'} <CheckCircle2 className="w-4 h-4" />
            </Button>
          }
        </div>
      </div>
    </div>);

}

const STATUS_FILTERS = [
{ label: 'All', value: 'all', color: null },
{ label: 'Active', value: 'active', color: 'emerald' },
{ label: 'Completed', value: 'completed', color: 'blue' },
{ label: 'Expired', value: 'expired', color: 'red' }];


const SORT_OPTIONS = [
{ label: 'Newest first', value: 'newest' },
{ label: 'Oldest first', value: 'oldest' },
{ label: 'Most downloads', value: 'most_downloads' },
{ label: 'Least downloads', value: 'least_downloads' },
{ label: 'Ending soon', value: 'ending_soon' }];


export default function PromotionsTab({ books = [] }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [enrollBook, setEnrollBook] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data: realPromos = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => base44.entities.Promotion.list('-created_date')
  });

  const promotions = realPromos.length === 0 ? MOCK_PROMOTIONS : realPromos;
  const enrolledBookIds = new Set(realPromos.filter((p) => p.status === 'active').map((p) => p.book_id));
  const publishedBooks = books.filter((b) => b.status === 'published' && b.list_price && !enrolledBookIds.has(b.id));
  const activePromos = promotions.filter((p) => p.status === 'active');
  const totalFreeDownloads = promotions.reduce((sum, p) => sum + (p.free_downloads || 0), 0);
  const totalPaidAfterPromo = promotions.reduce((sum, p) => sum + (p.paid_sales_after_promo || 0), 0);

  const toggleRow = (id) => setExpandedId((prev) => prev === id ? null : id);

  const getStatusCount = (status) => {
    if (status === 'all') return promotions.length;
    return promotions.filter((p) => p.status === status).length;
  };

  const filteredPromos = useMemo(() => {
    let result = statusFilter === 'all' ?
    promotions :
    promotions.filter((p) => p.status === statusFilter);

    // Apply sorting
    const sorted = [...result];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        break;
      case 'most_downloads':
        sorted.sort((a, b) => (b.free_downloads || 0) - (a.free_downloads || 0));
        break;
      case 'least_downloads':
        sorted.sort((a, b) => (a.free_downloads || 0) - (b.free_downloads || 0));
        break;
      case 'ending_soon':
        sorted.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
        break;
    }
    return sorted;
  }, [statusFilter, sortBy, promotions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Manage your 60-Day Visibility Programs and free promo days." />
      

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
        { label: 'Active Programs', value: activePromos.length, color: 'text-emerald-600 bg-emerald-50', icon: Megaphone },
        { label: 'Free Downloads', value: totalFreeDownloads, color: 'text-purple-600 bg-purple-50', icon: Download },
        { label: 'Total Programs', value: promotions.length, color: 'text-blue-600 bg-blue-50', icon: BookOpen },
        { label: 'Promo Days Used', value: `${promotions.reduce((s, p) => s + (p.free_promo_days_used || 0), 0)} / ${promotions.length * 3}`, color: 'text-primary bg-primary/10', icon: TrendingUp }].
        map(({ label, value, color, icon: Icon }) =>
        <div key={label} className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          </div>
        )}
      </div>

      {/* Filter and Sort bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <FilterPills
          filters={STATUS_FILTERS}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
          getCount={getStatusCount} />
        
        
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-secondary/40 transition-colors shadow-sm hidden">
            
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
            <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', showSortMenu && 'rotate-180')} />
          </button>
          
          {showSortMenu &&
          <div className="absolute right-0 top-full mt-1.5 z-10 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[160px]">
              {SORT_OPTIONS.map((option) =>
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setShowSortMenu(false);
              }}
              className={cn(
                'w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/40 transition-colors',
                sortBy === option.value && 'bg-accent font-semibold text-accent-foreground'
              )}>
              
                  {option.label}
                </button>
            )}
            </div>
          }
        </div>
      </div>

      {/* Promotions table */}
      {isLoading ?
      <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div> :
      filteredPromos.length === 0 ?
      <div className="bg-card border border-border rounded-2xl px-5 py-16 text-center shadow-sm">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">No promotions yet</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">Enroll a published book to start the 60-Day Visibility Program.</p>
        </div> :

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Promotion Programs</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Track 60-Day Visibility campaigns and free promo days</p>
            </div>
            <div className="relative">
              <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-secondary/40 transition-colors shadow-sm">
              
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', showSortMenu && 'rotate-180')} />
              </button>
              
              {showSortMenu &&
            <div className="absolute right-0 top-full mt-1.5 z-10 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                  {SORT_OPTIONS.map((option) =>
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setShowSortMenu(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/40 transition-colors',
                  sortBy === option.value && 'bg-accent font-semibold text-accent-foreground'
                )}>
                
                      {option.label}
                    </button>
              )}
                </div>
            }
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="text-left px-5 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Book Title</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">End Date</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Free Days</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Downloads</th>
                  <th className="text-right px-5 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredPromos.map((promo) => {
                const isExpanded = expandedId === promo.id;
                return (
                  <React.Fragment key={promo.id}>
                      <tr
                      onClick={() => toggleRow(promo.id)}
                      className={cn(
                        'cursor-pointer transition-all hover:bg-secondary/30',
                        isExpanded && 'bg-primary/5'
                      )}>
                      
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-semibold text-foreground truncate max-w-[220px]">{promo.book_title}</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">60-Day Visibility</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={promo.status} />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="text-xs font-medium text-foreground">
                            {promo.end_date ? format(parseISO(promo.end_date), 'MMM d, yyyy') : '—'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-foreground">{promo.free_promo_days_used || 0}/3</span>
                            <DayDots used={promo.free_promo_days_used || 0} />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="text-sm font-bold text-purple-600">{promo.free_downloads || 0}</p>
                        </td>
                        <td className="px-5 py-4 text-right text-muted-foreground">
                          {isExpanded ?
                        <ChevronUp className="w-4 h-4 ml-auto" /> :
                        <ChevronDown className="w-4 h-4 ml-auto" />
                        }
                        </td>
                      </tr>
                      {isExpanded && <ExpandedRow promo={promo} />}
                    </React.Fragment>);

              })}
              </tbody>
            </table>
          </div>
        </div>
      }

      {enrollBook &&
      <EnrollModal
        onClose={() => setEnrollBook(null)}
        onEnrolled={() => queryClient.invalidateQueries({ queryKey: ['promotions'] })} />

      }
    </div>);

}