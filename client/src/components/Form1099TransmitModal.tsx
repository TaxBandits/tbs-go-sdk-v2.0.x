import { useEffect, useState } from "react";
import { Send, X, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  form1099UtilityService,
  type Form1099UtilityListRecords,
  type TransmitRecord,
  type TransmitResponse,
} from "../services/form1099UtilityService";

interface Form1099TransmitModalProps {
  record: Form1099UtilityListRecords | null;
  onClose: () => void;
}

function getTransmitPayload(
  result: TransmitResponse | { Response: TransmitResponse },
): TransmitResponse {
  return "Response" in result ? result.Response : result;
}

function codeClasses(code?: string): string {
  const c = (code || "").toUpperCase();
  if (c === "SUCCESS" || c === "200" || c === "OK") {
    return "bg-green-50 text-green-700 border-green-100";
  }
  if (!c) return "bg-slate-50 text-slate-400 border-slate-100";
  return "bg-red-50 text-red-700 border-red-100";
}

function StatusRow({
  label,
  code,
  name,
  message,
}: {
  label: string;
  code?: string;
  name?: string;
  message?: string | null;
}) {
  if (!code && !name && !message) return null;
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wide">
          {label}
        </span>
        {code && (
          <span
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wide ${codeClasses(code)}`}
          >
            {code}
          </span>
        )}
      </div>
      {name && <p className="text-xs font-bold text-slate-700">{name}</p>}
      {message && (
        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
          {message}
        </p>
      )}
    </div>
  );
}

function TransmitRecordCard({ record }: { record: TransmitRecord }) {
  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-slate-700">
          {record.FormType || "Record"} — {record.RecordId}
        </p>
      </div>

      <StatusRow
        label="Federal Status"
        code={record.FederalStatus?.Code}
        name={record.FederalStatus?.Name}
        message={record.FederalStatus?.Message}
      />

      {(record.StatesStatus || []).map((s, idx) => (
        <StatusRow
          key={`${s.StateCd}-${idx}`}
          label={`State Status${s.StateCd ? ` (${s.StateCd})` : ""}`}
          code={s.Code}
          name={s.Name}
          message={s.Message}
        />
      ))}

      {record.Distribution && (
        <>
          <StatusRow
            label="Postal Status"
            code={record.Distribution.PostalStatus?.Code}
            name={record.Distribution.PostalStatus?.Name}
            message={record.Distribution.PostalStatus?.Message}
          />
          <StatusRow
            label="Online Access Status"
            code={record.Distribution.OnlineAccessStatus?.Code}
            name={record.Distribution.OnlineAccessStatus?.Name}
            message={record.Distribution.OnlineAccessStatus?.Message}
          />
        </>
      )}

      {(record.Errors || []).length > 0 && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
          {record.Errors!.map((e, idx) => (
            <p key={idx} className="text-xs font-semibold text-red-600">
              {e.Name ? `${e.Name}: ` : ""}
              {e.Message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Form1099TransmitModal({
  record,
  onClose,
}: Form1099TransmitModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<TransmitRecord[]>([]);
  const [topErrors, setTopErrors] = useState<
    { Id?: string; Name?: string; Message?: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!record) {
      setRecords([]);
      setTopErrors([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setRecords([]);
    setTopErrors([]);
    setError(null);

    form1099UtilityService
      .transmit({
        submissionId: record.SubmissionId,
        recordIds: [record.RecordId],
      })
      .then((result) => {
        const data = getTransmitPayload(result);
        const combined = [
          ...(data.Form1099Records || []),
          ...(data.FormW2Records || []),
        ];
        setRecords(combined);
        setTopErrors(data.Errors || []);
        if (
          combined.length === 0 &&
          (!data.Errors || data.Errors.length === 0)
        ) {
          setError("No transmit response returned for this record.");
        }
      })
      .catch((err) => {
        const body = err.response?.data;
        const payload = body?.Response ?? body;
        const apiErrors: { Id?: string; Name?: string; Message?: string }[] =
          payload?.Errors || [];
        if (apiErrors.length > 0) {
          setTopErrors(apiErrors);
        } else {
          setError(err.message || "Failed to transmit record.");
        }
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col border border-slate-200">
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                    <Send size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">
                      Transmit Result
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

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 bg-slate-50">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Loader2 className="w-8 h-8 text-tax-orange animate-spin" />
                    <p className="text-xs font-bold text-slate-400">
                      Transmitting...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <p className="text-xs font-bold text-red-600">{error}</p>
                  </div>
                ) : (
                  <>
                    {topErrors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-1">
                        {topErrors.map((e, idx) => (
                          <p
                            key={idx}
                            className="text-xs font-semibold text-red-600"
                          >
                            {e.Name ? `${e.Name}: ` : ""}
                            {e.Message}
                          </p>
                        ))}
                      </div>
                    )}
                    {records.map((r, idx) => (
                      <TransmitRecordCard
                        key={`${r.RecordId}-${idx}`}
                        record={r}
                      />
                    ))}
                  </>
                )}
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
