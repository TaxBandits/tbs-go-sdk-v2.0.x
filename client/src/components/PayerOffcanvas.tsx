import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Building,
  MapPin,
  Mail,
  Briefcase,
  ShieldCheck,
  FileText,
  Info,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { payerService } from "../services/payerService";
import {
  BUSINESS_TYPES,
  BUSINESS_MEMBER_TYPES,
  US_STATES,
  CANADA_PROVINCES,
  COUNTRIES,
  KIND_OF_EMPLOYER,
  KIND_OF_PAYER,
  CHAPTER_3_CODES,
  CHAPTER_4_CODES,
  SUFFIXES,
} from "../constants";

interface PayerOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  payer?: any; // Keeping as any for now as it handles mixed types from search/list
  onSave: (data: any) => void;
}

export default function PayerOffcanvas({
  isOpen,
  onClose,
  payer,
  onSave,
}: PayerOffcanvasProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<any>({
    SequenceId: "01",
    PayerRef: "",
    IsDefaultBusiness: false,
    TINDetails: {
      Format: "PLAIN_TIN",
      TINType: "EIN",
      TIN: "",
      TINToken: "",
      EncryptedTIN: "",
    },
    IndividualNm: {
      FirstNm: "",
      MiddleNm: "",
      LastNm: "",
      Suffix: "",
    },
    BusinessNm: "",
    NameCtrl: "",
    BusinessType: "",
    Email: "",
    Address: {
      Address1: "",
      Address2: "",
      City: "",
      ProvinceOrState: "",
      ZipCd: "",
      Country: "",
    },
    ContactDetails: {
      FirstNm: "",
      MiddleNm: "",
      LastNm: "",
      Suffix: "",
      Phone: "",
      PhoneExtn: "",
      Email: "",
      Fax: "",
    },
    DBADetails: {
      DBAId: "00000000-0000-0000-0000-000000000000",
      DBANm: "",
      DBARef: "",
      Address: {
        Address1: "",
        Address2: "",
        City: "",
        ProvinceOrState: "",
        ZipCd: "",
        Country: "",
      },
    },
    W2Specific: {
      KindOfEmployer: "",
      KindOfPayer: "",
    },
    Form1042SSpecific: {
      WHAgtCh3Cd: "",
      WHAgtCh4Cd: "",
      WHAgtGIIN: "",
      FTIN: "",
      Country: "",
    },
    ACASpecific: {
      IsInsurer: false,
      IsGovernmentalUnit: false,
    },
    Form480Specific: {
      TaxPayerType: "",
    },
    SigningAuthority: {
      FirstNm: "",
      MiddleNm: "",
      LastNm: "",
      Suffix: "",
      Phone: "",
      PhoneExtn: "",
      BusinessMemberType: "",
    },
  });

  useEffect(() => {
    setValidationErrors([]);
    setSaveError(null);
    if (payer) {
      setFormData({
        SequenceId: payer.SequenceId || "01",
        PayerRef: payer.PayerRef || "",
        IsDefaultBusiness: payer.IsDefaultBusiness || false,
        TINDetails: {
          Format: payer.TINDetails?.Format || "PLAIN_TIN",
          TINType: payer.TINDetails?.TINType || "EIN",
          TIN: payer.TINDetails?.TIN || "",
          TINToken: payer.TINDetails?.TINToken || "",
          EncryptedTIN: payer.TINDetails?.EncryptedTIN || "",
        },
        IndividualNm: {
          FirstNm: payer.IndividualNm?.FirstNm || "",
          MiddleNm: payer.IndividualNm?.MiddleNm || "",
          LastNm: payer.IndividualNm?.LastNm || "",
          Suffix: payer.IndividualNm?.Suffix || "",
        },
        BusinessNm: payer.BusinessNm || "",
        NameCtrl: payer.NameCtrl || "",
        BusinessType: payer.BusinessType || "",
        Email: payer.ContactDetails?.Email || "",
        Address: {
          Address1: payer.Address?.Address1 || "",
          Address2: payer.Address?.Address2 || "",
          City: payer.Address?.City || "",
          ProvinceOrState: payer.Address?.ProvinceOrState || "",
          ZipCd: payer.Address?.ZipCd || "",
          Country: payer.Address?.Country || "",
        },
        ContactDetails: {
          FirstNm: payer.ContactDetails?.FirstNm || "",
          MiddleNm: payer.ContactDetails?.MiddleNm || "",
          LastNm: payer.ContactDetails?.LastNm || "",
          Suffix: payer.ContactDetails?.Suffix || "",
          Phone: payer.ContactDetails?.Phone || "",
          PhoneExtn: payer.ContactDetails?.PhoneExtn || "",
          Email: payer.ContactDetails?.Email || "",
          Fax: payer.ContactDetails?.Fax || "",
        },
        DBADetails:
          payer.DBADetails && payer.DBADetails.length > 0
            ? {
                DBAId:
                  payer.DBADetails[0].DBAId ||
                  "00000000-0000-0000-0000-000000000000",
                DBANm: payer.DBADetails[0].DBANm || "",
                DBARef: payer.DBADetails[0].DBARef || "",
                Address: {
                  Address1: payer.DBADetails[0].Address?.Address1 || "",
                  Address2: payer.DBADetails[0].Address?.Address2 || "",
                  City: payer.DBADetails[0].Address?.City || "",
                  ProvinceOrState:
                    payer.DBADetails[0].Address?.ProvinceOrState || "",
                  ZipCd: payer.DBADetails[0].Address?.ZipCd || "",
                  Country: payer.DBADetails[0].Address?.Country || "",
                },
              }
            : {
                DBAId: "00000000-0000-0000-0000-000000000000",
                DBANm: "",
                DBARef: "",
                Address: {
                  Address1: "",
                  Address2: "",
                  City: "",
                  ProvinceOrState: "",
                  ZipCd: "",
                  Country: "",
                },
              },
        W2Specific: {
          KindOfEmployer: payer.W2Specific?.KindOfEmployer || "",
          KindOfPayer: payer.W2Specific?.KindOfPayer || "",
        },
        Form1042SSpecific: {
          WHAgtCh3Cd: payer.Form1042SSpecific?.WHAgtCh3Cd || "",
          WHAgtCh4Cd: payer.Form1042SSpecific?.WHAgtCh4Cd || "",
          WHAgtGIIN: payer.Form1042SSpecific?.WHAgtGIIN || "",
          FTIN: payer.Form1042SSpecific?.FTIN || "",
          Country: payer.Form1042SSpecific?.Country || "",
        },
        ACASpecific: {
          IsInsurer: payer.ACASpecific?.IsInsurer || false,
          IsGovernmentalUnit: payer.ACASpecific?.IsGovernmentalUnit || false,
        },
        Form480Specific: {
          TaxPayerType: payer.Form480Specific?.TaxPayerType || "",
        },
        SigningAuthority: {
          FirstNm: payer.SigningAuthority?.FirstNm || "",
          MiddleNm: payer.SigningAuthority?.MiddleNm || "",
          LastNm: payer.SigningAuthority?.LastNm || "",
          Suffix: payer.SigningAuthority?.Suffix || "",
          Phone: payer.SigningAuthority?.Phone || "",
          PhoneExtn: payer.SigningAuthority?.PhoneExtn || "",
          BusinessMemberType: payer.SigningAuthority?.BusinessMemberType || "",
        },
      });
    } else {
      // Reset to default
      setFormData({
        SequenceId: "01",
        PayerRef: "",
        IsDefaultBusiness: false,
        TINDetails: {
          Format: "PLAIN_TIN",
          TINType: "EIN",
          TIN: "",
          TINToken: "",
          EncryptedTIN: "",
        },
        IndividualNm: {
          FirstNm: "",
          MiddleNm: "",
          LastNm: "",
          Suffix: "",
        },
        BusinessNm: "",
        NameCtrl: "",
        BusinessType: "",
        Email: "",
        Address: {
          Address1: "",
          Address2: "",
          City: "",
          ProvinceOrState: "",
          ZipCd: "",
          Country: "",
        },
        ContactDetails: {
          FirstNm: "",
          MiddleNm: "",
          LastNm: "",
          Suffix: "",
          Phone: "",
          PhoneExtn: "",
          Email: "",
          Fax: "",
        },
        DBADetails: {
          DBAId: "00000000-0000-0000-0000-000000000000",
          DBANm: "",
          DBARef: "",
          Address: {
            Address1: "",
            Address2: "",
            City: "",
            ProvinceOrState: "",
            ZipCd: "",
            Country: "",
          },
        },
        W2Specific: {
          KindOfEmployer: "",
          KindOfPayer: "",
        },
        Form1042SSpecific: {
          WHAgtCh3Cd: "",
          WHAgtCh4Cd: "",
          WHAgtGIIN: "",
          FTIN: "",
          Country: "",
        },
        ACASpecific: {
          IsInsurer: false,
          IsGovernmentalUnit: false,
        },
        Form480Specific: {
          TaxPayerType: "",
        },
        SigningAuthority: {
          FirstNm: "",
          MiddleNm: "",
          LastNm: "",
          Suffix: "",
          Phone: "",
          PhoneExtn: "",
          BusinessMemberType: "",
        },
      });
    }
  }, [payer, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (
    section: string,
    field: string,
    value: any,
  ) => {
    setFormData((prev: any) => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };

      // Dynamic logic for TINType change
      if (section === "TINDetails" && field === "TINType") {
        const businessTypes = ["EIN", "QI-EIN", "WP-EIN", "WT-EIN", "NQI-EIN"];
        const individualTypes = ["SSN", "ITIN", "IRSN"];

        if (businessTypes.includes(value)) {
          newData.IndividualNm = {
            FirstNm: "",
            MiddleNm: "",
            LastNm: "",
            Suffix: "",
          };
        } else if (individualTypes.includes(value)) {
          newData.IndividualNm = prev.IndividualNm || {
            FirstNm: "",
            MiddleNm: "",
            LastNm: "",
            Suffix: "",
          };
        }
      }

      return newData;
    });
  };

  const handleDeepNestedChange = (
    section: string,
    subSection: string,
    field: string,
    value: any,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value,
        },
      },
    }));
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (toast) {
      // Extend timer for validation errors to allow reading
      const duration =
        toast.type === "error" && validationErrors.length > 0 ? 10000 : 5000;
      const timer = setTimeout(() => {
        setToast(null);
        if (toast.type === "error") setValidationErrors([]);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast, validationErrors.length]);

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Building },
    { id: "address", label: "Address", icon: MapPin },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "dba", label: "DBA Info", icon: Briefcase },
    { id: "signing", label: "Signing Authority", icon: ShieldCheck },
    { id: "tax", label: "Tax Specifics", icon: FileText },
  ];

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowReview(true);
  };

  const confirmSubmit = async () => {
    setIsSaving(true);
    setSaveError(null);
    setValidationErrors([]);

    try {
      // Format payload as requested
      const formattedData = JSON.parse(JSON.stringify(formData));

      // Ensure DBADetails is an object in payload
      if (
        Array.isArray(formattedData.DBADetails) &&
        formattedData.DBADetails.length > 0
      ) {
        formattedData.DBADetails = formattedData.DBADetails[0];
      } else if (Array.isArray(formattedData.DBADetails)) {
        formattedData.DBADetails = null;
      }

      // Ensure BusinessId is present for updates or null for new
      formattedData.BusinessId =
        payer && payer.BusinessId ? payer.BusinessId : null;

      const payload = {
        Businesses: [formattedData],
      };

      let result;
      if (payer) {
        result = await payerService.updatePayer(payload);
      } else {
        result = await payerService.savePayer(payload);
      }

      console.log("Submission result:", result);

      const statusCode = result.Response?.StatusCode;
      if (statusCode && statusCode !== 200 && statusCode !== 201) {
        if (
          statusCode === 400 &&
          result.Response.ErrorBusinesses &&
          result.Response.ErrorBusinesses.length > 0
        ) {
          const errors = result.Response.ErrorBusinesses[0].Errors;
          setValidationErrors(errors);
          setSaveError("Validation failed. Please correct the errors below.");

          // Show first error message in toast
          const firstErrorMessage =
            errors.length > 0 ? errors[0].Message : "Validation failed";
          setToast({ message: firstErrorMessage, type: "error" });
        } else {
          const errorMessage =
            (result.Response as any).Message || "Failed to save payer data.";
          setSaveError(errorMessage);
          setToast({ message: errorMessage, type: "error" });
        }
        setShowReview(false);
        return;
      }

      setToast({
        message: payer
          ? "Payer updated successfully!"
          : "Payer created successfully!",
        type: "success",
      });
      onSave(formData);
      setTimeout(() => {
        onClose();
        setShowReview(false);
      }, 1500);
    } catch (error: any) {
      console.error("Save error details:", error);
      const errorData = error.response?.data || error;

      if (
        errorData?.Response?.StatusCode === 400 &&
        errorData.Response.ErrorBusinesses?.length > 0
      ) {
        const errors = errorData.Response.ErrorBusinesses[0].Errors;
        setValidationErrors(errors);
        setSaveError("Validation failed. Please correct the errors below.");

        const firstErrorMessage =
          errors.length > 0 ? errors[0].Message : "Validation failed";
        setToast({ message: firstErrorMessage, type: "error" });
        setShowReview(false);
      } else {
        const msg =
          error.message || "Failed to save payer data. Please try again.";
        setSaveError(msg);
        setToast({ message: msg, type: "error" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          {/* Offcanvas Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full lg:max-w-[65%] md:max-w-[80%] max-w-full bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-100"
          >
            {/* Review Overlay */}
            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[120] bg-white flex flex-col"
                >
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h2 className="text-sm font-black text-tax-deep-blue uppercase tracking-widest flex items-center gap-2">
                        <Eye size={18} className="text-tax-orange" /> Review
                        Payer Details
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

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                        Identification
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            TIN Type
                          </p>
                          <p className="text-xs font-bold text-slate-800">
                            {formData.TINDetails.TINType}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            TIN Number
                          </p>
                          <p className="text-xs font-bold text-slate-800">
                            {formData.TINDetails.TIN}
                          </p>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            Name
                          </p>
                          <p className="text-xs font-bold text-slate-800">
                            {["SSN", "ITIN", "IRSN"].includes(
                              formData.TINDetails.TINType,
                            ) && formData.IndividualNm
                              ? `${formData.IndividualNm.FirstNm || ""} ${formData.IndividualNm.MiddleNm || ""} ${formData.IndividualNm.LastNm || ""}`.trim() ||
                                formData.BusinessNm
                              : formData.BusinessNm}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                        Business Address
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-xs text-slate-600 leading-relaxed">
                        {formData.Address.Address1},{" "}
                        {formData.Address.Address2 &&
                          formData.Address.Address2 + ", "}
                        {formData.Address.City},{" "}
                        {formData.Address.ProvinceOrState}{" "}
                        {formData.Address.ZipCd}, {formData.Address.Country}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">
                        Primary Contact
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            Contact Person
                          </p>
                          <p className="text-xs font-bold text-slate-800">
                            {formData.ContactDetails.FirstNm}{" "}
                            {formData.ContactDetails.LastNm}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                            Email
                          </p>
                          <p className="text-xs font-bold text-slate-800">
                            {formData.ContactDetails.Email}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-end gap-4 bg-slate-50/50">
                    <button
                      onClick={() => setShowReview(false)}
                      type="button"
                      className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={confirmSubmit}
                      type="button"
                      disabled={isSaving}
                      className="px-8 py-3 bg-tax-deep-blue text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
                    >
                      {isSaving ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Confirm & Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-[150] w-[92%] max-w-[550px]"
                >
                  <div
                    className={`rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border relative overflow-hidden flex flex-col bg-white ${
                      toast.type === "success"
                        ? "border-green-100"
                        : "border-red-100 shadow-red-900/5"
                    }`}
                  >
                    <div
                      className={`p-4 flex items-center justify-between ${
                        toast.type === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {toast.type === "success" ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <X
                            size={18}
                            className="bg-red-500 text-white rounded-full p-0.5"
                          />
                        )}
                        <span className="text-[11px] font-black uppercase tracking-widest leading-none">
                          {toast.type === "error" && validationErrors.length > 0
                            ? `Validation Errors (${validationErrors.length})`
                            : toast.message}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setToast(null);
                          setValidationErrors([]);
                        }}
                        title="Close notification"
                        aria-label="Close notification"
                        className="p-1 hover:bg-black/5 rounded-lg relative z-10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {toast.type === "error" && validationErrors.length > 0 && (
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar border-t border-red-50">
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-red-50/80 backdrop-blur-md z-10">
                            <tr>
                              <th className="px-4 py-2 text-[9px] font-black uppercase text-red-400 tracking-widest border-b border-red-100">
                                ID
                              </th>
                              <th className="px-4 py-2 text-[9px] font-black uppercase text-red-400 tracking-widest border-b border-red-100">
                                Field
                              </th>
                              <th className="px-4 py-2 text-[9px] font-black uppercase text-red-400 tracking-widest border-b border-red-100">
                                Message
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-50">
                            {validationErrors.map((err, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-red-50/30 transition-colors"
                              >
                                <td className="px-4 py-2 text-[9px] font-bold text-red-600 font-mono tracking-tighter whitespace-nowrap">
                                  {err.Id}
                                </td>
                                <td className="px-4 py-2 text-[10px] font-bold text-red-800 whitespace-nowrap">
                                  {err.Name}
                                </td>
                                <td className="px-4 py-2 text-[10px] font-medium text-red-600 leading-tight py-3">
                                  {err.Message}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Progress Bar (only for simple toasts) */}
                    {!(
                      toast.type === "error" && validationErrors.length > 0
                    ) && (
                      <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 5, ease: "linear" }}
                        className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${
                          toast.type === "success"
                            ? "bg-green-500/20"
                            : "bg-red-500/20"
                        }`}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-tax-orange shadow-sm border border-orange-100">
                  {payer ? <Briefcase size={24} /> : <Building size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {payer ? "Edit Payer" : "Add New Payer"}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {payer
                      ? `Editing: ${payer.BusinessNm || (payer.IndividualNm ? `${payer.IndividualNm.FirstNm} ${payer.IndividualNm.LastNm}` : "Payer")}`
                      : "Create a new business record"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                title="Close payer form"
                aria-label="Close payer form"
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="px-8 border-b border-slate-100 bg-slate-50/50 flex scrollbar-hide overflow-x-auto shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative py-5 px-4 flex items-center gap-2 group transition-all shrink-0
                      ${active ? "text-tax-orange" : "text-slate-400 hover:text-slate-600"}
                    `}
                  >
                    <Icon size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {tab.label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="activeTabPayer"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-tax-orange rounded-t-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form
                id="payer-form"
                onSubmit={handleFinalSubmit}
                className="space-y-8 pb-12"
              >
                {activeTab === "basic" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                      <div className="space-y-1.5">
                        <Label>Type of TIN</Label>
                        <select
                          title="TIN type"
                          aria-label="TIN type"
                          value={
                            formData.TINDetails.TINType === "EIN" ||
                            formData.TINDetails.TINType === "SSN"
                              ? formData.TINDetails.TINType
                              : "Others"
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Others") {
                              handleNestedInputChange(
                                "TINDetails",
                                "TINType",
                                "QI-EIN",
                              );
                            } else {
                              handleNestedInputChange(
                                "TINDetails",
                                "TINType",
                                val,
                              );
                            }
                          }}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all outline-none"
                        >
                          <option value="EIN">EIN</option>
                          <option value="SSN">SSN</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>

                      {formData.TINDetails.TINType !== "EIN" &&
                        formData.TINDetails.TINType !== "SSN" && (
                          <div className="space-y-1.5">
                            <Label>Others Type</Label>
                            <select
                              title="Other TIN type"
                              aria-label="Other TIN type"
                              value={formData.TINDetails.TINType}
                              onChange={(e) =>
                                handleNestedInputChange(
                                  "TINDetails",
                                  "TINType",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all outline-none"
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

                      <div className="space-y-1.5">
                        <Label>Payer Reference</Label>
                        <Input
                          placeholder="e.g. SNOW123"
                          value={formData.PayerRef}
                          onChange={(e) =>
                            handleInputChange("PayerRef", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="p-5 bg-orange-50 border border-orange-100 rounded-[24px] space-y-4">
                      <h4 className="text-[10px] font-black text-orange-900 uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} /> Taxpayer Identity (TIN)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>TIN Format</Label>
                          <select
                            title="TIN format"
                            aria-label="TIN format"
                            value={formData.TINDetails.Format}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "TINDetails",
                                "Format",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2.5 bg-white border border-orange-100 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="PLAIN_TIN">Plain TIN</option>
                            <option value="ENCRYPTED">Encrypted</option>
                            <option value="TOKEN">Tokenized</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>TIN Value</Label>
                          <Input
                            className="bg-white border-orange-100 placeholder:text-orange-200"
                            placeholder="XX-XXXXXXX"
                            value={formData.TINDetails.TIN}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "TINDetails",
                                "TIN",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      {formData.TINDetails.Format === "TOKEN" && (
                        <div className="space-y-1.5">
                          <Label>TIN Token</Label>
                          <Input
                            value={formData.TINDetails.TINToken}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "TINDetails",
                                "TINToken",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {["SSN", "ITIN", "IRSN"].includes(
                        formData.TINDetails.TINType,
                      ) && formData.IndividualNm ? (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                            Individual Name Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label>First Name</Label>
                              <Input
                                placeholder="First Name"
                                value={formData.IndividualNm.FirstNm || ""}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "IndividualNm",
                                    "FirstNm",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Last Name</Label>
                              <Input
                                placeholder="Last Name"
                                value={formData.IndividualNm.LastNm || ""}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "IndividualNm",
                                    "LastNm",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Middle Initial</Label>
                              <Input
                                placeholder="M"
                                maxLength={1}
                                value={formData.IndividualNm.MiddleNm || ""}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "IndividualNm",
                                    "MiddleNm",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Suffix</Label>
                              <select
                                title="Suffix"
                                aria-label="Suffix"
                                value={formData.IndividualNm.Suffix || ""}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "IndividualNm",
                                    "Suffix",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                              >
                                <option value="">Select Suffix</option>
                                {SUFFIXES.map((item) => (
                                  <option key={item.value} value={item.value}>
                                    {item.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-2 space-y-1.5">
                              <Label>DBA/Trade Name (Optional)</Label>
                              <Input
                                placeholder="Trade Name"
                                value={formData.DBADetails.DBANm}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "DBADetails",
                                    "DBANm",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                            Business Legal Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                              <Label>Payer Name</Label>
                              <Input
                                placeholder="Legal Entity Name"
                                value={formData.BusinessNm}
                                onChange={(e) =>
                                  handleInputChange(
                                    "BusinessNm",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                              <Label>DBA/Trade Name (Optional)</Label>
                              <Input
                                placeholder="Trade Name"
                                value={formData.DBADetails.DBANm}
                                onChange={(e) =>
                                  handleNestedInputChange(
                                    "DBADetails",
                                    "DBANm",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label>Name Control</Label>
                            <Input
                              placeholder="e.g. SNOW"
                              value={formData.NameCtrl}
                              onChange={(e) =>
                                handleInputChange("NameCtrl", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Business Type</Label>
                            <select
                              title="Business type"
                              aria-label="Business type"
                              value={formData.BusinessType}
                              onChange={(e) =>
                                handleInputChange(
                                  "BusinessType",
                                  e.target.value,
                                )
                              }
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            >
                              <option value="">Select Business Type</option>
                              {BUSINESS_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <Label>Payer Email</Label>
                            <Input
                              type="email"
                              placeholder="admin@business.com"
                              value={formData.Email}
                              onChange={(e) =>
                                handleInputChange("Email", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="relative">
                          <input
                            type="checkbox"
                            title="Set as default business"
                            aria-label="Set as default business"
                            className="peer sr-only"
                            checked={formData.IsDefaultBusiness}
                            onChange={(e) =>
                              handleInputChange(
                                "IsDefaultBusiness",
                                e.target.checked,
                              )
                            }
                            id="is-default-payer"
                          />
                          <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-tax-orange transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        </div>
                        <label
                          htmlFor="is-default-payer"
                          className="text-xs font-bold text-slate-600 cursor-pointer"
                        >
                          Set as Default Business
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "address" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <MapPin size={16} className="text-tax-orange" /> Main
                      Address
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      <div className="col-span-2 space-y-1.5">
                        <Label>Street Address</Label>
                        <Input
                          placeholder="Line 1"
                          value={formData.Address.Address1}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "Address",
                              "Address1",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label>Apartment/Suite</Label>
                        <Input
                          placeholder="Line 2"
                          value={formData.Address.Address2}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "Address",
                              "Address2",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>City</Label>
                        <Input
                          placeholder="City"
                          value={formData.Address.City}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "Address",
                              "City",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Country</Label>
                        <select
                          title="Country"
                          aria-label="Country"
                          value={formData.Address.Country}
                          onChange={(e) => {
                            handleNestedInputChange(
                              "Address",
                              "Country",
                              e.target.value,
                            );
                            handleNestedInputChange(
                              "Address",
                              "ProvinceOrState",
                              "",
                            );
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                        >
                          <option value="">Select Country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>State / Province</Label>
                        {formData.Address.Country === "US" ||
                        !formData.Address.Country ? (
                          <select
                            title="State"
                            aria-label="State"
                            value={formData.Address.ProvinceOrState}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Address",
                                "ProvinceOrState",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                          >
                            <option value="">Select State</option>
                            {US_STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : formData.Address.Country === "CA" ? (
                          <select
                            title="Province"
                            aria-label="Province"
                            value={formData.Address.ProvinceOrState}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Address",
                                "ProvinceOrState",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                          >
                            <option value="">Select Province</option>
                            {CANADA_PROVINCES.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            placeholder="State/Province"
                            value={formData.Address.ProvinceOrState}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Address",
                                "ProvinceOrState",
                                e.target.value,
                              )
                            }
                          />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Zip Code</Label>
                        <Input
                          placeholder="29730"
                          value={formData.Address.ZipCd}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "Address",
                              "ZipCd",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "contact" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Mail size={16} className="text-tax-orange" /> Primary
                      Contact
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      <div className="space-y-1.5">
                        <Label>First Name</Label>
                        <Input
                          placeholder="First Name"
                          value={formData.ContactDetails.FirstNm}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "FirstNm",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Last Name</Label>
                        <Input
                          placeholder="Last Name"
                          value={formData.ContactDetails.LastNm}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "LastNm",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Middle Name</Label>
                        <Input
                          placeholder="Middle Name"
                          value={formData.ContactDetails.MiddleNm}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "MiddleNm",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Suffix</Label>
                        <select
                          title="Suffix"
                          aria-label="Suffix"
                          value={formData.ContactDetails.Suffix || ""}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "Suffix",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="">Select Suffix</option>
                          {SUFFIXES.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 lg:col-span-2 space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          placeholder="Phone (10 digits)"
                          value={formData.ContactDetails.Phone}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "Phone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1 space-y-1.5">
                        <Label>Extension</Label>
                        <Input
                          placeholder="Extn"
                          value={formData.ContactDetails.PhoneExtn}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "PhoneExtn",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1 space-y-1.5 text-transparent select-none hidden lg:block">
                        .
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label>Fax Number</Label>
                        <Input
                          placeholder="Fax Number"
                          value={formData.ContactDetails.Fax}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "Fax",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label>Primary Email</Label>
                        <Input
                          placeholder="Primary Email"
                          value={formData.ContactDetails.Email}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "ContactDetails",
                              "Email",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "dba" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Briefcase size={16} className="text-tax-orange" /> Trade
                      Name (DBA)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>DBA Name</Label>
                        <Input
                          placeholder="Iceberg Icecreams"
                          value={formData.DBADetails.DBANm}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "DBADetails",
                              "DBANm",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>DBA Reference</Label>
                        <Input
                          placeholder="DBA1001"
                          value={formData.DBADetails.DBARef}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "DBADetails",
                              "DBARef",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100">
                        <Label>DBA Address</Label>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                          <div className="col-span-2 space-y-1.5">
                            <Label>Address Line 1</Label>
                            <Input
                              placeholder="Address Line 1"
                              value={formData.DBADetails.Address.Address1}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  "DBADetails",
                                  "Address",
                                  "Address1",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="col-span-2 space-y-1.5">
                            <Label>Address Line 2</Label>
                            <Input
                              placeholder="Address Line 2"
                              value={formData.DBADetails.Address.Address2}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  "DBADetails",
                                  "Address",
                                  "Address2",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>City</Label>
                            <Input
                              placeholder="City"
                              value={formData.DBADetails.Address.City}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  "DBADetails",
                                  "Address",
                                  "City",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Country</Label>
                            <select
                              title="Country"
                              aria-label="Country"
                              value={formData.DBADetails.Address.Country}
                              onChange={(e) => {
                                handleDeepNestedChange(
                                  "DBADetails",
                                  "Address",
                                  "Country",
                                  e.target.value,
                                );
                                handleDeepNestedChange(
                                  "DBADetails",
                                  "Address",
                                  "ProvinceOrState",
                                  "",
                                );
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                            >
                               <option value="">Select Country</option>
                              {COUNTRIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label>State / Province</Label>
                            {formData.DBADetails.Address.Country === "US" ||
                            !formData.DBADetails.Address.Country ? (
                              <select
                                title="State"
                                aria-label="State"
                                value={
                                  formData.DBADetails.Address.ProvinceOrState
                                }
                                onChange={(e) =>
                                  handleDeepNestedChange(
                                    "DBADetails",
                                    "Address",
                                    "ProvinceOrState",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                              >
                                <option value="">Select State</option>
                                {US_STATES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            ) : formData.DBADetails.Address.Country === "CA" ? (
                              <select
                                title="Province"
                                aria-label="Province"
                                value={
                                  formData.DBADetails.Address.ProvinceOrState
                                }
                                onChange={(e) =>
                                  handleDeepNestedChange(
                                    "DBADetails",
                                    "Address",
                                    "ProvinceOrState",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                              >
                                <option value="">Select Province</option>
                                {CANADA_PROVINCES.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                placeholder="State/Province"
                                value={
                                  formData.DBADetails.Address.ProvinceOrState
                                }
                                onChange={(e) =>
                                  handleDeepNestedChange(
                                    "DBADetails",
                                    "Address",
                                    "ProvinceOrState",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <Label>Zip Code</Label>
                            <Input
                              placeholder="Zip Code"
                              value={formData.DBADetails.Address.ZipCd}
                              onChange={(e) =>
                                handleDeepNestedChange(
                                  "DBADetails",
                                  "Address",
                                  "ZipCd",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "signing" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-tax-orange" />{" "}
                      Signing Authority
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                      <div className="space-y-1.5">
                        <Label>First Name</Label>
                        <Input
                          placeholder="First Name"
                          value={formData.SigningAuthority.FirstNm}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "SigningAuthority",
                              "FirstNm",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Last Name</Label>
                        <Input
                          placeholder="Last Name"
                          value={formData.SigningAuthority.LastNm}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "SigningAuthority",
                              "LastNm",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Middle Name</Label>
                        <Input
                          placeholder="Middle Name"
                          value={formData.SigningAuthority.MiddleNm}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "SigningAuthority",
                              "MiddleNm",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Suffix</Label>
                        <select
                          title="Suffix"
                          aria-label="Suffix"
                          value={formData.SigningAuthority.Suffix || ""}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "SigningAuthority",
                              "Suffix",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="">Select Suffix</option>
                          {SUFFIXES.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 lg:col-span-2 space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          placeholder="Phone"
                          value={formData.SigningAuthority.Phone}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "SigningAuthority",
                              "Phone",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="col-span-1 space-y-1.5">
                        <Label>Phone Extension</Label>
                        <Input
                          placeholder="Phone Extn"
                          value={formData.SigningAuthority.PhoneExtn}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "SigningAuthority",
                              "PhoneExtn",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="lg:block hidden col-span-1" />
                      <div className="col-span-2 space-y-1.5">
                        <Label>Member Type</Label>
                        <select
                          title="Member type"
                          aria-label="Member type"
                          value={formData.SigningAuthority.BusinessMemberType}
                          onChange={(e) =>
                            handleNestedInputChange(
                              "SigningAuthority",
                              "BusinessMemberType",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                        >
                          <option value="">Select Member Type</option>
                          {formData.BusinessType &&
                          BUSINESS_MEMBER_TYPES[formData.BusinessType] ? (
                            BUSINESS_MEMBER_TYPES[formData.BusinessType].map(
                              (member) => (
                                <option key={member} value={member}>
                                  {member}
                                </option>
                              ),
                            )
                          ) : (
                            <>
                              <option value="ManagingMember">
                                Managing Member
                              </option>
                              <option value="Partner">Partner</option>
                              <option value="Officer">Officer</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "tax" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                        W-2 Specifics
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Kind of Employer</Label>
                          <select
                            title="Kind of employer"
                            aria-label="Kind of employer"
                            value={formData.W2Specific.KindOfEmployer}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "W2Specific",
                                "KindOfEmployer",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="">Select Kind of Employer</option>
                            {KIND_OF_EMPLOYER.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Kind of Payer</Label>
                          <select
                            title="Kind of payer"
                            aria-label="Kind of payer"
                            value={formData.W2Specific.KindOfPayer}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "W2Specific",
                                "KindOfPayer",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="">Select Kind of Payer</option>
                            {KIND_OF_PAYER.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                        ACA Specifics
                      </h4>
                      <div className="flex gap-8">
                        <Checkbox
                          label="Is Insurer"
                          checked={formData.ACASpecific.IsInsurer}
                          onChange={(val) =>
                            handleNestedInputChange(
                              "ACASpecific",
                              "IsInsurer",
                              val,
                            )
                          }
                        />
                        <Checkbox
                          label="Is Govt Unit"
                          checked={formData.ACASpecific.IsGovernmentalUnit}
                          onChange={(val) =>
                            handleNestedInputChange(
                              "ACASpecific",
                              "IsGovernmentalUnit",
                              val,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                        1042-S Details
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <div className="space-y-1.5">
                          <Label>Chapter 3 Code</Label>
                          <select
                            title="Chapter 3 code"
                            aria-label="Chapter 3 code"
                            value={formData.Form1042SSpecific.WHAgtCh3Cd}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Form1042SSpecific",
                                "WHAgtCh3Cd",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="">Select Ch3 Code</option>
                            {CHAPTER_3_CODES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Chapter 4 Code</Label>
                          <select
                            title="Chapter 4 code"
                            aria-label="Chapter 4 code"
                            value={formData.Form1042SSpecific.WHAgtCh4Cd}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Form1042SSpecific",
                                "WHAgtCh4Cd",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="">Select Ch4 Code</option>
                            {CHAPTER_4_CODES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Agent GIIN</Label>
                          <Input
                            placeholder="Agent GIIN"
                            value={formData.Form1042SSpecific.WHAgtGIIN}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Form1042SSpecific",
                                "WHAgtGIIN",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Foreign TIN (FTIN)</Label>
                          <Input
                            placeholder="Foreign TIN (FTIN)"
                            value={formData.Form1042SSpecific.FTIN}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Form1042SSpecific",
                                "FTIN",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="col-span-2 space-y-1.5">
                          <Label>Country Code</Label>
                          <select
                            title="Country code"
                            aria-label="Country code"
                            value={formData.Form1042SSpecific.Country}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Form1042SSpecific",
                                "Country",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="">Select Country</option>
                            {COUNTRIES.map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                        Form 480 Details
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label>Tax Payer Type</Label>
                          <Input
                            placeholder="Tax Payer Type"
                            value={formData.Form480Specific.TaxPayerType}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "Form480Specific",
                                "TaxPayerType",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 flex flex-col gap-4 bg-slate-50/50 shrink-0">
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-500 flex items-center gap-2">
                  <X
                    size={14}
                    className="bg-red-500 text-white rounded-full p-0.5"
                  />
                  {saveError}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2
                    size={16}
                    className={
                      isSaving
                        ? "text-slate-200 animate-pulse"
                        : "text-green-500"
                    }
                  />
                  <span className="text-[10px] font-bold">
                    {isSaving ? "Processing..." : "Ready to save"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={onClose}
                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="payer-form"
                    disabled={isSaving}
                    className={`
                      px-8 py-3 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50
                      ${isSaving ? "bg-slate-400 shadow-none" : "bg-tax-orange hover:bg-orange-600 shadow-orange-500/20"}
                    `}
                  >
                    {isSaving ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {payer ? "Update Payer" : "Save Payer"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
      {children}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      title={props.title ?? props["aria-label"] ?? props.placeholder}
      className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-200 ${props.className}`}
    />
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        title={label}
        aria-label={label}
        className="w-5 h-5 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
        {label}
      </span>
    </label>
  );
}
