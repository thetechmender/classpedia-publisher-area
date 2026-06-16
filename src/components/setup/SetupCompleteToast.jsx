import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, User } from 'lucide-react';

export default function SetupCompleteToast({ authorName, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(enter);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
      }}
    >
      <div className="flex items-start gap-4 bg-white border border-border rounded-2xl shadow-2xl p-5 w-96">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-primary/20">
          <User className="w-5 h-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-foreground leading-tight">Welcome to Classpedia!</p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
            {authorName
              ? <><span className="font-semibold text-foreground">{authorName}</span>, your author account is ready.</>
              : 'Your author account is ready.'
            }
            {' '}Start publishing books and earning royalties.
          </p>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}