import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Printer, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  form1099UtilityService,
  type Form1099W2ListRecords,
  type Form1099W2PdfUrlsRecords,
  type PdfFiles,
  type RequestPdfUrlsResponse,
} from "../services/form1099UtilityService";

interface Form1099PdfUrlsModalProps {
  record: Form1099W2ListRecords | null;
  onClose: () => void;
  onError?: (
    errors: { Id?: string; Name?: string; Message?: string }[],
  ) => void;
}

const COPY_LABELS: { key: keyof Form1099W2PdfUrlsRecords; label: string }[] = [
  { key: "CopyB", label: "Copy B" },
  { key: "CopyC", label: "Copy C" },
  { key: "CopyD", label: "Copy D" },
  { key: "Copy1", label: "Copy 1" },
  { key: "Copy2", label: "Copy 2" },
  { key: "Copy4Up", label: "Copy 4-Up" },
];

function getPdfUrlsPayload(
  result: RequestPdfUrlsResponse | { Response: RequestPdfUrlsResponse },
): RequestPdfUrlsResponse {
  return "Response" in result ? result.Response : result;
}

export default function Form1099PdfUrlsModal({
  record,
  onClose,
  onError,
}: Form1099PdfUrlsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<Form1099W2PdfUrlsRecords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCopy, setActiveCopy] = useState<string | null>(null);

  useEffect(() => {
    if (!record) {
      setRecords(null);
      setError(null);
      setActiveCopy(null);
      return;
    }

    setIsLoading(true);
    setRecords(null);
    setError(null);
    setActiveCopy(null);

    form1099UtilityService
      .requestPdfUrls({
        submissionId: record.SubmissionId,
        recordId: record.RecordId,
      })
      .then((result) => {
        const data = getPdfUrlsPayload(result);
        const formRecords = data.Form1099Records;
        if (
          formRecords &&
          (formRecords.CopyB ||
            formRecords.CopyC ||
            formRecords.Copy1 ||
            formRecords.Copy2 ||
            formRecords.CopyD ||
            formRecords.Copy4Up)
        ) {
          setRecords(formRecords);
          const firstAvailable = COPY_LABELS.find(
            ({ key }) => formRecords[key],
          );
          setActiveCopy(firstAvailable?.key ?? null);
        } else {
          const errors = [
            ...(data.Errors || []),
            ...(formRecords?.ErrorRecords || []).flatMap((r) => r.Errors || []),
          ];
          if (onError && errors.length > 0) {
            onError(errors);
            onClose();
          } else {
            setError(errors[0]?.Message || "PDF URLs were not returned.");
          }
        }
      })
      .catch((err) => {
        const body = err.response?.data;
        const payload = body?.Response ?? body;
        const errors = [
          ...(payload?.Errors || []),
          ...(payload?.Form1099Records?.ErrorRecords || []).flatMap(
            (r: any) => r.Errors || [],
          ),
        ];
        if (onError && errors.length > 0) {
          onError(errors);
          onClose();
        } else {
          setError(
            errors[0]?.Message || err.message || "Failed to load PDF URLs.",
          );
        }
      })
      .finally(() => setIsLoading(false));
  }, [record]);

  const availableCopies = useMemo(
    () => COPY_LABELS.filter(({ key }) => records?.[key]),
    [records],
  );

  const activeFiles: PdfFiles | undefined = activeCopy
    ? (records?.[activeCopy as keyof Form1099W2PdfUrlsRecords] as
        | PdfFiles
        | undefined)
    : undefined;

  const rawUrl = activeFiles?.Unmasked || activeFiles?.Masked;
  const viewUrl = rawUrl
    ? form1099UtilityService.getDraftPdfFileUrl(rawUrl)
    : null;

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
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <ExternalLink size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      Form 1099 PDF URLs
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

              {availableCopies.length > 0 && (
                <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 shrink-0">
                  {availableCopies.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveCopy(key)}
                      className={`px-3 py-2 text-xs font-black rounded-t-lg border-b-2 transition-colors ${
                        activeCopy === key
                          ? "border-tax-orange text-tax-orange"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 min-h-0 bg-slate-100 p-5">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-tax-orange animate-spin" />
                    <p className="text-xs font-bold text-slate-400">
                      Requesting PDF URLs...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
                    {error}
                  </div>
                ) : viewUrl ? (
                  <iframe
                    title={`PDF ${activeCopy} for ${record.RecordId}`}
                    src={viewUrl}
                    className="w-full h-full bg-white rounded-xl border border-slate-200"
                  />
                ) : null}
              </div>

              <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                {viewUrl && (
                  <a
                    href={viewUrl}
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
