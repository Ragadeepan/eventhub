import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, Plus, Users, BarChart3, QrCode, Edit, Eye, Trash2, MoreVertical, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { eventService } from '../../services/eventService.js';
import { formatEventDate, formatCurrency, formatNumber } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/organizer', exact: true },
  { icon: Calendar,        label: 'My Events',    href: '/organizer/events' },
  { icon: Plus,            label: 'Create Event', href: '/organizer/events/create' },
  { icon: Users,           label: 'Attendees',    href: '/organizer/events' },
  { icon: BarChart3,       label: 'Analytics',    href: '/organizer/analytics' },
  { icon: QrCode,          label: 'QR Scanner',   href: '/organizer/qr-scanner' },
];

export default function ManageEventsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['organizer-events', { search, status: statusFilter }],
    queryFn: () => eventService.getMyEvents({ limit: 50 }),
  });

  const publishMutation = useMutation({
    mutationFn: (id) => eventService.publishEvent(id),
    onSuccess: () => { toast.success('Event published!'); queryClient.invalidateQueries(['organizer-events']); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => eventService.deleteEvent(id),
    onSuccess: () => { toast.success('Event cancelled'); queryClient.invalidateQueries(['organizer-events']); },
    onError: (err) => toast.error(err.message),
  });

  const events = (data?.events || []).filter(e => {
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout navItems={NAV} title="My Events">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My Events</h2>
        <Button icon={Plus} onClick={() => navigate('/organizer/events/create')}>Create Event</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 glass-card px-4 py-2.5 rounded-xl">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events…" className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500">
          <option value="">All Status</option>
          {['draft', 'published', 'cancelled', 'completed'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Events table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Event', 'Date', 'Status', 'Attendees', 'Revenue', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-4 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-white/10 rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                    <p>No events found</p>
                    <button onClick={() => navigate('/organizer/events/create')} className="mt-2 text-brand-400 hover:text-brand-300 text-sm">Create your first event →</button>
                  </td>
                </tr>
              ) : (
                events.map((event, i) => (
                  <motion.tr
                    key={event._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={event.banner} alt={event.title} className="w-10 h-8 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-xs">{event.title}</p>
                          <p className="text-xs text-slate-400 capitalize">{event.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300 whitespace-nowrap">{formatEventDate(event.startDate, event.endDate)}</td>
                    <td className="px-4 py-4"><Badge status={event.status} dot>{event.status}</Badge></td>
                    <td className="px-4 py-4 text-slate-300">{formatNumber(event.registeredCount)}</td>
                    <td className="px-4 py-4 text-emerald-400 font-medium">{formatCurrency(event.stats?.revenue || 0)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/events/${event.slug}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/organizer/events/${event._id}/edit`)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        {event.status === 'draft' && (
                          <button onClick={() => publishMutation.mutate(event._id)} disabled={publishMutation.isPending} className="px-2 py-1 rounded-lg text-xs bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors">
                            Publish
                          </button>
                        )}
                        <button onClick={() => { if (confirm('Cancel this event?')) deleteMutation.mutate(event._id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Cancel">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
