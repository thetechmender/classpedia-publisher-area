import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, AlertCircle, Mail, Phone, CheckCircle2, ShieldCheck, X, RefreshCw, Lock } from 'lucide-react';
import ValidationSummary from '@/components/shared/ValidationSummary';
import { toast } from 'sonner';

const COUNTRIES = [
'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil',
'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark',
'Egypt', 'Finland', 'France', 'Germany', 'Hungary', 'India', 'Indonesia',
'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico',
'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
'Poland', 'Portugal', 'Romania', 'Russia', 'Singapore', 'South Africa',
'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
'Ukraine', 'United Kingdom', 'United States', 'Vietnam'];



const FieldError = ({ msg }) => msg ?
<p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p> :
null;

// Email verification screen (matches screenshot)
function EmailVerifyScreen({ email, onVerified, onChangeEmail }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(22);
  const inputs = useRef([]);
  const digits = (code || '').split('').concat(Array(6).fill('')).slice(0, 6);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    const joined = next.join('');
    setCode(joined);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = () => {
    if (code.length < 6) {setError('Please enter the full 6-digit code');return;}
    if (code !== '123456') {setError('Invalid code. (Demo: 123456)');return;}
    setError('');
    onVerified();
  };

  const handleResend = () => {
    setResendSeconds(22);
    setCode('');
    setError('');
    toast.info('Code resent', {
      description: 'Check your email for the new verification code'
    });
  };

  return (
    <div className="flex flex-col items-center text-center space-y-5">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
        <Mail className="w-8 h-8 text-blue-600" />
      </div>

      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-foreground">Verify your email address</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We've sent a one-time password to <strong>{email}</strong>
        </p>
      </div>

      {/* OTP Input */}
      <div className="w-full space-y-2">
        <p className="text-sm text-muted-foreground">Enter OTP</p>
        <div className="flex gap-2 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-semibold border-2 rounded-lg border-border bg-background focus:border-blue-500 focus:outline-none transition-colors"
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The code expires in 10 minutes. (Demo code: 123456)
        </p>
        {error && (
          <p className="flex items-center justify-center gap-1 text-xs text-destructive mt-2">
            <AlertCircle className="w-3 h-3" />{error}
          </p>
        )}
      </div>

      {/* Verify Button */}
      <Button onClick={handleVerify} className="w-full h-11 gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700">
        <ShieldCheck className="w-4 h-4" /> Verify Email
      </Button>

      {/* Resend */}
      <p className="text-sm text-muted-foreground">
        {resendSeconds > 0 ? (
          <span>Resend code in <strong>{resendSeconds}s</strong></span>
        ) : (
          <button onClick={handleResend} className="text-blue-600 hover:underline font-medium">
            Resend code
          </button>
        )}
      </p>
    </div>
  );
}

// Phone verification screen (matches screenshot)
function PhoneVerifyScreen({ email, phone, onVerified, onChangeNumber }) {
  // Format phone number for display
  const displayPhone = phone ? `+1 ${phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}` : phone;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(26);
  const inputs = useRef([]);
  const digits = (code || '').split('').concat(Array(6).fill('')).slice(0, 6);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    const joined = next.join('');
    setCode(joined);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleVerify = () => {
    if (code.length < 6) {setError('Please enter the full 6-digit OTP');return;}
    if (code !== '123456') {setError('Invalid OTP. (Demo: 123456)');return;}
    setError('');
    onVerified();
  };

  const handleResend = () => {
    setResendSeconds(26);
    setCode('');
    setError('');
    toast.info('Code resent', {
      description: 'Check your phone for the new verification code'
    });
  };

  return (
    <div className="flex flex-col items-center text-center space-y-5">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
        <Phone className="w-8 h-8 text-blue-600" />
      </div>

      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-foreground">Verify your phone number</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We've sent a one-time password (OTP) to <strong>{displayPhone || phone}</strong>
        </p>
      </div>

      {/* OTP Input */}
      <div className="w-full space-y-2">
        <p className="text-sm text-muted-foreground">Enter OTP</p>
        <div className="flex gap-2 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-semibold border-2 rounded-lg border-border bg-background focus:border-blue-500 focus:outline-none transition-colors"
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Message and data rates may apply. (Demo code: 123456)
        </p>
        {error && (
          <p className="flex items-center justify-center gap-1 text-xs text-destructive mt-2">
            <AlertCircle className="w-3 h-3" />{error}
          </p>
        )}
      </div>

      {/* Verify Button */}
      <Button onClick={handleVerify} className="w-full h-11 gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700">
        <ShieldCheck className="w-4 h-4" /> Verify Phone Number
      </Button>

      {/* Resend */}
      <p className="text-sm text-muted-foreground">
        {resendSeconds > 0 ? (
          <span>Resend code in <strong>{resendSeconds}s</strong></span>
        ) : (
          <button onClick={handleResend} className="text-blue-600 hover:underline font-medium">
            Resend code
          </button>
        )}
      </p>
    </div>
  );
}

