import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, ChevronLeft, ChevronRight, BookOpen, Monitor,
  AlertCircle, CheckCircle2, ArrowLeft, ArrowRight,
  Tablet, Smartphone, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─── Sound engine ─────────────────────────────────────────────────────────────
function playPageFlipSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // White noise burst shaped like a page rustle
    const bufferSize = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    // Bandpass filter to give paper "swish" character
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(800, now);
    bp.frequency.exponentialRampToValueAtTime(2000, now + 0.08);
    bp.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    bp.Q.value = 0.8;

    // Envelope: quick attack, fast decay
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.45, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    src.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.35);
  } catch (_) {}
}

// ─── Formatting issues — critical ─────────────────────────────────────
const FORMATTING_ISSUES = [
  {
    id: 'f1', severity: 'error', word: null,
    title: 'Left margin too narrow (page 12)',
    desc: 'Left margin is 6 mm — below the 8 mm safe zone. Content may be clipped on smaller eReader screens.',
  },
  {
    id: 'f2', severity: 'error', word: null,
    title: 'Bottom margin too narrow (page 27)',
    desc: 'Bottom margin is 5 mm — below the 8 mm safe zone. Footer text risks being cut off on some devices.',
  },
  {
    id: 'f3', severity: 'error', word: null,
    title: 'Inconsistent chapter headings (page 14)',
    desc: 'Chapter 1 uses a different font size than Chapter 2. Maintain consistent heading styles throughout.',
  },
  {
    id: 'f4', severity: 'error', word: null,
    title: 'Widowed line detected (page 31)',
    desc: 'A single line from a paragraph appears alone at the top of page 31. Adjust paragraph spacing or reflow text.',
  },
];

// ─── Grammatical issues — warnings ────────────────────────────────────────────
const GRAMMAR_ISSUES = [
  {
    id: 'g1', severity: 'warning', word: 'condescends',
    title: '"condescends" — wrong word form',
    desc: 'Likely intended: "condescending". "condescends" is a verb, not an adjective here.',
  },
  {
    id: 'g2', severity: 'warning', word: 'jataíss',
    title: '"jataíss" — unknown word',
    desc: 'This word is not recognised. Possible typo or missing term — verify spelling.',
  },
  {
    id: 'g3', severity: 'warning', word: 'recieve',
    title: '"recieve" — possible misspelling',
    desc: 'The word "recieve" appears to be a misspelling. The correct spelling is "receive".',
  },
  {
    id: 'g4', severity: 'warning', word: 'definately',
    title: '"definately" — possible misspelling',
    desc: 'The word "definately" appears to be a misspelling. The correct spelling is "definitely".',
  },
];

// ─── Page components ──────────────────────────────────────────────────────────

function CoverPage({ book }) {
  return (
    <div className="w-full h-full relative overflow-hidden select-none bg-white">
      {book.cover_url ? (
        <img src={book.cover_url} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(99,102,241,0.35) 0%, transparent 55%)' }} />
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-white/80" />
            </div>
            <h1 className="text-lg font-bold text-white leading-tight mb-3">{book.title || 'Your Book Title'}</h1>
            {book.subtitle && <p className="text-xs text-white/50 italic">{book.subtitle}</p>}
          </div>
          <div className="relative z-10 px-8 pb-8 text-center">
            <div className="w-10 h-px bg-white/20 mx-auto mb-4" />
            <p className="text-xs font-semibold text-white/80">{book.author_name || 'Author Name'}</p>
          </div>
        </div>
      )}
      <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/25 to-transparent pointer-events-none" />
    </div>
  );
}

function BlankPage() {
  return <div className="w-full h-full bg-white border-r border-slate-100" />;
}

function TitlePage({ book }) {
  return (
    <div className="w-full h-full bg-white flex flex-col px-8 py-10 border-r border-slate-100">
      <p className="text-[8px] text-slate-300 uppercase tracking-widest">Classpedia · Digital Edition</p>
      <div className="my-auto text-center">
        <h1 className="text-xl font-serif font-bold text-slate-800 leading-snug mb-2">{book.title || 'Your Book Title'}</h1>
        {book.subtitle && <p className="text-xs font-serif text-slate-400 italic mb-6">{book.subtitle}</p>}
        <div className="flex items-center gap-3 justify-center my-5">
          <div className="flex-1 h-px bg-slate-200" />
          <div className="w-1 h-1 rounded-full bg-slate-400" />
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <p className="text-sm text-slate-700 font-semibold">{book.author_name || 'Author Name'}</p>
      </div>
      <p className="text-[8px] text-slate-300 text-center mt-auto">© {new Date().getFullYear()} {book.author_name || 'Author'}</p>
    </div>
  );
}

