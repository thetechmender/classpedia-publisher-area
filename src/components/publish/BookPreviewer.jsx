import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, BookOpen, Monitor, Smartphone, Tablet,
  FileText, AlertCircle, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Sound engine (Web Audio API — no external deps) ─────────────────────────
function playPageFlipSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 0.18;
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 28);
      // layered noise + low thump for paper rustle
      data[i] = (Math.random() * 2 - 1) * env * 0.55
        + Math.sin(2 * Math.PI * 120 * t) * Math.exp(-t * 60) * 0.3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.9, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + duration);
  } catch (_) {}
}

// ─── Page content components ──────────────────────────────────────────────────

function CoverPage({ book }) {
  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      {book.cover_url ? (
        <img src={book.cover_url} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99,102,241,0.35) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(14,165,233,0.2) 0%, transparent 50%)' }} />
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mb-8 shadow-2xl">
              <BookOpen className="w-8 h-8 text-white/80" />
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
              {book.title || 'Your Book Title'}
            </h1>
            {book.subtitle && <p className="text-sm text-white/50 leading-relaxed italic">{book.subtitle}</p>}
          </div>
          <div className="relative z-10 px-8 pb-10 text-center">
            <div className="w-12 h-px bg-white/20 mx-auto mb-5" />
            <p className="text-sm font-semibold text-white/80 tracking-wide">{book.author_name || 'Author Name'}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-3 h-3 rounded-full bg-indigo-400/80" />
              <p className="text-[10px] text-white/30 uppercase tracking-[0.25em]">Classpedia</p>
            </div>
          </div>
        </div>
      )}
      {/* Spine shadow overlay on right edge */}
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}

function RightBlankPage() {
  return (
    <div className="w-full h-full bg-[#f8f6f1] flex items-center justify-center">
      <div className="w-full h-full" style={{
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #e8e4dc 28px)',
        backgroundPositionY: '40px',
        opacity: 0.4
      }} />
    </div>
  );
}

function TitlePage({ book }) {
  return (
    <div className="w-full h-full bg-[#faf9f5] flex flex-col px-10 py-14 relative">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      <p className="text-[8px] text-slate-300 uppercase tracking-[0.25em] mb-auto font-medium">Classpedia · Digital Edition</p>
      <div className="my-auto text-center">
        <h1 className="text-2xl font-serif font-bold text-slate-800 leading-snug mb-3">
          {book.title || 'Your Book Title'}
        </h1>
        {book.subtitle && <p className="text-sm font-serif text-slate-400 italic mb-8">{book.subtitle}</p>}
        <div className="flex items-center gap-3 justify-center my-7">
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="w-1 h-1 rounded-full bg-slate-400" />
            <div className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <p className="text-sm text-slate-700 font-semibold tracking-wide">{book.author_name || 'Author Name'}</p>
        {(book.contributors || []).slice(0, 2).map((c, i) => (
          <p key={i} className="text-[11px] text-slate-400 mt-1.5">{c.role}: {c.name}</p>
        ))}
        {book.edition_number && (
          <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">{book.edition_number} Edition</p>
        )}
        {book.series_name && (
          <p className="text-[10px] text-slate-400 mt-1 italic">{book.series_name}</p>
        )}
      </div>
      <p className="text-[8px] text-slate-300 text-center mt-auto leading-relaxed">
        © {new Date().getFullYear()} {book.author_name || 'Author'} · All rights reserved
      </p>
    </div>
  );
}

function TocPage({ book }) {
  const entries = [
    { label: 'Introduction', pg: 1 },
    { label: 'Chapter One', pg: 14 },
    { label: 'Chapter Two', pg: 28 },
    { label: 'Chapter Three', pg: 42 },
    { label: 'Chapter Four', pg: 58 },
    { label: 'Conclusion', pg: 74 },
    { label: 'About the Author', pg: 88 },
    { label: 'Index', pg: 92 },
  ];
  return (
    <div className="w-full h-full bg-[#faf9f5] px-10 py-12 flex flex-col">
      <div className="mb-8">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Table of Contents</p>
        <div className="w-8 h-0.5 bg-slate-300 mt-2" />
      </div>
      <div className="flex-1 space-y-0.5">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2 py-2 group">
            <span className="text-[9px] text-slate-300 w-4 text-right shrink-0 font-mono">{i + 1}</span>
            <span className="text-[11px] text-slate-700 flex-1 font-medium">{e.label}</span>
            <div className="flex-1 border-b border-dotted border-slate-200 mx-1" />
            <span className="text-[9px] text-slate-400 tabular-nums font-mono">{e.pg}</span>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-slate-300 mt-6 truncate">{book.title}</p>
    </div>
  );
}

