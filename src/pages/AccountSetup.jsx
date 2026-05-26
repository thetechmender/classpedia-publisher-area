// @ts-ignore
import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BookOpen, ArrowLeft } from 'lucide-react';
import SetupStepIndicator from '@/components/setup/SetupStepIndicator';
import CreateAccountStep from '@/components/setup/CreateAccountStep';
import AccountInfoStep from '@/components/setup/AccountInfoStep';
import PaymentStep from '@/components/setup/PaymentStep';
import TaxStep from '@/components/setup/TaxStep';
import AuthorProfileStep from '@/components/setup/AuthorProfileStep';
import { CredentialService } from '@/services/credential.service';
import { PublisherService } from '@/services/publisher.service';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

const formDataInitial = {
  paymentMethod: 'bank_transfer',
};

const validateStep2 = (data) => {
  const errors = {};
  if (!data.legalFirstName?.trim()) errors.legalFirstName = 'First name is required';
  if (!data.legalLastName?.trim()) errors.legalLastName = 'Last name is required';
  if (!data.country) errors.country = 'Please select your country';
  return errors;
};

// Step 3: Author Profile — no required fields
const validateStep3 = (_data) => ({});

const validateStep4 = (data) => {
  const errors = {};
  if (!data.paymentMethod) { errors.paymentMethod = 'Please select a payment method'; return errors; }
  if (data.paymentMethod === 'bank_transfer') {
    if (!data.bankAccountName?.trim()) errors.bankAccountName = 'Account holder name is required';
    if (!data.bankAccountNumber?.trim()) errors.bankAccountNumber = 'Account number is required';
    if (!data.bankRoutingNumber?.trim()) errors.bankRoutingNumber = 'Routing/IBAN is required';
  }
  if (data.paymentMethod === 'paypal') {
    if (!data.paypalEmail?.trim()) errors.paypalEmail = 'PayPal email is required';
    else if (!/\S+@\S+\.\S+/.test(data.paypalEmail)) errors.paypalEmail = 'Enter a valid email address';
  }
  return errors;
};

const validateStep5 = (data) => {
  const errors = {};
  if (data.usPerson === undefined) { errors.usPerson = 'Please select your US tax status'; return errors; }
  if (data.usPerson) {
    if (!data.taxIdType) errors.taxIdType = 'Please select SSN or EIN';
    if (!data.taxId?.trim()) errors.taxId = 'Tax ID is required';
  } else {
    if (!data.taxCountry) errors.taxCountry = 'Please select your country of tax residence';
  }
  if (!data.taxCertified) errors.taxCertified = 'You must certify this information is correct';
  if (!data.esignConsent) errors.esignConsent = 'You must consent to provide an electronic signature';
  if (!data.esignature?.trim()) errors.esignature = 'Please type your full name as your electronic signature';
  return errors;
};

