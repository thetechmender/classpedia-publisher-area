import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, CheckCircle2, AlertTriangle, Clock, BookOpen,
  CreditCard, FileText, Info, ChevronRight, X, Filter,
  Lightbulb, Globe, ArrowRight, CircleHelp, TriangleAlert,
  BadgeCheck, Eye, Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─── Notification definitions ────────────────────────────────────────────────
// Each notification has:
//   trigger:    the data condition that makes it appear
//   why:        why this matters to the author
//   howToFix:   step-by-step instructions on what to do
//   action:     CTA button config
// ─────────────────────────────────────────────────────────────────────────────

function buildNotifications(books = [], authorProfile = null) {
  const notes = [];

  // ── ACTION REQUIRED ────────────────────────────────────────────────────────

  if (!authorProfile?.setup_complete) {
    notes.push({
      id: 'setup-incomplete',
      type: 'warning',
      title: 'Account setup not completed',
      trigger: 'Your author account setup has not been marked as complete.',
      why: 'Without completing setup, you cannot receive royalty payments, and your books may not be eligible for full distribution. Classpedia requires verified author information for legal and financial compliance.',
      steps: [
        'Click "Finish Account Setup" below.',
        'Complete all required sections: Personal Info, Payment Method, and Tax Information.',
        'Submit and e-sign your IRS tax form (W-9 or W-8BEN).',
        'Once all steps are done, your account will be marked as verified.',
      ],
      icon: TriangleAlert,
      iconBg: 'bg-amber-100 text-amber-600',
      action: { label: 'Finish Account Setup', to: '/account-setup' },
    });
  }

  if (!authorProfile?.payment_method) {
    notes.push({
      id: 'no-payment',
      type: 'warning',
      title: 'No payment method on file',
      trigger: 'You have not added a bank account or PayPal address to your profile.',
      why: 'Royalty payments cannot be disbursed without a valid payment destination. Any earned royalties will be held until a payment method is added.',
      steps: [
        'Go to Account Setup → Payment Method.',
        'Choose either Bank Transfer (ACH/IBAN) or PayPal.',
        'Enter your account details accurately — this is where your earnings will be sent.',
        'Save and return to complete any remaining setup steps.',
      ],
      icon: CreditCard,
      iconBg: 'bg-red-100 text-red-600',
      action: { label: 'Add Payment Method', to: '/account-setup' },
    });
  }

  if (authorProfile?.us_person === undefined || !authorProfile?.tax_id) {
    notes.push({
      id: 'no-tax',
      type: 'warning',
      title: 'Tax information missing',
      trigger: 'Your tax residency status or Tax ID (SSN / EIN / Foreign TIN) has not been provided.',
      why: 'US tax law requires all publishers to collect W-9 (US persons) or W-8BEN (non-US persons) information before issuing payments. Without it, Classpedia is legally required to withhold 30% of your earnings.',
      steps: [
        'Go to Account Setup → Tax Information.',
        'Select whether you are a US person (W-9) or a non-US person (W-8BEN).',
        'Enter your Tax ID: SSN or EIN for US authors; Foreign TIN for international authors.',
        'Review and e-sign your tax form with your full legal name.',
        'Certify accuracy — you are legally responsible for the information provided.',
      ],
      icon: FileText,
      iconBg: 'bg-red-100 text-red-600',
      action: { label: 'Add Tax Info', to: '/account-setup' },
    });
  }

  // ── BOOK STATUS ────────────────────────────────────────────────────────────

  const drafts = books.filter(b => b.status === 'draft');
  if (drafts.length > 0) {
    notes.push({
      id: 'drafts',
      type: 'info',
      title: `${drafts.length} draft book${drafts.length > 1 ? 's' : ''} not yet submitted`,
      trigger: `You have ${drafts.length} book${drafts.length > 1 ? 's' : ''} saved as drafts: "${drafts[0].title}"${drafts.length > 1 ? ` and ${drafts.length - 1} more` : ''}.`,
      why: 'Draft books are not visible to readers and generate no sales or royalties. Submitting for review is required to make your book available on the marketplace.',
      steps: [
        'Go to My Books and open each draft.',
        'Ensure all required fields are complete: title, description, manuscript file, cover image, and pricing.',
        'Click "Submit for Review" — Classpedia will review your book within 72 hours.',
        'You will be notified once the review is complete and your book is published.',
      ],
      icon: BookOpen,
      iconBg: 'bg-blue-100 text-blue-600',
      action: { label: 'Go to My Books', tab: 'books' },
    });
  }

  const inReview = books.filter(b => b.status === 'in_review');
  if (inReview.length > 0) {
    notes.push({
      id: 'in-review',
      type: 'info',
      title: `${inReview.length} book${inReview.length > 1 ? 's' : ''} under editorial review`,
      trigger: `"${inReview[0].title}"${inReview.length > 1 ? ` and ${inReview.length - 1} more books` : ''} have been submitted and are currently being reviewed.`,
      why: 'The Classpedia editorial team reviews all submissions for content quality, formatting standards, and metadata completeness before they go live. This process protects the marketplace quality.',
      steps: [
        'No action is required from you right now.',
        'The review process typically takes up to 72 hours on business days.',
        'If your book is approved, it will automatically be set to "Published".',
        'If changes are requested, you will receive a notification with specific feedback.',
        'You can monitor the status in My Books at any time.',
      ],
      icon: Clock,
      iconBg: 'bg-blue-100 text-blue-600',
      action: { label: 'View in My Books', tab: 'books' },
    });
  }

  const unpublished = books.filter(b => b.status === 'unpublished');
  if (unpublished.length > 0) {
    notes.push({
      id: 'unpublished',
      type: 'warning',
      title: `${unpublished.length} book${unpublished.length > 1 ? 's' : ''} unpublished`,
      trigger: `"${unpublished[0].title}"${unpublished.length > 1 ? ` and ${unpublished.length - 1} more` : ''} have been taken off the marketplace.`,
      why: 'Unpublished books are not visible to buyers and generate no new sales. This may be due to a content policy issue, your own action, or a review outcome.',
      steps: [
        'Go to My Books to view the affected title(s).',
        'Check if there are any issue reports or editorial notes attached.',
        'If the unpublishing was unintentional, contact Classpedia support.',
        'Resolve any flagged issues and resubmit for review to restore availability.',
      ],
      icon: Eye,
      iconBg: 'bg-amber-100 text-amber-600',
      action: { label: 'View in My Books', tab: 'books' },
    });
  }

  const published = books.filter(b => b.status === 'published');
  if (published.length > 0) {
    notes.push({
      id: 'published',
      type: 'success',
      title: `${published.length} book${published.length > 1 ? 's' : ''} live on the marketplace`,
      trigger: `You have ${published.length} published book${published.length > 1 ? 's' : ''} actively available for purchase on classpedia.ai.`,
      why: 'Your books are earning royalties with every sale. Monitor your sales performance in Sales & Royalties to understand trends.',
      steps: [
        'Visit Sales & Royalties to track units sold and revenue.',
        'Review reader feedback in Reviews & Issues.',
        'Consider updating your book description or cover to improve conversion.',
        'Promote your book on social media using your author profile links.',
      ],
      icon: BadgeCheck,
      iconBg: 'bg-emerald-100 text-emerald-600',
      action: { label: 'View Sales', tab: 'royalties' },
    });
  }

  // ── SUGGESTIONS ────────────────────────────────────────────────────────────

  if (!authorProfile?.author_bio) {
    notes.push({
      id: 'no-bio',
      type: 'suggestion',
      title: 'Author biography is missing',
      trigger: 'Your public author biography has not been filled in yet.',
      why: 'Readers are significantly more likely to purchase a book when they can learn about the author. Your bio appears on all your book listing pages on classpedia.ai.',
      steps: [
        'Go to Author Profile → Author Biography section.',
        'Click "Edit" and write a short, engaging bio (2–4 sentences recommended).',
        'Highlight your background, expertise, or writing style.',
        'Save — your bio updates immediately on all book pages.',
      ],
      icon: Pencil,
      iconBg: 'bg-primary/10 text-primary',
      action: { label: 'Edit Profile', tab: 'profile' },
    });
  }

  if (!authorProfile?.twitter_handle && !authorProfile?.instagram_handle && !authorProfile?.website) {
    notes.push({
      id: 'no-social',
      type: 'suggestion',
      title: 'No social media or website linked',
      trigger: 'Your author profile has no website, Twitter/X, or Instagram handle set.',
      why: 'Social links build reader trust and discoverability. Authors with linked profiles receive more clicks and repeat purchases.',
      steps: [
        'Go to Author Profile → Online Presence section.',
        'Click "Edit" and add at least one social link or your website URL.',
        'Twitter/X, Instagram, LinkedIn, Facebook, and YouTube are all supported.',
        'These links are displayed publicly on your author page.',
      ],
      icon: Globe,
      iconBg: 'bg-primary/10 text-primary',
      action: { label: 'Edit Profile', tab: 'profile' },
    });
  }

  if (books.length === 0) {
    notes.push({
      id: 'no-books',
      type: 'suggestion',
      title: 'You haven\'t published any books yet',
      trigger: 'No books have been created in your account.',
      why: 'Publishing your first book is the first step to earning royalties on Classpedia. The sooner your book is live, the sooner you start generating sales.',
      steps: [
        'Click "Publish New Book" in the top navigation bar.',
        'Complete all sections: Book Details, Content Upload, Cover Image, and Pricing.',
        'Submit for review — approval typically takes up to 72 hours.',
        'Once approved, your book will go live on classpedia.ai automatically.',
      ],
      icon: BookOpen,
      iconBg: 'bg-primary/10 text-primary',
      action: { label: 'Publish a Book', to: '/publish' },
    });
  }

  return notes;
}

