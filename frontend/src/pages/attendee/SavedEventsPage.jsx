import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LayoutDashboard, Ticket, Calendar, Users, Award, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { eventService } from '../../services/eventService.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

export default function SavedEventsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['saved-events'],
    queryFn: eventService.getSavedEvents,
  });

  const unsaveMutation = useMutation({
    mutationFn: (eventId) => eventService.bookmarkEvent(eventId),
    onSuccess: () => { toast.success('Event removed from saved'); queryClient.invalidateQueries(['saved-events']); },
    onError: (err) => toast.error(err.message),
  });

  const events = data?.events || [];

  return (
    <DashboardLayout navItems={NAV} title="Saved Events">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Saved Events</h2>
          <p className="text-slate-400 text-sm">{events.length} event{events.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card overflow-hidden animate-pulse">
              <div className="h-44 bg-white/10" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved events"
          description="Bookmark events you're interested in to find them here later"
          action={() => navigate('/events')}
          actionLabel="Discover Events"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div key={event._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
