import { motion } from 'motion/react';
import { ShieldCheck, Lock, ArrowRight, Github, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from './Input';
import logoImage from '../assets/logo.webp';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(formData.username || 'developer@company.com');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-800 overflow-hidden">
      {/* Left Panel: Branding & Value Proposition - Hidden on mobile */}
      <div className="hidden lg:flex w-5/12 bg-white p-16 flex-col justify-between text-slate-800 relative border-r border-slate-100">
        <div className="z-10">
          <div className="flex items-center gap-4">
            <img
              src={logoImage}
              alt="TaxBandits Developer"
              className="block h-14 w-auto object-contain scale-110 origin-left select-none"
              draggable={false}
            />
          </div>

          <div className="mt-24">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-black leading-tight mb-6 text-slate-900"
            >
              Secure & Reliable <br />
              <span className="text-tax-orange italic">E-Filing</span> Infrastructure.
            </motion.h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm">
              Connect to the industry-leading tax filing API. Simple integration for 1099, W-2, and 94x forms.
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="z-10 space-y-4">
          {[
            'PCI DSS Compliant',
            'Real-time Tin Matching',
            'Webhook Integration'
          ].map((feature, i) => (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              key={feature} 
              className="flex items-center gap-2 text-sm font-bold text-slate-400"
            >
              <CheckCircle2 className="w-4 h-4 text-tax-orange" />
              {feature}
            </motion.div>
          ))}
        </div>

        {/* Decorative Background for Left Panel */}
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#F58220_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-100 rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center px-6 md:px-24 bg-tax-orange-light/30 min-h-screen relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          {/* Mobile Logo Visibility */}
          <div className="lg:hidden flex justify-center mb-12">
            <img
              src={logoImage}
              alt="TaxBandits Developer"
              className="block h-14 w-auto object-contain select-none"
              draggable={false}
            />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Account Login</h2>
            <p className="text-slate-500 font-medium">Enter your credentials to access the API dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-orange-500/5">
            <Input
              id="username"
              label="Username / Client Email"
              type="text"
              placeholder="tax_developer@company.com"
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
              required
            />

            <Input
              id="password"
              label="Secret Key / Password"
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-tax-orange focus:ring-tax-orange" />
                <span className="text-sm text-slate-500 font-medium group-hover:text-slate-900 transition-colors">Keep me logged in</span>
              </label>
              <a href="#" className="text-sm font-bold text-tax-orange hover:text-orange-700 transition-colors">
                Forgot secrets?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 rounded-2xl font-black text-white transition-all
                flex items-center justify-center gap-2 tracking-widest uppercase text-xs
                ${isLoading 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-tax-orange hover:bg-orange-600 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98]'}
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Login <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* External Social/Auth Options */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
            <div className="flex gap-4 w-full">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600">
                <Github className="w-4 h-4" /> Github
              </button>
              <a 
                href="https://developer.taxbandits.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-600 text-center"
              >
                 Documentation
              </a>
            </div>
            <p className="text-xs text-slate-400">© 2026 Span Enterprises LLC. All rights reserved.</p>
          </div>
        </motion.div>
      </div>

      {/* Security Footer Bar for desktop */}
      <div className="hidden lg:flex fixed bottom-0 right-0 w-7/12 bg-white/80 backdrop-blur-sm p-4 border-t border-slate-100 justify-center gap-8 z-20">
         <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
           <ShieldCheck className="w-3 h-3" /> PCI DSS Provider
         </div>
         <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
           <Lock className="w-3 h-3" /> SOC2 Compliant
         </div>
      </div>
    </div>
  );
}
