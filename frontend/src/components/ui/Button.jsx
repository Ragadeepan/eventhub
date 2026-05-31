import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

const variants = {
  primary:   'bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white shadow-glow hover:shadow-glow-lg',
  secondary: 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white',
  ghost:     'text-slate-300 hover:text-white hover:bg-white/10',
  danger:    'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300',
  success:   'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400',
  outline:   'border border-brand-500/50 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500',
};

const sizes = {
  xs:  'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  sm:  'text-sm px-4 py-2 rounded-xl gap-2',
  md:  'text-sm px-6 py-2.5 rounded-xl gap-2',
  lg:  'text-base px-8 py-3 rounded-xl gap-2.5',
  xl:  'text-lg px-10 py-4 rounded-2xl gap-3',
};

const Button = forwardRef(({ children, variant = 'primary', size = 'md', isLoading, icon: Icon, iconRight, fullWidth, className, disabled, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !isLoading ? { scale: 0.97 } : undefined}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
      {iconRight && !isLoading && <iconRight className="w-4 h-4 shrink-0 ml-auto" />}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
