import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle, XCircle, User, Ticket, Calendar, LayoutDashboard, Plus, BarChart3, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { bookingService } from '../../services/eventService.js';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/eventService.js';
import { formatDate } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',   href: '/organizer', exact: true },
  { icon: Calendar,        label: 'My Events',    href: '/organizer/events' },
  { icon: Plus,            label: 'Create Event', href: '/organizer/events/create' },
  { icon: Users,           label: 'Attendees',    href: '/organizer/events' },
  { icon: BarChart3,       label: 'Analytics',    href: '/organizer/analytics' },
  { icon: QrCode,          label: 'QR Scanner',   href: '/organizer/qr-scanner' },
];

export default function QRScannerPage() {
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const { data: eventsData } = useQuery({
    queryKey: ['organizer-events-all'],
    queryFn: () => eventService.getMyEvents({ limit: 50, status: 'published' }),
  });

  useEffect(() => {
    if (scanning && scannerRef.current && !scannerInstance.current) {
      scannerInstance.current = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 }, false);
      scannerInstance.current.render(onScanSuccess, onScanFailure);
    }
    if (!scanning && scannerInstance.current) {
      scannerInstance.current.clear().catch(() => {});
      scannerInstance.current = null;
    }
    return () => { if (scannerInstance.current) { scannerInstance.current.clear().catch(() => {}); scannerInstance.current = null; } };
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    if (checkInLoading) return;
    setCheckInLoading(true);
    try {
      const result = await bookingService.checkIn(selectedEvent, decodedText);
      setScanResult({ success: true, message: 'Check-in Successful! ✅', attendee: result.attendee, ticket: result.ticket });
      setScanHistory(prev => [{ ...result, timestamp: new Date(), success: true }, ...prev].slice(0, 20));
      toast.success('Checked in successfully!');
    } catch (err) {
      setScanResult({ success: false, message: err.message || 'Invalid ticket' });
      setScanHistory(prev => [{ message: err.message, timestamp: new Date(), success: false }, ...prev].slice(0, 20));
      toast.error(err.message);
    } finally { setCheckInLoading(false); }
  };

  const onScanFailure = () => {}; // ignore continuous scan failures

  const resetScan = () => setScanResult(null);

  return (
    <DashboardLayout navItems={NAV} title="QR Check-In Scanner">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Event selector */}
        <div className="glass-card p-5">
          <label className="text-sm font-medium text-slate-300 block mb-2">Select Event</label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">— Choose an event —</option>
            {(eventsData?.events || []).map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>
        </div>

        {/* Scanner */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><QrCode className="w-5 h-5 text-brand-400" />QR Scanner</h2>
            {scanning && <div className="flex items-center gap-1.5 text-emerald-400 text-sm"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Live</div>}
          </div>

          {!scanning ? (
            <div className="text-center py-12">
              <QrCode className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-6 text-sm">Position the camera to scan attendee QR codes for instant check-in</p>
              <Button onClick={() => { if (!selectedEvent) { toast.error('Please select an event first'); return; } setScanning(true); }} disabled={!selectedEvent} size="lg">
                Start Scanning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div id="qr-reader" ref={scannerRef} className="rounded-2xl overflow-hidden" />
              <Button variant="secondary" fullWidth onClick={() => setScanning(false)}>Stop Scanner</Button>
            </div>
          )}
        </div>

        {/* Scan result */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn('glass-card p-6 border', scanResult.success ? 'border-emerald-500/40' : 'border-red-500/40')}
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0', scanResult.success ? 'bg-emerald-500/20' : 'bg-red-500/20')}>
                  {scanResult.success ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
                </div>
                <div className="flex-1">
                  <p className={cn('font-semibold mb-1', scanResult.success ? 'text-emerald-400' : 'text-red-400')}>{scanResult.message}</p>
                  {scanResult.attendee && (
                    <div className="flex items-center gap-3 mt-3">
                      <Avatar src={scanResult.attendee.avatar} name={scanResult.attendee.firstName} size="md" />
                      <div>
                        <p className="text-sm font-medium text-white">{scanResult.attendee.firstName} {scanResult.attendee.lastName}</p>
                        <p className="text-xs text-slate-400">{scanResult.attendee.email}</p>
                      </div>
                    </div>
                  )}
                  {scanResult.ticket && (
                    <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{scanResult.ticket.ticketTypeName}</span>
                      <span>·</span>
                      <span className="font-mono">{scanResult.ticket.ticketId}</span>
                    </div>
                  )}
                </div>
                <button onClick={resetScan} className="text-slate-400 hover:text-white transition-colors p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan history */}
        {scanHistory.length > 0 && (
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">Recent Check-ins ({scanHistory.length})</h3>
            <div className="space-y-2">
              {scanHistory.slice(0, 10).map((entry, i) => (
                <div key={i} className={cn('flex items-center gap-3 py-2 px-3 rounded-xl text-sm', entry.success ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                  {entry.success ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className={entry.success ? 'text-emerald-300' : 'text-red-300'}>
                    {entry.success ? `${entry.attendee?.firstName} ${entry.attendee?.lastName}` : entry.message}
                  </span>
                  <span className="text-slate-500 ml-auto text-xs">{formatDate(entry.timestamp, 'HH:mm:ss')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
