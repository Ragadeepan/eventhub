import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen:    false,
  mobileMenuOpen: false,
  searchOpen:     false,
  notifOpen:      false,

  setSidebarOpen:    (v) => set({ sidebarOpen: v }),
  toggleSidebar:     ()  => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
  toggleMobileMenu:  ()  => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setSearchOpen:     (v) => set({ searchOpen: v }),
  toggleSearch:      ()  => set((s) => ({ searchOpen: !s.searchOpen })),
  setNotifOpen:      (v) => set({ notifOpen: v }),
  toggleNotif:       ()  => set((s) => ({ notifOpen: !s.notifOpen })),
  closeAll:          ()  => set({ sidebarOpen: false, mobileMenuOpen: false, searchOpen: false, notifOpen: false }),
}));
