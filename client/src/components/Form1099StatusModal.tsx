import { useEffect, useState } from "react";
import { Info, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  form1099UtilityService,
  type Form1099UtilityListRecords,
  type Form1099UtilityStatusRecord,
  type StatusResponse,
} from "../services/form1099UtilityService";

interface Form1099StatusModalProps {
  record: Form1099UtilityListRecords | null;
  onClose: () => void;
}

function getStatusPayload(
  result: StatusResponse | { Response: StatusResponse },
): StatusResponse {
  return "Response" in result ? result.Response : result;
}

function dotColor(status?: string): string {
  const s = (status || "").toUpperCase();
  if (["TRANSMITTED", "MAILED", "ACCEPTED", "VIEWED", "SENT"].includes(s)) {
    return "bg-green-500";
  }
  if (["SCHEDULED", "REQUESTED"].includes(s)) return "bg-blue-500";
  if (s === "REJECTED") return "bg-red-500";
  return "bg-amber-500";
}

function pillClasses(status?: string): string {
  const s = (status || "").toUpperCase();
  if (["TRANSMITTED", "MAILED", "ACCEPTED", "VIEWED", "SENT"].includes(s)) {
    return "bg-green-50 text-green-700";
  }
  if (["SCHEDULED", "REQUESTED"].includes(s)) return "bg-blue-50 text-blue-700";
  if (s === "REJECTED") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

function StatusSection({
  label,
  status,
  description,
}: {
  label: string;
  status?: string;
  description?: string;
}) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-500 tracking-wide">
          <span className={`w-2 h-2 rounded-full ${dotColor(status)}`} />
          {label}
        </span>
        {status && (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${pillClasses(status)}`}
          >
            {status}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function DistributionTile({
  label,
  status,
  description,
}: {
  label: string;
  status?: string;
  description?: string;
}) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">
        {label}
      </p>
      {status ? (
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-2 h-2 rounded-full ${dotColor(status)}`} />
          <span className="text-sm font-black text-slate-800 uppercase">
            {status}
          </span>
        </div>
      ) : (
        <p className="text-sm font-black text-slate-300">-</p>
      )}
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export default function Form1099StatusModal({
  record,
  onClose,
}: Form1099StatusModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusRecord, setStatusRecord] =
    useState<Form1099UtilityStatusRecord | null>(null);

  useEffect(() => {
    if (!record) {
      setStatusRecord(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    form1099UtilityService
      .status({
        submissionId: record.SubmissionId,
        recordIds: record.RecordId,
      })
      .then((res) => {
        const data = getStatusPayload(res);
        const combined = [
          ...(data.Form1099Records || []),
          ...(data.FormW2Records || []),
        ];
        const found =
          combined.find(
            (r) =>
              r.RecordId?.trim().toLowerCase() ===
              record.RecordId?.trim().toLowerCase(),
          ) ||
          // A status request is for one RecordId. Use its only returned item
          // even if the upstream service changes the RecordId's casing.
          (combined.length === 1 ? combined[0] : null);
        setStatusRecord(found);
        if (!found) {
          setError(
            data.Errors?.[0]?.Message || "No status found for this record.",
          );
        }
      })
      .catch((err) => {
        const errorBody = err.response?.data;
        const apiError =
          errorBody?.Response?.Errors?.[0] || errorBody?.Errors?.[0];
        setError(apiError?.Message || err.message || "Failed to load status.");
      })
      .finally(() => setIsLoading(false));
  }, [record]);

  return (
    <AnimatePresence>
      {record && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col border border-slate-200">
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                    <Info size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">
                      Filing & Delivery Status
                    </h3>
                    <p className="text-xs text-slate-400">
                      Record: {record.RecordId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close"
                  aria-label="Close"
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 bg-slate-50">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Loader2 className="w-8 h-8 text-tax-orange animate-spin" />
                    <p className="text-xs font-bold text-slate-400">
                      Loading status...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-bold text-red-600">{error}</p>
                  </div>
                ) : statusRecord ? (
                  <>
                    <StatusSection
                      label="Federal Status"
                      status={statusRecord.FederalStatus?.Status}
                      description={
                        statusRecord.FederalStatus?.Status === "CREATED"
                          ? "Created locally. Ready to transmit. No federal transmission has occurred yet."
                          : undefined
                      }
                    />

                    {(statusRecord.StatesStatus || []).map((s, idx) => (
                      <StatusSection
                        key={`${s.StateCd}-${idx}`}
                        label={`State Status${s.StateCd ? ` (${s.StateCd})` : ""}`}
                        status={s.Status}
                        description={s.Info}
                      />
                    ))}

                    <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl space-y-3">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Recipient Distribution
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <DistributionTile
                          label="Online Access"
                          status={
                            statusRecord.Distribution?.OnlineAccessStatus
                              ?.Status
                          }
                          description={
                            statusRecord.Distribution?.OnlineAccessStatus
                              ?.Status === "VIEWED"
                              ? "Recipient has opened & viewed."
                              : undefined
                          }
                        />
                        <DistributionTile
                          label="Postal Mailing"
                          status={
                            statusRecord.Distribution?.PostalStatus?.Status
                          }
                          description={
                            statusRecord.Distribution?.PostalStatus?.Info
                          }
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="px-5 py-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
