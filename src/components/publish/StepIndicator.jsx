import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  // { id: 1, label: 'Book Details' },
  { id: 2, label: 'Content' },
  { id: 3, label: 'Pricing' },
  { id: 4, label: 'Review & Publish' },
];

export default function StepIndicator({ currentStep, completedSteps = [] }) {
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-border z-0" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-primary z-0 transition-all duration-500"
          style={{ width: `${((Math.max(currentStep - 1, 0)) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center z-10 relative">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2',
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-background border-primary text-primary shadow-lg shadow-primary/20'
                    : 'bg-background border-border text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span
                className={cn(
                  'mt-2.5 text-xs font-medium tracking-wide whitespace-nowrap',
                  isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}