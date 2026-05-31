import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Calendar, MapPin } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatEventDate, formatDate } from '../../utils/formatters.js';
import Badge from '../ui/Badge.jsx';
import toast from 'react-hot-toast';

export default function QRTicketCard({ ticket, event, index = 0 }) {
  const ticketRef = useRef(null);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    toast.loading('Generating PDF…', { id: 'pdf' });
    try {
      const canvas = await html2canvas(ticketRef.current, { backgroundColor: '#0f0f1a', scale: 2 });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [210, 100] });
      pdf.addImage(img, 'PNG', 0, 0, 210, 100);
      pdf.save(`ticket-${ticket.ticketId}.pdf`);
      toast.success('Ticket downloaded!', { id: 'pdf' });
    } catch {
      toast.error('Download failed', { id: 'pdf' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Printable ticket */}
      <div ref={ticketRef} className="relative bg-gradient-to-br from-surface-50 to-surface border border-white/10 rounded-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-amber-500 to-red-500" />

        <div className="flex">
          {/* Left: event info */}
          <div className="flex-1 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg overflow-hidden shadow-glow">
                <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
              </div>
              <span className="text-sm font-bold gradient-text">EventHub</span>
            </div>

            <h3 className="font-bold text-white text-lg leading-tight mb-2 line-clamp-2">{event?.title || 'Event'}</h3>

            <div className="space-y-1.5 text-xs text-slate-400 mb-3">
              {event?.startDate && (
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-400" />{formatEventDate(event.startDate, event.endDate)}</div>
              )}
              {event?.venue?.city && (
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" />{event.venue.name}, {event.venue.city}</div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="primary" className="text-xs">{ticket.ticketTypeName}</Badge>
              <Badge status={ticket.status} className="text-xs">{ticket.status}</Badge>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-slate-500 mb-0.5">Holder</p>
              <p className="text-sm font-medium text-white">{ticket.holderName}</p>
              <p className="text-xs text-slate-400">{ticket.holderEmail}</p>
            </div>

            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-0.5">Ticket ID</p>
              <p className="font-mono text-xs text-brand-400">{ticket.ticketId}</p>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center px-2">
            <div className="w-px h-full border-l-2 border-dashed border-white/15" />
          </div>

          {/* Right: QR code */}
          <div className="w-36 flex flex-col items-center justify-center p-4 bg-white/3">
            {ticket.qrCode ? (
              <img src={ticket.qrCode} alt="QR Code" className="w-24 h-24 rounded-xl mb-2" />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 text-xs text-center mb-2">
                QR Code will appear here
              </div>
            )}
            <p className="text-xs text-slate-500 text-center">Scan at entrance</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <button onClick={downloadTicket} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/verify-ticket/${ticket.ticketId}`); toast.success('Ticket link copied!'); }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
