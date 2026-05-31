import { motion } from 'framer-motion';
import Button from './Button.jsx';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel, secondaryAction, secondaryActionLabel, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-slate-500" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-6">{description}</p>}
      <div className="flex items-center gap-3">
        {action && <Button onClick={action}>{actionLabel || 'Get Started'}</Button>}
        {secondaryAction && <Button variant="secondary" onClick={secondaryAction}>{secondaryActionLabel}</Button>}
      </div>
    </motion.div>
  );
}
