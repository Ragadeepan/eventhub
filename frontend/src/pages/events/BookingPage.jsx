import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Ticket, Minus, Plus, Check, CreditCard, User, Mail, Phone, Calendar, MapPin, ArrowLeft, Shield } from 'lucide-react';
import Navbar from '../../components/layout/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { eventService, bookingService } from '../../services/eventService.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatEventDate, formatCurrency } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuthStore();

  const [quantities, setQuantities] = useState({});
  const [step, setStep] = useState(1);

  const { data: eventData } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventService.getEventBySlug(slug),
    initialData: state?.event ? { event: state.event } : undefined,
  });

  const event = eventData?.event;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { attendeeName: user ? `${user.firstName} ${user.lastName}` : '', attendeeEmail: user?.email || '', attendeePhone: user?.phone || '' }
  });

  const bookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (data) => {
      toast.success('Booking confirmed! 🎉');
      navigate(`/booking/success/${data.booking._id}`, { state: { booking: data.booking, tickets: data.tickets } });
    },
    onError: (err) => { toast.error(err.message); },
  });

  const totalTickets = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalAmount  = (event?.ticketTypes || []).reduce((sum, ticket) => sum + (quantities[ticket._id] || 0) * ticket.price, 0);

  const updateQuantity = (ticketId, delta) => {
    setQuantities(prev => {
      const ticket = event.ticketTypes.find(t => t._id === ticketId);
      const available = ticket.quantity - ticket.sold;
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(available, Math.min(ticket.maxPerBooking, current + delta)));
      return { ...prev, [ticketId]: next };
    });
  };

  const onSubmit = async (formData) => {
    if (totalTickets === 0) { toast.error('Select at least one ticket'); return; }
    const tickets = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    await bookingMutation.mutateAsync({ eventId: event._id, tickets, ...formData });
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to event
        </button>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {['Select Tickets', 'Details', 'Confirm'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors', step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-400')}>
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn('text-sm font-medium hidden sm:block', step === i + 1 ? 'text-white' : 'text-slate-400')}>{label}</span>
              {i < 2 && <div className="flex-1 h-px bg-white/10 min-w-8" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">

            {/* Step 1: Ticket selection */}
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={cn(step !== 1 && 'hidden')}>
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-2">Select Tickets</h2>
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatEventDate(event.startDate, event.endDate)}</span>
                </div>

                <div className="space-y-3">
                  {(event.ticketTypes || []).filter(t => t.isVisible).map(ticket => {
                    const available = ticket.quantity - ticket.sold;
                    const qty = quantities[ticket._id] || 0;
                    const isOut = available === 0;
                    return (
                      <div key={ticket._id} className={cn('p-4 rounded-xl border transition-colors', qty > 0 ? 'border-brand-500/50 bg-brand-500/10' : 'border-white/10 bg-white/5', isOut && 'opacity-50')}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-white">{ticket.name}</p>
                              {ticket.isFeatured && <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs">Popular</span>}
                            </div>
                            {ticket.description && <p className="text-sm text-slate-400 mb-2">{ticket.description}</p>}
                            {ticket.perks?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {ticket.perks.map(perk => (
                                  <span key={perk} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-slate-400 flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />{perk}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-500 mt-2">{isOut ? 'Sold out' : `${available} remaining`}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-white mb-2">{ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}</p>
                            {!isOut && (
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => updateQuantity(ticket._id, -1)} disabled={qty === 0} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-colors">
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center text-white font-medium">{qty}</span>
                                <button type="button" onClick={() => updateQuantity(ticket._id, 1)} disabled={qty >= Math.min(available, ticket.maxPerBooking)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Button fullWidth size="lg" onClick={() => totalTickets > 0 && setStep(2)} disabled={totalTickets === 0} className="mt-4">
                Continue — {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} selected
              </Button>
            </motion.div>

            {/* Step 2: Attendee details */}
            {step >= 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={cn(step !== 2 && 'hidden')}>
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Attendee Details</h2>
                  <div className="space-y-4">
                    <Input label="Full Name" icon={User} placeholder="Your full name" error={errors.attendeeName?.message} {...register('attendeeName', { required: 'Name is required' })} />
                    <Input label="Email Address" icon={Mail} type="email" placeholder="your@email.com" error={errors.attendeeEmail?.message} {...register('attendeeEmail', { required: 'Email is required' })} />
                    <Input label="Phone (optional)" icon={Phone} placeholder="+1 (555) 000-0000" {...register('attendeePhone')} />
                    <Input label="Special Requirements (optional)" placeholder="Accessibility needs, dietary restrictions, etc." {...register('specialRequirements')} />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="secondary" fullWidth size="lg" onClick={() => setStep(1)}>Back</Button>
                  <Button fullWidth size="lg" onClick={() => setStep(3)}>Review Order</Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step >= 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={cn(step !== 3 && 'hidden')}>
                <div className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Order Confirmation</h2>
                  <div className="space-y-3 mb-6">
                    {Object.entries(quantities).filter(([, q]) => q > 0).map(([ticketId, qty]) => {
                      const ticket = event.ticketTypes?.find(t => t._id === ticketId);
                      if (!ticket) return null;
                      return (
                        <div key={ticketId} className="flex items-center justify-between py-2 border-b border-white/10">
                          <span className="text-slate-300">{ticket.name} × {qty}</span>
                          <span className="text-white font-medium">{formatCurrency(ticket.price * qty)}</span>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-white font-semibold text-lg">Total</span>
                      <span className="text-2xl font-bold gradient-text">{totalAmount === 0 ? 'Free' : formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    Your booking is protected. You'll receive QR tickets via email.
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" fullWidth size="lg" onClick={() => setStep(2)}>Back</Button>
                    <Button fullWidth size="lg" type="submit" isLoading={bookingMutation.isPending} icon={totalAmount === 0 ? Check : CreditCard}>
                      {totalAmount === 0 ? 'Confirm Free Booking' : `Pay ${formatCurrency(totalAmount)}`}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </form>

          {/* Order summary sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-5 sticky top-24">
              <h3 className="font-semibold text-white mb-4">Order Summary</h3>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <img src={event.banner} alt={event.title} className="w-16 h-12 rounded-xl object-cover" />
                <div>
                  <p className="text-sm font-medium text-white line-clamp-2">{event.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatEventDate(event.startDate, event.endDate)}</p>
                </div>
              </div>
              {totalTickets > 0 ? (
                <div className="space-y-2 text-sm">
                  {Object.entries(quantities).filter(([, q]) => q > 0).map(([id, q]) => {
                    const t = event.ticketTypes?.find(t => t._id === id);
                    return t ? (
                      <div key={id} className="flex justify-between text-slate-300">
                        <span>{t.name} × {q}</span>
                        <span>{formatCurrency(t.price * q)}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>{totalAmount === 0 ? 'Free' : formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No tickets selected</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
