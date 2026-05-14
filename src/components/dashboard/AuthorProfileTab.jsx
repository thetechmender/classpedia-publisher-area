import React from 'react';
import { User, Mail, Phone, MapPin, Globe, CreditCard, FileText } from 'lucide-react';

function Row({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-foreground mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function AuthorProfileTab({ authorProfile }) {
  if (!authorProfile) return (
    <div className="text-center py-16 text-muted-foreground text-sm">No profile found.</div>
  );

  const address = [
    authorProfile.address_line1,
    authorProfile.address_line2,
    authorProfile.city,
    authorProfile.state,
    authorProfile.zip,
    authorProfile.country,
  ].filter(Boolean).join(', ');

  const paymentInfo = authorProfile.payment_method === 'paypal'
    ? `PayPal — ${authorProfile.paypal_email}`
    : authorProfile.payment_method === 'bank_transfer'
      ? `Bank Transfer — Account: ${authorProfile.bank_account_name}`
      : 'Not configured';

  const taxInfo = authorProfile.us_person
    ? `US Person · ${authorProfile.tax_id_type?.toUpperCase()} ****${authorProfile.tax_id?.slice(-4) || '****'}`
    : `Non-US · ${authorProfile.tax_country || ''}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Author Profile</h2>
        <p className="text-sm text-muted-foreground">Your account details and publishing identity.</p>
      </div>

      {/* Identity */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/30 px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
            {(authorProfile.pen_name || authorProfile.full_name || '?')[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-base">{authorProfile.pen_name || authorProfile.full_name}</h3>
            {authorProfile.pen_name && authorProfile.full_name !== authorProfile.pen_name && (
              <p className="text-xs text-muted-foreground">Legal name: {authorProfile.full_name}</p>
            )}
            {authorProfile.author_bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{authorProfile.author_bio}</p>
            )}
          </div>
        </div>

        <div className="px-6">
          <Row icon={Mail}    label="Email"          value={authorProfile.email} />
          <Row icon={Phone}   label="Phone"          value={authorProfile.phone} />
          <Row icon={MapPin}  label="Address"        value={address} />
          <Row icon={Globe}   label="Website"        value={authorProfile.website} />
        </div>
      </div>

      {/* Payment & Tax */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Payment Method</h3>
          </div>
          <p className="text-sm text-foreground">{paymentInfo}</p>
        </div>
        <div className="bg-card border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Tax Information</h3>
          </div>
          <p className="text-sm text-foreground">{taxInfo}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        To update your account details, please contact Classpedia support.
      </p>
    </div>
  );
}