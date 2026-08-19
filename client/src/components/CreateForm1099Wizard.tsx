import {
  useEffect,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  Check,
  ChevronRight,
  FileText,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { payerService } from "../services/payerService";
import { recipientService } from "../services/recipientService";
import { BusinessListEntry, RecipientListEntry } from "../types";

const STEPS = ["Identify Payer & Payee Partners", "Box Fields"] as const;
type Step = (typeof STEPS)[number];

const FORM_TYPES = [
  { value: "1099-NEC", label: "Form 1099-NEC (Nonemployee Compensation)" },
  { value: "1099-MISC", label: "Form 1099-MISC (Miscellaneous Income)" },
];

const DISTRIBUTION_TYPES = [
  { value: "POSTAL_AND_ONLINE", label: "POSTAL_AND_ONLINE" },
  { value: "POSTAL_ONLY", label: "POSTAL_ONLY" },
  { value: "ONLINE_ACCESS", label: "ONLINE_ACCESS" },
];

const POSTAL_SERVICE_TYPES = [
  { value: "USPS_FIRST_CLASS", label: "USPS First Class Mail" },
  { value: "USPS_CERTIFIED", label: "USPS Certified Mail" },
];

export interface StateFilingEntry {
  StateCd: string;
  StateIdNum: string;
  StateIncome: string;
  StateWH: string;
}

export interface Form1099NecBoxData {
  B1NEC: string;
  CashTips: string;
  TTOC1: string;
  TTOC2: string;
  OvertimeComp: string;
  EPP: string;
  B2IsDirectSales: boolean;
  B4FedTaxWH: string;
  Is2ndTINnot: boolean;
  AccountNum: string;
  States: StateFilingEntry[];
}

const EMPTY_STATE_ENTRY: StateFilingEntry = {
  StateCd: "",
  StateIdNum: "",
  StateIncome: "",
  StateWH: "",
};

export interface Form1099MiscBoxData {
  Rents: string;
  Royalties: string;
  OtherIncome: string;
  FedIncomeTaxWH: string;
  FishingBoatProceeds: string;
  MedHealthcarePymts: string;
  IsDirectSale: boolean;
  SubstitutePymts: string;
  CropInsurance: string;
  GrossProceeds: string;
  FishPurForResale: string;
  Sec409ADeferrals: string;
  CashTips: string;
  TTOC1: string;
  TTOC2: string;
  OvertimeComp: string;
  IsFATCA: boolean;
  EPP: string;
  NonQualDefComp: string;
  AccountNum: string;
  Is2ndTINnot: boolean;
  States: StateFilingEntry[];
}

const EMPTY_MISC_BOX_DATA: Form1099MiscBoxData = {
  Rents: "",
  Royalties: "",
  OtherIncome: "",
  FedIncomeTaxWH: "",
  FishingBoatProceeds: "",
  MedHealthcarePymts: "",
  IsDirectSale: false,
  SubstitutePymts: "",
  CropInsurance: "",
  GrossProceeds: "",
  FishPurForResale: "",
  Sec409ADeferrals: "",
  CashTips: "",
  TTOC1: "",
  TTOC2: "",
  OvertimeComp: "",
  IsFATCA: false,
  EPP: "",
  NonQualDefComp: "",
  AccountNum: "",
  Is2ndTINnot: false,
  States: [],
};

export interface ReturnManifestData {
  IsFederalFiling: boolean;
  IsStateFiling: boolean;
  IsDistributionRequired: boolean;
  DistributionType: string;
  PostalServiceType: string;
  IsForcedTransmission: boolean;
}

export interface CreateForm1099Data {
  FormType: string;
  BusinessId: string;
  RecipientId: string;
  TaxYear: string;
  SequenceId: string;
  RecordId?: string;
  SubmissionId?: string;
  IsScheduleFiling: boolean;
  ScheduleEfileDate: string;
  ReturnManifest: ReturnManifestData;
  NECFormData: Form1099NecBoxData;
  MISCFormData: Form1099MiscBoxData;
}

const EMPTY_NEC_BOX_DATA: Form1099NecBoxData = {
  B1NEC: "",
  CashTips: "",
  TTOC1: "",
  TTOC2: "",
  OvertimeComp: "",
  EPP: "",
  B2IsDirectSales: false,
  B4FedTaxWH: "",
  Is2ndTINnot: false,
  AccountNum: "",
  States: [],
};

const EMPTY_RETURN_MANIFEST: ReturnManifestData = {
  IsFederalFiling: true,
  IsStateFiling: true,
  IsDistributionRequired: true,
  DistributionType: DISTRIBUTION_TYPES[0].value,
  PostalServiceType: POSTAL_SERVICE_TYPES[0].value,
  IsForcedTransmission: false,
};

interface CreateForm1099WizardProps {
  onClose: () => void;
  onSubmit: (data: CreateForm1099Data) => void;
  onValidate?: (data: CreateForm1099Data) => void;
  isSubmitting?: boolean;
  isValidating?: boolean;
  mode?: "create" | "edit";
  initialData?: CreateForm1099Data;
}

function Label({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      title={props.title ?? props["aria-label"] ?? props.placeholder}
      className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all placeholder:text-slate-300 ${className}`}
    />
  );
}

function StepIndicator({ activeStep }: { activeStep: Step }) {
  const activeIndex = STEPS.indexOf(activeStep);
  return (
    <div className="flex items-center">
      {STEPS.map((step, idx) => {
        const isDone = idx < activeIndex;
        const isActive = idx === activeIndex;
        return (
          <div key={step} className="flex items-center">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 ${
                isActive
                  ? "bg-tax-deep-blue text-white"
                  : isDone
                    ? "bg-green-100 text-green-600"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {isDone ? <Check size={12} /> : `Step ${idx + 1}`}
              {isActive && <span className="ml-1">{step}</span>}
            </span>
            {idx < STEPS.length - 1 && (
              <span className="w-10 h-px mx-2 bg-slate-200" />
            )}
            {!isActive && idx !== activeIndex && (
              <span className="text-[11px] text-slate-400 font-bold mr-2">
                {idx > activeIndex ? `Step ${idx + 1}: ${step}` : ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CreateForm1099Wizard({
  onClose,
  onSubmit,
  onValidate,
  isSubmitting = false,
  isValidating = false,
  mode = "create",
  initialData,
}: CreateForm1099WizardProps) {
  const [activeStep, setActiveStep] = useState<Step>(STEPS[0]);

  const [businesses, setBusinesses] = useState<BusinessListEntry[]>([]);
  const [recipients, setRecipients] = useState<RecipientListEntry[]>([]);

  const [formType, setFormType] = useState(
    initialData?.FormType ?? FORM_TYPES[0].value,
  );
  const [businessId, setBusinessId] = useState(initialData?.BusinessId ?? "");
  const [recipientId, setRecipientId] = useState(
    initialData?.RecipientId ?? "",
  );
  const [taxYear, setTaxYear] = useState(initialData?.TaxYear ?? "2026");
  const [sequenceId, setSequenceId] = useState(initialData?.SequenceId ?? "1");
  const [isScheduleFiling, setIsScheduleFiling] = useState(
    initialData?.IsScheduleFiling ?? false,
  );
  const [scheduleEfileDate, setScheduleEfileDate] = useState(
    initialData?.ScheduleEfileDate ?? "",
  );
  const [returnManifest, setReturnManifest] = useState<ReturnManifestData>(
    initialData?.ReturnManifest ?? EMPTY_RETURN_MANIFEST,
  );
  const [necBoxData, setNecBoxData] = useState<Form1099NecBoxData>(
    initialData?.NECFormData ?? EMPTY_NEC_BOX_DATA,
  );
  const [miscBoxData, setMiscBoxData] = useState<Form1099MiscBoxData>(
    initialData?.MISCFormData ?? EMPTY_MISC_BOX_DATA,
  );

  useEffect(() => {
    payerService
      .getBusinesses({ page: 1, pagesize: 100 })
      .then((res) => setBusinesses(res.Response.Businesses || []))
      .catch(() => setBusinesses([]));
    recipientService
      .getRecipients({ page: 1, pagesize: 100 })
      .then((res) => setRecipients(res.Response.Recipient || []))
      .catch(() => setRecipients([]));
  }, []);

  const selectedBusiness = businesses.find((b) => b.BusinessId === businessId);
  const selectedRecipient = recipients.find(
    (r) => r.RecipientId === recipientId,
  );

  const stepIndex = STEPS.indexOf(activeStep);
  const canGoNext = !!businessId && !!recipientId && !!taxYear && !!sequenceId;
  const showTaxYear2026Boxes = Number(taxYear) >= 2026;

  const goNext = () => {
    if (stepIndex < STEPS.length - 1 && canGoNext) {
      setActiveStep(STEPS[stepIndex + 1]);
    }
  };
  const goBack = () => {
    if (stepIndex > 0) setActiveStep(STEPS[stepIndex - 1]);
  };

  const isEdit = mode === "edit";

  const buildWizardData = (): CreateForm1099Data => ({
    FormType: formType,
    BusinessId: businessId,
    RecipientId: recipientId,
    TaxYear: taxYear,
    SequenceId: sequenceId,
    RecordId: initialData?.RecordId,
    SubmissionId: initialData?.SubmissionId,
    IsScheduleFiling: isScheduleFiling,
    ScheduleEfileDate: scheduleEfileDate,
    ReturnManifest: returnManifest,
    NECFormData: necBoxData,
    MISCFormData: miscBoxData,
  });

  const handleSubmit = () => {
    onSubmit(buildWizardData());
  };

  const handleValidate = () => {
    onValidate?.(buildWizardData());
  };

  const isMisc = formType === "1099-MISC";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold mb-4">
          <button
            onClick={onClose}
            type="button"
            className="text-tax-orange hover:underline"
          >
            Form 1099 Series
          </button>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-400">
            {isEdit ? "Edit Form 1099 Return" : "Create Form 1099 Return"}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isEdit ? "Edit Form 1099 Return" : "Create Form 1099 Return"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEdit
              ? "Update the details for this Form 1099 filing."
              : "Record a new Form 1099 filing mapped to a payer business and payee recipient."}
          </p>
        </div>
        <StepIndicator activeStep={activeStep} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 pb-32">
        {activeStep === "Identify Payer & Payee Partners" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
            <div>
              <Label required>Form Type</Label>
              <select
                title="Form Type"
                aria-label="Form Type"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
              >
                {FORM_TYPES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Payer (Business) <span className="text-red-500">*</span>
                </label>
              </div>
              <select
                title="Payer (Business)"
                aria-label="Payer (Business)"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
              >
                <option value="">Select a business...</option>
                {businesses.map((b) => (
                  <option key={b.BusinessId} value={b.BusinessId}>
                    {b.BusinessNm} ({"•".repeat(4)}
                    {b.TINDetails?.Last4Digit}) - Ref: {b.PayerRef}
                  </option>
                ))}
              </select>

              {selectedBusiness && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                      Selected Business Identity
                    </p>
                    <p className="text-xs text-slate-600">
                      TIN: {"•".repeat(4)}
                      {selectedBusiness.TINDetails?.Last4Digit}{" "}
                      <span className="text-slate-400">
                        ({selectedBusiness.TINDetails?.TINType})
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedBusiness.Address?.Address1}
                      {selectedBusiness.Address?.City
                        ? `, ${selectedBusiness.Address.City}`
                        : ""}
                      {selectedBusiness.Address?.ProvinceOrState
                        ? `, ${selectedBusiness.Address.ProvinceOrState}`
                        : ""}
                      {selectedBusiness.Address?.ZipCd
                        ? ` ${selectedBusiness.Address.ZipCd}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                      Payer Ref
                    </p>
                    <p className="text-sm font-black text-tax-orange">
                      {selectedBusiness.PayerRef}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Payee (Recipient) <span className="text-red-500">*</span>
                </label>
              </div>
              <select
                title="Payee (Recipient)"
                aria-label="Payee (Recipient)"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
              >
                <option value="">Select a recipient...</option>
                {recipients.map((r) => (
                  <option key={r.RecipientId} value={r.RecipientId}>
                    {r.BusinessNm} ({r.TINDetails?.TINType}) - Ref: {r.PayeeRef}
                  </option>
                ))}
              </select>

              {selectedRecipient && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                      Selected Recipient Identity
                    </p>
                    <p className="text-xs text-slate-600">
                      TIN: {selectedRecipient.TINDetails?.Last4Digit}{" "}
                      <span className="text-slate-400">
                        ({selectedRecipient.TINDetails?.TINType})
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedRecipient.Address?.Address1}
                      {selectedRecipient.Address?.City
                        ? `, ${selectedRecipient.Address.City}`
                        : ""}
                      {selectedRecipient.Address?.ProvinceOrState
                        ? `, ${selectedRecipient.Address.ProvinceOrState}`
                        : ""}
                      {selectedRecipient.Address?.ZipCd
                        ? ` ${selectedRecipient.Address.ZipCd}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-[10px] font-black">
                      <Check size={10} /> Mapped to Payer Business
                    </span>
                    <p className="text-sm font-black text-tax-orange">
                      Payee Ref: {selectedRecipient.PayeeRef}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <Label required>Tax Year</Label>
                <Input
                  type="number"
                  placeholder="2026"
                  value={taxYear}
                  onChange={(e) => setTaxYear(e.target.value)}
                />
              </div>
              <div>
                <Label required>Sequence ID</Label>
                <Input
                  placeholder="1"
                  value={sequenceId}
                  onChange={(e) => setSequenceId(e.target.value)}
                />
              </div>
            </div>

            <div className="max-w-md">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={isScheduleFiling}
                  onChange={(e) => setIsScheduleFiling(e.target.checked)}
                  className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                />
                Schedule Filing
              </label>
              {isScheduleFiling && (
                <div className="mt-3">
                  <Label required>E-file Date</Label>
                  <Input
                    type="date"
                    value={scheduleEfileDate}
                    onChange={(e) => setScheduleEfileDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeStep === "Box Fields" && (
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Return Manifest Settings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black text-tax-deep-blue tracking-tight">
                  <SlidersHorizontal size={14} /> Return Manifest Settings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control filing transit channels and distribution logic.
                </p>
              </div>

              <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnManifest.IsFederalFiling}
                  onChange={(e) =>
                    setReturnManifest({
                      ...returnManifest,
                      IsFederalFiling: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                />
                <span>
                  <span className="block text-xs font-black text-slate-700">
                    Is Federal Filing
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Directly transmit this return record to the IRS.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnManifest.IsStateFiling}
                  onChange={(e) =>
                    setReturnManifest({
                      ...returnManifest,
                      IsStateFiling: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                />
                <span>
                  <span className="block text-xs font-black text-slate-700">
                    Is State Filing
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Enable State Direct / Combined Federal State filing (CFSF).
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnManifest.IsDistributionRequired}
                  onChange={(e) =>
                    setReturnManifest({
                      ...returnManifest,
                      IsDistributionRequired: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                />
                <span>
                  <span className="block text-xs font-black text-slate-700">
                    Is Distribution Required
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Request mailing or online delivery solutions to the payee.
                  </span>
                </span>
              </label>

              {returnManifest.IsDistributionRequired && (
                <div className="ml-1 pl-4 border-l-2 border-slate-100 space-y-4 bg-slate-50 rounded-xl p-4">
                  <div>
                    <Label>Distribution Type</Label>
                    <select
                      title="Distribution Type"
                      aria-label="Distribution Type"
                      value={returnManifest.DistributionType}
                      onChange={(e) =>
                        setReturnManifest({
                          ...returnManifest,
                          DistributionType: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                    >
                      {DISTRIBUTION_TYPES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Postal Service Type</Label>
                    <select
                      title="Postal Service Type"
                      aria-label="Postal Service Type"
                      value={returnManifest.PostalServiceType}
                      onChange={(e) =>
                        setReturnManifest({
                          ...returnManifest,
                          PostalServiceType: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                    >
                      {POSTAL_SERVICE_TYPES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnManifest.IsForcedTransmission}
                  onChange={(e) =>
                    setReturnManifest({
                      ...returnManifest,
                      IsForcedTransmission: e.target.checked,
                    })
                  }
                  className="mt-0.5 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                />
                <span>
                  <span className="block text-xs font-black text-slate-700">
                    Is Forced Transmission
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Ignore warnings and force IRS submission.
                  </span>
                </span>
              </label>
            </div>

            {/* NEC Box Values */}
            {!isMisc && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black text-tax-deep-blue tracking-tight">
                    <FileText size={14} /> NEC Box Values
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the exact IRS financial compensation indices.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Box 1: NEC ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={necBoxData.B1NEC}
                      onChange={(e) =>
                        setNecBoxData({ ...necBoxData, B1NEC: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Cash Tips ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={necBoxData.CashTips}
                      onChange={(e) =>
                        setNecBoxData({
                          ...necBoxData,
                          CashTips: e.target.value,
                        })
                      }
                    />
                  </div>
                  {showTaxYear2026Boxes && (
                    <>
                      <div>
                        <Label>TTOC1 Code</Label>
                        <Input
                          placeholder="e.g. 102"
                          value={necBoxData.TTOC1}
                          onChange={(e) =>
                            setNecBoxData({
                              ...necBoxData,
                              TTOC1: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>TTOC2 Code</Label>
                        <Input
                          placeholder="e.g. 103"
                          value={necBoxData.TTOC2}
                          onChange={(e) =>
                            setNecBoxData({
                              ...necBoxData,
                              TTOC2: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Overtime Comp ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={necBoxData.OvertimeComp}
                          onChange={(e) =>
                            setNecBoxData({
                              ...necBoxData,
                              OvertimeComp: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label>EPP Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={necBoxData.EPP}
                      onChange={(e) =>
                        setNecBoxData({ ...necBoxData, EPP: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fed Tax WH ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={necBoxData.B4FedTaxWH}
                      onChange={(e) =>
                        setNecBoxData({
                          ...necBoxData,
                          B4FedTaxWH: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Optional"
                      value={necBoxData.AccountNum}
                      onChange={(e) =>
                        setNecBoxData({
                          ...necBoxData,
                          AccountNum: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={necBoxData.B2IsDirectSales}
                      onChange={(e) =>
                        setNecBoxData({
                          ...necBoxData,
                          B2IsDirectSales: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                    />
                    Direct Sales Check
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={necBoxData.Is2ndTINnot}
                      onChange={(e) =>
                        setNecBoxData({
                          ...necBoxData,
                          Is2ndTINnot: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                    />
                    2nd TIN Notice
                  </label>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700">
                      State Filing Details
                    </p>
                    {necBoxData.States.length < 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setNecBoxData({
                            ...necBoxData,
                            States: [
                              ...necBoxData.States,
                              { ...EMPTY_STATE_ENTRY },
                            ],
                          })
                        }
                        className="flex items-center gap-1 text-[11px] font-black text-tax-orange hover:underline"
                      >
                        <Plus size={12} /> Add State
                      </button>
                    )}
                  </div>

                  {necBoxData.States.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No states added. Click "Add State" to file for a state.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {necBoxData.States.map((state, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-lg p-3 relative"
                        >
                          <button
                            type="button"
                            title="Remove state"
                            aria-label="Remove state"
                            onClick={() =>
                              setNecBoxData({
                                ...necBoxData,
                                States: necBoxData.States.filter(
                                  (_, i) => i !== idx,
                                ),
                              })
                            }
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-4 pr-6">
                            <div>
                              <Label>State Code</Label>
                              <Input
                                placeholder="e.g. CA"
                                maxLength={2}
                                value={state.StateCd}
                                onChange={(e) =>
                                  setNecBoxData({
                                    ...necBoxData,
                                    States: necBoxData.States.map((s, i) =>
                                      i === idx
                                        ? {
                                            ...s,
                                            StateCd:
                                              e.target.value.toUpperCase(),
                                          }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>State WH ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={state.StateWH}
                                onChange={(e) =>
                                  setNecBoxData({
                                    ...necBoxData,
                                    States: necBoxData.States.map((s, i) =>
                                      i === idx
                                        ? { ...s, StateWH: e.target.value }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>State ID Number</Label>
                              <Input
                                placeholder="State ID"
                                value={state.StateIdNum}
                                onChange={(e) =>
                                  setNecBoxData({
                                    ...necBoxData,
                                    States: necBoxData.States.map((s, i) =>
                                      i === idx
                                        ? { ...s, StateIdNum: e.target.value }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>State Income ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={state.StateIncome}
                                onChange={(e) =>
                                  setNecBoxData({
                                    ...necBoxData,
                                    States: necBoxData.States.map((s, i) =>
                                      i === idx
                                        ? { ...s, StateIncome: e.target.value }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MISC Box Values */}
            {isMisc && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-black text-tax-deep-blue tracking-tight">
                    <FileText size={14} /> MISC Box Values
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the exact IRS financial compensation indices.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Box 1: Rents ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.Rents}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          Rents: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Box 2: Royalties ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.Royalties}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          Royalties: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Box 3: Other Income ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.OtherIncome}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          OtherIncome: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Box 4: Fed Tax WH ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.FedIncomeTaxWH}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          FedIncomeTaxWH: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fishing Boat Proceeds ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.FishingBoatProceeds}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          FishingBoatProceeds: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Medical Healthcare ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.MedHealthcarePymts}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          MedHealthcarePymts: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Substitute Pmts ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.SubstitutePymts}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          SubstitutePymts: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Crop Insurance ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.CropInsurance}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          CropInsurance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Gross Proceeds ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.GrossProceeds}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          GrossProceeds: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fish Purchase Resale ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.FishPurForResale}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          FishPurForResale: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Sec 409A Deferrals ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.Sec409ADeferrals}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          Sec409ADeferrals: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Cash Tips ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.CashTips}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          CashTips: e.target.value,
                        })
                      }
                    />
                  </div>
                  {showTaxYear2026Boxes && (
                    <>
                      <div>
                        <Label>TTOC1 Code</Label>
                        <Input
                          placeholder="e.g. 102"
                          value={miscBoxData.TTOC1}
                          onChange={(e) =>
                            setMiscBoxData({
                              ...miscBoxData,
                              TTOC1: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>TTOC2 Code</Label>
                        <Input
                          placeholder="e.g. 103"
                          value={miscBoxData.TTOC2}
                          onChange={(e) =>
                            setMiscBoxData({
                              ...miscBoxData,
                              TTOC2: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Overtime Comp ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={miscBoxData.OvertimeComp}
                          onChange={(e) =>
                            setMiscBoxData({
                              ...miscBoxData,
                              OvertimeComp: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label>EPP Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.EPP}
                      onChange={(e) =>
                        setMiscBoxData({ ...miscBoxData, EPP: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Non-Qual Def Comp ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={miscBoxData.NonQualDefComp}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          NonQualDefComp: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Optional"
                      value={miscBoxData.AccountNum}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          AccountNum: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={miscBoxData.IsDirectSale}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          IsDirectSale: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                    />
                    Direct Sale
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={miscBoxData.IsFATCA}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          IsFATCA: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                    />
                    FATCA Compliant
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={miscBoxData.Is2ndTINnot}
                      onChange={(e) =>
                        setMiscBoxData({
                          ...miscBoxData,
                          Is2ndTINnot: e.target.checked,
                        })
                      }
                      className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                    />
                    2nd TIN Notice
                  </label>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-700">
                      State Filing Details
                    </p>
                    {miscBoxData.States.length < 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMiscBoxData({
                            ...miscBoxData,
                            States: [
                              ...miscBoxData.States,
                              { ...EMPTY_STATE_ENTRY },
                            ],
                          })
                        }
                        className="flex items-center gap-1 text-[11px] font-black text-tax-orange hover:underline"
                      >
                        <Plus size={12} /> Add State
                      </button>
                    )}
                  </div>

                  {miscBoxData.States.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No states added. Click "Add State" to file for a state.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {miscBoxData.States.map((state, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-lg p-3 relative"
                        >
                          <button
                            type="button"
                            title="Remove state"
                            aria-label="Remove state"
                            onClick={() =>
                              setMiscBoxData({
                                ...miscBoxData,
                                States: miscBoxData.States.filter(
                                  (_, i) => i !== idx,
                                ),
                              })
                            }
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-4 pr-6">
                            <div>
                              <Label>State Code</Label>
                              <Input
                                placeholder="e.g. CA"
                                maxLength={2}
                                value={state.StateCd}
                                onChange={(e) =>
                                  setMiscBoxData({
                                    ...miscBoxData,
                                    States: miscBoxData.States.map((s, i) =>
                                      i === idx
                                        ? {
                                            ...s,
                                            StateCd:
                                              e.target.value.toUpperCase(),
                                          }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>State WH ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={state.StateWH}
                                onChange={(e) =>
                                  setMiscBoxData({
                                    ...miscBoxData,
                                    States: miscBoxData.States.map((s, i) =>
                                      i === idx
                                        ? { ...s, StateWH: e.target.value }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>State ID Number</Label>
                              <Input
                                placeholder="State ID"
                                value={state.StateIdNum}
                                onChange={(e) =>
                                  setMiscBoxData({
                                    ...miscBoxData,
                                    States: miscBoxData.States.map((s, i) =>
                                      i === idx
                                        ? { ...s, StateIdNum: e.target.value }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>State Income ($)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={state.StateIncome}
                                onChange={(e) =>
                                  setMiscBoxData({
                                    ...miscBoxData,
                                    States: miscBoxData.States.map((s, i) =>
                                      i === idx
                                        ? { ...s, StateIncome: e.target.value }
                                        : s,
                                    ),
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between">
        <button
          onClick={stepIndex === 0 ? onClose : goBack}
          type="button"
          className="px-5 py-2.5 text-xs font-black text-slate-500 hover:text-slate-700 transition-colors"
        >
          {stepIndex === 0 ? "Cancel" : "Back"}
        </button>

        {stepIndex < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            type="button"
            className="flex items-center gap-2 px-6 py-2.5 bg-tax-deep-blue text-white text-xs font-black rounded-lg hover:opacity-90 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            {onValidate && (
              <button
                onClick={handleValidate}
                disabled={isValidating || isSubmitting}
                type="button"
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-black rounded-lg hover:bg-slate-50 transition-all disabled:opacity-60"
              >
                {isValidating ? "Validating..." : "Validate Form"}
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 bg-tax-orange text-white text-xs font-black rounded-lg hover:bg-orange-700 transition-all shadow-md shadow-orange-500/10 disabled:opacity-60"
            >
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                  ? "Update Return"
                  : "Save Return"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
