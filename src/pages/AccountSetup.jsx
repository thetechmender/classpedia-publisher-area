import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { BookOpen, ArrowLeft } from 'lucide-react';
import SetupStepIndicator from '@/components/setup/SetupStepIndicator';
import IdentityStep from '@/components/setup/IdentityStep';
import AccountDetailsStep from '@/components/setup/AccountDetailsStep';
import GettingPaidStep from '@/components/setup/GettingPaidStep';
import TaxProfileStep from '@/components/setup/TaxProfileStep';
import AuthorProfileStep from '@/components/setup/AuthorProfileStep';

// Step validators
const validateStep1 = (data) => {
  const errors = {};
  if (!data.full_name?.trim()) errors.full_name = 'Full name is required';
  if (!data.country) errors.country = 'Country is required';
  if (!data.address_line1?.trim()) errors.address_line1 = 'Address is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.zip?.trim()) errors.zip = 'Postal code is required';
  if (!data.date_of_birth) errors.date_of_birth = 'Date of birth is required';
  if (!data.phone?.trim()) errors.phone = 'Phone number is required';
  return errors;
};

const validateStep2 = (data) => {
  const errors = {};
  if (data.business_type === 'corporation' && !data.company_name?.trim()) {
    errors.company_name = 'Company name is required';
  }
  return errors;
};

const validateStep3 = (data) => {
  const errors = {};
  if (!data.bank_country) errors.bank_country = 'Bank country is required';
  if (!data.bank_account_number?.trim()) errors.bank_account_number = 'Account number is required';
  if (!data.bank_account_number_confirm?.trim()) {
    errors.bank_account_number_confirm = 'Please re-enter account number';
  } else if (data.bank_account_number !== data.bank_account_number_confirm) {
    errors.bank_account_number_confirm = 'Account numbers do not match';
  }
  if (data.bank_country === 'United States' && !data.bank_routing_number?.trim()) {
    errors.bank_routing_number = 'Routing number is required';
  }
  const bankBizType = data.bank_business_type || (data.business_type === 'corporation' ? 'corporation' : 'individual');
  if (bankBizType !== 'corporation' && !data.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required';
  }
  return errors;
};

const validateStep4 = (data) => {
  const errors = {};
  if (data.us_person === undefined || data.us_person === null) {
    errors.us_person = 'Please indicate your U.S. tax status';
  }
  if ((data.us_person === true || data.us_person === 'not_sure') && !data.tax_id?.trim()) {
    errors.tax_id = 'Tax ID (TIN) is required';
  }
  if (!data.tax_certified) errors.tax_certified = 'You must certify this information is correct';
  return errors;
};

const validateStep5 = () => ({});

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
    tax_classification: 'individual',
    bank_country: 'United States',
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
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-6 py-8">
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

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          {currentStep === 1 && (
            <IdentityStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep1, 2)}
            />
          )}
          {currentStep === 2 && (
            <AccountDetailsStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep2, 3)}
              onBack={() => goToStep(1)}
            />
          )}
          {currentStep === 3 && (
            <GettingPaidStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep3, 4)}
              onBack={() => goToStep(2)}
            />
          )}
          {currentStep === 4 && (
            <TaxProfileStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={() => handleNext(validateStep4, 5)}
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