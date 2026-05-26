import { useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAV_ITEMS } from '@/utils/constants';
import { motion } from 'framer-motion';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 lg:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200/80 flex items-center justify-around px-2 pb-safe z-30">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = (Icons as any)[item.icon] || Icons.HelpCircle;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center flex-1 py-1 relative text-center cursor-pointer"
          >
            {isActive && (
              <motion.div
                layoutId="active-bottom-indicator"
                className="absolute inset-0 mx-auto w-12 h-12 bg-[#0071E3]/8 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <Icon
              className={`w-5 h-5 transition-transform duration-200 ${
                isActive
                  ? 'text-[#0071E3] scale-110'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            />
            <span
              className={`text-[10px] mt-1 transition-all duration-200 ${
                isActive ? 'text-[#0071E3] font-medium scale-105' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
