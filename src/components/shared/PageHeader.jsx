import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PageHeader({ title, description, action, className }) {
  const renderAction = (actionItem, idx) => {
    if (actionItem.component === Link) {
      return (
        <Link key={idx} to={actionItem.to}>
          <Button className={cn('gap-2 h-10 px-5', actionItem.className)}>
            {actionItem.icon && <actionItem.icon className="w-4 h-4" />}
            {actionItem.label}
          </Button>
        </Link>
      );
    }
    return (
      <Button
        key={idx}
        onClick={actionItem.onClick}
        className={cn('gap-2 h-10 px-5', actionItem.className)}
      >
        {actionItem.icon && <actionItem.icon className="w-4 h-4" />}
        {actionItem.label}
      </Button>
    );
  };

  return (
    <div className={cn('flex items-start justify-between gap-4 flex-wrap', className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2 flex-wrap">
          {renderAction(action, 0)}
        </div>
      )}
    </div>
  );
}