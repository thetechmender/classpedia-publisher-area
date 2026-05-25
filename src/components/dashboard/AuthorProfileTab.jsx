import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

function SectionCard({ icon: Icon, title, badge, editable, onEdit, saving, onSave, onCancel, editing, children }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-secondary/20">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {editable && !editing && (
            <button onClick={onEdit} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {editing && (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onCancel} disabled={saving}>
                <X className="w-3 h-3" /> Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={onSave} disabled={saving}>
                <Check className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, placeholder = '—' }) {
  if (!value && !placeholder) return null;
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3 border-b last:border-0">
      <span className="text-xs text-muted-foreground font-medium w-28 shrink-0 mt-0.5 uppercase tracking-wide">{label}</span>
      <span className={cn('text-sm flex-1 text-right', value ? 'text-foreground font-medium' : 'text-muted-foreground italic')}>
        {value || placeholder}
      </span>
    </div>
  );
}

const ReadOnly = () => (
  <span className="flex items-center gap-1 text-xs text-muted-foreground">
    <Shield className="w-3 h-3" /> Read-only
  </span>
);

export default function AuthorProfileTab({ authorProfile, onProfileUpdated, onShowNotifications }) {
  const [editing, setEditing] = useState(null); // which section is editing: 'bio' | 'contact' | 'social'
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  if (!authorProfile) return (
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

  const startEdit = (section) => {
    setEditData({
      author_bio: authorProfile.author_bio || '',
      email: authorProfile.email || '',
      phone: authorProfile.phone || '',
      website: authorProfile.website || '',
      twitter_handle: authorProfile.twitter_handle || '',
      instagram_handle: authorProfile.instagram_handle || '',
      facebook_url: authorProfile.facebook_url || '',
      linkedin_url: authorProfile.linkedin_url || '',
      youtube_url: authorProfile.youtube_url || '',
    });
    setEditing(section);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.AuthorProfile.update(authorProfile.id, editData);
    setSaving(false);
    setEditing(null);
    toast.success('Profile updated');
    if (onProfileUpdated) onProfileUpdated();
  };

  const cancel = () => { setEditing(null); setEditData({}); };
  const set = (key, val) => setEditData(p => ({ ...p, [key]: val }));

  const initials = (authorProfile.full_name || '?')[0].toUpperCase();
  const memberSince = authorProfile.created_date
    ? new Date(authorProfile.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif">Author Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your public identity, contact details, and account information.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={onShowNotifications}
        >
          <Bell className="w-4 h-4" /> Notifications
        </Button>
      </div>

      {/* Account Setup CTA — always visible */}
      <Link to="/account-setup">
        <div className={cn(
          "flex items-center justify-between gap-4 rounded-xl px-5 py-4 transition-colors cursor-pointer border",
          authorProfile.setup_complete
            ? "bg-secondary/40 border-border hover:bg-secondary/70"
            : "bg-amber-50 border-amber-200 hover:bg-amber-100"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
              authorProfile.setup_complete
                ? "bg-secondary border-border"
                : "bg-amber-100 border-amber-200"
            )}>
              {authorProfile.setup_complete
                ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                : <Clock className="w-4 h-4 text-amber-600" />
              }
            </div>
            <div>
              <p className={cn("text-sm font-semibold", authorProfile.setup_complete ? "text-foreground" : "text-amber-900")}>
                {authorProfile.setup_complete ? "Review / update account setup" : "Complete your account setup"}
              </p>
              <p className={cn("text-xs mt-0.5", authorProfile.setup_complete ? "text-muted-foreground" : "text-amber-700")}>
                {authorProfile.setup_complete
                  ? "Payment, tax info, and author bio settings."
                  : "Add your payment details, tax info, and author bio to start earning royalties."}
              </p>
            </div>
          </div>
          <ArrowRight className={cn("w-4 h-4 shrink-0", authorProfile.setup_complete ? "text-muted-foreground" : "text-amber-600")} />
        </div>
      </Link>

      {/* Identity Hero */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-accent/20 to-transparent px-6 py-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0 shadow-lg shadow-primary/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight">{authorProfile.full_name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{authorProfile.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <Badge className={cn('text-[10px] gap-1', authorProfile.setup_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                {authorProfile.setup_complete ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {authorProfile.setup_complete ? 'Verified Author' : 'Setup Incomplete'}
              </Badge>
              {authorProfile.us_person !== undefined && (
                <Badge variant="outline" className="text-[10px]">
                  {authorProfile.us_person ? 'US Author' : 'International Author'}
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground">Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-6 py-5 border-t">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Author Biography</p>
            {editing !== 'bio' && (
              <button onClick={() => startEdit('bio')} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>
          {editing === 'bio' ? (
            <div className="space-y-3">
              <Textarea
                value={editData.author_bio}
                onChange={e => set('author_bio', e.target.value)}
                placeholder="Write a short biography shown on your book listings…"
                className="text-sm min-h-[120px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={cancel} disabled={saving}>
                  <X className="w-3 h-3" /> Cancel
                </Button>
                <Button size="sm" className="h-8 text-xs gap-1" onClick={handleSave} disabled={saving}>
                  <Check className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <p className={cn('text-sm leading-relaxed', !authorProfile.author_bio && 'text-muted-foreground italic')}>
              {authorProfile.author_bio || 'No bio added yet. Click "Edit" to add one — it appears on all your book listings.'}
            </p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <SectionCard
        icon={Mail} title="Contact Information"
        editable editing={editing === 'contact'}
        onEdit={() => startEdit('contact')}
        onSave={handleSave} onCancel={cancel} saving={saving}
      >
        {editing === 'contact' ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Email</label>
              <Input value={editData.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Phone</label>
              <Input value={editData.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </div>
        ) : (
          <>
            <InfoRow label="Email" value={authorProfile.email} />
            <InfoRow label="Phone" value={authorProfile.phone} placeholder="Not provided" />
          </>
        )}
      </SectionCard>

      {/* Online Presence */}
      <SectionCard
        icon={Globe} title="Online Presence"
        editable editing={editing === 'social'}
        onEdit={() => startEdit('social')}
        onSave={handleSave} onCancel={cancel} saving={saving}
      >
        {editing === 'social' ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
              { key: 'twitter_handle', label: 'X / Twitter', placeholder: 'username (no @)' },
              { key: 'instagram_handle', label: 'Instagram', placeholder: 'username (no @)' },
              { key: 'facebook_url', label: 'Facebook', placeholder: 'https://facebook.com/...' },
              { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
              { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{label}</label>
                <Input value={editData[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Globe, label: 'Website', value: authorProfile.website },
              { icon: Twitter, label: 'X/Twitter', value: authorProfile.twitter_handle ? `@${authorProfile.twitter_handle}` : null },
              { icon: Instagram, label: 'Instagram', value: authorProfile.instagram_handle ? `@${authorProfile.instagram_handle}` : null },
              { icon: Facebook, label: 'Facebook', value: authorProfile.facebook_url },
              { icon: Linkedin, label: 'LinkedIn', value: authorProfile.linkedin_url },
              { icon: Youtube, label: 'YouTube', value: authorProfile.youtube_url },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={cn(
                'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                value ? 'border-border bg-secondary/30' : 'border-dashed border-muted opacity-40'
              )}>
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-xs font-medium truncate">{value || 'Not set'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Address — read-only */}
      <SectionCard icon={MapPin} title="Address & Location" badge={<ReadOnly />}>
        <InfoRow label="Address" value={authorProfile.address_line1} />
        {authorProfile.address_line2 && <InfoRow label="Line 2" value={authorProfile.address_line2} />}
        <InfoRow label="City" value={authorProfile.city} />
        <InfoRow label="State" value={authorProfile.state} />
        <InfoRow label="ZIP" value={authorProfile.zip} />
        <InfoRow label="Country" value={authorProfile.country} />
        <div className="px-5 py-3 bg-secondary/10 border-t flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Address is used for legal and tax purposes. Contact support to update.</p>
        </div>
      </SectionCard>

      {/* Payment — read-only */}
      <SectionCard icon={CreditCard} title="Payment Method" badge={<ReadOnly />}>
        <InfoRow label="Method" value={authorProfile.payment_method === 'paypal' ? 'PayPal' : authorProfile.payment_method === 'bank_transfer' ? 'Bank Transfer' : null} placeholder="Not configured" />
        {authorProfile.payment_method === 'paypal' && <InfoRow label="PayPal Email" value={authorProfile.paypal_email} />}
        {authorProfile.payment_method === 'bank_transfer' && (
          <>
            <InfoRow label="Account Name" value={authorProfile.bank_account_name} />
            <InfoRow label="Account No." value={authorProfile.bank_account_number ? `****${authorProfile.bank_account_number.slice(-4)}` : null} />
            <InfoRow label="Routing/IBAN" value={authorProfile.bank_routing_number ? `****${authorProfile.bank_routing_number.slice(-4)}` : null} />
          </>
        )}
        <div className="px-5 py-3 bg-secondary/10 border-t flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Payment details are protected. Contact support to update.</p>
        </div>
      </SectionCard>

      {/* Tax — read-only */}
      <SectionCard icon={FileText} title="Tax Information" badge={<ReadOnly />}>
        <InfoRow label="US Person" value={authorProfile.us_person === true ? 'Yes — W-9' : authorProfile.us_person === false ? 'No — W-8BEN' : null} />
        <InfoRow label="Tax Country" value={authorProfile.tax_country} />
        <InfoRow label="Tax ID Type" value={authorProfile.tax_id_type?.toUpperCase()} />
        <InfoRow label="Tax ID" value={authorProfile.tax_id ? `****${authorProfile.tax_id.slice(-4)}` : null} placeholder="Not provided" />
        {authorProfile.us_person !== undefined && (
          <div className="px-5 py-4 border-t flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">IRS Form {authorProfile.us_person ? 'W-9' : 'W-8BEN'}</p>
                <p className="text-xs text-muted-foreground">Signed during account setup · {authorProfile.esignature ? `Signed by ${authorProfile.esignature}` : 'On file'}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => toast.info('Document download is available via Classpedia support.')}>
              <FileText className="w-3.5 h-3.5" /> Download Form
            </Button>
          </div>
        )}
        <div className="px-5 py-3 bg-secondary/10 border-t flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Tax information is legally sensitive. Contact support to update.</p>
        </div>
      </SectionCard>
    </div>
  );
}