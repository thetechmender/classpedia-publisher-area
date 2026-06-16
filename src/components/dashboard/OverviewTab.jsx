import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Plus, BookOpen, CheckCircle2, Clock, FileEdit,
  DollarSign, Sparkles, Activity, PenLine, Trash2,
  RefreshCw, MessageSquare, Upload } from
'lucide-react';
import { base44 } from '@/api/base44Client';
import MyBooksWidget from '@/components/overview/MyBooksWidget';
import SalesRoyaltiesWidget from '@/components/overview/SalesRoyaltiesWidget';
import IssuesWidget from '@/components/overview/IssuesWidget';


import StatusBadge from '@/components/shared/StatusBadge';

function KpiCard({ icon: Icon, label, value, sub, subColor, iconColor, iconBg, onClick, breakdown }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <button
    onClick={onClick}
    onMouseEnter={() => breakdown && setShowDetails(true)}
    onMouseLeave={() => setShowDetails(false)}
    className="bg-card border border-border rounded-2xl p-5 text-left group w-full relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">

    {/* Subtle gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 pointer-events-none" />
      
      <div className="relative">
        {/* Icon + Label */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.8} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em] flex-1">{label}</p>
        </div>
        
        {/* Big number */}
        <p className="text-4xl font-bold tracking-tight text-foreground leading-none mb-3">{value}</p>
        
        {/* Helper text */}
        {sub && !showDetails && (
          <p className={`text-[11px] font-medium ${subColor || 'text-muted-foreground'} transition-opacity duration-200`}>{sub}</p>
        )}
        
        {/* Breakdown details on hover */}
        {breakdown && showDetails && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-foreground ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>);

}