// ─── Type display config ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
  warning: {
    label: 'Action Required',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    cardClass: 'border-red-200 bg-red-50/60',
    headerClass: 'bg-red-100/60 border-red-200',
    stepDot: 'bg-red-400',
    summaryBg: 'bg-red-50 border-red-200',
    summaryText: 'text-red-600',
  },
  info: {
    label: 'Status Update',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    cardClass: 'border-blue-200 bg-blue-50/60',
    headerClass: 'bg-blue-100/60 border-blue-200',
    stepDot: 'bg-blue-400',
    summaryBg: 'bg-blue-50 border-blue-200',
    summaryText: 'text-blue-600',
  },
  suggestion: {
    label: 'Suggestion',
    badgeClass: 'bg-secondary text-muted-foreground border-border',
    cardClass: 'border-border bg-card',
    headerClass: 'bg-secondary/40 border-border',
    stepDot: 'bg-primary',
    summaryBg: 'bg-primary/5 border-primary/20',
    summaryText: 'text-primary',
  },
  success: {
    label: 'Good News',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cardClass: 'border-emerald-200 bg-emerald-50/60',
    headerClass: 'bg-emerald-100/60 border-emerald-200',
    stepDot: 'bg-emerald-400',
    summaryBg: 'bg-emerald-50 border-emerald-200',
    summaryText: 'text-emerald-600',
  },
};

