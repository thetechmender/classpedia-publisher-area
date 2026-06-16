import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Pencil } from 'lucide-react';

export default function BookRowActions({ book }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/book/${book.id}`)}
        className="h-8 px-3 gap-1.5 text-xs font-medium rounded-lg border-border hover:bg-accent hover:text-accent-foreground"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </Button>
      <Button
        size="sm"
        onClick={() => navigate(`/publish?bookId=${book.id}`)}
        className="h-8 px-3 gap-1.5 text-xs font-medium rounded-lg shadow-sm shadow-primary/20"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </Button>
    </div>
  );
}