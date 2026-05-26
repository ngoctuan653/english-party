import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { MobileHeader } from './MobileHeader';
import { useResponsive } from '@/hooks/useResponsive';
import { AnimatePresence, motion } from 'framer-motion';

export function AppLayout() {
  const { isMobile } = useResponsive();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-base text-text-primary font-sans antialiased overflow-x-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Header bars */}
      <Header />
      <MobileHeader />

      {/* Main Content Area */}
      <main className="lg:pl-64 pt-14 lg:pt-16 pb-16 lg:pb-0 min-h-screen flex flex-col">
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full h-full flex flex-col flex-1"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
