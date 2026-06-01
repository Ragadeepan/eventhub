import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ServerWakeBanner() {
  const [status, setStatus] = useState('idle'); // idle | waking | ready

  useEffect(() => {
    let timer;
    const controller = new AbortController();

    const ping = async () => {
      const base = API_URL.replace(/\/api$/, '');
      try {
        const start = Date.now();
        const res = await fetch(`${base}/health`, { signal: controller.signal, cache: 'no-store' });
        if (res.ok) {
          setStatus(Date.now() - start > 3000 ? 'ready' : 'idle');
        }
      } catch {
        setStatus('waking');
        // Retry every 5s while waking
        timer = setTimeout(ping, 5000);
      }
    };

    // Only show banner if backend takes > 2s to respond
    timer = setTimeout(() => {
      setStatus(prev => prev === 'idle' ? 'waking' : prev);
    }, 2000);

    ping();

    return () => { clearTimeout(timer); controller.abort(); };
  }, []);

  useEffect(() => {
    if (status === 'ready') {
      const t = setTimeout(() => setStatus('idle'), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return (
    <AnimatePresence>
      {status === 'waking' && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pt-2 pointer-events-none"
        >
          <div className="bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-3 shadow-lg pointer-events-auto max-w-sm w-full">
            <div className="flex gap-1 shrink-0">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
            <p className="text-amber-300 text-sm font-medium">Server starting up — ready in ~30 sec</p>
          </div>
        </motion.div>
      )}
      {status === 'ready' && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pt-2 pointer-events-none"
        >
          <div className="bg-green-500/10 border border-green-500/30 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-3 shadow-lg max-w-sm w-full">
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
            <p className="text-green-300 text-sm font-medium">Server is ready!</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