// Main verification modal wrapper
function VerificationModal({ isOpen, type, email, phone, onVerified, onCancel, onContactChanged }) {
  const [screen, setScreen] = useState('verify'); // 'verify' or 'success'

  const handleVerified = () => {
    setScreen('success');
    setTimeout(() => {
      onVerified();
      onCancel();
      setScreen('verify');
    }, 1500);
  };

  if (screen === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={onCancel}>
        <DialogContent className="w-full max-w-md rounded-3xl p-0 overflow-hidden shadow-2xl">
          <div className="px-8 py-10 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground">Verified!</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your {type === 'email' ? 'email' : 'phone number'} has been successfully verified
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="w-full max-w-md rounded-3xl p-8">
        {type === 'email' ? (
          <EmailVerifyScreen
            email={email}
            onVerified={handleVerified}
            onChangeEmail={() => onCancel()}
          />
        ) : (
          <PhoneVerifyScreen
            email={email}
            phone={phone}
            onVerified={handleVerified}
            onChangeNumber={() => onCancel()}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AccountInfoStep({ data, onChange, errors, onNext, onBack }) {
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
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
          const comp = place.address_components.find((c) => c.types.includes(type));
          if (comp) return comp.long_name;
        }
        return '';
      };
      const getShort = (type) => {
        const comp = place.address_components.find((c) => c.types.includes(type));
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
        (c) => c.toLowerCase() === countryFull.toLowerCase()
      ) || countryFull;

      onChange({
        address_line1: streetLine || data.address_line1,
        city,
        state,
        zip,
        country: matchedCountry
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
      <div className="rounded-xl border border-border bg-card shadow-sm">
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

      {/* Contact Information */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Contact Information</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Sourced from your login account — verified and locked for security.</p>
        </div>
        <div className="px-5 py-5 space-y-5">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">{data.email || <span className="text-muted-foreground italic">Not provided</span>}</span>
              {emailVerified ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Verified</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEmailModal(true)}
                  className="h-8 px-3 text-xs font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify
                </Button>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary shrink-0">
                <Phone className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="flex-1 text-sm font-medium text-foreground">{data.phone || '+1 (555) 123-4567'}</span>
              {phoneVerified ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Verified</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPhoneModal(true)}
                  className="h-8 px-3 text-xs font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Verification Modals */}
      <VerificationModal
        isOpen={showEmailModal}
        type="email"
        email={data.email}
        phone={data.phone}
        onVerified={() => {setEmailVerified(true);setShowEmailModal(false);}}
        onCancel={() => setShowEmailModal(false)}
      />
      
      <VerificationModal
        isOpen={showPhoneModal}
        type="phone"
        email={data.email}
        phone={data.phone}
        onVerified={() => {setPhoneVerified(true);setShowPhoneModal(false);}}
        onCancel={() => setShowPhoneModal(false)}
      />
      

      {/* Address */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="px-5 py-3.5 bg-secondary/40 border-b border-border">
          <h3 className="text-sm font-semibold">Address</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Used for royalty payments and tax purposes</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Address Line <span className="text-destructive">*</span></Label>
            <Input
              ref={autocompleteRef}
              value={data.address_line1 || ''}
              onChange={(e) => onChange({ address_line1: e.target.value })}
              placeholder="Start typing your street address…"
              className={errors.address_line1 ? 'border-destructive' : ''} />
            <FieldError msg={errors.address_line1} />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>City <span className="text-destructive">*</span></Label>
              <Input
                value={data.city || ''}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="City"
                className={errors.city ? 'border-destructive' : ''} />
              <FieldError msg={errors.city} />
            </div>
            <div className="space-y-1.5">
              <Label>State / Province <span className="text-destructive">*</span></Label>
              <Input
                value={data.state || ''}
                onChange={(e) => onChange({ state: e.target.value })}
                placeholder="State / Province"
                className={errors.state ? 'border-destructive' : ''} />
              <FieldError msg={errors.state} />
            </div>
            <div className="space-y-1.5">
              <Label>ZIP / Postal Code <span className="text-destructive">*</span></Label>
              <Input
                value={data.zip || ''}
                onChange={(e) => onChange({ zip: e.target.value })}
                placeholder="ZIP / Postal code"
                className={errors.zip ? 'border-destructive' : ''} />
              <FieldError msg={errors.zip} />
            </div>
          </div>
        </div>
      </div>

      <ValidationSummary errors={errors} />
      <div className="flex justify-between gap-3 pt-2">
        <div className="flex gap-2">
          {onBack &&
          <Button variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          }
          <Button variant="outline" className="gap-2 text-foreground">
            💾 Save as Draft
          </Button>
        </div>
        <Button onClick={onNext} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>);
}