import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StepIndicator from '@/components/publish/StepIndicator';
import BookDetailsStep from '@/components/publish/BookDetailsStep';
import ContentStep from '@/components/publish/ContentStep';
import PricingStep from '@/components/publish/PricingStep';
import ReviewStep from '@/components/publish/ReviewStep';
import {
  BookOpen, ArrowLeft, ChevronLeft, CheckCircle2, Upload, DollarSign, Eye,
  FileText, Image, Tag, Clock, Save
} from 'lucide-react';

const validateStep1 = (data) => {
  const errors = {};
  if (!data.title?.trim()) errors.title = 'Book title is required';
  if (!data.author_name?.trim()) errors.author_name = 'Author name is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  else if (data.description.trim().length < 50) errors.description = 'Description must be at least 50 characters';
  else if (data.description.trim().length > 4000) errors.description = 'Description cannot exceed 4,000 characters';
  if (!data.language) errors.language = 'Please select a language';
  if (data.preorder_type === 'preorder' && !data.preorder_date) {
    errors.preorder_date = 'Please set a pre-order release date';
  }
  return errors;
};

const validateStep2 = (data) => {
  const errors = {};
  if (!data.manuscript_url) errors.manuscript_url = 'Please upload your manuscript';
  if (!data.cover_url) errors.cover_url = 'Please upload a cover image';
  return errors;
};

const validateStep3 = (data) => {
  const errors = {};
  if (!data.list_price || data.list_price <= 0) {
    errors.list_price = 'Please enter a valid price';
  } else if (data.list_price < 1.99) {
    errors.list_price = 'Price must be at least $1.99';
  } else if (data.list_price > 199.99) {
    errors.list_price = 'Price cannot exceed $199.99';
  }
  if (data.territories === 'specific' && (!data.selected_countries || data.selected_countries.length === 0)) {
    errors.territories = 'Please select at least one country';
  }
  return errors;
};

const validateAll = (data) => {
  const errors = [];
  if (!data.title?.trim()) errors.push('Book title is required');
  if (!data.author_name?.trim()) errors.push('Author name is required');
  if (!data.description?.trim()) errors.push('Description is required');
  else if (data.description.trim().length < 50) errors.push('Description must be at least 50 characters');
  else if (data.description.trim().length > 4000) errors.push('Description cannot exceed 4,000 characters');
  if (!data.language) errors.push('Language is required');
  if (!data.manuscript_url) errors.push('Manuscript upload is required');
  if (!data.cover_url) errors.push('Cover image is required');
  if (!data.list_price || data.list_price <= 0) errors.push('Valid price is required');
  return errors;
};

const STEP_INFO = [
  { step: 1, label: 'Book Details', icon: Tag, desc: 'Title, author, description, categories' },
  { step: 2, label: 'Content',      icon: Upload, desc: 'Manuscript, cover, sample chapter' },
  { step: 3, label: 'Pricing',      icon: DollarSign, desc: 'Price, royalties, territories' },
  { step: 4, label: 'Review',       icon: Eye, desc: 'Final check before submission' },
];

