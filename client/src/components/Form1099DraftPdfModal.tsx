import { useEffect, useState } from "react";
import { FileText, Loader2, Printer, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  form1099UtilityService,
  type Form1099UtilityListRecords,
  type RequestDraftPdfUrlResponse,
} from "../services/form1099UtilityService";

interface Form1099DraftPdfModalProps {
  record: Form1099UtilityListRecords | null;
  onClose: () => void;
}

function getDraftPdfPayload(
  result: RequestDraftPdfUrlResponse | { Response: RequestDraftPdfUrlResponse },
): RequestDraftPdfUrlResponse {
  return "Response" in result ? result.Response : result;
}

export default function Form1099DraftPdfModal({
  record,
  onClose,
}: Form1099DraftPdfModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!record) {
      setPdfUrl(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setPdfUrl(null);
    setError(null);

    form1099UtilityService
      .requestDraftPdfUrl(record.RecordId)
      .then((result) => {
        const data = getDraftPdfPayload(result);
        if (data.DraftPdfUrl) {
          setPdfUrl(
            form1099UtilityService.getDraftPdfFileUrl(data.DraftPdfUrl),
          );
        } else {
          setError(data.Error?.Message || "Draft PDF URL was not returned.");
        }
      })
      .catch((err) => {
        const body = err.response?.data;
        const apiError = body?.Response?.Error || body?.Error;
        setError(
          apiError?.Message || err.message || "Failed to load draft PDF.",
        );
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-5"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col border border-slate-200 overflow-hidden">
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      Form 1099 Draft PDF
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
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 min-h-0 bg-slate-100 p-5">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-tax-orange animate-spin" />
                    <p className="text-xs font-bold text-slate-400">
                      Generating draft PDF...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
                    {error}
                  </div>
                ) : pdfUrl ? (
                  <iframe
                    title={`Draft PDF for ${record.RecordId}`}
                    src={pdfUrl}
                    className="w-full h-full bg-white rounded-xl border border-slate-200"
                  />
                ) : null}
              </div>

              <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-200"
                  >
                    <Printer size={15} /> Open / Print
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