function ContentPage({ book, num, side }) {
  const paras = [
    `This is a preview of how your content will appear to readers on Classpedia. Your uploaded manuscript will be rendered here with beautiful typography and generous leading.`,
    `The reading experience is optimized for all screen sizes. Readers can adjust font size, line spacing, and background color to their preference.`,
    `Chapter content, images, tables, and other elements from your manuscript display inline, maintaining the careful structure you've crafted for your readers.`,
  ];
  const pg = num * 14 + (side === 'right' ? 1 : 0);
  return (
    <div className="w-full h-full bg-[#faf9f5] px-9 py-10 flex flex-col relative">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[8px] text-slate-300 uppercase tracking-widest truncate max-w-[60%] font-medium">{book.title}</p>
        <p className="text-[8px] text-slate-300 font-mono">{pg}</p>
      </div>
      {side === 'left' && (
        <h2 className="text-base font-serif font-bold text-slate-800 mb-5 leading-snug">Chapter {num}</h2>
      )}
      <div className="flex-1 space-y-3.5 overflow-hidden">
        {paras.map((p, i) => (
          <p key={i} className="text-[11px] text-slate-600 leading-[1.85] text-justify">{p}</p>
        ))}
        {side === 'right' && book.description && (
          <div className="mt-5 pt-4 border-t border-slate-100 border-l-2 border-l-slate-300 pl-3">
            <p className="text-[10px] text-slate-500 italic leading-relaxed">
              "{book.description.slice(0, 120)}…"
            </p>
          </div>
        )}
      </div>
      {/* Spine shadow */}
      {side === 'left' && (
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/[0.07] to-transparent pointer-events-none" />
      )}
      {side === 'right' && (
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/[0.07] to-transparent pointer-events-none" />
      )}
    </div>
  );
}

