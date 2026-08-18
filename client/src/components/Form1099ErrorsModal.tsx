import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface Form1099ErrorItem {
  Id?: string;
  Name?: string;
  Message?: string;
}

interface Form1099ErrorsModalProps {
  errors: Form1099ErrorItem[] | null;
  onClose: () => void;
}

export default function Form1099ErrorsModal({
  errors,
  onClose,
}: Form1099ErrorsModalProps) {
  return (
    <AnimatePresence>
      {errors && errors.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed inset-0 z-[111] flex items-center justify-center p-5"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-200 overflow-hidden">
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Validation Errors</h3>
                    <p className="text-xs text-slate-400">
                      {errors.length} error{errors.length > 1 ? "s" : ""} returned by the API
                    </p>
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

              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 font-black uppercase text-[10px] tracking-wide text-slate-500 w-32">
                        Id
                      </th>
                      <th className="px-5 py-3 font-black uppercase text-[10px] tracking-wide text-slate-500 w-48">
                        Name
                      </th>
                      <th className="px-5 py-3 font-black uppercase text-[10px] tracking-wide text-slate-500">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((err, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-5 py-3 font-bold text-slate-500 align-top">{err.Id || "-"}</td>
                        <td className="px-5 py-3 font-bold text-slate-700 align-top">{err.Name || "-"}</td>
                        <td className="px-5 py-3 text-red-600 font-semibold align-top">{err.Message || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
