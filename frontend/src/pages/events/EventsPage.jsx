import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import { EventCardSkeleton } from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';
import { eventService, categoryService } from '../../services/eventService.js';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn.js';

const SORT_OPTIONS = [
  { value: 'soonest', label: 'Date (Soonest)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

const EVENT_TYPES = [
  { value: '',         label: 'All Types' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'virtual',   label: 'Virtual' },
  { value: 'hybrid',    label: 'Hybrid' },
];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [savedEvents, setSavedEvents] = useState(new Set(user?.savedEvents || []));

  const params = {
    search:     searchParams.get('search') || '',
    category:   searchParams.get('category') || '',
    type:       searchParams.get('type') || '',
    sort:       searchParams.get('sort') || 'soonest',
    isFeatured: searchParams.get('isFeatured') || '',
    isFree:     searchParams.get('isFree') || '',
    city:       searchParams.get('city') || '',
    page:       parseInt(searchParams.get('page') || '1'),
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.getEvents({ ...params, limit: 12 }),
    keepPreviousData: true,
  });

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

  const handleBookmark = async (eventId) => {
    if (!user) { toast.error('Sign in to save events'); return; }
    try {
      await eventService.bookmarkEvent(eventId);
      setSavedEvents(prev => {
        const next = new Set(prev);
        next.has(eventId) ? next.delete(eventId) : next.add(eventId);
        return next;
      });
    } catch { toast.error('Failed to save event'); }
  };

  const activeFiltersCount = [params.category, params.type, params.isFeatured, params.isFree, params.city].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-b from-surface-50/80 to-transparent border-b border-white/10 py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">
              {params.search ? `Results for "${params.search}"` : 'Discover Events'}
            </h1>

            {/* Search & controls bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3 rounded-2xl">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  value={params.search}
                  onChange={(e) => updateParam('search', e.target.value)}
                  placeholder="Search events…"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                />
                {params.search && (
                  <button onClick={() => updateParam('search', '')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="md" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">{activeFiltersCount}</span>}
                </Button>

                <select
                  value={params.sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                <div className="flex border border-white/10 rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={cn('px-3 py-2 transition-colors', viewMode === 'grid' ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white')}>
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={cn('px-3 py-2 transition-colors', viewMode === 'list' ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:text-white')}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-8">
          {/* Sidebar filters */}
          {filtersOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block w-64 shrink-0"
            >
              <div className="glass-card p-5 sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button onClick={() => setSearchParams({})} className="text-xs text-brand-400 hover:text-brand-300">Clear all</button>
                  )}
                </div>

                {/* Category */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Category</p>
                  <div className="space-y-1">
                    <button onClick={() => updateParam('category', '')} className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-colors', !params.category ? 'text-white bg-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-white/8')}>All Categories</button>
                    {(categoriesData?.categories || []).map(cat => (
                      <button key={cat._id} onClick={() => updateParam('category', cat._id)} className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2', params.category === cat._id ? 'text-white bg-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-white/8')}>
                        <span>{cat.icon}</span>{cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event type */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Event Type</p>
                  <div className="space-y-1">
                    {EVENT_TYPES.map(t => (
                      <button key={t.value} onClick={() => updateParam('type', t.value)} className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-colors', params.type === t.value ? 'text-white bg-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-white/8')}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick filters */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Filters</p>
                  <div className="space-y-2">
                    {[{ key: 'isFeatured', label: '⭐ Featured' }, { key: 'isFree', label: '🆓 Free Events' }].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!searchParams.get(key)} onChange={(e) => updateParam(key, e.target.checked ? 'true' : '')} className="rounded border-white/20 bg-white/5 text-brand-500" />
                        <span className="text-sm text-slate-400">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400 text-sm">
                {isFetching ? 'Loading…' : `${data?.pagination?.total || 0} events found`}
              </p>
            </div>

            {isLoading ? (
              <div className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : (
              <>
                {data?.events?.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                    <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
                    <Button onClick={() => setSearchParams({})}>Clear Filters</Button>
                  </div>
                ) : (
                  <div className={cn('grid gap-6', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                    {(data?.events || []).map((event, i) => (
                      <EventCard key={event._id} event={event} index={i} variant={viewMode === 'list' ? 'horizontal' : 'default'} onBookmark={handleBookmark} isBookmarked={savedEvents.has(event._id)} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {data?.pagination && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: Math.min(data.pagination.totalPages, 7) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => updateParam('page', p.toString())} className={cn('w-10 h-10 rounded-xl text-sm font-medium transition-colors', p === params.page ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10')}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
