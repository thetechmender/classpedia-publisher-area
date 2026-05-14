import React from 'react';
import { FileText, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TaxTab({ authorProfile }) {
  const hasFiledTax = !!(authorProfile?.tax_id && authorProfile?.tax_country);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Tax Information</h1>
        <p className="text-muted-foreground mt-1">Manage your tax forms and withholding details.</p>
      </div>

      {/* Status banner */}
      <div className={`rounded-xl p-4 flex items-center gap-4 border ${hasFiledTax ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        {hasFiledTax
          ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        }
        <div>
          <p className={`text-sm font-semibold ${hasFiledTax ? 'text-green-800' : 'text-amber-800'}`}>
            {hasFiledTax ? 'Tax form on file' : 'Tax form required'}
          </p>
          <p className={`text-xs mt-0.5 ${hasFiledTax ? 'text-green-700' : 'text-amber-700'}`}>
            {hasFiledTax
              ? 'Your tax information is complete. Royalties will be disbursed according to your withholding rate.'
              : 'Please complete your tax form to receive royalty payments without withholding.'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Tax Profile</h2>
        </div>
        <div className="divide-y">
          {[
            { label: 'Tax Country', value: authorProfile?.tax_country || '—' },
            { label: 'Tax ID Type', value: authorProfile?.tax_id_type?.toUpperCase() || '—' },
            { label: 'Tax ID', value: authorProfile?.tax_id ? `••••${authorProfile.tax_id.slice(-4)}` : '—' },
            { label: 'US Person', value: authorProfile?.us_person ? 'Yes' : 'No' },
          ].map(row => (
            <div key={row.label} className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span className="text-sm font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Withholding info */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Withholding & Compliance</h2>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm text-muted-foreground">
          <p>• US authors with a valid W-9 on file have <strong className="text-foreground">0% withholding</strong>.</p>
          <p>• Non-US authors may be subject to up to <strong className="text-foreground">30% withholding</strong> under IRS regulations unless a tax treaty applies.</p>
          <p>• Completed tax forms must be updated every 3 years or when your information changes.</p>
          <p>• Classpedia will issue a <strong className="text-foreground">1099 or equivalent</strong> form at year-end for earnings above $600.</p>
        </div>
      </div>
    </div>
  );
}