import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, Mail, ShieldAlert
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/dashboard/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function SubmissionSuccess({ bookTitle }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const submittedDate = format(new Date(), 'MMMM d, yyyy');

  const { data: authorProfile } = useQuery({
    queryKey: ['author-profile'],
    queryFn: () => base44.entities.AuthorProfile.list(),
    select: d => d?.[0],
  });
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        activeTab="books"
        onTabChange={(tab) => navigate(`/?tab=${tab}`)}
        authorProfile={authorProfile}
        books={books}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30 px-6 lg:px-10 py-4 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none text-foreground">Submission Received</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your book is now in the review queue</p>
          </div>
        </div>

        {/* Page body */}
        <div
          className="flex-1 px-6 lg:px-10 py-10 transition-all duration-700 flex items-start justify-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          <div className="w-full max-w-xl space-y-4">

            {/* ── Hero Card ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-primary to-emerald-500" />
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                    <h1 className="text-xl font-bold text-foreground">Submission Received</h1>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Submitted for Review</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">"{bookTitle || 'Your book'}"</span> has been received and is now in our editorial review queue.
                  </p>
                  <div className="flex flex-wrap justify-center gap-5 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      Submitted {submittedDate}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      Review ETA: 3–5 business days
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Important Note ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 mb-1">Important Note</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Please avoid making changes to this book while it's under review unless Classpedia specifically requests them.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Confirmation Sent ── */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">Confirmation Sent</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    An email and in-app notification have been sent to confirm your submission.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-muted-foreground pt-2 pb-4">
              Questions? Contact author support at{' '}
              <span className="text-primary font-medium cursor-pointer hover:underline">support@classpedia.ai</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}