import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LayoutDashboard, Ticket, Calendar, Users, Award, Bookmark, MapPin, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { bookingService } from '../../services/eventService.js';
import { formatEventDate, formatCurrency } from '../../utils/formatters.js';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

const TABS = ['upcoming', 'past', 'cancelled'];

export default function MyEventsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMyBookings({ limit: 100 }),
  });

  const now = new Date();
  const bookings = data?.bookings || [];

  const filtered = bookings.filter(b => {
    const eventDate = new Date(b.event?.endDate || b.event?.startDate);
    if (activeTab === 'upcoming') return b.status !== 'cancelled' && eventDate >= now;
    if (activeTab === 'past') return b.status !== 'cancelled' && eventDate < now;
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <DashboardLayout navItems={NAV} title="My Events">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">My Events</h2>
          <p className="text-slate-400 text-sm">Events you've booked and attended</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}>
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 flex gap-4 animate-pulse">
              <div className="w-24 h-20 rounded-xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={activeTab === 'upcoming' ? 'No upcoming events' : activeTab === 'past' ? 'No past events' : 'No cancelled bookings'}
          description={activeTab === 'upcoming' ? 'Discover and book events to see them here' : 'Your attended events will appear here'}
          action={activeTab === 'upcoming' ? () => navigate('/events') : undefined}
          actionLabel="Browse Events"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((booking, i) => {
            const event = booking.event;
            if (!event) return null;
            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex gap-4 hover:border-white/20 transition-all"
              >
                <img
                  src={event.banner}
                  alt={event.title}
                  className="w-24 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/events/${event.slug}`} className="font-semibold text-white hover:text-brand-300 transition-colors truncate">
                      {event.title}
                    </Link>
                    <Badge status={booking.status} dot className="shrink-0">{booking.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatEventDate(event.startDate, event.endDate)}
                    </span>
                    {event.venue?.city && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.venue.city}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-xs text-slate-500">Booking #{booking.bookingId}</span>
                    <span className="text-xs text-emerald-400 font-medium">{formatCurrency(booking.totalAmount)}</span>
                    <Link to={`/my-tickets`} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      View tickets →
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
