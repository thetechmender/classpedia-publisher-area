import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertTriangle, Clock, BookOpen, DollarSign, FileText, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

function buildNotifications(books = [], authorProfile = null) {
  const notes = [];

  if (!authorProfile?.payment_method) {
    notes.push({
      id: 'no-payment',
      type: 'warning',
      title: 'Payment method missing',
      body: 'Add your bank or PayPal to receive royalty payouts.',
      icon: CreditCard,
      iconBg: 'bg-amber-100 text-amber-600',
    });
  }

  if (authorProfile?.us_person === undefined || !authorProfile?.tax_id) {
    notes.push({
      id: 'no-tax',
      type: 'warning',
      title: 'Tax information incomplete',
      body: 'Required for royalty processing and IRS compliance.',
      icon: FileText,
      iconBg: 'bg-red-100 text-red-600',
    });
  }

  const drafts = books.filter(b => b.status === 'draft');
  if (drafts.length > 0) {
    notes.push({
      id: 'drafts',
      type: 'info',
      title: `${drafts.length} draft${drafts.length > 1 ? 's' : ''} awaiting submission`,
      body: `"${drafts[0].title}"${drafts.length > 1 ? ` and ${drafts.length - 1} more` : ''} — complete and publish to start earning.`,
      icon: BookOpen,
      iconBg: 'bg-slate-100 text-slate-600',
    });
  }

  const inReview = books.filter(b => b.status === 'in_review');
  if (inReview.length > 0) {
    notes.push({
      id: 'in-review',
      type: 'info',
      title: `${inReview.length} book${inReview.length > 1 ? 's' : ''} under review`,
      body: `"${inReview[0].title}" is being reviewed. Estimated 72 hours.`,
      icon: Clock,
      iconBg: 'bg-blue-100 text-blue-600',
    });
  }

  if (!authorProfile?.author_bio) {
    notes.push({
      id: 'no-bio',
      type: 'suggestion',
      title: 'Add your author biography',
      body: 'Readers are more likely to buy books with a compelling author bio.',
      icon: BookOpen,
      iconBg: 'bg-primary/10 text-primary',
    });
  }

  return notes;
}

export default function NotificationCenter({ books = [], authorProfile = null }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const ref = useRef(null);

  const allNotifications = buildNotifications(books, authorProfile);
  const visible = allNotifications.filter(n => !dismissed.has(n.id));
  const urgentCount = visible.filter(n => n.type === 'warning').length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dismiss = (id) => setDismissed(prev => new Set([...prev, id]));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg transition-colors relative',
          open ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {visible.length > 0 && (
          <span className={cn(
            'absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white',
            urgentCount > 0 ? 'bg-red-500' : 'bg-primary'
          )}>
            {visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-sm font-semibold">Notifications</p>
              {visible.length > 0 && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {visible.length}
                </span>
              )}
            </div>
            {visible.length > 0 && (
              <button
                onClick={() => setDismissed(new Set(allNotifications.map(n => n.id)))}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {visible.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium">All caught up</p>
                <p className="text-xs text-muted-foreground mt-1">No pending notifications.</p>
              </div>
            ) : (
              visible.map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors group">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', n.iconBg)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}