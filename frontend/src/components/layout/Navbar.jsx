import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, ChevronDown, Calendar, Plus, LayoutDashboard, LogOut, User, Settings, Ticket, Users, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { notificationService } from '../../services/eventService.js';
import { useQuery } from '@tanstack/react-query';
import Avatar from '../ui/Avatar.jsx';
import Button from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/events',    label: 'Discover' },
  { href: '/events?type=virtual', label: 'Virtual' },
  { href: '/events?isFeatured=true', label: 'Featured' },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen, closeAll } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { closeAll(); }, [location.pathname, closeAll]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) { navigate(`/events?search=${encodeURIComponent(searchVal.trim())}`); setSearchOpen(false); setSearchVal(''); }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'organizer': return '/organizer';
      case 'staff': return '/staff';
      default: return '/dashboard';
    }
  };

  const isLanding = location.pathname === '/';

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, type: 'spring', damping: 25 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled || !isLanding ? 'bg-surface/90 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-glow shrink-0">
                <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
              </div>
              <span className="text-lg font-bold gradient-text hidden sm:block">EventHub</span>
            </Link>

            {/* Nav links (desktop) */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  to={href}
                  className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors', location.pathname === href ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/8')}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:block">Search events…</span>
              <kbd className="hidden lg:block text-xs bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <Link to="/dashboard" className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                  <Bell className="w-5 h-5 text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Organizer CTA */}
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Button size="sm" icon={Plus} onClick={() => navigate('/organizer/events/create')} className="hidden sm:flex">
                    Create
                  </Button>
                )}

                {/* User menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <Avatar src={user.avatar} name={user.displayName || user.firstName} size="sm" badge badgeVariant="success" />
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform hidden sm:block', userMenuOpen && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-60 glass-card py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10 mb-1">
                          <p className="text-sm font-semibold text-white">{user.displayName || `${user.firstName} ${user.lastName}`}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 capitalize">{user.role}</span>
                        </div>

                        {[
                          { icon: LayoutDashboard, label: 'Dashboard', href: getDashboardLink() },
                          { icon: Ticket, label: 'My Tickets', href: '/my-tickets' },
                          { icon: User, label: 'Profile', href: '/profile' },
                          ...(user.role === 'organizer' || user.role === 'admin' ? [{ icon: Calendar, label: 'My Events', href: '/organizer/events' }] : []),
                          ...(user.role === 'admin' ? [{ icon: Shield, label: 'Admin Panel', href: '/admin' }] : []),
                        ].map(({ icon: Icon, label, href }) => (
                          <Link
                            key={href}
                            to={href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/8 transition-colors"
                          >
                            <Icon className="w-4 h-4 text-slate-400" />
                            {label}
                          </Link>
                        ))}

                        <div className="border-t border-white/10 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden p-2 rounded-xl hover:bg-white/10 transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          >
            <motion.form
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSearch}
              className="w-full max-w-2xl"
            >
              <div className="glass-card p-2 flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
                <input
                  autoFocus
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search events, venues, organizers…"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg py-2"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-72 bg-surface-50 border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-bold gradient-text">EventHub</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map(({ href, label }) => (
                <Link key={href} to={href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 font-medium transition-colors">
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 font-medium">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/my-tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 font-medium">
                    <Ticket className="w-4 h-4" /> My Tickets
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-white/10 my-2" />
                  <Link to="/login" className="flex items-center justify-center px-4 py-3 rounded-xl text-white bg-white/10 font-medium">Sign In</Link>
                  <Link to="/register" className="flex items-center justify-center px-4 py-3 rounded-xl text-white bg-gradient-to-r from-brand-500 to-amber-500 font-medium">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut */}
      {/* eslint-disable-next-line */}
      <div className="hidden" data-search-trigger onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); } }} />
    </>
  );
}
