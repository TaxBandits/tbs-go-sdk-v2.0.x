import React, { useState, useEffect } from "react";
import {
  Key,
  Shield,
  RefreshCw,
  Copy,
  ExternalLink,
  Lock,
  Check,
  ChevronDown,
  Info,
  Server,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import api from "../api/client";

const SCOPES = ["Read", "Write", "Read_Write", "Transmit", "FullAccess"];
const CATEGORIES = [
  "All",
  "AddressBook",
  "WhCertificate",
  "Verifications",
  "W21099",
  "94x",
  "ACA",
  "Extension",
  "StatePayroll",
  "Utilities",
  "Reports",
];

export default function OAuthPage() {
  const [selectedScope, setSelectedScope] = useState("Read");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "AddressBook",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  } | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Toast auto-dismiss logic
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleCategory = (category: string) => {
    if (category === "All") {
      // If "All" is selected, deselect everything else and just keep "All"
      setSelectedCategories(["All"]);
      return;
    }

    setSelectedCategories((prev) => {
      // If we are selecting something else, always remove "All"
      const withoutAll = prev.filter((c) => c !== "All");
      if (withoutAll.includes(category)) {
        return withoutAll.filter((c) => c !== category);
      } else {
        return [...withoutAll, category];
      }
    });
  };

  const handleGenerateValues = async () => {
    setIsGenerating(true);
    try {
      const response = (await api.post("auth/gettoken", {
        Scope: selectedScope,
        Forms: selectedCategories,
      })) as any;

      if (
        response &&
        response.Response &&
        typeof response.Response === "string" &&
        response.Response !== ""
      ) {
        setTokens({
          accessToken: response.Response,
          refreshToken: "",
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        });
        setToast({
          message: "Access token generated successfully",
          type: "success",
        });
      } else {
        setToast({
          message:
            "Failed to generate token: Invalid credentials or empty response",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Generate token failed:", error);
      const errorMessage =
        error.response?.data?.StatusMessage ||
        error.message ||
        "Failed to generate token";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefreshExchange = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTokens((prev) =>
        prev
          ? {
              ...prev,
              accessToken: `at_sb_refreshed_${Math.random().toString(36).substring(2, 12)}`,
            }
          : null,
      );
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <nav className="flex text-xs text-slate-400 gap-2 mb-2 font-black uppercase tracking-widest">
            <Link to="/" className="hover:text-tax-orange">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-bold">API Authentication</span>
          </nav>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            API Authentication
          </h2>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4 flex items-start gap-4">
          <Server className="w-5 h-5 text-tax-orange mt-0.5" />
          <div className="text-[11px] text-orange-900 font-bold leading-relaxed uppercase tracking-wider">
            Client ID and Secrets are <br />
            <span className="font-black text-tax-orange">
              Fetched Securely
            </span>{" "}
            from the backend.
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Configuration Section */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm shadow-slate-200/50 h-full flex flex-col">
            <div className="mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-tax-orange" /> 01 Configure
                Credentials
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Select required permissions and categories for the OAuth
                session.
              </p>
            </div>

            <div className="space-y-10 flex-1">
              {/* Scope Dropdown */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between items-center px-1">
                  Application Scope
                  <span className="text-tax-orange font-black italic">
                    {selectedScope}
                  </span>
                </label>
                <div className="relative group">
                  <select
                    title="Application scope"
                    aria-label="Application scope"
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black text-slate-700 outline-none appearance-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all cursor-pointer shadow-sm"
                  >
                    {SCOPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-tax-orange transition-colors"
                    size={18}
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Service Categories (Choosable)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      type="button"
                      title={`Toggle category ${category}`}
                      className={`
                        px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm
                        ${
                          selectedCategories.includes(category)
                            ? "bg-tax-orange border-tax-orange text-white shadow-lg shadow-orange-500/20"
                            : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateValues}
              type="button"
              disabled={isGenerating}
              className="mt-12 w-full py-5 bg-tax-orange text-white font-black rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-900/10 active:scale-95 disabled:bg-slate-300 uppercase tracking-[0.2em] text-xs"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Generate Access Token <ExternalLink size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Display Section */}
        <div className="space-y-8">
          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-md ${
                  toast.type === "success"
                    ? "bg-green-50/90 border-green-100 text-green-900"
                    : "bg-red-50/90 border-red-100 text-red-900"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {toast.message}
                </span>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  title="Close notification"
                  aria-label="Close notification"
                  className="ml-2 hover:opacity-70"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {tokens ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm shadow-slate-200/50 flex flex-col gap-6"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
                    <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">
                      Live Bearer Assets
                    </span>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 font-mono italic">
                    Issued: {new Date().toLocaleTimeString()}
                  </span>
                </div>

                <TokenDisplay label="Access Token" value={tokens.accessToken} />
              </motion.div>
            ) : (
              <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[32px] p-20 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
                  <Key className="text-slate-200" size={40} />
                </div>
                <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">
                  Credentials Standby
                </h4>
                <p className="text-slate-300 text-[11px] mt-4 max-w-[280px] font-bold leading-relaxed">
                  Tokens will appear here once generated. Refresh functionality
                  will become available inline for testing.
                </p>
              </div>
            )}
          </AnimatePresence>

          <div className="p-8 bg-orange-50 border border-orange-100 rounded-[32px] flex gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm font-black text-tax-orange italic text-xl border border-orange-100">
              !
            </div>
            <div>
              <h5 className="text-[11px] font-black text-orange-900 uppercase tracking-widest mb-1.5">
                Security Guidelines
              </h5>
              <p className="text-[10px] text-orange-700 leading-relaxed font-bold">
                Access follow the{" "}
                <span className="font-black underline">{selectedScope}</span>{" "}
                scope rule. Tokens are valid for 60 minutes for the{" "}
                <span className="font-black italic">
                  {selectedCategories.join(", ")}
                </span>{" "}
                categories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenDisplay({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
          {label}
        </label>
        {copied && (
          <span className="text-green-500 text-[9px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
            Copied!
          </span>
        )}
      </div>
      <div className="relative group">
        <div className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs font-bold text-slate-800 break-all shadow-inner leading-relaxed">
          {value}
        </div>
        <button
          onClick={handleCopy}
          type="button"
          title={`Copy ${label}`}
          aria-label={`Copy ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-tax-orange transition-all bg-white rounded-lg shadow-sm border border-slate-100 hover:scale-105 active:scale-95"
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
