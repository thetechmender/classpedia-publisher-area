import React from 'react';
import { cn } from '@/lib/utils';

export default function CardHeader({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('px-5 py-4 border-b flex items-center justify-between bg-muted/30', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}