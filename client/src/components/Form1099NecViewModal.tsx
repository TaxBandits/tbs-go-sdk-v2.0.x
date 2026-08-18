import { useEffect, useState } from "react";
import { Eye, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  form1099NecService,
  type Form1099NecRecord,
  type GetForm1099NecResponse,
} from "../services/form1099NecService";
import {
  form1099MiscService,
  type Form1099MiscRecord,
  type GetForm1099MiscResponse,
} from "../services/form1099MiscService";
import type { Form1099UtilityListRecords } from "../services/form1099UtilityService";

interface Form1099NecViewModalProps {
  record: Form1099UtilityListRecords | null;
  onClose: () => void;
}

function getGetPayload(
  result: GetForm1099NecResponse | { Response: GetForm1099NecResponse },
): GetForm1099NecResponse {
  return "Response" in result ? result.Response : result;
}

function getMiscGetPayload(
  result: GetForm1099MiscResponse | { Response: GetForm1099MiscResponse },
): GetForm1099MiscResponse {
  return "Response" in result ? result.Response : result;
}

function fmtMoney(value?: number | null): string {
  if (value === undefined || value === null) return "-";
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtBool(value?: boolean): string {
  return value ? "Yes" : "No";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-700 mt-0.5">
        {value === undefined || value === null || value === "" ? "-" : value}
      </p>
    </div>
  );
}

