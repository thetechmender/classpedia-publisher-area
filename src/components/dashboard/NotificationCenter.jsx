import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buildNotifications, TYPE_CONFIG } from '@/lib/notificationDefinitions';

export default function NotificationCenter({ books = [], authorProfile = null, onTabChange }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const ref = useRef(null);
  const navigate = useNavigate();

  const allNotifications = buildNotifications(books, authorProfile);
  const visible = allNotifications.filter(n => !dismissed.has(n.id));
  const urgentCount = visible.filter(n => n.type === 'warning').length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dismiss = (id) => setDismissed(prev => new Set([...prev, id]));

  const handleCta = (action) => {
    setOpen(false);
    if (action.to) navigate(action.to);
    else if (action.tab && onTabChange) onTabChange(action.tab);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate('/notifications');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg transition-colors relative',
          open ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {visible.length > 0 && (
          <span className={cn(
            'absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center text-white px-1',
            urgentCount > 0 ? 'bg-red-500' : 'bg-primary'
          )}>
            {visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-card border rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 border-b flex items-center justify-between bg-secondary/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm font-semibold">Notifications</p>
              {visible.length > 0 && (
                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {visible.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {visible.length > 0 && (
                <button
                  onClick={() => setDismissed(new Set(allNotifications.map(n => n.id)))}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={handleViewAll}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                View all
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[440px] overflow-y-auto">
            {visible.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold">All caught up</p>
                <p className="text-xs text-muted-foreground mt-1">No pending notifications.</p>
              </div>
            ) : (
              visible.map((n) => {
                const Icon = n.icon;
                const style = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                return (
                  <div
                    key={n.id}
                    className="relative flex items-start gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors group border-b last:border-0"
                  >
                    {/* Left accent bar */}
                    <div className={cn('absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full', style.bar)} />
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', style.iconBg)}>
                      <Icon className={cn('w-3.5 h-3.5', style.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0 pl-0.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
                        <p className="text-xs font-semibold leading-snug text-foreground">{n.title}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.body}</p>
                      {n.action && (
                        <button
                          onClick={() => handleCta(n.action)}
                          className={cn('mt-2 inline-flex items-center gap-1 text-[11px] font-semibold hover:underline', style.iconColor)}
                        >
                          {n.action.label} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="shrink-0 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}