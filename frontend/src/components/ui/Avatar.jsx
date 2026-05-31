import { cn } from '../../utils/cn.js';
import { getInitials } from '../../utils/formatters.js';

const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg', '2xl': 'w-20 h-20 text-xl', '3xl': 'w-24 h-24 text-2xl' };

export default function Avatar({ src, alt, name, size = 'md', className, badge, badgeVariant = 'success' }) {
  const initials = getInitials(name || alt || '');
  const badgeColors = { success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500', info: 'bg-brand-500' };

  return (
    <div className="relative inline-flex shrink-0">
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={cn('rounded-full object-cover ring-2 ring-white/10', sizes[size], className)}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-brand-500 to-amber-500 flex items-center justify-center font-semibold text-white ring-2 ring-white/10',
          sizes[size],
          src && 'hidden',
          className
        )}
      >
        {initials}
      </div>
      {badge && (
        <span className={cn('absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-surface', badgeColors[badgeVariant] || badgeColors.success)} />
      )}
    </div>
  );
}
