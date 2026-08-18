import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  LogOut,
  BookUser,
  FileText,
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import logoImage from '../assets/favicon.png';

interface DashboardProps {
  onLogout: () => void;
  username: string;
}

export default function Dashboard({ onLogout, username }: DashboardProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Compact Icon-only design */}
      <aside className="hidden lg:flex w-18 bg-white flex-col items-center py-8 text-slate-800 z-20 border-r border-slate-100">
        <div className="mb-12">
          <Link to="/" className="hover:scale-105 transition-transform group relative">
            <div className="flex items-center justify-center rounded-2xl bg-white px-2 py-2">
              <img
                src={logoImage}
                alt="TaxBandits Developer"
                className="block h-7 w-auto object-contain select-none"
                draggable={false}
              />
            </div>
            <span className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest z-50">
              TaxBandits
            </span>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col items-center justify-center gap-6">
          <NavIcon 
            to="/" 
            icon={<LayoutDashboard size={24} />} 
            label="Dashboard" 
            active={location.pathname === '/'} 
          />
          <NavIcon
            to="/address-book"
            icon={<BookUser size={24} />}
            label="Address Book (Business & Recipient)"
            active={location.pathname === '/address-book'}
          />
          <NavIcon
            to="/form-1099-series"
            icon={<FileText size={24} />}
            label="Form 1099 Series"
            active={location.pathname === '/form-1099-series'}
          />
        </nav>

        <div className="mt-auto">
          <button 
            onClick={onLogout}
            className="w-14 h-14 flex items-center justify-center text-slate-300 hover:text-tax-orange hover:bg-orange-50 rounded-[24px] transition-all group relative border border-transparent hover:border-orange-100"
          >
            <LogOut size={24} />
            <span className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest z-50">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-10 py-3 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Welcome to TaxBandits SDK</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-tax-orange text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100">
               <span className="w-1.5 h-1.5 bg-tax-orange rounded-full animate-pulse" />
               Sandbox
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 tracking-tight">{username}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">v2.4 Production</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center text-tax-orange font-black shadow-sm text-lg">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavIcon({ to, icon, label, active = false }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      to={to} 
      className={`
        w-14 h-14 flex items-center justify-center rounded-[24px] transition-all group relative border
        ${active 
          ? 'bg-tax-orange text-white border-tax-orange shadow-[0_8px_20px_-6px_rgba(245,130,32,0.4)]' 
          : 'text-slate-300 border-transparent hover:text-tax-orange hover:bg-orange-50 hover:border-orange-100'}
      `}
    >
      {icon}
      <span className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap uppercase tracking-widest z-50">
        {label}
      </span>
    </Link>
  );
}
