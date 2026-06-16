import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ValidationSummary — shown above the "Next/Continue" button when there are errors.
 * Pass `errors` as either:
 *   - an object: { field: "message", ... }  (step components)
 *   - an array:  ["message", ...]            (publish review)
 */
export default function ValidationSummary({ errors, className }) {
  if (!errors) return null;

  const messages = Array.isArray(errors)
    ? errors
    : Object.values(errors).filter(Boolean);

  if (messages.length === 0) return null;

  return (
    <div className={cn(
      'rounded-xl border border-destructive/30 bg-destructive/5 p-4',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive mb-2">
            {messages.length === 1
              ? 'Please fix 1 issue before continuing'
              : `Please fix ${messages.length} issues before continuing`}
          </p>
          <ul className="space-y-1">
            {messages.map((msg, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-destructive/80">
                <X className="w-3 h-3 mt-0.5 shrink-0 text-destructive" />
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}