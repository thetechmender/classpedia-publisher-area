import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
) : null;

// 6-digit OTP input
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = (value || '').split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    onChange(next.join(''));
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
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
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-lg font-semibold border-2 rounded-lg border-border bg-background focus:border-primary focus:outline-none transition-colors"
        />
      ))}
    </div>
  );
}

// ── Sub-screen: Email verification ───────────────────────────────────────────
function EmailVerifyScreen({ email, onVerified, onChangeEmail }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(28);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  const handleVerify = () => {
    if (code.length < 6) { setError('Please enter the full 6-digit code'); return; }
    // Demo: accept 123456
    if (code !== '123456') { setError('Invalid code. (Demo: 123456)'); return; }
    setError('');
    onVerified();
  };

  return (
    <div className="flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Mail className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-semibold">Verify your email</h3>
        <p className="text-sm text-muted-foreground mt-1">We've sent a one-time code to <strong>{email}</strong></p>
        <button onClick={onChangeEmail} className="text-sm text-primary hover:underline mt-0.5">Change email</button>
      </div>

      <div className="w-full">
        <p className="text-sm text-muted-foreground mb-3">Enter security code</p>
        <OtpInput value={code} onChange={setCode} />
        <p className="text-xs text-muted-foreground mt-2">The code expires in 10 minutes. (Demo code: 123456)</p>
        {error && <p className="flex items-center justify-center gap-1 text-xs text-destructive mt-2"><AlertCircle className="w-3 h-3" />{error}</p>}
      </div>

      <Button onClick={handleVerify} className="w-full h-11 gap-2 text-sm font-medium">
        <ShieldCheck className="w-4 h-4" /> Verify Email
      </Button>
      <p className="text-sm text-muted-foreground">
        {resendSeconds > 0
          ? <span>Resend code in <strong>{resendSeconds}s</strong></span>
          : <button onClick={() => setResendSeconds(28)} className="text-primary hover:underline">Resend code</button>
        }
      </p>
    </div>
  );
}

// ── Sub-screen: Phone verification ───────────────────────────────────────────
function PhoneVerifyScreen({ phone, onVerified, onChangeNumber }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(28);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSeconds]);

  const handleVerify = () => {
    if (code.length < 6) { setError('Please enter the full 6-digit OTP'); return; }
    if (code !== '123456') { setError('Invalid OTP. (Demo: 123456)'); return; }
    setError('');
    onVerified();
  };

  return (
    <div className="flex flex-col items-center text-center gap-5">
      <div className="flex items-center gap-2 w-full justify-start bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        <span className="text-sm text-green-700 font-medium">Email verified successfully</span>
      </div>

      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Phone className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-semibold">Add mobile number</h3>
        <p className="text-sm text-muted-foreground mt-1">We've sent a one-time password (OTP) to <strong>{phone}</strong></p>
        <button onClick={onChangeNumber} className="text-sm text-primary hover:underline mt-0.5">Change number</button>
      </div>

      <div className="w-full">
        <p className="text-sm text-muted-foreground mb-3">Enter OTP</p>
        <OtpInput value={code} onChange={setCode} />
        <p className="text-xs text-muted-foreground mt-2">Message and data rates may apply. (Demo code: 123456)</p>
        {error && <p className="flex items-center justify-center gap-1 text-xs text-destructive mt-2"><AlertCircle className="w-3 h-3" />{error}</p>}
      </div>

      <Button onClick={handleVerify} className="w-full h-11 gap-2 text-sm font-medium">
        <ShieldCheck className="w-4 h-4" /> Create your account
      </Button>
      <p className="text-sm text-muted-foreground">
        {resendSeconds > 0
          ? <span>Resend code in <strong>{resendSeconds}s</strong></span>
          : <button onClick={() => setResendSeconds(28)} className="text-primary hover:underline">Resend code</button>
        }
      </p>
      <p className="text-xs text-muted-foreground">
        By creating an account, you agree to the{' '}
        <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{' '}
        <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
      </p>
    </div>
  );
}

