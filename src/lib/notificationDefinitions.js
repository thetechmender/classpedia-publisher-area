import {
  BookOpen, CreditCard, FileText, Clock, Eye, BadgeCheck,
  Pencil, Globe, TriangleAlert, Shield, CheckCircle2,
  TrendingUp, DollarSign, AlertCircle, Star, CalendarDays,
  Download, BarChart2, Gift, RefreshCcw
} from 'lucide-react';

/**
 * Build the full list of notifications from app state.
 * Each notification:
 *   id, type ('warning'|'info'|'suggestion'|'success'), title, body,
 *   icon, iconBg (tab view), trigger (tab detail), why (tab detail),
 *   steps (tab detail), action { label, to?, tab? }
 */
export function buildNotifications(books = [], authorProfile = null) {
  const notes = [];

  // ── ACCOUNT & SETUP ────────────────────────────────────────────────────────

  if (!authorProfile?.setup_complete) {
    notes.push({
      id: 'setup-incomplete',
      type: 'warning',
      title: 'Account Setup Incomplete',
      body: 'Complete the remaining steps to unlock publishing features.',
      icon: TriangleAlert,
      iconBg: 'bg-amber-100 text-amber-600',
      trigger: 'Your author account setup has not been marked as complete.',
      why: 'Without completing setup, you cannot receive royalty payments, and your books may not be eligible for full distribution. Classpedia requires verified author information for legal and financial compliance.',
      steps: [
        'Click "Continue Setup" below.',
        'Complete all required sections: Personal Info, Payment Method, and Tax Information.',
        'Submit and e-sign your IRS tax form (W-9 or W-8BEN).',
        'Once all steps are done, your account will be marked as verified.',
      ],
      action: { label: 'Continue Setup', to: '/account-setup' },
    });
  }

  // ── AUTHOR PROFILE ─────────────────────────────────────────────────────────

  if (authorProfile && !authorProfile.author_bio) {
    notes.push({
      id: 'profile-incomplete',
      type: 'warning',
      title: 'Author Profile Incomplete',
      body: 'Complete your author profile before submitting your book for review.',
      icon: Pencil,
      iconBg: 'bg-red-100 text-red-600',
      trigger: 'Your public author biography has not been filled in yet.',
      why: 'Readers are significantly more likely to purchase a book when they can learn about the author. Your bio appears on all your book listing pages.',
      steps: [
        'Go to Author Profile → Author Biography section.',
        'Write a short, engaging bio (2–4 sentences recommended).',
        'Highlight your background, expertise, or writing style.',
        'Save — your bio updates immediately on all book pages.',
      ],
      action: { label: 'Complete Profile', tab: 'profile' },
    });
  }

  // ── PAYMENT ────────────────────────────────────────────────────────────────

  if (!authorProfile?.payment_method) {
    notes.push({
      id: 'no-payment',
      type: 'warning',
      title: 'Payment Setup Required',
      body: 'Add your payment details to receive future royalty payouts.',
      icon: CreditCard,
      iconBg: 'bg-red-100 text-red-600',
      trigger: 'You have not added a bank account or PayPal address to your profile.',
      why: 'Royalty payments cannot be disbursed without a valid payment destination. Any earned royalties will be held until a payment method is added.',
      steps: [
        'Go to Account Setup → Payment Method.',
        'Choose either Bank Transfer (ACH/IBAN) or PayPal.',
        'Enter your account details accurately — this is where your earnings will be sent.',
        'Save and return to complete any remaining setup steps.',
      ],
      action: { label: 'Set Up Payment', to: '/account-setup' },
    });
  } else {
    notes.push({
      id: 'payment-added',
      type: 'success',
      title: 'Payment Method Added',
      body: 'Your payment method has been added successfully.',
      icon: CreditCard,
      iconBg: 'bg-emerald-100 text-emerald-600',
      trigger: 'A payment method is on file for your account.',
      why: 'This means royalties can be disbursed to you when they reach the payout threshold.',
      steps: [
        'Visit the Payments tab to view your payout settings.',
        'Ensure your payment details stay up to date.',
      ],
      action: { label: 'View Payment Settings', tab: 'payments' },
    });
  }

  // ── TAX ────────────────────────────────────────────────────────────────────

  if (authorProfile?.us_person === undefined || !authorProfile?.tax_id) {
    notes.push({
      id: 'no-tax',
      type: 'warning',
      title: 'Tax Information Required',
      body: 'Complete your tax information before royalties can be paid.',
      icon: FileText,
      iconBg: 'bg-red-100 text-red-600',
      trigger: 'Your tax residency status or Tax ID (SSN / EIN / Foreign TIN) has not been provided.',
      why: 'US tax law requires all publishers to collect W-9 (US persons) or W-8BEN (non-US persons) information before issuing payments. Without it, Classpedia is legally required to withhold 30% of your earnings.',
      steps: [
        'Go to Account Setup → Tax Information.',
        'Select whether you are a US person (W-9) or a non-US person (W-8BEN).',
        'Enter your Tax ID: SSN or EIN for US authors; Foreign TIN for international authors.',
        'Review and e-sign your tax form with your full legal name.',
        'Certify accuracy — you are legally responsible for the information provided.',
      ],
      action: { label: 'Complete Tax Form', to: '/account-setup' },
    });
  } else if (!authorProfile?.tax_certified) {
    notes.push({
      id: 'tax-draft',
      type: 'info',
      title: 'Tax Form Saved as Draft',
      body: 'Your tax form has been saved. Complete and submit it when ready.',
      icon: FileText,
      iconBg: 'bg-blue-100 text-blue-600',
      trigger: 'Tax information is partially filled but not yet certified.',
      why: 'Your tax form must be certified before payouts can be processed.',
      steps: [
        'Go to Account Setup → Tax Information.',
        'Review all entered information.',
        'E-sign and certify your form to unlock payouts.',
      ],
      action: { label: 'Continue Tax Form', to: '/account-setup' },
    });
  }

  // ── BOOK STATUS ────────────────────────────────────────────────────────────

  if (books.length === 0) {
    notes.push({
      id: 'no-books',
      type: 'suggestion',
      title: "You haven't published any books yet",
      body: 'Publish your first book to start earning royalties on Classpedia.',
      icon: BookOpen,
      iconBg: 'bg-primary/10 text-primary',
      trigger: 'No books have been created in your account.',
      why: 'Publishing your first book is the first step to earning royalties on Classpedia. The sooner your book is live, the sooner you start generating sales.',
      steps: [
        'Click "Publish New Book" in the top navigation bar.',
        'Complete all sections: Book Details, Content Upload, Cover Image, and Pricing.',
        'Submit for review — approval typically takes up to 72 hours.',
        'Once approved, your book will go live on classpedia.ai automatically.',
      ],
      action: { label: 'Publish a Book', to: '/publish' },
    });
  }

  const drafts = books.filter(b => b.status === 'draft');
  if (drafts.length > 0) {
    notes.push({
      id: 'drafts',
      type: 'info',
      title: `Book Draft${drafts.length > 1 ? 's' : ''} Created`,
      body: `"${drafts[0].title}"${drafts.length > 1 ? ` and ${drafts.length - 1} more` : ''} — saved as draft${drafts.length > 1 ? 's' : ''}.`,
      icon: BookOpen,
      iconBg: 'bg-blue-100 text-blue-600',
      trigger: `You have ${drafts.length} book${drafts.length > 1 ? 's' : ''} saved as drafts.`,
      why: 'Draft books are not visible to readers and generate no sales or royalties. Submitting for review is required to make your book available on the marketplace.',
      steps: [
        'Go to My Books and open each draft.',
        'Ensure all required fields are complete: title, description, manuscript file, cover image, and pricing.',
        'Click "Submit for Review" — Classpedia will review your book within 72 hours.',
        'You will be notified once the review is complete and your book is published.',
      ],
      action: { label: 'Continue Editing', tab: 'books' },
    });
  }

  const inReview = books.filter(b => b.status === 'in_review');
  if (inReview.length > 0) {
    notes.push({
      id: 'in-review',
      type: 'info',
      title: `Book${inReview.length > 1 ? 's' : ''} Submitted for Review`,
      body: `"${inReview[0].title}"${inReview.length > 1 ? ` and ${inReview.length - 1} more` : ''} — under editorial review.`,
      icon: Clock,
      iconBg: 'bg-blue-100 text-blue-600',
      trigger: `"${inReview[0].title}"${inReview.length > 1 ? ` and ${inReview.length - 1} more books` : ''} have been submitted and are currently being reviewed.`,
      why: 'The Classpedia editorial team reviews all submissions for content quality, formatting standards, and metadata completeness before they go live.',
      steps: [
        'No action is required from you right now.',
        'The review process typically takes up to 72 hours on business days.',
        'If your book is approved, it will automatically be set to "Published".',
        'If changes are requested, you will receive a notification with specific feedback.',
        'You can monitor the status in My Books at any time.',
      ],
      action: { label: 'Track Review', tab: 'books' },
    });
  }

  const published = books.filter(b => b.status === 'published');
  if (published.length > 0) {
    notes.push({
      id: 'published',
      type: 'success',
      title: `Book${published.length > 1 ? 's Are' : ' Is'} Now Live`,
      body: `${published.length} book${published.length > 1 ? 's are' : ' is'} live on Classpedia and available to readers.`,
      icon: BadgeCheck,
      iconBg: 'bg-emerald-100 text-emerald-600',
      trigger: `You have ${published.length} published book${published.length > 1 ? 's' : ''} actively available for purchase on classpedia.ai.`,
      why: 'Your books are earning royalties with every sale. Monitor your sales performance in Sales & Royalties to understand trends.',
      steps: [
        'Visit Sales & Royalties to track units sold and revenue.',
        'Review reader feedback in Reviews & Issues.',
        'Consider updating your book description or cover to improve conversion.',
        'Promote your book on social media using your author profile links.',
      ],
      action: { label: 'View Book', tab: 'royalties' },
    });
  }

  const unpublished = books.filter(b => b.status === 'unpublished');
  if (unpublished.length > 0) {
    notes.push({
      id: 'unpublished',
      type: 'warning',
      title: 'Book Temporarily Unavailable',
      body: `"${unpublished[0].title}"${unpublished.length > 1 ? ` and ${unpublished.length - 1} more` : ''} — not visible to buyers.`,
      icon: Eye,
      iconBg: 'bg-amber-100 text-amber-600',
      trigger: `"${unpublished[0].title}"${unpublished.length > 1 ? ` and ${unpublished.length - 1} more` : ''} have been taken off the marketplace.`,
      why: 'Unpublished books are not visible to buyers and generate no new sales. This may be due to a content policy issue, your own action, or a review outcome.',
      steps: [
        'Go to My Books to view the affected title(s).',
        'Check if there are any issue reports or editorial notes attached.',
        'If the unpublishing was unintentional, contact Classpedia support.',
        'Resolve any flagged issues and resubmit for review to restore availability.',
      ],
      action: { label: 'View Details', tab: 'books' },
    });
  }

  // ── PROMOTIONS ─────────────────────────────────────────────────────────────

  if (published.length > 0) {
    notes.push({
      id: 'promo-available',
      type: 'info',
      title: '60-Day Book Visibility Program Available',
      body: 'Your live book is eligible for the 60-Day Book Visibility Program.',
      icon: Gift,
      iconBg: 'bg-purple-100 text-purple-600',
      trigger: `You have ${published.length} live book${published.length > 1 ? 's' : ''} eligible for promotional enrollment.`,
      why: 'The 60-Day Visibility Program gives your book enhanced discoverability and up to 3 free promotional days to drive downloads and reviews.',
      steps: [
        'Go to Promotions in the dashboard sidebar.',
        'Select an eligible book and click "Enroll".',
        'Schedule up to 3 free promotional days within the 60-day window.',
        'Monitor downloads and post-promo paid sales in the Royalties tab.',
      ],
      action: { label: 'Enroll Book', tab: 'promotions' },
    });
  }

  // ── ROYALTIES ──────────────────────────────────────────────────────────────

  if (published.length > 0) {
    notes.push({
      id: 'royalty-estimate',
      type: 'info',
      title: 'Royalty Estimate Updated',
      body: 'Your estimated royalties have been updated based on the latest paid sales.',
      icon: DollarSign,
      iconBg: 'bg-emerald-100 text-emerald-600',
      trigger: 'New sales activity has been recorded for your published books.',
      why: 'Tracking your royalty estimates helps you plan finances and understand which books are performing best.',
      steps: [
        'Visit the Royalties tab to view updated estimates.',
        'Review the per-book breakdown to see top performers.',
        'Check payout threshold status under Payments.',
      ],
      action: { label: 'View Royalties', tab: 'royalties' },
    });
  }

  // ── SUGGESTIONS ────────────────────────────────────────────────────────────

  if (!authorProfile?.twitter_handle && !authorProfile?.instagram_handle && !authorProfile?.website) {
    notes.push({
      id: 'no-social',
      type: 'suggestion',
      title: 'No Social Media or Website Linked',
      body: 'Add your website or social handles to build reader trust.',
      icon: Globe,
      iconBg: 'bg-primary/10 text-primary',
      trigger: 'Your author profile has no website, Twitter/X, or Instagram handle set.',
      why: 'Social links build reader trust and discoverability. Authors with linked profiles receive more clicks and repeat purchases.',
      steps: [
        'Go to Author Profile → Online Presence section.',
        'Add at least one social link or your website URL.',
        'Twitter/X, Instagram, LinkedIn, Facebook, and YouTube are all supported.',
        'These links are displayed publicly on your author page.',
      ],
      action: { label: 'Edit Profile', tab: 'profile' },
    });
  }

  return notes;
}