const FILTERS = ['all', 'warning', 'info', 'suggestion', 'success'];
const FILTER_LABELS = { all: 'All', warning: 'Action Required', info: 'Status', suggestion: 'Suggestions', success: 'Good News' };

// ─── Single notification card ─────────────────────────────────────────────────
function NotificationCard({ n, onDismiss, onTabChange }) {
  const [expanded, setExpanded] = useState(false);
  const tc = TYPE_CONFIG[n.type];
  const Icon = n.icon;

  return (
    <div className={cn('rounded-2xl border overflow-hidden shadow-sm transition-all', tc.cardClass)}>
      {/* Card header row */}
      <div
        className={cn('flex items-start gap-3 px-4 py-3.5 cursor-pointer select-none border-b', tc.headerClass)}
        onClick={() => setExpanded(e => !e)}
      >
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', n.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-snug">{n.title}</p>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', tc.badgeClass)}>
              {tc.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">{n.trigger}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <button
            onClick={e => { e.stopPropagation(); onDismiss(n.id); }}
            className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className={cn('w-4 h-4 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 py-4 space-y-4">

          {/* Trigger */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">What triggered this</p>
            <p className="text-sm leading-relaxed">{n.trigger}</p>
          </div>

          {/* Why it matters */}
          <div className="rounded-xl bg-black/5 border border-black/5 px-4 py-3 flex gap-3">
            <CircleHelp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Why this matters</p>
              <p className="text-sm leading-relaxed">{n.why}</p>
            </div>
          </div>

          {/* Step-by-step instructions */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">How to resolve</p>
            <ol className="space-y-2">
              {n.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5',
                    tc.stepDot
                  )}>
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* CTA */}
          {n.action && (
            <div className="pt-1">
              {n.action.to ? (
                <Link to={n.action.to}>
                  <Button size="sm" className="gap-2 text-xs">
                    {n.action.label} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => onTabChange && onTabChange(n.action.tab)}
                >
                  {n.action.label} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
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
            Click any notification to see what triggered it, why it matters, and exactly what to do.
          </p>
        </div>
        {visible.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll} className="shrink-0 gap-1.5 text-xs">
            <X className="w-3.5 h-3.5" /> Dismiss all
          </Button>
        )}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Action Required', type: 'warning' },
          { label: 'Status Updates', type: 'info' },
          { label: 'Suggestions', type: 'suggestion' },
          { label: 'Good News', type: 'success' },
        ].map(({ label, type }) => {
          const tc = TYPE_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? 'all' : type)}
              className={cn(
                'rounded-xl border p-3 text-left transition-all',
                tc.summaryBg,
                filter === type ? 'ring-2 ring-primary/40 ring-offset-1' : 'hover:opacity-80'
              )}
            >
              <p className={cn('text-2xl font-bold', tc.summaryText)}>{counts[type]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'text-xs px-3 py-1 rounded-full border transition-colors font-medium',
              filter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:bg-secondary'
            )}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
            <p className="font-semibold text-base">All clear!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === 'all' ? 'No notifications at this time.' : `No "${FILTER_LABELS[filter]}" notifications right now.`}
            </p>
          </div>
        ) : (
          filtered.map(n => (
            <NotificationCard
              key={n.id}
              n={n}
              onDismiss={dismiss}
              onTabChange={onTabChange}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-border bg-secondary/20 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5" /> Notification types explained
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { type: 'warning', desc: 'Something is blocking payments or publishing. Must be resolved.' },
            { type: 'info',    desc: 'A status update about your books (review, draft, etc.). May require attention.' },
            { type: 'suggestion', desc: 'Optional improvements to your profile or books to increase sales.' },
            { type: 'success', desc: 'Positive milestones — books live, setup complete, etc.' },
          ].map(({ type, desc }) => {
            const tc = TYPE_CONFIG[type];
            return (
              <div key={type} className="flex items-start gap-2.5">
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 mt-0.5', tc.badgeClass)}>
                  {tc.label}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}