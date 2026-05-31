import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, BarChart3, Search, Star, TrendingUp, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { adminService } from '../../services/eventService.js';
import { formatEventDate, formatCurrency, formatNumber } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: Shield,   label: 'Overview',  href: '/admin', exact: true },
  { icon: Users,    label: 'Users',     href: '/admin/users' },
  { icon: Calendar, label: 'Events',    href: '/admin/events' },
  { icon: BarChart3,label: 'Analytics', href: '/admin/analytics' },
];

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', { search, status: statusFilter, page }],
    queryFn: () => adminService.getEvents({ search, status: statusFilter, page, limit: 15 }),
    keepPreviousData: true,
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured, trending }) => adminService.featureEvent(id, { featured, trending }),
    onSuccess: () => { toast.success('Event updated'); queryClient.invalidateQueries(['admin-events']); },
    onError: (err) => toast.error(err.message),
  });

  const events = data?.events || [];

  return (
    <DashboardLayout navItems={NAV} title="Event Management">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Events</h2>
        <Badge variant="primary">{data?.pagination?.total || 0} total</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 glass-card px-4 py-2.5 rounded-xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search events…" className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
          <option value="">All Status</option>
          {['published', 'draft', 'cancelled', 'completed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Event', 'Organizer', 'Date', 'Attendees', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-4 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-white/10 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : events.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No events found</td></tr>
              ) : (
                events.map((event, i) => (
                  <tr key={event._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={event.banner} alt={event.title} className="w-10 h-8 rounded-lg object-cover shrink-0" />
                        <p className="font-medium text-white truncate max-w-48">{event.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-xs">{event.organizer?.firstName} {event.organizer?.lastName}</td>
                    <td className="px-4 py-4 text-slate-300 text-xs whitespace-nowrap">{formatEventDate(event.startDate, event.endDate)}</td>
                    <td className="px-4 py-4 text-slate-300">{formatNumber(event.registeredCount)}</td>
                    <td className="px-4 py-4"><Badge status={event.status} dot>{event.status}</Badge></td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => featureMutation.mutate({ id: event._id, featured: !event.isFeatured, trending: event.isTrending })}
                          className={cn('p-1.5 rounded-lg transition-colors', event.isFeatured ? 'text-amber-400 bg-amber-500/20' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10')}
                          title="Toggle featured"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => featureMutation.mutate({ id: event._id, featured: event.isFeatured, trending: !event.isTrending })}
                          className={cn('p-1.5 rounded-lg transition-colors', event.isTrending ? 'text-brand-400 bg-brand-500/20' : 'text-slate-500 hover:text-brand-400 hover:bg-brand-500/10')}
                          title="Toggle trending"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Link to={`/events/${event.slug}`} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors inline-flex">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
