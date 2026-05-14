import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Globe, CreditCard, FileText,
  Pencil, Check, X, BookOpen, Building2, AlertCircle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b bg-secondary/20">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function InfoRow({ label, value, placeholder }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3.5 border-b last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium w-36 shrink-0 mt-0.5">{label}</span>
      <span className={`text-sm flex-1 text-right ${!value ? 'text-muted-foreground italic' : 'text-foreground'}`}>
        {value || placeholder || '—'}
      </span>
    </div>
  );
}

export default function AuthorProfileTab({ authorProfile, onProfileUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({});

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

  const startEditing = () => {
    setEditData({
      pen_name: authorProfile.pen_name || '',
      author_bio: authorProfile.author_bio || '',
      website: authorProfile.website || '',
      email: authorProfile.email || '',
      phone: authorProfile.phone || '',
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.AuthorProfile.update(authorProfile.id, editData);
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated successfully');
    if (onProfileUpdated) onProfileUpdated();
  };

  const initials = (authorProfile.pen_name || authorProfile.full_name || '?')[0].toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Author Profile</h2>
          <p className="text-sm text-muted-foreground">Your account information and publishing identity.</p>
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
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/30 px-6 py-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">
              {editing ? (
                <Input
                  value={editData.pen_name}
                  onChange={e => setEditData(p => ({ ...p, pen_name: e.target.value }))}
                  placeholder="Pen name / Author name"
                  className="max-w-xs bg-card/80"
                />
              ) : (
                authorProfile.pen_name || authorProfile.full_name
              )}
            </h3>
            {!editing && authorProfile.pen_name && authorProfile.full_name !== authorProfile.pen_name && (
              <p className="text-xs text-muted-foreground mt-0.5">Legal name: {authorProfile.full_name}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`text-[10px] ${authorProfile.setup_complete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {authorProfile.setup_complete ? 'Verified Author' : 'Setup Incomplete'}
              </Badge>
              {authorProfile.us_person !== undefined && (
                <Badge variant="outline" className="text-[10px]">
                  {authorProfile.us_person ? 'US Author' : 'International Author'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-5 py-4 border-b">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Author Bio</p>
          {editing ? (
            <Textarea
              value={editData.author_bio}
              onChange={e => setEditData(p => ({ ...p, author_bio: e.target.value }))}
              placeholder="Write a short biography shown on your book listings..."
              className="text-sm min-h-[100px]"
            />
          ) : (
            <p className={`text-sm leading-relaxed ${!authorProfile.author_bio ? 'text-muted-foreground italic' : ''}`}>
              {authorProfile.author_bio || 'No bio added yet'}
            </p>
          )}
        </div>
      </div>

      {/* Contact Information — editable */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <SectionHeader icon={Mail} title="Contact Information" />
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
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Website</label>
                <Input value={editData.website} onChange={e => setEditData(p => ({ ...p, website: e.target.value }))} placeholder="https://yourwebsite.com" />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <InfoRow label="Email" value={authorProfile.email} />
            <InfoRow label="Phone" value={authorProfile.phone} placeholder="Not provided" />
            <InfoRow label="Website" value={authorProfile.website} placeholder="Not provided" />
          </div>
        )}
      </div>

      {/* Address — read-only */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <SectionHeader
          icon={MapPin}
          title="Address & Location"
          action={<span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Read-only</span>}
        />
        <div>
          <InfoRow label="Address" value={authorProfile.address_line1} />
          {authorProfile.address_line2 && <InfoRow label="Address 2" value={authorProfile.address_line2} />}
          <InfoRow label="City" value={authorProfile.city} />
          <InfoRow label="State / Province" value={authorProfile.state} />
          <InfoRow label="ZIP / Postal" value={authorProfile.zip} />
          <InfoRow label="Country" value={authorProfile.country} />
        </div>
        <div className="px-5 py-3 bg-secondary/20 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Address is used for legal and tax purposes. Contact support to update.</p>
        </div>
      </div>

      {/* Payment — read-only */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <SectionHeader
          icon={CreditCard}
          title="Payment Method"
          action={<span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Read-only</span>}
        />
        <div>
          <InfoRow label="Method" value={authorProfile.payment_method === 'paypal' ? 'PayPal' : authorProfile.payment_method === 'bank_transfer' ? 'Bank Transfer' : null} placeholder="Not configured" />
          {authorProfile.payment_method === 'paypal' && (
            <InfoRow label="PayPal Email" value={authorProfile.paypal_email} />
          )}
          {authorProfile.payment_method === 'bank_transfer' && (
            <>
              <InfoRow label="Account Name" value={authorProfile.bank_account_name} />
              <InfoRow label="Account No." value={authorProfile.bank_account_number ? `****${authorProfile.bank_account_number.slice(-4)}` : null} />
              <InfoRow label="Routing/IBAN" value={authorProfile.bank_routing_number ? `****${authorProfile.bank_routing_number.slice(-4)}` : null} />
            </>
          )}
        </div>
        <div className="px-5 py-3 bg-secondary/20 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Payment details are protected. Contact support to update banking information.</p>
        </div>
      </div>

      {/* Tax — read-only */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <SectionHeader
          icon={FileText}
          title="Tax Information"
          action={<span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Read-only</span>}
        />
        <div>
          <InfoRow label="US Person" value={authorProfile.us_person === true ? 'Yes (W-9)' : authorProfile.us_person === false ? 'No (W-8BEN)' : null} />
          <InfoRow label="Tax Country" value={authorProfile.tax_country} />
          <InfoRow label="Tax ID Type" value={authorProfile.tax_id_type?.toUpperCase()} />
          <InfoRow label="Tax ID" value={authorProfile.tax_id ? `****${authorProfile.tax_id.slice(-4)}` : null} placeholder="Not provided" />
        </div>
        <div className="px-5 py-3 bg-secondary/20 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">Tax information is legally sensitive. Contact support to update.</p>
        </div>
      </div>

      {/* Publishing Identity — read-only */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <SectionHeader icon={BookOpen} title="Publishing Identity" />
        <div>
          <InfoRow label="Legal Name" value={authorProfile.full_name} />
          <InfoRow label="Pen Name" value={authorProfile.pen_name} placeholder="Same as legal name" />
          <InfoRow label="Member Since" value={authorProfile.created_date ? new Date(authorProfile.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null} />
          <InfoRow label="Account Status" value={authorProfile.setup_complete ? 'Active' : 'Pending'} />
        </div>
      </div>
    </div>
  );
}