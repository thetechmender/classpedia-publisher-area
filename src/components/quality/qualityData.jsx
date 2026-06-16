// Quality check data — warning-only issues for books awaiting quality review

export const SEVERITY = {
  critical: {
    label: 'Critical',
    color: 'text-red-600',
    bg: 'bg-red-50',
    ring: 'ring-red-200',
    dot: 'bg-red-500',
    border: 'border-red-200',
    pillBg: 'bg-red-100',
  },
  warning: {
    label: 'Warning',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    dot: 'bg-amber-400',
    border: 'border-amber-200',
    pillBg: 'bg-amber-100',
  },
  suggestion: {
    label: 'Suggestion',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
    dot: 'bg-blue-400',
    border: 'border-blue-200',
    pillBg: 'bg-blue-100',
  },
};

export const CATEGORIES = {
  formatting: {
    label: 'Formatting',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  grammar: {
    label: 'Grammar',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  content: {
    label: 'Content',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  metadata: {
    label: 'Metadata',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  technical: {
    label: 'Technical',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
};

export function generateIssues(book) {
  const issues = [];

  if (book.manuscript_url) {
    // Formatting Issues
    issues.push({
      id: 'margin_narrow',
      severity: 'critical',
      category: 'formatting',
      title: 'Page margin too narrow on some devices',
      area: 'Body',
      page: 12,
      summary: 'The left margin on page 12 is 6 mm — slightly below the recommended 8 mm safe zone. Content may appear cramped on smaller eReader screens.',
      why: 'Tight margins can cause text to feel crowded and may be clipped on certain devices, reducing readability.',
      fix: 'Increase left and right margins to at least 8 mm (0.3 in) in your source document and re-export the manuscript.',
      action: 'reupload',
    });
    issues.push({
      id: 'inconsistent_fonts',
      severity: 'warning',
      category: 'formatting',
      title: 'Inconsistent font usage detected',
      area: 'Body',
      page: 25,
      summary: 'Multiple font styles or sizes are used within the same paragraph on page 25, leading to an inconsistent look.',
      why: 'Inconsistent formatting can distract readers and make your book appear unprofessional. Ensure a consistent style guide.',
      fix: 'Review your manuscript for consistent font application. Use paragraph and character styles to maintain uniformity, then re-upload.',
      action: 'reupload',
    });

    // Grammar Issues
    issues.push({
      id: 'grammar_recieve',
      severity: 'warning',
      category: 'grammar',
      title: '"recieve" — possible misspelling',
      area: 'Body',
      page: 38,
      summary: 'The word "recieve" on page 38 appears to be a misspelling. The correct spelling is "receive".',
      why: 'Spelling errors reduce reader trust and can lead to negative reviews that affect your sales rankings.',
      fix: 'Open your source file, find "recieve" on page 38, correct it to "receive", and re-upload the manuscript.',
      action: 'reupload',
    });
    issues.push({
      id: 'grammar_definately',
      severity: 'warning',
      category: 'grammar',
      title: '"definately" — possible misspelling',
      area: 'Body',
      page: 55,
      summary: 'The word "definately" on page 55 appears to be a misspelling. The correct spelling is "definitely".',
      why: 'Spelling errors reduce reader trust and can lead to negative reviews that affect your sales rankings.',
      fix: 'Open your source file, find "definately" on page 55, correct it to "definitely", and re-upload the manuscript.',
      action: 'reupload',
    });
    issues.push({
      id: 'passive_voice',
      severity: 'suggestion',
      category: 'grammar',
      title: 'Overuse of passive voice',
      area: 'Body',
      page: 42,
      summary: 'Several sentences on page 42 are written in the passive voice. Active voice often makes writing clearer and more engaging.',
      why: 'Excessive passive voice can make your prose sound wordy, indirect, and less impactful, potentially disengaging readers.',
      fix: 'Review sentences on page 42 and convert passive constructions to active voice where appropriate for stronger, more direct language.',
      action: 'reupload',
    });


    // Technical/Content Issues
    issues.push({
      id: 'missing_toc',
      severity: 'critical',
      category: 'technical',
      title: 'Table of Contents not detected',
      area: 'TOC',
      page: null,
      summary: 'No navigable Table of Contents was found in your manuscript. Most eReaders require a TOC for proper chapter navigation.',
      why: 'Without a TOC, readers cannot jump between chapters, leading to poor reading experience and potential rejection by storefronts.',
      fix: 'Add a linked Table of Contents in your source document before exporting. Ensure headings are properly styled so the TOC is auto-generated.',
      action: 'reupload',
    });

    issues.push({
      id: 'low_res_image',
      severity: 'warning',
      category: 'content',
      title: 'Low-resolution image detected',
      area: 'Images',
      page: 22,
      summary: 'An image on page 22 is below the recommended 150 DPI for eBook display. It may appear blurry on high-resolution screens.',
      why: 'Low-resolution images degrade the reading experience and can cause rejection on premium storefronts.',
      fix: 'Replace the image on page 22 with a version at 150 DPI or higher, then re-upload the manuscript.',
      action: 'reupload',
    });
  }

  return { issues };
}