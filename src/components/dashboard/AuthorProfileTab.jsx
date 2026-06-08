import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CredentialService } from '@/services/credential.service';
import {
  User, Mail, Phone, MapPin, Globe, CreditCard, FileText,
  Pencil, Check, X, AlertCircle, Shield, Twitter,
  Instagram, Facebook, Linkedin, Youtube, CheckCircle2, Clock, BookOpen, ArrowRight, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function SectionCard({ icon: Icon, title, badge, children }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-secondary/30 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {badge}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, placeholder = '—' }) {
  if (!value && !placeholder) return null;
  return (
    <div className="flex items-start justify-between gap-6 px-6 py-4 border-b last:border-0 hover:bg-secondary/20 transition-colors">
      <span className="text-xs text-muted-foreground font-semibold w-32 shrink-0 mt-0.5 uppercase tracking-wider">{label}</span>
      <span className={cn('text-sm flex-1 text-right', value ? 'text-foreground font-medium' : 'text-muted-foreground italic')}>
        {value || placeholder}
      </span>
    </div>
  );
}

const ReadOnly = () => (
  <Badge variant="secondary" className="text-[10px] gap-1.5 font-medium">
    <Shield className="w-3 h-3" /> Read-only
  </Badge>
);

export default function AuthorProfileTab({ authorProfile, onProfileUpdated, onShowNotifications }) {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch account data from API
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const response = await CredentialService.getAccount();
        if (response.isSuccess && response.data) {
          setAccountData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, []);

  // Map API data to component format
  const profile = accountData ? {
    id: accountData.publisherId,
    full_name: accountData.publisherFullName,
    email: accountData.publisherEmail,
    phone: accountData.publisherPhone,
    profile_image_url: accountData.profileImageUrl,
    setup_complete: accountData.isProfileCompleted,
    author_bio: accountData.authInfo?.bio,
    website: accountData.authInfo?.website,
    twitter_handle: accountData.authInfo?.twitterHandle,
    instagram_handle: accountData.authInfo?.instagramHandle,
    facebook_url: accountData.authInfo?.facebookUrl,
    linkedin_url: accountData.authInfo?.linkedinUrl,
    youtube_url: accountData.authInfo?.youtubeUrl,
    address_line1: accountData.personalInfo?.addressLine1,
    address_line2: null,
    city: accountData.personalInfo?.city,
    state: accountData.personalInfo?.state,
    zip: accountData.personalInfo?.zip,
    country: accountData.personalInfo?.country,
    payment_method: accountData.paymentInfo?.paymentMethod,
    bank_account_name: accountData.paymentInfo?.bankAccountName,
    bank_account_number: accountData.paymentInfo?.bankAccountNumber,
    bank_routing_number: accountData.paymentInfo?.bankRoutingNumber,
    paypal_email: accountData.paymentInfo?.paypalEmail,
    us_person: accountData.taxInfo?.usPerson,
    tax_id_type: accountData.taxInfo?.taxIdType,
    tax_id: accountData.taxInfo?.taxId,
    tax_country: accountData.taxInfo?.taxCountry,
    esignature: accountData.taxInfo?.esignature,
    created_date: new Date().toISOString(),
  } : authorProfile;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-serif">Author Profile</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Your public identity, contact details, and account information.</p>
      </div>
      {/* <Link to="/account-setup"> */}
      <div className="flex items-center justify-between gap-4 bg-primary/5 border-2 border-primary/20 border-dashed rounded-2xl px-6 py-8 hover:bg-primary/10 transition-colors cursor-pointer text-center flex-col">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="text-base font-bold">Complete your account setup</p>
          <p className="text-sm text-muted-foreground mt-1">Set up your payment details, tax info, and author bio to start publishing and earning royalties.</p>
        </div>
        <Link to='/account-setup'>
          <Button className="gap-2 mt-2">
            <ArrowRight className="w-4 h-4" /> Start Account Setup
          </Button>
        </Link>
      </div>
      {/* </Link> */}
    </div>
  );


  const initials = (profile.full_name || '?')[0].toUpperCase();
  const memberSince = profile.created_date
    ? new Date(profile.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold font-serif bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Author Profile</h2>
          <p className="text-sm text-muted-foreground mt-1.5">Your public identity, contact details, and account information</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 h-9 shadow-sm hover:shadow"
          onClick={onShowNotifications}
        >
          <Bell className="w-4 h-4" /> Notifications
        </Button>
      </div>

      {/* Account Setup CTA — always visible */}
      {/* <Link to="/account-setup">
        <div className={cn(
          "flex items-center justify-between gap-4 rounded-2xl px-6 py-5 transition-all cursor-pointer border-2 shadow-sm hover:shadow-md",
          profile.setup_complete
            ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300"
            : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 hover:border-amber-400"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
              profile.setup_complete
                ? "bg-emerald-100 border-2 border-emerald-200"
                : "bg-amber-100 border-2 border-amber-200"
            )}>
              {profile.setup_complete
                ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                : <Clock className="w-6 h-6 text-amber-600" />
              }
            </div>
            <div>
              <p className={cn("text-base font-bold", profile.setup_complete ? "text-emerald-900" : "text-amber-900")}>
                {profile.setup_complete ? "Review / Update Account Setup" : "Complete Your Account Setup"}
              </p>
              <p className={cn("text-sm mt-1", profile.setup_complete ? "text-emerald-700" : "text-amber-700")}>
                {profile.setup_complete
                  ? "Payment, tax info, and author bio settings"
                  : "Add payment details, tax info, and author bio to start earning royalties"}
              </p>
            </div>
          </div>
          <ArrowRight className={cn("w-5 h-5 shrink-0", profile.setup_complete ? "text-emerald-600" : "text-amber-600")} />
        </div>
      </Link> */}

      {/* Identity Hero */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-md">
        <div className="bg-gradient-to-br from-primary/15 via-accent/25 to-primary/5 px-8 py-8 flex items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-3xl font-bold shrink-0 shadow-xl shadow-primary/30 relative z-10 border-4 border-white/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <h3 className="font-bold text-2xl leading-tight">{profile.full_name}</h3>
            <p className="text-base text-muted-foreground mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {profile.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className={cn('text-xs gap-1.5 px-3 py-1 font-semibold shadow-sm', profile.setup_complete ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-amber-500 text-white hover:bg-amber-600')}>
                {profile.setup_complete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {profile.setup_complete ? 'Verified Author' : 'Setup Incomplete'}
              </Badge>
              {profile.us_person !== undefined && (
                <Badge variant="secondary" className="text-xs px-3 py-1 font-medium shadow-sm">
                  {profile.us_person ? '🇺🇸 US Author' : '🌍 International Author'}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground bg-white/50 px-3 py-1 rounded-full">Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-8 py-6 border-t bg-gradient-to-b from-transparent to-secondary/10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground uppercase tracking-wide">Author Biography</p>
          </div>
          <div className={cn('text-sm leading-relaxed p-4 rounded-lg border-2 border-dashed', profile.author_bio ? 'bg-white border-border' : 'bg-muted/30 border-muted')}>
            <p className={cn(!profile.author_bio && 'text-muted-foreground italic text-center')}>
              {profile.author_bio || '📝 No biography added yet. Go to Account Setup to add one — it will appear on all your book listings and help readers connect with you.'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <SectionCard icon={Mail} title="Contact Information">
        <InfoRow label="Email" value={profile.email} />
        <InfoRow label="Phone" value={profile.phone} placeholder="Not provided" />
      </SectionCard>

      {/* Online Presence */}
      <SectionCard icon={Globe} title="Online Presence">
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Globe, label: 'Website', value: profile.website, color: 'text-blue-600' },
            { icon: Twitter, label: 'X/Twitter', value: profile.twitter_handle ? `@${profile.twitter_handle}` : null, color: 'text-sky-500' },
            { icon: Instagram, label: 'Instagram', value: profile.instagram_handle ? `@${profile.instagram_handle}` : null, color: 'text-pink-600' },
            { icon: Facebook, label: 'Facebook', value: profile.facebook_url, color: 'text-blue-700' },
            { icon: Linkedin, label: 'LinkedIn', value: profile.linkedin_url, color: 'text-blue-600' },
            { icon: Youtube, label: 'YouTube', value: profile.youtube_url, color: 'text-red-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-sm',
              value ? 'border-border bg-white hover:border-primary/30' : 'border-dashed border-muted/50 bg-muted/20 opacity-50'
            )}>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', value ? 'bg-primary/10' : 'bg-muted')}>
                <Icon className={cn('w-5 h-5', value ? color : 'text-muted-foreground')} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-sm font-medium truncate mt-0.5">{value || 'Not connected'}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Address — read-only */}
      <SectionCard icon={MapPin} title="Address & Location" badge={<ReadOnly />}>
        <InfoRow label="Address" value={profile.address_line1} />
        {profile.address_line2 && <InfoRow label="Line 2" value={profile.address_line2} />}
        <InfoRow label="City" value={profile.city} />
        <InfoRow label="State" value={profile.state} />
        <InfoRow label="ZIP" value={profile.zip} />
        <InfoRow label="Country" value={profile.country} />
        <div className="px-6 py-4 bg-blue-50/50 border-t border-blue-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xs text-blue-700 font-medium">Address is used for legal and tax purposes. Contact support to update.</p>
        </div>
      </SectionCard>

      {/* Payment — read-only */}
      <SectionCard icon={CreditCard} title="Payment Method" badge={<ReadOnly />}>
        <InfoRow label="Method" value={profile.payment_method === 'paypal' ? 'PayPal' : profile.payment_method === 'bank_transfer' ? 'Bank Transfer' : null} placeholder="Not configured" />
        {profile.payment_method === 'paypal' && <InfoRow label="PayPal Email" value={profile.paypal_email} />}
        {profile.payment_method === 'bank_transfer' && (
          <>
            <InfoRow label="Account Name" value={profile.bank_account_name} />
            <InfoRow label="Account No." value={profile.bank_account_number} />
            <InfoRow label="Routing/IBAN" value={profile.bank_routing_number} />
          </>
        )}
        <div className="px-6 py-4 bg-green-50/50 border-t border-green-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xs text-green-700 font-medium">Payment details are encrypted and protected. Contact support to update.</p>
        </div>
      </SectionCard>

      {/* Tax — read-only */}
      <SectionCard icon={FileText} title="Tax Information" badge={<ReadOnly />}>
        <InfoRow label="US Person" value={profile.us_person === true ? 'Yes — W-9' : profile.us_person === false ? 'No — W-8BEN' : null} />
        <InfoRow label="Tax Country" value={profile.tax_country} />
        <InfoRow label="Tax ID Type" value={profile.tax_id_type?.toUpperCase()} />
        <InfoRow label="Tax ID" value={profile.tax_id} placeholder="Not provided" />
        {profile.us_person !== undefined && (
          <div className="px-5 py-4 border-t flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">IRS Form {profile.us_person ? 'W-9' : 'W-8BEN'}</p>
                <p className="text-xs text-muted-foreground">Signed during account setup · {profile.esignature ? `Signed by ${profile.esignature}` : 'On file'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => toast.info('Document download is available via Classpedia support.')}>
              <FileText className="w-3.5 h-3.5" /> Download Form
            </Button>
          </div>
        )}
        <div className="px-6 py-4 bg-amber-50/50 border-t border-amber-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs text-amber-700 font-medium">Tax information is legally sensitive and encrypted. Contact support to update.</p>
        </div>
      </SectionCard>
    </div>
  );
}