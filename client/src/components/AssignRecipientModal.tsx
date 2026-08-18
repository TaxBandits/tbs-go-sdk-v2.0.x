import { useEffect, useState } from "react";
import { Building2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { payerService } from "../services/payerService";
import { BusinessListEntry } from "../types";

interface AssignRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientNm: string;
  onAssign: (params: {
    businessId: string;
    payerRef: string;
    sequenceId: string;
    payeeRef: string;
  }) => Promise<void>;
}

export default function AssignRecipientModal({
  isOpen,
  onClose,
  recipientId,
  recipientNm,
  onAssign,
}: AssignRecipientModalProps) {
  const [businesses, setBusinesses] = useState<BusinessListEntry[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [sequenceId, setSequenceId] = useState("1");
  const [payeeRef, setPayeeRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedBusinessId("");
    setSequenceId("1");
    setPayeeRef("");

    const fetchBusinesses = async () => {
      setIsLoadingBusinesses(true);
      try {
        const response = await payerService.getBusinesses({
          page: 1,
          pagesize: 100,
        });
        setBusinesses(response.Response.Businesses || []);
      } catch (error) {
        console.error("Failed to fetch businesses:", error);
        setBusinesses([]);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    fetchBusinesses();
  }, [isOpen]);

  const selectedBusiness = businesses.find(
    (b) => b.BusinessId === selectedBusinessId,
  );

  const handleConfirm = async () => {
    if (!selectedBusiness) return;
    setIsSubmitting(true);
    try {
      await onAssign({
        businessId: selectedBusiness.BusinessId,
        payerRef: selectedBusiness.PayerRef,
        sequenceId,
        payeeRef,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-tax-deep-blue/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
          >
            <div className="p-8 pb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Building2 size={22} className="text-tax-deep-blue" />
                  Assign Recipient to Business
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  aria-label="Close"
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect <span className="font-bold">{recipientNm}</span> to a
                payer entity. This maps correct IRS references and sequence
                trackers.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Target Business (Payer)
                  </label>
                  <select
                    title="Target Business"
                    aria-label="Target Business"
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    disabled={isLoadingBusinesses}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-deep-blue focus:ring-2 focus:ring-blue-50 transition-all disabled:opacity-50"
                  >
                    <option value="">
                      {isLoadingBusinesses ? "Loading..." : "Select a business"}
                    </option>
                    {businesses.map((b) => (
                      <option key={b.BusinessId} value={b.BusinessId}>
                        {b.BusinessNm} (••••{b.TINDetails?.Last4Digit}) - Ref:{" "}
                        {b.PayerRef}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Sequence ID
                    </label>
                    <input
                      title="Sequence ID"
                      aria-label="Sequence ID"
                      placeholder="1"
                      value={sequenceId}
                      onChange={(e) => setSequenceId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-tax-deep-blue focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      Unique sequence num
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Payee Ref
                    </label>
                    <input
                      title="Payee Ref"
                      aria-label="Payee Ref"
                      placeholder="e.g. DXAVI151"
                      value={payeeRef}
                      onChange={(e) => setPayeeRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-tax-deep-blue focus:ring-2 focus:ring-blue-50 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      Unique payee reference
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 pt-4 flex gap-3">
              <button
                onClick={onClose}
                type="button"
                className="flex-1 py-3.5 px-6 bg-slate-50 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirm}
                type="button"
                disabled={!selectedBusinessId || isSubmitting}
                className="flex-1 py-3.5 px-6 bg-tax-deep-blue text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "ASSIGNING..." : "CONFIRM & ASSIGN"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