const ACTION_ICON = {
  create: { icon: Plus, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  update: { icon: PenLine, bg: 'bg-blue-100', color: 'text-blue-600' },
  delete: { icon: Trash2, bg: 'bg-red-100', color: 'text-red-600' },
  status_change: { icon: RefreshCw, bg: 'bg-amber-100', color: 'text-amber-600' },
  comment: { icon: MessageSquare, bg: 'bg-violet-100', color: 'text-violet-600' },
  upload: { icon: Upload, bg: 'bg-indigo-100', color: 'text-indigo-600' }
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const MOCK_LOGS = [
{ id: 'm1', action: 'create', description: 'New book "The Silent Algorithm" was submitted for publishing', user_name: 'You', created_date: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
{ id: 'm2', action: 'upload', description: 'Manuscript uploaded for "Intro to Quantum Computing"', user_name: 'You', created_date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
{ id: 'm3', action: 'update', description: 'Pricing updated for "Deep Learning Fundamentals" to $19.99', user_name: 'You', created_date: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString() },
{ id: 'm4', action: 'create', description: 'Draft created for "Mastering Neural Networks"', user_name: 'You', created_date: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString() },
{ id: 'm5', action: 'update', description: 'Cover image updated for "The Silent Algorithm"', user_name: 'You', created_date: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString() },
{ id: 'm6', action: 'create', description: '"Mastering Neural Networks" submitted for editorial review', user_name: 'You', created_date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() }];


const EDITORIAL_NAMES = ['classpedia editorial', 'editorial', 'classpedia', 'admin'];

function RecentActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ActivityLog.list('-created_date', 20).
    then((real) => {
      // Keep only author's own actions — exclude any editorial/admin entries
      const authorOnly = real.filter((l) =>
      !l.user_name || !EDITORIAL_NAMES.includes(l.user_name.toLowerCase())
      );
      setLogs(authorOnly.length > 0 ? authorOnly.slice(0, 8) : MOCK_LOGS);
    }).
    finally(() => setLoading(false));
  }, []);

  const cfg = (action) => ACTION_ICON[action] || ACTION_ICON.update;

  return (
    <div className="lg:col-span-2 bg-card border rounded-2xl overflow-hidden shadow-sm">
    <div className="px-5 py-4 border-b flex items-center justify-between bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <p className="text-xs text-muted-foreground">Latest changes across your account</p>
        </div>
      </div>
    </div>

      {loading ?
      <div className="px-5 py-10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div> :
      logs.length === 0 ?
      <div className="px-5 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-foreground">No activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">Actions like publishing or editing books will appear here.</p>
        </div> :

      <ul className="divide-y">
          {logs.map((log) => {
          const { icon: Icon, bg, color } = cfg(log.action);
          return (
            <li key={log.id} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-secondary/20 transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{log.description}</p>
                  {log.user_name &&
                <p className="text-xs text-muted-foreground mt-0.5">{log.user_name}</p>
                }
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5 shrink-0">
                  {timeAgo(log.created_date)}
                </span>
              </li>);

        })}
        </ul>
      }
    </div>);

}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function OverviewTab({ books, authorProfile, onTabChange }) {
  const firstName = authorProfile?.full_name?.split(' ')[0] || 'there';

  const stats = {
    total: books.length,
    published: books.filter((b) => b.status === 'published').length,
    in_review: books.filter((b) => b.status === 'in_review').length,
    draft: books.filter((b) => b.status === 'draft').length
  };

  const estimatedRoyalties = books.
  filter((b) => b.status === 'published' && b.list_price).
  reduce((sum, b) => sum + b.list_price * (parseFloat(b.royalty_plan || 70) / 100), 0);

  return (
    <div className="space-y-3.5">

      {/* ── Welcome Hero ── */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm"
      style={{ background: 'linear-gradient(135deg, hsl(221 83% 53% / 0.12) 0%, hsl(262 83% 58% / 0.08) 50%, hsl(196 80% 50% / 0.08) 100%)' }}>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
              {getFormattedDate()}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {getGreeting()}, <span className="text-primary">{firstName}</span>
              
            </h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-lg">
              {stats.total === 0 ?
              'Your publishing workspace is ready. Start by submitting your first eBook.' :
              stats.in_review > 0 ?
              `${stats.in_review} book${stats.in_review > 1 ? 's' : ''} under review · ${stats.published} live on platform` :
              stats.published > 0 ?
              `${stats.published} title${stats.published !== 1 ? 's' : ''} live. Keep publishing to grow your catalog.` :
              'Drafts in progress. Complete them to start earning royalties.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:shrink-0">
            <Link to="/publish">
              <Button className="gap-2 h-10 px-5 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Publish New Book
              </Button>
            </Link>
            {stats.total > 0 &&
            <Button
              variant="outline"
              onClick={() => onTabChange('books')}
              className="gap-2 h-10 px-5 bg-white/60 backdrop-blur-sm">
              
                <BookOpen className="w-4 h-4" /> My Books
              </Button>
            }
          </div>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
         icon={BookOpen}
         label="Total Books"
         value={stats.total}
         sub={stats.total === 0 ? 'No books yet' : `${stats.published} published · ${stats.in_review} in review · ${stats.draft} draft${stats.draft !== 1 ? 's' : ''}`}
         subColor="text-muted-foreground"
         iconBg="bg-slate-100"
         iconColor="text-slate-600"
         onClick={() => onTabChange('books')} />
        
        <KpiCard
          icon={CheckCircle2}
          label="Published Books"
          value={stats.published}
          sub={stats.published === 0 ? 'No published books' : 'Live on platform'}
          subColor={stats.published > 0 ? 'text-emerald-600' : 'text-muted-foreground'}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          onClick={() => onTabChange('books')} />
        
        <KpiCard
          icon={Clock}
          label="Books in Review"
          value={stats.in_review}
          sub={stats.in_review > 0 ? 'Estimated approval within 72 hrs' : 'No books in review'}
          subColor={stats.in_review > 0 ? 'text-amber-600' : 'text-muted-foreground'}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          onClick={() => onTabChange('reviews')} />
        
        <KpiCard
          icon={FileEdit}
          label="Drafts"
          value={stats.draft}
          sub={stats.draft > 0 ? 'Incomplete · needs action' : 'No drafts'}
          subColor={stats.draft > 0 ? 'text-violet-600' : 'text-muted-foreground'}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          onClick={() => onTabChange('books')} />
        
        <KpiCard
          icon={DollarSign}
          label="Estimated Royalties"
          value={`$${estimatedRoyalties.toFixed(2)}`}
          sub={stats.published === 0 ? 'From 0 published books' : `From ${stats.published} published book${stats.published !== 1 ? 's' : ''}`}
          subColor={estimatedRoyalties > 0 ? 'text-emerald-600' : 'text-muted-foreground'}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          onClick={() => onTabChange('royalties')} />
        
      </div>

      {/* ── Row 1: My Books + Sales & Royalties ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3">
          <MyBooksWidget books={books} onTabChange={onTabChange} />
        </div>
        <div className="lg:col-span-2">
          <SalesRoyaltiesWidget books={books} onTabChange={onTabChange} />
        </div>
      </div>

      {/* ── Row 2: Recent Activity + Issues ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 h-full">
          <RecentActivity />
        </div>
        <div className="lg:col-span-2 h-full">
          <IssuesWidget books={books} onTabChange={onTabChange} />
        </div>
      </div>



    </div>);

}