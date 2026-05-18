import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, AlertCircle, Shield } from 'lucide-react';

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
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

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
      const state = get('administrative_area_level_1', 'administrative_area_level_2');
      const zip = getShort('postal_code') || get('postal_code');
      const countryFull = get('country');
      const matchedCountry = COUNTRIES.find(c => c.toLowerCase() === countryFull.toLowerCase()) || countryFull;
      onChange({ address_line1: streetLine || data.address_line1, city, state, zip, country: matchedCountry });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Your Identity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your details exactly as they appear on your government-issued ID. For corporations, enter details of an authorized representative.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 space-y-6">

          {/* ID Name */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">ID Name</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>First Name <span className="text-destructive">*</span></Label>
                <Input
                  value={data.first_name || ''}
                  onChange={(e) => {
                    const first = e.target.value;
                    const last = data.last_name || '';
                    onChange({ first_name: first, full_name: [first, last].filter(Boolean).join(' ') });
                  }}
                  placeholder="First name"
                  className={errors.full_name ? 'border-destructive' : ''}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name <span className="text-destructive">*</span></Label>
                <Input
                  value={data.last_name || ''}
                  onChange={(e) => {
                    const last = e.target.value;
                    const first = data.first_name || '';
                    onChange({ last_name: last, full_name: [first, last].filter(Boolean).join(' ') });
                  }}
                  placeholder="Last name"
                  className={errors.full_name ? 'border-destructive' : ''}
                />
              </div>
            </div>
            <FieldError msg={errors.full_name} />
            <p className="text-xs text-muted-foreground">Enter your name as it appears on your government-issued ID.</p>
          </div>

          {/* ID Address */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">ID Address</h3>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Enter the address shown on your ID. Your payment and tax addresses can be entered separately in the next steps.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Country <span className="text-destructive">*</span></Label>
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
              <Label>Address Line 1 <span className="text-destructive">*</span></Label>
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
              <Label>Address Line 2 <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
              <Input
                value={data.address_line2 || ''}
                onChange={(e) => onChange({ address_line2: e.target.value })}
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>City <span className="text-destructive">*</span></Label>
                <Input
                  value={data.city || ''}
                  onChange={(e) => onChange({ city: e.target.value })}
                  placeholder="City"
                  className={errors.city ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.city} />
              </div>
              <div className="space-y-1.5">
                <Label>State / Region</Label>
                <Input
                  value={data.state || ''}
                  onChange={(e) => onChange({ state: e.target.value })}
                  placeholder="State / Province"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code <span className="text-destructive">*</span></Label>
                <Input
                  value={data.zip || ''}
                  onChange={(e) => onChange({ zip: e.target.value })}
                  placeholder="ZIP / Postal code"
                  className={errors.zip ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.zip} />
              </div>
            </div>
          </div>

          {/* Other Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Other Details</h3>
            <div className="space-y-1.5">
              <Label>Phone Number <span className="text-destructive">*</span></Label>
              <Input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className={errors.phone ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">We may use this to verify your account or contact you about payments.</p>
              <FieldError msg={errors.phone} />
            </div>
          </div>

        </div>

        {/* Security sidebar */}
        <div className="hidden md:block w-56 shrink-0">
          <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center sticky top-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Your data is secure</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Your identity information is encrypted and used only for account verification and tax compliance. We never sell your data.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t gap-3">
        <Button variant="outline" onClick={onNext}>Save</Button>
        <Button onClick={onNext} className="gap-2 px-8">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}