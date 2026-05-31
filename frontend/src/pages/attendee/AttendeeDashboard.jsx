import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LayoutDashboard, Ticket, Calendar, Users, Award, Bookmark, Bell, TrendingUp, ArrowRight, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { bookingService, ticketService, notificationService } from '../../services/eventService.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatEventDate, formatCurrency, formatRelativeTime } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

export default function AttendeeDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: bookingsData } = useQuery({ queryKey: ['my-bookings', 'recent'], queryFn: () => bookingService.getMyBookings({ limit: 5, status: 'confirmed' }) });
  const { data: ticketsData }  = useQuery({ queryKey: ['my-tickets', 'recent'], queryFn: () => ticketService.getMyTickets() });
  const { data: notifData }    = useQuery({ queryKey: ['notifications'], queryFn: () => notificationService.getAll() });

  const upcomingBookings = (bookingsData?.bookings || []).filter(b => new Date(b.event?.startDate) > new Date()).slice(0, 3);
  const notifications = (notifData?.notifications || []).slice(0, 5);

  return (
    <DashboardLayout navItems={NAV} title="My Dashboard">
      {/* Welcome header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 bg-gradient-to-r from-brand-500/10 to-transparent border-brand-500/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.firstName}! 👋</h2>
              <p className="text-slate-400">You have {ticketsData?.tickets?.length || 0} active tickets</p>
            </div>
            <Button onClick={() => navigate('/events')} icon={TrendingUp}>Discover Events</Button>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Events Attended"   value={user?.stats?.eventsAttended || 0}  icon={Calendar} color="brand"   index={0} />
        <StatCard title="Active Tickets"    value={ticketsData?.tickets?.filter(t => t.status === 'active').length || 0} icon={Ticket} color="emerald" index={1} />
        <StatCard title="Total Spent"       value={formatCurrency(user?.stats?.totalSpent || 0)} icon={Star} color="amber" index={2} />
        <StatCard title="Connections"       value={user?.stats?.connectionsCount || 0} icon={Users}    color="cyan"    index={3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming events */}
        <div className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">Upcoming Events</h3>
            <Link to="/my-tickets" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map(booking => (
                <Link key={booking._id} to={`/my-tickets/${booking._id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  {booking.event?.banner && (
                    <img src={booking.event.banner} alt={booking.event.title} className="w-16 h-12 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white group-hover:text-brand-300 transition-colors truncate">{booking.event?.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{booking.event?.startDate && formatEventDate(booking.event.startDate, booking.event.endDate)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{booking.event?.venue?.city || 'Online'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge status={booking.status}>{booking.status}</Badge>
                    <p className="text-xs text-slate-400 mt-1">{booking.tickets?.reduce((sum, t) => sum + t.quantity, 0)} ticket(s)</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">No upcoming events</p>
              <Button size="sm" onClick={() => navigate('/events')}>Find Events</Button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-400" />
              Notifications
              {notifData?.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">{notifData.unreadCount}</span>
              )}
            </h3>
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div key={notif._id} className={cn('p-3 rounded-xl text-sm transition-colors', !notif.isRead ? 'bg-brand-500/10 border border-brand-500/20' : 'hover:bg-white/5')}>
                  <p className={cn('font-medium mb-0.5', !notif.isRead ? 'text-white' : 'text-slate-300')}>{notif.title}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              All caught up!
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
