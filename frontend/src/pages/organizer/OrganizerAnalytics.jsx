import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Calendar, Plus, Users, BarChart3, QrCode, DollarSign, Eye, TrendingUp, Award } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { analyticsService } from '../../services/eventService.js';
import { formatCurrency, formatNumber } from '../../utils/formatters.js';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../../utils/cn.js';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/organizer', exact: true },
  { icon: Calendar,        label: 'My Events',    href: '/organizer/events' },
  { icon: Plus,            label: 'Create Event', href: '/organizer/events/create' },
  { icon: Users,           label: 'Attendees',    href: '/organizer/events' },
  { icon: BarChart3,       label: 'Analytics',    href: '/organizer/analytics' },
  { icon: QrCode,          label: 'QR Scanner',   href: '/organizer/qr-scanner' },
];

const DAYS_OPTIONS = [7, 14, 30, 90];
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-white/20">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'revenue' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function OrganizerAnalytics() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['organizer-analytics', days],
    queryFn: () => analyticsService.getOrganizerAnalytics({ days }),
  });

  const overview = data?.overview || {};
  const revenueByDay = data?.revenueByDay || [];
  const ticketsByType = data?.ticketsByType || [];
  const topEvents = data?.topEvents || [];

  return (
    <DashboardLayout navItems={NAV} title="Analytics">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
          <p className="text-slate-400 text-sm">Track your event performance</p>
        </div>
        <div className="flex gap-2">
          {DAYS_OPTIONS.map(d => (
            <button key={d} onClick={() => setDays(d)} className={cn('px-3 py-1.5 rounded-xl text-sm font-medium transition-colors', days === d ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/8')}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={formatCurrency(overview.totalRevenue || 0)} icon={DollarSign} color="emerald" change={12.5} changeLabel="vs prev period" index={0} />
        <StatCard title="Total Views"   value={formatNumber(overview.totalViews || 0)}    icon={Eye}         color="cyan"    change={5.1}  changeLabel="vs prev period" index={1} />
        <StatCard title="Attendees"     value={formatNumber(overview.totalRegistered || 0)} icon={Users}     color="brand"   change={8.2}  changeLabel="vs prev period" index={2} />
        <StatCard title="Conversion"    value={`${overview.conversionRate || 0}%`}         icon={TrendingUp} color="purple"  index={3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Revenue trend */}
        <div className="xl:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Revenue & Bookings Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="aRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#6366f1" fill="url(#aRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#10b981" fill="url(#aBookings)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket type breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Tickets by Type</h3>
          {ticketsByType.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={ticketsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="_id">
                    {ticketsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {ticketsByType.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-slate-300 truncate">{t._id}</span></span>
                    <span className="text-white font-medium">{t.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-500 text-sm">No ticket data yet</div>
          )}
        </div>
      </div>

      {/* Top events table */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-6">Top Performing Events</h3>
        {topEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Event', 'Revenue', 'Views', 'Registered', 'Check-ins', 'Conversion'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topEvents.map((event, i) => (
                  <tr key={event.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-medium text-white truncate max-w-xs">{event.title}</td>
                    <td className="py-3 pr-4 text-emerald-400 font-semibold">{formatCurrency(event.revenue)}</td>
                    <td className="py-3 pr-4 text-slate-300">{formatNumber(event.views)}</td>
                    <td className="py-3 pr-4 text-slate-300">{formatNumber(event.registered)}</td>
                    <td className="py-3 pr-4 text-slate-300">{formatNumber(event.checkIns)}</td>
                    <td className="py-3 pr-4"><span className={cn('font-medium', parseFloat(event.conversionRate) >= 5 ? 'text-emerald-400' : 'text-amber-400')}>{event.conversionRate}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">No events data yet. Publish your first event to see analytics.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
