import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { eventService } from '../../services/eventService.js';
import { formatDate, formatNumber } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

const NAV = [
  { icon: ArrowLeft,  label: 'My Events',   href: '/organizer/events' },
  { icon: Calendar,   label: 'Create New',  href: '/organizer/events/create' },
];

const STATUS_COLORS = {
  active:    'text-emerald-400',
  used:      'text-brand-400',
  cancelled: 'text-red-400',
};

export default function ManageAttendeesPage() {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: eventData } = useQuery({
    queryKey: ['event-edit', id],
    queryFn: () => eventService.getById(id),
    enabled: !!id,
  });

  const { data: attendeesData, isLoading } = useQuery({
    queryKey: ['event-attendees', id],
    queryFn: () => eventService.getEventAttendees(id),
    enabled: !!id,
  });

  const event = eventData?.event;
  const allAttendees = attendeesData?.attendees || [];

  const filtered = allAttendees.filter(a => {
    const name = `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.ticketStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const checkedIn = allAttendees.filter(a => a.isCheckedIn).length;

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Ticket', 'Status', 'Checked In', 'Booking Date'],
      ...allAttendees.map(a => [
        `${a.firstName} ${a.lastName}`,
        a.email,
        a.ticketTypeName || '',
        a.ticketStatus || '',
        a.isCheckedIn ? 'Yes' : 'No',
        formatDate(a.bookedAt),
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendees-${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout navItems={NAV} title="Attendees">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link to="/organizer/events" className="text-sm text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
          </Link>
          <h2 className="text-2xl font-bold text-white">{event?.title || 'Attendees'}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{formatNumber(allAttendees.length)} attendees · {checkedIn} checked in</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Registered', value: formatNumber(allAttendees.length), icon: Users, color: 'text-brand-400' },
          { label: 'Checked In', value: formatNumber(checkedIn), icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Not Checked In', value: formatNumber(allAttendees.length - checkedIn), icon: Clock, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <Icon className={cn('w-5 h-5 mx-auto mb-2', color)} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 glass-card px-4 py-2.5 rounded-xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
          <option value="">All Status</option>
          {['active', 'used', 'cancelled'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Attendee', 'Ticket Type', 'Status', 'Check-in', 'Booked'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-4 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-white/10 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">No attendees found</td></tr>
              ) : (
                filtered.map((attendee, i) => (
                  <motion.tr key={attendee._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={attendee.avatar} name={attendee.firstName} size="sm" />
                        <div>
                          <p className="font-medium text-white">{attendee.firstName} {attendee.lastName}</p>
                          <p className="text-xs text-slate-400">{attendee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300 text-xs">{attendee.ticketTypeName || '—'}</td>
                    <td className="px-4 py-4">
                      <Badge status={attendee.ticketStatus} dot>{attendee.ticketStatus || 'active'}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      {attendee.isCheckedIn ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Checked in
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-slate-500">
                          <XCircle className="w-3.5 h-3.5" /> Not yet
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs">{formatDate(attendee.bookedAt || attendee.createdAt)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
