import React, { useState, useEffect, useRef } from 'react';
import {
  X, ChevronLeft, ChevronRight, BookOpen, Monitor, Smartphone, Tablet,
  FileText, Eye, Info, Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Static page content (cover, title, toc, back) ──────────────────────────

function CoverPage({ book }) {
  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      {book.cover_url ? (
        <img src={book.cover_url} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.25) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(14,165,233,0.15) 0%, transparent 50%)'
            }}
          />
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-white/70" />
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight mb-3">{book.title || 'Your Book Title'}</h1>
            {book.subtitle && <p className="text-sm text-white/50 leading-relaxed">{book.subtitle}</p>}
          </div>
          <div className="relative z-10 px-8 pb-8 text-center">
            <div className="w-8 h-px bg-white/20 mx-auto mb-4" />
            <p className="text-sm font-medium text-white/70">{book.author_name || 'Author Name'}</p>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <div className="w-3 h-3 rounded-full bg-primary/80" />
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Classpedia</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TitlePage({ book }) {
  return (
    <div className="w-full h-full bg-[#fafaf8] flex flex-col px-10 py-12 relative">
      <p className="text-[9px] text-slate-300 uppercase tracking-[0.2em] mb-auto">Classpedia · Digital Edition</p>
      <div className="my-auto text-center">
        <h1 className="text-2xl font-serif font-bold text-slate-800 leading-snug mb-2">{book.title || 'Your Book Title'}</h1>
        {book.subtitle && <p className="text-sm font-serif text-slate-400 italic mb-6">{book.subtitle}</p>}
        <div className="flex items-center gap-3 justify-center my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <p className="text-sm text-slate-600 font-medium">{book.author_name || 'Author Name'}</p>
        {(book.contributors || []).slice(0, 2).map((c, i) => (
          <p key={i} className="text-[11px] text-slate-400 mt-1">{c.role}: {c.name}</p>
        ))}
        {book.edition_number && (
          <p className="text-[11px] text-slate-400 mt-3">{book.edition_number} Edition</p>
        )}
      </div>
      <p className="text-[9px] text-slate-300 text-center mt-auto">
        © {new Date().getFullYear()} {book.author_name || 'Author'} · All rights reserved
      </p>
    </div>
  );
}

function TocPage({ book }) {
  const chapters = ['Introduction', 'Chapter One', 'Chapter Two', 'Chapter Three', 'Conclusion', 'About the Author'];
  return (
    <div className="w-full h-full bg-[#fafaf8] px-10 py-12 flex flex-col">
      <h2 className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-8">Contents</h2>
      <div className="flex-1 space-y-1">
        {chapters.map((ch, i) => (
          <div key={i} className="flex items-center gap-2 py-2 border-b border-slate-100 last:border-0">
            <span className="text-[10px] text-slate-300 w-5 text-right shrink-0">{i + 1}</span>
            <span className="text-sm text-slate-700 flex-1">{ch}</span>
            <span className="text-[10px] text-slate-300 tabular-nums">{(i + 1) * 14}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-slate-300 mt-6">{book.title}</p>
    </div>
  );
}

function ContentPage({ book, num }) {
  const paragraphs = [
    `This is a preview of how your content will appear to readers on Classpedia. Your uploaded manuscript "${book.manuscript_filename || 'manuscript'}" will be rendered here with beautiful typography.`,
    `The reading experience on Classpedia is optimized for all screen sizes — from mobile phones to desktop monitors. Readers can customize font size, line spacing, and background theme to their preference.`,
    `Chapter content, images, tables, and other elements from your manuscript will display inline, maintaining the structure and formatting you've carefully crafted for your readers.`,
  ];
  return (
    <div className="w-full h-full bg-[#fafaf8] px-10 py-10 flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[9px] text-slate-300 uppercase tracking-widest truncate max-w-[60%]">{book.title}</p>
        <p className="text-[9px] text-slate-300">{num * 14}</p>
      </div>
      <h2 className="text-lg font-serif font-bold text-slate-800 mb-5">Chapter {num}</h2>
      <div className="flex-1 space-y-4 overflow-hidden">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-slate-600 leading-[1.75] text-justify">{p}</p>
        ))}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 italic">
            "{book.description ? book.description.slice(0, 100) + '…' : 'Your book description excerpt will appear in pull quotes like this.'}"
          </p>
        </div>
      </div>
    </div>
  );
}

