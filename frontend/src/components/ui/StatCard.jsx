import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function StatCard({ title, value, change, changeLabel, icon: Icon, color = 'brand', index = 0, suffix, prefix, description }) {
  const colorMap = {
    brand:   { bg: 'from-brand-500/20 to-amber-500/20',  icon: 'text-brand-400',   border: 'border-brand-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-teal-600/20', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber:   { bg: 'from-amber-500/20 to-orange-600/20', icon: 'text-amber-400',   border: 'border-amber-500/20' },
    rose:    { bg: 'from-rose-500/20 to-red-600/20',     icon: 'text-rose-400',    border: 'border-rose-500/20' },
    cyan:    { bg: 'from-cyan-500/20 to-blue-600/20',    icon: 'text-cyan-400',    border: 'border-cyan-500/20' },
    purple:  { bg: 'from-brand-500/20 to-red-500/20',      icon: 'text-brand-300',  border: 'border-brand-500/20' },
  };
  const c = colorMap[color] || colorMap.brand;
  const isPositive = typeof change === 'number' ? change > 0 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn('glass-card p-6 hover:border-white/20 transition-all duration-300', c.border)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-lg font-semibold text-slate-300">{prefix}</span>}
            <p className="text-3xl font-bold text-white">{value}</p>
            {suffix && <span className="text-lg font-semibold text-slate-300">{suffix}</span>}
          </div>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
        {Icon && (
          <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0', c.bg)}>
            <Icon className={cn('w-6 h-6', c.icon)} />
          </div>
        )}
      </div>
      {typeof change === 'number' && (
        <div className={cn('flex items-center gap-1.5 text-sm font-medium', isPositive ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-400')}>
          {change > 0 ? <TrendingUp className="w-4 h-4" /> : change < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
          {changeLabel && <span className="text-slate-500 font-normal">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