function RecordDetails({ record }: { record: Form1099NecRecord }) {
  const business = record.ReturnHeader?.Business;
  const submission = record.SubmissionManifest;

  return (
    <div className="space-y-4">
      <Section title="Submission Manifest">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Tax Year" value={submission?.TaxYear} />
          <Field
            label="Schedule Filing"
            value={fmtBool(submission?.IsScheduleFiling)}
          />
          <Field
            label="E-file Date"
            value={submission?.ScheduleFiling?.EfileDate}
          />
        </div>
      </Section>

      {business && (
        <Section title="Payer (Business)">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Business Name" value={business.BusinessNm} />
            <Field label="Payer Ref" value={business.PayerRef} />
            <Field label="TIN Type" value={business.TINDetails?.TINType} />
            <Field label="TIN Last 4" value={business.TINDetails?.Last4Digit} />
            <Field
              label="Address"
              value={[
                business.Address?.Address1,
                business.Address?.City,
                business.Address?.ProvinceOrState,
                business.Address?.ZipCd,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          </div>
        </Section>
      )}

      {(record.ReturnData || []).map((rd, idx) => (
        <div key={`${rd.RecordId}-${idx}`} className="space-y-4">
          <Section title={`Return Data — Sequence ${rd.SequenceId ?? idx + 1}`}>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Record ID" value={rd.RecordId} />
              <Field label="Sequence ID" value={rd.SequenceId} />
            </div>
          </Section>

          {rd.Recipient && (
            <Section title="Recipient (Payee)">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Recipient Name" value={rd.Recipient.BusinessNm} />
                <Field label="Payee Ref" value={rd.Recipient.PayeeRef} />
                <Field
                  label="TIN Type"
                  value={rd.Recipient.TINDetails?.TINType}
                />
                <Field
                  label="Address"
                  value={[
                    rd.Recipient.Address?.Address1,
                    rd.Recipient.Address?.City,
                    rd.Recipient.Address?.ProvinceOrState,
                    rd.Recipient.Address?.ZipCd,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </div>
            </Section>
          )}

          {rd.ReturnManifest && (
            <Section title="Return Manifest">
              <div className="grid grid-cols-3 gap-4">
                <Field
                  label="Is Federal"
                  value={fmtBool(rd.ReturnManifest.IsFederal)}
                />
                <Field
                  label="Is State"
                  value={fmtBool(rd.ReturnManifest.IsState)}
                />
                <Field
                  label="Is Postal"
                  value={fmtBool(rd.ReturnManifest.IsPostal)}
                />
                <Field
                  label="Is Distribution"
                  value={fmtBool(rd.ReturnManifest.IsDistribution)}
                />
                <Field
                  label="Is Forced"
                  value={fmtBool(rd.ReturnManifest.IsForced)}
                />
                <Field
                  label="Distribution Type"
                  value={
                    rd.ReturnManifest.DistributionDetails?.DistributionType
                  }
                />
                <Field
                  label="Postal Type"
                  value={rd.ReturnManifest.DistributionDetails?.PostalType}
                />
              </div>
            </Section>
          )}

          {rd.NECFormData && (
            <Section title="NEC Box Values">
              <div className="grid grid-cols-3 gap-4">
                <Field
                  label="Box 1: NEC"
                  value={fmtMoney(rd.NECFormData.NEC)}
                />
                <Field
                  label="Cash Tips"
                  value={fmtMoney(rd.NECFormData.CashTips)}
                />
                <Field label="TTOC1" value={rd.NECFormData.TTOC1} />
                <Field label="TTOC2" value={rd.NECFormData.TTOC2} />
                <Field
                  label="Overtime Comp"
                  value={fmtMoney(rd.NECFormData.OvertimeComp)}
                />
                <Field label="EPP" value={fmtMoney(rd.NECFormData.EPP)} />
                <Field
                  label="Fed Tax WH"
                  value={fmtMoney(rd.NECFormData.FedTaxWH)}
                />
                <Field
                  label="Account Number"
                  value={rd.NECFormData.AccountNum}
                />
                <Field
                  label="Direct Sales"
                  value={fmtBool(rd.NECFormData.IsDirectSales)}
                />
                <Field
                  label="2nd TIN Notice"
                  value={fmtBool(rd.NECFormData.Is2ndTINnot)}
                />
              </div>

              {(rd.NECFormData.States || []).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-2">
                    State Filing Details
                  </p>
                  <div className="space-y-2">
                    {rd.NECFormData.States!.map((s, sIdx) => (
                      <div
                        key={`${s.StateCd}-${sIdx}`}
                        className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3"
                      >
                        <Field label="State" value={s.StateCd} />
                        <Field label="State ID" value={s.StateIdNum} />
                        <Field
                          label="State Income"
                          value={fmtMoney(s.StateIncome)}
                        />
                        <Field label="State WH" value={fmtMoney(s.StateWH)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}
        </div>
      ))}
    </div>
  );
}

function MiscRecordDetails({ record }: { record: Form1099MiscRecord }) {
  const business = record.ReturnHeader?.Business;
  const submission = record.SubmissionManifest;

  return (
    <div className="space-y-4">
      <Section title="Submission Manifest">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Tax Year" value={submission?.TaxYear} />
          <Field
            label="Schedule Filing"
            value={fmtBool(submission?.IsScheduleFiling)}
          />
          <Field
            label="E-file Date"
            value={submission?.ScheduleFiling?.EfileDate}
          />
        </div>
      </Section>

      {business && (
        <Section title="Payer (Business)">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Business Name" value={business.BusinessNm} />
            <Field label="Payer Ref" value={business.PayerRef} />
            <Field label="TIN Type" value={business.TINDetails?.TINType} />
            <Field label="TIN Last 4" value={business.TINDetails?.Last4Digit} />
            <Field
              label="Address"
              value={[
                business.Address?.Address1,
                business.Address?.City,
                business.Address?.ProvinceOrState,
                business.Address?.ZipCd,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          </div>
        </Section>
      )}

      {(record.ReturnData || []).map((rd, idx) => (
        <div key={`${rd.RecordId}-${idx}`} className="space-y-4">
          <Section title={`Return Data — Sequence ${rd.SequenceId ?? idx + 1}`}>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Record ID" value={rd.RecordId} />
              <Field label="Sequence ID" value={rd.SequenceId} />
            </div>
          </Section>

          {rd.Recipient && (
            <Section title="Recipient (Payee)">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Recipient Name" value={rd.Recipient.BusinessNm} />
                <Field label="Payee Ref" value={rd.Recipient.PayeeRef} />
                <Field
                  label="TIN Type"
                  value={rd.Recipient.TINDetails?.TINType}
                />
                <Field
                  label="Address"
                  value={[
                    rd.Recipient.Address?.Address1,
                    rd.Recipient.Address?.City,
                    rd.Recipient.Address?.ProvinceOrState,
                    rd.Recipient.Address?.ZipCd,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </div>
            </Section>
          )}

          {rd.ReturnManifest && (
            <Section title="Return Manifest">
              <div className="grid grid-cols-3 gap-4">
                <Field
                  label="Is Federal"
                  value={fmtBool(rd.ReturnManifest.IsFederal)}
                />
                <Field
                  label="Is State"
                  value={fmtBool(rd.ReturnManifest.IsState)}
                />
                <Field
                  label="Is Postal"
                  value={fmtBool(rd.ReturnManifest.IsPostal)}
                />
                <Field
                  label="Is Distribution"
                  value={fmtBool(rd.ReturnManifest.IsDistribution)}
                />
                <Field
                  label="Is Forced"
                  value={fmtBool(rd.ReturnManifest.IsForced)}
                />
                <Field
                  label="Distribution Type"
                  value={
                    rd.ReturnManifest.DistributionDetails?.DistributionType
                  }
                />
                <Field
                  label="Postal Type"
                  value={rd.ReturnManifest.DistributionDetails?.PostalType}
                />
              </div>
            </Section>
          )}

          {rd.MISCFormData && (
            <Section title="MISC Box Values">
              <div className="grid grid-cols-3 gap-4">
                <Field
                  label="Box 1: Rents"
                  value={fmtMoney(rd.MISCFormData.Rents)}
                />
                <Field
                  label="Box 2: Royalties"
                  value={fmtMoney(rd.MISCFormData.Royalties)}
                />
                <Field
                  label="Box 3: Other Income"
                  value={fmtMoney(rd.MISCFormData.OtherIncome)}
                />
                <Field
                  label="Box 4: Fed Tax WH"
                  value={fmtMoney(rd.MISCFormData.FedIncomeTaxWH)}
                />
                <Field
                  label="Fishing Boat Proceeds"
                  value={fmtMoney(rd.MISCFormData.FishingBoatProceeds)}
                />
                <Field
                  label="Medical Healthcare"
                  value={fmtMoney(rd.MISCFormData.MedHealthcarePymts)}
                />
                <Field
                  label="Substitute Pmts"
                  value={fmtMoney(rd.MISCFormData.SubstitutePymts)}
                />
                <Field
                  label="Crop Insurance"
                  value={fmtMoney(rd.MISCFormData.CropInsurance)}
                />
                <Field
                  label="Gross Proceeds"
                  value={fmtMoney(rd.MISCFormData.GrossProceeds)}
                />
                <Field
                  label="Fish Purchase Resale"
                  value={fmtMoney(rd.MISCFormData.FishPurForResale)}
                />
                <Field
                  label="Sec 409A Deferrals"
                  value={fmtMoney(rd.MISCFormData.Sec409ADeferrals)}
                />
                <Field
                  label="Cash Tips"
                  value={fmtMoney(rd.MISCFormData.CashTips)}
                />
                <Field label="TTOC1" value={rd.MISCFormData.TTOC1} />
                <Field label="TTOC2" value={rd.MISCFormData.TTOC2} />
                <Field
                  label="Overtime Comp"
                  value={fmtMoney(rd.MISCFormData.OvertimeComp)}
                />
                <Field label="EPP" value={fmtMoney(rd.MISCFormData.EPP)} />
                <Field
                  label="Non-Qual Def Comp"
                  value={fmtMoney(rd.MISCFormData.NonQualDefComp)}
                />
                <Field
                  label="Account Number"
                  value={rd.MISCFormData.AccountNum}
                />
                <Field
                  label="Direct Sale"
                  value={fmtBool(rd.MISCFormData.IsDirectSale)}
                />
                <Field
                  label="FATCA Compliant"
                  value={fmtBool(rd.MISCFormData.IsFATCA)}
                />
                <Field
                  label="2nd TIN Notice"
                  value={fmtBool(rd.MISCFormData.Is2ndTINnot)}
                />
              </div>

              {(rd.MISCFormData.States || []).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-2">
                    State Filing Details
                  </p>
                  <div className="space-y-2">
                    {rd.MISCFormData.States!.map((s, sIdx) => (
                      <div
                        key={`${s.StateCd}-${sIdx}`}
                        className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-3"
                      >
                        <Field label="State" value={s.StateCd} />
                        <Field label="State ID" value={s.StateIdNum} />
                        <Field
                          label="State Income"
                          value={fmtMoney(s.StateIncome)}
                        />
                        <Field label="State WH" value={fmtMoney(s.StateWH)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Form1099NecViewModal({
  record,
  onClose,
}: Form1099NecViewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<Form1099NecRecord[]>([]);
  const [miscRecords, setMiscRecords] = useState<Form1099MiscRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isMisc = (record?.FormType || "").toUpperCase().includes("MISC");

  useEffect(() => {
    if (!record) {
      setRecords([]);
      setMiscRecords([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setRecords([]);
    setMiscRecords([]);
    setError(null);

    const recordIsMisc = (record.FormType || "").toUpperCase().includes("MISC");

    const request = recordIsMisc
      ? form1099MiscService
          .get({ recordIds: record.RecordId })
          .then((result) => {
            const data = getMiscGetPayload(result);
            if (data.Form1099Records && data.Form1099Records.length > 0) {
              setMiscRecords(data.Form1099Records);
            } else {
              setError(data.Errors?.[0]?.Message || "No record details found.");
            }
          })
      : form1099NecService
          .get({ recordIds: record.RecordId })
          .then((result) => {
            const data = getGetPayload(result);
            if (data.Form1099Records && data.Form1099Records.length > 0) {
              setRecords(data.Form1099Records);
            } else {
              setError(data.Errors?.[0]?.Message || "No record details found.");
            }
          });

    request
      .catch((err) => {
        const body = err.response?.data;
        const apiError = body?.Response?.Errors?.[0] || body?.Errors?.[0];
        setError(
          apiError?.Message || err.message || "Failed to load record details.",
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-slate-200">
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <Eye size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 tracking-tight">
                      {isMisc
                        ? "Form 1099-MISC Details"
                        : "Form 1099-NEC Details"}
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
                      Loading record details...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-xs font-bold text-red-600">{error}</p>
                  </div>
                ) : isMisc ? (
                  miscRecords.map((r, idx) => (
                    <MiscRecordDetails key={idx} record={r} />
                  ))
                ) : (
                  records.map((r, idx) => (
                    <RecordDetails key={idx} record={r} />
                  ))
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
