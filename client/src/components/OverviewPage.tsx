import React from "react";
import { motion } from "motion/react";
import { Users, Key, FileText, ExternalLink, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function OverviewPage() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Developer Dashboard
        </h2>
        <p className="text-slate-500 text-sm">
          Quick access to your integration tools
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Address Book Card */}
        <Link to="/address-book">
          <motion.div
            whileHover={{
              y: -4,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            }}
            className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full transition-all cursor-pointer hover:border-tax-orange/30"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-orange-50 text-tax-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-tax-orange transition-colors" />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              Address Book

              <span className="bg-gradient-to-r from-orange-500 to-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md tracking-wide">
                Business & Recipient
              </span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Manage your centralized directory of Businesses (Payors) and
              Recipients. Sync organizational profiles and recipient PII
              securely.
            </p>

            <div className="mt-auto flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-400">
                4.8k Total Records
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Form 1099 Series Card */}
        <Link to="/form-1099-series">
          <motion.div
            whileHover={{
              y: -4,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            }}
            className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full transition-all cursor-pointer hover:border-tax-orange/30"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-orange-50 text-tax-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={32} />
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-tax-orange transition-colors" />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-3 flex items-center gap-3">
              Form 1099 Series
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              View, search, filter, edit, and transmit individual Form 1099
              filings (1099-NEC & 1099-MISC).
            </p>

            <div className="mt-auto">
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full w-fit">
                <div className="w-1.5 h-1.5 bg-tax-orange rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">
                  NEC & MISC
                </span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* OAuth Card */}
        <Link to="/oauth">
          <motion.div
            whileHover={{
              y: -4,
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            }}
            className="group bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full transition-all cursor-pointer hover:border-tax-orange/30"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-orange-50 text-tax-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Key size={32} />
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-tax-orange transition-colors" />
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              OAuth Integration
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Configure your API credentials, manage client secrets, and test
              your authentication flow with short-lived bearer tokens.
            </p>

            <div className="mt-auto">
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full w-fit">
                <div className="w-1.5 h-1.5 bg-tax-orange rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">
                  Active Secrets
                </span>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      <div className="pt-12 flex justify-center">
        <div className="bg-slate-100/50 border border-slate-200 rounded-3xl p-8 text-center max-w-xl">
          <p className="text-slate-600 text-sm mb-6 font-medium leading-relaxed">
            Looking for detailed integration guides and implementation samples?
            Check our comprehensive developer documentation.
          </p>
          <a
            href="https://developer.taxbandits.com/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-tax-orange font-black text-xs uppercase tracking-widest rounded-xl hover:bg-orange-50 transition-all shadow-sm"
          >
            Visit Developer Portal <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
