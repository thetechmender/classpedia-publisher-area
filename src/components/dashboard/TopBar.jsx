import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, LogOut, User, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NotificationCenter from './NotificationCenter';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function TopBar({ authorProfile, books = [], onTabChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = authorProfile?.full_name
    ? authorProfile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const results = searchQuery.trim().length > 1
    ? books.filter(b =>
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="hidden md:flex h-14 border-b border-border/60 bg-white/80 backdrop-blur-md shrink-0 z-30 items-center px-6 gap-4">
      
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          placeholder="Search books, payments…"
          className="pl-9 pr-8 h-9 text-sm bg-slate-50 border-slate-200 hover:border-slate-300 focus-visible:ring-1 focus-visible:border-primary/40 rounded-xl transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Search results dropdown */}
        {searchOpen && results.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-border/60 rounded-xl shadow-xl z-50 overflow-hidden">
            <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Books</p>
            {results.map(book => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
              >
                {book.cover_url
                  ? <img src={book.cover_url} className="w-6 h-8 object-cover rounded shrink-0" alt="" />
                  : <div className="w-6 h-8 bg-slate-100 rounded flex items-center justify-center shrink-0">
                      <BookOpen className="w-3 h-3 text-muted-foreground" />
                    </div>
                }
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{book.status?.replace('_', ' ')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        {searchOpen && searchQuery.trim().length > 1 && results.length === 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-border/60 rounded-xl shadow-xl z-50 px-4 py-3.5 text-sm text-muted-foreground">
            No results for "<span className="font-medium text-foreground">{searchQuery}</span>"
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <NotificationCenter books={books} authorProfile={authorProfile} onTabChange={onTabChange} />

        {/* Divider */}
        <div className="w-px h-6 bg-border/60" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-150 border',
              profileOpen
                ? 'bg-slate-50 border-slate-200 shadow-sm'
                : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
            )}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm overflow-hidden">
              {authorProfile?.profile_photo_url
                ? <img src={authorProfile.profile_photo_url} className="w-full h-full object-cover" alt="" />
                : initials}
            </div>

            {/* Name & role */}
            <div className="text-left leading-none hidden lg:block">
              <p className="text-[13px] font-semibold text-foreground truncate max-w-[110px]">
                {authorProfile?.full_name || 'Author'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Author</p>
            </div>

            <ChevronDown className={cn(
              'w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200',
              profileOpen && 'rotate-180'
            )} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] z-50 overflow-hidden">
              
              {/* Header */}
              <div className="px-4 py-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden shadow-md ring-2 ring-primary/10">
                  {authorProfile?.profile_photo_url
                    ? <img src={authorProfile.profile_photo_url} className="w-full h-full object-cover" alt="" />
                    : initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate leading-tight">{authorProfile?.full_name || 'Author'}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{authorProfile?.email || ''}</p>
                </div>
              </div>

              <div className="mx-3 border-t border-slate-100" />

              {/* Menu items */}
              <div className="px-2 py-1.5">
                <button
                  onClick={() => { setProfileOpen(false); onTabChange('profile'); }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-foreground transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-medium leading-tight">My Profile</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">View & edit your details</p>
                  </div>
                </button>
              </div>

              {/* Logout */}
              <div className="px-2 pb-2">
                <div className="border-t border-slate-100 mb-1.5" />
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <p className="text-[13px] font-medium">Log Out</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}