function ManuscriptPage({ book }) {
  const ext = (book.manuscript_filename || '').split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 shrink-0">
        <FileText className="w-3 h-3 text-slate-400" />
        <p className="text-[9px] text-slate-500 truncate font-medium">{book.manuscript_filename}</p>
        <span className="ml-auto text-[8px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 uppercase font-bold">{ext}</span>
      </div>
      {isPdf && book.manuscript_url ? (
        <iframe
          src={`${book.manuscript_url}#toolbar=0&navpanes=0&scrollbar=0&page=1`}
          className="flex-1 w-full border-0"
          title="Manuscript Preview"
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4 bg-[#faf9f5]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <FileText className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{book.manuscript_filename}</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed max-w-[200px]">
              {['epub', 'mobi', 'kpf'].includes(ext)
                ? 'Rendered in the full Classpedia reader after publishing.'
                : 'Converted to eBook format during the publishing process.'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-[10px] text-green-700 font-medium">Uploaded successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}

function BackCoverPage({ book }) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle at 70% 25%, rgba(99,102,241,0.25) 0%, transparent 55%)' }} />
      {book.cover_url && (
        <div className="absolute inset-0 opacity-[0.06]">
          <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center gap-6">
        {book.cover_url && (
          <img src={book.cover_url} alt="" className="w-14 h-20 object-cover rounded-lg shadow-2xl opacity-70 ring-1 ring-white/10" />
        )}
        <div className="w-10 h-px bg-white/20" />
        <p className="text-sm text-white/70 leading-relaxed font-serif italic max-w-[220px]">
          &ldquo;{book.description
            ? book.description.slice(0, 200) + (book.description.length > 200 ? '…' : '')
            : 'Your book description will appear here on the back cover.'}&rdquo;
        </p>
        <div className="w-10 h-px bg-white/20" />
        <p className="text-xs text-white/50 font-semibold tracking-wide">{book.author_name || 'Author Name'}</p>
      </div>
      <div className="relative z-10 flex items-center justify-center gap-2 pb-7">
        <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
          <BookOpen className="w-3 h-3 text-white" />
        </div>
        <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Classpedia Publishing</span>
      </div>
      {/* Spine shadow on left edge */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Two-page spread config ───────────────────────────────────────────────────
// We display pages in spreads: [cover | blank], [title | toc], [ch1L | ch1R], …
// Each "spread" has a left and right component

function buildSpreads(book) {
  const hasMs = !!(book.manuscript_url && book.manuscript_filename);
  const spreads = [
    // Spread 0: cover + blank verso
    { left: (b) => <CoverPage book={b} />, right: () => <RightBlankPage />, leftLabel: 'Cover', rightLabel: '' },
    // Spread 1: title + toc
    { left: (b) => <TitlePage book={b} />, right: (b) => <TocPage book={b} />, leftLabel: 'Title Page', rightLabel: 'Contents' },
    // Spread 2: maybe manuscript (full width if PDF, else left side)
    ...(hasMs ? [{ left: (b) => <ManuscriptPage book={b} />, right: (b) => <ContentPage book={b} num={1} side="right" />, leftLabel: 'Manuscript', rightLabel: 'Chapter 1' }] : []),
    // Chapters
    { left: (b) => <ContentPage book={b} num={1} side="left" />, right: (b) => <ContentPage book={b} num={1} side="right" />, leftLabel: 'Chapter 1', rightLabel: '' },
    { left: (b) => <ContentPage book={b} num={2} side="left" />, right: (b) => <ContentPage book={b} num={2} side="right" />, leftLabel: 'Chapter 2', rightLabel: '' },
    // Back cover: blank + back cover (reversed)
    { left: () => <RightBlankPage />, right: (b) => <BackCoverPage book={b} />, leftLabel: '', rightLabel: 'Back Cover' },
  ];
  return spreads;
}

// ─── Flip Page animation ──────────────────────────────────────────────────────
// Uses CSS 3D: the "flipping leaf" rotates around the center spine.
// Technique: two halves (front/back of the turning page) share a rotateY.

function FlipLeaf({ direction, fromContent, toContent, pageH, pageW }) {
  // The leaf covers the full width during animation then disappears
  const [phase, setPhase] = useState('start'); // start → mid → end
  const leafRef = useRef(null);

  useEffect(() => {
    // Force reflow then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('end');
      });
    });
    const t = setTimeout(() => setPhase('done'), 600);
    return () => clearTimeout(t);
  }, []);

  if (phase === 'done') return null;

  const goingNext = direction === 'next';

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20, perspective: '2000px', perspectiveOrigin: '50% 50%' }}
    >
      {/* The turning leaf — pivots around its left (next) or right (prev) edge */}
      <div
        ref={leafRef}
        style={{
          position: 'absolute',
          top: 0,
          [goingNext ? 'left' : 'right']: '50%',
          width: '50%',
          height: '100%',
          transformOrigin: goingNext ? 'left center' : 'right center',
          transformStyle: 'preserve-3d',
          transform: phase === 'end'
            ? `rotateY(${goingNext ? '-180deg' : '180deg'})`
            : 'rotateY(0deg)',
          transition: 'transform 0.55s cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        }}
      >
        {/* Front face */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          background: 'linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 8%)',
          boxShadow: goingNext ? '-8px 0 20px rgba(0,0,0,0.25)' : '8px 0 20px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          borderRadius: goingNext ? '0 2px 2px 0' : '2px 0 0 2px',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            transform: goingNext ? 'translateX(0)' : 'translateX(-100%)',
            width: '200%',
          }}>
            {fromContent}
          </div>
        </div>
        {/* Back face */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(to left, rgba(0,0,0,0.12) 0%, transparent 8%)',
          overflow: 'hidden',
          borderRadius: goingNext ? '2px 0 0 2px' : '0 2px 2px 0',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            transform: goingNext ? 'translateX(-100%) scaleX(-1)' : 'translateX(0) scaleX(-1)',
            width: '200%',
          }}>
            {toContent}
          </div>
        </div>
      </div>
      {/* Fold shadow that sweeps across */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: goingNext ? '50%' : 0,
        right: goingNext ? 0 : '50%',
        height: '100%',
        background: 'linear-gradient(to right, rgba(0,0,0,0.18) 0%, transparent 40%)',
        pointerEvents: 'none',
        opacity: phase === 'end' ? 0 : 0.6,
        transition: 'opacity 0.55s ease',
      }} />
    </div>
  );
}

