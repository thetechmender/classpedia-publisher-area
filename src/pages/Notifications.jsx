import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationsTab from '@/components/dashboard/NotificationsTab';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Notifications() {
  const navigate = useNavigate();

  const { data: authorProfile } = useQuery({
    queryKey: ['author-profile'],
    queryFn: () => base44.entities.AuthorProfile.list('-created_date', 1).then(res => res[0] || null),
  });

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-created_date'),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/90 backdrop-blur-sm sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Notifications</h1>
              <p className="text-xs text-muted-foreground">Stay updated on your publishing journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <NotificationsTab books={books} authorProfile={authorProfile} onBackToDashboard={() => navigate('/')} />
      </div>
    </div>
  );
}