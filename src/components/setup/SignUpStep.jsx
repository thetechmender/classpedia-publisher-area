import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronRight, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const FieldError = ({ msg }) => msg ? (
  <p className="flex items-center gap-1 text-xs text-destructive mt-1">
    <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
  </p>
) : null;

export default function SignUpStep({ data, onChange, errors, onNext }) {
  return (
    <div className="space-y-6">
      <div className="pb-1">
        <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Let's start with your basic information. This will be used for your author profile and communications.
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <User className="w-4 h-4 text-muted-foreground" />
          Your name <span className="text-destructive">*</span>
        </Label>
        <Input
          value={data.display_name || ''}
          onChange={(e) => onChange({ display_name: e.target.value })}
          placeholder="First and last name"
          className={cn(errors.display_name ? 'border-destructive' : '')}
        />
        <FieldError msg={errors.display_name} />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Email address <span className="text-destructive">*</span>
        </Label>
        <Input
          type="email"
          value={data.contact_email || ''}
          onChange={(e) => onChange({ contact_email: e.target.value })}
          placeholder="you@example.com"
          className={cn(errors.contact_email ? 'border-destructive' : '')}
        />
        <FieldError msg={errors.contact_email} />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-muted-foreground" />
          Mobile number <span className="text-destructive">*</span>
        </Label>
        <Input
          type="tel"
          value={data.signup_phone || ''}
          onChange={(e) => onChange({ signup_phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
          className={cn(errors.signup_phone ? 'border-destructive' : '')}
        />
        <p className="text-xs text-muted-foreground">
          Used for account security and royalty payment notifications.
        </p>
        <FieldError msg={errors.signup_phone} />
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground mb-4">
          By continuing, you agree to the{' '}
          <span className="text-primary cursor-pointer hover:underline">Classpedia Terms of Service</span>{' '}
          and{' '}
          <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
        <div className="flex justify-end">
          <Button onClick={onNext} className="gap-2 px-8">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}