// ─── Main Previewer ───────────────────────────────────────────────────────────

export default function BookPreviewer({ book, onClose }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [flipping, setFlipping] = useState(null); // { direction, fromSpread, toSpread }
  const [device, setDevice] = useState('desktop');

  const SPREADS = buildSpreads(book);
  const total = SPREADS.length;

  const navigate = useCallback((dir) => {
    if (flipping) return;
    const next = dir === 'next' ? spreadIndex + 1 : spreadIndex - 1;
    if (next < 0 || next >= total) return;

    playPageFlipSound();
    const from = spreadIndex;
    setFlipping({ direction: dir, fromSpread: from, toSpread: next });

    setTimeout(() => {
      setSpreadIndex(next);
      setFlipping(null);
    }, 580);
  }, [spreadIndex, flipping, total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') navigate('next');
      if (e.key === 'ArrowLeft') navigate('prev');
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, onClose]);

  // Device configs
  // desktop/tablet: two-page spread (w = total width of both pages)
  // mobile: single page only
  const deviceConfig = {
    desktop: { w: 900, h: 580, twoPage: true },
    tablet:  { w: 680, h: 480, twoPage: true },
    mobile:  { w: 320, h: 480, twoPage: false },
  }[device];

  const isMobile = !deviceConfig.twoPage;
  const pageW = isMobile ? deviceConfig.w : deviceConfig.w / 2;
  const pageH = deviceConfig.h;

  const currentSpread = SPREADS[spreadIndex];
  const displaySpread = flipping ? SPREADS[flipping.fromSpread] : currentSpread;
  const nextSpread = flipping ? SPREADS[flipping.toSpread] : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0c0e14' }} onClick={onClose}>
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />

      <div className="flex flex-col w-full h-full" onClick={e => e.stopPropagation()}>

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 z-30"
          style={{ background: 'rgba(12,14,20,0.95)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none truncate max-w-[200px]">
                {book.title || 'Book Preview'}
              </p>
              <p className="text-white/30 text-[10px] mt-0.5 tracking-wide">Classpedia eBook Previewer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device switcher */}
            <div className="flex items-center gap-0.5 bg-white/[0.06] rounded-lg p-1">
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
                    device === key ? 'bg-white text-slate-900 shadow-sm' : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Page counter */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/[0.06] rounded-lg px-3 h-8">
              <span className="text-white/60 text-[11px] font-medium tabular-nums">
                {spreadIndex + 1} <span className="text-white/20">/</span> {total}
              </span>
            </div>

            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white/40 hover:text-white transition-colors ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Center canvas ── */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 relative overflow-auto py-4">

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 55%, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />

            {/* Nav + Book spread */}
            <div className="flex items-center gap-3 sm:gap-6 z-10 px-2 sm:px-0 max-w-full overflow-hidden">

              {/* Prev button */}
              <button
                onClick={() => navigate('prev')}
                disabled={spreadIndex === 0 || !!flipping}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Book spread container */}
              <div className="relative"
                style={{
                  width: deviceConfig.w,
                  height: deviceConfig.h,
                  filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(99,102,241,0.08))',
                }}
              >
                {/* Book surface */}
                <div className="absolute inset-0 rounded-sm overflow-hidden"
                  style={{ boxShadow: '0 2px 0 rgba(255,255,255,0.04) inset' }}>

                  {isMobile ? (
                    /* Single page on mobile — show the more interesting side */
                    <div className="w-full h-full">
                      {spreadIndex === 0
                        ? displaySpread.left(book)
                        : (displaySpread.right ? displaySpread.right(book) : displaySpread.left(book))}
                    </div>
                  ) : (
                    /* Two-page spread */
                    <div className="flex w-full h-full">
                      {/* Left page */}
                      <div className="flex-1 relative overflow-hidden">
                        {displaySpread.left(book)}
                      </div>

                      {/* Center spine */}
                      <div className="w-px shrink-0 relative z-10"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)',
                          boxShadow: '-4px 0 12px rgba(0,0,0,0.25), 4px 0 12px rgba(0,0,0,0.25)',
                        }} />

                      {/* Right page */}
                      <div className="flex-1 relative overflow-hidden">
                        {displaySpread.right(book)}
                      </div>
                    </div>
                  )}

                  {/* Flip animation overlay */}
                  {flipping && nextSpread && (
                    <FlipLeaf
                      direction={flipping.direction}
                      fromContent={
                        <div className="flex w-full h-full" style={{ width: deviceConfig.w, height: deviceConfig.h }}>
                          <div className="flex-1">{displaySpread.left(book)}</div>
                          <div className="flex-1">{displaySpread.right(book)}</div>
                        </div>
                      }
                      toContent={
                        <div className="flex w-full h-full" style={{ width: deviceConfig.w, height: deviceConfig.h }}>
                          <div className="flex-1">{nextSpread.left(book)}</div>
                          <div className="flex-1">{nextSpread.right(book)}</div>
                        </div>
                      }
                      pageW={pageW}
                      pageH={pageH}
                    />
                  )}

                  {/* Persistent spine highlight */}
                  {!isMobile && (
                    <>
                      <div className="absolute inset-y-0 left-0 w-5 pointer-events-none z-[15]"
                        style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, transparent 100%)' }} />
                      <div className="absolute inset-y-0 right-0 w-5 pointer-events-none z-[15]"
                        style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.18) 0%, transparent 100%)' }} />
                      <div className="absolute inset-x-0 top-0 h-1 pointer-events-none z-[15]"
                        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 100%)' }} />
                    </>
                  )}
                </div>

                {/* Bottom reflection */}
                <div className="absolute top-full left-0 right-0 h-20 rounded-b-sm overflow-hidden pointer-events-none"
                  style={{ transform: 'scaleY(-1)', opacity: 0.07, filter: 'blur(4px)', transformOrigin: 'top' }}>
                  <div className="w-full h-full flex">
                    <div className="flex-1 bg-[#f5f3ee]" />
                    <div className="flex-1 bg-slate-900" />
                  </div>
                </div>
              </div>

              {/* Next button */}
              <button
                onClick={() => navigate('next')}
                disabled={spreadIndex === total - 1 || !!flipping}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Spread dots + label */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="flex items-center gap-2">
                {SPREADS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (i === spreadIndex || flipping) return;
                      playPageFlipSound();
                      setSpreadIndex(i);
                    }}
                    className={cn('rounded-full transition-all duration-300',
                      i === spreadIndex
                        ? 'w-6 h-2 bg-indigo-400'
                        : 'w-2 h-2 hover:bg-white/40'
                    )}
                    style={{ background: i === spreadIndex ? undefined : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-white/50 text-[11px] font-medium">
                  {[currentSpread.leftLabel, currentSpread.rightLabel].filter(Boolean).join(' · ') || `Spread ${spreadIndex + 1}`}
                </p>
                <span className="text-white/15 text-[10px]">·</span>
                <p className="text-white/20 text-[10px]">← → Arrow keys · Esc to close</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom quality-check bar ── */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-3 gap-2 sm:gap-4"
          style={{ background: 'rgba(10,11,18,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-start gap-2 text-amber-400/80">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {"Check for margin issues, cut-off text, or formatting problems before publishing. If something looks wrong and you can't fix it, contact our support team."}
            </p>
          </div>
          <a
            href="mailto:support@classpedia.ai"
            className="flex items-center gap-1.5 shrink-0 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors ml-5 sm:ml-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}