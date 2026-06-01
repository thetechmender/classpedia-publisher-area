import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, BookOpen, Monitor,
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
        {book.seriesName && (
          <p className="text-[10px] text-slate-400 mt-1 italic">{book.seriesName}</p>
        )}
      </div>
      <p className="text-[8px] text-slate-300 text-center mt-auto leading-relaxed">
        © {new Date().getFullYear()} {book.author_name || 'Author'} · All rights reserved
      </p>
    </div>
  );
}

function TocPage({ book, entries: providedEntries, onNavigate }) {
  const fallback = [
    { number: null, displayLabel: 'Introduction', pg: 1 },
    { number: 1, displayLabel: 'Chapter: One', pg: 14 },
    { number: 2, displayLabel: 'Chapter: Two', pg: 28 },
    { number: 3, displayLabel: 'Chapter: Three', pg: 42 },
    { number: 4, displayLabel: 'Chapter: Four', pg: 58 },
    { number: null, displayLabel: 'Conclusion', pg: 74 },
  ];
  const entries = (providedEntries && providedEntries.length > 0) ? providedEntries : fallback;
  // Cap visible TOC items so we don't overflow the page; rest fold into a "… + N more" line
  const MAX_VISIBLE = 14;
  const visible = entries.slice(0, MAX_VISIBLE);
  const remaining = Math.max(0, entries.length - MAX_VISIBLE);
  return (
    <div className="w-full h-full bg-[#faf9f5] px-10 py-12 flex flex-col">
      <div className="mb-6">
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Table of Contents</p>
        <div className="w-8 h-0.5 bg-slate-300 mt-2" />
      </div>
      <div className="flex-1 space-y-0 overflow-hidden">
        {visible.map((e, i) => (
          <button
            key={i}
            onClick={() => onNavigate && onNavigate(e.spreadIndex)}
            className="flex items-baseline gap-2 py-1.5 w-full hover:bg-slate-100/50 active:bg-slate-100 transition-colors rounded px-1 -mx-1 cursor-pointer group"
          >
            <span className="text-[10px] text-slate-400 w-6 text-right shrink-0 font-mono tabular-nums">
              {e.number != null ? `${e.number}.` : ''}
            </span>
            <span className="text-[11px] text-slate-700 font-medium truncate max-w-[60%] group-hover:text-indigo-600">
              {e.displayLabel}
            </span>
            <span className="flex-1 border-b border-dotted border-slate-300 mx-1 mb-[3px]" />
            <span className="text-[10px] text-slate-500 tabular-nums font-mono shrink-0 group-hover:text-indigo-600">{e.pg}</span>
          </button>
        ))}
        {remaining > 0 && (
          <p className="text-[10px] text-slate-400 italic pt-2">… and {remaining} more</p>
        )}
      </div>
      <p className="text-[8px] text-slate-300 mt-6 truncate">{book.title}</p>
    </div>
  );
}

// Render a single element from the structured manuscript
function renderElement(el, key) {
  if (!el || !el.content) return null;
  switch (el.type) {
    case 'h1':
      return <h1 key={key} className="text-base font-serif font-bold text-slate-800 mb-2 leading-snug">{el.content}</h1>;
    case 'h2':
      return <h2 key={key} className="text-sm font-serif font-bold text-slate-800 mb-1.5 leading-snug">{el.content}</h2>;
    case 'h3':
      return <h3 key={key} className="text-[13px] font-serif font-semibold text-slate-800 mb-1 leading-snug">{el.content}</h3>;
    case 'h4':
    case 'h5':
    case 'h6':
      return <h4 key={key} className="text-xs font-serif font-semibold text-slate-700 mb-1">{el.content}</h4>;
    case 'blockquote':
      return <blockquote key={key} className="text-[11px] text-slate-500 italic border-l-2 border-slate-300 pl-3 my-2">{el.content}</blockquote>;
    case 'li':
      return <li key={key} className="text-[11px] text-slate-600 leading-[1.85] ml-4 list-disc">{el.content}</li>;
    case 'p':
    default:
      return <p key={key} className="text-[11px] text-slate-600 leading-[1.85] text-justify">{el.content}</p>;
  }
}

