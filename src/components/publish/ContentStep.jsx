import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, ChevronRight, Upload, FileText, ImageIcon,
  X, Info, Cpu, Eye, BookOpen, CheckCircle2, AlertCircle, Layers } from
'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import BookPreviewer from './BookPreviewer';

const Section = ({ icon: Icon, title, subtitle, children }) =>
<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
    <div className="flex items-start gap-3 px-5 py-4 bg-secondary/40 border-b border-border">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>;


const FieldLabel = ({ label, required, tooltip }) =>
<div className="flex items-center gap-1.5 mb-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {tooltip &&
  <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
  }
  </div>;


const SUPPORTED_FORMATS = ['EPUB', 'MOBI', 'KPF', 'DOC', 'DOCX', 'PDF'];

export default function ContentStep({ data, onChange, errors, onNext, onBack }) {
  const manuscriptRef = useRef(null);
  const coverRef = useRef(null);
  const sampleRef = useRef(null);
  const [uploading, setUploading] = useState({ manuscript: false, cover: false, sample: false });
  const [showPreviewer, setShowPreviewer] = useState(false);

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [type]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === 'manuscript') {
      onChange({ manuscript_url: file_url, manuscript_filename: file.name });
    } else if (type === 'sample') {
      onChange({ sample_url: file_url, sample_filename: file.name });
    } else {
      onChange({ cover_url: file_url });
    }
    setUploading((prev) => ({ ...prev, [type]: false }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif text-foreground">eBook Content</h2>
          <p className="text-sm text-muted-foreground">Upload your manuscript, cover image, and configure content settings</p>
        </div>
      </div>

      {/* ── 1. MANUSCRIPT ── */}
      <Section icon={FileText} title="Manuscript" subtitle="Upload your book's interior content file">
        <p className="text-sm text-muted-foreground mb-1">
          Upload your manuscript (your book's interior content). We recommend using an EPUB file for best results.
        </p>
        <p className="text-xs text-muted-foreground mb-4 hidden">
          For help formatting your manuscript with professional themes, chapter titles, or images, refer to our{' '}
          <span className="text-primary cursor-pointer hover:underline">eBook Formatting Guide</span>.
        </p>

        <input
          ref={manuscriptRef}
          type="file"
          accept=".epub,.mobi,.doc,.docx,.pdf,.kpf"
          className="hidden"
          onChange={(e) => handleFileUpload('manuscript', e.target.files[0])} />
        

        {data.manuscript_url ?
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{data.manuscript_filename || 'Manuscript uploaded'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Uploaded successfully
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => manuscriptRef.current?.click()} className="shrink-0">
              Replace
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onChange({ manuscript_url: '', manuscript_filename: '' })}>
              <X className="w-4 h-4" />
            </Button>
          </div> :

        <button
          onClick={() => manuscriptRef.current?.click()}
          disabled={uploading.manuscript}
          className={cn(
            'w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors mb-4',
            'hover:border-primary hover:bg-primary/5',
            errors.manuscript_url ? 'border-destructive' : 'border-border'
          )}>
          
            {uploading.manuscript ?
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /> :

          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
          }
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {uploading.manuscript ? 'Uploading manuscript…' : 'Upload Manuscript'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported file types: {SUPPORTED_FORMATS.join(', ')}
              </p>
            </div>
          </button>
        }
        {errors.manuscript_url &&
        <p className="flex items-center gap-1 text-xs text-destructive mb-4">
            <AlertCircle className="w-3 h-3" /> {errors.manuscript_url}
          </p>
        }

        <Separator className="my-5" />

        {/* DRM */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Digital Rights Management (DRM)</p>
          <p className="text-sm text-muted-foreground mb-1">
            DRM protects the rights of copyright holders, and limits unauthorized access and distribution of the content.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Would you like to apply Digital Rights Management (DRM) to your files?
          </p>
          <RadioGroup
            value={data.drm ? 'yes' : 'no'}
            onValueChange={(v) => onChange({ drm: v === 'yes' })}
            className="space-y-2">
            
            <label className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
              data.drm ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="yes" className="text-primary" />
              <div>
                <p className="text-sm font-medium">Yes, apply Digital Rights Management</p>
                <p className="text-xs text-muted-foreground mt-0.5">Readers will need the Classpedia app to access this title. Cannot be changed after publication.</p>
              </div>
            </label>
            <label className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
              !data.drm ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
            )}>
              <RadioGroupItem value="no" className="text-primary" />
              <div>
                <p className="text-sm font-medium">No, do not apply DRM</p>
                <p className="text-xs text-muted-foreground mt-0.5">Allow customers who buy this book to download it as a PDF or EPUB file.</p>
              </div>
            </label>
          </RadioGroup>
        </div>
      </Section>

      {/* ── 2. SAMPLE CHAPTER ── */}
      <Section icon={Layers} title="Sample Chapter" subtitle="Give readers a free preview to boost conversions">
        <p className="text-sm text-muted-foreground mb-1">
          A sample chapter lets potential readers try before they buy. Classpedia displays it as a free excerpt on your book's product page.
        </p>
        <p className="text-xs text-muted-foreground mb-4">Upload the first chapter or an introductory excerpt (PDF, EPUB, DOCX). 

        </p>

        <input
          ref={sampleRef}
          type="file"
          accept=".epub,.doc,.docx,.pdf"
          className="hidden"
          onChange={(e) => handleFileUpload('sample', e.target.files[0])} />
        

        {data.sample_url ?
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{data.sample_filename || 'Sample chapter uploaded'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Uploaded successfully
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => sampleRef.current?.click()} className="shrink-0">
              Replace
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onChange({ sample_url: '', sample_filename: '' })}>
              <X className="w-4 h-4" />
            </Button>
          </div> :

        <button
          onClick={() => sampleRef.current?.click()}
          disabled={uploading.sample}
          className={cn(
            'w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-colors',
            'hover:border-primary hover:bg-primary/5 border-border'
          )}>
          
            {uploading.sample ?
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /> :

          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
          }
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {uploading.sample ? 'Uploading sample…' : 'Upload Sample Chapter'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, EPUB or DOCX · Optional</p>
            </div>
          </button>
        }
      </Section>

      {/* ── 3. BOOK COVER ── */}
      <Section icon={ImageIcon} title="Book Cover" subtitle="Upload a high-quality cover image for your eBook">
        <p className="text-xs text-muted-foreground mb-4">
          Your cover is the first thing readers see. Use a high-resolution image for the best impression.
          Recommended size: <strong>2560 × 1600 px</strong>, JPEG or PNG.
        </p>

        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload('cover', e.target.files[0])} />
        

        {data.cover_url ?
        <div className="flex items-start gap-5 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <img src={data.cover_url} alt="Book cover" className="w-24 h-36 object-cover rounded-lg shadow-md shrink-0" />
            <div className="flex-1 pt-1">
              <p className="text-sm font-semibold text-foreground">Cover uploaded</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Image ready for publishing
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => coverRef.current?.click()}>
                  Replace Cover
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onChange({ cover_url: '' })}>
                  <X className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </div>
            </div>
          </div> :

        <button
          onClick={() => coverRef.current?.click()}
          disabled={uploading.cover}
          className={cn(
            'w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors',
            'hover:border-primary hover:bg-primary/5',
            errors.cover_url ? 'border-destructive' : 'border-border'
          )}>
          
            {uploading.cover ?
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /> :

          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
          }
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {uploading.cover ? 'Uploading cover…' : 'Upload Cover Image'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">JPEG or PNG · Recommended 2560 × 1600 px</p>
            </div>
          </button>
        }
        {errors.cover_url &&
        <p className="flex items-center gap-1 text-xs text-destructive mt-2">
            <AlertCircle className="w-3 h-3" /> {errors.cover_url}
          </p>
        }
      </Section>

      {/* ── 3. AI-GENERATED CONTENT ── */}
      <Section icon={Cpu} title="AI-Generated Content" subtitle="Transparency about the use of AI tools in your book">
        <p className="text-sm text-muted-foreground mb-1">
          Classpedia is collecting information about the use of Artificial Intelligence (AI) tools in creating content.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Did you use AI tools in creating texts, images, and/or translations in your book?
        </p>
        <RadioGroup
          value={data.ai_generated != null ? data.ai_generated ? 'yes' : 'no' : ''}
          onValueChange={(v) => onChange({ ai_generated: v === 'yes' })}
          className="space-y-2">
          
          <label className={cn(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            data.ai_generated === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="yes" className="text-primary" />
            <span className="text-sm font-medium">Yes</span>
          </label>
          <label className={cn(
            'flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all',
            data.ai_generated === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          )}>
            <RadioGroupItem value="no" className="text-primary" />
            <span className="text-sm font-medium">No</span>
          </label>
        </RadioGroup>
        {data.ai_generated &&
        <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              AI-generated content is permitted on Classpedia. Disclosing its use helps maintain reader trust and platform transparency.
            </p>
          </div>
        }
      </Section>

      {/* ── 4. CLASSPEDIA PREVIEW ── */}
      <Section icon={Eye} title="Classpedia eBook Preview" subtitle="Preview your book before publishing">
        <p className="text-sm text-muted-foreground mb-1 font-medium">Online Preview & Quality Check</p>
        <p className="text-sm text-muted-foreground mb-5">
          Preview your book to check quality and see how it will appear to readers on Classpedia across devices.
          Make sure your formatting looks great before publishing.
        </p>
        <Button
          variant="outline"
          onClick={() => setShowPreviewer(true)}
          disabled={!data.manuscript_url && !data.cover_url}
          className={cn(
            'gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary',
            !data.manuscript_url && !data.cover_url && 'opacity-50 cursor-not-allowed'
          )}>
          
          <Eye className="w-4 h-4" />
          Launch Preview
        </Button>
        {!data.manuscript_url && !data.cover_url &&
        <p className="text-xs text-muted-foreground mt-2">Upload a manuscript or cover to enable the preview.</p>
        }
      </Section>

      {/* ── 5. ISBN ── */}
      <Section icon={BookOpen} title="eBook ISBN" subtitle="Optional identifier for your book">
        <p className="text-sm text-muted-foreground mb-4">
          eBooks published on Classpedia are not required to have an ISBN. You may enter one if you have it.
        </p>
        <div className="mb-4">
          <FieldLabel label="ISBN (Optional)" tooltip="International Standard Book Number — a unique identifier for your book" />
          <Input
            value={data.isbn || ''}
            onChange={(e) => onChange({ isbn: e.target.value })}
            placeholder="e.g. 978-3-16-148410-0"
            className="bg-background max-w-sm" />
          
        </div>
      </Section>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-8 h-11 text-sm font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 transition-shadow">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Book Previewer Modal */}
      {showPreviewer &&
      <BookPreviewer
        book={data}
        onClose={() => setShowPreviewer(false)} />

      }
    </div>);

}