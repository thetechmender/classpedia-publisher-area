import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { BookOpen, ArrowLeft, BookMarked, BarChart3, CreditCard, User, Bell, HelpCircle, LayoutDashboard, TrendingUp, Lock } from 'lucide-react';
import SetupStepIndicator from '@/components/setup/SetupStepIndicator';
import AccountInfoStep from '@/components/setup/AccountInfoStep';
import PaymentStep from '@/components/setup/PaymentStep';
import TaxStep from '@/components/setup/TaxStep';
import AuthorProfileStep from '@/components/setup/AuthorProfileStep';

const validateStep1 = (data) => {
  const errors = {};
  if (!data.first_name?.trim()) errors.first_name = 'First name is required';
  if (!data.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!data.address_line1?.trim()) errors.address_line1 = 'Street address is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.state?.trim()) errors.state = 'State / Province is required';
  if (!data.zip?.trim()) errors.zip = 'ZIP / Postal code is required';
  if (!data.country) errors.country = 'Please select your country';
  return errors;
};

// Step 2: Author Profile — no required fields
const validateStep2 = (_data) => ({});

const validateStep3 = (data) => {
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

const validateStep4 = (data) => {
  const errors = {};
  if (!data.tax_id_type) errors.tax_id_type = 'Please select SSN or EIN';
  if (!data.tax_id?.trim()) errors.tax_id = 'Tax ID is required';
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
  const scrollContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    payment_method: 'bank_transfer',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await base44.auth.me();
      if (user && (user.email || user.full_name)) {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          phone: user.phone || '',
          email_verified: false,
          phone_verified: false,
        }));
      }
    };
    fetchUserData();
  }, []);

  const updateData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach(key => delete clearedErrors[key]);
    setErrors(clearedErrors);
  }, [errors]);

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Scroll to top when step changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = 0;
    }
  }, [currentStep]);

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
    const stepErrors = validateStep4(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix the errors before continuing');
      return;
    }

    try {
      setSaving(true);
      const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(' ');
      const profile = await base44.entities.AuthorProfile.create({
        ...formData,
        full_name: fullName,
        setup_complete: true,
      });
      await base44.auth.updateMe({ author_setup_complete: true });
      queryClient.setQueryData(['author-profile'], [profile]);
      toast.success('Account setup complete!');
      setSaving(false);
      navigate('/', { state: { setupComplete: true, authorName: fullName }, replace: true });
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Failed to complete setup. Please try again.');
      setSaving(false);
    }
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Disabled Navigation */}
        <div className="hidden md:block w-60 border-r bg-card overflow-y-auto sticky top-0 h-screen shrink-0">
          {/* Brand */}
          <div className="px-5 py-5 border-b flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Classpedia</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Publishing Platform</p>
            </div>
          </div>
          <nav className="flex flex-col gap-4 p-3">
            {/* Setup notice at top */}
            <div className="bg-accent/40 border border-primary/20 rounded-lg p-3 flex items-start gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-accent-foreground leading-relaxed">Complete all setup steps to unlock full dashboard access.</p>
            </div>

            {/* No section label for overview */}
            <div className="flex flex-col gap-0.5">
              {[{ icon: LayoutDashboard, label: 'Overview' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                  <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Publishing</p>
              <div className="flex flex-col gap-0.5">
                {[{ icon: BookOpen, label: 'My Books' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                    <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Earnings</p>
              <div className="flex flex-col gap-0.5">
                {[{ icon: TrendingUp, label: 'Sales & Royalties' }, { icon: CreditCard, label: 'Payments & Tax' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                    <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Account</p>
              <div className="flex flex-col gap-0.5">
                {[{ icon: User, label: 'Author Profile' }, { icon: Bell, label: 'Notifications' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                    <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Help</p>
              <div className="flex flex-col gap-0.5">
                {[{ icon: HelpCircle, label: 'Support' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
                    <Icon className="w-4 h-4 shrink-0" /><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto h-screen">
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

            <SetupStepIndicator currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} totalSteps={4} />

            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm overflow-visible">
              {currentStep === 1 && (
                <AccountInfoStep
                  data={formData}
                  onChange={updateData}
                  errors={errors}
                  onNext={() => handleNext(validateStep1, 2)}
                  onBack={() => navigate('/')}
                />
              )}
              {currentStep === 2 && (
                <AuthorProfileStep
                  data={formData}
                  onChange={updateData}
                  errors={errors}
                  onNext={() => handleNext(validateStep2, 3)}
                  onBack={() => goToStep(1)}
                />
              )}
              {currentStep === 3 && (
                <PaymentStep
                  data={formData}
                  onChange={updateData}
                  errors={errors}
                  onNext={() => handleNext(validateStep3, 4)}
                  onBack={() => goToStep(2)}
                />
              )}
              {currentStep === 4 && (
                <TaxStep
                  data={formData}
                  onChange={updateData}
                  errors={errors}
                  onNext={handleSubmit}
                  onBack={() => goToStep(3)}
                  scrollContainerRef={scrollContainerRef}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}