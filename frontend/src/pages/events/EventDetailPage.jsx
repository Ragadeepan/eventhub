import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Clock, Share2, Bookmark, BookmarkCheck, Star, ExternalLink, ChevronRight, Video, Check, Award, Globe, Ticket } from 'lucide-react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { eventService, reviewService } from '../../services/eventService.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatEventDate, formatDate, formatCurrency, formatNumber, truncate } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn('w-4 h-4', i < Math.round(rating) ? 'text-amber-400 fill-current' : 'text-slate-600')} />
        ))}
      </div>
      <span className="text-sm font-medium text-white">{rating}</span>
      <span className="text-sm text-slate-400">({formatNumber(count)} reviews)</span>
    </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('about');
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [expandDesc, setExpandDesc] = useState(false);

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event', slug],
    queryFn: () => eventService.getEventBySlug(slug),
  });

  const { data: reviewData } = useQuery({
    queryKey: ['reviews', eventData?.event?._id],
    queryFn: () => reviewService.getEventReviews(eventData.event._id, { limit: 5 }),
    enabled: !!eventData?.event?._id,
  });

  const event = eventData?.event;

  const handleBookmark = async () => {
    if (!user) { toast.error('Sign in to save events'); return; }
    try {
      await eventService.bookmarkEvent(event._id);
      setBookmarked(!bookmarked);
      toast.success(bookmarked ? 'Removed from saved' : 'Event saved!');
    } catch { toast.error('Failed to save'); }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: event.title, text: event.shortDescription, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBookNow = () => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/events/${slug}` } } }); return; }
    navigate(`/events/${slug}/book`, { state: { event } });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-80 w-full rounded-3xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <p className="text-6xl mb-4">🔍</p>
        <h2 className="text-2xl font-bold text-white mb-2">Event not found</h2>
        <Link to="/events"><Button>Browse Events</Button></Link>
      </div>
    </div>
  );

  const lowestPrice = event.ticketTypes?.reduce((min, t) => Math.min(min, t.price), Infinity) ?? 0;
  const isSoldOut = event.availableTickets === 0;
  const isPast = new Date() > new Date(event.endDate);
  const TABS = ['about', 'schedule', 'speakers', 'reviews', ...(event.networkingEnabled ? ['networking'] : [])];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-16">
        {/* Hero Banner */}
        <div className="relative h-72 sm:h-96 lg:h-[480px] overflow-hidden">
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge status={event.status} dot>{event.status}</Badge>
                {event.category && (
                  <span className="badge" style={{ background: `${event.category.color}20`, color: event.category.color }}>
                    {event.category.icon} {event.category.name}
                  </span>
                )}
                {event.type !== 'in-person' && <Badge variant="cyan" icon={Video}>{event.type}</Badge>}
                {event.isFeatured && <Badge variant="primary">Featured</Badge>}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight max-w-3xl">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm">
                {event.stats?.avgRating > 0 && <StarRating rating={event.stats.avgRating} count={event.stats.reviewCount} />}
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{formatNumber(event.registeredCount)} attending</span>
                {event.stats?.views > 0 && <span className="text-slate-400">{formatNumber(event.stats.views)} views</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick info */}
              <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="text-sm font-medium text-white">{formatEventDate(event.startDate, event.endDate)}</p>
                    <p className="text-xs text-slate-400">{event.timezone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{event.type === 'virtual' ? 'Platform' : 'Venue'}</p>
                    {event.type === 'virtual' ? (
                      <p className="text-sm font-medium text-white">Online Event</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-white">{event.venue?.name}</p>
                        <p className="text-xs text-slate-400">{event.venue?.city}, {event.venue?.country}</p>
                      </>
                    )}
                  </div>
                </div>
                {event.maxAttendees && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Capacity</p>
                      <p className="text-sm font-medium text-white">{formatNumber(event.registeredCount)} / {formatNumber(event.maxAttendees)}</p>
                      <div className="w-full bg-white/10 rounded-full h-1 mt-1.5">
                        <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, (event.registeredCount / event.maxAttendees) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}
                {event.certificateEnabled && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Certificate</p>
                      <p className="text-sm font-medium text-white">Certificate of Attendance</p>
                      <p className="text-xs text-slate-400">Issued after event</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 glass-card rounded-2xl">
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={cn('flex-1 py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all duration-200', activeTab === tab ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white')}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'about' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="glass-card p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">About this Event</h2>
                    <div className={cn('prose prose-invert prose-sm max-w-none', !expandDesc && 'line-clamp-8')}>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-line">{event.description}</p>
                    </div>
                    {event.description?.length > 500 && (
                      <button onClick={() => setExpandDesc(!expandDesc)} className="mt-3 text-brand-400 text-sm hover:text-brand-300">
                        {expandDesc ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Organizer */}
                  {event.organizer && (
                    <div className="glass-card p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Organizer</h2>
                      <div className="flex items-start gap-4">
                        <Avatar src={event.organizer.avatar} name={event.organizer.displayName} size="lg" />
                        <div className="flex-1">
                          <p className="font-semibold text-white">{event.organizer.displayName}</p>
                          {event.organizer.bio && <p className="text-sm text-slate-400 mt-1 leading-relaxed">{truncate(event.organizer.bio, 200)}</p>}
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                            {event.organizer.stats?.eventsOrganized > 0 && <span>{event.organizer.stats.eventsOrganized} events organized</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Event Schedule</h2>
                  {event.schedule?.length > 0 ? (
                    <div className="space-y-4">
                      {event.schedule.map((item, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1 shrink-0" />
                            {i < event.schedule.length - 1 && <div className="flex-1 w-px bg-white/10 min-h-8" />}
                          </div>
                          <div className="pb-4">
                            <p className="text-xs text-brand-400 font-medium mb-1">{item.time}</p>
                            <p className="font-medium text-white">{item.title}</p>
                            {item.description && <p className="text-sm text-slate-400 mt-1">{item.description}</p>}
                            {item.speaker && <p className="text-xs text-slate-500 mt-1">By {item.speaker}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">Schedule will be announced soon.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'speakers' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h2 className="text-lg font-semibold text-white mb-6">Speakers</h2>
                  {event.speakers?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {event.speakers.map((speaker, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                          <Avatar src={speaker.avatar} name={speaker.name} size="lg" />
                          <div>
                            <p className="font-semibold text-white">{speaker.name}</p>
                            <p className="text-sm text-slate-400">{speaker.title}</p>
                            {speaker.company && <p className="text-xs text-slate-500">{speaker.company}</p>}
                            {speaker.bio && <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{speaker.bio}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">Speakers will be announced soon.</p>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {(reviewData?.reviews || []).length > 0 ? (
                    reviewData.reviews.map((review, i) => (
                      <div key={i} className="glass-card p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar src={review.user.avatar} name={review.user.firstName} size="sm" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white">{review.user.firstName} {review.user.lastName}</p>
                              <div className="flex">
                                {Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-current" />)}
                              </div>
                            </div>
                            {review.isVerifiedAttendee && <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" />Verified Attendee</span>}
                          </div>
                        </div>
                        {review.title && <p className="font-medium text-white mb-1">{review.title}</p>}
                        <p className="text-sm text-slate-300 leading-relaxed">{review.body}</p>
                      </div>
                    ))
                  ) : (
                    <div className="glass-card p-8 text-center">
                      <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">No reviews yet</p>
                      <p className="text-sm text-slate-400">Be the first to review this event after attending</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sticky sidebar — booking widget */}
            <div className="space-y-4">
              <div className="glass-card p-6 sticky top-24">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white">
                    {lowestPrice === 0 ? <span className="text-emerald-400">Free</span> : `From ${formatCurrency(lowestPrice)}`}
                  </p>
                  {event.stats?.avgRating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm text-white font-medium">{event.stats.avgRating}</span>
                      <span className="text-sm text-slate-400">({event.stats.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>

                {/* Ticket types */}
                {event.ticketTypes?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {event.ticketTypes.filter(t => t.isVisible).map((ticket) => {
                      const available = ticket.quantity - ticket.sold;
                      const isOut = available === 0;
                      return (
                        <button
                          key={ticket._id}
                          onClick={() => !isOut && setSelectedTicket(ticket)}
                          disabled={isOut || isPast}
                          className={cn('w-full p-3 rounded-xl border text-left transition-all duration-200', selectedTicket?._id === ticket._id ? 'border-brand-500/60 bg-brand-500/15' : isOut ? 'border-white/5 bg-white/3 opacity-50 cursor-not-allowed' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-white">{ticket.name}</p>
                              {ticket.description && <p className="text-xs text-slate-400 mt-0.5">{ticket.description}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">{ticket.price === 0 ? 'Free' : formatCurrency(ticket.price)}</p>
                              <p className="text-xs text-slate-400">{isOut ? 'Sold out' : `${available} left`}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <Button
                  fullWidth
                  size="lg"
                  onClick={handleBookNow}
                  disabled={isSoldOut || isPast || event.status === 'cancelled'}
                  className="mb-3"
                  icon={Ticket}
                >
                  {isPast ? 'Event Ended' : isSoldOut ? 'Sold Out — Join Waitlist' : event.status === 'cancelled' ? 'Event Cancelled' : 'Book Tickets'}
                </Button>

                <div className="flex gap-2">
                  <Button variant="secondary" fullWidth size="sm" onClick={handleBookmark}>
                    {bookmarked ? <BookmarkCheck className="w-4 h-4 text-brand-400" /> : <Bookmark className="w-4 h-4" />}
                    {bookmarked ? 'Saved' : 'Save'}
                  </Button>
                  <Button variant="secondary" fullWidth size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
                  {event.refundPolicy && <p>✓ Refund policy available</p>}
                  <p>✓ Secure checkout</p>
                  <p>✓ Instant QR ticket delivery</p>
                </div>
              </div>

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="glass-card p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map(tag => (
                      <Link key={tag} to={`/events?search=${tag}`} className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
