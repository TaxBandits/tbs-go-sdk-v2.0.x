import { useEffect, useState } from "react";
import { ListTree, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  form1099UtilityService,
  type Form1099UtilityListRecords,
  type StatusLogResponse,
} from "../services/form1099UtilityService";

interface Form1099StatusLogModalProps {
  record: Form1099UtilityListRecords | null;
  onClose: () => void;
}

function getStatusLogPayload(
  result: StatusLogResponse | { Response: StatusLogResponse },
): StatusLogResponse {
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

function LogTable({
  title,
  rows,
  extraColumn,
}: {
  title: string;
  rows: {
    label?: string;
    Code?: string;
    Status?: string;
    Message?: string;
    StatusTs?: string;
  }[];
  extraColumn?: string;
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-4 py-2.5 border-b border-slate-100">
        {title}
      </p>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50">
          <tr>
            {extraColumn && (
              <th className="px-4 py-2 font-black uppercase text-[10px] tracking-wide text-slate-500">
                {extraColumn}
              </th>
            )}
            <th className="px-4 py-2 font-black uppercase text-[10px] tracking-wide text-slate-500">
              Code
            </th>
            <th className="px-4 py-2 font-black uppercase text-[10px] tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-4 py-2 font-black uppercase text-[10px] tracking-wide text-slate-500">
              Message
            </th>
            <th className="px-4 py-2 font-black uppercase text-[10px] tracking-wide text-slate-500">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-slate-100">
              {extraColumn && (
                <td className="px-4 py-2.5 font-bold text-slate-600 align-top">
                  {r.label || "-"}
                </td>
              )}
              <td className="px-4 py-2.5 text-slate-500 align-top whitespace-nowrap">
                {r.Code || "-"}
              </td>
              <td className="px-4 py-2.5 align-top">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${dotColor(r.Status)}`}
                  />
                  <span className="font-black text-slate-700 uppercase">
                    {r.Status || "-"}
                  </span>
                </span>
              </td>
              <td className="px-4 py-2.5 text-slate-500 align-top">
                {r.Message || "-"}
              </td>
              <td className="px-4 py-2.5 text-slate-400 align-top whitespace-nowrap">
                {r.StatusTs || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Form1099StatusLogModal({
  record,
  onClose,
}: Form1099StatusLogModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<StatusLogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!record) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setData(null);
    setError(null);

    form1099UtilityService
      .statusLog({ recordId: record.RecordId })
      .then((result) => {
        const payload = getStatusLogPayload(result);
        setData(payload);
        if (payload.Errors && payload.Errors.length > 0) {
          setError(payload.Errors[0]?.Message || "Failed to load status log.");
        }
      })
      .catch((err) => {
        const body = err.response?.data;
        const apiError = body?.Response?.Errors?.[0] || body?.Errors?.[0];
        setError(
          apiError?.Message || err.message || "Failed to load status log.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [record]);

  const hasAnyLog =
    (data?.FederalStatusLog?.length || 0) > 0 ||
    (data?.StateStatusLog?.length || 0) > 0 ||
    (data?.OnlineAccessStatusLog?.length || 0) > 0 ||
    (data?.PostalStatusLog?.length || 0) > 0;

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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border border-slate-200">
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <ListTree size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">
                      Status Log
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
                      Loading status log...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-bold text-red-600">{error}</p>
                  </div>
                ) : hasAnyLog ? (
                  <>
                    <LogTable
                      title="Federal Status Log"
                      rows={data?.FederalStatusLog || []}
                    />
                    <LogTable
                      title="State Status Log"
                      rows={(data?.StateStatusLog || []).map((s) => ({
                        ...s,
                        label: s.StateCd,
                      }))}
                      extraColumn="State"
                    />
                    <LogTable
                      title="Online Access Status Log"
                      rows={(data?.OnlineAccessStatusLog || []).map((s) => ({
                        ...s,
                        label: s.Email,
                      }))}
                      extraColumn="Email"
                    />
                    <LogTable
                      title="Postal Status Log"
                      rows={(data?.PostalStatusLog || []).map((s) => ({
                        ...s,
                        label: s.PostalType,
                      }))}
                      extraColumn="Postal Type"
                    />
                  </>
                ) : (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-400 text-center">
                    No status log entries found for this record.
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-colors"
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
