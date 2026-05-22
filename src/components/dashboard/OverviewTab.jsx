import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Plus, BookOpen, CheckCircle2, Clock, FileEdit, TrendingUp,
  DollarSign, ChevronRight, Zap, User, CreditCard, FileText,
  BarChart3, ArrowUpRight, Sparkles, CalendarDays
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const MONTHLY_DATA = [
  { month: 'Dec', royalties: 0 }, { month: 'Jan', royalties: 0 },
  { month: 'Feb', royalties: 0 }, { month: 'Mar', royalties: 0 },
  { month: 'Apr', royalties: 0 }, { month: 'May', royalties: 0 },
];

const STATUS_CONFIG = {
  published:   { label: 'Published',   bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  in_review:   { label: 'In Review',   bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  draft:       { label: 'Draft',       bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
  unpublished: { label: 'Unpublished', bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color, trend, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-card border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-foreground', '/10')}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </button>
  );
}

function ActionItem({ icon: Icon, iconBg, title, subtitle, cta, ctaFn, urgency }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-secondary/30 transition-colors">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
      {urgency && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
          urgency === 'high' ? 'bg-red-100 text-red-700' :
          urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Pending' : 'Optional'}
        </span>
      )}
      <button
        onClick={ctaFn}
        className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5 shrink-0"
      >
        {cta} <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function OverviewTab({ books, authorProfile, onTabChange }) {
  const firstName = authorProfile?.full_name?.split(' ')[0] || 'there';

  const stats = {
    total:      books.length,
    published:  books.filter(b => b.status === 'published').length,
    in_review:  books.filter(b => b.status === 'in_review').length,
    draft:      books.filter(b => b.status === 'draft').length,
  };

  const estimatedRoyalties = books
    .filter(b => b.status === 'published' && b.list_price)
    .reduce((sum, b) => sum + b.list_price * (parseFloat(b.royalty_plan || 70) / 100), 0);

  const actions = [];
  if (!authorProfile?.payment_method) {
    actions.push({
      icon: CreditCard, iconBg: 'bg-red-100 text-red-600',
      title: 'Set up your payment method',
      subtitle: 'Add your bank account or PayPal to receive royalty payouts.',
      cta: 'Add now', ctaFn: () => onTabChange('payments'), urgency: 'high',
    });
  }
  if (authorProfile?.us_person === undefined || !authorProfile?.tax_id) {
    actions.push({
      icon: FileText, iconBg: 'bg-amber-100 text-amber-600',
      title: 'Complete your tax information',
      subtitle: 'Required for royalty processing and IRS compliance.',
      cta: 'Complete', ctaFn: () => onTabChange('payments'), urgency: 'medium',
    });
  }
  if (!authorProfile?.author_bio) {
    actions.push({
      icon: User, iconBg: 'bg-blue-100 text-blue-600',
      title: 'Add your author biography',
      subtitle: 'Readers convert better when there\'s a compelling author bio.',
      cta: 'Add bio', ctaFn: () => onTabChange('profile'), urgency: 'low',
    });
  }
  books.filter(b => b.status === 'draft').slice(0, 2).forEach(book => {
    actions.push({
      icon: FileEdit, iconBg: 'bg-slate-100 text-slate-600',
      title: `Continue: "${book.title}"`,
      subtitle: 'This draft is waiting to be completed and published.',
      cta: 'Continue', ctaFn: () => window.location.href = `/book/${book.id}`, urgency: 'medium',
    });
  });
  if (books.length === 0) {
    actions.push({
      icon: BookOpen, iconBg: 'bg-primary/10 text-primary',
      title: 'Publish your first eBook',
      subtitle: 'Start earning royalties by submitting your first title today.',
      cta: 'Start now', ctaFn: () => window.location.href = '/publish', urgency: 'medium',
    });
  }

  const readinessItems = [
    { label: 'Account Info',    done: !!(authorProfile?.full_name && authorProfile?.country) },
    { label: 'Payment Method',  done: !!authorProfile?.payment_method },
    { label: 'Tax Info',        done: !!(authorProfile?.tax_id || authorProfile?.tax_country) },
    { label: 'Author Profile',  done: !!authorProfile?.author_bio },
  ];
  const readinessPct = Math.round((readinessItems.filter(r => r.done).length / readinessItems.length) * 100);

  return (
    <div className="space-y-6">

      {/* ── Welcome Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-purple-500/10 backdrop-blur-xl border border-white/20 p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-xs text-muted-foreground font-medium">{getFormattedDate()}</p>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getGreeting()}, <span className="text-primary">{firstName}</span>
              <Sparkles className="w-4 h-4 inline-block ml-1.5 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xl">
              {stats.total === 0
                ? 'Your publishing workspace is ready. Start by submitting your first eBook.'
                : stats.in_review > 0
                  ? `${stats.in_review} book${stats.in_review > 1 ? 's' : ''} under review · ${stats.published} live`
                  : stats.published > 0
                    ? `${stats.published} title${stats.published !== 1 ? 's' : ''} live. Keep publishing to grow your catalog.`
                    : 'Drafts in progress. Complete them to start earning royalties.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0">
            {/* <Link to="/publish">
              <Button size="sm" className="gap-1.5 shadow-md">
                <Plus className="w-3.5 h-3.5" /> Publish New Book
              </Button>
            </Link> */}
            {stats.total > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTabChange('books')}
                className="gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> My Books
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={BookOpen}     label="Total Titles"   value={stats.total}      color="text-foreground"        onClick={() => onTabChange('books')} />
        <KpiCard icon={CheckCircle2} label="Published"      value={stats.published}  color="text-emerald-600"       onClick={() => onTabChange('books')} sub={stats.published > 0 ? 'Live on platform' : 'None yet'} />
        <KpiCard icon={Clock}        label="In Review"      value={stats.in_review}  color="text-amber-600"         onClick={() => onTabChange('reviews')} sub={stats.in_review > 0 ? 'Est. 72hrs' : 'None pending'} />
        <KpiCard icon={FileEdit}     label="Drafts"         value={stats.draft}      color="text-muted-foreground"  onClick={() => onTabChange('books')} sub={stats.draft > 0 ? 'Awaiting completion' : 'No open drafts'} />
        <KpiCard
          icon={DollarSign}
          label="Est. Royalties"
          value={`$${estimatedRoyalties.toFixed(2)}`}
          color="text-emerald-600"
          onClick={() => onTabChange('royalties')}
          sub="Based on published prices"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Action Center ── */}
        <div className="lg:col-span-2 bg-card border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold">Action Center</h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{actions.length} item{actions.length !== 1 ? 's' : ''}</span>
          </div>
          {actions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No pending actions. Keep publishing great books.</p>
            </div>
          ) : (
            actions.map((a, i) => <ActionItem key={i} {...a} />)
          )}
        </div>

        {/* ── Royalties Snapshot ── */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b bg-secondary/30 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h2 className="text-sm font-semibold">Royalties</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="text-center py-2">
              <p className="text-3xl font-bold text-emerald-600">${estimatedRoyalties.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Estimated this period</p>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={MONTHLY_DATA} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Royalties']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="royalties" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-xs text-muted-foreground">Pending Payout</span>
                <span className="text-xs font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-xs text-muted-foreground">Next Payout Date</span>
                <span className="text-xs font-semibold">Jun 30, 2026</span>
              </div>
            </div>
            <button
              onClick={() => onTabChange('royalties')}
              className="w-full text-xs text-primary font-semibold hover:underline flex items-center justify-center gap-1 pt-1"
            >
              View full earnings <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Books ── */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-sm font-semibold">Recent Books</h2>
          </div>
          <button onClick={() => onTabChange('books')} className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {books.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 text-accent-foreground" />
            </div>
            <p className="text-sm font-semibold mb-1">No books yet</p>
            <p className="text-xs text-muted-foreground mb-5">Publish your first eBook and start earning royalties today.</p>
            <Link to="/publish">
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Publish First Book</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Book</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Royalty/Sale</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {books.slice(0, 5).map(book => {
                  const rate = parseFloat(book.royalty_plan || 70) / 100;
                  const perSale = book.list_price ? book.list_price * rate : null;
                  return (
                    <tr key={book.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {book.cover_url
                            ? <img src={book.cover_url} alt={book.title} className="w-8 h-11 object-cover rounded-md shadow-sm shrink-0" />
                            : <div className="w-8 h-11 bg-secondary rounded-md flex items-center justify-center shrink-0">
                                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                          }
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate max-w-[160px]">{book.title}</p>
                            <p className="text-xs text-muted-foreground">by {book.author_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <StatusBadge status={book.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <span className="text-sm font-semibold">{book.list_price ? `$${book.list_price.toFixed(2)}` : '—'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                        <span className={`text-sm font-bold ${perSale ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {perSale ? `$${perSale.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/book/${book.id}`} className="text-xs text-primary font-semibold hover:underline flex items-center justify-end gap-0.5">
                          {book.status === 'draft' ? 'Continue' : 'View'} <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}