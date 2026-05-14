import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import StepIndicator from '@/components/publish/StepIndicator';
import BookDetailsStep from '@/components/publish/BookDetailsStep';
import ContentStep from '@/components/publish/ContentStep';
import PricingStep from '@/components/publish/PricingStep';
import ReviewStep from '@/components/publish/ReviewStep';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const validateStep1 = (data) => {
  const errors = {};
  if (!data.title?.trim()) errors.title = 'Book title is required';
  if (!data.author_name?.trim()) errors.author_name = 'Author name is required';
  if (!data.description?.trim()) errors.description = 'Description is required';else
  if (data.description.length > 4000) errors.description = 'Description must be under 4,000 characters';
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
  if (!data.language) errors.push('Language is required');
  if (!data.manuscript_url) errors.push('Manuscript upload is required');
  if (!data.cover_url) errors.push('Cover image is required');
  if (!data.list_price || data.list_price <= 0) errors.push('Valid price is required');
  return errors;
};

export default function PublishBook() {
  const navigate = useNavigate();
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
    contributors: []
  });

  const updateData = useCallback((updates) => {
    setBookData((prev) => ({ ...prev, ...updates }));
    // Clear related errors
    const clearedErrors = { ...errors };
    Object.keys(updates).forEach((key) => delete clearedErrors[key]);
    setErrors(clearedErrors);
  }, [errors]);

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
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
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
    await base44.entities.Book.create({ ...bookData, status });
    setPublishing(false);
    toast.success(status === 'draft' ? 'Draft saved successfully!' : 'eBook submitted for publishing!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Publish A Boo</h1>
              <p className="text-xs text-muted-foreground">Classpedia Publishing</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          {currentStep === 1 &&
          <BookDetailsStep
            data={bookData}
            onChange={updateData}
            errors={errors}
            onNext={() => handleNext(validateStep1, 2)} />

          }
          {currentStep === 2 &&
          <ContentStep
            data={bookData}
            onChange={updateData}
            errors={errors}
            onNext={() => handleNext(validateStep2, 3)}
            onBack={() => goToStep(1)} />

          }
          {currentStep === 3 &&
          <PricingStep
            data={bookData}
            onChange={updateData}
            errors={errors}
            onNext={() => handleNext(validateStep3, 4)}
            onBack={() => goToStep(2)} />

          }
          {currentStep === 4 &&
          <ReviewStep
            data={bookData}
            onBack={() => goToStep(3)}
            onPublish={handlePublish}
            onEdit={goToStep}
            publishing={publishing}
            validationErrors={validateAll(bookData)} />

          }
        </div>
      </div>
    </div>);

}