import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  LayoutDashboard, 
  History, 
  Search, 
  Bell, 
  Settings,
  Utensils,
  Bus,
  Zap,
  ShoppingBag,
  Film,
  MoreHorizontal
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  activeView: 'dashboard' | 'movements' | 'add' | 'detail';
  onNavigate: (view: 'dashboard' | 'movements') => void;
  onAddClick: () => void;
}

export default function Layout({ 
  children, 
  title, 
  showBack, 
  onBack, 
  activeView,
  onNavigate,
  onAddClick
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] font-sans text-slate-200 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 bg-gradient-to-tr from-[#1E1B4B] via-[#0F172A] to-[#1e293b] opacity-100" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] z-0" />

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
          )}
          <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
        </div>
        
        {!showBack && (
          <div className="flex items-center gap-4 text-slate-400">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            <Search className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            <Settings className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export function CategoryIcon({ category, className }: { category: string, className?: string }) {
  switch (category) {
    case 'Alimentación': return <Utensils className={className} />;
    case 'Transporte': return <Bus className={className} />;
    case 'Servicios': return <Zap className={className} />;
    case 'Ropa': return <ShoppingBag className={className} />;
    case 'Entretenimiento': return <Film className={className} />;
    default: return <MoreHorizontal className={className} />;
  }
}

export function CategoryColor(category: string) {
  switch (category) {
    case 'Alimentación': return 'bg-orange-500/10 text-orange-500';
    case 'Transporte': return 'bg-blue-500/10 text-blue-500';
    case 'Servicios': return 'bg-yellow-500/10 text-yellow-500';
    case 'Ropa': return 'bg-purple-500/10 text-purple-500';
    case 'Entretenimiento': return 'bg-pink-500/10 text-pink-500';
    default: return 'bg-slate-500/10 text-slate-500';
  }
}
