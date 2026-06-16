import React from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function BulkActionsBar({ selectedCount, totalCount, onSelectAll, onClearSelection, onBulkDelete }) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl transition-all',
    )}>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
          <CheckSquare className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-primary">
          {selectedCount} selected
        </span>
        <span className="text-xs text-muted-foreground">of {totalCount}</span>
        <button
          onClick={onSelectAll}
          className="text-xs text-primary hover:underline font-medium ml-1"
        >
          Select all {totalCount}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 h-7 text-xs"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </Button>
        <button
          onClick={onClearSelection}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}