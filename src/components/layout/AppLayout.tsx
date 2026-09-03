import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { MobileHeader } from './MobileHeader';
import { useUIStore } from '@/stores/uiStore';
import { AnimatePresence, motion } from 'framer-motion';

export function AppLayout() {
  const location = useLocation();
  const { isStudySessionActive } = useUIStore();

  return (
    <div className="min-h-screen bg-surface-base text-text-primary font-sans antialiased overflow-x-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Header bars */}
      {!isStudySessionActive && <Header />}
      {!isStudySessionActive && <MobileHeader />}

      {/* Main Content Area */}
      <main className={`app-main lg:pl-56 pt-14 lg:pt-16 pb-16 lg:pb-0 min-h-screen flex flex-col ${isStudySessionActive ? 'session-active' : ''}`}>
        <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 p-4 sm:p-5 lg:p-6 xl:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex h-full w-full flex-1 flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {!isStudySessionActive && <BottomNav />}
    </div>
  );
}
