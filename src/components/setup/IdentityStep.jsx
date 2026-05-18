import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, AlertCircle, Shield, User, MapPin, Phone } from 'lucide-react';

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Belarus',
  'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia',
  'Cameroon', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia',
  'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Honduras', 'Hungary', 'India', 'Indonesia', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia',
  'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia', 'Malta', 'Mexico', 'Morocco',
  'Myanmar', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'Norway', 'Oman',
  'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore',
  'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden',
  'Switzerland', 'Taiwan', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zimbabwe',
];

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
  </p>
) : null;

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-secondary/40 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function IdentityStep({ data, onChange, errors, onNext }) {
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google?.maps?.places) return;
    const input = autocompleteRef.current;
    if (!input) return;
    const autocomplete = new window.google.maps.places.Autocomplete(input, { types: ['address'] });
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;
      const get = (...types) => {
        for (const type of types) {
          const comp = place.address_components.find(c => c.types.includes(type));
          if (comp) return comp.long_name;
        }
        return '';
      };
      const getShort = (type) => {
        const comp = place.address_components.find(c => c.types.includes(type));
        return comp ? comp.short_name : '';
      };
      const streetNumber = get('street_number');
      const route = get('route');
      const streetLine = [streetNumber, route].filter(Boolean).join(' ');
      const city = get('locality', 'postal_town', 'sublocality_level_1', 'administrative_area_level_2');
      const state = get('administrative_area_level_1');
      const zip = getShort('postal_code') || get('postal_code');
      const countryFull = get('country');
      const matchedCountry = COUNTRIES.find(c => c.toLowerCase() === countryFull.toLowerCase()) || countryFull;
      onChange({ address_line1: streetLine || data.address_line1, city, state, zip, country: matchedCountry });
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2">
        <h2 className="text-xl font-semibold text-foreground">Your Identity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your details exactly as they appear on your government-issued ID. For corporations and non-individual entities (e.g., LLC or agency), enter the details of an authorized representative.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 space-y-4">

          {/* ID Name */}
          <SectionCard icon={User} title="Full Name" description="Must match your government-issued photo ID exactly">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name <span className="text-destructive">*</span></Label>
              <Input
                value={data.full_name || ''}
                onChange={(e) => onChange({ full_name: e.target.value })}
                placeholder="Full name as shown on your ID"
                className={errors.full_name ? 'border-destructive' : ''}
              />
              <FieldError msg={errors.full_name} />
            </div>
          </SectionCard>

          {/* ID Address */}
          <SectionCard icon={MapPin} title="ID Address" description="Enter the address shown on your government-issued ID">
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Enter your address as shown on your ID, even if it differs from your payment, tax, or mailing address — those are collected separately in the next steps.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Country <span className="text-destructive">*</span></Label>
              <Select value={data.country || ''} onValueChange={(v) => onChange({ country: v })}>
                <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError msg={errors.country} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address Line 1 <span className="text-destructive">*</span></Label>
              <Input
                ref={autocompleteRef}
                value={data.address_line1 || ''}
                onChange={(e) => onChange({ address_line1: e.target.value })}
                placeholder="Street address, P.O. box"
                className={errors.address_line1 ? 'border-destructive' : ''}
              />
              <FieldError msg={errors.address_line1} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Address Line 2 <span className="font-normal normal-case text-muted-foreground">(optional)</span>
              </Label>
              <Input
                value={data.address_line2 || ''}
                onChange={(e) => onChange({ address_line2: e.target.value })}
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">City <span className="text-destructive">*</span></Label>
                <Input
                  value={data.city || ''}
                  onChange={(e) => onChange({ city: e.target.value })}
                  placeholder="City"
                  className={errors.city ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.city} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State / Region</Label>
                <Input
                  value={data.state || ''}
                  onChange={(e) => onChange({ state: e.target.value })}
                  placeholder="State / Province"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Postal Code <span className="text-destructive">*</span></Label>
                <Input
                  value={data.zip || ''}
                  onChange={(e) => onChange({ zip: e.target.value })}
                  placeholder="ZIP / Postal"
                  className={errors.zip ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.zip} />
              </div>
            </div>
          </SectionCard>

          {/* Other Details — DOB + Phone */}
          <SectionCard icon={Phone} title="Other Details" description="Used for account verification and payment identity">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date of Birth <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={data.date_of_birth || ''}
                  onChange={(e) => onChange({ date_of_birth: e.target.value })}
                  className={errors.date_of_birth ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.date_of_birth} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone Number <span className="text-destructive">*</span></Label>
                <Input
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.phone} />
              </div>
            </div>
          </SectionCard>

        </div>

        {/* Security sidebar */}
        <div className="hidden lg:block w-52 shrink-0">
          <div className="rounded-xl border border-border bg-card p-4 text-center sticky top-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Your data is secure</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Your identity information is encrypted and used only for account verification and tax compliance. We never sell your personal data.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border gap-3">
        <Button variant="outline" onClick={onNext}>Save draft</Button>
        <Button onClick={onNext} className="gap-2 px-8">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}