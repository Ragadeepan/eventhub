import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, UserPlus, UserMinus, MapPin, Briefcase, Link as LinkIcon, Ticket, Calendar, Award, LayoutDashboard, Bookmark, Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { networkingService } from '../../services/eventService.js';
import { useAuthStore } from '../../store/authStore.js';
import { truncate } from '../../utils/formatters.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

function PersonCard({ person, isConnected, onConnect, onDisconnect, loading }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start gap-4">
        <Avatar src={person.avatar} name={person.displayName || person.firstName} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{person.displayName || `${person.firstName} ${person.lastName}`}</p>
          {person.bio && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{person.bio}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            {person.location && <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{person.location}</span>}
            {person.interests?.slice(0, 2).map(i => <span key={i} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-slate-400">{i}</span>)}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {isConnected ? (
          <Button variant="danger" size="xs" fullWidth isLoading={loading} onClick={() => onDisconnect(person._id)}>
            <UserMinus className="w-3.5 h-3.5" /> Disconnect
          </Button>
        ) : (
          <Button size="xs" fullWidth isLoading={loading} onClick={() => onConnect(person._id)}>
            <UserPlus className="w-3.5 h-3.5" /> Connect
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function NetworkingPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('connections');
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  const { data: connectionsData } = useQuery({ queryKey: ['connections'], queryFn: networkingService.getConnections });

  const connectMutation = useMutation({
    mutationFn: networkingService.connect,
    onSuccess: () => { toast.success('Connected!'); queryClient.invalidateQueries(['connections']); },
    onError: (err) => toast.error(err.message),
    onSettled: () => setLoadingId(null),
  });

  const disconnectMutation = useMutation({
    mutationFn: networkingService.disconnect,
    onSuccess: () => { toast.success('Disconnected'); queryClient.invalidateQueries(['connections']); },
    onError: (err) => toast.error(err.message),
    onSettled: () => setLoadingId(null),
  });

  const connections = (connectionsData?.connections || []).filter(c =>
    !search || (c.displayName || `${c.firstName} ${c.lastName}`).toLowerCase().includes(search.toLowerCase())
  );
  const connectedIds = new Set(connections.map(c => c._id));

  const handleConnect = (userId) => { setLoadingId(userId); connectMutation.mutate(userId); };
  const handleDisconnect = (userId) => { setLoadingId(userId); disconnectMutation.mutate(userId); };

  return (
    <DashboardLayout navItems={NAV} title="Networking">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Networking</h2>
          <p className="text-slate-400 text-sm">{connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['connections', 'discover'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 glass-card px-4 py-2.5 rounded-xl mb-6">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people…" className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" />
      </div>

      {activeTab === 'connections' && (
        connections.length === 0 ? (
          <EmptyState icon={Users} title="No connections yet" description="Attend events and connect with fellow attendees to grow your network" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {connections.map(person => (
              <PersonCard key={person._id} person={person} isConnected={true} onConnect={handleConnect} onDisconnect={handleDisconnect} loading={loadingId === person._id} />
            ))}
          </div>
        )
      )}

      {activeTab === 'discover' && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Discover attendees at your events</p>
          <p className="text-slate-400 text-sm">Book an event to see and connect with fellow attendees</p>
        </div>
      )}
    </DashboardLayout>
  );
}
