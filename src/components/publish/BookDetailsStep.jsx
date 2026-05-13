import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ChevronRight, BookOpen, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Chinese', 'Korean', 'Hindi', 'Arabic', 'Russian',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish'
];

const CATEGORIES = [
  'Arts & Photography', 'Biographies & Memoirs', 'Business & Money',
  'Children\'s eBooks', 'Comics & Graphic Novels', 'Computers & Technology',
  'Cookbooks, Food & Wine', 'Crafts, Hobbies & Home', 'Education & Teaching',
  'Engineering & Transportation', 'Health, Fitness & Dieting', 'History',
  'Humor & Entertainment', 'Law', 'Literature & Fiction', 'Medical eBooks',
  'Mystery, Thriller & Suspense', 'Parenting & Relationships',
  'Politics & Social Sciences', 'Reference', 'Religion & Spirituality',
  'Romance', 'Science & Math', 'Science Fiction & Fantasy',
  'Self-Help', 'Sports & Outdoors', 'Teen & Young Adult', 'Travel'
];

const CONTRIBUTOR_ROLES = [
  'Co-author', 'Editor', 'Illustrator', 'Translator', 'Foreword', 'Narrator', 'Photographer'
];

const FieldLabel = ({ label, required, tooltip }) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

export default function BookDetailsStep({ data, onChange, errors, onNext }) {
  const [keywordInput, setKeywordInput] = useState('');
  const [newContributor, setNewContributor] = useState({ name: '', role: '' });

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && (data.keywords || []).length < 7 && !data.keywords?.includes(kw)) {
      onChange({ keywords: [...(data.keywords || []), kw] });
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw) => {
    onChange({ keywords: (data.keywords || []).filter(k => k !== kw) });
  };

  const addContributor = () => {
    if (newContributor.name && newContributor.role) {
      onChange({ contributors: [...(data.contributors || []), { ...newContributor }] });
      setNewContributor({ name: '', role: '' });
    }
  };

  const removeContributor = (index) => {
    onChange({ contributors: (data.contributors || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">Book Details</h2>
          <p className="text-sm text-muted-foreground">Tell readers about your book</p>
        </div>
      </div>

      {/* Language */}
      <div>
        <FieldLabel label="Language" required tooltip="The primary language your book is written in" />
        <Select value={data.language || ''} onValueChange={(v) => onChange({ language: v })}>
          <SelectTrigger className={errors.language ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.language && <p className="text-xs text-destructive mt-1">{errors.language}</p>}
      </div>

      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel label="Book Title" required tooltip="The main title that will appear on the product page" />
          <Input
            value={data.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Enter your book title"
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>
        <div>
          <FieldLabel label="Subtitle" tooltip="Optional subtitle for your book" />
          <Input
            value={data.subtitle || ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Enter subtitle (optional)"
          />
        </div>
      </div>

      {/* Series */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel label="Series Name" tooltip="If this book is part of a series" />
          <Input
            value={data.series_name || ''}
            onChange={(e) => onChange({ series_name: e.target.value })}
            placeholder="Series name (optional)"
          />
        </div>
        <div>
          <FieldLabel label="Series Number" />
          <Input
            type="number"
            value={data.series_number || ''}
            onChange={(e) => onChange({ series_number: e.target.value ? Number(e.target.value) : '' })}
            placeholder="Volume #"
          />
        </div>
      </div>

      {/* Edition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FieldLabel label="Edition Number" />
          <Input
            value={data.edition_number || ''}
            onChange={(e) => onChange({ edition_number: e.target.value })}
            placeholder="e.g. 1st, 2nd"
          />
        </div>
        <div>
          <FieldLabel label="Publication Date" />
          <Input
            type="date"
            value={data.publication_date || ''}
            onChange={(e) => onChange({ publication_date: e.target.value })}
          />
        </div>
      </div>

      {/* Author */}
      <div>
        <FieldLabel label="Author" required tooltip="The primary author's name as it will appear on the book" />
        <Input
          value={data.author_name || ''}
          onChange={(e) => onChange({ author_name: e.target.value })}
          placeholder="Author name"
          className={errors.author_name ? 'border-destructive' : ''}
        />
        {errors.author_name && <p className="text-xs text-destructive mt-1">{errors.author_name}</p>}
      </div>

      {/* Contributors */}
      <div>
        <FieldLabel label="Contributors" tooltip="Add editors, illustrators, translators, etc." />
        {(data.contributors || []).length > 0 && (
          <div className="space-y-2 mb-3">
            {data.contributors.map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                <span className="text-sm flex-1">{c.name}</span>
                <Badge variant="outline" className="text-xs">{c.role}</Badge>
                <button onClick={() => removeContributor(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newContributor.name}
            onChange={(e) => setNewContributor({ ...newContributor, name: e.target.value })}
            placeholder="Contributor name"
            className="flex-1"
          />
          <Select value={newContributor.role} onValueChange={(v) => setNewContributor({ ...newContributor, role: v })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {CONTRIBUTOR_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="icon" onClick={addContributor}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel label="Description" required tooltip="A compelling description that will appear on the product page. HTML is supported." />
        <Textarea
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Write a compelling book description..."
          className={`min-h-[160px] ${errors.description ? 'border-destructive' : ''}`}
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          <p className="text-xs text-muted-foreground ml-auto">{(data.description || '').length} / 4,000</p>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <FieldLabel label="Keywords" tooltip="Up to 7 keywords to help readers find your book. Choose relevant search terms." />
        <div className="flex flex-wrap gap-2 mb-2">
          {(data.keywords || []).map(kw => (
            <Badge key={kw} variant="secondary" className="gap-1 py-1 px-2.5">
              {kw}
              <button onClick={() => removeKeyword(kw)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        {(data.keywords || []).length < 7 && (
          <div className="flex gap-2">
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Add a keyword"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addKeyword}>Add</Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{(data.keywords || []).length}/7 keywords</p>
      </div>

      {/* Categories */}
      <div>
        <FieldLabel label="Categories" tooltip="Choose up to 2 browse categories for your book" />
        {(data.categories || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {data.categories.map(cat => (
              <Badge key={cat} className="gap-1 py-1 px-2.5 bg-accent text-accent-foreground">
                {cat}
                <button onClick={() => onChange({ categories: data.categories.filter(c => c !== cat) })}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {(data.categories || []).length < 2 && (
          <Select onValueChange={(v) => {
            if (!data.categories?.includes(v)) {
              onChange({ categories: [...(data.categories || []), v] });
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Age Range */}
      <div>
        <FieldLabel label="Age Range" tooltip="Specify if your book targets a specific age group" />
        <Select value={data.age_range || 'not_specified'} onValueChange={(v) => onChange({ age_range: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_specified">Not Specified</SelectItem>
            <SelectItem value="4_6">4–6 years</SelectItem>
            <SelectItem value="7_9">7–9 years</SelectItem>
            <SelectItem value="10_12">10–12 years</SelectItem>
            <SelectItem value="13_17">13–17 years</SelectItem>
            <SelectItem value="18_plus">18+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Next */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onNext} className="gap-2 px-8">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}