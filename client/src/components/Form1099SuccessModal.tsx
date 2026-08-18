import { CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Form1099SuccessModalProps {
  message: string | null;
  onClose: () => void;
}

export default function Form1099SuccessModal({
  message,
  onClose,
}: Form1099SuccessModalProps) {
  return (
    <AnimatePresence>
      {message && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed inset-0 z-[111] flex items-center justify-center p-5"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden">
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Success</h3>
                    <p className="text-xs text-slate-500 mt-1">{message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  aria-label="Close"
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 py-4 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
