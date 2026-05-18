import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, AlertCircle, Shield } from 'lucide-react';

const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil',
  'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark',
  'Egypt', 'Finland', 'France', 'Germany', 'Hungary', 'India', 'Indonesia',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Romania', 'Russia', 'Singapore', 'South Africa',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'Ukraine', 'United Kingdom', 'United States', 'Vietnam',
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
          Enter your details as they appear on your government-issued ID. For corporations and non-individual entities, enter the details of an authorized representative.
        </p>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 space-y-5">
          {/* ID Name */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">ID Name</h3>
            <div className="space-y-1.5">
              <Label>Full Name <span className="text-destructive">*</span></Label>
              <Input
                value={data.full_name || ''}
                onChange={(e) => onChange({ full_name: e.target.value })}
                placeholder="Full Name"
                className={errors.full_name ? 'border-destructive' : ''}
              />
              <FieldError msg={errors.full_name} />
            </div>
          </div>

          {/* ID Address */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">ID Address</h3>
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Enter your address as shown on your ID, even if it differs from your payment, tax, or mailing address — those are collected separately.
              </p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Country <span className="text-destructive">*</span></Label>
                <Select value={data.country || ''} onValueChange={(v) => onChange({ country: v })}>
                  <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FieldError msg={errors.country} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>State / Province / Region <span className="text-destructive">*</span></Label>
                  <Input
                    value={data.state || ''}
                    onChange={(e) => onChange({ state: e.target.value })}
                    placeholder="State / Province"
                    className={errors.state ? 'border-destructive' : ''}
                  />
                  <FieldError msg={errors.state} />
                </div>
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
              </div>
              <div className="space-y-1.5">
                <Label>Address Line 1 <span className="text-destructive">*</span></Label>
                <Input
                  ref={autocompleteRef}
                  value={data.address_line1 || ''}
                  onChange={(e) => onChange({ address_line1: e.target.value })}
                  placeholder="Start typing your address…"
                  className={errors.address_line1 ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.address_line1} />
              </div>
              <div className="space-y-1.5">
                <Label>Address Line 2</Label>
                <Input
                  value={data.address_line2 || ''}
                  onChange={(e) => onChange({ address_line2: e.target.value })}
                  placeholder="Apartment, suite, unit, etc. (optional)"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Postal Code <span className="text-destructive">*</span></Label>
                <Input
                  value={data.zip || ''}
                  onChange={(e) => onChange({ zip: e.target.value })}
                  placeholder="Postal / ZIP Code"
                  className={errors.zip ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.zip} />
              </div>
            </div>
          </div>

          {/* Other details */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Other details</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Date of Birth (MM/DD/YYYY) <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={data.date_of_birth || ''}
                  onChange={(e) => onChange({ date_of_birth: e.target.value })}
                  className={errors.date_of_birth ? 'border-destructive' : ''}
                />
                <FieldError msg={errors.date_of_birth} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone number <span className="text-destructive">*</span></Label>
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
          </div>
        </div>

        {/* Security note */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Account security is a priority</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              The name in your account must match your government-issued ID. At times, we may ask you to verify your identity to confirm it's really you, and to protect authors and readers.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onNext}>Save</Button>
          <Button onClick={onNext} className="gap-2 px-8">
            Save & Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}