export default function PublishBook() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [bookData, setBookData] = useState({
    language: 'English',
    territories: 'worldwide',
    currency: 'USD',
    drm: false,
    age_range: 'not_specified',
    keywords: [],
    categories: [],
    contributors: [],
  });
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  const updateData = useCallback((updates) => {
    setBookData(prev => ({ ...prev, ...updates }));
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach(key => delete clearedErrors[key]);
    setErrors(clearedErrors);
  }, [errors]);

  // Auto-save draft every 30 seconds
  const saveDraftMutation = useMutation({
    mutationFn: async (data) => {
      const existing = await base44.entities.Book.filter({ title: data.title, status: 'draft' });
      if (existing && existing.length > 0) {
        return await base44.entities.Book.update(existing[0].id, data);
      }
      return await base44.entities.Book.create({ ...data, status: 'draft' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setLastSaved(new Date());
      toast.success('Draft auto-saved');
    },
  });

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (bookData.title && bookData.description && !publishing) {
        saveDraftMutation.mutate(bookData);
      }
    }, 30000); // Auto-save after 30 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [bookData, publishing]);

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = (stepValidation, nextStep) => {
    const stepErrors = stepValidation(bookData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix the errors before continuing');
      return;
    }
    setErrors({});
    setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
    goToStep(nextStep);
  };

  const handlePublish = async (status) => {
    if (status === 'in_review') {
      const allErrors = validateAll(bookData);
      if (allErrors.length > 0) {
        toast.error('Please fix all errors before publishing');
        return;
      }
    }
    setPublishing(true);
    const payload = { ...bookData, status };
    if (payload.series_number === '' || payload.series_number === null || isNaN(payload.series_number)) {
      delete payload.series_number;
    } else {
      payload.series_number = Number(payload.series_number);
    }
    await base44.entities.Book.create(payload);
    setPublishing(false);
    toast.success(status === 'draft' ? 'Draft saved successfully!' : 'eBook submitted for publishing!');
    navigate('/');
  };

  const progressPct = ((completedSteps.length) / 4) * 100;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
      <div className="fixed top-0 right-0 w-[500px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[300px] bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex min-h-screen">

        {/* Left sidebar panel */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r bg-card/80 backdrop-blur-sm min-h-screen sticky top-0">
          {/* Brand */}
          <div className="px-6 py-5 border-b flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Classpedia</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Publishing Platform</p>
              </div>
            </Link>
          </div>

          {/* Publish header */}
          <div className="px-6 py-5 border-b">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">New Publication</p>
              {lastSaved && (
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <h2 className="text-base font-semibold">Publish Your eBook</h2>
            <p className="text-xs text-muted-foreground mt-1">Complete all 4 steps to submit for review</p>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                <span>{completedSteps.length} of 4 complete</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {/* Step list */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {STEP_INFO.map(({ step, label, icon: Icon, desc }) => {
              const isCompleted = completedSteps.includes(step);
              const isCurrent = currentStep === step;
              const isReachable = step === 1 || completedSteps.includes(step - 1) || isCompleted;
              return (
                <button
                  key={step}
                  onClick={() => isReachable && goToStep(step)}
                  disabled={!isReachable}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : isReachable
                          ? 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                          : 'opacity-40 cursor-not-allowed text-muted-foreground'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-primary-foreground/20' : isCompleted ? 'bg-emerald-100' : 'bg-secondary'
                  }`}>
                    {isCompleted
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      : <Icon className={`w-4 h-4 ${isCurrent ? 'text-primary-foreground' : ''}`} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none">{label}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isCurrent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{desc}</p>
                  </div>
                  <div className={`ml-auto text-[10px] font-bold shrink-0 ${isCurrent ? 'text-primary-foreground/60' : 'text-muted-foreground/40'}`}>
                    {step}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Tips */}
          <div className="px-5 py-5 border-t">
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
              <p className="text-xs font-semibold text-primary mb-1.5">💡 Publishing Tip</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {currentStep === 1 && 'A strong book description dramatically increases conversion. Take time to write a compelling blurb.'}
                {currentStep === 2 && 'Cover images are the #1 factor in click-through rate. Use high-resolution art that matches your genre.'}
                {currentStep === 3 && 'Books priced $2.99–$9.99 qualify for the 70% royalty plan — the highest available.'}
                {currentStep === 4 && 'Review time is typically 24–72 hours. You cannot edit your book while it\'s under review.'}
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="lg:hidden w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base font-semibold leading-none">
                    {STEP_INFO[currentStep - 1]?.label}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Step {currentStep} of 4</p>
                </div>
              </div>
              <Link
                to="/"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            {/* Mobile step progress */}
            <div className="lg:hidden px-4 sm:px-6 lg:px-8 pb-3">
              <div className="flex gap-2">
                {STEP_INFO.map(({ step }) => (
                  <div key={step} className={`flex-1 h-1 rounded-full transition-all ${
                    step < currentStep ? 'bg-emerald-500' : step === currentStep ? 'bg-primary' : 'bg-secondary'
                  }`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-3xl mx-auto w-full">
              <div className="bg-card border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
              {currentStep === 1 && (
                <BookDetailsStep data={bookData} onChange={updateData} errors={errors} onNext={() => handleNext(validateStep1, 2)} onSaveDraft={() => handlePublish('draft')} />
              )}
              {currentStep === 2 && (
                <ContentStep data={bookData} onChange={updateData} errors={errors} onNext={() => handleNext(validateStep2, 3)} onBack={() => goToStep(1)} onSaveDraft={() => handlePublish('draft')} />
              )}
              {currentStep === 3 && (
                <PricingStep data={bookData} onChange={updateData} errors={errors} onNext={() => handleNext(validateStep3, 4)} onBack={() => goToStep(2)} onSaveDraft={() => handlePublish('draft')} />
              )}
              {currentStep === 4 && (
                <ReviewStep data={bookData} onBack={() => goToStep(3)} onPublish={handlePublish} onEdit={goToStep} publishing={publishing} validationErrors={validateAll(bookData)} />
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}