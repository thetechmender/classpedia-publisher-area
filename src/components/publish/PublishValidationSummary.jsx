import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function PublishValidationSummary({ errors }) {
  const errorList = Object.values(errors).filter(Boolean);
  if (errorList.length === 0) return null;

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
        <p className="text-sm font-semibold text-destructive">Please fix the following before continuing:</p>
      </div>
      <ul className="space-y-1 pl-6 list-disc">
        {errorList.map((msg, i) => (
          <li key={i} className="text-xs text-destructive">{msg}</li>
        ))}
      </ul>
    </div>
  );
}