// ── Main Create Account form ──────────────────────────────────────────────────
export default function CreateAccountStep({ data, onChange, onNext }) {
  const [screen, setScreen] = useState('form'); // 'form' | 'email_verify' | 'phone_verify'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.full_name?.trim()) e.full_name = 'Your name is required';
    if (!data.email?.trim()) e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Enter a valid email address';
    if (!data.phone?.trim()) e.phone = 'Mobile number is required';
    if (!data.password?.trim()) e.password = 'Password is required';
    else if (data.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!data.confirm_password?.trim()) e.confirm_password = 'Please re-enter your password';
    else if (data.password !== data.confirm_password) e.confirm_password = 'Passwords do not match';
    return e;
  };

  const handleContinue = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setScreen('email_verify');
  };

  const handleEmailVerified = () => setScreen('phone_verify');
  const handlePhoneVerified = () => onNext();

  if (screen === 'email_verify') {
    return (
      <EmailVerifyScreen
        email={data.email}
        onVerified={handleEmailVerified}
        onChangeEmail={() => setScreen('form')}
      />
    );
  }

  if (screen === 'phone_verify') {
    return (
      <PhoneVerifyScreen
        phone={data.phone}
        onVerified={handlePhoneVerified}
        onChangeNumber={() => setScreen('form')}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-1">Let's start with your basic information to set up your author profile.</p>
      </div>

      {/* Your name */}
      <div>
        <Label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-foreground" /> Your name <span className="text-destructive">*</span>
        </Label>
        <Input
          value={data.full_name || ''}
          onChange={e => { onChange({ full_name: e.target.value }); setErrors(p => ({ ...p, full_name: '' })); }}
          placeholder="First and last name"
          className={cn('bg-background', errors.full_name && 'border-destructive')}
        />
        <FieldError msg={errors.full_name} />
      </div>

      {/* Email */}
      <div>
        <Label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email address <span className="text-destructive">*</span>
        </Label>
        <Input
          type="email"
          value={data.email || ''}
          onChange={e => { onChange({ email: e.target.value }); setErrors(p => ({ ...p, email: '' })); }}
          placeholder="you@example.com"
          className={cn('bg-background', errors.email && 'border-destructive')}
        />
        <FieldError msg={errors.email} />
      </div>

      {/* Phone */}
      <div>
        <Label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Mobile number <span className="text-destructive">*</span>
        </Label>
        <Input
          type="tel"
          value={data.phone || ''}
          onChange={e => { onChange({ phone: e.target.value }); setErrors(p => ({ ...p, phone: '' })); }}
          placeholder="+1 (555) 000-0000"
          className={cn('bg-background', errors.phone && 'border-destructive')}
        />
        <p className="text-xs text-muted-foreground mt-1">Used for account security and payment notifications.</p>
        <FieldError msg={errors.phone} />
      </div>

      {/* Password */}
      <div>
        <Label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Password <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={data.password || ''}
            onChange={e => { onChange({ password: e.target.value }); setErrors(p => ({ ...p, password: '' })); }}
            placeholder="At least 8 characters"
            className={cn('bg-background pr-10', errors.password && 'border-destructive')}
          />
          <button type="button" onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <FieldError msg={errors.password} />
      </div>

      {/* Confirm Password */}
      <div>
        <Label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" /> Re-enter password <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showConfirm ? 'text' : 'password'}
            value={data.confirm_password || ''}
            onChange={e => { onChange({ confirm_password: e.target.value }); setErrors(p => ({ ...p, confirm_password: '' })); }}
            placeholder="Repeat your password"
            className={cn('bg-background pr-10', errors.confirm_password && 'border-destructive')}
          />
          <button type="button" onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <FieldError msg={errors.confirm_password} />
      </div>

      <p className="text-xs text-muted-foreground">
        By continuing, you agree to the{' '}
        <span className="text-primary cursor-pointer hover:underline">Classpedia Terms of Service</span> and{' '}
        <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
      </p>

      <Button onClick={handleContinue} className="w-full h-11 gap-2 text-sm font-medium">
        Continue <span className="ml-1">›</span>
      </Button>
    </div>
  );
}