import React, { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';

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


const FieldError = ({ msg }) => msg ?
<p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p> :
null;

export default function AccountInfoStep({ data, onChange, errors, onNext, onBack }) {
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

      // Match country to our list (case-insensitive)
      const matchedCountry = COUNTRIES.find(
        c => c.toLowerCase() === countryFull.toLowerCase()
      ) || countryFull;

      onChange({
        address_line1: streetLine || data.address_line1,
        city,
        state,
        zip,
        country: matchedCountry,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">Your Identity</h2>
          <p className="text-sm text-muted-foreground">Enter your legal name and address for your account</p>
        </div>
      </div>

      {/* Legal Name */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Legal Name</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Enter your name exactly as it appears on your government-issued ID</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First Name <span className="text-destructive">*</span></Label>
              <Input
                value={data.first_name || ''}
                onChange={(e) => onChange({ first_name: e.target.value })}
                placeholder="John"
                className={errors.first_name ? 'border-destructive' : ''} />
              <FieldError msg={errors.first_name} />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name <span className="text-destructive">*</span></Label>
              <Input
                value={data.last_name || ''}
                onChange={(e) => onChange({ last_name: e.target.value })}
                placeholder="Doe"
                className={errors.last_name ? 'border-destructive' : ''} />
              <FieldError msg={errors.last_name} />
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Address</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Used for royalty payments and tax purposes</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Address Line</Label>
            <Input
              ref={autocompleteRef}
              value={data.address_line1 || ''}
              onChange={(e) => onChange({ address_line1: e.target.value })}
              placeholder="Start typing your street address…" />
            <p className="text-[10px] text-muted-foreground">City, state, ZIP and country will auto-fill when you select an address.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input
                value={data.city || ''}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="City" />
            </div>
            <div className="space-y-1.5">
              <Label>State / Province</Label>
              <Input
                value={data.state || ''}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="State / Province" />
            </div>
            <div className="space-y-1.5">
              <Label>ZIP / Postal Code</Label>
              <Input
                value={data.zip || ''}
                onChange={(e) => onChange({ zip: e.target.value })}
                placeholder="ZIP / Postal code" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Country / Region <span className="text-destructive">*</span></Label>
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
        </div>
      </div>

      <div className="flex justify-between pt-2">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <Button onClick={onNext} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20 ml-auto">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>);
}