export default function AccountSetup() {
  const navigate = useNavigate();
  const { updateProfileCompleted, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publisherId, setPublisherId] = useState(null);
  const [formData, setFormData] = useState(/** @type {{ paymentMethod: string; publisherFullName?: string; publisherEmail?: string; publisherPhone?: string; publisherPassword?: string; publisherConfirmPassword?: string; legalFirstName?: string; legalLastName?: string; addressLine1?: string; city?: string; state?: string; zip?: string; country?: string; bio?: string; preferredCategories?: string[]; website?: string; twitterHandle?: string; instagramHandle?: string; facebookUrl?: string; linkedinUrl?: string; youtubeUrl?: string; bankAccountName?: string; bankAccountNumber?: string; bankRoutingNumber?: string; paypalEmail?: string; usPerson?: boolean; taxIdType?: string; taxId?: string; taxCountry?: string; taxCertified?: boolean; esignConsent?: boolean; esignature?: string; }} */({
    paymentMethod: 'bank_transfer',
  }));

  // Fetch account data on mount if user is authenticated
  useEffect(() => {
    const fetchAccountData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await CredentialService.getAccount();
        if (response.isSuccess && response.data) {
          const account = response.data;
          setPublisherId(account.publisherId);

          // Map API data to form data
          const mappedData = {
            paymentMethod: account.paymentInfo?.paymentMethod || 'bank_transfer',
            // Step 1: Create Account data
            publisherFullName: account.publisherFullName || '',
            publisherEmail: account.publisherEmail || '',
            publisherPhone: account.publisherPhone || '',
            // Step 2: Personal Info
            legalFirstName: account.personalInfo?.legalFirstName || '',
            legalLastName: account.personalInfo?.legalLastName || '',
            addressLine1: account.personalInfo?.addressLine1 || '',
            city: account.personalInfo?.city || '',
            state: account.personalInfo?.state || '',
            zip: account.personalInfo?.zip || '',
            country: account.personalInfo?.country || '',
            // Step 3: Author Info
            bio: account.authInfo?.bio || '',
            preferredCategories: account.authInfo?.preferredCategories || [],
            website: account.authInfo?.website || '',
            twitterHandle: account.authInfo?.twitterHandle || '',
            instagramHandle: account.authInfo?.instagramHandle || '',
            facebookUrl: account.authInfo?.facebookUrl || '',
            linkedinUrl: account.authInfo?.linkedinUrl || '',
            youtubeUrl: account.authInfo?.youtubeUrl || '',
            // Step 4: Payment Info
            bankAccountName: account.paymentInfo?.bankAccountName || '',
            bankAccountNumber: account.paymentInfo?.bankAccountNumber || '',
            bankRoutingNumber: account.paymentInfo?.bankRoutingNumber || '',
            paypalEmail: account.paymentInfo?.paypalEmail || '',
            // Step 5: Tax Info
            usPerson: account.taxInfo?.usPerson,
            taxIdType: account.taxInfo?.taxIdType || '',
            taxId: account.taxInfo?.taxId || '',
            taxCountry: account.taxInfo?.taxCountry || '',
            esignConsent: account.taxInfo?.esignConsent || false,
            esignature: account.taxInfo?.esignature || '',
            taxCertified: account.taxInfo?.taxCertified || false,
          };

          setFormData(mappedData);

          // Determine which step to start on based on completed data
          const completed = [];
          let startStep = 1;

          // Check Step 1: Create Account (basic info)
          if (account.publisherFullName && account.publisherEmail && account.publisherPhone) {
            completed.push(1);
            startStep = 2;
          }

          // Check Step 2: Personal Info
          if (account.personalInfo?.legalFirstName && account.personalInfo?.legalLastName && account.personalInfo?.country) {
            completed.push(2);
            startStep = 3;
          }

          // Check Step 3: Author Info (optional, so just check if any data exists)
          if (account.authInfo?.bio || (account.authInfo?.preferredCategories && account.authInfo.preferredCategories.length > 0)) {
            completed.push(3);
            startStep = 4;
          } else if (completed.includes(2)) {
            // Author info is optional, so if step 2 is done, we can move to step 3
            startStep = 3;
          }

          // Check Step 4: Payment Info
          if (account.paymentInfo?.paymentMethod) {
            const hasBank = account.paymentInfo.paymentMethod === 'bank_transfer' &&
              account.paymentInfo.bankAccountName && account.paymentInfo.bankAccountNumber;
            const hasPaypal = account.paymentInfo.paymentMethod === 'paypal' && account.paymentInfo.paypalEmail;
            if (hasBank || hasPaypal) {
              completed.push(4);
              startStep = 5;
            }
          }

          // Check Step 5: Tax Info
          if (account.taxInfo?.taxCertified && account.taxInfo?.esignConsent && account.taxInfo?.esignature) {
            completed.push(5);
          }

          setCompletedSteps(completed);
          setCurrentStep(startStep);
        }
      } catch (error) {
        console.error('Failed to fetch account data:', error);
        toast.error('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [isAuthenticated]);

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

  // Helper to save current step data via API - sends current step + all previous steps data
  const saveStepData = async (stepNumber) => {
    const currentPublisherId = publisherId || parseInt(localStorage.getItem('publisher_id') || '0');

    // Build payload - include current step and all previous steps data
    const payload = { publisherId: currentPublisherId };

    // Always include createAccount data (step 1)
    payload.createAccount = {
      publisherFullName: formData.publisherFullName || '',
      publisherEmail: formData.publisherEmail || '',
      publisherPhone: formData.publisherPhone || '',
      publisherPassword: formData.publisherPassword || '',
      publisherConfirmPassword: formData.publisherConfirmPassword || '',
    };

    // Include personalInfo (step 2) if step >= 2
    if (stepNumber >= 2) {
      payload.personalInfo = {
        legalFirstName: formData.legalFirstName || '',
        legalLastName: formData.legalLastName || '',
        addressLine1: formData.addressLine1 || '',
        city: formData.city || '',
        state: formData.state || '',
        zip: formData.zip || '',
        country: formData.country || '',
      };
    }

    // Include authInfo (step 3) if step >= 3
    if (stepNumber >= 3) {
      payload.authInfo = {
        bio: formData.bio || '',
        preferredCategories: formData.preferredCategories || [],
        website: formData.website || '',
        twitterHandle: formData.twitterHandle || '',
        instagramHandle: formData.instagramHandle || '',
        facebookUrl: formData.facebookUrl || '',
        linkedinUrl: formData.linkedinUrl || '',
        youtubeUrl: formData.youtubeUrl || '',
      };
    }

    // Include paymentInfo (step 4) if step >= 4
    if (stepNumber >= 4) {
      payload.paymentInfo = {
        paymentMethod: formData.paymentMethod || 'bank_transfer',
        bankAccountName: formData.bankAccountName || '',
        bankAccountNumber: formData.bankAccountNumber || '',
        bankRoutingNumber: formData.bankRoutingNumber || '',
        paypalEmail: formData.paypalEmail || '',
      };
    }

    // Include taxInfo (step 5) if step >= 5
    if (stepNumber >= 5) {
      payload.taxInfo = {
        usPerson: formData.usPerson || false,
        taxIdType: formData.taxIdType || '',
        taxId: formData.taxId || '',
        taxCountry: formData.taxCountry || '',
        esignConsent: formData.esignConsent || false,
        esignature: formData.esignature || '',
        taxCertified: formData.taxCertified || false,
      };
    }

    try {
      const response = await PublisherService.createAccount(payload);
      if (response.isSuccess) {
        // If this is step 1 and we got a new publisherId, save it
        if (stepNumber === 1 && response.data?.publisherId) {
          setPublisherId(response.data.publisherId);
          localStorage.setItem('publisher_id', response.data.publisherId.toString());
        }
        return true;
      } else {
        toast.error(response.errorMessage || 'Failed to save data');
        return false;
      }
    } catch (error) {
      console.error('Failed to save step data:', error);
      toast.error(error.response?.data?.errorMessage || 'Failed to save data');
      return false;
    }
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep5(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix the errors before continuing');
      return;
    }

    setSaving(true);
    const success = await saveStepData(5);
    setSaving(false);

    if (success) {
      updateProfileCompleted(true);
      toast.success('Account setup complete! Welcome to Classpedia.');
      navigate('/dashboard');
    }
  };

  // Show loading spinner while fetching account data
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

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
          {isAuthenticated && (
            <Link to="/dashboard">
              <Button size="sm" className="gap-1.5 h-8 text-xs px-3">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          )}
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
        {currentStep > 1 && (
          <button
            onClick={() => goToStep(currentStep - 1)}
            className="flex items-center mb-1 border border-secondary/50 gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm overflow-visible">
          {currentStep === 1 && (
            <CreateAccountStep
              data={formData}
              onChange={updateData}
              onNext={async () => {
                setSaving(true);
                const success = await saveStepData(1);
                setSaving(false);
                if (success) {
                  setCompletedSteps(prev => [...new Set([...prev, 1])]);
                  goToStep(2);
                }
              }}
              saving={saving}
              isExistingUser={completedSteps.includes(1)}
            />
          )}
          {currentStep === 2 && (
            <AccountInfoStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={async () => {
                const stepErrors = validateStep2(formData);
                if (Object.keys(stepErrors).length > 0) {
                  setErrors(stepErrors);
                  toast.error('Please fix the errors before continuing');
                  return;
                }
                setErrors({});
                setSaving(true);
                const success = await saveStepData(2);
                setSaving(false);
                if (success) {
                  setCompletedSteps(prev => [...new Set([...prev, 2])]);
                  goToStep(3);
                }
              }}
              onBack={() => goToStep(1)}
              saving={saving}
            />
          )}
          {currentStep === 3 && (
            <AuthorProfileStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onSubmit={undefined}
              onNext={async () => {
                const stepErrors = validateStep3(formData);
                if (Object.keys(stepErrors).length > 0) {
                  setErrors(stepErrors);
                  toast.error('Please fix the errors before continuing');
                  return;
                }
                setErrors({});
                setSaving(true);
                const success = await saveStepData(3);
                setSaving(false);
                if (success) {
                  setCompletedSteps(prev => [...new Set([...prev, 3])]);
                  goToStep(4);
                }
              }}
              onBack={() => goToStep(2)}
              saving={saving}
            />
          )}
          {currentStep === 4 && (
            <PaymentStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={async () => {
                const stepErrors = validateStep4(formData);
                if (Object.keys(stepErrors).length > 0) {
                  setErrors(stepErrors);
                  toast.error('Please fix the errors before continuing');
                  return;
                }
                setErrors({});
                setSaving(true);
                const success = await saveStepData(4);
                setSaving(false);
                if (success) {
                  setCompletedSteps(prev => [...new Set([...prev, 4])]);
                  goToStep(5);
                }
              }}
              onBack={() => goToStep(3)}
              saving={saving}
            />
          )}
          {currentStep === 5 && (
            <TaxStep
              data={formData}
              onChange={updateData}
              errors={errors}
              onNext={handleSubmit}
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