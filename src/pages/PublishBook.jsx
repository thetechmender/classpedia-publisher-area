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
import Sidebar from '@/components/dashboard/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Tag, Upload, DollarSign, Eye } from 'lucide-react';
import SubmissionToast from '@/components/publish/SubmissionToast';

const validateStep1 = (data) => {
  const errors = {};
  if (!data.title?.trim()) errors.title = 'Book title is required';
  if (!data.author_name?.trim()) errors.author_name = 'Author name is required';
  if (!data.description?.trim()) errors.description = 'Description is required';
  else if (data.description.trim().length < 50) errors.description = 'Description must be at least 50 characters';
  else if (data.description.trim().length > 4000) errors.description = 'Description cannot exceed 4,000 characters';
  if (!data.language) errors.language = 'Please select a language';
  if (!data.categories || data.categories.length === 0) errors.categories = 'Please select at least one category';
  if (!data.keywords || data.keywords.length === 0) errors.keywords = 'Please add at least one keyword';
  if (data.preorder_type === 'preorder' && !data.preorder_date) {
    errors.preorder_date = 'Please set a pre-order release date';
  }
  return errors;
};

const validateStep2 = (data) => {
  const errors = {};
  if (!data.manuscript_url) errors.manuscript_url = 'Please upload your manuscript';
  if (!data.cover_url) errors.cover_url = 'Please upload a front cover image';
  if (!data.back_cover_url) errors.back_cover_url = 'Please upload a back cover image';
  if (!data.spine_url) errors.spine_url = 'Please upload a spine image';
  if (!data.sample_page_end) errors.sample_page_end = 'Please select a sample chapter range';
  return errors;
};

const validateStep3 = (data) => {
  const errors = {};
  if (!data.list_price || data.list_price <= 0) {
    errors.list_price = 'Please enter a valid price';
  } else if (data.list_price < 1.99) {
    errors.list_price = 'Price must be at least $1.99';
  } else if (data.list_price > 49.99) {
    errors.list_price = 'Price cannot exceed $49.99';
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
  if (!data.cover_url) errors.push('Front cover image is required');
  if (!data.back_cover_url) errors.push('Back cover image is required');
  if (!data.spine_url) errors.push('Spine image is required');
  if (!data.sample_page_end) errors.push('Sample chapter range is required');
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
  const editBookId = new URLSearchParams(window.location.search).get('bookId');

  const { data: authorProfile } = useQuery({ queryKey: ['author-profile'], queryFn: () => base44.entities.AuthorProfile.list(), select: d => d?.[0] });
  const { data: books = [] } = useQuery({ queryKey: ['books'], queryFn: () => base44.entities.Book.list() });
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [initialized, setInitialized] = useState(!editBookId);
  const [previewApproved, setPreviewApproved] = useState(false);
  const [bookData, setBookData] = useState({
    language: 'English',
    territories: 'worldwide',
    currency: 'USD',
    drm: true,
    age_range: 'not_specified',
    keywords: [],
    categories: [],
    contributors: [],
  });
  const [lastSaved, setLastSaved] = useState(null);

  const saveTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Load existing book when editing
  useEffect(() => {
    if (editBookId && books.length > 0 && !initialized) {
      const existing = books.find(b => b.id === editBookId);
      if (existing) {
        setBookData({
          language: 'English',
          territories: 'worldwide',
          currency: 'USD',
          drm: false,
          keywords: [],
          categories: [],
          contributors: [],
          ...existing,
          _editId: existing.id,
        });
      }
      setInitialized(true);
    }
  }, [editBookId, books, initialized]);

  const updateData = useCallback((updates) => {
    setBookData(prev => ({ ...prev, ...updates }));
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach(key => delete clearedErrors[key]);
    setErrors(clearedErrors);
  }, [errors]);

  // Auto-save draft every 30 seconds
  const saveDraftMutation = useMutation({
    mutationFn: async (data) => {
      const { _editId, ...payload } = data;
      if (_editId) {
        return await base44.entities.Book.update(_editId, payload);
      }
      const existing = await base44.entities.Book.filter({ title: data.title, status: 'draft' });
      if (existing && existing.length > 0) {
        return await base44.entities.Book.update(existing[0].id, payload);
      }
      return await base44.entities.Book.create({ ...payload, status: 'draft' });
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
  };

  // Scroll to top when step changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = 0;
    }
  }, [currentStep]);

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
    const { _editId, ...rest } = bookData;
    const payload = { ...rest, status };
    if (payload.series_number === '' || payload.series_number === null || isNaN(payload.series_number)) {
      delete payload.series_number;
    } else {
      payload.series_number = Number(payload.series_number);
    }
    if (_editId) {
      await base44.entities.Book.update(_editId, payload);
    } else {
      await base44.entities.Book.create(payload);
    }
    setPublishing(false);
    queryClient.invalidateQueries({ queryKey: ['books'] });
    if (status === 'draft') {
      toast.success('Draft saved successfully!');
      navigate('/');
    } else {
      navigate('/', { state: { submittedBook: bookData.title } });
    }
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

      <div className="relative flex min-h-screen overflow-hidden">

        <Sidebar
          activeTab="books"
          onTabChange={(tab) => navigate(`/?tab=${tab}`)}
          authorProfile={authorProfile}
          books={books}
        />

        {/* Main content */}
        <div ref={scrollContainerRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
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
              <StepIndicator currentStep={currentStep} completedSteps={completedSteps} onStepClick={goToStep} />
              <div className="bg-card border rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm">
              {currentStep === 1 && (
                <BookDetailsStep data={bookData} onChange={updateData} errors={errors} onNext={() => handleNext(validateStep1, 2)} />
              )}
              {currentStep === 2 && (
                <ContentStep data={bookData} onChange={updateData} errors={errors} onNext={() => handleNext(validateStep2, 3)} onBack={() => goToStep(1)} previewApproved={previewApproved} onApprove={() => setPreviewApproved(true)} />
              )}
              {currentStep === 3 && (
                <PricingStep data={bookData} onChange={updateData} errors={errors} onNext={() => handleNext(validateStep3, 4)} onBack={() => goToStep(2)} />
              )}
              {currentStep === 4 && (
                <ReviewStep data={bookData} onBack={() => goToStep(3)} onPublish={handlePublish} onEdit={goToStep} publishing={publishing} validationErrors={validateAll(bookData)} previewApproved={previewApproved} onApprove={() => setPreviewApproved(true)} />
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}