import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Author Profile' },
  { id: 3, label: 'Payment Setup' },
  { id: 4, label: 'Tax & Signing' },
];

export default function SetupStepIndicator({ currentStep, completedSteps = [], onStepClick }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isPrevious = step.id < currentStep;
        // Clickable if it's a previously completed step OR the current step's immediate next (if completed)
        const maxReachable = Math.max(...completedSteps, 0) + 1;
        const isClickable = !isCurrent && step.id <= maxReachable;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 disabled:cursor-default disabled:hover:opacity-100 transition-opacity"
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                !isCompleted && !isCurrent && 'bg-secondary text-muted-foreground'
              )}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={cn(
                'text-[10px] font-medium whitespace-nowrap hidden sm:block',
                isCurrent ? 'text-foreground' : 'text-muted-foreground'
              )}>{step.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                'h-px flex-1 mx-2 mb-4 sm:mb-5 transition-colors',
                isPrevious ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}