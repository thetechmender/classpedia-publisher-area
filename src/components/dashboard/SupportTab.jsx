import React, { useState } from 'react';
import { ChevronDown, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALL_FAQS = [
{
  q: 'How do I publish my eBook on Classpedia?',
  a: 'Use the "Publish New Book" flow to fill in your book details, upload your manuscript and cover, set your pricing, then click "Submit for Review." Our team will review your submission and publish it once approved.'
},
{
  q: 'How long does the review process take?',
  a: 'Once you submit your eBook for review, our management team will assess it and either approve or request changes. This typically takes 24–72 hours. You will be notified by email when a decision is made.'
},
{
  q: 'Can I edit my book after submitting it?',
  a: 'Yes. You can return to any book at any time using the "Edit in Publishing Form" option from your Books list or the Book Detail page. Edits to a published book will trigger a new review cycle before the changes go live.'
},
{
  q: 'What file formats are accepted for manuscripts?',
  a: 'We accept EPUB and PDF formats. EPUB is strongly recommended as it provides the best reading experience across devices.'
},
{
  q: 'How are royalties calculated and when are they paid?',
  a: "You earn 70% royalty per sale. Payments are sent monthly, approximately 60 days after the end of the month in which the sale occurred. You'll receive a payment once your balance exceeds the $10 minimum threshold."
},
{
  q: 'How do I update my payment information?',
  a: 'Go to Author Profile → Payment section in your dashboard to update your bank account details or PayPal email address.'
},
{
  q: 'What is Classpedia Select?',
  a: 'Classpedia Select is a 60-day exclusive program where your book is only available on Classpedia. In return, you get featured placement, advanced analytics, and can schedule up to 3 free promotion days within your enrollment window.'
},
{
  q: 'How do I change my author profile information?',
  a: 'Navigate to Author Profile in your dashboard to update your biography, contact information, and social media links.'
},
{
  q: 'Can I delete my book after publishing?',
  a: 'Yes, you can unpublish or request deletion of your book from the Books tab. Please note that this action is permanent and cannot be undone.'
}];


function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className={cn(
      'border rounded-xl transition-all duration-200',
      isOpen ?
      'bg-white border-primary/20 shadow-sm' :
      'bg-white border-border hover:border-primary/30 hover:shadow-sm'
    )}>
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
        onClick={onToggle}>
        
        <span className={cn(
          'text-sm font-medium transition-colors text-left',
          isOpen ? 'text-primary' : 'text-foreground'
        )}>
          {faq.q}
        </span>
        <span className={cn(
          'w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200',
          isOpen ?
          'bg-primary border-primary text-primary-foreground rotate-180' :
          'border-border text-muted-foreground bg-secondary/50'
        )}>
          <ChevronDown className="w-3.5 h-3.5" />
        </span>
      </button>
      {isOpen &&
      <div className="px-5 pb-4 pt-1">
          <div className="w-full h-px bg-border/60 mb-3" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {faq.a}
          </p>
        </div>
      }
    </div>);

}

export default function SupportTab() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="pt-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Help & Support</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Find answers to common questions or reach out to our team.
        </p>
      </div>

      {/* Direct Email Card */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Email Support</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Response within 24 hours on business days
              </p>
            </div>
          </div>
          <a
            href="mailto:support@classpedia.ai"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap">
            
            Open Email
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pt-1">
          <h3 className="text-base font-semibold text-foreground">Frequently Asked Questions</h3>
          

          
        </div>
        
        <div className="space-y-2.5">
          {ALL_FAQS.map((faq, i) =>
          <FaqItem
            key={i}
            faq={faq}
            isOpen={openFaq === i}
            onToggle={() => setOpenFaq(openFaq === i ? null : i)} />

          )}
        </div>
      </div>
    </div>);

}