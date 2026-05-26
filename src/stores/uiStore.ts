import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  theme: 'dark' | 'light';
  isStudySessionActive: boolean;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  closeMobileMenu: () => void;
  setStudySessionActive: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: 'dark',
  isStudySessionActive: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setTheme: (theme) => set({ theme }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  setStudySessionActive: (active) => set({ isStudySessionActive: active }),
}));