function ManuscriptPage({ book }) {
  const ext = (book.manuscript_filename || '').split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isDoc = ['doc', 'docx'].includes(ext);
  const isEpub = ['epub', 'mobi', 'kpf'].includes(ext);

  if (isPdf && book.manuscript_url) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[10px] text-slate-500 truncate">{book.manuscript_filename}</p>
        </div>
        <iframe
          src={`${book.manuscript_url}#toolbar=0&navpanes=0&scrollbar=0`}
          className="flex-1 w-full border-0"
          title="Manuscript Preview"
        />
      </div>
    );
  }

  // For EPUB / MOBI / DOC — show a rich "content extracted" preview
  return (
    <div className="w-full h-full bg-[#fafaf8] flex flex-col items-center justify-center px-8 text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <FileText className="w-7 h-7 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{book.manuscript_filename}</p>
        <p className="text-xs text-slate-400 mt-1">
          {isEpub ? 'EPUB/MOBI files will be rendered in the full Classpedia reader.' : ''}
          {isDoc ? 'Word documents are converted to eBook format during publishing.' : ''}
        </p>
      </div>
      <div className="w-full max-w-xs bg-white border border-slate-200 rounded-xl p-4 text-left">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">File details</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Format</span>
            <span className="text-xs font-medium text-slate-700 uppercase">{ext}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Status</span>
            <span className="text-xs font-medium text-green-600">✓ Uploaded</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">DRM</span>
            <span className="text-xs font-medium text-slate-700">{book.drm ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-300 leading-relaxed">
        Full interactive reading experience will be available after publishing.
      </p>
    </div>
  );
}

function BackCoverPage({ book }) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex flex-col">
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(99,102,241,0.2) 0%, transparent 50%)'
        }}
      />
      {book.cover_url && (
        <div className="absolute inset-0 opacity-5">
          <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center gap-5">
        {book.cover_url && (
          <img src={book.cover_url} alt="Cover" className="w-16 h-24 object-cover rounded-lg shadow-2xl opacity-80" />
        )}
        <div className="w-8 h-px bg-white/20" />
        <p className="text-sm text-white/70 leading-relaxed font-serif italic">
          &ldquo;{book.description
            ? book.description.slice(0, 180) + (book.description.length > 180 ? '…' : '')
            : 'Your book description will appear here on the back cover.'}&rdquo;
        </p>
        <div className="w-8 h-px bg-white/20" />
        <p className="text-xs text-white/40 font-medium">{book.author_name || 'Author Name'}</p>
      </div>
      <div className="relative z-10 flex items-center justify-center gap-2 pb-6">
        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <BookOpen className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-[10px] text-white/30 uppercase tracking-widest">Classpedia Publishing</span>
      </div>
    </div>
  );
}

// ─── Main Previewer ───────────────────────────────────────────────────────────

