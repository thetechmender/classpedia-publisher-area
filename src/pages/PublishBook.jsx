import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
// @ts-ignore
import { PublishBookService, getApiError } from '@/services/publishBook.service';
// @ts-ignore
import StepIndicator from '@/components/publish/StepIndicator';
import BookDetailsStep from '@/components/publish/BookDetailsStep';
import ContentStep from '@/components/publish/ContentStep';
import PricingStep from '@/components/publish/PricingStep';
import ReviewStep from '@/components/publish/ReviewStep';
import {
  // @ts-ignore
  BookOpen, ArrowLeft, ChevronLeft, CheckCircle2, Upload, DollarSign, Eye,
  // @ts-ignore
  FileText, Image, Tag, Clock, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const validateStep1 = (data) => {
  const errors = {};
  if (!data.title?.trim()) errors.title = 'Book title is required';
  if (!data.authorName?.trim()) errors.authorName = 'Author name is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  else if (data.description.trim().length < 50) errors.description = 'Description must be at least 50 characters';
  else if (data.description.trim().length > 4000) errors.description = 'Description cannot exceed 4,000 characters';
  if (!data.language) errors.language = 'Please select a language';
  if (!data.keywords || data.keywords.length === 0) errors.keywords = 'Please add at least one keyword';
  if (!data.categories || data.categories.length === 0) errors.categories = 'Please select at least one category';
  if (data.preorderType === 'preorder' && !data.preorderDate) {
    errors.preorderDate = 'Please set a pre-order release date';
  }
  return errors;
};

const validateStep2 = (data) => {
  const errors = {};
  if (!data.manuscript_url) errors.manuscript_url = 'Please upload your manuscript';
  if (!data.coverUrl) errors.coverUrl = 'Please upload a cover image';
  if (!data.totalPages || data.totalPages <= 0) errors.totalPages = 'Please enter the total number of pages';
  if (data.aiGenerated == null) errors.aiGenerated = 'Please indicate whether you used AI tools';
  return errors;
};

const validateStep3 = (data) => {
  const errors = {};
  if (!data.listPrice || data.listPrice <= 0) {
    errors.listPrice = 'Please enter a valid price';
  } else if (data.listPrice < 1.99) {
    errors.listPrice = 'Price must be at least $1.99';
  } else if (data.listPrice > 199.99) {
    errors.listPrice = 'Price cannot exceed $199.99';
  }
  if (data.territories === 'specific' && (!data.selectedCountries || data.selectedCountries.length === 0)) {
    errors.territories = 'Please select at least one country';
  }
  return errors;
};

const validateAll = (data) => {
  const errors = [];
  if (!data.title?.trim()) errors.push('Book title is required');
  if (!data.authorName?.trim()) errors.push('Author name is required');
  if (!data.description?.trim()) errors.push('Description is required');
  else if (data.description.trim().length < 50) errors.push('Description must be at least 50 characters');
  else if (data.description.trim().length > 4000) errors.push('Description cannot exceed 4,000 characters');
  if (!data.language) errors.push('Language is required');
  if (!data.manuscript_url) errors.push('Manuscript upload is required');
  if (!data.coverUrl) errors.push('Cover image is required');
  if (!data.listPrice || data.listPrice <= 0) errors.push('Valid price is required');
  return errors;
};

const STEP_INFO = [
  { step: 1, label: 'Book Details', icon: Tag, desc: 'Title, author, description, categories' },
  { step: 2, label: 'Content', icon: Upload, desc: 'Manuscript, cover, sample chapter' },
  { step: 3, label: 'Pricing', icon: DollarSign, desc: 'Price, royalties, territories' },
  { step: 4, label: 'Review', icon: Eye, desc: 'Final check before submission' },
];

const DRAFT_STORAGE_KEY = 'classpedia_book_draft';
const DRAFT_EXPIRY_DAYS = 7; // Drafts expire after 7 days

export default function PublishBook() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [bookData, setBookData] = useState({
    language: null,
    territories: 'worldwide',
    currency: 'USD',
    drm: false,
    ageRange: 'not_specified',
    keywords: [],
    categories: [],
    contributors: [],
  });
  const [lastSaved, setLastSaved] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [contentProgress, setContentProgress] = useState({ done: 0, total: 0 });
  const [draftRestored, setDraftRestored] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!stored) return;

        const draft = JSON.parse(stored);
        
        // Check if draft has expired
        if (draft.expiresAt && new Date(draft.expiresAt) < new Date()) {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
          return;
        }

        // Restore draft data
        if (draft.bookData) {
          setBookData(draft.bookData);
          setCurrentStep(draft.currentStep || 1);
          setCompletedSteps(draft.completedSteps || []);
          setLastSaved(draft.lastSaved ? new Date(draft.lastSaved) : null);
          setDraftRestored(true);
          toast.success('Draft restored! Continue where you left off.', {
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    };

    loadDraft();
  }, []);

  // Save draft to localStorage whenever bookData changes
  useEffect(() => {
    // Don't save if we just restored (prevent immediate overwrite)
    if (!draftRestored && Object.keys(bookData).length <= 7) return;

    // Only save if there's meaningful data
    if (!bookData.title && !bookData.description && !bookData.bookId) return;

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + DRAFT_EXPIRY_DAYS);

      const draft = {
        bookData,
        currentStep,
        completedSteps,
        lastSaved: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
      // If localStorage is full, try to clear old draft
      if (error.name === 'QuotaExceededError') {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        toast.error('Storage full. Please clear browser data.');
      }
    }
  }, [bookData, currentStep, completedSteps, draftRestored]);

  const updateData = useCallback((updates) => {
    setBookData(prev => ({ ...prev, ...updates }));
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach(key => delete clearedErrors[key]);
    setErrors(clearedErrors);
  }, [errors]);

  // Auto-save draft every 30 seconds
  const saveDraftMutation = useMutation({
    mutationFn: async (data) => {
      // @ts-ignore
      const existing = await base44.entities.Book.filter({ title: data.title, status: 'draft' });
      if (existing && existing.length > 0) {
        return await base44.entities.Book.update(existing[0].id, data);
      }
      // @ts-ignore
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
      // @ts-ignore
      if (bookData.title && bookData.description && !publishing) {
        // @ts-ignore
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

  // Build Step 1 payload (book details)
  const buildStep1Payload = (data) => {
    const preorderType = data.preorderType || 'release_now';
    const payload = {
      title: data.title || '',
      subtitle: data.subtitle || '',
      seriesName: data.seriesName || '',
      seriesNumber: data.seriesNumber || null,
      editionNumber: data.editionNumber || '',
      authorFirstName: data.authorFirstName || '',
      authorName: data.authorName || '',
      authorLastName: data.authorLastName || '',
      description: data.description || '',
      language: data.language || '',
      categories: data.categories || [],
      contributors: data.contributors || [],
      keywords: data.keywords || [],
      readingAgeMin: data.readingAgeMin || '',
      readingAgeMax: data.readingAgeMax || '',
      ageRange: data.ageRange || '',
      preorderType,
      preorderDate: preorderType === 'preorder' ? (data.preorderDate || null) : null,
    };
    if (payload.seriesNumber === '' || payload.seriesNumber === null || isNaN(Number(payload.seriesNumber))) {
      delete payload.seriesNumber;
    } else {
      payload.seriesNumber = Number(payload.seriesNumber);
    }
    return payload;
  };

  // Build Step 2 payload (content metadata)
  const buildStep2Payload = (data, bookId) => ({
    bookId,
    drm: !!data.drm,
    coverUrl: data.coverUrl || '',
    backCoverUrl: data.backCoverUrl || '',
    spineUrl: data.spineUrl || '',
    aiGenerated: !!data.aiGenerated,
    isbn: data.isbn || '',
    samplePageStart: data.samplePageStart || null,
    samplePageEnd: data.samplePageEnd || null,
    totalPages: data.totalPages || null,
  });

  // Build Step 3 payload (pricing)
  const buildStep3Payload = (data, bookId) => ({
    bookId,
    listPrice: parseFloat(data.listPrice) || 0,
    territories: data.territories || 'worldwide',
    isBookEnroll: !!data.isBookEnroll,
    selectedCountries: data.selectedCountries || [],
  });

  // Generic flow: validate -> call api -> on success advance step
  const runStep = async (stepValidation, apiCall, nextStep) => {
    console.log('runStep starting', { currentStep, nextStep });
    const stepErrors = stepValidation(bookData);
    console.log('Validation errors', stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      toast.error('Please fix the errors before continuing');
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await apiCall();
      console.log('API call succeeded, advancing to step', nextStep);
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      goToStep(nextStep);
    } catch (err) {
      console.error('API call failed', err);
      toast.error(getApiError(err, 'Failed to save step. Please try again.'));
    } finally {
      console.log('runStep completed, setting submitting false');
      setSubmitting(false);
    }
  };

  // Step 1 — book details
  const handleStep1Next = () => runStep(
    validateStep1,
    async () => {
      const payload = buildStep1Payload(bookData);
      console.log('Step 1 payload:', payload);
      const res = await PublishBookService.step1(payload);
      console.log('Step 1 response:', res);
      const bookId = res?.data?.bookId ?? res?.bookId;
      console.log('Extracted bookId:', bookId);
      if (!bookId) throw new Error(res?.errorMessage || 'Could not create book');
      updateData({ bookId });
      toast.success('Book details saved');
    },
    2,
  );

  // Step 2 — content (chapters loop in batches of 3, then step2 API)
  const handleStep2Next = () => runStep(
    validateStep2,
    async () => {
      const bookId = bookData.bookId;
      if (!bookId) throw new Error('Missing bookId — please redo Step 1');

      const structure = bookData.manuscriptStructure;
      const chapters = structure?.chapters || [];
      if (!chapters.length) throw new Error('Manuscript chapters are missing');

      const BATCH = 3;
      const total = Math.ceil(chapters.length / BATCH);
      setContentProgress({ done: 0, total });

      for (let i = 0; i < chapters.length; i += BATCH) {
        const chunk = chapters.slice(i, i + BATCH);
        const contentPayload = {
          bookId,
          manuscriptFilename: bookData.manuscriptFilename || '',
          manuscriptStructure: {
            bookId: structure.bookId,
            title: structure.title,
            chapters: chunk,
          },
        };
        await PublishBookService.publishBookContent(contentPayload);
        setContentProgress({ done: Math.min(i / BATCH + 1, total), total });
      }

      // After all chapter batches succeed -> step2 metadata
      await PublishBookService.step2(buildStep2Payload(bookData, bookId));
      toast.success('Content uploaded');
      setContentProgress({ done: 0, total: 0 });
    },
    3,
  );

  // Step 3 — pricing
  const handleStep3Next = () => runStep(
    validateStep3,
    async () => {
      const bookId = bookData.bookId;
      if (!bookId) throw new Error('Missing bookId — please redo Step 1');
      await PublishBookService.step3(buildStep3Payload(bookData, bookId));
      toast.success('Pricing saved');
    },
    4,
  );

  const handlePublish = async (status) => {
    if (status === 'in_review') {
      const allErrors = validateAll(bookData);
      if (allErrors.length > 0) {
        toast.error('Please fix all errors before publishing');
        return;
      }
    }
    const bookId = bookData.bookId;
    if (!bookId) {
      toast.error('Missing bookId — please complete previous steps first');
      return;
    }
    setPublishing(true);
    try {
      if (status === 'draft') {
        // Local draft save fallback
        // @ts-ignore
        await base44.entities.Book.create({ ...bookData, status });
        toast.success('Draft saved successfully!');
        // Clear localStorage draft after successful save
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        navigate('/');
        return;
      }
      // Final submission
      await PublishBookService.step4({ bookId });
      toast.success('eBook submitted for review!');
      // Clear localStorage draft after successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      navigate('/books', { state: { statusFilter: 'in_review' } });
    } catch (err) {
      toast.error(getApiError(err, 'Failed to submit for review'));
    } finally {
      setPublishing(false);
    }
  };

  // Clear draft function (for manual clearing)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setBookData({
      language: null,
      territories: 'worldwide',
      currency: 'USD',
      drm: false,
      ageRange: 'not_specified',
      keywords: [],
      categories: [],
      contributors: [],
    });
    setCurrentStep(1);
    setCompletedSteps([]);
    setLastSaved(null);
    toast.success('Draft cleared');
  }, []);

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
          <div className="px-6 py-5 border-b flex items-center justify-between">
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
                  <Save className="w-3 h-3" /> Auto-saved
                </p>
              )}
            </div>
            <h2 className="text-base font-semibold">Publish Your eBook</h2>
            <p className="text-xs text-muted-foreground mt-1">Complete all 4 steps to submit for review</p>
            
            {/* Draft restored indicator */}
            {draftRestored && bookData.title && (
              <div className="mt-3 flex items-center justify-between gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-blue-900 truncate">{bookData.title}</p>
                    <p className="text-[10px] text-blue-600">Draft in progress</p>
                  </div>
                </div>
                <button
                  onClick={clearDraft}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium shrink-0 underline"
                >
                  Start Over
                </button>
              </div>
            )}
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
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${isCurrent
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : isReachable
                          ? 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                          : 'opacity-40 cursor-not-allowed text-muted-foreground'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isCurrent ? 'bg-primary-foreground/20' : isCompleted ? 'bg-emerald-100' : 'bg-secondary'
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
                to="/dashboard"
              >
                <Button size="sm" className="gap-1.5 h-8 text-xs px-3">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            {/* Mobile step progress */}
            <div className="lg:hidden px-4 sm:px-6 lg:px-8 pb-3">
              <div className="flex gap-2">
                {STEP_INFO.map(({ step }) => (
                  <div key={step} className={`flex-1 h-1 rounded-full transition-all ${step < currentStep ? 'bg-emerald-500' : step === currentStep ? 'bg-primary' : 'bg-secondary'
                    }`} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-3xl mx-auto w-full">
              <div className="bg-card border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
                {currentStep === 1 && (
                  <BookDetailsStep data={bookData} onChange={updateData} errors={errors} onNext={handleStep1Next} submitting={submitting} />
                )}
                {currentStep === 2 && (
                  <ContentStep data={bookData} onChange={updateData} errors={errors} onNext={handleStep2Next} onBack={() => goToStep(1)} submitting={submitting} contentProgress={contentProgress} />
                )}
                {currentStep === 3 && (
                  <PricingStep data={bookData} onChange={updateData} errors={errors} onNext={handleStep3Next} onBack={() => goToStep(2)} submitting={submitting} />
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