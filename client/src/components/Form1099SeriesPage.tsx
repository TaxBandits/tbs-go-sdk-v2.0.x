import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CreateForm1099Wizard, {
  type CreateForm1099Data,
  type Form1099MiscBoxData,
  type Form1099NecBoxData,
} from "./CreateForm1099Wizard";
import { form1099MiscService } from "../services/form1099MiscService";
import Form1099ActionsCell from "./Form1099ActionsCell";
import Form1099StatusModal from "./Form1099StatusModal";
import Form1099DraftPdfModal from "./Form1099DraftPdfModal";
import Form1099PdfUrlsModal from "./Form1099PdfUrlsModal";
import Form1099ErrorsModal, {
  type Form1099ErrorItem,
} from "./Form1099ErrorsModal";
import Form1099TransmitModal from "./Form1099TransmitModal";
import Form1099NecViewModal from "./Form1099NecViewModal";
import Form1099SuccessModal from "./Form1099SuccessModal";
import Form1099StatusLogModal from "./Form1099StatusLogModal";
import {
  form1099UtilityService,
  type Form1099UtilityListRecords,
} from "../services/form1099UtilityService";
import { form1099NecService } from "../services/form1099NecService";
import { payerService } from "../services/payerService";
import { recipientService } from "../services/recipientService";
import { BusinessListEntry, RecipientListEntry } from "../types";

const FORM_TYPES: Array<{ value: string; label: string }> = [
  { value: "FORM1099NEC", label: "Form1099NEC" },
  { value: "FORM1099MISC", label: "FORM1099MISC" },
];