export const TYPE_CONFIG = {
  warning: {
    label: 'Action Required',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    cardClass: 'border-red-200 bg-red-50/60',
    headerClass: 'bg-red-100/60 border-red-200',
    stepDot: 'bg-red-400',
    summaryBg: 'bg-red-50 border-red-200',
    summaryText: 'text-red-600',
    dot: 'bg-red-500',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    bar: 'bg-red-400',
  },
  info: {
    label: 'Status Update',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    cardClass: 'border-blue-200 bg-blue-50/60',
    headerClass: 'bg-blue-100/60 border-blue-200',
    stepDot: 'bg-blue-400',
    summaryBg: 'bg-blue-50 border-blue-200',
    summaryText: 'text-blue-600',
    dot: 'bg-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    bar: 'bg-blue-400',
  },
  suggestion: {
    label: 'Suggestion',
    badgeClass: 'bg-secondary text-muted-foreground border-border',
    cardClass: 'border-border bg-card',
    headerClass: 'bg-secondary/40 border-border',
    stepDot: 'bg-primary',
    summaryBg: 'bg-primary/5 border-primary/20',
    summaryText: 'text-primary',
    dot: 'bg-primary',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    bar: 'bg-primary/60',
  },
  success: {
    label: 'Completed',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cardClass: 'border-emerald-200 bg-emerald-50/60',
    headerClass: 'bg-emerald-100/60 border-emerald-200',
    stepDot: 'bg-emerald-400',
    summaryBg: 'bg-emerald-50 border-emerald-200',
    summaryText: 'text-emerald-600',
    dot: 'bg-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    bar: 'bg-emerald-400',
  },
};