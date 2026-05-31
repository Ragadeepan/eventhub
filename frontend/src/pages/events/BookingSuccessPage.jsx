import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { CheckCircle, Ticket, Calendar, MapPin, Download, Share2, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button.jsx';
import { bookingService, ticketService } from '../../services/eventService.js';
import { formatEventDate } from '../../utils/formatters.js';
import QRTicketCard from '../../components/tickets/QRTicketCard.jsx';

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => { const t = setTimeout(() => setShowConfetti(false), 5000); return () => clearTimeout(t); }, []);

  const { data: bookingData } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBooking(bookingId),
    initialData: state ? { booking: state.booking, tickets: state.tickets } : undefined,
  });

  const booking = bookingData?.booking;
  const tickets = bookingData?.tickets;
  const event = booking?.event;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-12">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} colors={['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']} />}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-lg"
      >
        {/* Success header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-slate-400">Your tickets are on their way to your email inbox.</p>
          {booking?.bookingId && (
            <p className="text-sm text-slate-500 mt-1">Booking ID: <span className="text-brand-400 font-mono">{booking.bookingId}</span></p>
          )}
        </div>

        {/* Event info */}
        {event && (
          <div className="glass-card p-5 mb-6">
            <div className="flex items-start gap-4">
              <img src={event.banner} alt={event.title} className="w-20 h-16 rounded-xl object-cover shrink-0" />
              <div>
                <p className="font-semibold text-white">{event.title}</p>
                <div className="space-y-1 mt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-400" />{formatEventDate(event.startDate, event.endDate)}</div>
                  {event.venue?.city && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" />{event.venue.city}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Tickets */}
        {tickets?.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-brand-400" /> Your Tickets
            </h3>
            {tickets.map((ticket, i) => (
              <QRTicketCard key={ticket._id} ticket={ticket} event={event} index={i} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button fullWidth size="lg" onClick={() => navigate('/my-tickets')} icon={Ticket}>
            View My Tickets
          </Button>
          <Link to="/events" className="block">
            <Button variant="secondary" fullWidth size="lg">
              Explore More Events <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
