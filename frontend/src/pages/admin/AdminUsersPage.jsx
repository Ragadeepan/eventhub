import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Users, Calendar, BarChart3, Search, Ban, UserCheck, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/eventService.js';
import { formatDate, formatRelativeTime } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: Shield,   label: 'Overview',  href: '/admin', exact: true },
  { icon: Users,    label: 'Users',     href: '/admin/users' },
  { icon: Calendar, label: 'Events',    href: '/admin/events' },
  { icon: BarChart3,label: 'Analytics', href: '/admin/analytics' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, role: roleFilter, page }],
    queryFn: () => adminService.getUsers({ search, role: roleFilter, page, limit: 15 }),
    keepPreviousData: true,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }) => adminService.banUser(id, reason),
    onSuccess: () => { toast.success('User banned'); queryClient.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.message),
  });

  const unbanMutation = useMutation({
    mutationFn: (id) => adminService.unbanUser(id),
    onSuccess: () => { toast.success('User unbanned'); queryClient.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.message),
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ id, role }) => adminService.changeRole(id, role),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries(['admin-users']); },
    onError: (err) => toast.error(err.message),
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  const handleBan = (user) => {
    const reason = prompt(`Ban reason for ${user.firstName} ${user.lastName}:`);
    if (reason !== null) banMutation.mutate({ id: user._id, reason: reason || 'Policy violation' });
  };

  return (
    <DashboardLayout navItems={NAV} title="User Management">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Users</h2>
        <Badge variant="primary">{pagination?.total || 0} total</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 glass-card px-4 py-2.5 rounded-xl">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
          <option value="">All Roles</option>
          {['attendee', 'organizer', 'staff', 'admin'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-400 px-4 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-4"><div className="h-4 bg-white/10 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">No users found</td></tr>
              ) : (
                users.map((user, i) => (
                  <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} name={user.firstName} size="sm" />
                        <div>
                          <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        defaultValue={user.role}
                        onChange={(e) => roleChangeMutation.mutate({ id: user._id, role: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        {['attendee', 'organizer', 'staff', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={user.isBanned ? 'danger' : user.isActive ? 'success' : 'default'} dot>
                        {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-400 text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      {user.isBanned ? (
                        <button onClick={() => unbanMutation.mutate(user._id)} disabled={unbanMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                          <UserCheck className="w-3.5 h-3.5" /> Unban
                        </button>
                      ) : (
                        <button onClick={() => handleBan(user)} disabled={banMutation.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                          <Ban className="w-3.5 h-3.5" /> Ban
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={cn('w-8 h-8 rounded-lg text-xs font-medium transition-colors', p === page ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-white/10')}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
