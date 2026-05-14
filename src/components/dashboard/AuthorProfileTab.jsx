import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Globe, CreditCard, FileText,
  Pencil, Check, X, BookOpen, AlertCircle, Shield, Twitter,
  Instagram, Facebook, Linkedin, Youtube, CheckCircle2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function SectionCard({ icon: Icon, title, badge, children, footer }) {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-secondary/20">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {badge}
      </div>
      <div>{children}</div>
      {footer && <div className="px-5 py-3 bg-secondary/20 border-t flex items-center gap-1.5">{footer}</div>}
    </div>
  );
}

function InfoRow({ label, value, placeholder }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5 border-b last:border-0">
      <span className="text-xs text-muted-foreground font-medium w-32 shrink-0 mt-0.5 uppercase tracking-wide">{label}</span>
      <span className={`text-sm flex-1 text-right ${!value ? 'text-muted-foreground italic' : 'text-foreground font-medium'}`}>
        {value || placeholder || '—'}
      </span>
    </div>
  );
}

const ReadOnlyBadge = () => (
  <span className="text-xs text-muted-foreground flex items-center gap-1">
    <Shield className="w-3 h-3" /> Read-only
  </span>
);

export default function AuthorProfileTab({ authorProfile, onProfileUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

  if (!authorProfile) return (
    <div className="text-center py-16 text-muted-foreground text-sm">No profile found.</div>
  );

  const startEditing = () => {
    setEditData({
      author_bio:      authorProfile.author_bio || '',
      website:         authorProfile.website || '',
      email:           authorProfile.email || '',
      phone:           authorProfile.phone || '',
      twitter_handle:  authorProfile.twitter_handle || '',
      instagram_handle: authorProfile.instagram_handle || '',
      facebook_url:    authorProfile.facebook_url || '',
      linkedin_url:    authorProfile.linkedin_url || '',
      youtube_url:     authorProfile.youtube_url || '',
    });
    setEditing(true);
  };

  const cancelEditing = () => { setEditing(false); setEditData({}); };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.AuthorProfile.update(authorProfile.id, editData);
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated');
    if (onProfileUpdated) onProfileUpdated();
  };

  const initials = (authorProfile.full_name || '?')[0].toUpperCase();
  const memberSince = authorProfile.created_date
    ? new Date(authorProfile.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const socialLinks = [
    { icon: Globe,     label: 'Website',    value: authorProfile.website,          key: 'website' },
    { icon: Twitter,   label: 'X/Twitter',  value: authorProfile.twitter_handle ? `@${authorProfile.twitter_handle}` : null, key: 'twitter_handle' },
    { icon: Instagram, label: 'Instagram',  value: authorProfile.instagram_handle ? `@${authorProfile.instagram_handle}` : null, key: 'instagram_handle' },
    { icon: Facebook,  label: 'Facebook',   value: authorProfile.facebook_url,     key: 'facebook_url' },
    { icon: Linkedin,  label: 'LinkedIn',   value: authorProfile.linkedin_url,     key: 'linkedin_url' },
    { icon: Youtube,   label: 'YouTube',    value: authorProfile.youtube_url,      key: 'youtube_url' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif">Author Profile</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your public author identity and account information.</p>
        </div>
        {!editing ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={startEditing}>
            <Pencil className="w-3.5 h-3.5" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={cancelEditing} disabled={saving}>
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
            <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
              <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

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
              <Badge className={`text-[10px] gap-1 ${authorProfile.setup_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Author Biography</p>
          {editing ? (
            <Textarea
              value={editData.author_bio}
              onChange={e => setEditData(p => ({ ...p, author_bio: e.target.value }))}
              placeholder="Write a short biography shown on your book listings…"
              className="text-sm min-h-[120px]"
            />
          ) : (
            <p className={`text-sm leading-relaxed ${!authorProfile.author_bio ? 'text-muted-foreground italic' : ''}`}>
              {authorProfile.author_bio || 'No bio added yet. Click "Edit Profile" to add one.'}
            </p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <SectionCard icon={Mail} title="Contact Information">
        {editing ? (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Email</label>
                <Input value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Phone</label>
                <Input value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" />
              </div>
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
      <SectionCard icon={Globe} title="Online Presence">
        {editing ? (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
              { key: 'twitter_handle', label: 'X / Twitter', icon: Twitter, placeholder: 'username (no @)' },
              { key: 'instagram_handle', label: 'Instagram', icon: Instagram, placeholder: 'username (no @)' },
              { key: 'facebook_url', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
              { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...' },
              { key: 'youtube_url', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{label}</label>
                <Input
                  value={editData[key]}
                  onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {socialLinks.map(({ icon: Icon, label, value }) => (
              <div key={label} className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${value ? 'border-border bg-secondary/30 hover:bg-secondary/60' : 'border-dashed border-muted opacity-40'}`}>
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
      <SectionCard
        icon={MapPin}
        title="Address & Location"
        badge={<ReadOnlyBadge />}
        footer={<><AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><p className="text-xs text-muted-foreground">Address is used for legal and tax purposes. Contact support to update.</p></>}
      >
        <InfoRow label="Address"        value={authorProfile.address_line1} />
        {authorProfile.address_line2 && <InfoRow label="Address 2" value={authorProfile.address_line2} />}
        <InfoRow label="City"           value={authorProfile.city} />
        <InfoRow label="State"          value={authorProfile.state} />
        <InfoRow label="ZIP"            value={authorProfile.zip} />
        <InfoRow label="Country"        value={authorProfile.country} />
      </SectionCard>

      {/* Payment — read-only */}
      <SectionCard
        icon={CreditCard}
        title="Payment Method"
        badge={<ReadOnlyBadge />}
        footer={<><AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><p className="text-xs text-muted-foreground">Payment details are protected. Contact support to update.</p></>}
      >
        <InfoRow label="Method" value={authorProfile.payment_method === 'paypal' ? 'PayPal' : authorProfile.payment_method === 'bank_transfer' ? 'Bank Transfer' : null} placeholder="Not configured" />
        {authorProfile.payment_method === 'paypal' && <InfoRow label="PayPal Email" value={authorProfile.paypal_email} />}
        {authorProfile.payment_method === 'bank_transfer' && (
          <>
            <InfoRow label="Account Name" value={authorProfile.bank_account_name} />
            <InfoRow label="Account No."  value={authorProfile.bank_account_number ? `****${authorProfile.bank_account_number.slice(-4)}` : null} />
            <InfoRow label="Routing/IBAN" value={authorProfile.bank_routing_number ? `****${authorProfile.bank_routing_number.slice(-4)}` : null} />
          </>
        )}
      </SectionCard>

      {/* Tax — read-only */}
      <SectionCard
        icon={FileText}
        title="Tax Information"
        badge={<ReadOnlyBadge />}
        footer={<><AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><p className="text-xs text-muted-foreground">Tax information is legally sensitive. Contact support to update.</p></>}
      >
        <InfoRow label="US Person"   value={authorProfile.us_person === true ? 'Yes (W-9)' : authorProfile.us_person === false ? 'No (W-8BEN)' : null} />
        <InfoRow label="Tax Country" value={authorProfile.tax_country} />
        <InfoRow label="Tax ID Type" value={authorProfile.tax_id_type?.toUpperCase()} />
        <InfoRow label="Tax ID"      value={authorProfile.tax_id ? `****${authorProfile.tax_id.slice(-4)}` : null} placeholder="Not provided" />
      </SectionCard>

    </div>
  );
}