// Character budget per page — used by paginateChapter to split content fairly
// regardless of paragraph length.
const CHARS_PER_PAGE = 1400;
const FIRST_PAGE_BUDGET = 1000; // first page of a chapter loses room to the chapter intro block

// Estimate visual cost of an element (rough char-equivalent of vertical space).
function elementCost(el) {
  const len = (el?.content || '').length;
  switch (el?.type) {
    case 'h1': return Math.max(len * 2.2, 220);
    case 'h2': return Math.max(len * 1.8, 160);
    case 'h3': return Math.max(len * 1.5, 120);
    case 'h4':
    case 'h5':
    case 'h6': return Math.max(len * 1.3, 100);
    case 'blockquote': return len + 80;
    case 'li': return len + 40;
    case 'p':
    default: return len + 50;
  }
}

// Split paragraphs / blockquotes that on their own exceed a page so they can flow
// across multiple pages instead of being silently clipped by overflow-hidden.
function splitLongElement(el) {
  const content = el?.content || '';
  if ((el?.type !== 'p' && el?.type !== 'blockquote') || content.length <= CHARS_PER_PAGE - 200) {
    return [el];
  }
  const sentences = content.match(/[^.!?]+[.!?]+["')\]]?\s*|[^.!?]+$/g) || [content];
  const limit = CHARS_PER_PAGE - 250;
  const chunks = [];
  let buf = '';
  for (const s of sentences) {
    if (buf.length + s.length > limit && buf.length > 0) {
      chunks.push({ ...el, content: buf.trim() });
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) chunks.push({ ...el, content: buf.trim() });
  return chunks.length > 0 ? chunks : [el];
}

// Paginate a chapter's elements into pages using the char budget.
function paginateChapterElements(elements) {
  const expanded = (elements || []).flatMap(splitLongElement);
  const pages = [];
  let current = [];
  let cost = 0;
  let budget = FIRST_PAGE_BUDGET;
  for (const el of expanded) {
    const c = elementCost(el);
    if (cost + c > budget && current.length > 0) {
      pages.push(current);
      current = [];
      cost = 0;
      budget = CHARS_PER_PAGE;
    }
    current.push(el);
    cost += c;
  }
  if (current.length > 0) pages.push(current);
  if (pages.length === 0) pages.push([]);
  return pages;
}

function ContentPage({ book, displayTitle, chapterNumber, kind, elements, pageNumber }) {
  // Top-left header per spec:
  //   real chapter → "<index>: Chapter: <title>" (falls back to book title
  //                  when the parsed chapter title is missing/empty)
  //   front matter → "<label>" (no chapter number)
  let headerLeft;
  if (kind === 'chapter' && chapterNumber) {
    const titleText = displayTitle || book?.title || '';
    headerLeft = titleText
      ? `${chapterNumber}: Chapter: ${titleText}`
      : `${chapterNumber}: Chapter`;
  } else {
    headerLeft = displayTitle || book?.title || '';
  }
  return (
    <div className="w-full h-full bg-[#faf9f5] px-9 py-10 flex flex-col relative">
      {/* Top bar — chapter index + title on the left, page number on the right */}
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <p className="text-[9px] text-slate-500 uppercase tracking-widest truncate font-semibold">
          {headerLeft}
        </p>
        <p className="text-[9px] text-slate-400 font-mono shrink-0 tabular-nums">{pageNumber}</p>
      </div>
      <div className="w-full h-px bg-slate-200 mb-4" />
      <div className="flex-1 space-y-3 overflow-hidden">
        {elements && elements.length > 0 ? (
          elements.map((el, i) => renderElement(el, i))
        ) : (
          <p className="text-[11px] text-slate-400 italic">No content available on this page.</p>
        )}
      </div>
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

// "Chapter N" / roman / numeric bare label patterns used when stripping
// duplicate headings from chapter bodies and when extracting display titles.
const BARE_CHAPTER_LABEL_RE = /^(chapter\s+[ivxlcdm0-9]+|part\s+[ivxlcdm0-9]+|prologue|epilogue|[ivxlcdm]+|[0-9]+)\.?\s*$/i;
const isBareChapterLabel = (s) => BARE_CHAPTER_LABEL_RE.test((s || '').trim());

// Front-matter title patterns → friendly label.
const FRONT_MATTER_PATTERNS = [
  { re: /^cover$/i, label: 'Cover' },
  { re: /cover\s*page/i, label: 'Cover' },
  { re: /titlepage/i, label: 'Title Page' },
  { re: /^title\s*page$/i, label: 'Title Page' },
  { re: /half[-\s]?title/i, label: 'Half Title' },
  { re: /copyright|imprint|colophon/i, label: 'Copyright' },
  { re: /dedication/i, label: 'Dedication' },
  { re: /preface/i, label: 'Preface' },
  { re: /foreword/i, label: 'Foreword' },
  { re: /introduction/i, label: 'Introduction' },
  { re: /acknowledg/i, label: 'Acknowledgments' },
  { re: /^contents$|table\s+of\s+contents|^toc$/i, label: 'Contents' },
  { re: /about\s+the\s+author/i, label: 'About the Author' },
  { re: /^index$/i, label: 'Index' },
  { re: /bookmarks?/i, label: 'Bookmarks' },
  { re: /bibliography/i, label: 'Bibliography' },
  { re: /glossary/i, label: 'Glossary' },
  { re: /appendix/i, label: 'Appendix' },
  { re: /^notes?$/i, label: 'Notes' },
];

// Detect whether a parsed section is a real chapter or front matter.
//
// Strategy: be PERMISSIVE — any section with substantive body content is a
// chapter unless it clearly matches a front-matter pattern (cover / title
// page / copyright / dedication / etc.) or is too small to be a real chapter.
// This mirrors how a reader perceives the book even when the EPUB doesn't
// embed explicit "Chapter N" markers.
function classifyChapter(chapter, bookTitleLc) {
  const title = (chapter?.title || '').trim();
  const titleLc = title.toLowerCase();
  const elements = Array.isArray(chapter?.elements) ? chapter.elements : [];
  const totalChars = elements.reduce((s, el) => s + (el?.content?.length || 0), 0);
  const paragraphCount = elements.filter((el) => el?.type === 'p').length;

  // 1. Title matches a known front-matter pattern → front.
  for (const fm of FRONT_MATTER_PATTERNS) {
    if (fm.re.test(title)) return { kind: 'front', label: fm.label };
  }

  // 2. Title equals the book title AND content is small → title page.
  if (titleLc && titleLc === bookTitleLc && totalChars < 600) {
    return { kind: 'front', label: 'Title Page' };
  }

  // 3. Project Gutenberg boilerplate page (title + license / metadata).
  if (/project\s+gutenberg/i.test(title) && totalChars < 2000) {
    return { kind: 'front', label: 'Title Page' };
  }

  // 4. Very short sections (likely cover, separator, etc.).
  if (totalChars < 250 || paragraphCount < 1) {
    return { kind: 'front', label: title || 'Front Matter' };
  }

  // 5. Otherwise treat as a real chapter.
  return { kind: 'chapter' };
}

// Extract a display title from a chapter:
//   1. If chapter.title contains an embedded title after a marker
//      (e.g. "Chapter I. Down the Rabbit-Hole"), strip the marker.
//   2. Otherwise scan the first ~12 elements for a heading or short paragraph
//      that isn't the book title and isn't a bare "Chapter N" label.
function computeDisplayTitle(chapter, bookTitleLc) {
  const elements = Array.isArray(chapter?.elements) ? chapter.elements : [];
  const ct = (chapter?.title || '').trim();
  const ctLc = ct.toLowerCase();

  // 1. chapter.title path
  if (ct && ctLc !== bookTitleLc) {
    if (!isBareChapterLabel(ct)) {
      // Strip a leading "Chapter X" / "Part X" / roman / numeric prefix if present.
      const stripped = ct
        .replace(/^(chapter\s+[ivxlcdm0-9]+|part\s+[ivxlcdm0-9]+|[ivxlcdm]+|[0-9]+)[\s.\u2014\u2013:\-_]+/i, '')
        .trim();
      if (stripped && stripped.toLowerCase() !== bookTitleLc) return stripped;
    }
  }

  // 2. Scan elements: prefer non-marker, non-book-title heading;
  //    fall back to a short paragraph that looks like a subtitle.
  let sawMarker = false;
  for (let i = 0; i < Math.min(elements.length, 12); i++) {
    const el = elements[i];
    if (!el) continue;
    const isH = /^h[1-6]$/i.test(el.type || '');
    const isP = el.type === 'p';
    if (!isH && !isP) continue;
    const t = (el.content || '').trim();
    if (!t) continue;
    if (t.toLowerCase() === bookTitleLc) continue;
    if (isBareChapterLabel(t)) { sawMarker = true; continue; }
    // Headings are always candidates.
    if (isH) return t;
    // Accept short paragraphs as titles only if we already saw a chapter marker
    // (so we don't accidentally pick up body text as the title).
    if (isP && sawMarker && t.length <= 80) return t;
  }
  return '';
}

function buildSpreads(book, onNavigateToSpread) {
  const structure = book.manuscript_structure;
  const chapters = structure?.chapters || [];
  const bookTitleLc = (book?.title || '').trim().toLowerCase();

  // Pre-process each section:
  //  - classify as real chapter vs. front matter
  //  - compute display-only chapter title
  //  - strip leading duplicate headings (book title, bare "Chapter N" labels,
  //    or the display title itself) so the page header doesn't repeat them
  //  - paginate elements within the per-page char budget
  let chapterCounter = 0;
  const processedChapters = chapters.map((chapter) => {
    const cls = classifyChapter(chapter, bookTitleLc);

    let chapterNumber = null;
    let displayTitle = '';
    if (cls.kind === 'chapter') {
      chapterCounter += 1;
      chapterNumber = chapterCounter;
      displayTitle = computeDisplayTitle(chapter, bookTitleLc);
    } else {
      displayTitle = cls.label || chapter?.title || '';
    }

    let elements = Array.isArray(chapter?.elements) ? chapter.elements.slice() : [];
    const titleLc = (chapter?.title || '').trim().toLowerCase();
    const displayLc = displayTitle.trim().toLowerCase();
    while (elements.length > 0) {
      const first = elements[0];
      const isHeading = first && /^h[1-6]$/i.test(first.type || '');
      const firstText = (first?.content || '').trim();
      const firstLc = firstText.toLowerCase();
      const isBookTitle = firstLc === bookTitleLc;
      const isChapterLabel = isBareChapterLabel(firstText);
      const isDisplayTitle = displayLc && firstLc === displayLc;
      const isParserTitle = titleLc && firstLc === titleLc;
      if (isHeading && (isBookTitle || isChapterLabel || isDisplayTitle || isParserTitle)) {
        elements = elements.slice(1);
      } else {
        break;
      }
    }

    const pages = paginateChapterElements(elements);
    return { chapter, kind: cls.kind, chapterNumber, displayTitle, pages };
  });

  // Flatten into a sequential list of content pages and build a clean TOC.
  //  - All leading front matter (title page, copyright, preface, etc.) is
  //    collapsed into a single "Introduction" entry pointing at page 1.
  //  - Each real chapter gets its own entry; missing chapter titles fall back
  //    to the book title so the row is never blank.
  //  - Trailing back matter (bookmarks, indexes, etc.) is omitted from the TOC
  //    but still rendered in the reading flow.
  const contentPages = [];
  const tocEntries = [];
  let pageCounter = 1;
  const firstChapterIdx = processedChapters.findIndex((p) => p.kind === 'chapter');
  const hasLeadingFrontMatter = firstChapterIdx > 0;

  processedChapters.forEach(({ chapter, kind, chapterNumber, displayTitle, pages }, idx) => {
    const startPage = pageCounter;
    const contentPageStartIndex = contentPages.length;
    
    if (kind === 'chapter') {
      const titleForToc = displayTitle || book?.title || '';
      tocEntries.push({
        number: chapterNumber,
        displayLabel: titleForToc ? `Chapter: ${titleForToc}` : 'Chapter',
        pg: startPage,
        contentPageIndex: contentPageStartIndex,
      });
    } else if (hasLeadingFrontMatter && idx === 0) {
      // Single consolidated Introduction entry for all leading front matter.
      tocEntries.push({
        number: null,
        displayLabel: 'Introduction',
        pg: startPage,
        contentPageIndex: contentPageStartIndex,
      });
    }
    // Front matter sections after the first chapter (back matter) are not
    // added to the TOC, but their pages still appear in the reading flow.

    pages.forEach((els, p) => {
      contentPages.push({
        chapter,
        kind,
        chapterNumber,
        displayTitle,
        pageWithinChapter: p,
        elements: els,
        pageNumber: pageCounter++,
      });
    });
  });

  const spreads = [
    // Spread 0: cover + blank verso
    { left: (b) => <CoverPage book={b} />, right: () => <RightBlankPage />, leftLabel: 'Cover', rightLabel: '' },
    // Spread 1: title + toc (real chapter list when available)
    { left: (b) => <TitlePage book={b} />, right: (b) => <TocPage book={b} entries={[]} onNavigate={onNavigateToSpread} />, leftLabel: 'Title Page', rightLabel: 'Contents' },
  ];

  // If we have parsed manuscript content, generate content spreads
  if (contentPages.length > 0) {
    for (let i = 0; i < contentPages.length; i += 2) {
      const leftPage = contentPages[i];
      const rightPage = contentPages[i + 1];

      const labelOf = (p) => {
        if (!p) return '';
        if (p.kind === 'chapter' && p.chapterNumber) {
          return p.displayTitle
            ? `Chapter ${p.chapterNumber}: ${p.displayTitle}`
            : `Chapter ${p.chapterNumber}`;
        }
        return p.displayTitle || '';
      };

      spreads.push({
        left: (b) => (
          <ContentPage
            book={b}
            kind={leftPage.kind}
            chapterNumber={leftPage.chapterNumber}
            displayTitle={leftPage.displayTitle}
            elements={leftPage.elements}
            pageNumber={leftPage.pageNumber}
          />
        ),
        right: rightPage
          ? (b) => (
              <ContentPage
                book={b}
                kind={rightPage.kind}
                chapterNumber={rightPage.chapterNumber}
                displayTitle={rightPage.displayTitle}
                elements={rightPage.elements}
                pageNumber={rightPage.pageNumber}
              />
            )
          : () => <RightBlankPage />,
        leftLabel: labelOf(leftPage),
        rightLabel: labelOf(rightPage),
      });
    }
  } else if (book.manuscript_url) {
    // Fallback: show manuscript info if no parsed structure
    spreads.push({
      left: (b) => <ManuscriptPage book={b} />,
      right: () => <RightBlankPage />,
      leftLabel: 'Manuscript',
      rightLabel: '',
    });
  }

  // Back cover: blank + back cover (reversed)
  spreads.push({
    left: () => <RightBlankPage />,
    right: (b) => <BackCoverPage book={b} />,
    leftLabel: '',
    rightLabel: 'Back Cover',
  });

  // Now map TOC entries to spread indices (2 content pages per spread, starting at spread index 2)
  const tocEntriesWithSpreadIndex = tocEntries.map(entry => ({
    ...entry,
    spreadIndex: 2 + Math.floor(entry.contentPageIndex / 2),
  }));

  // Update the TOC page with the correct entries
  spreads[1] = {
    left: (b) => <TitlePage book={b} />,
    right: (b) => <TocPage book={b} entries={tocEntriesWithSpreadIndex} onNavigate={onNavigateToSpread} />,
    leftLabel: 'Title Page',
    rightLabel: 'Contents',
  };

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
  const [isMobileView, setIsMobileView] = useState(false);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);

  // Navigation callback for TOC
  const handleNavigateToSpread = useCallback((targetSpreadIndex) => {
    if (targetSpreadIndex === spreadIndex || flipping) return;
    playPageFlipSound();
    setSpreadIndex(targetSpreadIndex);
  }, [spreadIndex, flipping]);

  const SPREADS = buildSpreads(book, handleNavigateToSpread);
  const total = SPREADS.length;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Responsive device config: mobile uses single page, desktop uses two-page spread
  const deviceConfig = isMobileView
    ? { w: 360, h: 640, twoPage: false }
    : { w: 900, h: 580, twoPage: true };

  const pageW = deviceConfig.twoPage ? deviceConfig.w / 2 : deviceConfig.w;
  const pageH = deviceConfig.h;

  // Responsive scaling — fit the book inside the available canvas area
  useEffect(() => {
    const update = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      // Reserve space for nav buttons and controls
      const navSpace = isMobileView ? 80 : 160;
      const bottomSpace = isMobileView ? 60 : 120;
      const availW = rect.width - navSpace;
      const availH = rect.height - bottomSpace;
      const s = Math.min(availW / deviceConfig.w, availH / deviceConfig.h, 1);
      setScale(Math.max(s, isMobileView ? 0.5 : 0.35));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [deviceConfig.w, deviceConfig.h, isMobileView]);

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
            {/* Page counter - show on mobile too */}
            <div className="flex items-center gap-1.5 bg-white/[0.06] rounded-lg px-2.5 sm:px-3 h-8">
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
          <div ref={canvasRef} className="flex-1 flex flex-col items-center justify-center gap-5 relative overflow-hidden py-4">

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 55%, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />

            {/* Nav + Book spread */}
            <div className="flex items-center gap-2 sm:gap-6 z-10 px-1 sm:px-0 max-w-full overflow-hidden">

              {/* Prev button */}
              <button
                onClick={() => navigate('prev')}
                disabled={spreadIndex === 0 || !!flipping}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white active:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Book spread container (responsive scaled wrapper) */}
              <div style={{
                width: deviceConfig.w * scale,
                height: deviceConfig.h * scale,
                position: 'relative',
              }}>
              <div className="relative"
                style={{
                  width: deviceConfig.w,
                  height: deviceConfig.h,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(99,102,241,0.08))',
                }}
              >
                {/* Book surface */}
                <div className="absolute inset-0 rounded-sm overflow-hidden"
                  style={{ boxShadow: '0 2px 0 rgba(255,255,255,0.04) inset' }}>

                  {!deviceConfig.twoPage ? (
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
                  {deviceConfig.twoPage && (
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
              </div>

              {/* Next button */}
              <button
                onClick={() => navigate('next')}
                disabled={spreadIndex === total - 1 || !!flipping}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white active:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Spread dots + label */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 z-10">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full px-2">
                {SPREADS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (i === spreadIndex || flipping) return;
                      playPageFlipSound();
                      setSpreadIndex(i);
                    }}
                    className={cn('rounded-full transition-all duration-300 shrink-0',
                      i === spreadIndex
                        ? 'w-5 h-1.5 sm:w-6 sm:h-2 bg-indigo-400'
                        : 'w-1.5 h-1.5 sm:w-2 sm:h-2 hover:bg-white/40'
                    )}
                    style={{ background: i === spreadIndex ? undefined : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 px-2">
                <p className="text-white/50 text-[10px] sm:text-[11px] font-medium text-center truncate max-w-[280px]">
                  {[currentSpread.leftLabel, currentSpread.rightLabel].filter(Boolean).join(' · ') || `Spread ${spreadIndex + 1}`}
                </p>
                <span className="hidden sm:inline text-white/15 text-[10px]">·</span>
                <p className="hidden sm:block text-white/20 text-[10px]">← → Arrow keys · Esc to close</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom quality-check bar ── */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-2.5 gap-2 sm:gap-4"
          style={{ background: 'rgba(16,18,28,0.97)', borderTop: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Review margins, cut-off text, and formatting before publishing.{' '}
              <span className="text-white/30">If something looks wrong and you can't fix it,</span>{' '}
              <a href="mailto:support@classpedia.ai" className="text-indigo-400 hover:text-indigo-300 transition-colors">contact support</a>.
            </p>
          </div>
          <a
            href="mailto:support@classpedia.ai"
            className="hidden sm:flex items-center gap-1.5 shrink-0 text-[11px] font-medium text-indigo-400/70 hover:text-indigo-300 transition-colors border border-indigo-500/20 rounded-lg px-3 py-1.5 bg-indigo-500/5 hover:bg-indigo-500/10"
          >
            <MessageCircle className="w-3 h-3" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}