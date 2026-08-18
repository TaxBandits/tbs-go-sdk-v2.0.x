import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  Mail,
  Briefcase,
  User,
  Landmark,
  CheckCircle2,
  Save,
  X,
} from "lucide-react";
import {
  US_STATES,
  CANADA_PROVINCES,
  COUNTRIES,
  SUFFIXES,
  RECIPIENT_CHAPTER_3_CODES,
  RECIPIENT_CHAPTER_4_CODES,
  RECIPIENT_LOB_CODES,
  EXEMPT_PAYEE_CODES,
  FATCA_EXEMPTION_CODES,
  FEDERAL_TAX_CLASSIFICATIONS,
} from "../constants";
import type { TINType } from "../types";

const STEPS = ["Basic Info", "TIN & Address", "Contact Info"] as const;
type Step = (typeof STEPS)[number];

const STEP_ICONS: Record<Step, typeof User> = {
  "Basic Info": User,
  "TIN & Address": Landmark,
  "Contact Info": Mail,
};

export interface RecipientWizardData {
  RecipientType: "Individual" | "Business";
  SequenceId: string;
  RecipientRef: string;
  IndividualNm: {
    FirstNm: string;
    MiddleNm: string;
    LastNm: string;
    Suffix: string;
  };
  BusinessNm: string;
  NameCtrl: string;
  TINType: TINType;
  TIN: string;
  TINFormat: "PLAIN_TIN" | "ENCRYPTED_TIN" | "TOKENIZED_TIN";
  TINToken: string;
  TINLast4?: string;
  Address: {
    Address1: string;
    Address2: string;
    City: string;
    ProvinceOrState: string;
    ZipCd: string;
    Country: string;
  };
  Email: string;
  Phone: string;
  Fax: string;
  DateOfBirth: string;
  DBADetails: {
    DBANm: string;
    DBARef: string;
    Address: {
      Address1: string;
      Address2: string;
      City: string;
      ProvinceOrState: string;
      ZipCd: string;
      Country: string;
    };
  };
  W9: {
    FederalTaxClassification: string;
    ExemptPayeeCode: string;
    FATCAReportingCode: string;
    BackupWithholdingStatus: boolean;
  };
  W8BEN: {
    CitizenOfCountry: string;
    FTIN: string;
    FTINNotLegallyRequired: boolean;
  };
  Form1042S: {
    Chapter3StatusCode: string;
    Chapter4StatusCode: string;
    GIIN: string;
    LOBCode: string;
  };
}

const EMPTY_DATA: RecipientWizardData = {
  RecipientType: "Individual",
  SequenceId: "",
  RecipientRef: "",
  IndividualNm: { FirstNm: "", MiddleNm: "", LastNm: "", Suffix: "" },
  BusinessNm: "",
  NameCtrl: "",
  TINType: "EIN",
  TIN: "",
  TINFormat: "PLAIN_TIN",
  TINToken: "",
  Address: {
    Address1: "",
    Address2: "",
    City: "",
    ProvinceOrState: "",
    ZipCd: "",
    Country: "US",
  },
  Email: "",
  Phone: "",
  Fax: "",
  DateOfBirth: "",
  DBADetails: {
    DBANm: "",
    DBARef: "",
    Address: {
      Address1: "",
      Address2: "",
      City: "",
      ProvinceOrState: "",
      ZipCd: "",
      Country: "US",
    },
  },
  W9: {
    FederalTaxClassification: "",
    ExemptPayeeCode: "",
    FATCAReportingCode: "",
    BackupWithholdingStatus: false,
  },
  W8BEN: {
    CitizenOfCountry: "",
    FTIN: "",
    FTINNotLegallyRequired: false,
  },
  Form1042S: {
    Chapter3StatusCode: "",
    Chapter4StatusCode: "",
    GIIN: "",
    LOBCode: "",
  },
};

