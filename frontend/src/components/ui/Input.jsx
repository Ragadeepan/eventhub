import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

const Input = forwardRef(({ label, error, hint, icon: Icon, iconRight, className, wrapperClassName, ...props }, ref) => {
  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-500" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm',
            error ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            Icon && 'pl-10',
            iconRight && 'pr-10',
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute inset-y-0 right-3.5 flex items-center">
            {iconRight}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

export const Textarea = forwardRef(({ label, error, hint, className, wrapperClassName, ...props }, ref) => (
  <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none transition-all duration-200 text-sm resize-none',
        error ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, hint, children, className, wrapperClassName, ...props }, ref) => (
  <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
    {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'w-full bg-surface-50 border rounded-xl px-4 py-3 text-white focus:outline-none transition-all duration-200 text-sm',
        error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
));
Select.displayName = 'Select';
