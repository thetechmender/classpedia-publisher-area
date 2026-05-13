import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, ChevronRight, Upload, FileText, Image, Shield, X, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { base44 } from '@/api/base44Client';

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

export default function ContentStep({ data, onChange, errors, onNext, onBack }) {
  const manuscriptRef = useRef(null);
  const coverRef = useRef(null);
  const [uploading, setUploading] = useState({ manuscript: false, cover: false });

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (type === 'manuscript') {
      onChange({ manuscript_url: file_url, manuscript_filename: file.name });
    } else {
      onChange({ cover_url: file_url });
    }
    setUploading(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          <FileText className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold font-serif">eBook Content</h2>
          <p className="text-sm text-muted-foreground">Upload your manuscript and cover</p>
        </div>
      </div>

      {/* Manuscript Upload */}
      <div>
        <FieldLabel
          label="eBook Manuscript"
          required
          tooltip="Upload your manuscript in EPUB, MOBI, KPF, or DOC/DOCX format"
        />
        <input
          ref={manuscriptRef}
          type="file"
          accept=".epub,.mobi,.doc,.docx,.pdf,.kpf"
          className="hidden"
          onChange={(e) => handleFileUpload('manuscript', e.target.files[0])}
        />
        {data.manuscript_url ? (
          <div className="flex items-center gap-3 bg-accent/50 border border-border rounded-xl p-4">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{data.manuscript_filename || 'Manuscript uploaded'}</p>
              <p className="text-xs text-muted-foreground">Uploaded successfully</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange({ manuscript_url: '', manuscript_filename: '' })}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => manuscriptRef.current?.click()}
            disabled={uploading.manuscript}
            className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors hover:border-primary hover:bg-accent/30 ${
              errors.manuscript_url ? 'border-destructive' : 'border-border'
            }`}
          >
            {uploading.manuscript ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {uploading.manuscript ? 'Uploading...' : 'Click to upload manuscript'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported: EPUB, MOBI, KPF, DOC, DOCX, PDF
              </p>
            </div>
          </button>
        )}
        {errors.manuscript_url && <p className="text-xs text-destructive mt-1">{errors.manuscript_url}</p>}
      </div>

      {/* Cover Upload */}
      <div>
        <FieldLabel
          label="Book Cover"
          required
          tooltip="Upload a high-quality cover image. Recommended: 2560 x 1600 pixels, JPEG or PNG"
        />
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload('cover', e.target.files[0])}
        />
        {data.cover_url ? (
          <div className="flex items-start gap-4 bg-accent/50 border border-border rounded-xl p-4">
            <img src={data.cover_url} alt="Book cover" className="w-24 h-36 object-cover rounded-lg shadow-md" />
            <div className="flex-1 pt-2">
              <p className="text-sm font-medium">Cover uploaded</p>
              <p className="text-xs text-muted-foreground mt-1">Image ready for publishing</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onChange({ cover_url: '' })}
              >
                Replace Cover
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => coverRef.current?.click()}
            disabled={uploading.cover}
            className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors hover:border-primary hover:bg-accent/30 ${
              errors.cover_url ? 'border-destructive' : 'border-border'
            }`}
          >
            {uploading.cover ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Image className="w-8 h-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium">
                {uploading.cover ? 'Uploading...' : 'Click to upload cover image'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 2560 × 1600px, JPEG or PNG
              </p>
            </div>
          </button>
        )}
        {errors.cover_url && <p className="text-xs text-destructive mt-1">{errors.cover_url}</p>}
      </div>

      {/* ISBN */}
      <div>
        <FieldLabel label="ISBN" tooltip="Enter your ISBN if you have one, or leave blank to have one assigned" />
        <Input
          value={data.isbn || ''}
          onChange={(e) => onChange({ isbn: e.target.value })}
          placeholder="Enter ISBN (optional)"
        />
      </div>

      {/* DRM */}
      <div className="bg-secondary/50 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Digital Rights Management (DRM)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Protect your content from unauthorized distribution. Once enabled, it cannot be changed.
                </p>
              </div>
              <Switch
                checked={data.drm || false}
                onCheckedChange={(v) => onChange({ drm: v })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} className="gap-2 px-8">
          Save & Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}