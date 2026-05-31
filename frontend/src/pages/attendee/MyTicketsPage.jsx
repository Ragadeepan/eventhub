import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Ticket, Calendar, MapPin, QrCode, Download, ChevronRight, LayoutDashboard, Users, Award, Bookmark, Bell } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { ticketService } from '../../services/eventService.js';
import { formatEventDate } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

const STATUS_FILTERS = ['all', 'active', 'used', 'cancelled'];

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: ticketService.getMyTickets,
  });

  const tickets = (data?.tickets || []).filter(t => filter === 'all' || t.status === filter);

  return (
    <DashboardLayout navItems={NAV} title="My Tickets">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My Tickets</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate('/events')}>Find Events</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={cn('px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors', filter === s ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/8')}>
            {s}
            <span className="ml-1.5 text-xs text-slate-500">({(data?.tickets || []).filter(t => s === 'all' || t.status === s).length})</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-40 animate-pulse" />)}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState icon={Ticket} title="No tickets found" description="Book events to see your tickets here" action={() => navigate('/events')} actionLabel="Discover Events" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((ticket, i) => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link to={`/my-tickets/${ticket._id}`} className="block glass-card overflow-hidden hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
                <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-amber-500 to-red-500" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate mb-1">{ticket.event?.title}</p>
                      <Badge variant="primary" className="text-xs">{ticket.ticketTypeName}</Badge>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge status={ticket.status}>{ticket.status}</Badge>
                      {ticket.qrCode && <QrCode className="w-8 h-8 text-brand-400" />}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-400">
                    {ticket.event?.startDate && (
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-400" />{formatEventDate(ticket.event.startDate, ticket.event.endDate)}</div>
                    )}
                    {ticket.event?.venue?.city && (
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" />{ticket.event.venue.city}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Holder</p>
                      <p className="text-sm text-white font-medium">{ticket.holderName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-400">
                      View Ticket <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
