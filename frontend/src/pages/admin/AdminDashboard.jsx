import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, DollarSign, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { adminService, analyticsService } from '../../services/eventService.js';
import { formatCurrency, formatNumber, formatRelativeTime } from '../../utils/formatters.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const NAV = [
  { icon: Shield,   label: 'Overview',  href: '/admin', exact: true },
  { icon: Users,    label: 'Users',     href: '/admin/users' },
  { icon: Calendar, label: 'Events',    href: '/admin/events' },
  { icon: BarChart3,label: 'Analytics', href: '/admin/analytics' },
];

export default function AdminDashboard() {
  const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: adminService.getStats });
  const { data: analyticsData } = useQuery({ queryKey: ['admin-analytics'], queryFn: analyticsService.getAdminAnalytics });

  const stats = statsData || {};
  const userStats = analyticsData?.userStats || [];
  const eventStats = analyticsData?.eventStats || [];
  const recentBookings = analyticsData?.recentBookings || [];
  const dailySignups = (analyticsData?.dailySignups || []).slice(-14);

  const userRoleMap = Object.fromEntries(userStats.map(s => [s._id, s.count]));
  const eventStatusMap = Object.fromEntries(eventStats.map(s => [s._id, s.count]));

  return (
    <DashboardLayout navItems={NAV} title="Admin Dashboard">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Admin Overview</h2>
        <p className="text-slate-400 text-sm">Platform-wide metrics and management</p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users"     value={formatNumber(stats.totalUsers || 0)}     icon={Users}    color="brand"   change={15} changeLabel="this month" index={0} />
        <StatCard title="Live Events"     value={formatNumber(stats.totalEvents || 0)}    icon={Calendar} color="purple"  change={8}  changeLabel="this month" index={1} />
        <StatCard title="Total Bookings"  value={formatNumber(stats.totalBookings || 0)}  icon={TrendingUp} color="cyan" change={22} changeLabel="this month" index={2} />
        <StatCard title="Platform Revenue" value={formatCurrency(stats.totalRevenue || 0)} icon={DollarSign} color="emerald" change={18} changeLabel="this month" index={3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Daily signups chart */}
        <div className="xl:col-span-2 glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Daily Signups (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailySignups}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="count" name="Signups" stroke="#6366f1" fill="url(#signupGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-6">Platform Breakdown</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Users by Role</p>
              {[
                { role: 'attendee', color: 'bg-brand-500' },
                { role: 'organizer', color: 'bg-purple-500' },
                { role: 'staff', color: 'bg-cyan-500' },
                { role: 'admin', color: 'bg-amber-500' },
              ].map(({ role, color }) => (
                <div key={role} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-xs text-slate-400 capitalize">{role}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{userRoleMap[role] || 0}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Events by Status</p>
              {['published', 'draft', 'cancelled'].map(status => (
                <div key={status} className="flex items-center justify-between mb-2">
                  <Badge status={status} dot>{status}</Badge>
                  <span className="text-sm font-medium text-white">{eventStatusMap[status] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-6">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['User', 'Event', 'Amount', 'Status', 'Time'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentBookings.length > 0 ? recentBookings.map(booking => (
                <tr key={booking._id} className="hover:bg-white/3">
                  <td className="py-3 pr-4">
                    <p className="text-white font-medium">{booking.user?.firstName} {booking.user?.lastName}</p>
                    <p className="text-xs text-slate-400">{booking.user?.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-300 truncate max-w-xs">{booking.event?.title}</td>
                  <td className="py-3 pr-4 text-emerald-400 font-medium">{formatCurrency(booking.totalAmount)}</td>
                  <td className="py-3 pr-4"><Badge status={booking.status}>{booking.status}</Badge></td>
                  <td className="py-3 pr-4 text-slate-400 text-xs">{formatRelativeTime(booking.createdAt)}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500 text-sm">No recent bookings</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
