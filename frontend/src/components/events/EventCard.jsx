import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, Star, Clock, Video } from 'lucide-react';
import { formatEventDate, formatCurrency, formatNumber, truncate } from '../../utils/formatters.js';
import Badge from '../ui/Badge.jsx';
import Avatar from '../ui/Avatar.jsx';
import { cn } from '../../utils/cn.js';

export default function EventCard({ event, index = 0, onBookmark, isBookmarked, variant = 'default' }) {
  const lowestPrice = event.ticketTypes?.reduce((min, t) => Math.min(min, t.price), Infinity) ?? 0;
  const isFree = lowestPrice === 0;
  const isSoldOut = event.availableTickets === 0;

  if (variant === 'horizontal') return <HorizontalEventCard event={event} index={index} onBookmark={onBookmark} isBookmarked={isBookmarked} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group glass-card overflow-hidden hover:border-white/20 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      {/* Banner */}
      <div className="relative overflow-hidden h-48">
        <img
          src={event.banner}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-event-gradient" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {event.isFeatured && <Badge variant="primary" className="backdrop-blur-sm">Featured</Badge>}
          {event.isTrending && <Badge variant="warning" className="backdrop-blur-sm">Trending</Badge>}
          {event.type === 'virtual' && <Badge variant="cyan" className="backdrop-blur-sm" icon={Video}>Virtual</Badge>}
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => { e.preventDefault(); onBookmark?.(event._id); }}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 text-white hover:bg-black/50 transition-colors"
        >
          {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-brand-400" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Price */}
        <div className="absolute bottom-3 right-3">
          <span className={cn('px-3 py-1 rounded-xl text-sm font-bold backdrop-blur-sm border', isFree ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40' : 'bg-black/40 text-white border-white/20')}>
            {isFree ? 'Free' : `From ${formatCurrency(lowestPrice)}`}
          </span>
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500/80 text-white px-4 py-1 rounded-xl text-sm font-bold">Sold Out</span>
          </div>
        )}
      </div>

      {/* Content */}
      <Link to={`/events/${event.slug}`} className="block p-4">
        <div className="flex items-center gap-2 mb-2">
          {event.category && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: `${event.category.color}20`, color: event.category.color }}>
              {event.category.icon} {event.category.name}
            </span>
          )}
          {event.stats?.avgRating > 0 && (
            <div className="flex items-center gap-1 ml-auto text-xs text-amber-400">
              <Star className="w-3 h-3 fill-current" />
              {event.stats.avgRating}
            </div>
          )}
        </div>

        <h3 className="font-semibold text-white mb-2 leading-tight group-hover:text-brand-300 transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>{formatEventDate(event.startDate, event.endDate)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{event.type === 'virtual' ? 'Online Event' : `${event.venue.city}${event.venue.country ? `, ${event.venue.country}` : ''}`}</span>
            </div>
          )}
          {event.registeredCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{formatNumber(event.registeredCount)} attending</span>
            </div>
          )}
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <Avatar src={event.organizer.avatar} name={event.organizer.displayName} size="xs" />
            <span className="text-xs text-slate-400 truncate">{event.organizer.displayName}</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

function HorizontalEventCard({ event, index, onBookmark, isBookmarked }) {
  const lowestPrice = event.ticketTypes?.reduce((min, t) => Math.min(min, t.price), Infinity) ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group glass-card overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      <Link to={`/events/${event.slug}`} className="flex gap-4 p-4">
        <div className="relative w-32 h-24 rounded-xl overflow-hidden shrink-0">
          <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-brand-300 transition-colors line-clamp-2 mb-1">{event.title}</h3>
          <div className="text-xs text-slate-400 flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-brand-400" />
            {formatEventDate(event.startDate, event.endDate)}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-rose-400" />
            {event.venue?.city || 'Online'}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-white">{formatCurrency(lowestPrice)}</p>
          <Badge status={event.status} className="mt-1">{event.status}</Badge>
        </div>
      </Link>
    </motion.div>
  );
}
