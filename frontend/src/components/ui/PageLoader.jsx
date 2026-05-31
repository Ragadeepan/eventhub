import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-glow-lg">
            <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-500 animate-ping opacity-20" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-400"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">Loading EventHub</p>
      </motion.div>
    </div>
  );
}
