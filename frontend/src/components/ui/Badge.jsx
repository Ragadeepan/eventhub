import { cn } from '../../utils/cn.js';

const variants = {
  default:  'bg-white/10 text-slate-300',
  primary:  'bg-brand-500/20 text-brand-300 border border-brand-500/30',
  success:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  warning:  'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  danger:   'bg-red-500/20 text-red-300 border border-red-500/30',
  purple:   'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  pink:     'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  cyan:     'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  orange:   'bg-orange-500/20 text-orange-300 border border-orange-500/30',
};

const statusMap = {
  published:  'success',
  draft:      'default',
  cancelled:  'danger',
  completed:  'purple',
  postponed:  'warning',
  confirmed:  'success',
  pending:    'warning',
  failed:     'danger',
  refunded:   'orange',
  active:     'success',
  used:       'cyan',
  free:       'emerald',
  paid:       'primary',
};

export default function Badge({ children, variant = 'default', status, icon: Icon, className, dot }) {
  const resolvedVariant = status ? (statusMap[status] || 'default') : variant;
  return (
    <span className={cn('badge', variants[resolvedVariant], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', { 'bg-emerald-400': resolvedVariant === 'success', 'bg-red-400': resolvedVariant === 'danger', 'bg-amber-400': resolvedVariant === 'warning', 'bg-brand-400': resolvedVariant === 'primary', 'bg-slate-400': resolvedVariant === 'default' })} />}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
