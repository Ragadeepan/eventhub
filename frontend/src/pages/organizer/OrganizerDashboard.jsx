import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Calendar, Users, BarChart3, QrCode, Plus, TrendingUp, DollarSign, Eye, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { StatCardSkeleton } from '../../components/ui/Skeleton.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { analyticsService, eventService } from '../../services/eventService.js';
import { formatCurrency, formatEventDate, formatNumber } from '../../utils/formatters.js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/organizer',                  exact: true },
  { icon: Calendar,        label: 'My Events',    href: '/organizer/events' },
  { icon: Plus,            label: 'Create Event', href: '/organizer/events/create' },
  { icon: Users,           label: 'Attendees',    href: '/organizer/events' },
  { icon: BarChart3,       label: 'Analytics',    href: '/organizer/analytics' },
  { icon: QrCode,          label: 'QR Scanner',   href: '/organizer/qr-scanner' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}</p>)}
    </div>
  );
};

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['organizer-analytics'],
    queryFn: () => analyticsService.getOrganizerAnalytics({ days: 30 }),
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['organizer-events', { limit: 5 }],
    queryFn: () => eventService.getMyEvents({ limit: 5, sort: 'newest' }),
  });

  const overview = analyticsData?.overview;
  const revenueByDay = analyticsData?.revenueByDay || [];
  const topEvents = analyticsData?.topEvents || [];

  return (
    <DashboardLayout navItems={NAV} title="Organizer Dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm">Here's what's happening with your events</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/organizer/events/create')}>Create Event</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Revenue" value={formatCurrency(overview?.totalRevenue || 0)} icon={DollarSign} color="emerald" change={12.5} changeLabel="vs last month" index={0} />
            <StatCard title="Total Attendees" value={formatNumber(overview?.totalRegistered || 0)} icon={Users} color="brand" change={8.2} changeLabel="vs last month" index={1} />
            <StatCard title="Total Views" value={formatNumber(overview?.totalViews || 0)} icon={Eye} color="cyan" change={5.1} changeLabel="vs last month" index={2} />
            <StatCard title="Active Events" value={overview?.activeEvents || 0} icon={Calendar} color="purple" index={3} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Revenue (Last 30 Days)</h3>
            <Badge variant="success" dot>Live</Badge>
          </div>
          {revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"   stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%"  stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#revenueGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
              No revenue data yet. Create and publish your first event!
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Performance</h3>
          <div className="space-y-4">
            {[
              { label: 'Attendance Rate', value: `${overview?.attendanceRate || 0}%`, color: 'emerald' },
              { label: 'Conversion Rate', value: `${overview?.conversionRate || 0}%`, color: 'brand' },
              { label: 'Total Events', value: overview?.totalEvents || 0, color: 'purple' },
              { label: 'Check-ins', value: formatNumber(overview?.totalCheckIns || 0), color: 'cyan' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>
                <span className={`font-semibold text-${color}-400`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Button variant="secondary" fullWidth size="sm" onClick={() => navigate('/organizer/analytics')}>
              <TrendingUp className="w-4 h-4" /> Full Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Events & Top Events */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent events */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Events</h3>
            <button onClick={() => navigate('/organizer/events')} className="text-xs text-brand-400 hover:text-brand-300">View all</button>
          </div>
          <div className="space-y-3">
            {(eventsData?.events || []).map(event => (
              <div key={event._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/events/${event.slug}`)}>
                <img src={event.banner} alt={event.title} className="w-12 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{event.title}</p>
                  <p className="text-xs text-slate-400">{formatEventDate(event.startDate, event.endDate)}</p>
                </div>
                <Badge status={event.status}>{event.status}</Badge>
              </div>
            ))}
            {!eventsLoading && !eventsData?.events?.length && (
              <div className="text-center py-6">
                <p className="text-slate-400 text-sm mb-3">No events yet</p>
                <Button size="sm" icon={Plus} onClick={() => navigate('/organizer/events/create')}>Create Event</Button>
              </div>
            )}
          </div>
        </div>

        {/* Top events by revenue */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4">Top Events by Revenue</h3>
          {topEvents.length > 0 ? (
            <div className="space-y-3">
              {topEvents.map((event, i) => (
                <div key={event.id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-600">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{event.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{formatNumber(event.registered)} attendees</span>
                      <span>{event.conversionRate}% conversion</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(event.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
              Revenue data will appear after your first sale
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
