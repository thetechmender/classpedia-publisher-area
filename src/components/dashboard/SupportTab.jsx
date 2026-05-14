import React, { useState } from 'react';
import { HelpCircle, BookOpen, Mail, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqs = [
  { q: 'How long does it take for my book to be reviewed?', a: 'Books typically go through review within 24–72 hours. You will receive an email notification once a decision is made.' },
  { q: 'When will I receive my royalty payment?', a: 'Royalties are paid monthly, 30 days after the end of each calendar month, provided your balance exceeds the $10 minimum threshold.' },
  { q: 'Can I update my book after publishing?', a: 'Yes. You can upload a revised manuscript from the Book Detail page. Changes will go through a brief re-review before going live.' },
  { q: 'What file formats are accepted for manuscripts?', a: 'We accept EPUB, MOBI, and PDF formats. EPUB is recommended for the best reader experience.' },
  { q: 'How do I update my payment method?', a: 'Go to Author Profile → Payment section to change your bank account or PayPal details.' },
];

export default function SupportTab() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-1">Get help with your account, books, and payments.</p>
      </div>

      {/* Contact options */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Mail, title: 'Email Support', desc: "Send us a message and we'll respond within 24 hours.", cta: 'Send Email', href: 'mailto:support@classpedia.ai' },
          { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our support team during business hours.', cta: 'Start Chat', href: '#' },
          { icon: BookOpen, title: 'Help Center', desc: 'Browse our full documentation and guides.', cta: 'Visit Docs', href: 'https://classpedia.ai/help' },
        ].map(({ icon: Icon, title, desc, cta, href }) => (
          <div key={title} className="bg-card border rounded-xl p-5 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
            <a href={href} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full gap-1.5">
                {cta} <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y">
          {faqs.map((faq, i) => (
            <div key={i} className="px-5">
              <button
                className="w-full flex items-center justify-between py-4 text-left gap-4"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                }
              </button>
              {openFaq === i && (
                <p className="pb-4 text-sm text-muted-foreground">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}