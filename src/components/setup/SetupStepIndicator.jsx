import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Create Account' },
  { id: 2, label: 'Your Identity' },
  { id: 3, label: 'Account & Payment' },
  { id: 4, label: 'Tax Information' },
  { id: 5, label: 'Author Profile' },
];

export default function SetupStepIndicator({ currentStep, completedSteps = [] }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isUpcoming = !isCompleted && !isCurrent;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                isCompleted && 'bg-primary text-primary-foreground',
                isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                isUpcoming && 'bg-secondary text-muted-foreground'
              )}>
                {isCompleted ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className={cn(
                'text-[10px] font-medium whitespace-nowrap hidden sm:block',
                isCurrent ? 'text-foreground' : 'text-muted-foreground'
              )}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                'h-px flex-1 mx-2 mb-4 sm:mb-5 transition-colors',
                completedSteps.includes(step.id) ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}