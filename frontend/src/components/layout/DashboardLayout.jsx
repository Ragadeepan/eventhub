import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bell, Search, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import Avatar from '../ui/Avatar.jsx';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children, navItems, title }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className={cn('flex flex-col h-full', !mobile && (collapsed ? 'w-16' : 'w-64'))}>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-white/10', collapsed && !mobile && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-xl overflow-hidden shadow-glow shrink-0">
          <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
        </div>
        {(!collapsed || mobile) && <span className="font-bold gradient-text text-lg">EventHub</span>}
      </div>

      {/* User info */}
      <div className={cn('p-4 border-b border-white/10', collapsed && !mobile && 'flex justify-center px-2')}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.displayName || user?.firstName} size="sm" badge />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.displayName || `${user?.firstName} ${user?.lastName}`}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        ) : (
          <Avatar src={user?.avatar} name={user?.displayName || user?.firstName} size="sm" badge />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ icon: Icon, label, href, exact }) => (
          <NavLink
            key={href}
            to={href}
            end={exact}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive ? 'text-white bg-brand-500/20 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/8',
              collapsed && !mobile && 'justify-center px-2'
            )}
            title={collapsed && !mobile ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {(!collapsed || mobile) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className={cn('p-3 border-t border-white/10', collapsed && !mobile && 'flex justify-center')}>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full',
            collapsed && !mobile && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || mobile) && 'Sign out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-surface-50 border-r border-white/10 shrink-0 relative"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface-50 border border-white/20 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/60 md:hidden" />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-50 border-r border-white/10 md:hidden"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-white/10 bg-surface/50 backdrop-blur-xl shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-white/10">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <div className="flex-1" />
          <button className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="relative p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Avatar src={user?.avatar} name={user?.displayName} size="sm" badge />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
