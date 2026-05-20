import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, CheckCircle2, AlertTriangle, Clock, BookOpen,
  CreditCard, FileText, Info, ChevronRight, X, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TYPE_CONFIG = {
  warning: {
    label: 'Action Required',
    color: 'bg-red-50 border-red-200 text-red-700',
    badgeClass: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  info: {
    label: 'Info',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  suggestion: {
    label: 'Suggestion',
    color: 'bg-secondary/50 border-border text-foreground',
    badgeClass: 'bg-secondary text-muted-foreground',
    dot: 'bg-primary',
  },
  success: {
    label: 'Good News',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
};

function buildNotifications(books = [], authorProfile = null) {
  const notes = [];

  // --- ACTION REQUIRED ---
  if (!authorProfile?.payment_method) {
    notes.push({
      id: 'no-payment',
      type: 'warning',
      title: 'Payment method missing',
      body: 'You won\'t receive royalty payouts until you add your bank account or PayPal details.',
      icon: CreditCard,
      iconBg: 'bg-red-100 text-red-600',
      action: { label: 'Complete Setup', to: '/account-setup' },
    });
  }

  if (authorProfile?.us_person === undefined || !authorProfile?.tax_id) {
    notes.push({
      id: 'no-tax',
      type: 'warning',
      title: 'Tax information incomplete',
      body: 'IRS-required tax info (W-9 / W-8BEN) must be on file before any royalty payment can be processed.',
      icon: FileText,
      iconBg: 'bg-red-100 text-red-600',
      action: { label: 'Complete Setup', to: '/account-setup' },
    });
  }

  if (!authorProfile?.setup_complete) {
    notes.push({
      id: 'setup-incomplete',
      type: 'warning',
      title: 'Account setup not completed',
      body: 'Finish your author account setup to unlock publishing and royalty features.',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 text-amber-600',
      action: { label: 'Finish Setup', to: '/account-setup' },
    });
  }

  // --- BOOK STATUS ---
  const drafts = books.filter(b => b.status === 'draft');
  if (drafts.length > 0) {
    notes.push({
      id: 'drafts',
      type: 'info',
      title: `${drafts.length} draft book${drafts.length > 1 ? 's' : ''} awaiting submission`,
      body: `"${drafts[0].title}"${drafts.length > 1 ? ` and ${drafts.length - 1} more` : ''} — complete and publish to start earning.`,
      icon: BookOpen,
      iconBg: 'bg-blue-100 text-blue-600',
      action: { label: 'View Books', tab: 'books' },
    });
  }

  const inReview = books.filter(b => b.status === 'in_review');
  if (inReview.length > 0) {
    notes.push({
      id: 'in-review',
      type: 'info',
      title: `${inReview.length} book${inReview.length > 1 ? 's' : ''} currently under review`,
      body: `"${inReview[0].title}" has been submitted and is being reviewed. This typically takes up to 72 hours.`,
      icon: Clock,
      iconBg: 'bg-blue-100 text-blue-600',
    });
  }

  const published = books.filter(b => b.status === 'published');
  if (published.length > 0) {
    notes.push({
      id: 'published',
      type: 'success',
      title: `${published.length} book${published.length > 1 ? 's' : ''} live on the marketplace`,
      body: `Your published books are live and available for purchase on classpedia.ai.`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100 text-emerald-600',
      action: { label: 'View Books', tab: 'books' },
    });
  }

  // --- SUGGESTIONS ---
  if (!authorProfile?.author_bio) {
    notes.push({
      id: 'no-bio',
      type: 'suggestion',
      title: 'Add your author biography',
      body: 'Readers are significantly more likely to purchase books from authors with a compelling bio.',
      icon: BookOpen,
      iconBg: 'bg-primary/10 text-primary',
      action: { label: 'Edit Profile', tab: 'profile' },
    });
  }

  if (!authorProfile?.twitter_handle && !authorProfile?.instagram_handle && !authorProfile?.website) {
    notes.push({
      id: 'no-social',
      type: 'suggestion',
      title: 'Connect your social media',
      body: 'Link your website and social profiles to build trust with readers and boost discoverability.',
      icon: Info,
      iconBg: 'bg-primary/10 text-primary',
      action: { label: 'Edit Profile', tab: 'profile' },
    });
  }

  return notes;
}

const FILTERS = ['all', 'warning', 'info', 'suggestion', 'success'];

export default function NotificationsTab({ books = [], authorProfile = null, onTabChange }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [filter, setFilter] = useState('all');

  const all = buildNotifications(books, authorProfile);
  const visible = all.filter(n => !dismissed.has(n.id));
  const filtered = filter === 'all' ? visible : visible.filter(n => n.type === filter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? visible.length : visible.filter(n => n.type === f).length;
    return acc;
  }, {});

  const dismiss = (id) => setDismissed(prev => new Set([...prev, id]));
  const clearAll = () => setDismissed(new Set(all.map(n => n.id)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Alerts, status updates, and suggestions for your account.
          </p>
        </div>
        {visible.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll} className="shrink-0 gap-1.5 text-xs">
            <X className="w-3.5 h-3.5" /> Clear all
          </Button>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Action Required', type: 'warning', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
          { label: 'Info', type: 'info', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Suggestions', type: 'suggestion', color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
          { label: 'Good News', type: 'success', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
        ].map(({ label, type, color, bg }) => (
          <button
            key={type}
            onClick={() => setFilter(filter === type ? 'all' : type)}
            className={cn(
              'rounded-xl border p-3 text-left transition-all',
              bg,
              filter === type ? 'ring-2 ring-offset-1 ring-primary/30' : 'hover:opacity-80'
            )}
          >
            <p className={cn('text-2xl font-bold', color)}>{counts[type]}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-colors capitalize font-medium',
              filter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:bg-secondary'
            )}
          >
            {f === 'all' ? `All (${counts.all})` : `${f} (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="font-semibold text-base">All caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' ? 'No notifications at this time.' : `No ${filter} notifications.`}
            </p>
          </div>
        ) : (
          filtered.map(n => {
            const Icon = n.icon;
            const tc = TYPE_CONFIG[n.type];
            return (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all group',
                  tc.color
                )}
              >
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5', n.iconBg)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold leading-snug">{n.title}</p>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', tc.badgeClass)}>
                      {tc.label}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed opacity-80">{n.body}</p>
                  {n.action && (
                    <div className="mt-2.5">
                      {n.action.to ? (
                        <Link to={n.action.to}>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 bg-white/60 hover:bg-white border-current/30">
                            {n.action.label} <ChevronRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 bg-white/60 hover:bg-white border-current/30"
                          onClick={() => onTabChange && onTabChange(n.action.tab)}
                        >
                          {n.action.label} <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}