export default function BookPreviewer({ book, onClose }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(null); // 'next' | 'prev'
  const [animating, setAnimating] = useState(false);
  const [device, setDevice] = useState('tablet');
  const [displayPage, setDisplayPage] = useState(0);
  const timeoutRef = useRef(null);

  const hasManuscript = !!(book.manuscript_url && book.manuscript_filename);

  const PAGES = [
    { id: 'cover', label: 'Cover' },
    { id: 'title', label: 'Title Page' },
    { id: 'toc', label: 'Contents' },
    ...(hasManuscript ? [{ id: 'manuscript', label: 'Manuscript' }] : []),
    { id: 'chapter1', label: 'Chapter 1' },
    { id: 'chapter2', label: 'Chapter 2' },
    { id: 'back', label: 'Back Cover' },
  ];

  const totalPages = PAGES.length;

  const navigate = (dir) => {
    if (animating) return;
    const next = dir === 'next' ? currentPage + 1 : currentPage - 1;
    if (next < 0 || next >= totalPages) return;
    setDirection(dir);
    setAnimating(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentPage(next);
      setDisplayPage(next);
      setAnimating(false);
      setDirection(null);
    }, 420);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); clearTimeout(timeoutRef.current); };
  }, [currentPage, animating]);

  const jumpTo = (i) => {
    if (animating || i === currentPage) return;
    const dir = i > currentPage ? 'next' : 'prev';
    setDirection(dir);
    setAnimating(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentPage(i);
      setDisplayPage(i);
      setAnimating(false);
      setDirection(null);
    }, 420);
  };

  const renderPage = (pageIndex) => {
    const page = PAGES[pageIndex];
    if (!page) return null;
    if (page.id === 'cover') return <CoverPage book={book} />;
    if (page.id === 'title') return <TitlePage book={book} />;
    if (page.id === 'toc') return <TocPage book={book} />;
    if (page.id === 'manuscript') return <ManuscriptPage book={book} />;
    if (page.id === 'chapter1') return <ContentPage book={book} num={1} />;
    if (page.id === 'chapter2') return <ContentPage book={book} num={2} />;
    if (page.id === 'back') return <BackCoverPage book={book} />;
    return null;
  };

  const deviceConfig = {
    desktop: { w: 520, h: 680 },
    tablet: { w: 400, h: 540 },
    mobile: { w: 280, h: 460 },
  }[device];

  const isCover = PAGES[displayPage]?.id === 'cover';
  const isBack = PAGES[displayPage]?.id === 'back';
  const isDark = isCover || isBack;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-[#0f1117]" onClick={onClose}>
      <div className="flex flex-col w-full" onClick={e => e.stopPropagation()}>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#0f1117]/90 backdrop-blur border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">{book.title || 'Book Preview'}</p>
              <p className="text-white/30 text-[11px] mt-0.5">Classpedia eBook Preview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Device switcher */}
            <div className="flex items-center gap-1 bg-white/[0.07] rounded-lg p-1">
              {[
                { key: 'desktop', Icon: Monitor, label: 'Desktop' },
                { key: 'tablet', Icon: Tablet, label: 'Tablet' },
                { key: 'mobile', Icon: Smartphone, label: 'Mobile' },
              ].map(({ key, Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setDevice(key)}
                  title={label}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[11px] font-medium transition-all',
                    device === key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Manuscript badge */}
            {hasManuscript && (
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-1">
                <FileText className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-medium">Manuscript loaded</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar — page thumbnails */}
          <div className="w-44 shrink-0 bg-[#080a0f] border-r border-white/[0.05] overflow-y-auto py-4 px-3 hidden md:flex flex-col gap-2">
            <p className="text-[9px] text-white/20 uppercase tracking-widest px-1 mb-2">Pages</p>
            {PAGES.map((p, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className={cn(
                  'group relative rounded-lg overflow-hidden border-2 transition-all text-left',
                  i === displayPage
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-transparent hover:border-white/10'
                )}
              >
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <div className="w-full h-full scale-[0.5] origin-top-left" style={{ width: '200%', height: '200%' }}>
                    {renderPage(i)}
                  </div>
                </div>
                <div className={cn(
                  'absolute inset-x-0 bottom-0 px-2 py-1.5 text-[9px] font-medium truncate transition-colors',
                  i === displayPage ? 'bg-primary/90 text-white' : 'bg-black/60 text-white/50 group-hover:text-white/80'
                )}>
                  {p.label}
                </div>
              </button>
            ))}
          </div>

          {/* Center — book viewer */}
          <div className="flex-1 flex flex-col items-center justify-center gap-6 relative overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at center, #1a1d27 0%, #0f1117 100%)'
            }}
          >
            {/* Ambient glow behind book */}
            <div
              className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
            />

            {/* Nav + Book */}
            <div className="flex items-center gap-5 z-10">
              <button
                onClick={() => navigate('prev')}
                disabled={currentPage === 0 || animating}
                className="w-11 h-11 rounded-full bg-white/[0.07] hover:bg-white/[0.13] border border-white/[0.07] flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Book with 3D flip effect */}
              <div
                className="relative"
                style={{
                  width: deviceConfig.w,
                  height: deviceConfig.h,
                  perspective: '2000px',
                }}
              >
                {/* Drop shadow / glow */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full blur-2xl opacity-40"
                  style={{ width: deviceConfig.w * 0.8, height: 40, background: '#6366f1' }}
                />

                {/* Book container with flip */}
                <div
                  className="w-full h-full rounded-xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: animating ? 'transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
                    transform: animating && direction === 'next'
                      ? 'rotateY(-12deg) scale(0.97)'
                      : animating && direction === 'prev'
                        ? 'rotateY(12deg) scale(0.97)'
                        : 'rotateY(0deg) scale(1)',
                  }}
                >
                  {/* Left spine shadow */}
                  <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/40 to-transparent z-20 pointer-events-none" />
                  {/* Right edge shadow */}
                  <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/20 to-transparent z-20 pointer-events-none" />
                  {/* Top sheen */}
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/10 to-transparent z-20 pointer-events-none rounded-t-xl" />

                  {renderPage(displayPage)}
                </div>
              </div>

              <button
                onClick={() => navigate('next')}
                disabled={currentPage === totalPages - 1 || animating}
                className="w-11 h-11 rounded-full bg-white/[0.07] hover:bg-white/[0.13] border border-white/[0.07] flex items-center justify-center text-white/60 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-2 z-10">
              {PAGES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => jumpTo(i)}
                  title={p.label}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === displayPage
                      ? 'w-5 h-2 bg-primary'
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  )}
                />
              ))}
            </div>

            {/* Page label + hint */}
            <div className="flex flex-col items-center gap-1 z-10">
              <p className="text-white/60 text-xs font-medium">{PAGES[displayPage]?.label}</p>
              <p className="text-white/20 text-[10px]">
                {displayPage + 1} / {totalPages} · Arrow keys to navigate · Esc to close
              </p>
            </div>
          </div>

          {/* Right info panel */}
          <div className="w-56 shrink-0 bg-[#080a0f] border-l border-white/[0.05] py-5 px-4 hidden lg:flex flex-col gap-5">
            <div>
              <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">Book Info</p>
              <div className="space-y-3">
                {[
                  { label: 'Title', value: book.title },
                  { label: 'Author', value: book.author_name },
                  { label: 'Language', value: book.language },
                  { label: 'Edition', value: book.edition_number },
                ].filter(r => r.value).map((row, i) => (
                  <div key={i}>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider">{row.label}</p>
                    <p className="text-[11px] text-white/70 font-medium truncate mt-0.5">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {hasManuscript && (
              <div>
                <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">Manuscript</p>
                <div className="bg-white/[0.04] rounded-lg p-3 border border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <p className="text-[10px] text-white/60 truncate font-medium">{book.manuscript_filename}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <p className="text-[10px] text-green-400">Ready to publish</p>
                  </div>
                </div>
              </div>
            )}

            {(book.categories || []).length > 0 && (
              <div>
                <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">Categories</p>
                <div className="space-y-1.5">
                  {book.categories.map((c, i) => (
                    <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1.5">
                      <p className="text-[10px] text-white/50">{c}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto">
              <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">Settings</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/30">DRM</span>
                  <span className={cn('text-[10px] font-medium', book.drm ? 'text-blue-400' : 'text-white/30')}>
                    {book.drm ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/30">AI Content</span>
                  <span className="text-[10px] text-white/30">
                    {book.ai_generated == null ? '—' : book.ai_generated ? 'Yes' : 'No'}
                  </span>
                </div>
                {book.list_price && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30">Price</span>
                    <span className="text-[10px] text-white/60 font-medium">${book.list_price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}