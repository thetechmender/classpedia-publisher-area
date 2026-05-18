import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  ChevronRight, User, Mail, Phone, AlertCircle,
  Lock, Eye, EyeOff, ShieldCheck, RefreshCw, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
  </p>
) : null;

// Simulated OTP — in production this would call a backend function
const MOCK_OTP = '123456';

function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (idx, val) => {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = cleaned;
    onChange(next.join(''));
    if (cleaned && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            'w-11 h-12 text-center text-lg font-bold rounded-lg border-2 bg-background outline-none transition-all',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            d ? 'border-primary text-foreground' : 'border-border text-muted-foreground'
          )}
        />
      ))}
    </div>
  );
}

export default function SignUpStep({ data, onChange, errors, onNext }) {
  const [subStep, setSubStep] = useState('details'); // 'details' | 'otp-email' | 'otp-phone'
  const [localErrors, setLocalErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const validateDetails = () => {
    const errs = {};
    if (!data.display_name?.trim()) errs.display_name = 'Your name is required';
    if (!data.contact_email?.trim()) errs.contact_email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) errs.contact_email = 'Enter a valid email';
    if (!data.signup_phone?.trim()) errs.signup_phone = 'Mobile number is required';
    if (!data.signup_password) errs.signup_password = 'Password is required';
    else if (data.signup_password.length < 8) errs.signup_password = 'Password must be at least 8 characters';
    if (!data.signup_password_confirm) errs.signup_password_confirm = 'Please re-enter your password';
    else if (data.signup_password !== data.signup_password_confirm) errs.signup_password_confirm = 'Passwords do not match';
    return errs;
  };

  const handleContinueDetails = () => {
    const errs = validateDetails();
    if (Object.keys(errs).length > 0) { setLocalErrors(errs); return; }
    setLocalErrors({});
    setSubStep('otp-email');
    setResendCooldown(30);
  };

  const handleVerifyEmail = () => {
    if (emailOtp.length < 6) { setOtpError('Enter the 6-digit code'); return; }
    if (emailOtp !== MOCK_OTP) { setOtpError('Incorrect code. Please try again.'); return; }
    setOtpError('');
    setEmailVerified(true);
    setPhoneOtp('');
    setSubStep('otp-phone');
    setResendCooldown(30);
  };

  const handleVerifyPhone = () => {
    if (phoneOtp.length < 6) { setOtpError('Enter the 6-digit code'); return; }
    if (phoneOtp !== MOCK_OTP) { setOtpError('Incorrect code. Please try again.'); return; }
    setOtpError('');
    setPhoneVerified(true);
    onNext();
  };

  const handleResend = () => {
    setResendCooldown(30);
    setOtpError('');
  };

  const allErrs = { ...errors, ...localErrors };

  // ── Sub-step: Details ────────────────────────────────────────────────────────
  if (subStep === 'details') {
    return (
      <div className="space-y-5">
        <div className="pb-1">
          <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Let's start with your basic information to set up your author profile.
          </p>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <User className="w-4 h-4 text-muted-foreground" />
            Your name <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.display_name || ''}
            onChange={e => onChange({ display_name: e.target.value })}
            placeholder="First and last name"
            className={cn(allErrs.display_name && 'border-destructive')}
          />
          <FieldError msg={allErrs.display_name} />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email address <span className="text-destructive">*</span>
          </Label>
          <Input
            type="email"
            value={data.contact_email || ''}
            onChange={e => onChange({ contact_email: e.target.value })}
            placeholder="you@example.com"
            className={cn(allErrs.contact_email && 'border-destructive')}
          />
          <FieldError msg={allErrs.contact_email} />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Mobile number <span className="text-destructive">*</span>
          </Label>
          <Input
            type="tel"
            value={data.signup_phone || ''}
            onChange={e => onChange({ signup_phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className={cn(allErrs.signup_phone && 'border-destructive')}
          />
          <p className="text-xs text-muted-foreground">Used for account security and payment notifications.</p>
          <FieldError msg={allErrs.signup_phone} />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={data.signup_password || ''}
              onChange={e => onChange({ signup_password: e.target.value })}
              placeholder="At least 8 characters"
              className={cn('pr-10', allErrs.signup_password && 'border-destructive')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {data.signup_password && (
            <div className="flex gap-1 mt-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  data.signup_password.length >= i * 3
                    ? i <= 1 ? 'bg-destructive' : i === 2 ? 'bg-amber-400' : i === 3 ? 'bg-yellow-400' : 'bg-green-500'
                    : 'bg-border'
                )} />
              ))}
            </div>
          )}
          <FieldError msg={allErrs.signup_password} />
        </div>

        {/* Re-enter Password */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Re-enter password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={data.signup_password_confirm || ''}
              onChange={e => onChange({ signup_password_confirm: e.target.value })}
              placeholder="Repeat your password"
              className={cn('pr-10', allErrs.signup_password_confirm && 'border-destructive')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FieldError msg={allErrs.signup_password_confirm} />
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">
            By continuing, you agree to the{' '}
            <span className="text-primary cursor-pointer hover:underline">Classpedia Terms of Service</span>{' '}
            and{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
          <div className="flex justify-end">
            <Button onClick={handleContinueDetails} className="gap-2 px-8">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Sub-step: OTP Email ──────────────────────────────────────────────────────
  if (subStep === 'otp-email') {
    return (
      <div className="space-y-6">
        <div className="text-center pb-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Verify your email</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We've sent a one-time code to{' '}
            <span className="font-medium text-foreground">{data.contact_email}</span>
          </p>
          <button
            onClick={() => setSubStep('details')}
            className="text-xs text-primary hover:underline mt-1"
          >
            Change email
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-center text-muted-foreground">Enter security code</p>
          <OtpInput value={emailOtp} onChange={v => { setEmailOtp(v); setOtpError(''); }} />
          {otpError && (
            <p className="flex items-center justify-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5" /> {otpError}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            The code expires in 10 minutes. <span className="font-medium">(Demo code: 123456)</span>
          </p>
        </div>

        <Button onClick={handleVerifyEmail} className="w-full gap-2">
          <ShieldCheck className="w-4 h-4" /> Verify Email
        </Button>

        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-xs text-muted-foreground">Resend code in {resendCooldown}s</p>
          ) : (
            <button onClick={handleResend} className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3 h-3" /> Resend code
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Sub-step: OTP Phone ──────────────────────────────────────────────────────
  if (subStep === 'otp-phone') {
    return (
      <div className="space-y-6">
        {/* Email verified badge */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-xs text-green-700 font-medium">Email verified successfully</p>
        </div>

        <div className="text-center pb-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Add mobile number</h2>
          <p className="text-sm text-muted-foreground mt-1">
            We've sent a one-time password (OTP) to{' '}
            <span className="font-medium text-foreground">{data.signup_phone}</span>
          </p>
          <button
            onClick={() => setSubStep('details')}
            className="text-xs text-primary hover:underline mt-1"
          >
            Change number
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-center text-muted-foreground">Enter OTP</p>
          <OtpInput value={phoneOtp} onChange={v => { setPhoneOtp(v); setOtpError(''); }} />
          {otpError && (
            <p className="flex items-center justify-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5" /> {otpError}
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Message and data rates may apply. <span className="font-medium">(Demo code: 123456)</span>
          </p>
        </div>

        <Button onClick={handleVerifyPhone} className="w-full gap-2">
          <ShieldCheck className="w-4 h-4" /> Create your account
        </Button>

        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-xs text-muted-foreground">Resend code in {resendCooldown}s</p>
          ) : (
            <button onClick={handleResend} className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3 h-3" /> Resend code
            </button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to the{' '}
          <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>{' '}
          and{' '}
          <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    );
  }

  return null;
}