import { useQuery } from '@tanstack/react-query';
import { Shield, Users, Calendar, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { adminService, analyticsService } from '../../services/eventService.js';
import { formatCurrency, formatNumber } from '../../utils/formatters.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const NAV = [
  { icon: Shield,   label: 'Overview',  href: '/admin', exact: true },
  { icon: Users,    label: 'Users',     href: '/admin/users' },
  { icon: Calendar, label: 'Events',    href: '/admin/events' },
  { icon: BarChart3,label: 'Analytics', href: '/admin/analytics' },
];

export default function AdminAnalytics() {
  const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: adminService.getStats });
  const { data: analyticsData } = useQuery({ queryKey: ['admin-analytics'], queryFn: analyticsService.getAdminAnalytics });

  const bookingStats = (analyticsData?.bookingStats || []);
  const dailySignups = (analyticsData?.dailySignups || []).slice(-30);

  return (
    <DashboardLayout navItems={NAV} title="Platform Analytics">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Platform Analytics</h2>
        <p className="text-slate-400 text-sm">System-wide performance metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue"   value={formatCurrency(statsData?.totalRevenue || 0)} icon={BarChart3}  color="emerald" index={0} />
        <StatCard title="Total Users"     value={formatNumber(statsData?.totalUsers || 0)}     icon={Users}      color="brand"   index={1} />
        <StatCard title="Published Events" value={formatNumber(statsData?.totalEvents || 0)}   icon={Calendar}   color="purple"  index={2} />
        <StatCard title="Total Bookings"  value={formatNumber(statsData?.totalBookings || 0)}  icon={BarChart3}  color="cyan"    index={3} />
      </div>

      <div className="glass-card p-6 mb-6">
        <h3 className="font-semibold text-white mb-6">Daily Signups (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dailySignups}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
            <Bar dataKey="count" name="Signups" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-semibold text-white mb-4">Booking Status Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {bookingStats.map(({ _id, count, revenue }) => (
            <div key={_id} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white mb-1">{formatNumber(count)}</p>
              <p className="text-xs text-slate-400 capitalize mb-1">{_id}</p>
              {revenue > 0 && <p className="text-xs text-emerald-400">{formatCurrency(revenue)}</p>}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
