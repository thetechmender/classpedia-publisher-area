import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EyeOff } from 'lucide-react';

export default function UnpublishDialog({ book, open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(reason.trim());
    setLoading(false);
    setReason('');
    onClose();
  };

  const handleClose = () => {
    if (loading) return;
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <EyeOff className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground leading-tight">
                Unpublish / Delist
              </DialogTitle>
              <p className="text-xs text-amber-600 font-medium mt-0.5">"{book?.title}"</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            This book will be removed from the marketplace. Existing buyers keep their copies.
          </p>
          <Textarea
            placeholder="Enter a reason for delisting..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="resize-none text-sm bg-background"
          />
          {!reason.trim() && (
            <p className="text-[11px] text-red-500 mt-1">A reason is required to proceed.</p>
          )}
        </div>
        <DialogFooter className="px-5 pb-5 flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
            className="flex-1 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40"
          >
            <EyeOff className="w-3.5 h-3.5" />
            {loading ? 'Delisting…' : 'Delist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}