const EMPTY_NEC_FORM_DATA: Form1099NecBoxData = {
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

const EMPTY_MISC_FORM_DATA: Form1099MiscBoxData = {
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

function extractForm1099NecErrors(payload: any): Form1099ErrorItem[] {
  if (!payload) return [];
  const errors: Form1099ErrorItem[] = [...(payload.Errors || [])];
  const errorRecords = payload.Form1099Records?.ErrorRecords || [];
  for (const record of errorRecords) {
    for (const err of record.Errors || []) {
      errors.push(err);
    }
  }
  return errors;
}

function mapNecRecordToWizardData(
  record: any,
  fallbackFormType: string,
  submissionId?: string,
): CreateForm1099Data | null {
  const returnData = record?.ReturnData?.[0];
  if (!returnData) return null;

  const submission = record.SubmissionManifest;
  const business = record.ReturnHeader?.Business;
  const recipient = returnData.Recipient;
  const manifest = returnData.ReturnManifest;
  const nec = returnData.NECFormData;

  const distributionType = manifest?.DistributionDetails?.DistributionType;

  return {
    FormType: fallbackFormType,
    BusinessId: business?.BusinessId ?? "",
    RecipientId: recipient?.RecipientId ?? "",
    TaxYear: submission?.TaxYear ?? "",
    SequenceId: returnData.SequenceId ?? "1",
    RecordId: returnData.RecordId,
    SubmissionId: submissionId,
    IsScheduleFiling: submission?.IsScheduleFiling ?? false,
    ScheduleEfileDate: submission?.ScheduleFiling?.EfileDate ?? "",
    ReturnManifest: {
      IsFederalFiling: manifest?.IsFederal ?? true,
      IsStateFiling: manifest?.IsState ?? false,
      IsDistributionRequired: manifest?.IsDistribution ?? false,
      DistributionType: distributionType ?? "POSTAL_AND_ONLINE",
      PostalServiceType:
        manifest?.DistributionDetails?.PostalType ?? "USPS_FIRST_CLASS",
      IsForcedTransmission: manifest?.IsForced ?? false,
    },
    NECFormData: {
      B1NEC: nec?.NEC !== undefined ? String(nec.NEC) : "",
      CashTips: nec?.CashTips !== undefined ? String(nec.CashTips) : "",
      TTOC1: nec?.TTOC1 ?? "",
      TTOC2: nec?.TTOC2 ?? "",
      OvertimeComp:
        nec?.OvertimeComp !== undefined ? String(nec.OvertimeComp) : "",
      EPP: nec?.EPP !== undefined ? String(nec.EPP) : "",
      B2IsDirectSales: nec?.IsDirectSales ?? false,
      B4FedTaxWH: nec?.FedTaxWH !== undefined ? String(nec.FedTaxWH) : "",
      Is2ndTINnot: nec?.Is2ndTINnot ?? false,
      AccountNum: nec?.AccountNum ?? "",
      States: (nec?.States ?? []).map((s: any) => ({
        StateCd: s?.StateCd ?? "",
        StateIdNum: s?.StateIdNum ?? "",
        StateIncome: s?.StateIncome !== undefined ? String(s.StateIncome) : "",
        StateWH: s?.StateWH !== undefined ? String(s.StateWH) : "",
      })),
    },
    MISCFormData: EMPTY_MISC_FORM_DATA,
  };
}

function mapMiscRecordToWizardData(
  record: any,
  fallbackFormType: string,
  submissionId?: string,
): CreateForm1099Data | null {
  const returnData = record?.ReturnData?.[0];
  if (!returnData) return null;

  const submission = record.SubmissionManifest;
  const business = record.ReturnHeader?.Business;
  const recipient = returnData.Recipient;
  const manifest = returnData.ReturnManifest;
  const misc = returnData.MISCFormData;

  const distributionType = manifest?.DistributionDetails?.DistributionType;

  return {
    FormType: fallbackFormType,
    BusinessId: business?.BusinessId ?? "",
    RecipientId: recipient?.RecipientId ?? "",
    TaxYear: submission?.TaxYear ?? "",
    SequenceId: returnData.SequenceId ?? "1",
    RecordId: returnData.RecordId,
    SubmissionId: submissionId,
    IsScheduleFiling: submission?.IsScheduleFiling ?? false,
    ScheduleEfileDate: submission?.ScheduleFiling?.EfileDate ?? "",
    ReturnManifest: {
      IsFederalFiling: manifest?.IsFederal ?? true,
      IsStateFiling: manifest?.IsState ?? false,
      IsDistributionRequired: manifest?.IsDistribution ?? false,
      DistributionType: distributionType ?? "POSTAL_AND_ONLINE",
      PostalServiceType:
        manifest?.DistributionDetails?.PostalType ?? "USPS_FIRST_CLASS",
      IsForcedTransmission: manifest?.IsForced ?? false,
    },
    NECFormData: EMPTY_NEC_FORM_DATA,
    MISCFormData: {
      Rents: misc?.Rents !== undefined ? String(misc.Rents) : "",
      Royalties: misc?.Royalties !== undefined ? String(misc.Royalties) : "",
      OtherIncome:
        misc?.OtherIncome !== undefined ? String(misc.OtherIncome) : "",
      FedIncomeTaxWH:
        misc?.FedIncomeTaxWH !== undefined ? String(misc.FedIncomeTaxWH) : "",
      FishingBoatProceeds:
        misc?.FishingBoatProceeds !== undefined
          ? String(misc.FishingBoatProceeds)
          : "",
      MedHealthcarePymts:
        misc?.MedHealthcarePymts !== undefined
          ? String(misc.MedHealthcarePymts)
          : "",
      IsDirectSale: misc?.IsDirectSale ?? false,
      SubstitutePymts:
        misc?.SubstitutePymts !== undefined ? String(misc.SubstitutePymts) : "",
      CropInsurance:
        misc?.CropInsurance !== undefined ? String(misc.CropInsurance) : "",
      GrossProceeds:
        misc?.GrossProceeds !== undefined ? String(misc.GrossProceeds) : "",
      FishPurForResale:
        misc?.FishPurForResale !== undefined
          ? String(misc.FishPurForResale)
          : "",
      Sec409ADeferrals:
        misc?.Sec409ADeferrals !== undefined
          ? String(misc.Sec409ADeferrals)
          : "",
      CashTips: misc?.CashTips !== undefined ? String(misc.CashTips) : "",
      TTOC1: misc?.TTOC1 ?? "",
      TTOC2: misc?.TTOC2 ?? "",
      OvertimeComp:
        misc?.OvertimeComp !== undefined ? String(misc.OvertimeComp) : "",
      IsFATCA: misc?.IsFATCA ?? false,
      EPP: misc?.EPP !== undefined ? String(misc.EPP) : "",
      NonQualDefComp:
        misc?.NonQualDefComp !== undefined ? String(misc.NonQualDefComp) : "",
      AccountNum: misc?.AccountNum ?? "",
      Is2ndTINnot: misc?.Is2ndTINnot ?? false,
      States: (misc?.States ?? []).map((s: any) => ({
        StateCd: s?.StateCd ?? "",
        StateIdNum: s?.StateIdNum ?? "",
        StateIncome: s?.StateIncome !== undefined ? String(s.StateIncome) : "",
        StateWH: s?.StateWH !== undefined ? String(s.StateWH) : "",
      })),
    },
  };
}

function buildNecRequestBody(
  data: CreateForm1099Data,
  business: BusinessListEntry,
  recipient: RecipientListEntry,
) {
  const normalizedBusiness = {
    ...business,
    TINDetails: business.TINDetails?.Format ? business.TINDetails : null,
  };
  const normalizedRecipient = {
    ...recipient,
    TINDetails: recipient.TINDetails?.Format ? recipient.TINDetails : null,
  };

  const nec = data.NECFormData;
  const manifest = data.ReturnManifest;
  const validStates = nec.States.filter((s) => !!s.StateCd);
  const hasState = validStates.length > 0;

  return {
    SubmissionManifest: {
      SubmissionId: data.SubmissionId,
      TaxYear: data.TaxYear,
      IsScheduleFiling: data.IsScheduleFiling,
      ScheduleFiling: data.IsScheduleFiling
        ? { EfileDate: data.ScheduleEfileDate || null }
        : undefined,
    },
    ReturnHeader: { Business: normalizedBusiness },
    ReturnData: [
      {
        SequenceId: data.SequenceId,
        RecordId: data.RecordId,
        Recipient: normalizedRecipient,
        ReturnManifest: {
          IsFederal: manifest.IsFederalFiling,
          IsState: manifest.IsStateFiling && hasState,
          IsPostal:
            manifest.IsDistributionRequired &&
            manifest.DistributionType !== "ONLINE_ACCESS",
          IsDistribution: manifest.IsDistributionRequired,
          IsForced: manifest.IsForcedTransmission,
          DistributionDetails: manifest.IsDistributionRequired
            ? {
                DistributionType: manifest.DistributionType,
                PostalType: manifest.PostalServiceType,
              }
            : undefined,
        },
        NECFormData: {
          NEC: Number(nec.B1NEC) || 0,
          CashTips: Number(nec.CashTips) || 0,
          TTOC1: nec.TTOC1 || undefined,
          TTOC2: nec.TTOC2 || undefined,
          OvertimeComp: Number(nec.OvertimeComp) || 0,
          EPP: Number(nec.EPP) || 0,
          IsDirectSales: nec.B2IsDirectSales,
          FedTaxWH: Number(nec.B4FedTaxWH) || 0,
          Is2ndTINnot: nec.Is2ndTINnot,
          AccountNum: nec.AccountNum || undefined,
          States: hasState
            ? validStates.map((s) => ({
                StateCd: s.StateCd,
                StateIdNum: s.StateIdNum || undefined,
                StateIncome: Number(s.StateIncome) || 0,
                StateWH: Number(s.StateWH) || 0,
              }))
            : undefined,
        },
      },
    ],
  };
}

function buildMiscRequestBody(
  data: CreateForm1099Data,
  business: BusinessListEntry,
  recipient: RecipientListEntry,
) {
  const normalizedBusiness = {
    ...business,
    TINDetails: business.TINDetails?.Format ? business.TINDetails : null,
  };
  const normalizedRecipient = {
    ...recipient,
    TINDetails: recipient.TINDetails?.Format ? recipient.TINDetails : null,
  };

  const misc = data.MISCFormData;
  const manifest = data.ReturnManifest;
  const validStates = misc.States.filter((s) => !!s.StateCd);
  const hasState = validStates.length > 0;

  return {
    SubmissionManifest: {
      SubmissionId: data.SubmissionId,
      TaxYear: data.TaxYear,
      IsScheduleFiling: data.IsScheduleFiling,
      ScheduleFiling: data.IsScheduleFiling
        ? { EfileDate: data.ScheduleEfileDate || null }
        : undefined,
    },
    ReturnHeader: { Business: normalizedBusiness },
    ReturnData: [
      {
        SequenceId: data.SequenceId,
        RecordId: data.RecordId,
        Recipient: normalizedRecipient,
        ReturnManifest: {
          IsFederal: manifest.IsFederalFiling,
          IsState: manifest.IsStateFiling && hasState,
          IsPostal:
            manifest.IsDistributionRequired &&
            manifest.DistributionType !== "ONLINE_ACCESS",
          IsDistribution: manifest.IsDistributionRequired,
          IsForced: manifest.IsForcedTransmission,
          DistributionDetails: manifest.IsDistributionRequired
            ? {
                DistributionType: manifest.DistributionType,
                PostalType: manifest.PostalServiceType,
              }
            : undefined,
        },
        MISCFormData: {
          Rents: Number(misc.Rents) || 0,
          Royalties: Number(misc.Royalties) || 0,
          OtherIncome: Number(misc.OtherIncome) || 0,
          FedIncomeTaxWH: Number(misc.FedIncomeTaxWH) || 0,
          FishingBoatProceeds: Number(misc.FishingBoatProceeds) || 0,
          MedHealthcarePymts: Number(misc.MedHealthcarePymts) || 0,
          IsDirectSale: misc.IsDirectSale,
          SubstitutePymts: Number(misc.SubstitutePymts) || 0,
          CropInsurance: Number(misc.CropInsurance) || 0,
          GrossProceeds: Number(misc.GrossProceeds) || 0,
          FishPurForResale: Number(misc.FishPurForResale) || 0,
          Sec409ADeferrals: Number(misc.Sec409ADeferrals) || 0,
          CashTips: Number(misc.CashTips) || 0,
          TTOC1: misc.TTOC1 || undefined,
          TTOC2: misc.TTOC2 || undefined,
          OvertimeComp: Number(misc.OvertimeComp) || 0,
          IsFATCA: misc.IsFATCA,
          EPP: Number(misc.EPP) || 0,
          NonQualDefComp: Number(misc.NonQualDefComp) || 0,
          AccountNum: misc.AccountNum || undefined,
          Is2ndTINnot: misc.Is2ndTINnot,
          States: hasState
            ? validStates.map((s) => ({
                StateCd: s.StateCd,
                StateIdNum: s.StateIdNum || undefined,
                StateIncome: Number(s.StateIncome) || 0,
                StateWH: Number(s.StateWH) || 0,
              }))
            : undefined,
        },
      },
    ],
  };
}

function extractDelete1099W2Errors(payload: any): Form1099ErrorItem[] {
  if (!payload) return [];
  const errors: Form1099ErrorItem[] = [...(payload.Errors || [])];
  errors.push(...(payload.Form1099Records?.ErrorRecords || []));
  errors.push(...(payload.FormW2Records?.ErrorRecords || []));
  return errors;
}

const TAX_YEARS = ["2026", "2025", "2024", "2023"];

// Federal/State/Online Access/Postal statuses come back from the TaxBandits
// API as free-form strings (no fixed enum). These are the values commonly
// observed; the filter still works against whatever string is present.
const FEDERAL_STATUSES = [
  "CREATED",
  "TRANSMITTED",
  "SENT_TO_AGENCY",
  "ACCEPTED",
  "ACCEPTED_WITH_ERRORS",
  "REJECTED",
];

const STATE_STATUSES = [
  "CREATED",
  "TRANSMITTED",
  "SENT_TO_AGENCY",
  "ACCEPTED",
  "REJECTED",
];

function statusBadgeClasses(status: string): string {
  const s = status.toUpperCase();
  if (
    [
      "TRANSMITTED",
      "MAILED",
      "ACCEPTED",
      "VIEWED",
      "SENT_TO_AGENCY",
      "VIEWED_FORM",
      "DOWNLOADED_FORM",
      "ASSUMED_DELIVERED",
    ].includes(s)
  ) {
    return "bg-green-50 text-green-700 border-green-100";
  }
  if (
    [
      "SCHEDULED",
      "REQUESTED",
      "ORDER_RECEIVED",
      "EMAIL_SENT",
      "POSTAL_INITIATED",
      "HANDEDOVER_TO_USPS",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "RE_ROUTED",
      "INTERNATIONAL_EXIT",
    ].includes(s)
  ) {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }
  if (["REJECTED", "ACCEPTED_WITH_ERRORS"].includes(s)) {
    return "bg-red-50 text-red-700 border-red-100";
  }
  if (["CREATED", "NOT_SCHEDULED", "NOT_REQUESTED"].includes(s)) {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  return "bg-slate-100 text-slate-500 border-slate-200";
}

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-slate-300 text-xs">-</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${statusBadgeClasses(status)}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
        {label}
      </label>
      <select
        title={label}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-tax-orange transition-colors appearance-none cursor-pointer"
      >
        {!required && <option value="">{`All ${label}`}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Form1099SeriesPage() {
  const [search, setSearch] = useState("");
  const [taxYear, setTaxYear] = useState("2026");
  const [formType, setFormType] = useState("FORM1099NEC");
  const [businessId, setBusinessId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [federalStatus, setFederalStatus] = useState("");
  const [stateStatus, setStateStatus] = useState("");
  const [onlineAccessStatus, setOnlineAccessStatus] = useState("");
  const [postalMailingStatus, setPostalMailingStatus] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddReturn, setShowAddReturn] = useState(false);
  const [isCreatingReturn, setIsCreatingReturn] = useState(false);
  const [isValidatingReturn, setIsValidatingReturn] = useState(false);
  const [editData, setEditData] = useState<CreateForm1099Data | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [updateSuccessInfo, setUpdateSuccessInfo] = useState<string | null>(
    null,
  );
  const [statusRecord, setStatusRecord] =
    useState<Form1099UtilityListRecords | null>(null);
  const [draftPdfRecord, setDraftPdfRecord] =
    useState<Form1099UtilityListRecords | null>(null);
  const [pdfUrlsRecord, setPdfUrlsRecord] =
    useState<Form1099UtilityListRecords | null>(null);
  const [transmitRecord, setTransmitRecord] =
    useState<Form1099UtilityListRecords | null>(null);
  const [viewRecord, setViewRecord] =
    useState<Form1099UtilityListRecords | null>(null);
  const [statusLogRecord, setStatusLogRecord] =
    useState<Form1099UtilityListRecords | null>(null);
  const [createErrors, setCreateErrors] = useState<Form1099ErrorItem[] | null>(
    null,
  );

  const [businesses, setBusinesses] = useState<BusinessListEntry[]>([]);
  const [recipients, setRecipients] = useState<RecipientListEntry[]>([]);
  const [businessesLoaded, setBusinessesLoaded] = useState(false);

  const [records, setRecords] = useState<Form1099UtilityListRecords[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Business (Payer) and Recipient (Payee) dropdown options from the
  // real address book APIs.
  useEffect(() => {
    payerService
      .getBusinesses({ page: 1, pagesize: 100 })
      .then((res) => {
        const list = res.Response.Businesses || [];
        setBusinesses(list);
        if (list.length > 0) {
          setBusinessId((prev) => {
            if (prev) return prev;
            setCurrentPage(1);
            runList(1, list[0].BusinessId);
            return list[0].BusinessId;
          });
        }
      })
      .catch(() => setBusinesses([]))
      .finally(() => setBusinessesLoaded(true));

    recipientService
      .getRecipients({ page: 1, pagesize: 100 })
      .then((res) => setRecipients(res.Response.Recipient || []))
      .catch(() => setRecipients([]));
  }, []);

  const runList = (page: number = currentPage, overrideBusinessId?: string) => {
    setIsLoading(true);
    setLoadError(null);

    const effectiveBusinessId = overrideBusinessId ?? businessId;

    const requestBody = {
      TaxYear: taxYear || "2026",
      FormTypes: formType ? [formType] : ["FORM1099NEC"],
      Business: effectiveBusinessId
        ? { BusinessId: effectiveBusinessId }
        : null,
      Recipient: recipientId ? { RecipientId: recipientId } : null,
      SubmissionId: null,
      FederalStatus: federalStatus ? [federalStatus] : [],
      State: stateStatus ? { Status: [stateStatus] } : null,
      Distribution:
        onlineAccessStatus || postalMailingStatus
          ? {
              OAStatus: onlineAccessStatus ? [onlineAccessStatus] : undefined,
              PostalStatus: postalMailingStatus
                ? [postalMailingStatus]
                : undefined,
            }
          : null,
      FromDate: null,
      ToDate: null,
      Page: page,
      PageSize: pageSize,
      Employee: null,
    };

    console.log("POST /form1099utility/list — request body:", requestBody);

    form1099UtilityService
      .list(requestBody)
      .then((res) => {
        console.log("POST /form1099utility/list — response body:", res);
        const data = res.Response;
        const combined = [
          ...(data.Form1099Records || []),
          ...(data.FormW2Records || []),
        ];
        setRecords(combined);
        setTotalRecords(data.TotalRecords || 0);
        setTotalPages(Math.max(1, data.TotalPages || 1));
      })
      .catch((err) => {
        console.log(
          "POST /form1099utility/list — error response body:",
          err.response?.data ?? err,
        );
        const responseData = err.response?.data;
        const apiError = responseData?.Response?.Errors?.[0];
        if (apiError?.Id === "C00-000007") {
          // "No records found" — a valid, empty result, not an error.
          setRecords([]);
          setTotalRecords(0);
          setTotalPages(1);
        } else {
          setRecords([]);
          setTotalRecords(0);
          setTotalPages(1);
          setLoadError(
            apiError?.Message ||
              err.message ||
              "Failed to load Form 1099/W2 list.",
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!businessesLoaded) return;
    runList(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, businessesLoaded]);

  const applyFilters = () => {
    if (currentPage === 1) {
      runList(1);
    } else {
      setCurrentPage(1);
    }
  };

  const filteredRecords = search.trim()
    ? records.filter((r) => {
        const q = search.trim().toLowerCase();
        return [
          r.SubmissionId,
          r.RecordId,
          r.PayerRef,
          r.RecipientId,
          r.BusinessNm,
          r.RecipientNm,
        ]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      })
    : records;

  const resetFilters = () => {
    setSearch("");
    setTaxYear("2026");
    setFormType("FORM1099NEC");
    setBusinessId(businesses[0]?.BusinessId || "");
    setRecipientId("");
    setFederalStatus("");
    setStateStatus("");
    setOnlineAccessStatus("");
    setPostalMailingStatus("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    !!search ||
    taxYear !== "2026" ||
    formType !== "FORM1099NEC" ||
    (!!businessId && businessId !== businesses[0]?.BusinessId) ||
    !!recipientId ||
    !!federalStatus ||
    !!stateStatus ||
    !!onlineAccessStatus ||
    !!postalMailingStatus;

  const handleValidateForm = (data: CreateForm1099Data) => {
    const business = businesses.find((b) => b.BusinessId === data.BusinessId);
    const recipient = recipients.find(
      (r) => r.RecipientId === data.RecipientId,
    );

    if (
      (data.FormType !== "1099-NEC" && data.FormType !== "1099-MISC") ||
      !business ||
      !recipient
    ) {
      console.error(
        "Validate Form 1099 Return: unsupported form type or missing business/recipient",
        data,
      );
      return;
    }

    setIsValidatingReturn(true);

    const isMisc = data.FormType === "1099-MISC";
    const validateCall = isMisc
      ? form1099MiscService.validateForm(
          buildMiscRequestBody(data, business, recipient),
        )
      : form1099NecService.validateForm(
          buildNecRequestBody(data, business, recipient),
        );

    validateCall
      .then((result: any) => {
        const payload = result?.Response ?? result;
        const errors: Form1099ErrorItem[] = [
          ...(payload?.Errors || []),
          ...(payload?.ErrorRecords || []).flatMap((r: any) => r.Errors || []),
        ];
        if (errors.length > 0) {
          setCreateErrors(errors);
        } else {
          setUpdateSuccessInfo("Form validated successfully. No errors found.");
        }
      })
      .catch((err) => {
        const body = err.response?.data;
        const payload = body?.Response ?? body;
        const errors: Form1099ErrorItem[] = [
          ...(payload?.Errors || []),
          ...(payload?.ErrorRecords || []).flatMap((r: any) => r.Errors || []),
        ];
        if (errors.length > 0) {
          setCreateErrors(errors);
        } else {
          console.error("Failed to validate Form 1099 return", err);
        }
      })
      .finally(() => setIsValidatingReturn(false));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Breadcrumb & Header */}
      <div className="px-8 py-4 bg-white/50 border-b border-slate-200 shrink-0">
        <button
          type="button"
          className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-tax-orange transition-colors mb-2"
        >
          <ChevronLeft size={12} /> Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 mb-1 tracking-tight">
              Form 1099 Series
            </h2>
            <p className="text-[11px] text-slate-500">
              View, search, filter, edit, and transmit individual Form 1099
              filings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddReturn(true)}
            className="flex items-center gap-2 px-4 py-2 bg-tax-orange text-white text-xs font-black rounded-lg hover:bg-orange-700 transition-all shadow-md shadow-orange-500/10"
          >
            <Plus size={14} /> Add Form 1099 Return
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="px-8 pt-4 pb-0 bg-slate-50 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-black text-slate-700"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-tax-orange" />
              Search & Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-tax-orange" />
              )}
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Search
                    </label>
                    <div className="relative max-w-md">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                        size={14}
                      />
                      <input
                        type="text"
                        title="Search Form 1099 records"
                        aria-label="Search Form 1099 records"
                        placeholder="Search SubmissionId, RecordId, PayerRef, PayeeRef..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-tax-orange transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FilterSelect
                      label="Tax Year"
                      value={taxYear}
                      onChange={setTaxYear}
                      options={TAX_YEARS.map((y) => ({ value: y, label: y }))}
                    />
                    <FilterSelect
                      label="Form Type"
                      value={formType}
                      onChange={setFormType}
                      options={FORM_TYPES}
                    />
                    <FilterSelect
                      label="Business (Payer)"
                      value={businessId}
                      onChange={setBusinessId}
                      required
                      options={businesses.map((b) => ({
                        value: b.BusinessId,
                        label: b.BusinessNm || b.PayerRef,
                      }))}
                    />
                    <FilterSelect
                      label="Recipient (Payee)"
                      value={recipientId}
                      onChange={setRecipientId}
                      options={recipients.map((r) => ({
                        value: r.RecipientId,
                        label: r.BusinessNm || r.PayeeRef,
                      }))}
                    />
                    <FilterSelect
                      label="Federal Status"
                      value={federalStatus}
                      onChange={setFederalStatus}
                      options={FEDERAL_STATUSES.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                    />
                    <FilterSelect
                      label="State Status"
                      value={stateStatus}
                      onChange={setStateStatus}
                      options={STATE_STATUSES.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                    />
                    <FilterSelect
                      label="Online Access"
                      value={onlineAccessStatus}
                      onChange={setOnlineAccessStatus}
                      options={[
                        "CREATED",
                        "ORDER_RECEIVED",
                        "EMAIL_SENT",
                        "VIEWED_FORM",
                        "DOWNLOADED_FORM",
                      ].map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
                    />
                    <FilterSelect
                      label="Postal Mailing"
                      value={postalMailingStatus}
                      onChange={setPostalMailingStatus}
                      options={[
                        "CREATED",
                        "ORDER_RECEIVED",
                        "POSTAL_INITIATED",
                        "HANDEDOVER_TO_USPS",
                        "MAILED",
                        "IN_TRANSIT",
                        "OUT_FOR_DELIVERY",
                        "ASSUMED_DELIVERED",
                        "RE_ROUTED",
                        "INTERNATIONAL_EXIT",
                      ].map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
                    />
                  </div>

                  <div className="flex justify-end items-center gap-4">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs text-tax-orange font-bold hover:underline"
                      >
                        Reset Filters
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={applyFilters}
                      className="px-4 py-2 bg-tax-orange text-white text-xs font-black rounded-lg hover:bg-orange-700 transition-all shadow-md shadow-orange-500/10"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 flex items-center justify-between gap-4 shrink-0">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
          Total Records: <span className="text-slate-800">{totalRecords}</span>
        </span>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto px-8 pb-12 custom-scrollbar">
        {loadError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs font-bold text-red-600">{loadError}</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Submission Id
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Record Id
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Form Type
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Business (Payer)
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Business Id
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Recipient (Payee)
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Recipient Id
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Federal Status
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  State Status
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Online Access
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Postal Mailing
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-tax-orange animate-spin" />
                      <p className="text-xs font-bold text-slate-400">
                        Loading Form 1099 returns...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-20 text-center">
                    <p className="text-xs font-bold text-slate-400">
                      No records found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={`${r.SubmissionId}-${r.RecordId}`}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <button
                        type="button"
                        className="text-xs font-bold text-tax-orange hover:underline"
                        title={r.SubmissionId}
                      >
                        {r.SubmissionId}
                      </button>
                    </td>
                    <td className="p-4 text-xs text-slate-600 font-mono">
                      {r.RecordId}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border whitespace-nowrap ${
                          r.FormType === "FORM1099NEC"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-orange-50 text-orange-700 border-orange-100"
                        }`}
                      >
                        {r.FormType}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700 whitespace-nowrap">
                      {r.BusinessNm || r.BusinessId}
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {r.BusinessId || "-"}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-700 whitespace-nowrap">
                      {r.RecipientNm ||
                        r.RecipientId ||
                        r.EmployeeRef ||
                        r.EmployeeId ||
                        "-"}
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {r.RecipientId || r.EmployeeId || "-"}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.FederalStatus?.Status} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(r.StatesStatus || []).length > 0 ? (
                          r.StatesStatus!.map((s, idx) => (
                            <StatusBadge
                              key={`${s.StateCd}-${idx}`}
                              status={`${s.StateCd || ""} ${s.Status}`.trim()}
                            />
                          ))
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        status={r.Distribution?.OnlineAccessStatus?.Status}
                      />
                    </td>
                    <td className="p-4">
                      <StatusBadge
                        status={r.Distribution?.PostalStatus?.Status}
                      />
                    </td>
                    <td className="p-4">
                      <Form1099ActionsCell
                        record={r}
                        onView={(rec) => setViewRecord(rec)}
                        onEdit={(rec) => {
                          setIsLoadingEdit(true);

                          const isMisc = (rec.FormType || "")
                            .toUpperCase()
                            .includes("MISC");

                          const getCall = isMisc
                            ? form1099MiscService.get({
                                recordIds: rec.RecordId,
                              })
                            : form1099NecService.get({
                                recordIds: rec.RecordId,
                              });

                          getCall
                            .then((result: any) => {
                              const payload = result?.Response ?? result;
                              const formRecord = payload?.Form1099Records?.[0];
                              const mapped = isMisc
                                ? mapMiscRecordToWizardData(
                                    formRecord,
                                    "1099-MISC",
                                    rec.SubmissionId,
                                  )
                                : mapNecRecordToWizardData(
                                    formRecord,
                                    "1099-NEC",
                                    rec.SubmissionId,
                                  );
                              if (!mapped) {
                                setCreateErrors(
                                  payload?.Errors?.length
                                    ? payload.Errors
                                    : [
                                        {
                                          Message:
                                            "Could not load this record for editing.",
                                        },
                                      ],
                                );
                                return;
                              }
                              setEditData(mapped);
                            })
                            .catch((err) => {
                              const body = err.response?.data;
                              const payload = body?.Response ?? body;
                              const errors = payload?.Errors || [];
                              if (errors.length > 0) {
                                setCreateErrors(errors);
                              } else {
                                console.error(
                                  "Failed to load Form 1099 record for editing",
                                  err,
                                );
                              }
                            })
                            .finally(() => setIsLoadingEdit(false));
                        }}
                        onDelete={(rec) => {
                          if (
                            !window.confirm(
                              `Delete record ${rec.RecordId}? This cannot be undone.`,
                            )
                          ) {
                            return;
                          }

                          form1099UtilityService
                            .delete({
                              submissionId: rec.SubmissionId,
                              recordIds: rec.RecordId,
                            })
                            .then((result: any) => {
                              const payload = result?.Response ?? result;
                              const errors = extractDelete1099W2Errors(payload);
                              if (errors.length > 0) {
                                setCreateErrors(errors);
                                return;
                              }
                              runList(currentPage);
                            })
                            .catch((err) => {
                              const body = err.response?.data;
                              const payload = body?.Response ?? body;
                              const errors = extractDelete1099W2Errors(payload);
                              if (errors.length > 0) {
                                setCreateErrors(errors);
                              } else {
                                console.error(
                                  "Failed to delete Form 1099/W2 record",
                                  err,
                                );
                              }
                            });
                        }}
                        onTransmit={(rec) => {
                          if (
                            !window.confirm(
                              `Transmit record ${rec.RecordId}? This submits the return for filing.`,
                            )
                          ) {
                            return;
                          }
                          setTransmitRecord(rec);
                        }}
                        onDraft={(rec) => setDraftPdfRecord(rec)}
                        onUrls={(rec) => setPdfUrlsRecord(rec)}
                        onAttach={(rec) =>
                          console.log("Attach for record", rec.RecordId)
                        }
                        onStatus={(rec) => setStatusRecord(rec)}
                        onStatusLog={(rec) => setStatusLogRecord(rec)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRecords > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                type="button"
                title="Previous page"
                aria-label="Previous page"
                className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${
                  currentPage === 1
                    ? "text-slate-300 border-slate-100"
                    : "text-slate-500 border-slate-200 hover:border-tax-orange hover:text-tax-orange"
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-500 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
                type="button"
                title="Next page"
                aria-label="Next page"
                className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${
                  currentPage >= totalPages
                    ? "text-slate-300 border-slate-100"
                    : "text-slate-500 border-slate-200 hover:border-tax-orange hover:text-tax-orange"
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Rows per page
              </label>
              <select
                title="Rows per page"
                aria-label="Rows per page"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-tax-orange"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Add Form 1099 Return Offcanvas */}
      <AnimatePresence>
        {showAddReturn && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddReturn(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full lg:max-w-[65%] md:max-w-[80%] max-w-full bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-100"
            >
              <CreateForm1099Wizard
                onClose={() => setShowAddReturn(false)}
                isSubmitting={isCreatingReturn}
                isValidating={isValidatingReturn}
                onValidate={handleValidateForm}
                onSubmit={(data: CreateForm1099Data) => {
                  const business = businesses.find(
                    (b) => b.BusinessId === data.BusinessId,
                  );
                  const recipient = recipients.find(
                    (r) => r.RecipientId === data.RecipientId,
                  );

                  if (
                    (data.FormType !== "1099-NEC" &&
                      data.FormType !== "1099-MISC") ||
                    !business ||
                    !recipient
                  ) {
                    console.error(
                      "Create Form 1099 Return: unsupported form type or missing business/recipient",
                      data,
                    );
                    return;
                  }

                  setIsCreatingReturn(true);

                  const isMisc = data.FormType === "1099-MISC";
                  const createCall = isMisc
                    ? form1099MiscService.create(
                        buildMiscRequestBody(data, business, recipient),
                      )
                    : form1099NecService.create(
                        buildNecRequestBody(data, business, recipient),
                      );

                  createCall
                    .then((result: any) => {
                      const payload = result?.Response ?? result;
                      const errors = extractForm1099NecErrors(payload);
                      if (errors.length > 0) {
                        setCreateErrors(errors);
                        return;
                      }
                      setShowAddReturn(false);
                      runList(currentPage);
                    })
                    .catch((err) => {
                      const body = err.response?.data;
                      const payload = body?.Response ?? body;
                      const errors = extractForm1099NecErrors(payload);
                      if (errors.length > 0) {
                        setCreateErrors(errors);
                      } else {
                        console.error("Failed to create Form 1099 return", err);
                      }
                    })
                    .finally(() => setIsCreatingReturn(false));
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Form 1099 Return Offcanvas */}
      <AnimatePresence>
        {editData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditData(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full lg:max-w-[65%] md:max-w-[80%] max-w-full bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-100"
            >
              <CreateForm1099Wizard
                mode="edit"
                initialData={editData}
                onClose={() => setEditData(null)}
                isSubmitting={isCreatingReturn}
                isValidating={isValidatingReturn}
                onValidate={handleValidateForm}
                onSubmit={(data: CreateForm1099Data) => {
                  const business = businesses.find(
                    (b) => b.BusinessId === data.BusinessId,
                  );
                  const recipient = recipients.find(
                    (r) => r.RecipientId === data.RecipientId,
                  );

                  if (
                    (data.FormType !== "1099-NEC" &&
                      data.FormType !== "1099-MISC") ||
                    !business ||
                    !recipient
                  ) {
                    console.error(
                      "Update Form 1099 Return: unsupported form type or missing business/recipient",
                      data,
                    );
                    return;
                  }

                  setIsCreatingReturn(true);

                  const isMisc = data.FormType === "1099-MISC";
                  const updateCall = isMisc
                    ? form1099MiscService.update(
                        buildMiscRequestBody(data, business, recipient),
                      )
                    : form1099NecService.update(
                        buildNecRequestBody(data, business, recipient),
                      );

                  updateCall
                    .then((result: any) => {
                      const payload = result?.Response ?? result;
                      const errors = extractForm1099NecErrors(payload);
                      if (errors.length > 0) {
                        setCreateErrors(errors);
                        return;
                      }
                      setEditData(null);
                      setUpdateSuccessInfo(
                        `Record ${data.RecordId} updated successfully.`,
                      );
                      runList(currentPage);
                    })
                    .catch((err) => {
                      const body = err.response?.data;
                      const payload = body?.Response ?? body;
                      const errors = extractForm1099NecErrors(payload);
                      if (errors.length > 0) {
                        setCreateErrors(errors);
                      } else {
                        console.error("Failed to update Form 1099 return", err);
                      }
                    })
                    .finally(() => setIsCreatingReturn(false));
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Form1099StatusModal
        record={statusRecord}
        onClose={() => setStatusRecord(null)}
      />
      <Form1099DraftPdfModal
        record={draftPdfRecord}
        onClose={() => setDraftPdfRecord(null)}
      />
      <Form1099PdfUrlsModal
        record={pdfUrlsRecord}
        onClose={() => setPdfUrlsRecord(null)}
        onError={(errors) => setCreateErrors(errors)}
      />
      <Form1099TransmitModal
        record={transmitRecord}
        onClose={() => {
          setTransmitRecord(null);
          runList(currentPage);
        }}
      />
      <Form1099ErrorsModal
        errors={createErrors}
        onClose={() => setCreateErrors(null)}
      />
      <Form1099NecViewModal
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
      <Form1099SuccessModal
        message={updateSuccessInfo}
        onClose={() => setUpdateSuccessInfo(null)}
      />
      <Form1099StatusLogModal
        record={statusLogRecord}
        onClose={() => setStatusLogRecord(null)}
      />

      {isLoadingEdit && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-5 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-tax-orange animate-spin" />
            <p className="text-xs font-bold text-slate-600">
              Loading record for editing...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