interface AddRecipientWizardProps {
  onClose: () => void;
  onSubmit: (data: RecipientWizardData, createAnother: boolean) => void;
  isSubmitting?: boolean;
  initialData?: RecipientWizardData;
  isEditMode?: boolean;
}

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-bold text-slate-600 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      title={props.title ?? props["aria-label"] ?? props.placeholder}
      className={`w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all placeholder:text-slate-300 ${className}`}
    />
  );
}

function ReviewField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function AccordionSection({
  icon,
  title,
  isOpen,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        type="button"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-xs font-black text-slate-700">
          <span className="text-slate-400">{icon}</span>
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="p-5 bg-white space-y-4">{children}</div>}
    </div>
  );
}

export default function AddRecipientWizard({
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
  isEditMode = false,
}: AddRecipientWizardProps) {
  const [activeStep, setActiveStep] = useState<Step>("Basic Info");
  const [showReview, setShowReview] = useState(false);
  const [data, setData] = useState<RecipientWizardData>(
    initialData || EMPTY_DATA,
  );
  const [openSection, setOpenSection] = useState<string>("contact");

  const stepIndex = STEPS.indexOf(activeStep);

  const toggleSection = (key: string) =>
    setOpenSection((prev) => (prev === key ? "" : key));

  const handleTINTypeChange = (TINType: TINType) => {
    const isIndividualTIN = ["SSN", "ITIN", "IRSN"].includes(TINType);
    setData({
      ...data,
      TINType,
      RecipientType: isIndividualTIN ? "Individual" : "Business",
    });
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setActiveStep(STEPS[stepIndex + 1]);
  };
  const goBack = () => {
    if (stepIndex > 0) setActiveStep(STEPS[stepIndex - 1]);
  };

  const handleSubmit = (createAnother: boolean) => {
    onSubmit(data, createAnother);
  };

  const recipientName =
    data.RecipientType === "Individual"
      ? `${data.IndividualNm.FirstNm} ${data.IndividualNm.LastNm}`.trim() ||
        "Not Provided"
      : data.BusinessNm || "Not Provided";

  const addressLine =
    [data.Address.Address1, data.Address.Address2].filter(Boolean).join(", ") ||
    "Not Provided";

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Review Overlay */}
      {showReview && (
        <div className="absolute inset-0 z-[120] bg-white flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileText size={18} className="text-tax-orange" /> Review
                Recipient Details
              </h2>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                Please confirm the information before saving
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReview(false)}
              title="Close review"
              aria-label="Close review"
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3">
              <ReviewField label="Recipient Name" value={recipientName} />
              <ReviewField
                label="Recipient Ref"
                value={data.RecipientRef || "Not Provided"}
              />
              <ReviewField
                label="Name Control"
                value={data.NameCtrl || "Not Provided"}
              />
              <ReviewField label="Recipient Type" value={data.RecipientType} />
              <ReviewField label="TIN Type" value={data.TINType} />
              <ReviewField
                label="TIN"
                value={data.TIN ? `••••${data.TIN.slice(-4)}` : "Not Provided"}
              />
              <ReviewField label="TIN Format" value={data.TINFormat} />
              <ReviewField label="Address" value={addressLine} />
              <ReviewField label="Email" value={data.Email || "Not Provided"} />
              <ReviewField label="Phone" value={data.Phone || "Not Provided"} />
              <ReviewField label="Fax" value={data.Fax || "Not Provided"} />
              <ReviewField
                label="DOB"
                value={data.DateOfBirth || "Not Provided"}
              />
              <ReviewField
                label="DBA Name"
                value={data.DBADetails.DBANm || "None"}
              />
              <ReviewField
                label="W-9 Classification"
                value={data.W9.FederalTaxClassification || "None"}
              />
            </div>
          </div>

          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50 shrink-0">
            <button
              onClick={() => setShowReview(false)}
              type="button"
              className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Back to Edit
            </button>
            <button
              onClick={() => handleSubmit(false)}
              type="button"
              disabled={isSubmitting}
              className="px-8 py-3 bg-tax-deep-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Confirm &amp; Save
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-tax-orange shadow-sm border border-orange-100">
            {isEditMode ? <User size={24} /> : <Briefcase size={24} />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {isEditMode ? "Edit Recipient" : "Add New Recipient"}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {isEditMode
                ? `Editing: ${recipientName}`
                : "Create a new recipient record"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          type="button"
          title="Close recipient form"
          aria-label="Close recipient form"
          className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="px-8 border-b border-slate-100 bg-slate-50/50 flex scrollbar-hide overflow-x-auto shrink-0">
        {STEPS.map((step) => {
          const Icon = STEP_ICONS[step];
          const active = activeStep === step;
          return (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              type="button"
              className={`relative py-5 px-4 flex items-center gap-2 group transition-all shrink-0 ${
                active
                  ? "text-tax-orange"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {step}
              </span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-tax-orange rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 pb-32">
          {activeStep === "Basic Info" && (
            <>
              <div>
                <h3 className="text-sm font-black text-tax-orange tracking-tight mb-4 pb-2 border-b border-slate-100">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Recipient Type</Label>
                    <select
                      title="Recipient Type"
                      aria-label="Recipient Type"
                      value={data.RecipientType}
                      onChange={(e) =>
                        setData({
                          ...data,
                          RecipientType: e.target.value as
                            | "Individual"
                            | "Business",
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                  <div>
                    <Label required>Sequence ID</Label>
                    <Input
                      placeholder="Enter Sequence ID"
                      value={data.SequenceId}
                      onChange={(e) =>
                        setData({ ...data, SequenceId: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label required>Recipient Ref</Label>
                    <Input
                      placeholder="e.g. RCP1001"
                      value={data.RecipientRef}
                      onChange={(e) =>
                        setData({ ...data, RecipientRef: e.target.value })
                      }
                    />
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      IRS Payee reference matching your accounting system
                    </p>
                  </div>
                  <div>
                    <Label>Name Control</Label>
                    <Input
                      
                      maxLength={4}
                      value={data.NameCtrl}
                      onChange={(e) =>
                        setData({
                          ...data,
                          NameCtrl: e.target.value.toUpperCase(),
                        })
                      }
                    />
                   
                  </div>
                </div>
              </div>

              {data.RecipientType === "Individual" ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4">
                    Individual Name Components
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label required>First Name</Label>
                      <Input
                        placeholder="First Name"
                        value={data.IndividualNm.FirstNm}
                        onChange={(e) =>
                          setData({
                            ...data,
                            IndividualNm: {
                              ...data.IndividualNm,
                              FirstNm: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Middle Initial</Label>
                      <Input
                        placeholder="M"
                        value={data.IndividualNm.MiddleNm}
                        onChange={(e) =>
                          setData({
                            ...data,
                            IndividualNm: {
                              ...data.IndividualNm,
                              MiddleNm: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label required>Last Name</Label>
                      <Input
                        placeholder="Last Name"
                        value={data.IndividualNm.LastNm}
                        onChange={(e) =>
                          setData({
                            ...data,
                            IndividualNm: {
                              ...data.IndividualNm,
                              LastNm: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Suffix</Label>
                      <select
                        title="Suffix"
                        aria-label="Suffix"
                        value={data.IndividualNm.Suffix}
                        onChange={(e) =>
                          setData({
                            ...data,
                            IndividualNm: {
                              ...data.IndividualNm,
                              Suffix: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">None</option>
                        {SUFFIXES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4">
                    Business Name
                  </h4>
                  <Label required>Business Name</Label>
                  <Input
                    placeholder="e.g. Acme Supplies Corp"
                    value={data.BusinessNm}
                    onChange={(e) =>
                      setData({ ...data, BusinessNm: e.target.value })
                    }
                  />
                </div>
              )}
            </>
          )}

          {activeStep === "TIN & Address" && (
            <div>
              <h3 className="text-sm font-black text-tax-orange tracking-tight mb-4 pb-2 border-b border-slate-100">
                TIN &amp; Address Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label required>TIN Type</Label>
                  <select
                    title="TIN Type"
                    aria-label="TIN Type"
                    value={
                      data.TINType === "EIN" || data.TINType === "SSN"
                        ? data.TINType
                        : "Others"
                    }
                    onChange={(e) => {
                      const TINType =
                        e.target.value === "Others"
                          ? "QI-EIN"
                          : (e.target.value as TINType);
                      handleTINTypeChange(TINType);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                  >
                    <option value="EIN">EIN — Employer Identification Number</option>
                    <option value="SSN">SSN — Social Security Number</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                {data.TINType !== "EIN" && data.TINType !== "SSN" && (
                  <div>
                    <Label required>Other TIN Type</Label>
                    <select
                      title="Other TIN Type"
                      aria-label="Other TIN Type"
                      value={data.TINType}
                      onChange={(e) =>
                        handleTINTypeChange(e.target.value as TINType)
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                    >
                      <option value="QI-EIN">QI-EIN</option>
                      <option value="WP-EIN">WP-EIN</option>
                      <option value="WT-EIN">WT-EIN</option>
                      <option value="NQI-EIN">NQI-EIN</option>
                      <option value="ITIN">ITIN</option>
                      <option value="IRSN">IRSN</option>
                    </select>
                  </div>
                )}
                <div>
                  <Label required>Taxpayer Identification Number (TIN)</Label>
                  <Input
                    placeholder="XX-XXXXXXX"
                    value={data.TIN}
                    onChange={(e) =>
                      setData({
                        ...data,
                        TIN: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                  />
                </div>
                <div>
                  <Label required>TIN Format</Label>
                  <select
                    title="TIN Format"
                    aria-label="TIN Format"
                    value={data.TINFormat}
                    onChange={(e) =>
                      setData({
                        ...data,
                        TINFormat: e.target.value as
                          | "PLAIN_TIN"
                          | "ENCRYPTED_TIN"
                          | "TOKENIZED_TIN",
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                  >
                    <option value="PLAIN_TIN">PLAIN_TIN</option>
                    <option value="ENCRYPTED_TIN">ENCRYPTED_TIN</option>
                    <option value="TOKENIZED_TIN">TOKENIZED_TIN</option>
                  </select>
                </div>
                {data.TINFormat === "TOKENIZED_TIN" && (
                  <div>
                    <Label required>TIN Token</Label>
                    <Input
                      placeholder="Enter TIN Token"
                      value={data.TINToken}
                      onChange={(e) =>
                        setData({ ...data, TINToken: e.target.value })
                      }
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <Label required>Address Line 1</Label>
                  <Input
                    placeholder="Street Address"
                    value={data.Address.Address1}
                    onChange={(e) =>
                      setData({
                        ...data,
                        Address: { ...data.Address, Address1: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address Line 2</Label>
                  <Input
                    placeholder="Suite, Floor, Apt, etc. (optional)"
                    value={data.Address.Address2}
                    onChange={(e) =>
                      setData({
                        ...data,
                        Address: { ...data.Address, Address2: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label required>City</Label>
                  <Input
                    placeholder="e.g. Rock Hill"
                    value={data.Address.City}
                    onChange={(e) =>
                      setData({
                        ...data,
                        Address: { ...data.Address, City: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>State</Label>
                    {data.Address.Country === "US" ? (
                      <select
                        title="State"
                        aria-label="State"
                        value={data.Address.ProvinceOrState}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Address: {
                              ...data.Address,
                              ProvinceOrState: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Select</option>
                        {US_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : data.Address.Country === "CA" ? (
                      <select
                        title="Province"
                        aria-label="Province"
                        value={data.Address.ProvinceOrState}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Address: {
                              ...data.Address,
                              ProvinceOrState: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Select</option>
                        {CANADA_PROVINCES.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="e.g. SC"
                        value={data.Address.ProvinceOrState}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Address: {
                              ...data.Address,
                              ProvinceOrState: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                  </div>
                  <div>
                    <Label required>ZIP Code</Label>
                    <Input
                      placeholder="e.g. 29730"
                      value={data.Address.ZipCd}
                      onChange={(e) =>
                        setData({
                          ...data,
                          Address: { ...data.Address, ZipCd: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Country</Label>
                  <select
                    title="Country"
                    aria-label="Country"
                    value={data.Address.Country}
                    onChange={(e) =>
                      setData({
                        ...data,
                        Address: {
                          ...data.Address,
                          Country: e.target.value,
                          ProvinceOrState: "",
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeStep === "Contact Info" && (
            <div>
              <h3 className="text-sm font-black text-tax-orange tracking-tight mb-4 pb-2 border-b border-slate-100">
                Recipient Details &amp; Annex Forms
              </h3>
              <div className="space-y-3">
                <AccordionSection
                  icon={<Mail size={14} />}
                  title="1. Contact & Personal Info"
                  isOpen={openSection === "contact"}
                  onToggle={() => toggleSection("contact")}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label required>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="e.g. shawn@sample.com"
                        value={data.Email}
                        onChange={(e) =>
                          setData({ ...data, Email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label required>Phone Number</Label>
                      <Input
                        placeholder="e.g. 9634567890"
                        value={data.Phone}
                        onChange={(e) =>
                          setData({ ...data, Phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Fax Number</Label>
                      <Input
                        placeholder="e.g. 6634567890"
                        value={data.Fax}
                        onChange={(e) =>
                          setData({ ...data, Fax: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Date of Birth (DOB)</Label>
                      <Input
                        type="date"
                        value={data.DateOfBirth}
                        onChange={(e) =>
                          setData({ ...data, DateOfBirth: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection
                  icon={<Briefcase size={14} />}
                  title="2. DBA Details (Optional)"
                  isOpen={openSection === "dba"}
                  onToggle={() => toggleSection("dba")}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>DBA Name</Label>
                      <Input
                        placeholder="e.g. Iceberg Icecreams"
                        value={data.DBADetails.DBANm}
                        onChange={(e) =>
                          setData({
                            ...data,
                            DBADetails: {
                              ...data.DBADetails,
                              DBANm: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>DBA Reference</Label>
                      <Input
                        placeholder="e.g. DBA1001"
                        value={data.DBADetails.DBARef}
                        onChange={(e) =>
                          setData({
                            ...data,
                            DBADetails: {
                              ...data.DBADetails,
                              DBARef: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>DBA Address Line 1</Label>
                      <Input
                        placeholder="Street Address"
                        value={data.DBADetails.Address.Address1}
                        onChange={(e) =>
                          setData({
                            ...data,
                            DBADetails: {
                              ...data.DBADetails,
                              Address: {
                                ...data.DBADetails.Address,
                                Address1: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>DBA Address Line 2</Label>
                      <Input
                        placeholder="Suite, Floor, Apt, etc. (optional)"
                        value={data.DBADetails.Address.Address2}
                        onChange={(e) =>
                          setData({
                            ...data,
                            DBADetails: {
                              ...data.DBADetails,
                              Address: {
                                ...data.DBADetails.Address,
                                Address2: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        placeholder="e.g. Rock Hill"
                        value={data.DBADetails.Address.City}
                        onChange={(e) =>
                          setData({
                            ...data,
                            DBADetails: {
                              ...data.DBADetails,
                              Address: {
                                ...data.DBADetails.Address,
                                City: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>State / Province</Label>
                      {data.DBADetails.Address.Country === "US" ? (
                        <select
                          title="DBA State"
                          aria-label="DBA State"
                          value={data.DBADetails.Address.ProvinceOrState}
                          onChange={(e) =>
                            setData({
                              ...data,
                              DBADetails: {
                                ...data.DBADetails,
                                Address: {
                                  ...data.DBADetails.Address,
                                  ProvinceOrState: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                        >
                          <option value="">Select</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : data.DBADetails.Address.Country === "CA" ? (
                        <select
                          title="DBA Province"
                          aria-label="DBA Province"
                          value={data.DBADetails.Address.ProvinceOrState}
                          onChange={(e) =>
                            setData({
                              ...data,
                              DBADetails: {
                                ...data.DBADetails,
                                Address: {
                                  ...data.DBADetails.Address,
                                  ProvinceOrState: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                        >
                          <option value="">Select</option>
                          {CANADA_PROVINCES.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          placeholder="e.g. SC"
                          value={data.DBADetails.Address.ProvinceOrState}
                          onChange={(e) =>
                            setData({
                              ...data,
                              DBADetails: {
                                ...data.DBADetails,
                                Address: {
                                  ...data.DBADetails.Address,
                                  ProvinceOrState: e.target.value,
                                },
                              },
                            })
                          }
                        />
                      )}
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        placeholder="e.g. 29730"
                        value={data.DBADetails.Address.ZipCd}
                        onChange={(e) =>
                          setData({
                            ...data,
                            DBADetails: {
                              ...data.DBADetails,
                              Address: {
                                ...data.DBADetails.Address,
                                ZipCd: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <select
                        title="DBA Country"
                        aria-label="DBA Country"
                        value={data.DBADetails.Address.Country}
                        onChange={(e) =>
                          setData({
                            ...data,
                            DBADetails: {
                              ...data.DBADetails,
                              Address: {
                                ...data.DBADetails.Address,
                                Country: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection
                  icon={<FileText size={14} />}
                  title="3. W-9 Details (FormW9)"
                  isOpen={openSection === "w9"}
                  onToggle={() => toggleSection("w9")}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Federal Tax Classification</Label>
                      <select
                        title="Federal Tax Classification"
                        aria-label="Federal Tax Classification"
                        value={data.W9.FederalTaxClassification}
                        onChange={(e) =>
                          setData({
                            ...data,
                            W9: {
                              ...data.W9,
                              FederalTaxClassification: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">None / Not Applicable</option>
                        {FEDERAL_TAX_CLASSIFICATIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Exempt Payee Code</Label>
                      <select
                        title="Exempt Payee Code"
                        aria-label="Exempt Payee Code"
                        value={data.W9.ExemptPayeeCode}
                        onChange={(e) =>
                          setData({
                            ...data,
                            W9: { ...data.W9, ExemptPayeeCode: e.target.value },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Optional</option>
                        {EXEMPT_PAYEE_CODES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>FATCA Reporting Code</Label>
                      <select
                        title="FATCA Reporting Code"
                        aria-label="FATCA Reporting Code"
                        value={data.W9.FATCAReportingCode}
                        onChange={(e) =>
                          setData({
                            ...data,
                            W9: {
                              ...data.W9,
                              FATCAReportingCode: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Optional</option>
                        {FATCA_EXEMPTION_CODES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="backupWithholdingStatus"
                        title="Backup Withholding Status"
                        aria-label="Backup Withholding Status"
                        className="w-4 h-4 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                        checked={data.W9.BackupWithholdingStatus}
                        onChange={(e) =>
                          setData({
                            ...data,
                            W9: {
                              ...data.W9,
                              BackupWithholdingStatus: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="backupWithholdingStatus"
                        className="text-xs font-bold text-slate-600 cursor-pointer"
                      >
                        Backup Withholding Status
                      </label>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection
                  icon={<Info size={14} />}
                  title="4. W-8BEN Foreign Status"
                  isOpen={openSection === "w8ben"}
                  onToggle={() => toggleSection("w8ben")}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Citizen of Country</Label>
                      <select
                        title="Citizen of Country"
                        aria-label="Citizen of Country"
                        value={data.W8BEN.CitizenOfCountry}
                        onChange={(e) =>
                          setData({
                            ...data,
                            W8BEN: {
                              ...data.W8BEN,
                              CitizenOfCountry: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Not Provided (U.S. Resident)</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>FTIN (Foreign Tax ID)</Label>
                      <Input
                        placeholder="Optional"
                        value={data.W8BEN.FTIN}
                        onChange={(e) =>
                          setData({
                            ...data,
                            W8BEN: { ...data.W8BEN, FTIN: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="ftinNotRequired"
                        title="FTIN not legally required"
                        aria-label="FTIN not legally required"
                        className="w-4 h-4 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                        checked={data.W8BEN.FTINNotLegallyRequired}
                        onChange={(e) =>
                          setData({
                            ...data,
                            W8BEN: {
                              ...data.W8BEN,
                              FTINNotLegallyRequired: e.target.checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="ftinNotRequired"
                        className="text-xs font-bold text-slate-600 cursor-pointer"
                      >
                        FTIN Not Legally Required
                      </label>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection
                  icon={<FileText size={14} />}
                  title="5. 1042-S Details (Foreign Income withholding)"
                  isOpen={openSection === "1042s"}
                  onToggle={() => toggleSection("1042s")}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Chapter 3 Status Code</Label>
                      <select
                        title="Chapter 3 Status Code"
                        aria-label="Chapter 3 Status Code"
                        value={data.Form1042S.Chapter3StatusCode}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Form1042S: {
                              ...data.Form1042S,
                              Chapter3StatusCode: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Optional</option>
                        {RECIPIENT_CHAPTER_3_CODES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Chapter 4 Status Code</Label>
                      <select
                        title="Chapter 4 Status Code"
                        aria-label="Chapter 4 Status Code"
                        value={data.Form1042S.Chapter4StatusCode}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Form1042S: {
                              ...data.Form1042S,
                              Chapter4StatusCode: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Optional</option>
                        {RECIPIENT_CHAPTER_4_CODES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>GIIN (Global Intermediary ID)</Label>
                      <Input
                        placeholder="Optional"
                        value={data.Form1042S.GIIN}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Form1042S: {
                              ...data.Form1042S,
                              GIIN: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>LOB Code</Label>
                      <select
                        title="LOB Code"
                        aria-label="LOB Code"
                        value={data.Form1042S.LOBCode}
                        onChange={(e) =>
                          setData({
                            ...data,
                            Form1042S: {
                              ...data.Form1042S,
                              LOBCode: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-tax-orange focus:ring-2 focus:ring-orange-50 transition-all"
                      >
                        <option value="">Optional</option>
                        {RECIPIENT_LOB_CODES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </AccordionSection>
              </div>
            </div>
          )}

        </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2
            size={16}
            className={isSubmitting ? "text-slate-200 animate-pulse" : "text-green-500"}
          />
          <span className="text-[10px] font-bold">
            {isSubmitting ? "Processing..." : "Ready to save"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {stepIndex > 0 && (
            <button
              onClick={goBack}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-lg hover:bg-slate-50 transition-all"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
          {stepIndex === STEPS.length - 1 ? (
            <button
              onClick={() => setShowReview(true)}
              type="button"
              className="px-8 py-3 bg-tax-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-orange-600 shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Save size={14} />
              {isEditMode ? "Update Recipient" : "Save Recipient"}
            </button>
          ) : (
            <button
              onClick={goNext}
              type="button"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-tax-orange text-white text-xs font-black rounded-lg hover:bg-orange-700 transition-all shadow-md"
            >
              Continue <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
