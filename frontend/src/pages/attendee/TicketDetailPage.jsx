import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Ticket, Calendar, MapPin, Award, LayoutDashboard, Users, Bookmark } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import QRTicketCard from '../../components/tickets/QRTicketCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { ticketService, certificateService } from '../../services/eventService.js';
import { formatEventDate } from '../../utils/formatters.js';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getTicket(id),
  });

  const certMutation = useMutation({
    mutationFn: () => certificateService.generate(data.ticket.event._id),
    onSuccess: () => { toast.success('Certificate generated!'); navigate('/certificates'); },
    onError: (err) => toast.error(err.message),
  });

  const ticket = data?.ticket;
  const event = ticket?.event;

  if (isLoading) return <DashboardLayout navItems={NAV} title="Ticket"><div className="glass-card h-96 animate-pulse rounded-3xl" /></DashboardLayout>;

  if (!ticket) return (
    <DashboardLayout navItems={NAV} title="Ticket">
      <div className="text-center py-20">
        <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-white">Ticket not found</p>
        <Button onClick={() => navigate('/my-tickets')} className="mt-4" variant="secondary">Back to Tickets</Button>
      </div>
    </DashboardLayout>
  );

  const isPast = event?.startDate && new Date() > new Date(event.endDate || event.startDate);

  return (
    <DashboardLayout navItems={NAV} title="Ticket Details">
      <button onClick={() => navigate('/my-tickets')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </button>

      <div className="max-w-lg mx-auto space-y-6">
        <QRTicketCard ticket={ticket} event={event} />

        {/* Event details */}
        {event && (
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-semibold text-white mb-4">Event Details</h3>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
              <span className="text-slate-300">{formatEventDate(event.startDate, event.endDate)}</span>
            </div>
            {event.venue?.city && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-slate-300">{event.venue.name}, {event.venue.city}</span>
              </div>
            )}
          </div>
        )}

        {/* Certificate */}
        {isPast && event?.certificateEnabled && ticket.status === 'used' && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white">Certificate of Attendance</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">You attended this event! Generate your certificate of attendance.</p>
            <Button fullWidth isLoading={certMutation.isPending} onClick={() => certMutation.mutate()} icon={Award}>
              Generate Certificate
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
