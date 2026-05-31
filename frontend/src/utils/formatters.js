import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date, fmt = 'MMM d, yyyy') => {
  if (!date) return '';
  return format(new Date(date), fmt);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy · h:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatEventDate = (startDate, endDate) => {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (isToday(start))    return `Today · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  if (isTomorrow(start)) return `Tomorrow · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) return `${format(start, 'EEE, MMM d')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`;
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
};

export const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`;
  return num?.toString() || '0';
};

export const truncate = (str, length = 100) => {
  if (!str || str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
};

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const formatLocation = (venue) => {
  if (!venue) return '';
  const parts = [venue.city, venue.state, venue.country].filter(Boolean);
  return parts.join(', ');
};
