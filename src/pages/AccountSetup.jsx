import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { BookOpen, ArrowLeft } from 'lucide-react';
import SetupStepIndicator from '@/components/setup/SetupStepIndicator';
import SignUpStep from '@/components/setup/SignUpStep';
import AccountInfoStep from '@/components/setup/AccountInfoStep';
import GettingPaidStep from '@/components/setup/GettingPaidStep';
import TaxStep from '@/components/setup/TaxStep';
import AuthorProfileStep from '@/components/setup/AuthorProfileStep';

// Step validators
const validateStep0 = (data) => {
  const errors = {};
  if (!data.display_name?.trim()) errors.display_name = 'Your name is required';
  if (!data.contact_email?.trim()) errors.contact_email = 'Email address is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) errors.contact_email = 'Enter a valid email address';
  if (!data.signup_phone?.trim()) errors.signup_phone = 'Mobile number is required';
  return errors;
};

const validateStep1 = (data) => {
  const errors = {};
  if (!data.first_name?.trim()) errors.first_name = 'First name is required';
  if (!data.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  if (!data.country) errors.country = 'Country is required';
  return errors;
};

const validateStep2 = (data) => {
  const errors = {};
  if (!data.bank_country) errors.bank_country = 'Please select your bank country';
  if (!data.bank_account_number?.trim()) errors.bank_account_number = 'Account number is required';
  if (!data.bank_account_number_confirm?.trim()) {
    errors.bank_account_number_confirm = 'Please re-enter account number';
  } else if (data.bank_account_number !== data.bank_account_number_confirm) {
    errors.bank_account_number_confirm = 'Account numbers do not match';
  }
  if (data.bank_country === 'United States' && !data.bank_routing_number?.trim()) {
    errors.bank_routing_number = 'Routing number is required';
  }
  return errors;
};

const validateStep3 = (data) => {
  const errors = {};
  if (data.us_person === undefined || data.us_person === null) {
    errors.us_person = 'Please indicate your U.S. tax status';
  }
  if (data.us_person === true && !data.tax_id?.trim()) {
    errors.tax_id = 'Tax ID (TIN) is required';
  }
  if (!data.tax_certified) errors.tax_certified = 'You must certify this information is correct';
  return errors;
};

const validateStep4 = () => ({});

export default function AccountSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_type: 'individual',
    bank_account_type: 'checking',
    bank_business_type: 'individual',
  });

  const updateData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach(key => delete clearedErrors[key]);
    setErrors(clearedErrors);
  }, [errors]);

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = (validator, nextStep) => {
    const stepErrors = validator(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix the errors before continuing');
      return;
    }
    setErrors({});
    setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
    goToStep(nextStep);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const profile = await base44.entities.AuthorProfile.create({
      ...formData,
      setup_complete: true,
    });
    queryClient.setQueryData(['author-profile'], [profile]);
    await base44.auth.updateMe({ author_setup_complete: true });
    setSaving(false);
    toast.success('Account created! Welcome to Classpedia.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Classpedia Publishing</h1>
              <p className="text-xs text-muted-foreground">Author Account Setup</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Welcome banner — only on step 1 */}
        {currentStep === 1 && (
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/40 border border-primary/20 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Welcome to Classpedia Publishing</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Let's get your account set up so you can start publishing and earning royalties.
                This takes about 5 minutes. You'll need your banking details and tax information.
              </p>
            </div>
          </div>
        )}

        <SetupStepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <div className="bg-card border rounded-2xl p-8 shadow-sm mt-2">
          {currentStep === 1 && (
            <SignUpStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep0, 2)}
            />
          )}
          {currentStep === 2 && (
            <AccountInfoStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep1, 3)}
              onBack={() => goToStep(1)}
            />
          )}
          {currentStep === 3 && (
            <GettingPaidStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep2, 4)}
              onBack={() => goToStep(2)}
            />
          )}
          {currentStep === 4 && (
            <TaxStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep3, 5)}
              onBack={() => goToStep(3)}
            />
          )}
          {currentStep === 5 && (
            <AuthorProfileStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onSubmit={handleSubmit}
              onBack={() => goToStep(4)}
              saving={saving}
            />
          )}
        </div>

        {currentStep !== 1 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            By creating an account you agree to the{' '}
            <span className="text-primary cursor-pointer hover:underline">Classpedia Terms of Service</span>{' '}
            and{' '}
            <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        )}
      </div>
    </div>
  );
}