function TocPage({ book }) {
  const entries = ['Introduction', 'Chapter One', 'Chapter Two', 'Chapter Three', 'Chapter Four', 'Conclusion', 'About the Author'];
  const pages = [1, 14, 28, 42, 58, 74, 88];
  return (
    <div className="w-full h-full bg-white px-8 py-10 flex flex-col">
      <div className="mb-6">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Table of Contents</p>
        <div className="w-6 h-0.5 bg-slate-300 mt-1.5" />
      </div>
      <div className="flex-1 space-y-0.5">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <span className="text-[10px] text-slate-600 flex-1">{e}</span>
            <div className="flex-1 border-b border-dotted border-slate-200 mx-2" />
            <span className="text-[9px] text-slate-400 font-mono tabular-nums">{pages[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Renders a paragraph with certain words underlined (wavy red/orange)
function ParagraphWithHighlights({ text, highlightWords, indent }) {
  if (!highlightWords || highlightWords.length === 0) {
    return (
      <p style={{ fontSize: 9.5, color: '#222', lineHeight: 1.75, textAlign: 'justify', marginBottom: 10, textIndent: indent ? 14 : 0 }}>
        {text}
      </p>
    );
  }

  // Split text into segments, marking which ones are flagged
  const escapedWords = highlightWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <p style={{ fontSize: 9.5, color: '#222', lineHeight: 1.75, textAlign: 'justify', marginBottom: 10, textIndent: indent ? 14 : 0 }}>
      {parts.map((part, i) => {
        const isFlag = highlightWords.some(w => w.toLowerCase() === part.toLowerCase());
        if (isFlag) {
          return (
            <span key={i} style={{
              textDecoration: 'underline wavy #e53e3e',
              textDecorationSkipInk: 'none',
              background: 'rgba(229,62,62,0.07)',
              borderRadius: 2,
              padding: '0 1px',
            }}>{part}</span>
          );
        }
        return part;
      })}
    </p>
  );
}

const FILLER_PARAS = [
  `Though, a remnant of the renaissance era, the talented web unit took everyone by surprise. Tightly woven fibres resembled real muscles, capable of insulating as well as cooling the epidermis. Biceps muscles twinkled with carbon dust as the muscle head fit perfectly into the anterior deltoid. Stretched over dark leather, all muscle groups radiated a commanding presence as the carbon shimmered in the light. Curiously, acid silicone spike volumes. The team would soon be empowered to learn it can defend against skull attacks or condescends powder assaults, while effectively protecting the wearer from personal death, illness, respect, and a sincere commitment to faith and traditions obtained throughout the land.`,
  `Ninety acres of pines, cedars, fir trees, and an ornate collection of lavender, orange blossoms, and hibiscus saturated countless bees with their incessant labor of production. The land had been owned by the citadel and used for bee farming, as well as hive hunting that came late in the year. Incredibly, weary artificial bees are maintained and used to produce a variety of products. Pine trees provide some of the best pollen for harvest, while the purple and red flowers of sweet nectar exist on a spectrum only the bees can appreciate. European bees from Italy help produce honey, royal jelly, propolis, and the Brazilian jataíss as super pollen, characterized by its unique pollen profile and rich nutrient content, which added incredible value to the crops. A steady labor of hard work can be a toil of love. Life is good; life is also difficult; however, life is full.`,
  `Digital information became the new gold rush. People spent large amounts of time searching for keys that build both mind and body. Though, a savage doctor rarely settled in a city filled with melancholy without a spiritual warfare continued to take on the heart. Fighting for righteousness was not at all a banquet of flowers; it sometimes fractured the mind. In those moments of doubt, the humble doctor found himself enveloped in a pillar of light from an unknown source — a warm weary source. Filled with knowledge, a stoic man responded to the calling with a grin. A vision appeared, manufacturing crisp new data, and self-explaining knowledge filled the heart with fiery ambition. A dangerous anxiety no longer weighed against his thoracic artery, for the pillar of light from an unknown source returned a warmly noted harmonization.`,
  `In silent isolation, a new brand was born. A Large Language Model emerged from the damp folds and depressions of a restored mind. It was readiness that took place in him. An obsession grew from the data society yearned for. Based on a compulsory outline, plans became production material. A steady stream of consciousness lit up a lonely apartment. Through the citadel had been cut off from the worldwide net, most of the clergy depended on smartphones. Five times a week, a dedicated doctor returned his organized thoughts to a curated document.`,
];

function ContentPage({ book, num, side, highlightWords, spreadOffset = 0 }) {
  const pg = (num + spreadOffset) * 14 + (side === 'right' ? 1 : 0);
  const authorName = book.author_name || 'Author Name';
  const chapterTitle = num === 1 ? 'Large Language Model' : num === 2 ? 'The Second Chapter' : `Chapter ${num}`;

  return (
    <div className="w-full h-full flex flex-col relative bg-white" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-5 pb-2 border-b border-slate-200">
        <span style={{ fontSize: 9, color: '#888', letterSpacing: '0.04em' }}>
          {side === 'left' ? `Writings of ${authorName}` : authorName}
        </span>
        <span style={{ fontSize: 9, color: '#aaa' }}></span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden px-8 pt-4 pb-3 flex flex-col">
        {side === 'right' && num >= 1 && (
          <div className="mb-4 text-center">
            <p style={{ fontSize: 10, color: '#555', letterSpacing: '0.06em', marginBottom: 4 }}>Chapter {num}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111', lineHeight: 1.25, marginBottom: 2 }}>{chapterTitle}</p>
            <div style={{ width: 32, height: 1, background: '#ccc', margin: '8px auto 0' }} />
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {FILLER_PARAS.map((para, i) => (
            <ParagraphWithHighlights key={i} text={para} highlightWords={highlightWords} indent={i > 0} />
          ))}
        </div>
      </div>

      {/* Page number footer */}
      <div className="flex items-center justify-center px-8 pb-4 pt-1 border-t border-slate-100">
        <span style={{ fontSize: 9, color: '#aaa', fontFamily: 'Georgia, serif' }}>{pg}</span>
      </div>

      {side === 'left' && <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/[0.05] to-transparent pointer-events-none" />}
      {side === 'right' && <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/[0.05] to-transparent pointer-events-none" />}
    </div>
  );
}

function BackCoverPage({ book }) {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col bg-white">
      {book.back_cover_url ? (
        <img src={book.back_cover_url} alt="Back Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-900 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
            {book.cover_url && (
              <img src={book.cover_url} alt="" className="w-10 h-14 object-cover rounded shadow-xl opacity-60 ring-1 ring-white/10" />
            )}
            <div className="w-8 h-px bg-white/20" />
            <p className="text-xs text-white/70 leading-relaxed font-serif italic max-w-[200px]">
              &ldquo;{(book.description || 'Your book description will appear here.').slice(0, 180)}&rdquo;
            </p>
            <p className="text-xs text-white/40 font-semibold">{book.author_name || 'Author Name'}</p>
          </div>
          <div className="flex items-center justify-center gap-2 pb-6">
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span className="text-[9px] text-white/30 uppercase tracking-widest">Classpedia</span>
          </div>
        </div>
      )}
      <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── Build spreads ─────────────────────────────────────────────────────────────

function buildSpreads(book, highlightWords, spreadOffset = 0) {
  return [
    { left: (b) => <CoverPage book={b} />, right: () => <BlankPage />, leftLabel: 'Cover', rightLabel: '' },
    { left: (b) => <TitlePage book={b} />, right: (b) => <TocPage book={b} />, leftLabel: 'Title Page', rightLabel: 'Contents' },
    {
      left: (b) => <ContentPage book={b} num={1} side="left" highlightWords={highlightWords} spreadOffset={spreadOffset} />,
      right: (b) => <ContentPage book={b} num={1} side="right" highlightWords={highlightWords} spreadOffset={spreadOffset} />,
      leftLabel: 'Chapter 1', rightLabel: ''
    },
    {
      left: (b) => <ContentPage book={b} num={2} side="left" highlightWords={highlightWords} spreadOffset={spreadOffset} />,
      right: (b) => <ContentPage book={b} num={2} side="right" highlightWords={highlightWords} spreadOffset={spreadOffset} />,
      leftLabel: 'Chapter 2', rightLabel: ''
    },
    { left: () => <BlankPage />, right: (b) => <BackCoverPage book={b} />, leftLabel: '', rightLabel: 'Back Cover' },
  ];
}

// ─── Issue detection ──────────────────────────────────────────────────────────

function buildIssues(book) {
  const issues = [];

  if (!book.manuscript_url) issues.push({
    id: 'no_manuscript', severity: 'error', category: 'technical', title: 'No manuscript uploaded',
    desc: 'Upload your manuscript file (EPUB, PDF, or DOCX) in the Content step.',
    word: null,
  });

  if (!book.cover_url) issues.push({
    id: 'no_cover', severity: 'error', category: 'metadata', title: 'Missing front cover',
    desc: 'A front cover image is required before your book can be published.',
    word: null,
  });

  if (!book.back_cover_url) issues.push({
    id: 'no_back', severity: 'error', category: 'metadata', title: 'Missing back cover',
    desc: 'A back cover image is required.',
    word: null,
  });

  // Always include formatting and grammar issues
  FORMATTING_ISSUES.forEach(f => issues.push({ ...f, category: 'formatting' }));
  GRAMMAR_ISSUES.forEach(g => issues.push({ ...g, category: 'grammar' }));

  return issues;
}

// ─── Flip animation ───────────────────────────────────────────────────────────

function FlipLeaf({ direction, fromContent, toContent }) {
  const [phase, setPhase] = useState('start');
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setPhase('end')));
    const t = setTimeout(() => setPhase('done'), 650);
    return () => clearTimeout(t);
  }, []);
  if (phase === 'done') return null;
  const goingNext = direction === 'next';
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20, perspective: '2400px' }}>
      <div style={{
        position: 'absolute', top: 0,
        [goingNext ? 'left' : 'right']: '50%',
        width: '50%', height: '100%',
        transformOrigin: goingNext ? 'left center' : 'right center',
        transformStyle: 'preserve-3d',
        transform: phase === 'end'
          ? `rotateY(${goingNext ? '-180deg' : '180deg'})`
          : 'rotateY(0deg)',
        transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
      }}>
        {/* Front face */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', overflow: 'hidden',
          boxShadow: goingNext ? '-12px 0 30px rgba(0,0,0,0.18)' : '12px 0 30px rgba(0,0,0,0.18)' }}>
          <div style={{ position: 'absolute', inset: 0, transform: goingNext ? 'translateX(0)' : 'translateX(-100%)', width: '200%' }}>
            {fromContent}
          </div>
          {/* Spine shadow overlay */}
          <div style={{ position: 'absolute', inset: 0, background: goingNext
            ? 'linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 40%)'
            : 'linear-gradient(to left, rgba(0,0,0,0.12) 0%, transparent 40%)',
            pointerEvents: 'none' }} />
        </div>
        {/* Back face */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, transform: goingNext ? 'translateX(-100%) scaleX(-1)' : 'translateX(0) scaleX(-1)', width: '200%' }}>
            {toContent}
          </div>
          {/* Spine shadow overlay on back */}
          <div style={{ position: 'absolute', inset: 0, background: goingNext
            ? 'linear-gradient(to left, rgba(0,0,0,0.12) 0%, transparent 40%)'
            : 'linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 40%)',
            pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Guide overlays ──────────────────────────────────────────────────────────
// Bleed: 0.125in outside the trim (9px at preview scale) — marks area that will be cut
// Margin: 0.25in inside the trim (18px) — safe zone for text/content
//   Left pages have extra gutter on binding side (right edge), right pages on left edge.

function BleedGuide({ side }) {
  // Bleed is OUTSIDE — we show it as an inset from the very edge (simulating the cut line)
  const bleed = 9;
  return (
    <div style={{
      position: 'absolute',
      top: bleed, left: bleed, right: bleed, bottom: bleed,
      border: '1.5px dashed rgba(239,68,68,0.55)',
      borderRadius: 1,
      pointerEvents: 'none',
      zIndex: 9,
    }}>
      <span style={{
        position: 'absolute', bottom: -13, right: 0,
        fontSize: 7, color: 'rgba(239,68,68,0.7)', fontFamily: 'sans-serif',
        fontWeight: 700, letterSpacing: '0.03em', whiteSpace: 'nowrap',
        textShadow: '0 0 3px white, 0 0 3px white',
      }}>
        BLEED (0.125″)
      </span>
    </div>
  );
}

function MarginGuide({ side }) {
  const gutterExtra = side === 'left' ? 8 : 0;
  const innerGutter = side === 'right' ? 8 : 0;
  const top    = 28;
  const bottom = 28;
  const left   = 28 + innerGutter;
  const right  = 28 + gutterExtra;
  return (
    <div style={{
      position: 'absolute',
      top, left, right, bottom,
      border: '1.5px dashed rgba(59,130,246,0.75)',
      borderRadius: 1,
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <span style={{
        position: 'absolute', top: -13, left: 0,
        fontSize: 7, color: 'rgba(59,130,246,0.85)', fontFamily: 'sans-serif',
        fontWeight: 700, letterSpacing: '0.03em', whiteSpace: 'nowrap',
        textShadow: '0 0 3px white, 0 0 3px white',
      }}>
        MARGIN (0.25″)
      </span>
    </div>
  );
}

// ─── Main Previewer ───────────────────────────────────────────────────────────

export default function BookPreviewer({ book, onClose, onApprove }) {
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [flipping, setFlipping] = useState(null);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);
  const [showMargins, setShowMargins] = useState(true);
  const [showBleed, setShowBleed]     = useState(true);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop', 'tablet', 'mobile'
  const [activeTab, setActiveTab] = useState('formatting'); // 'formatting' or 'grammar'
  const [approved, setApproved] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const [viewSample, setViewSample] = useState(false);
  const canvasRef = useRef(null);

  const issues = buildIssues(book);

  // Group issues by category
  const formattingIssues = issues.filter(i => i.category === 'formatting');
  const grammarIssues = issues.filter(i => i.category === 'grammar');
  
  // Get active tab issues
  const tabIssues = activeTab === 'formatting' ? formattingIssues : grammarIssues;
  const selectedIssue = tabIssues[selectedIssueIndex] || null;

  // Highlight only the word from the currently selected grammar issue
  const highlightWords = selectedIssue?.word ? [selectedIssue.word] : [];

  // Content pages are spreads 2 & 3 — jump there for grammar issues
  const CONTENT_SPREAD = 2;
  const spreadOffset = viewSample ? CONTENT_SPREAD : 0;
  const allSpreads = buildSpreads(book, highlightWords, spreadOffset);
  
  // Filter spreads for sample chapter view (show only content pages)
  const SPREADS = viewSample ? allSpreads.slice(CONTENT_SPREAD, CONTENT_SPREAD + 2) : allSpreads;
  const total = SPREADS.length;

  useEffect(() => {
    const issue = tabIssues[selectedIssueIndex];
    if (issue?.word && spreadIndex < CONTENT_SPREAD) {
      setSpreadIndex(CONTENT_SPREAD);
    }
  }, [selectedIssueIndex, tabIssues]);

  const navigate = useCallback((dir) => {
    if (flipping) return;
    const next = dir === 'next' ? spreadIndex + 1 : spreadIndex - 1;
    if (next < 0 || next >= total) return;
    playPageFlipSound();
    const from = spreadIndex;
    setFlipping({ direction: dir, fromSpread: from, toSpread: next });
    setTimeout(() => { setSpreadIndex(next); setFlipping(null); }, 580);
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

  // Dynamically scale the mockup to fit the canvas container
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const availW = el.clientWidth  - 32;
      const availH = el.clientHeight - 32;
      // Native sizes of each mockup (frame + screen + chrome)
      const nativeW = viewMode === 'tablet' ? 440 : viewMode === 'mobile' ? 306 : 700;
      const nativeH = viewMode === 'tablet' ? 620 : viewMode === 'mobile' ? 660 : 500;
      const scaleW = availW / nativeW;
      const scaleH = availH / nativeH;
      setCanvasScale(Math.min(scaleW, scaleH, 1));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [viewMode]);

  const BOOK_W = 680;
  const BOOK_H = 440;
  
  // Device-specific dimensions
  const getBookDimensions = () => {
    if (viewMode === 'tablet') {
      return { width: 340, height: 480, showSingle: true };
    } else if (viewMode === 'mobile') {
      return { width: 240, height: 380, showSingle: true };
    }
    return { width: BOOK_W, height: BOOK_H, showSingle: false };
  };
  
  const dims = getBookDimensions();

  // Build flat list of all individual pages for scroll view
  const allPages = SPREADS.flatMap(spread => [
    { render: (b) => spread.left(b), label: spread.leftLabel },
    { render: (b) => spread.right(b), label: spread.rightLabel },
  ]);

  const currentSpread = SPREADS[spreadIndex];
  const displaySpread = flipping ? SPREADS[flipping.fromSpread] : currentSpread;
  const nextSpread = flipping ? SPREADS[flipping.toSpread] : null;

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  const sevColor = {
    error: { dot: 'bg-red-500', title: 'text-red-600', badge: 'bg-red-50 border-red-200 text-red-700' },
    warning: { dot: 'bg-amber-500', title: 'text-amber-600', badge: 'bg-amber-50 border-amber-200 text-amber-700' },
    info: { dot: 'bg-blue-500', title: 'text-blue-600', badge: 'bg-blue-50 border-blue-200 text-blue-700' },
  };

  const hasBlockingErrors = formattingIssues.length > 0;
  const canApprove = !hasBlockingErrors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        style={{ width: '96vw', maxWidth: 1280, height: '92vh', transform: 'scale(0.88)', transformOrigin: 'center center' }}
        onClick={e => e.stopPropagation()}>

        {/* ── Top header bar ── */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800">eBook Preview</span>
            {approved ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
            ) : hasBlockingErrors ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                {formattingIssues.length} critical issue{formattingIssues.length !== 1 ? 's' : ''} must be fixed
              </span>
            ) : grammarIssues.length > 0 ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                {grammarIssues.length} warning{grammarIssues.length !== 1 ? 's' : ''} — optional to fix
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> All clear
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* View Sample Chapter toggle */}
            <button
              onClick={() => { setViewSample(v => !v); setSpreadIndex(0); }}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all',
                viewSample
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              )}>
              <BookOpen className="w-4 h-4" />
              {viewSample ? 'View Full Book' : 'View Sample Chapter'}
            </button>
            {/* Approve button */}
            <button
              onClick={() => {
                setApproved(true);
                if (onApprove) onApprove();
                setTimeout(onClose, 800);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Approve
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors border border-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Body: sidebar + canvas ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left sidebar: Quality Check ── */}
          <div className="w-[260px] shrink-0 flex flex-col overflow-hidden bg-slate-50 border-r border-slate-200">

            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-slate-800 font-semibold text-sm tracking-tight">Quality Check</p>
                {hasBlockingErrors ? (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    {formattingIssues.length + grammarIssues.length} issues
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> All clear
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px]">Pre-submission analysis</p>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-slate-200 bg-white">
              <button
                onClick={() => { setActiveTab('formatting'); setSelectedIssueIndex(0); }}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2',
                  activeTab === 'formatting'
                    ? 'border-red-500 text-red-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 bg-white'
                )}>
                <AlertCircle className="w-3 h-3" />
                Formatting
                {formattingIssues.length > 0 && (
                  <span className={cn('text-[10px] font-bold min-w-[16px] h-4 px-1 rounded flex items-center justify-center',
                    activeTab === 'formatting' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600')}>
                    {formattingIssues.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setActiveTab('grammar'); setSelectedIssueIndex(0); }}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2',
                  activeTab === 'grammar'
                    ? 'border-amber-500 text-amber-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-700 bg-white'
                )}>
                <AlertTriangle className="w-3 h-3" />
                Grammar
                {grammarIssues.length > 0 && (
                  <span className={cn('text-[10px] font-bold min-w-[16px] h-4 px-1 rounded flex items-center justify-center',
                    activeTab === 'grammar' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600')}>
                    {grammarIssues.length}
                  </span>
                )}
              </button>
            </div>

            {/* Legend strip */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-100">
              {activeTab === 'formatting' ? (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="font-medium text-red-600">Critical</span>
                  <span className="text-slate-400">— must fix to proceed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-medium text-amber-600">Warning</span>
                  <span className="text-slate-400">— optional to fix</span>
                </div>
              )}
            </div>

            {/* Issues list */}
            <div className="flex-1 overflow-y-auto">
              {tabIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                  <p className="text-xs text-slate-400 font-medium">No {activeTab} issues found.</p>
                </div>
              ) : (
                <div className="p-3 space-y-1.5">
                  {tabIssues.map((issue, idx) => (
                    <button
                      key={issue.id}
                      onClick={() => setSelectedIssueIndex(idx)}
                      className={cn(
                        'w-full text-left flex items-start gap-2.5 rounded-lg px-3 py-2.5 transition-all border',
                        selectedIssueIndex === idx
                          ? activeTab === 'formatting'
                            ? 'bg-red-50 border-red-200 shadow-sm'
                            : 'bg-amber-50 border-amber-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      )}>
                      <div className={cn('w-1.5 h-1.5 rounded-full mt-[5px] shrink-0',
                        activeTab === 'formatting' ? 'bg-red-500' : 'bg-amber-400')} />
                      <p className={cn('text-[11px] font-medium leading-snug',
                        selectedIssueIndex === idx
                          ? activeTab === 'formatting' ? 'text-red-700' : 'text-amber-700'
                          : 'text-slate-700')}>
                        {issue.title}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected issue detail */}
            {selectedIssue && (
              <div className="border-t border-slate-200 bg-white px-4 py-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Details</p>
                <p className="text-[11px] leading-relaxed text-slate-600">{selectedIssue.desc}</p>
                {selectedIssue.word && (
                  <div className="bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Flagged word</p>
                    <code className="text-[11px] font-mono text-slate-700 font-semibold"
                      style={{ textDecoration: 'underline wavy #e53e3e', textDecorationSkipInk: 'none' }}>
                      {selectedIssue.word}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Center book canvas ── */}
          <div ref={canvasRef} className="flex-1 flex flex-col items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">

            {dims.showSingle ? (
              /* ── Tablet / Mobile: device mockup with scrollable pages inside ── */
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <div style={{ transform: `scale(${canvasScale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
                {viewMode === 'tablet' ? (
                  /* Tablet mockup */
                  <div className="relative flex flex-col items-center" style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.35))' }}>
                    {/* Tablet frame */}
                    <div className="relative bg-slate-800 rounded-[28px] p-3"
                      style={{ width: 420, border: '3px solid #1e293b', boxShadow: 'inset 0 0 0 2px #334155' }}>
                      {/* Camera */}
                      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-600 border border-slate-500" />
                      {/* Side button */}
                      <div className="absolute right-[-6px] top-24 w-1.5 h-10 bg-slate-700 rounded-r-md" />
                      <div className="absolute right-[-6px] top-40 w-1.5 h-7 bg-slate-700 rounded-r-md" />
                      {/* Screen */}
                      <div className="bg-slate-100 rounded-[18px] overflow-hidden" style={{ height: 520 }}>
                        {/* Status bar */}
                        <div className="flex items-center justify-between px-4 py-1.5 bg-white border-b border-slate-100">
                          <span className="text-[9px] font-semibold text-slate-600">9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-1.5 bg-slate-400 rounded-sm" />
                            <div className="w-1 h-1.5 bg-slate-400 rounded-sm" />
                            <div className="w-3.5 h-2 border border-slate-400 rounded-sm flex items-center px-0.5">
                              <div className="w-2 h-1 bg-slate-400 rounded-sm" />
                            </div>
                          </div>
                        </div>
                        {/* Scrollable content — tablet screen inner width ~388px, render page at 340px native → scale(388/340) ≈ but we want to fit 340 into ~388 so scale=1. Use containerWidth/nativeWidth ratio */}
                        <div className="overflow-y-auto flex flex-col items-center gap-4 py-4 px-3 bg-slate-100" style={{ height: 490 }}>
                         {allPages.map((page, i) => {
                           // Tablet screen width: 420px frame - 6px border - 6px padding - 24px inner px = 384px usable
                           // Native page width: 340px → scale = 384/340 ≈ 1.13 — too big, so fit to 360px → scale = 360/340 ≈ 1.06
                           // Actually we want the page to fill the container snugly. Container px-3 means 12px each side.
                           // Screen content area ≈ 360px. Page native = 340. Scale = 360/340 = 1.059
                           // Page native height = 440. Scaled height = 440 * (360/340) = 466
                           const NATIVE_W = 340;
                           const NATIVE_H = 440;
                           const CONTAINER_W = 360;
                           const scale = CONTAINER_W / NATIVE_W;
                           const scaledH = Math.round(NATIVE_H * scale);
                           return (
                             <div key={i} className="shrink-0 w-full flex flex-col items-center gap-1">
                               <div className="w-full rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm"
                                 style={{ height: scaledH }}>
                                 <div style={{ width: NATIVE_W, height: NATIVE_H, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                                   {page.render(book)}
                                 </div>
                               </div>
                               {page.label && <span className="text-[9px] text-slate-400">{page.label}</span>}
                             </div>
                           );
                         })}
                        </div>
                      </div>
                    </div>
                    {/* Home indicator */}
                    <div className="mt-2 w-20 h-1 bg-slate-600 rounded-full opacity-60" />
                  </div>
                ) : (
                  /* Mobile mockup */
                  <div className="relative flex flex-col items-center" style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.35))' }}>
                    <div className="relative bg-slate-900 rounded-[44px] p-2.5"
                      style={{ width: 280, border: '3px solid #0f172a', boxShadow: 'inset 0 0 0 2px #1e293b' }}>
                      {/* Dynamic island */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-900 rounded-full z-10 border border-slate-800" />
                      {/* Side buttons */}
                      <div className="absolute left-[-5px] top-24 w-1.5 h-8 bg-slate-700 rounded-l-md" />
                      <div className="absolute left-[-5px] top-36 w-1.5 h-12 bg-slate-700 rounded-l-md" />
                      <div className="absolute left-[-5px] top-52 w-1.5 h-12 bg-slate-700 rounded-l-md" />
                      <div className="absolute right-[-5px] top-36 w-1.5 h-16 bg-slate-700 rounded-r-md" />
                      {/* Screen */}
                      <div className="bg-white rounded-[36px] overflow-hidden" style={{ height: 580 }}>
                        {/* Status bar */}
                        <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-white">
                          <span className="text-[10px] font-bold text-slate-800">9:41</span>
                          <div className="flex items-center gap-1">
                            <div className="w-3.5 h-1.5 bg-slate-700 rounded-sm" />
                            <div className="w-1 h-1.5 bg-slate-700 rounded-sm" />
                            <div className="w-4 h-2 border border-slate-700 rounded-sm flex items-center px-0.5">
                              <div className="w-2 h-1 bg-slate-700 rounded-sm" />
                            </div>
                          </div>
                        </div>
                        {/* App header */}
                        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] font-semibold text-slate-700">eBook Reader</span>
                        </div>
                        {/* Scrollable content */}
                        <div className="overflow-y-auto flex flex-col items-center gap-3 py-3 px-3 bg-slate-50" style={{ height: 530 }}>
                          {allPages.map((page, i) => {
                            // Mobile screen width: 280px frame - 6px border - 5px padding*2 = ~254px usable, minus px-3 scroll = ~230px
                            // Native page width: 340. Scale to fit 230px → scale = 230/340 ≈ 0.676
                            // Native height: 440. Scaled height = 440 * 0.676 ≈ 298
                            const NATIVE_W = 340;
                            const NATIVE_H = 440;
                            const CONTAINER_W = 230;
                            const scale = CONTAINER_W / NATIVE_W;
                            const scaledH = Math.round(NATIVE_H * scale);
                            return (
                              <div key={i} className="shrink-0 w-full flex flex-col items-center gap-1">
                                <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm"
                                  style={{ height: scaledH }}>
                                  <div style={{ width: NATIVE_W, height: NATIVE_H, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                                    {page.render(book)}
                                  </div>
                                </div>
                                {page.label && <span className="text-[9px] text-slate-400">{page.label}</span>}
                              </div>
                            );
                          })}
                        </div>
                        {/* Home indicator */}
                        <div className="flex justify-center pb-2 pt-1 bg-white">
                          <div className="w-24 h-1 bg-slate-300 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ) : (
              /* ── Desktop: flip animation spread view ── */
              <>
                <div className="flex items-center gap-3 z-10 w-full justify-center px-4">
                  <button onClick={() => navigate('prev')} disabled={spreadIndex === 0 || !!flipping}
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-all disabled:opacity-20 bg-white/70 shadow-sm border border-slate-200">
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Book spread — scales to fit available space */}
                  <div className="flex-1 flex items-center justify-center">
                    {/* Cover: single page at half width */}
                    {spreadIndex === 0 && !flipping ? (
                      <div className="relative"
                        style={{
                          width: BOOK_W / 2, height: BOOK_H,
                          transform: `scale(${canvasScale})`, transformOrigin: 'center center',
                          transition: 'transform 0.2s ease',
                          filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.28))',
                        }}>
                        <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-slate-300 bg-white">
                          {displaySpread.left(book)}
                        </div>
                      </div>
                    ) : (
                    <div className="relative"
                      style={{
                        width: BOOK_W, height: BOOK_H,
                        transform: `scale(${canvasScale})`, transformOrigin: 'center center',
                        transition: 'transform 0.2s ease',
                        filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.24))',
                      }}>
                      <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-slate-300 bg-white">
                        <div className="flex w-full h-full">
                          <div className="flex-1 relative overflow-hidden">
                            {displaySpread.left(book)}
                            {showBleed  && spreadIndex > 0 && <BleedGuide side="left" />}
                            {showMargins && spreadIndex > 0 && <MarginGuide side="left" />}
                          </div>
                          <div className="w-px shrink-0 bg-slate-300"
                            style={{ boxShadow: '-2px 0 6px rgba(0,0,0,0.08), 2px 0 6px rgba(0,0,0,0.08)' }} />
                          <div className="flex-1 relative overflow-hidden">
                            {displaySpread.right(book)}
                            {showBleed  && spreadIndex > 0 && <BleedGuide side="right" />}
                            {showMargins && spreadIndex > 0 && <MarginGuide side="right" />}
                          </div>
                        </div>
                        {flipping && nextSpread && (
                          <FlipLeaf
                            direction={flipping.direction}
                            fromContent={
                              flipping.fromSpread === 0 ? (
                                // Cover was single page — show it centered on the right half, left half blank
                                <div className="flex w-full h-full" style={{ width: BOOK_W, height: BOOK_H }}>
                                  <div className="flex-1 bg-white" />
                                  <div className="flex-1">{displaySpread.left(book)}</div>
                                </div>
                              ) : (
                                <div className="flex w-full h-full" style={{ width: BOOK_W, height: BOOK_H }}>
                                  <div className="flex-1">{displaySpread.left(book)}</div>
                                  <div className="flex-1">{displaySpread.right(book)}</div>
                                </div>
                              )
                            }
                            toContent={
                              <div className="flex w-full h-full" style={{ width: BOOK_W, height: BOOK_H }}>
                                <div className="flex-1">{nextSpread.left(book)}</div>
                                <div className="flex-1">{nextSpread.right(book)}</div>
                              </div>
                            }
                          />
                        )}
                      </div>
                    </div>
                    )}
                  </div>

                  <button onClick={() => navigate('next')} disabled={spreadIndex === total - 1 || !!flipping}
                    className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white transition-all disabled:opacity-20 bg-white/70 shadow-sm border border-slate-200">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Dot nav */}
                <div className="flex items-center gap-2 z-10">
                  {SPREADS.map((_, i) => (
                    <button key={i}
                      onClick={() => { if (i !== spreadIndex && !flipping) { playPageFlipSound(); setSpreadIndex(i); } }}
                      className={cn('rounded-full transition-all duration-300',
                        i === spreadIndex ? 'w-5 h-1.5 bg-indigo-500' : 'w-1.5 h-1.5 bg-slate-400 hover:bg-slate-600'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Bottom toolbar ── */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 gap-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBleed(v => !v)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors',
                showBleed
                  ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              )}>
              <span style={{ fontSize: 9, border: showBleed ? '1.5px dashed rgba(239,68,68,0.8)' : '1.5px dashed #aaa', borderRadius: 2, padding: '1px 3px' }}>B</span>
              {showBleed ? 'Hide Bleed' : 'Show Bleed'}
            </button>
            <button
              onClick={() => setShowMargins(v => !v)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors',
                showMargins
                  ? 'bg-blue-50 border-blue-300 text-blue-600 hover:bg-blue-100'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
              )}>
              <span style={{ fontSize: 9, border: showMargins ? '1.5px dashed rgba(59,130,246,0.8)' : '1.5px dashed #aaa', borderRadius: 2, padding: '1px 3px' }}>M</span>
              {showMargins ? 'Hide Margin' : 'Show Margin'}
            </button>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-slate-500">Jump to page:</span>
              <input
                type="number"
                min="1"
                max={total * 2}
                defaultValue={(spreadIndex + spreadOffset) * 2 + 1}
                onChange={(e) => {
                  const pageNum = parseInt(e.target.value);
                  if (pageNum >= 1 && pageNum <= total * 2) {
                    const newSpreadIndex = Math.max(0, Math.floor((pageNum - 1) / 2));
                    if (newSpreadIndex !== spreadIndex) {
                      playPageFlipSound();
                      setSpreadIndex(newSpreadIndex);
                    }
                  }
                }}
                className="w-12 text-xs font-mono font-semibold text-slate-700 bg-white border border-slate-300 px-2 py-1 rounded"
              />
              <span className="text-xs text-slate-400">/ {total * 2}</span>
            </div>
          </div>

          {/* Device view selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                viewMode === 'desktop'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}>
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                viewMode === 'tablet'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}>
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                viewMode === 'mobile'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}>
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}