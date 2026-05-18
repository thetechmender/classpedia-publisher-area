import React from 'react';
import { AlertCircle } from 'lucide-react';

const FIELD_LABELS = {
  // Step 1
  full_name: 'Full name',
  country: 'Country',
  address_line1: 'Street address',
  city: 'City',
  zip: 'Postal code',
  date_of_birth: 'Date of birth',
  phone: 'Phone number',
  // Step 2
  company_name: 'Company name',
  bank_country: 'Bank country',
  bank_account_number: 'Bank account number',
  bank_account_number_confirm: 'Confirm account number',
  bank_routing_number: 'Routing number',
  // Step 3
  us_person: 'U.S. tax status',
  tax_id: 'Tax ID (TIN)',
  tax_certified: 'Tax certification',
};

export default function ValidationSummary({ errors }) {
  const entries = Object.entries(errors || {});
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-5 py-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
        <p className="text-sm font-semibold text-destructive">Please complete the following before continuing:</p>
      </div>
      <ul className="space-y-1 ml-6 list-disc">
        {entries.map(([field, msg]) => (
          <li key={field} className="text-xs text-destructive">
            <span className="font-medium">{FIELD_LABELS[field] || field}</span> — {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}