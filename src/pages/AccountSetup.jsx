import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { BookOpen, ArrowLeft } from 'lucide-react';
import SetupStepIndicator from '@/components/setup/SetupStepIndicator';
import CreateAccountStep from '@/components/setup/CreateAccountStep';
import AccountInfoStep from '@/components/setup/AccountInfoStep';
import PaymentStep from '@/components/setup/PaymentStep';
import TaxStep from '@/components/setup/TaxStep';
import AuthorProfileStep from '@/components/setup/AuthorProfileStep';

const validateStep2 = (data) => {
  const errors = {};
  if (!data.first_name?.trim()) errors.first_name = 'First name is required';
  if (!data.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!data.country) errors.country = 'Please select your country';
  return errors;
};

// Step 3: Author Profile — no required fields
const validateStep3 = (_data) => ({});

const validateStep4 = (data) => {
  const errors = {};
  if (!data.payment_method) { errors.payment_method = 'Please select a payment method'; return errors; }
  if (data.payment_method === 'bank_transfer') {
    if (!data.bank_account_name?.trim()) errors.bank_account_name = 'Account holder name is required';
    if (!data.bank_account_number?.trim()) errors.bank_account_number = 'Account number is required';
    if (!data.bank_routing_number?.trim()) errors.bank_routing_number = 'Routing/IBAN is required';
  }
  if (data.payment_method === 'paypal') {
    if (!data.paypal_email?.trim()) errors.paypal_email = 'PayPal email is required';
    else if (!/\S+@\S+\.\S+/.test(data.paypal_email)) errors.paypal_email = 'Enter a valid email address';
  }
  return errors;
};

const validateStep5 = (data) => {
  const errors = {};
  if (data.us_person === undefined) { errors.us_person = 'Please select your US tax status'; return errors; }
  if (data.us_person) {
    if (!data.tax_id_type) errors.tax_id_type = 'Please select SSN or EIN';
    if (!data.tax_id?.trim()) errors.tax_id = 'Tax ID is required';
  } else {
    if (!data.tax_country) errors.tax_country = 'Please select your country of tax residence';
  }
  if (!data.tax_certified) errors.tax_certified = 'You must certify this information is correct';
  if (!data.esign_consent) errors.esign_consent = 'You must consent to provide an electronic signature';
  if (!data.esignature?.trim()) errors.esignature = 'Please type your full name as your electronic signature';
  return errors;
};

export default function AccountSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: 'bank_transfer',
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
    const stepErrors = validateStep5(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix the errors before continuing');
      return;
    }

    setSaving(true);
    const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(' ');
    const profile = await base44.entities.AuthorProfile.create({
      ...formData,
      full_name: fullName,
      setup_complete: true,
    });
    // Pre-populate the cache so Dashboard doesn't redirect back to setup
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
        <div className="w-full px-6 py-4 flex items-center justify-between">
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

      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        {/* Welcome banner — only on step 1 */}
        {currentStep === 1 && false && (
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

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm overflow-visible">
          {currentStep === 1 && (
            <CreateAccountStep
              data={formData}
              onChange={updateData}
              onNext={() => {
                setCompletedSteps(prev => [...new Set([...prev, 1])]);
                goToStep(2);
              }}
            />
          )}
          {currentStep === 2 && (
            <AccountInfoStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep2, 3)}
              onBack={() => goToStep(1)}
            />
          )}
          {currentStep === 3 && (
            <AuthorProfileStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep3, 4)}
              onBack={() => goToStep(2)}
            />
          )}
          {currentStep === 4 && (
            <PaymentStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep4, 5)}
              onBack={() => goToStep(3)}
            />
          )}
          {currentStep === 5 && (
            <TaxStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={handleSubmit}
              onBack={() => goToStep(4)}
            />
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account you agree to the{' '}
          <span className="text-primary cursor-pointer hover:underline">Classpedia Terms of Service</span>{' '}
          and{' '}
          <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}