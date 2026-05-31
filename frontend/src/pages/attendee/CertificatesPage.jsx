import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink, Ticket, Calendar, Users, LayoutDashboard, Bookmark } from 'lucide-react';
import { jsPDF } from 'jspdf';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Button from '../../components/ui/Button.jsx';
import { certificateService } from '../../services/eventService.js';
import { formatDate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

const generateCertPDF = (cert) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Background
  doc.setFillColor(15, 15, 26);
  doc.rect(0, 0, 297, 210, 'F');

  // Border
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF ATTENDANCE', 148.5, 50, { align: 'center' });

  // Body
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('This is to certify that', 148.5, 75, { align: 'center' });

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(cert.holderName, 148.5, 95, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('has successfully attended', 148.5, 115, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(129, 140, 248);
  doc.text(cert.eventName, 148.5, 133, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text(`Held on ${formatDate(cert.eventDate, 'MMMM d, yyyy')}`, 148.5, 148, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(cert.issuerName, 80, 175);
  doc.setTextColor(148, 163, 184);
  doc.text(cert.issuerTitle || 'Event Organizer', 80, 183);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Certificate ID: ${cert.certificateId}`, 148.5, 197, { align: 'center' });

  doc.save(`certificate-${cert.certificateId}.pdf`);
};

export default function CertificatesPage() {
  const { data, isLoading } = useQuery({ queryKey: ['my-certificates'], queryFn: certificateService.getMyCerts });
  const certs = data?.certificates || [];

  return (
    <DashboardLayout navItems={NAV} title="My Certificates">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">My Certificates</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-48 animate-pulse" />)}
        </div>
      ) : certs.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet" description="Attend events with certificates enabled to earn your digital credentials" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert, i) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card overflow-hidden"
            >
              {/* Certificate preview */}
              <div className="bg-gradient-to-br from-brand-900/50 to-purple-900/50 p-8 text-center relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, rgba(99,102,241,0.3) 25%, transparent 25%)', backgroundSize: '20px 20px' }} />
                <Award className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest">Certificate of Attendance</p>
                <p className="text-lg font-bold text-white mb-1">{cert.holderName}</p>
                <p className="text-sm text-brand-300">{cert.eventName}</p>
                <p className="text-xs text-slate-400 mt-2">{formatDate(cert.eventDate, 'MMMM d, yyyy')}</p>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Cert ID</p>
                  <p className="text-xs font-mono text-brand-400">{cert.certificateId}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="secondary" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/verify/${cert.certificateId}`); toast.success('Verify link copied!'); }}>
                    <ExternalLink className="w-3.5 h-3.5" /> Share
                  </Button>
                  <Button size="xs" onClick={() => generateCertPDF(cert)}>
                    <Download className="w-3.5 h-3.5" /> PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
