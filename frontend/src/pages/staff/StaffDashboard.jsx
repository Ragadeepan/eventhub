import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, QrCode, CheckCircle, XCircle, Clock, Users, Search, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { eventService } from '../../services/eventService.js';
import { formatEventDate, formatRelativeTime } from '../../utils/formatters.js';
import api from '../../lib/api.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: Shield, label: 'Check-in', href: '/staff', exact: true },
];

const SCAN_STATES = { idle: 'idle', success: 'success', error: 'error' };

export default function StaffDashboard() {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [manualId, setManualId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanState, setScanState] = useState(SCAN_STATES.idle);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const [eventSearch, setEventSearch] = useState('');

  const { data: eventsData } = useQuery({
    queryKey: ['published-events', eventSearch],
    queryFn: () => eventService.getEvents({ status: 'published', search: eventSearch, limit: 20 }),
  });

  const events = eventsData?.events || [];
  const currentEvent = events.find(e => e._id === selectedEvent);

  const checkIn = async (rawQRData) => {
    if (!selectedEvent) { toast.error('Please select an event first'); return; }
    try {
      const res = await api.post(`/bookings/check-in/${selectedEvent}`, { qrData: rawQRData });
      setScanResult(res);
      setScanState(SCAN_STATES.success);
      setScanHistory(prev => [{ ...res, scannedAt: new Date().toISOString(), success: true }, ...prev.slice(0, 19)]);
      toast.success('Check-in successful!');
    } catch (err) {
      setScanResult({ error: err.message });
      setScanState(SCAN_STATES.error);
      setScanHistory(prev => [{ error: err.message, ticketId: rawQRData, scannedAt: new Date().toISOString(), success: false }, ...prev.slice(0, 19)]);
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
    setTimeout(() => { setScanState(SCAN_STATES.idle); setScanResult(null); }, 4000);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    await checkIn(manualId.trim());
    setManualId('');
  };

  const startScanner = async () => {
    if (!scannerRef.current) return;
    const { Html5Qrcode } = await import('html5-qrcode');
    html5QrRef.current = new Html5Qrcode('qr-reader');
    await html5QrRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (text) => { await checkIn(text); },
      () => {}
    );
    setScanning(true);
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      await html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => () => { stopScanner(); }, []);

  return (
    <DashboardLayout navItems={NAV} title="Staff Check-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Event Check-in</h2>
        <p className="text-slate-400 text-sm">Scan QR codes or enter ticket IDs to check in attendees</p>
      </div>

      {/* Event selector */}
      <div className="glass-card p-4 mb-6">
        <label className="text-xs font-medium text-slate-400 mb-2 block">Select Event</label>
        <div className="relative">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500/50 appearance-none pr-10"
          >
            <option value="">-- Choose an event --</option>
            {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {currentEvent && (
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatEventDate(currentEvent.startDate, currentEvent.endDate)}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {currentEvent.registeredCount}/{currentEvent.maxAttendees}</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> {currentEvent.checkInCount || 0} checked in</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4" /> QR Scanner
          </h3>

          <div id="qr-reader" ref={scannerRef} className="w-full rounded-xl overflow-hidden mb-4 bg-black/40" style={{ minHeight: scanning ? 'auto' : 0 }} />

          {!scanning ? (
            <button
              onClick={startScanner}
              disabled={!selectedEvent}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" /> Start Camera Scanner
            </button>
          ) : (
            <button onClick={stopScanner} className="w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium text-sm transition-colors">
              Stop Scanner
            </button>
          )}

          {/* Manual entry */}
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2">Or enter ticket ID manually:</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="TKT-xxxxxxxx"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500/50"
              />
              <button type="submit" disabled={!manualId.trim() || !selectedEvent} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm font-medium transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Result + History */}
        <div className="space-y-4">
          {/* Scan result */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-5 border ${scanState === SCAN_STATES.success ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {scanState === SCAN_STATES.success
                    ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                    : <XCircle className="w-6 h-6 text-red-400" />}
                  <span className={`font-semibold ${scanState === SCAN_STATES.success ? 'text-emerald-300' : 'text-red-300'}`}>
                    {scanState === SCAN_STATES.success ? 'Check-in Successful' : 'Check-in Failed'}
                  </span>
                </div>
                {scanResult.ticket ? (
                  <div className="space-y-1.5 text-sm">
                    <p className="text-white font-medium">{scanResult.ticket.holderName}</p>
                    <p className="text-slate-400 text-xs">{scanResult.ticket.holderEmail}</p>
                    <p className="text-slate-400 text-xs">{scanResult.ticket.ticketTypeName}</p>
                    <p className="text-slate-500 text-xs font-mono">{scanResult.ticket.ticketId}</p>
                  </div>
                ) : (
                  <p className="text-red-300 text-sm">{scanResult.error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan history */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 text-sm">Recent Scans</h3>
            {scanHistory.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No scans yet</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {scanHistory.map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${item.success ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    {item.success
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{item.ticket?.holderName || item.ticketId || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{formatRelativeTime(item.scannedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
