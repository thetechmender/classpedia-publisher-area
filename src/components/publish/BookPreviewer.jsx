import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Monitor, Smartphone, Tablet, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PREVIEW_PAGES = [
  { type: 'cover' },
  { type: 'title' },
  { type: 'toc' },
  { type: 'chapter', num: 1 },
  { type: 'chapter', num: 2 },
  { type: 'back' },
];

function PageContent({ page, book }) {
  if (page.type === 'cover') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
        {book.cover_url ? (
          <img src={book.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
            />
            <BookOpen className="w-16 h-16 text-white/40 mb-6" />
            <h1 className="text-2xl font-bold text-white text-center px-8 leading-tight">{book.title || 'Your Book Title'}</h1>
            {book.subtitle && <p className="text-sm text-white/60 mt-2 px-8 text-center">{book.subtitle}</p>}
            <div className="absolute bottom-8 text-center">
              <p className="text-sm text-white/70 font-medium">{book.author_name || 'Author Name'}</p>
              <p className="text-xs text-white/40 mt-1">Published on Classpedia</p>
            </div>
          </>
        )}
      </div>
    );
  }

  if (page.type === 'title') {
    return (
      <div className="w-full h-full bg-white flex flex-col items-center justify-center px-12 py-16">
        <div className="text-center max-w-xs">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-8">Classpedia Edition</p>
          <h1 className="text-3xl font-serif font-bold text-slate-800 leading-tight mb-3">{book.title || 'Your Book Title'}</h1>
          {book.subtitle && <p className="text-lg text-slate-500 font-serif mb-8">{book.subtitle}</p>}
          <div className="w-12 h-0.5 bg-slate-300 mx-auto mb-8" />
          <p className="text-base text-slate-600 font-medium">{book.author_name || 'Author Name'}</p>
          {(book.contributors || []).length > 0 && (
            <div className="mt-3">
              {book.contributors.slice(0, 2).map((c, i) => (
                <p key={i} className="text-xs text-slate-400">{c.role}: {c.name}</p>
              ))}
            </div>
          )}
          <div className="mt-auto pt-16">
            <p className="text-xs text-slate-300">© {new Date().getFullYear()} {book.author_name || 'Author'} · All rights reserved</p>
          </div>
        </div>
      </div>
    );
  }

  if (page.type === 'toc') {
    return (
      <div className="w-full h-full bg-white px-10 py-12">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Table of Contents</h2>
        <div className="space-y-4">
          {['Introduction', 'Chapter One', 'Chapter Two', 'Chapter Three', 'About the Author'].map((ch, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm text-slate-700 flex-1 font-medium">{ch}</span>
              <span className="text-xs text-slate-300 flex-shrink-0">{(i + 1) * 12}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-300 absolute bottom-8 left-10">{book.title}</p>
      </div>
    );
  }

  if (page.type === 'chapter') {
    const loremLines = [
      'This is a preview of your eBook content as it will appear to readers on Classpedia.',
      'The actual content will render based on your uploaded manuscript file.',
      '',
      'Typography is optimized for comfortable reading across all screen sizes and devices.',
      'Line spacing, font size, and margins are carefully tuned for readability.',
      '',
      'Readers can adjust font size, background color, and reading mode in the Classpedia reader app.',
    ];
    return (
      <div className="w-full h-full bg-white px-10 py-12">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">{book.title}</p>
        <h2 className="text-xl font-serif font-bold text-slate-800 mb-6">Chapter {page.num}</h2>
        <div className="space-y-3">
          {loremLines.map((line, i) =>
            line === '' ? <div key={i} className="h-2" /> : (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">{line}</p>
            )
          )}
        </div>
        <p className="text-[10px] text-slate-300 absolute bottom-8 right-10">{(page.num * 12)}</p>
      </div>
    );
  }

  if (page.type === 'back') {
    return (
      <div className="w-full h-full bg-gradient-to-b from-slate-700 to-slate-900 flex flex-col items-center justify-center px-10">
        {book.cover_url ? (
          <img src={book.cover_url} alt="Back cover" className="w-20 h-28 object-cover rounded shadow-lg mb-6 opacity-60" />
        ) : (
          <BookOpen className="w-12 h-12 text-white/20 mb-6" />
        )}
        <p className="text-sm text-white/70 text-center leading-relaxed max-w-xs font-serif italic">
          "{book.description ? book.description.slice(0, 160) + (book.description.length > 160 ? '…' : '') : 'Your book description will appear here on the back cover.'}"
        </p>
        <div className="absolute bottom-8 flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-white/50 font-medium">Classpedia</span>
        </div>
      </div>
    );
  }

  return null;
}

export default function BookPreviewer({ book, onClose }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(null); // 'next' | 'prev'
  const [device, setDevice] = useState('tablet');

  const totalPages = PREVIEW_PAGES.length;

  const goNext = () => {
    if (currentPage >= totalPages - 1 || flipping) return;
    setFlipping('next');
    setTimeout(() => {
      setCurrentPage(p => p + 1);
      setFlipping(null);
    }, 350);
  };

  const goPrev = () => {
    if (currentPage <= 0 || flipping) return;
    setFlipping('prev');
    setTimeout(() => {
      setCurrentPage(p => p - 1);
      setFlipping(null);
    }, 350);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, flipping]);

  const deviceSizes = {
    desktop: { width: 'w-[480px]', height: 'h-[640px]', label: 'Desktop' },
    tablet: { width: 'w-[380px]', height: 'h-[520px]', label: 'Tablet' },
    mobile: { width: 'w-[260px]', height: 'h-[420px]', label: 'Mobile' },
  };
  const size = deviceSizes[device];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex flex-col items-center gap-6 w-full max-h-screen overflow-auto py-8" onClick={e => e.stopPropagation()}>

        {/* Top Bar */}
        <div className="flex items-center justify-between w-full max-w-3xl px-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{book.title || 'Book Preview'}</p>
              <p className="text-white/50 text-xs">Classpedia eBook Preview</p>
            </div>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {[
              { key: 'desktop', Icon: Monitor },
              { key: 'tablet', Icon: Tablet },
              { key: 'mobile', Icon: Smartphone },
            ].map(({ key, Icon }) => (
              <button
                key={key}
                onClick={() => setDevice(key)}
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                  device === key ? 'bg-white text-slate-800' : 'text-white/50 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Book + Navigation Row */}
        <div className="flex items-center gap-6">
          {/* Prev Button */}
          <button
            onClick={goPrev}
            disabled={currentPage === 0 || !!flipping}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Book */}
          <div className={cn('relative shadow-2xl rounded-lg overflow-hidden', size.width, size.height)}
            style={{ perspective: '1200px' }}>

            {/* Book shadow / spine effect */}
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/30 to-transparent z-10 pointer-events-none rounded-l-lg" />

            {/* Flip animation wrapper */}
            <div
              className={cn(
                'w-full h-full transition-all duration-350',
                flipping === 'next' && 'opacity-0 scale-x-95 origin-right',
                flipping === 'prev' && 'opacity-0 scale-x-95 origin-left',
              )}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <PageContent page={PREVIEW_PAGES[currentPage]} book={book} />
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={goNext}
            disabled={currentPage === totalPages - 1 || !!flipping}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Page indicators */}
        <div className="flex items-center gap-2">
          {PREVIEW_PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (!flipping) setCurrentPage(i); }}
              className={cn(
                'rounded-full transition-all',
                i === currentPage ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              )}
            />
          ))}
        </div>

        {/* Page label */}
        <p className="text-white/40 text-xs">
          {currentPage === 0 ? 'Cover' :
            currentPage === totalPages - 1 ? 'Back Cover' :
              `Page ${currentPage} of ${totalPages - 2}`}
          {' · '}Use arrow keys or click to navigate
        </p>
      </div>
    </div>
  );
}