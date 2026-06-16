import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildNotifications, TYPE_CONFIG } from '@/lib/notificationDefinitions';

function NotificationRow({ n }) {
  const tc = TYPE_CONFIG[n.type];
  const Icon = n.icon;

  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b last:border-0">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5', n.iconBg)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{n.title}</p>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', tc.badgeClass)}>
            {tc.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
      </div>
    </div>
  );
}

export default function NotificationsTab({ books = [], authorProfile = null, onBackToDashboard }) {
  const notifications = buildNotifications(books, authorProfile);

  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
            <p className="font-semibold text-sm">All clear</p>
            <p className="text-xs text-muted-foreground mt-1">No notifications at this time.</p>
          </div>
        ) : (
          notifications.map(n => <NotificationRow key={n.id} n={n} />)
        )}
      </div>
  );
}