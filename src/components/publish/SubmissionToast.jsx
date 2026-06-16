import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, X } from 'lucide-react';

export default function SubmissionToast({ bookTitle, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = setTimeout(() => setVisible(true), 50);
    return () => { clearTimeout(enter); };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 350);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 transition-all duration-350 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
      }}
    >
      <div className="flex items-start gap-3.5 bg-white border border-border rounded-2xl shadow-2xl p-4 max-w-sm w-full">
        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-foreground leading-none">Submission Received</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 leading-none">
              In Review
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            <span className="font-medium text-foreground">"{bookTitle || 'Your book'}"</span> is now in the editorial review queue.
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            Review ETA: 3–5 business days
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>


    </div>
  );
}