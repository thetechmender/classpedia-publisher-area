import React from 'react';
import { Star, MessageSquare, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const mockReviews = [
  { id: 1, book: 'The Silent Algorithm', reviewer: 'Jane D.', rating: 5, comment: 'Absolutely brilliant read. Could not put it down!', date: '2026-05-10', status: 'published' },
  { id: 2, book: 'The Silent Algorithm', reviewer: 'Mark T.', rating: 3, comment: 'Good story but pacing was slow in the middle.', date: '2026-05-08', status: 'published' },
  { id: 3, book: 'Echoes of Tomorrow', reviewer: 'Sarah K.', rating: 4, comment: 'Loved the world-building. Characters feel real.', date: '2026-05-05', status: 'published' },
];

const mockIssues = [
  { id: 1, title: 'Cover image not displaying on mobile', book: 'The Silent Algorithm', severity: 'medium', status: 'open', date: '2026-05-12' },
  { id: 2, title: 'Formatting issue in Chapter 3', book: 'Echoes of Tomorrow', severity: 'low', status: 'resolved', date: '2026-05-01' },
];

const severityColor = { high: 'text-red-600 bg-red-50', medium: 'text-amber-600 bg-amber-50', low: 'text-blue-600 bg-blue-50' };
const statusColor = { open: 'text-amber-600 bg-amber-50', resolved: 'text-green-600 bg-green-50' };

export default function ReviewsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reviews & Issues</h1>
        <p className="text-muted-foreground mt-1">Monitor reader feedback and track content issues.</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: mockReviews.length, icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg. Rating', value: '4.0 ★', icon: Star, color: 'text-amber-600 bg-amber-50' },
          { label: 'Open Issues', value: mockIssues.filter(i => i.status === 'open').length, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Recent Reviews</h2>
        </div>
        <div className="divide-y">
          {mockReviews.map(review => (
            <div key={review.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{review.reviewer}</p>
                  <p className="text-xs text-muted-foreground">{review.book} · {review.date}</p>
                  <p className="text-sm mt-1 text-foreground/80">{review.comment}</p>
                </div>
                <div className="flex gap-0.5 shrink-0">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">Content Issues</h2>
        </div>
        <div className="divide-y">
          {mockIssues.map(issue => (
            <div key={issue.id} className="px-5 py-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium">{issue.title}</p>
                <p className="text-xs text-muted-foreground">{issue.book} · Reported {issue.date}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${severityColor[issue.severity]}`}>{issue.severity}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor[issue.status]}`}>{issue.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}