import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import {
  Plus,
  Search,
  Edit2,
  MoreVertical,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Trash2,
  Save,
  Building,
  Building2,
  Calendar,
  ChevronDown,
  Loader2,
  Power,
  PowerOff,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, parseISO } from "date-fns";
import PayerOffcanvas from "./PayerOffcanvas";
import RecipientDetailPage, {
  type RecipientDetail,
} from "./RecipientDetailPanel";
import AddRecipientWizard, {
  type RecipientWizardData,
} from "./AddRecipientWizard";
import AssignRecipientModal from "./AssignRecipientModal";
import { payerService } from "../services/payerService";
import { recipientService } from "../services/recipientService";
import { US_STATES, CANADA_PROVINCES, COUNTRIES } from "../constants";
import {
  BusinessListEntry,
  Payer,
  DBADetail,
  RecipientDBADetail,
  RecipientListEntry,
  type TINType,
} from "../types";

interface RecipientEntry {
  RecipientId: string;
  BusinessId: string;
  RecipientNm: string;
  RecipientRef: string;
  SequenceId?: string;
  TINType: TINType;
  Last4Digit: string;
  RecipientType: "Individual" | "Business";
  IsActive: boolean;
  //AssignedPayerNm: string | null;
  CreatedTime: string;
  Address1?: string;
  Address2?: string;
  City?: string;
  ProvinceOrState?: string;
  ZipCd?: string;
  Country?: string;
  Email?: string;
  Phone?: string;
  Fax?: string;
  DateOfBirth?: string;
}

function toMonthDayYear(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

function toIsoDate(monthDayYear: string): string {
  const [month, day, year] = monthDayYear.split("/");
  return `${year}-${month}-${day}`;
}

function mapRecipientEntry(
  r: RecipientListEntry,
  businessNm: string | null,
): RecipientEntry {
  const displayName =
    r.TINDetails?.TINType === "SSN" && r.IndividualNm
      ? `${r.IndividualNm.FirstNm || ""} ${r.IndividualNm.MiddleNm || ""} ${r.IndividualNm.LastNm || ""}`.trim() ||
        r.BusinessNm
      : r.BusinessNm;

  return {
    RecipientId: r.RecipientId,
    BusinessId: r.RecipientId,
    RecipientNm: displayName || "",
    RecipientRef: r.PayeeRef,
    TINType: r.TINDetails?.TINType || "EIN",
    Last4Digit: r.TINDetails?.Last4Digit || "",
    RecipientType: r.TINDetails?.TINType === "SSN" ? "Individual" : "Business",
    IsActive: r.IsActive,
   // AssignedPayerNm: businessNm,
    CreatedTime: r.CreatedTime,
    Address1: r.Address?.Address1,
    Address2: r.Address?.Address2,
    City: r.Address?.City,
    ProvinceOrState: r.Address?.ProvinceOrState,
    ZipCd: r.Address?.ZipCd,
    Country: r.Address?.Country,
    Email: r.Email,
  };
}

export default function AddressBookPage() {
  const [activeTab, setActiveTab] = useState<"Payers" | "Recipients">("Payers");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [businessList, setBusinessList] = useState<BusinessListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showManageRecipients, setShowManageRecipients] = useState<
    string | null
  >(null);

  // Recipients tab state
  const [recipients, setRecipients] = useState<RecipientEntry[]>([]);
  const [isRecipientsLoading, setIsRecipientsLoading] = useState(false);
  const [recipientCurrentPage, setRecipientCurrentPage] = useState(1);
  const [recipientPageSize, setRecipientPageSize] = useState(10);
  const [recipientTotalRecords, setRecipientTotalRecords] = useState(0);
  const [recipientTotalPages, setRecipientTotalPages] = useState(0);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientStartDate, setRecipientStartDate] = useState("");
  const [recipientEndDate, setRecipientEndDate] = useState("");
  const [appliedRecipientStartDate, setAppliedRecipientStartDate] =
    useState("");
  const [appliedRecipientEndDate, setAppliedRecipientEndDate] = useState("");
  const [showRecipientDatePicker, setShowRecipientDatePicker] = useState(false);
  const [recipientStatusFilter, setRecipientStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [recipientActiveDropdown, setRecipientActiveDropdown] = useState<
    string | null
  >(null);
  const [selectedRecipient, setSelectedRecipient] =
    useState<RecipientDetail | null>(null);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(
    null,
  );
  const [editingRecipientData, setEditingRecipientData] =
    useState<RecipientWizardData | null>(null);
  const [showAssignRecipient, setShowAssignRecipient] = useState(false);

  const recipientsFetchInFlight = useRef(false);
  const [debouncedRecipientSearch, setDebouncedRecipientSearch] = useState("");
  const GUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRecipientSearch(recipientSearch.trim());
      setRecipientCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [recipientSearch]);

  const fetchRecipients = useCallback(async () => {
    if (recipientsFetchInFlight.current) return;
    recipientsFetchInFlight.current = true;
    setIsRecipientsLoading(true);
    try {
      const isGuid = GUID_PATTERN.test(debouncedRecipientSearch);
      const response = await recipientService.getRecipients({
        businessId:
          debouncedRecipientSearch && isGuid
            ? debouncedRecipientSearch
            : undefined,
        payerref:
          debouncedRecipientSearch && !isGuid
            ? debouncedRecipientSearch
            : undefined,
        page: recipientCurrentPage,
        pagesize: recipientPageSize,
        fromdate: appliedRecipientStartDate
          ? format(parseISO(appliedRecipientStartDate), "MM/dd/yyyy")
          : undefined,
        todate: appliedRecipientEndDate
          ? format(parseISO(appliedRecipientEndDate), "MM/dd/yyyy")
          : undefined,
        isactive:
          recipientStatusFilter === "All"
            ? undefined
            : recipientStatusFilter === "Active",
      });
      const businessNm = response.Response.Business?.BusinessNm || null;
      setRecipients(
        (response.Response.Recipient || []).map((r) =>
          mapRecipientEntry(r, businessNm),
        ),
      );
      setRecipientTotalRecords(response.Response.TotalRecords || 0);
      setRecipientTotalPages(response.Response.TotalPages || 0);
    } catch (error: any) {
      const responseData = error.response?.data;
      if (
        responseData?.Response?.Errors?.some(
          (e: any) => e.Message === "No records found",
        )
      ) {
        setRecipients([]);
        setRecipientTotalRecords(0);
        setRecipientTotalPages(0);
      } else {
        console.error("Failed to fetch recipients:", error);
        setRecipients([]);
        setRecipientTotalRecords(0);
        setRecipientTotalPages(0);
      }
    } finally {
      setIsRecipientsLoading(false);
      recipientsFetchInFlight.current = false;
    }
  }, [
    debouncedRecipientSearch,
    recipientCurrentPage,
    recipientPageSize,
    appliedRecipientStartDate,
    appliedRecipientEndDate,
    recipientStatusFilter,
  ]);

  useEffect(() => {
    if (activeTab === "Recipients") {
      fetchRecipients();
    }
  }, [activeTab, fetchRecipients]);

  const filteredRecipients = recipients;
  const displayTotalRecords = recipientTotalRecords;
  const displayTotalPages = recipientTotalPages;
  const displayCurrentPage = recipientCurrentPage;
  const [showManageDBAs, setShowManageDBAs] = useState<string | null>(null);
  const [isAddingDBA, setIsAddingDBA] = useState(false);
  const [editingDBAIndex, setEditingDBAIndex] = useState<number | null>(null);
  const [isDBALoading, setIsDBALoading] = useState(false);
  const [dbas, setDbas] = useState<DBADetail[]>([]);

  const [showManageRecipientDBAs, setShowManageRecipientDBAs] = useState<
    string | null
  >(null);
  const [isAddingRecipientDBA, setIsAddingRecipientDBA] = useState(false);
  const [editingRecipientDBAIndex, setEditingRecipientDBAIndex] = useState<
    number | null
  >(null);
  const [isRecipientDBALoading, setIsRecipientDBALoading] = useState(false);
  const [recipientDBAs, setRecipientDBAs] = useState<RecipientDBADetail[]>([]);

  // Pagination & Filtering State
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning";
  } | null>(null);
  const [recipientResult, setRecipientResult] = useState<{
    success: Array<{
      RecipientId: string;
      PayeeRef: string;
      Last4DigitTIN?: string;
    }>;
    errors: Array<{
      PayeeRef?: string | null;
      Errors: Array<{ Id: string; Name: string; Message: string }>;
    }>;
  } | null>(null);
  const [isCreatingRecipient, setIsCreatingRecipient] = useState(false);

  // Toast auto-dismiss logic
  useEffect(() => {
    if (toast) {
      const duration =
        toast.type === "error" && validationErrors.length > 0 ? 10000 : 5000;
      const timer = setTimeout(() => {
        setToast(null);
        if (toast.type === "error") setValidationErrors([]);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast, validationErrors.length]);

  // Debounce search effect
  useEffect(() => {
    if (search === debouncedSearch) return;

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const isNumericSearch = /^\d+$/.test(debouncedSearch);

      const response = await payerService.getBusinesses({
        page: currentPage,
        pagesize: itemsPerPage,
        payername: !isNumericSearch ? debouncedSearch : undefined,
        last4digit: isNumericSearch ? debouncedSearch : undefined,
        fromdate: startDate
          ? format(parseISO(startDate), "MM/dd/yyyy")
          : undefined,
        todate: endDate ? format(parseISO(endDate), "MM/dd/yyyy") : undefined,
      });
      setBusinessList(response.Response.Businesses || []);
      setTotalRecords(response.Response.TotalRecords || 0);
      setTotalPages(response.Response.TotalPages || 0);
    } catch (error: any) {
      console.error("Failed to fetch businesses:", error);
      // Handle "No records found" case which might come as 400 Bad Request
      const responseData = error.response?.data;
      if (
        responseData?.Response?.Errors?.some(
          (e: any) => e.Message === "No records found",
        )
      ) {
        setBusinessList([]);
        setTotalRecords(0);
        setTotalPages(0);
      } else {
        setBusinessList([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handlePayerClick = async (businessId: string) => {
    try {
      const response = await payerService.getBusinessById(businessId);
      setEditingPayer(response.Response.Business);
      setIsOffcanvasOpen(true);
    } catch (error) {
      console.error("Failed to fetch business details:", error);
    }
  };

  const handleRecipientClick = async (recipientId: string) => {
    try {
      const response = await recipientService.getRecipientById(recipientId);
      const r = response.Response.Recipients?.[0];
      if (!r) return;

      const displayName =
        r.TINDetails?.TINType === "SSN" && r.IndividualNm
          ? `${r.IndividualNm.FirstNm || ""} ${r.IndividualNm.MiddleNm || ""} ${r.IndividualNm.LastNm || ""}`.trim() ||
            r.BusinessNm ||
            ""
          : r.BusinessNm || "";

      setSelectedRecipient({
        RecipientId: r.RecipientId,
        RecipientNm: displayName,
        RecipientRef: r.PayeeRefs?.[0] || "",
        RecipientType: r.TINDetails?.TINType === "SSN" ? "Individual" : "Business",
        TINType: r.TINDetails?.TINType || "EIN",
        Last4Digit: r.TINDetails?.Last4Digit || "",
        IsActive: r.IsActive,
        Address1: r.Address?.Address1,
        Address2: r.Address?.Address2,
        City: r.Address?.City,
        ProvinceOrState: r.Address?.ProvinceOrState,
        ZipCd: r.Address?.ZipCd,
        Country: r.Address?.Country,
        Email: r.Email || undefined,
        Phone: r.Phone || undefined,
        Fax: r.Fax || undefined,
        DateOfBirth: r.DOB || undefined,
        BusinessNm: r.BusinessNm || undefined,
        NameCtrl: r.NameCtrl || undefined,
        DBADetails: r.DBADetails?.map((d) => ({
          DBAId: d.DBAId,
          DBANm: d.DBANm,
          DBARef: d.DBARef,
        })),
        W9: r.W9Details
          ? {
              FederalTaxClassification: r.W9Details.FedTaxClassification,
              ExemptPayeeCode: r.W9Details.ExemptPayeeCd,
              FATCAReportingCode: r.W9Details.FATCACode,
              BackupWithholdingStatus: r.W9Details.IsBackupWth,
            }
          : undefined,
        W8BEN: r.W8BenDetails
          ? {
              CitizenOfCountry: r.W8BenDetails.CitizenOfCountry,
              FTIN: r.W8BenDetails.FTIN,
              FTINNotLegallyRequired: r.W8BenDetails.IsFTINNotLegallyRequired,
            }
          : undefined,
        Form1042S: r.Form1042SDetails
          ? {
              Chapter3StatusCode: r.Form1042SDetails.Ch3Cd,
              Chapter4StatusCode: r.Form1042SDetails.Ch4Cd,
              GIIN: r.Form1042SDetails.GIIN,
              LOBCode: r.Form1042SDetails.LOBCode,
            }
          : undefined,
      });
    } catch (error) {
      console.error("Failed to fetch recipient details:", error);
    }
  };

  const handleEditRecipient = async (recipientId: string) => {
    try {
      const response = await recipientService.getRecipientById(recipientId);
      const r = response.Response.Recipients?.[0];
      if (!r) return;

      const wizardData: RecipientWizardData = {
        RecipientType: r.TINDetails?.TINType === "SSN" ? "Individual" : "Business",
        SequenceId: "01",
        RecipientRef: r.PayeeRefs?.[0] || "",
        IndividualNm: {
          FirstNm: r.IndividualNm?.FirstNm || "",
          MiddleNm: r.IndividualNm?.MiddleNm || "",
          LastNm: r.IndividualNm?.LastNm || "",
          Suffix: r.IndividualNm?.Suffix || "",
        },
        BusinessNm: r.BusinessNm || "",
        NameCtrl: r.NameCtrl || "",
        TINType: r.TINDetails?.TINType || "EIN",
        TIN: (r.TINDetails?.TIN || "").replace(/[^0-9]/g, ""),
        TINFormat:
          (r.TINDetails?.Format as
            | "PLAIN_TIN"
            | "ENCRYPTED_TIN"
            | "TOKENIZED_TIN") || "PLAIN_TIN",
        TINToken: r.TINDetails?.TINToken || "",
        TINLast4: r.TINDetails?.Last4Digit || "",
        Address: {
          Address1: r.Address?.Address1 || "",
          Address2: r.Address?.Address2 || "",
          City: r.Address?.City || "",
          ProvinceOrState: r.Address?.ProvinceOrState || "",
          ZipCd: r.Address?.ZipCd || "",
          Country: r.Address?.Country || "US",
        },
        Email: r.Email || "",
        Phone: r.Phone || "",
        Fax: r.Fax || "",
        DateOfBirth: r.DOB ? toIsoDate(r.DOB) : "",
        DBADetails: {
          DBANm: r.DBADetails?.[0]?.DBANm || "",
          DBARef: r.DBADetails?.[0]?.DBARef || "",
          Address: {
            Address1: r.DBADetails?.[0]?.Address?.Address1 || "",
            Address2: r.DBADetails?.[0]?.Address?.Address2 || "",
            City: r.DBADetails?.[0]?.Address?.City || "",
            ProvinceOrState: r.DBADetails?.[0]?.Address?.ProvinceOrState || "",
            ZipCd: r.DBADetails?.[0]?.Address?.ZipCd || "",
            Country: r.DBADetails?.[0]?.Address?.Country || "US",
          },
        },
        W9: {
          FederalTaxClassification: r.W9Details?.FedTaxClassification || "",
          ExemptPayeeCode: r.W9Details?.ExemptPayeeCd || "",
          FATCAReportingCode: r.W9Details?.FATCACode || "",
          BackupWithholdingStatus: r.W9Details?.IsBackupWth || false,
        },
        W8BEN: {
          CitizenOfCountry: r.W8BenDetails?.CitizenOfCountry || "",
          FTIN: r.W8BenDetails?.FTIN || "",
          FTINNotLegallyRequired: r.W8BenDetails?.IsFTINNotLegallyRequired || false,
        },
        Form1042S: {
          Chapter3StatusCode: r.Form1042SDetails?.Ch3Cd || "",
          Chapter4StatusCode: r.Form1042SDetails?.Ch4Cd || "",
          GIIN: r.Form1042SDetails?.GIIN || "",
          LOBCode: r.Form1042SDetails?.LOBCode || "",
        },
      };

      setEditingRecipientId(recipientId);
      setEditingRecipientData(wizardData);
    } catch (error) {
      console.error("Failed to fetch recipient for editing:", error);
      setToast({
        message: "Failed to load recipient for editing",
        type: "error",
      });
    }
  };

  const handleCreateRecipient = async (
    data: RecipientWizardData,
    createAnother: boolean,
  ) => {
    setIsCreatingRecipient(true);
    const isEditing = !!editingRecipientId;
    try {
      const payload = {
        Recipients: [
          {
            SequenceId: data.SequenceId || undefined,
            RecipientId: editingRecipientId || undefined,
            PayeeRef: data.RecipientRef || undefined,
            TINDetails:
              isEditing && !data.TIN
                ? undefined
                : {
                    TINType: data.TINType,
                    TIN: data.TIN,
                    Format: data.TINFormat,
                    TINToken:
                      data.TINFormat === "TOKENIZED_TIN"
                        ? data.TINToken || undefined
                        : undefined,
                  },
            IndividualNm:
              data.RecipientType === "Individual"
                ? {
                    FirstNm: data.IndividualNm.FirstNm,
                    MiddleNm: data.IndividualNm.MiddleNm || undefined,
                    LastNm: data.IndividualNm.LastNm,
                    Suffix: data.IndividualNm.Suffix || undefined,
                  }
                : null,
            BusinessNm:
              data.RecipientType === "Business" ? data.BusinessNm : null,
            NameCtrl: data.NameCtrl || undefined,
            DBADetails: data.DBADetails.DBANm
              ? {
                  DBANm: data.DBADetails.DBANm,
                  DBARef: data.DBADetails.DBARef,
                  Address: data.DBADetails.Address,
                }
              : null,
            Address: data.Address,
            DOB: data.DateOfBirth ? toMonthDayYear(data.DateOfBirth) : undefined,
            Email: data.Email || undefined,
            Fax: data.Fax || undefined,
            Phone: data.Phone || undefined,
            W9Details: data.W9.FederalTaxClassification
              ? {
                  FedTaxClassification: data.W9.FederalTaxClassification,
                  ExemptPayeeCd: data.W9.ExemptPayeeCode || undefined,
                  FATCACode: data.W9.FATCAReportingCode || undefined,
                  IsBackupWth: data.W9.BackupWithholdingStatus,
                }
              : null,
            W8BenDetails: data.W8BEN.CitizenOfCountry
              ? {
                  CitizenOfCountry: data.W8BEN.CitizenOfCountry,
                  FTIN: data.W8BEN.FTIN || undefined,
                  IsFTINNotLegallyRequired: data.W8BEN.FTINNotLegallyRequired,
                }
              : null,
            Form1042SDetails: data.Form1042S.Chapter3StatusCode
              ? {
                  Ch3Cd: data.Form1042S.Chapter3StatusCode,
                  Ch4Cd: data.Form1042S.Chapter4StatusCode || undefined,
                  GIIN: data.Form1042S.GIIN || undefined,
                  LOBCode: data.Form1042S.LOBCode || undefined,
                }
              : null,
          },
        ],
      };

      const response = isEditing
        ? await recipientService.updateRecipient(payload)
        : await recipientService.createRecipient(payload);
      const successRecipients = response.Response.SuccessRecipients || [];
      const errorRecipients = response.Response.ErrorRecipients || [];
      const topLevelErrors = response.Response.Errors || [];
      const hasErrors = errorRecipients.length > 0 || topLevelErrors.length > 0;

      if (isEditing && successRecipients.length > 0 && !hasErrors) {
        setToast({ message: "Recipient updated successfully", type: "success" });
      } else {
        setRecipientResult({
          success: successRecipients.map((s) => ({
            RecipientId: s.RecipientId,
            PayeeRef: s.PayeeRef,
            Last4DigitTIN: s.Last4DigitTIN,
          })),
          errors: [
            ...errorRecipients.map((e) => ({
              PayeeRef: e.PayeeRef,
              Errors: e.Errors || [],
            })),
            ...(topLevelErrors.length
              ? [{ PayeeRef: null, Errors: topLevelErrors }]
              : []),
          ],
        });
      }

      if (successRecipients.length > 0) {
        setShowAddRecipient(false);
        setEditingRecipientId(null);
        setEditingRecipientData(null);
        if (!isEditing && recipientCurrentPage !== 1) {
          setRecipientCurrentPage(1);
        } else {
          await fetchRecipients();
        }
        if (createAnother && !isEditing) {
          setTimeout(() => setShowAddRecipient(true), 0);
        }
      }
    } catch (error: any) {
      console.error(
        isEditing ? "Update recipient failed:" : "Create recipient failed:",
        error,
      );
      const errorData = error.response?.data;
      const errorRecipients = errorData?.Response?.ErrorRecipients || [];
      const topLevelErrors = errorData?.Response?.Errors || [];

      setRecipientResult({
        success: [],
        errors: [
          ...errorRecipients.map((e: any) => ({
            PayeeRef: e.PayeeRef,
            Errors: e.Errors || [],
          })),
          ...(topLevelErrors.length
            ? [{ PayeeRef: null, Errors: topLevelErrors }]
            : []),
          ...(errorRecipients.length === 0 && topLevelErrors.length === 0
            ? [
                {
                  PayeeRef: null,
                  Errors: [
                    {
                      Id: "",
                      Name: "",
                      Message:
                        error.message ||
                        (isEditing
                          ? "Failed to update recipient"
                          : "Failed to create recipient"),
                    },
                  ],
                },
              ]
            : []),
        ],
      });
    } finally {
      setIsCreatingRecipient(false);
    }
  };

  const handleDeleteRecipient = (recipientId: string, recipientNm: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Recipient",
      message: `Are you sure you want to delete "${recipientNm}"? This action cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await recipientService.deleteRecipient(recipientId);
          await fetchRecipients();
          setRecipientActiveDropdown(null);
          setToast({
            message: "Recipient deleted successfully",
            type: "success",
          });
          setConfirmModal(null);
        } catch (error: any) {
          console.error("Delete recipient failed:", error);

          let errorMessage = "Failed to delete recipient. Please try again.";
          const errorData = error.response?.data || error;
          const errors = errorData?.Response?.Errors;

          if (errors && errors.length > 0) {
            setValidationErrors(errors);
            errorMessage = errors[0].Message;
          }

          setToast({
            message: errorMessage,
            type: "error",
          });
          setConfirmModal(null);
        }
      },
    });
  };

  const handleToggleRecipientStatus = (
    recipientId: string,
    recipientNm: string,
    isActive: boolean,
  ) => {
    const action = isActive ? "deactivate" : "activate";

    setConfirmModal({
      isOpen: true,
      title: `${isActive ? "Deactivate" : "Activate"} Recipient`,
      message: `Are you sure you want to ${action} "${recipientNm}"?`,
      type: "warning",
      onConfirm: async () => {
        try {
          const response = isActive
            ? await recipientService.deactivateRecipient(recipientId)
            : await recipientService.reactivateRecipient(recipientId);

          const successRecords = response.Response.SuccessRecords || [];
          const errorRecords = response.Response.ErrorRecords || [];
          const topLevelErrors = response.Response.Errors || [];

          if (successRecords.length > 0) {
            await fetchRecipients();
            setRecipientActiveDropdown(null);
            setToast({
              message: `Recipient ${action}d successfully`,
              type: "success",
            });
            setConfirmModal(null);
          } else {
            const errors = errorRecords[0]?.Errors || topLevelErrors;
            if (errors.length > 0) {
              setValidationErrors(errors);
            }
            setToast({
              message:
                errors[0]?.Message ||
                `Failed to ${action} recipient. Please try again.`,
              type: "error",
            });
            setConfirmModal(null);
          }
        } catch (error: any) {
          console.error(`${action} recipient failed:`, error);

          let errorMessage = `Failed to ${action} recipient. Please try again.`;
          const errorData = error.response?.data;
          const errors =
            errorData?.Response?.ErrorRecords?.[0]?.Errors ||
            errorData?.Response?.Errors;

          if (errors && errors.length > 0) {
            setValidationErrors(errors);
            errorMessage = errors[0].Message;
          }

          setToast({
            message: errorMessage,
            type: "error",
          });
          setConfirmModal(null);
        }
      },
    });
  };

  const handleAssignRecipient = async (params: {
    businessId: string;
    payerRef: string;
    sequenceId: string;
    payeeRef: string;
  }) => {
    if (!selectedRecipient) return;
    try {
      const response = await recipientService.assignRecipient({
        BusinessId: params.businessId,
        PayerRef: params.payerRef,
        AssignRecipients: [
          {
            SequenceId: params.sequenceId,
            RecipientId: selectedRecipient.RecipientId,
            PayeeRef: params.payeeRef,
          },
        ],
      });

      const success = response.Response.SuccessRecipients?.[0];
      const errorRecord = response.Response.ErrorRecipients?.[0];

      if (success) {
        const businessList = await payerService.getBusinesses({
          page: 1,
          pagesize: 100,
        });
        const business = businessList.Response.Businesses?.find(
          (b) => b.BusinessId === params.businessId,
        );

        setSelectedRecipient((prev) =>
          prev
            ? {
                ...prev,
                AssignedBusinesses: [
                  ...(prev.AssignedBusinesses || []).filter(
                    (b) => b.BusinessId !== params.businessId,
                  ),
                  {
                    BusinessId: params.businessId,
                    BusinessNm: business?.BusinessNm || params.businessId,
                    PayerRef: params.payerRef,
                    PayeeRef: params.payeeRef,
                    SequenceId: params.sequenceId,
                  },
                ],
              }
            : prev,
        );
        setShowAssignRecipient(false);
        setToast({
          message: "Recipient assigned to business successfully",
          type: "success",
        });
      } else {
        const errors = errorRecord?.Errors || response.Response.Errors || [];
        if (errors.length > 0) setValidationErrors(errors);
        setToast({
          message: errors[0]?.Message || "Failed to assign recipient",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Assign recipient failed:", error);
      const errorData = error.response?.data;
      const errors =
        errorData?.Response?.ErrorRecipients?.[0]?.Errors ||
        errorData?.Response?.Errors ||
        [];
      if (errors.length > 0) setValidationErrors(errors);
      setToast({
        message: errors[0]?.Message || "Failed to assign recipient",
        type: "error",
      });
    }
  };

  const handleUnassignRecipient = (businessId: string) => {
    if (!selectedRecipient) return;
    const business = selectedRecipient.AssignedBusinesses?.find(
      (b) => b.BusinessId === businessId,
    );
    if (!business) return;

    setConfirmModal({
      isOpen: true,
      title: "Unassign Recipient",
      message: `Are you sure you want to unassign "${selectedRecipient.RecipientNm}" from "${business.BusinessNm}"?`,
      type: "danger",
      onConfirm: async () => {
        try {
          const response = await recipientService.unassignRecipient({
            BusinessId: businessId,
            PayerRef: business.PayerRef,
            UnAssignRecipients: [
              {
                SequenceId: business.SequenceId,
                RecipientId: selectedRecipient.RecipientId,
                PayeeRef: business.PayeeRef,
              },
            ],
          });

          const success = response.Response.SuccessRecipients?.[0];
          const errorRecord = response.Response.ErrorRecipients?.[0];

          if (success) {
            setSelectedRecipient((prev) =>
              prev
                ? {
                    ...prev,
                    AssignedBusinesses: (prev.AssignedBusinesses || []).filter(
                      (b) => b.BusinessId !== businessId,
                    ),
                  }
                : prev,
            );
            setToast({
              message: "Recipient unassigned successfully",
              type: "success",
            });
            setConfirmModal(null);
          } else {
            const errors =
              errorRecord?.Errors || response.Response.Errors || [];
            if (errors.length > 0) setValidationErrors(errors);
            setToast({
              message: errors[0]?.Message || "Failed to unassign recipient",
              type: "error",
            });
            setConfirmModal(null);
          }
        } catch (error: any) {
          console.error("Unassign recipient failed:", error);
          const errorData = error.response?.data;
          const errors =
            errorData?.Response?.ErrorRecipients?.[0]?.Errors ||
            errorData?.Response?.Errors ||
            [];
          if (errors.length > 0) setValidationErrors(errors);
          setToast({
            message: errors[0]?.Message || "Failed to unassign recipient",
            type: "error",
          });
          setConfirmModal(null);
        }
      },
    });
  };

  const fetchDBAs = async (businessId: string) => {
    setIsDBALoading(true);
    try {
      const response = await payerService.listDBA({ businessId });
      setDbas(response.Response.DBADetails || []);
    } catch (error: any) {
      console.error("Failed to fetch DBAs:", error);
      // Handle "No records found" case (often 400 Bad Request)
      const responseData = error.response?.data;
      if (
        responseData?.Response?.Errors?.some(
          (e: any) => e.Message === "No records found",
        )
      ) {
        setDbas([]);
      } else {
        setDbas([]);
      }
    } finally {
      setIsDBALoading(false);
    }
  };

  useEffect(() => {
    if (showManageDBAs) {
      fetchDBAs(showManageDBAs);
    }
  }, [showManageDBAs]);

  const [dbaForm, setDbaForm] = useState({
    SequenceId: "1",
    DBAId: "",
    DBANm: "",
    DBARef: "",
    IsDefaultDBA: false,
    Address: {
      Address1: "",
      Address2: "",
      City: "",
      ProvinceOrState: "",
      ZipCd: "",
      Country: "",
    },
  });

  const handleEditDBA = (index: number) => {
    const dba = dbas[index];
    setDbaForm({
      SequenceId: dba.SequenceId || (index + 1).toString(),
      DBAId: dba.DBAId || "",
      DBANm: dba.DBANm,
      DBARef: dba.DBARef,
      IsDefaultDBA: dba.IsDefaultDBA || false,
      Address: dba.Address
        ? {
            Address1: dba.Address.Address1 || "",
            Address2: dba.Address.Address2 || "",
            City: dba.Address.City || "",
            ProvinceOrState: dba.Address.ProvinceOrState || "",
            ZipCd: dba.Address.ZipCd || "",
            Country: dba.Address.Country || "",
          }
        : {
            Address1: "",
            Address2: "",
            City: "",
            ProvinceOrState: "",
            ZipCd: "",
            Country: "",
          },
    });
    setEditingDBAIndex(index);
    setIsAddingDBA(true);
  };

  const handleSaveDBA = async () => {
    if (!showManageDBAs) return;

    const selectedBusiness = businessList.find(
      (b) => b.BusinessId === showManageDBAs,
    );
    const payerRef = selectedBusiness?.PayerRef || "";

    try {
      const payload = {
        BusinessId: showManageDBAs,
        PayerRef: payerRef,
        DBADetails: [
          {
            ...dbaForm,
            DBAId: dbaForm.DBAId || "00000000-0000-0000-0000-000000000000",
          },
        ],
      };

      if (editingDBAIndex !== null) {
        await payerService.updateDBA(payload);
      } else {
        await payerService.addDBA(payload);
      }

      await fetchDBAs(showManageDBAs);
      setIsAddingDBA(false);
      setEditingDBAIndex(null);
      setToast({
        message: `Trade name ${editingDBAIndex !== null ? "updated" : "added"} successfully`,
        type: "success",
      });
    } catch (error: any) {
      console.error("Save DBA failed:", error);

      let errorMessage =
        "Failed to save trade name. Please check your information.";
      const errorData = error.response?.data || error;

      if (errorData?.Response?.DBADetails?.ErrorRecords?.length > 0) {
        const errors = errorData.Response.DBADetails.ErrorRecords[0].Errors;
        setValidationErrors(errors);
        errorMessage =
          errors.length > 0 ? errors[0].Message : "Validation failed";
      } else if (
        errorData?.Response?.Errors &&
        errorData.Response.Errors.length > 0
      ) {
        setValidationErrors(errorData.Response.Errors);
        errorMessage = errorData.Response.Errors[0].Message;
      } else if (error.message && error.message.startsWith("{")) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) errorMessage = parsed.error;
        } catch (e) {
          errorMessage = error.message;
        }
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
    }
  };

  const handleDeleteDBA = async (dbaId: string) => {
    if (!showManageDBAs || !dbaId) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Trade Name",
      message:
        "Are you sure you want to delete this trade name? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          await payerService.deleteDBA(showManageDBAs!, dbaId);
          await fetchDBAs(showManageDBAs!);
          setToast({
            message: "Trade name deleted successfully",
            type: "success",
          });
          setConfirmModal(null);
        } catch (error: any) {
          console.error("Delete DBA failed:", error);
          
          let errorMessage = "Failed to delete trade name. Please try again.";
          const errorData = error.response?.data || error;

          if (errorData?.Response?.ErrorRecords?.length > 0) {
            const errors = errorData.Response.ErrorRecords[0].Errors;
            setValidationErrors(errors);
            errorMessage = errors.length > 0 ? errors[0].Message : "Delete failed";
          } else if (
            errorData?.Response?.Errors &&
            errorData.Response.Errors.length > 0
          ) {
            setValidationErrors(errorData.Response.Errors);
            errorMessage = errorData.Response.Errors[0].Message;
          }

          setToast({
            message: errorMessage,
            type: "error",
          });
          setConfirmModal(null);
        }
      },
    });
  };

  const fetchRecipientDBAs = async (recipientId: string) => {
    setIsRecipientDBALoading(true);
    try {
      const response = await recipientService.listDBA({ recipientId });
      setRecipientDBAs(response.Response.DBADetails || []);
    } catch (error: any) {
      console.error("Failed to fetch recipient DBAs:", error);
      setRecipientDBAs([]);
    } finally {
      setIsRecipientDBALoading(false);
    }
  };

  useEffect(() => {
    if (showManageRecipientDBAs) {
      fetchRecipientDBAs(showManageRecipientDBAs);
    }
  }, [showManageRecipientDBAs]);

  const [recipientDbaForm, setRecipientDbaForm] = useState({
    SequenceId: "1",
    DBAId: "",
    DBANm: "",
    DBARef: "",
    IsDefaultDBA: false,
    Address: {
      Address1: "",
      Address2: "",
      City: "",
      ProvinceOrState: "",
      ZipCd: "",
      Country: "",
    },
  });

  const handleEditRecipientDBA = (index: number) => {
    const dba = recipientDBAs[index];
    setRecipientDbaForm({
      SequenceId: dba.SequenceId || (index + 1).toString(),
      DBAId: dba.DBAId || "",
      DBANm: dba.DBANm,
      DBARef: dba.DBARef,
      IsDefaultDBA: dba.IsDefaultDBA || false,
      Address: dba.Address
        ? {
            Address1: dba.Address.Address1 || "",
            Address2: dba.Address.Address2 || "",
            City: dba.Address.City || "",
            ProvinceOrState: dba.Address.ProvinceOrState || "",
            ZipCd: dba.Address.ZipCd || "",
            Country: dba.Address.Country || "",
          }
        : {
            Address1: "",
            Address2: "",
            City: "",
            ProvinceOrState: "",
            ZipCd: "",
            Country: "",
          },
    });
    setEditingRecipientDBAIndex(index);
    setIsAddingRecipientDBA(true);
  };

  const handleSaveRecipientDBA = async () => {
    if (!showManageRecipientDBAs) return;

    const selectedRecipient = recipients.find(
      (r) => r.RecipientId === showManageRecipientDBAs,
    );
    const payeeRef = selectedRecipient?.RecipientRef || "";

    try {
      const payload = {
        RecipientId: showManageRecipientDBAs,
        PayeeRef: payeeRef,
        DBADetails: [
          {
            ...recipientDbaForm,
            DBAId:
              recipientDbaForm.DBAId || "00000000-0000-0000-0000-000000000000",
          },
        ],
      };

      if (editingRecipientDBAIndex !== null) {
        await recipientService.updateDBA(payload);
      } else {
        await recipientService.addDBA(payload);
      }

      await fetchRecipientDBAs(showManageRecipientDBAs);
      setIsAddingRecipientDBA(false);
      setEditingRecipientDBAIndex(null);
      setToast({
        message: `Trade name ${editingRecipientDBAIndex !== null ? "updated" : "added"} successfully`,
        type: "success",
      });
    } catch (error: any) {
      console.error("Save recipient DBA failed:", error);

      let errorMessage =
        "Failed to save trade name. Please check your information.";
      const errorData = error.response?.data || error;

      if (errorData?.Response?.DBADetails?.ErrorRecords?.length > 0) {
        const errors = errorData.Response.DBADetails.ErrorRecords[0].Errors;
        setValidationErrors(errors);
        errorMessage =
          errors.length > 0 ? errors[0].Message : "Validation failed";
      } else if (
        errorData?.Response?.Errors &&
        errorData.Response.Errors.length > 0
      ) {
        setValidationErrors(errorData.Response.Errors);
        errorMessage = errorData.Response.Errors[0].Message;
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
    }
  };

  const handleDeleteRecipientDBA = async (dbaId: string) => {
    if (!showManageRecipientDBAs || !dbaId) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Trade Name",
      message:
        "Are you sure you want to delete this trade name? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          await recipientService.deleteDBA(showManageRecipientDBAs!, dbaId);
          await fetchRecipientDBAs(showManageRecipientDBAs!);
          setToast({
            message: "Trade name deleted successfully",
            type: "success",
          });
          setConfirmModal(null);
        } catch (error: any) {
          console.error("Delete recipient DBA failed:", error);

          let errorMessage = "Failed to delete trade name. Please try again.";
          const errorData = error.response?.data || error;

          if (errorData?.Response?.ErrorRecords?.length > 0) {
            const errors = errorData.Response.ErrorRecords[0].Errors;
            setValidationErrors(errors);
            errorMessage = errors.length > 0 ? errors[0].Message : "Delete failed";
          } else if (
            errorData?.Response?.Errors &&
            errorData.Response.Errors.length > 0
          ) {
            setValidationErrors(errorData.Response.Errors);
            errorMessage = errorData.Response.Errors[0].Message;
          }

          setToast({
            message: errorMessage,
            type: "error",
          });
          setConfirmModal(null);
        }
      },
    });
  };

  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<Payer | null>(null);

  const toggleSelectAll = () => {
    if (selectedPayers.length === businessList.length) {
      setSelectedPayers([]);
    } else {
      setSelectedPayers(businessList.map((p) => p.BusinessId));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedPayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleDeletePayer = async (businessId: string) => {
    if (!businessId) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Payer",
      message:
        "Are you sure you want to delete this payer? All associated data will be permanently removed.",
      type: "danger",
      onConfirm: async () => {
        try {
          await payerService.deletePayer(businessId);
          await fetchBusinesses();
          // Clear selection if deleted
          setSelectedPayers((prev) => prev.filter((id) => id !== businessId));
          setActiveDropdown(null);
          setToast({ message: "Payer deleted successfully", type: "success" });
          setConfirmModal(null);
        } catch (error: any) {
          console.error("Delete payer failed:", error);
          
          let errorMessage = "Failed to delete payer. Please try again.";
          const errorData = error.response?.data || error;

          if (errorData?.Response?.ErrorRecords?.length > 0) {
            const errors = errorData.Response.ErrorRecords[0].Errors;
            setValidationErrors(errors);
            errorMessage = errors.length > 0 ? errors[0].Message : "Delete failed";
          } else if (
            errorData?.Response?.Errors &&
            errorData.Response.Errors.length > 0
          ) {
            setValidationErrors(errorData.Response.Errors);
            errorMessage = errorData.Response.Errors[0].Message;
          }

          setToast({
            message: errorMessage,
            type: "error",
          });
          setConfirmModal(null);
        }
      },
    });
  };

  const handleTogglePayerStatus = async (
    businessId: string,
    isActive: boolean,
  ) => {
    if (!businessId) return;
    const action = isActive ? "deactivate" : "activate";

    setConfirmModal({
      isOpen: true,
      title: `${isActive ? "Deactivate" : "Activate"} Payer`,
      message: `Are you sure you want to ${action} this payer?`,
      type: "warning",
      onConfirm: async () => {
        try {
          if (isActive) {
            await payerService.deactivatePayer(businessId);
          } else {
            await payerService.activatePayer(businessId);
          }
          await fetchBusinesses();
          setActiveDropdown(null);
          setToast({
            message: `Payer ${action}d successfully`,
            type: "success",
          });
          setConfirmModal(null);
        } catch (error: any) {
          console.error(`${action} payer failed:`, error);
          setToast({
            message: `Failed to ${action} payer. Please try again.`,
            type: "error",
          });
          setConfirmModal(null);
        }
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%" }}
            className="fixed top-6 left-1/2 z-[200] w-[92%] max-w-[550px]"
          >
            <div
              className={`rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border relative overflow-hidden flex flex-col bg-white ${
                toast.type === "success" ? "border-green-100" : "border-red-100"
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
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Eye size={18} className="text-green-500" />
                    </motion.div>
                  ) : (
                    <X
                      size={18}
                      className="bg-red-500 text-white rounded-full p-0.5"
                    />
                  )}
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    {toast.type === "error" && validationErrors.length > 0
                      ? `Validation Errors (${validationErrors.length})`
                      : toast.message}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setToast(null);
                    setValidationErrors([]);
                  }}
                  type="button"
                  title="Close notification"
                  aria-label="Close notification"
                  className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {toast.type === "error" && validationErrors.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar border-t border-red-50">
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
                          <td className="px-4 py-2 text-[10px] font-medium text-red-600 py-3 leading-tight">
                            {err.Message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!(toast.type === "error" && validationErrors.length > 0) && (
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

      {/* Header Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 flex items-center justify-start gap-8 h-14 shrink-0">
        <button
          onClick={() => setActiveTab("Payers")}
          className={`h-full px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "Payers"
              ? "border-tax-orange text-tax-orange"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Payers
        </button>
        <button
          onClick={() => setActiveTab("Recipients")}
          className={`h-full px-4 text-sm font-bold border-b-2 transition-all ${
            activeTab === "Recipients"
              ? "border-tax-orange text-tax-orange"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Recipients
        </button>
      </div>

      {activeTab === "Payers" ? (
        <>
          {/* Breadcrumb & Description */}
          <div className="px-8 py-4 bg-white/50 border-b border-slate-200 shrink-0">
            <h2 className="text-xl font-black text-slate-800 mb-1 tracking-tight">Address Book</h2>
            <p className="text-[11px] text-slate-500">
              Listed below are the payers added to your Address Book. You can view/update their information, manage recipients under each payer, and verify their TIN (EIN or SSN).
              <a href="#" className="ml-1 text-tax-orange hover:underline">
                Learn More
              </a>
            </p>
          </div>

          {/* Toolbar */}
          <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                Total Payers: <span className="text-slate-800">{totalRecords}</span>
              </span>
              <div className="relative max-w-sm w-full">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                  size={14}
                />
                <input
                  type="text"
                  title="Search payers"
                  aria-label="Search payers"
                  placeholder="Search by Payer's Name, TIN"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-tax-orange transition-colors"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  type="button"
                  title="Open date filter"
                  aria-label="Open date filter"
                  className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg text-xs font-bold transition-colors ${
                    startDate || endDate
                      ? "border-tax-orange text-tax-orange"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Calendar
                    size={14}
                    className={
                      startDate || endDate ? "text-tax-orange" : "text-slate-400"
                    }
                  />
                  {startDate && endDate
                    ? `${format(parseISO(startDate), "MMM d")} - ${format(parseISO(endDate), "MMM d")}`
                    : "Date Filter"}
                  <ChevronDown
                    size={14}
                    className={
                      showDatePicker
                        ? "rotate-180 transition-transform"
                        : "transition-transform"
                    }
                  />
                </button>

                <AnimatePresence>
                  {showDatePicker && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDatePicker(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute left-0 mt-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 w-80"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-black text-slate-800">
                            Filter by Date
                          </h4>
                          <button
                            onClick={() => {
                              setStartDate("");
                              setEndDate("");
                              setCurrentPage(1);
                            }}
                            type="button"
                            className="text-xs text-tax-orange font-bold hover:underline"
                          >
                            Reset
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400">
                              Start Date
                            </label>
                            <input
                              type="date"
                              title="Start date"
                              aria-label="Start date"
                              value={startDate}
                              onChange={(e) => {
                                setStartDate(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-tax-orange"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-slate-400">
                              End Date
                            </label>
                            <input
                              type="date"
                              title="End date"
                              aria-label="End date"
                              value={endDate}
                              min={startDate}
                              onChange={(e) => {
                                setEndDate(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-tax-orange disabled:opacity-50"
                            />
                          </div>
                          <button
                            onClick={() => setShowDatePicker(false)}
                            type="button"
                            className="w-full py-2.5 bg-tax-orange text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
                          >
                            Apply Filters
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingPayer(null);
                  setIsOffcanvasOpen(true);
                }}
                type="button"
                className="flex items-center gap-2 px-4 py-1.5 bg-tax-orange text-white text-xs font-black rounded-lg hover:bg-orange-700 transition-all shadow-md shadow-orange-500/10"
              >
                <Plus size={14} /> Add Payer
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto p-8 pt-4 pb-48 custom-scrollbar">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        title="Select all payers"
                        aria-label="Select all payers"
                        className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                        checked={
                          businessList.length > 0 &&
                          selectedPayers.length === businessList.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Payer Name
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Payer TIN
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      DBA/Trade Name
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Associated Recipients
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-tax-orange animate-spin" />
                          <p className="text-xs font-bold text-slate-400">
                            Loading businesses...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : businessList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-20 text-center">
                        <p className="text-xs font-bold text-slate-400">
                          No records found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    businessList.map((payer) => (
                      <tr
                        key={payer.BusinessId}
                        className={`group transition-colors ${!payer.IsActive ? "bg-slate-100/80 grayscale-[0.5]" : "hover:bg-slate-50/50"} ${activeDropdown === payer.BusinessId ? "relative z-10" : "z-0"}`}
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            title={`Select payer ${payer.BusinessNm || payer.PayerRef}`}
                            aria-label={`Select payer ${payer.BusinessNm || payer.PayerRef}`}
                            className="rounded border-slate-300 text-tax-orange focus:ring-tax-orange disabled:opacity-50"
                            checked={selectedPayers.includes(payer.BusinessId)}
                            onChange={() => toggleSelect(payer.BusinessId)}
                            disabled={!payer.IsActive}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-start justify-between">
                            <div className={!payer.IsActive ? "opacity-60" : ""}>
                              <button
                                onClick={() =>
                                  payer.IsActive &&
                                  handlePayerClick(payer.BusinessId)
                                }
                                type="button"
                                className={`text-sm font-bold text-left ${payer.IsActive ? "text-tax-orange hover:underline" : "text-slate-500 cursor-default"}`}
                              >
                                {payer.TINDetails.TINType === "SSN" &&
                                payer.IndividualNm
                                  ? `${payer.IndividualNm.FirstNm || ""} ${payer.IndividualNm.MiddleNm || ""} ${payer.IndividualNm.LastNm || ""}`.trim() ||
                                    payer.BusinessNm
                                  : payer.BusinessNm}
                              </button>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Ref No: {payer.PayerRef || "N/A"}
                              </p>
                              <p className="text-[10px] text-slate-300">
                                Added:{" "}
                                {format(
                                  parseISO(payer.CreatedTime.split(" ")[0]),
                                  "MM/dd/yyyy",
                                )}
                              </p>
                            </div>
                            {payer.IsActive && (
                              <button
                                onClick={() => handlePayerClick(payer.BusinessId)}
                                type="button"
                                title={`Edit payer ${payer.BusinessNm || payer.PayerRef}`}
                                aria-label={`Edit payer ${payer.BusinessNm || payer.PayerRef}`}
                                className="p-1.5 text-slate-300 hover:text-tax-orange transition-colors group-hover:opacity-100 opacity-0"
                              >
                                <Edit2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td
                          className={`p-4 ${!payer.IsActive ? "opacity-60" : ""}`}
                        >
                          <p className="text-xs font-mono text-slate-600 mb-1">
                            {payer.TINDetails.TINType} : XXX-XX-
                            {payer.TINDetails.Last4Digit}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                              <span className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center text-[8px] italic">
                                ?
                              </span>
                              {payer.TINDetails.TINMatchStatus || "Unverified"}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`p-4 ${!payer.IsActive ? "opacity-60" : ""}`}
                        >
                          <button
                            onClick={() =>
                              payer.IsActive && setShowManageDBAs(payer.BusinessId)
                            }
                            type="button"
                            className={`text-xs transition-colors font-medium border-b border-transparent border-dashed ${payer.IsActive ? "text-slate-600 hover:text-tax-orange hover:border-tax-orange" : "text-slate-400 cursor-default"}`}
                          >
                            {payer.DBADetails?.DBANm || "-"}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            disabled={!payer.IsActive}
                            onClick={() =>
                              setShowManageRecipients(payer.BusinessId)
                            }
                            type="button"
                            className={`text-xs font-bold px-4 py-1.5 rounded-lg border transition-all ${
                              payer.IsActive
                                ? "text-tax-orange hover:underline bg-tax-orange/5 border-tax-orange/10 hover:bg-tax-orange hover:text-white"
                                : "text-slate-400 bg-slate-200/50 border-slate-200 cursor-not-allowed opacity-50"
                            }`}
                          >
                            Manage
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {payer.IsActive && (
                              <button
                                type="button"
                                className="text-[10px] font-black text-tax-orange hover:underline uppercase tracking-tight flex items-center gap-1"
                              >
                                Add Recipients <ChevronRight size={12} />
                              </button>
                            )}
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown === payer.BusinessId
                                      ? null
                                      : payer.BusinessId,
                                  )
                                }
                                type="button"
                                title={`Open actions for ${payer.BusinessNm || payer.PayerRef}`}
                                aria-label={`Open actions for ${payer.BusinessNm || payer.PayerRef}`}
                                className="p-1.5 text-slate-400 hover:text-tax-deep-blue transition-colors"
                              >
                                <MoreVertical size={16} />
                              </button>

                              <AnimatePresence>
                                {activeDropdown === payer.BusinessId && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={() => setActiveDropdown(null)}
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                    >
                                      <div className="py-1">
                                        {payer.IsActive ? (
                                          <>
                                            <DropdownItem
                                              icon={<Eye size={14} />}
                                              label="View Payer"
                                              onClick={() =>
                                                handlePayerClick(payer.BusinessId)
                                              }
                                            />
                                            <DropdownItem
                                              icon={<Edit2 size={14} />}
                                              label="Edit Payer"
                                              onClick={() =>
                                                handlePayerClick(payer.BusinessId)
                                              }
                                            />
                                            <DropdownItem
                                              icon={<Plus size={14} />}
                                              label="Manage DBA's"
                                              onClick={() => {
                                                setShowManageDBAs(payer.BusinessId);
                                                setActiveDropdown(null);
                                              }}
                                            />
                                            <DropdownItem
                                              icon={<PowerOff size={14} />}
                                              label="Deactivate Payer"
                                              onClick={() =>
                                                handleTogglePayerStatus(
                                                  payer.BusinessId,
                                                  true,
                                                )
                                              }
                                            />
                                            <DropdownItem
                                              icon={<Trash2 size={14} />}
                                              label="Delete Payer"
                                              danger
                                              onClick={() =>
                                                handleDeletePayer(payer.BusinessId)
                                              }
                                            />
                                          </>
                                        ) : (
                                          <DropdownItem
                                            icon={<Power size={14} />}
                                            label="Activate Payer"
                                            onClick={() =>
                                              handleTogglePayerStatus(
                                                payer.BusinessId,
                                                false,
                                              )
                                            }
                                          />
                                        )}
                                      </div>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        type="button"
                        title={`Go to page ${pageNum}`}
                        aria-label={`Go to page ${pageNum}`}
                        className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${
                          currentPage === pageNum
                            ? "bg-tax-orange border-tax-orange text-white"
                            : "bg-white border-slate-200 text-slate-500 hover:border-tax-orange hover:text-tax-orange"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    type="button"
                    title="Next page"
                    aria-label="Next page"
                    className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${
                      currentPage === totalPages
                        ? "text-slate-300 border-slate-100"
                        : "text-slate-500 border-slate-200 hover:border-tax-orange hover:text-tax-orange"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {totalRecords > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalRecords)} of{" "}
                  {totalRecords}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">Show</span>
                <select
                  title="Items per page"
                  aria-label="Items per page"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-black outline-none focus:border-tax-orange transition-colors"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </>
      ) : selectedRecipient ? (
        <RecipientDetailPage
          recipient={selectedRecipient}
          onBack={() => setSelectedRecipient(null)}
          onAssignToBusiness={() => setShowAssignRecipient(true)}
          onUnassignBusiness={handleUnassignRecipient}
          onManageDBAs={() =>
            setShowManageRecipientDBAs(selectedRecipient.RecipientId)
          }
        />
      ) : (
        <>
          {/* Breadcrumb & Description */}
          <div className="px-8 py-4 bg-white/50 border-b border-slate-200 shrink-0 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 mb-1 tracking-tight">
                Recipients
              </h2>
              <p className="text-[11px] text-slate-500">
                All recipients created under your account.
              </p>
            </div>
            <button
              onClick={() => setShowAddRecipient(true)}
              type="button"
              className="flex items-center gap-2 px-4 py-1.5 bg-tax-orange text-white text-xs font-black rounded-lg hover:bg-orange-700 transition-all shadow-md shadow-orange-500/10"
            >
              <Plus size={14} /> Add New Recipient
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={14}
              />
              <input
                type="text"
                title="Search by BusinessId or PayerRef"
                aria-label="Search by BusinessId or PayerRef"
                placeholder="Search by BusinessId or PayerRef"
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-tax-orange transition-colors"
              />
            </div>

            <div className="relative">
              <button
                onClick={() =>
                  setShowRecipientDatePicker(!showRecipientDatePicker)
                }
                type="button"
                title="Open date filter"
                aria-label="Open date filter"
                className={`flex items-center gap-2 px-3 py-1.5 bg-white border rounded-lg text-xs font-bold transition-colors ${
                  recipientStartDate || recipientEndDate
                    ? "border-tax-orange text-tax-orange"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Calendar
                  size={14}
                  className={
                    recipientStartDate || recipientEndDate
                      ? "text-tax-orange"
                      : "text-slate-400"
                  }
                />
                {recipientStartDate && recipientEndDate
                  ? `${format(parseISO(recipientStartDate), "MMM d")} - ${format(parseISO(recipientEndDate), "MMM d")}`
                  : "Date Filter"}
                <ChevronDown
                  size={14}
                  className={
                    showRecipientDatePicker
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

              <AnimatePresence>
                {showRecipientDatePicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowRecipientDatePicker(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-0 mt-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 w-80"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-black text-slate-800">
                          Filter by Date
                        </h4>
                        <button
                          onClick={() => {
                            setRecipientStartDate("");
                            setRecipientEndDate("");
                            setAppliedRecipientStartDate("");
                            setAppliedRecipientEndDate("");
                            setRecipientCurrentPage(1);
                          }}
                          type="button"
                          className="text-xs text-tax-orange font-bold hover:underline"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400">
                            Start Date
                          </label>
                          <input
                            type="date"
                            title="Start date"
                            aria-label="Start date"
                            value={recipientStartDate}
                            onChange={(e) =>
                              setRecipientStartDate(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-tax-orange"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-slate-400">
                            End Date
                          </label>
                          <input
                            type="date"
                            title="End date"
                            aria-label="End date"
                            value={recipientEndDate}
                            min={recipientStartDate}
                            onChange={(e) =>
                              setRecipientEndDate(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-tax-orange disabled:opacity-50"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setAppliedRecipientStartDate(recipientStartDate);
                            setAppliedRecipientEndDate(recipientEndDate);
                            setRecipientCurrentPage(1);
                            setShowRecipientDatePicker(false);
                          }}
                          type="button"
                          className="w-full py-2.5 bg-tax-orange text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <select
              title="Filter by status"
              aria-label="Filter by status"
              value={recipientStatusFilter}
              onChange={(e) =>
                setRecipientStatusFilter(
                  e.target.value as "All" | "Active" | "Inactive",
                )
              }
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-tax-orange transition-colors"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              onClick={() => {
                setAppliedRecipientStartDate(recipientStartDate);
                setAppliedRecipientEndDate(recipientEndDate);
                setRecipientCurrentPage(1);
                fetchRecipients();
              }}
              type="button"
              className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Apply
            </button>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto p-8 pt-4 pb-48 custom-scrollbar">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Recipient Name
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Recipient ID
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Recipient Ref
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      TIN
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Type
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Status
                    </th>
                    <th className="p-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isRecipientsLoading ? (
                    <tr>
                      <td colSpan={7} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-10 h-10 text-tax-orange animate-spin" />
                          <p className="text-xs font-bold text-slate-400">
                            Loading recipients...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-20 text-center">
                        <p className="text-xs font-bold text-slate-400">
                          No records found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecipients.map((recipient) => (
                      <tr
                        key={recipient.RecipientId}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-4">
                          <button
                            onClick={() =>
                              handleEditRecipient(recipient.RecipientId)
                            }
                            type="button"
                            className="text-sm font-bold text-tax-orange hover:underline text-left"
                          >
                            {recipient.RecipientNm}
                          </button>
                          {/* <p className="text-[10px] text-slate-400 font-medium">
                            {recipient.AssignedPayerNm || "Not Assigned"}
                          </p> */}
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono text-slate-500">
                            {recipient.RecipientId}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-slate-600">
                            {recipient.RecipientRef}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono text-slate-600">
                            {recipient.TINType} &bull;&bull;&bull;&bull;
                            {recipient.Last4Digit}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-bold text-tax-deep-blue">
                            {recipient.RecipientType}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                              recipient.IsActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {recipient.IsActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setRecipientActiveDropdown(
                                  recipientActiveDropdown ===
                                    recipient.RecipientId
                                    ? null
                                    : recipient.RecipientId,
                                )
                              }
                              type="button"
                              title={`Open actions for ${recipient.RecipientNm}`}
                              aria-label={`Open actions for ${recipient.RecipientNm}`}
                              className="p-1.5 text-slate-400 hover:text-tax-deep-blue transition-colors"
                            >
                              <MoreVertical size={16} />
                            </button>

                            <AnimatePresence>
                              {recipientActiveDropdown ===
                                recipient.RecipientId && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() =>
                                      setRecipientActiveDropdown(null)
                                    }
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                  >
                                    <div className="py-1">
                                      <DropdownItem
                                        icon={<Eye size={14} />}
                                        label="View Recipient"
                                        onClick={() => {
                                          handleRecipientClick(
                                            recipient.RecipientId,
                                          );
                                          setRecipientActiveDropdown(null);
                                        }}
                                      />
                                      <DropdownItem
                                        icon={<Edit2 size={14} />}
                                        label="Edit Recipient"
                                        onClick={() => {
                                          handleEditRecipient(
                                            recipient.RecipientId,
                                          );
                                          setRecipientActiveDropdown(null);
                                        }}
                                      />
                                      <DropdownItem
                                        icon={<Building2 size={14} />}
                                        label="Manage DBAs"
                                        onClick={() => {
                                          setShowManageRecipientDBAs(
                                            recipient.RecipientId,
                                          );
                                          setRecipientActiveDropdown(null);
                                        }}
                                      />
                                      {recipient.IsActive ? (
                                        <DropdownItem
                                          icon={<PowerOff size={14} />}
                                          label="Deactivate Recipient"
                                          onClick={() =>
                                            handleToggleRecipientStatus(
                                              recipient.RecipientId,
                                              recipient.RecipientNm,
                                              true,
                                            )
                                          }
                                        />
                                      ) : (
                                        <DropdownItem
                                          icon={<Power size={14} />}
                                          label="Activate Recipient"
                                          onClick={() =>
                                            handleToggleRecipientStatus(
                                              recipient.RecipientId,
                                              recipient.RecipientNm,
                                              false,
                                            )
                                          }
                                        />
                                      )}
                                      <DropdownItem
                                        icon={<Trash2 size={14} />}
                                        label="Delete Recipient"
                                        danger
                                        onClick={() =>
                                          handleDeleteRecipient(
                                            recipient.RecipientId,
                                            recipient.RecipientNm,
                                          )
                                        }
                                      />
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setRecipientCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={displayCurrentPage === 1}
                    type="button"
                    title="Previous page"
                    aria-label="Previous page"
                    className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${
                      displayCurrentPage === 1
                        ? "text-slate-300 border-slate-100"
                        : "text-slate-500 border-slate-200 hover:border-tax-orange hover:text-tax-orange"
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: displayTotalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setRecipientCurrentPage(pageNum)}
                        type="button"
                        title={`Go to page ${pageNum}`}
                        aria-label={`Go to page ${pageNum}`}
                        className={`w-8 h-8 text-xs font-bold rounded-lg border transition-all ${
                          displayCurrentPage === pageNum
                            ? "bg-tax-orange border-tax-orange text-white"
                            : "bg-white border-slate-200 text-slate-500 hover:border-tax-orange hover:text-tax-orange"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setRecipientCurrentPage((prev) =>
                        Math.min(displayTotalPages, prev + 1),
                      )
                    }
                    disabled={displayCurrentPage === displayTotalPages}
                    type="button"
                    title="Next page"
                    aria-label="Next page"
                    className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-all ${
                      displayCurrentPage === displayTotalPages
                        ? "text-slate-300 border-slate-100"
                        : "text-slate-500 border-slate-200 hover:border-tax-orange hover:text-tax-orange"
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {displayTotalRecords > 0
                    ? (displayCurrentPage - 1) * recipientPageSize + 1
                    : 0}{" "}
                  -{" "}
                  {Math.min(
                    displayCurrentPage * recipientPageSize,
                    displayTotalRecords,
                  )}{" "}
                  of {displayTotalRecords}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">Show</span>
                <select
                  title="Items per page"
                  aria-label="Items per page"
                  value={recipientPageSize}
                  onChange={(e) => {
                    setRecipientPageSize(Number(e.target.value));
                    setRecipientCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-black outline-none focus:border-tax-orange transition-colors"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Manage Recipients Modal */}
      <AnimatePresence>
        {showManageRecipients && (
          <Modal
            title="Manage Associated Recipients"
            onClose={() => setShowManageRecipients(null)}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 mr-4">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={14}
                  />
                  <input
                    type="text"
                    title="Search assigned recipients"
                    aria-label="Search assigned recipients"
                    placeholder="Search assigned recipients..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-tax-orange transition-colors"
                  />
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-tax-deep-blue text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Assign New
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    No recipients assigned yet.
                  </p>
                  <p className="text-[9px] text-slate-300 mt-1 uppercase font-black">
                    Click "Assign New" to get started
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowManageRecipients(null)}
                  type="button"
                  className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-tax-deep-blue text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Manage DBAs Modal */}
      <AnimatePresence>
        {showManageDBAs && (
          <Modal
            title="Manage Trade Names (DBA's)"
            onClose={() => {
              setShowManageDBAs(null);
              setIsAddingDBA(false);
            }}
          >
            <div className="space-y-6">
              {!isAddingDBA ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Manage alternative business names for this payer.
                    </p>
                    <button
                      onClick={() => {
                        setIsAddingDBA(true);
                        setEditingDBAIndex(null);
                        setDbaForm({
                          SequenceId: "1",
                          DBAId: "00000000-0000-0000-0000-000000000000",
                          DBANm: "",
                          DBARef: "",
                          IsDefaultDBA: false,
                          Address: {
                            Address1: "",
                            Address2: "",
                            City: "",
                            ProvinceOrState: "",
                            ZipCd: "",
                            Country: "",
                          },
                        });
                      }}
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 bg-tax-orange/10 text-tax-orange text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-tax-orange hover:text-white transition-all shadow-sm"
                    >
                      <Plus size={14} /> Add New DBA
                    </button>
                  </div>

                  <div className="space-y-3">
                    {isDBALoading ? (
                      <div className="p-10 text-center">
                        <Loader2 className="w-8 h-8 text-tax-orange animate-spin mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-400">
                          Fetching DBAs...
                        </p>
                      </div>
                    ) : dbas.length === 0 ? (
                      <div className="p-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400">
                          No records found
                        </p>
                      </div>
                    ) : (
                      dbas.map((dba, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-between group"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              {dba.DBANm}
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                              Ref: {dba.DBARef}{" "}
                              {dba.IsDefaultDBA ? "• Default" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditDBA(index)}
                              type="button"
                              title={`Edit trade name ${dba.DBANm}`}
                              aria-label={`Edit trade name ${dba.DBANm}`}
                              className="p-2 text-slate-400 hover:text-tax-orange transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() =>
                                dba.DBAId && handleDeleteDBA(dba.DBAId)
                              }
                              type="button"
                              title={`Delete trade name ${dba.DBANm}`}
                              aria-label={`Delete trade name ${dba.DBANm}`}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                      Add New Trade Name
                    </h3>
                    <button
                      onClick={() => setIsAddingDBA(false)}
                      type="button"
                      title="Close trade name form"
                      aria-label="Close trade name form"
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>DBA Name</Label>
                      <Input
                        placeholder="e.g. Iceberg Icecreams"
                        value={dbaForm.DBANm}
                        onChange={(e) =>
                          setDbaForm({ ...dbaForm, DBANm: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>DBA Reference</Label>
                      <Input
                        placeholder="e.g. DBA1001"
                        value={dbaForm.DBARef}
                        onChange={(e) =>
                          setDbaForm({ ...dbaForm, DBARef: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Address Line 1</Label>
                      <Input
                        placeholder="Street Address"
                        value={dbaForm.Address.Address1}
                        onChange={(e) =>
                          setDbaForm({
                            ...dbaForm,
                            Address: {
                              ...dbaForm.Address,
                              Address1: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Address Line 2</Label>
                      <Input
                        placeholder="Suite/Apt"
                        value={dbaForm.Address.Address2}
                        onChange={(e) =>
                          setDbaForm({
                            ...dbaForm,
                            Address: {
                              ...dbaForm.Address,
                              Address2: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Input
                        placeholder="City"
                        value={dbaForm.Address.City}
                        onChange={(e) =>
                          setDbaForm({
                            ...dbaForm,
                            Address: {
                              ...dbaForm.Address,
                              City: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Country</Label>
                      <select
                        title="Country"
                        aria-label="Country"
                        value={dbaForm.Address.Country}
                        onChange={(e) =>
                          setDbaForm({
                            ...dbaForm,
                            Address: {
                              ...dbaForm.Address,
                              Country: e.target.value,
                              ProvinceOrState: "",
                            },
                          })
                        }
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
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
                      {dbaForm.Address.Country === "US" ||
                      !dbaForm.Address.Country ? (
                        <select
                          title="State"
                          aria-label="State"
                          value={dbaForm.Address.ProvinceOrState}
                          onChange={(e) =>
                            setDbaForm({
                              ...dbaForm,
                              Address: {
                                ...dbaForm.Address,
                                ProvinceOrState: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                        >
                          <option value="">Select State</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : dbaForm.Address.Country === "CA" ? (
                        <select
                          title="Province"
                          aria-label="Province"
                          value={dbaForm.Address.ProvinceOrState}
                          onChange={(e) =>
                            setDbaForm({
                              ...dbaForm,
                              Address: {
                                ...dbaForm.Address,
                                ProvinceOrState: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
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
                          value={dbaForm.Address.ProvinceOrState}
                          onChange={(e) =>
                            setDbaForm({
                              ...dbaForm,
                              Address: {
                                ...dbaForm.Address,
                                ProvinceOrState: e.target.value,
                              },
                            })
                          }
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Zip Code</Label>
                      <Input
                        placeholder="Zip Code"
                        value={dbaForm.Address.ZipCd}
                        onChange={(e) =>
                          setDbaForm({
                            ...dbaForm,
                            Address: {
                              ...dbaForm.Address,
                              ZipCd: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="isDefaultDBA"
                      title="Set as default trade name"
                      aria-label="Set as default trade name"
                      className="w-4 h-4 rounded border-slate-300 text-tax-orange focus:ring-tax-orange"
                      checked={dbaForm.IsDefaultDBA}
                      onChange={(e) =>
                        setDbaForm({
                          ...dbaForm,
                          IsDefaultDBA: e.target.checked,
                        })
                      }
                    />
                    <label
                      htmlFor="isDefaultDBA"
                      className="text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      Set as Default Trade Name
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setIsAddingDBA(false)}
                      type="button"
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-400 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDBA}
                      type="button"
                      className="flex-1 px-4 py-3 bg-tax-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={14} /> Save DBA
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Manage Recipient DBAs Modal */}
      <AnimatePresence>
        {showManageRecipientDBAs && (
          <Modal
            title="Manage Trade Names (DBA's)"
            onClose={() => {
              setShowManageRecipientDBAs(null);
              setIsAddingRecipientDBA(false);
            }}
          >
            <div className="space-y-6">
              {!isAddingRecipientDBA ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      Manage alternative business names for this recipient.
                    </p>
                    <button
                      onClick={() => {
                        setIsAddingRecipientDBA(true);
                        setEditingRecipientDBAIndex(null);
                        setRecipientDbaForm({
                          SequenceId: "1",
                          DBAId: "00000000-0000-0000-0000-000000000000",
                          DBANm: "",
                          DBARef: "",
                          IsDefaultDBA: false,
                          Address: {
                            Address1: "",
                            Address2: "",
                            City: "",
                            ProvinceOrState: "",
                            ZipCd: "",
                            Country: "",
                          },
                        });
                      }}
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 bg-tax-orange/10 text-tax-orange text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-tax-orange hover:text-white transition-all shadow-sm"
                    >
                      <Plus size={14} /> Add New DBA
                    </button>
                  </div>

                  <div className="space-y-3">
                    {isRecipientDBALoading ? (
                      <div className="p-10 text-center">
                        <Loader2 className="w-8 h-8 text-tax-orange animate-spin mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-400">
                          Fetching DBAs...
                        </p>
                      </div>
                    ) : recipientDBAs.length === 0 ? (
                      <div className="p-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400">
                          No records found
                        </p>
                      </div>
                    ) : (
                      recipientDBAs.map((dba, index) => (
                        <div
                          key={index}
                          className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-between group"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">
                              {dba.DBANm}
                            </h4>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">
                              Ref: {dba.DBARef}{" "}
                              {dba.IsDefaultDBA ? "• Default" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditRecipientDBA(index)}
                              type="button"
                              title={`Edit trade name ${dba.DBANm}`}
                              aria-label={`Edit trade name ${dba.DBANm}`}
                              className="p-2 text-slate-400 hover:text-tax-orange transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() =>
                                dba.DBAId && handleDeleteRecipientDBA(dba.DBAId)
                              }
                              type="button"
                              title={`Delete trade name ${dba.DBANm}`}
                              aria-label={`Delete trade name ${dba.DBANm}`}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                      Add New Trade Name
                    </h3>
                    <button
                      onClick={() => setIsAddingRecipientDBA(false)}
                      type="button"
                      title="Close trade name form"
                      aria-label="Close trade name form"
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>DBA Name</Label>
                      <Input
                        placeholder="e.g. Iceberg Icecreams"
                        value={recipientDbaForm.DBANm}
                        onChange={(e) =>
                          setRecipientDbaForm({
                            ...recipientDbaForm,
                            DBANm: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>DBA Reference</Label>
                      <Input
                        placeholder="e.g. DBA1001"
                        value={recipientDbaForm.DBARef}
                        onChange={(e) =>
                          setRecipientDbaForm({
                            ...recipientDbaForm,
                            DBARef: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Address Line 1</Label>
                      <Input
                        placeholder="Street Address"
                        value={recipientDbaForm.Address.Address1}
                        onChange={(e) =>
                          setRecipientDbaForm({
                            ...recipientDbaForm,
                            Address: {
                              ...recipientDbaForm.Address,
                              Address1: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Address Line 2</Label>
                      <Input
                        placeholder="Suite/Apt"
                        value={recipientDbaForm.Address.Address2}
                        onChange={(e) =>
                          setRecipientDbaForm({
                            ...recipientDbaForm,
                            Address: {
                              ...recipientDbaForm.Address,
                              Address2: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>City</Label>
                      <Input
                        placeholder="City"
                        value={recipientDbaForm.Address.City}
                        onChange={(e) =>
                          setRecipientDbaForm({
                            ...recipientDbaForm,
                            Address: {
                              ...recipientDbaForm.Address,
                              City: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Country</Label>
                      <select
                        title="Country"
                        aria-label="Country"
                        value={recipientDbaForm.Address.Country}
                        onChange={(e) =>
                          setRecipientDbaForm({
                            ...recipientDbaForm,
                            Address: {
                              ...recipientDbaForm.Address,
                              Country: e.target.value,
                              ProvinceOrState: "",
                            },
                          })
                        }
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
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
                      {recipientDbaForm.Address.Country === "US" ||
                      !recipientDbaForm.Address.Country ? (
                        <select
                          title="State"
                          aria-label="State"
                          value={recipientDbaForm.Address.ProvinceOrState}
                          onChange={(e) =>
                            setRecipientDbaForm({
                              ...recipientDbaForm,
                              Address: {
                                ...recipientDbaForm.Address,
                                ProvinceOrState: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
                        >
                          <option value="">Select State</option>
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : recipientDbaForm.Address.Country === "CA" ? (
                        <select
                          title="Province"
                          aria-label="Province"
                          value={recipientDbaForm.Address.ProvinceOrState}
                          onChange={(e) =>
                            setRecipientDbaForm({
                              ...recipientDbaForm,
                              Address: {
                                ...recipientDbaForm.Address,
                                ProvinceOrState: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all"
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
                          value={recipientDbaForm.Address.ProvinceOrState}
                          onChange={(e) =>
                            setRecipientDbaForm({
                              ...recipientDbaForm,
                              Address: {
                                ...recipientDbaForm.Address,
                                ProvinceOrState: e.target.value,
                              },
                            })
                          }
                        />
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Zip Code</Label>
                      <Input
                        placeholder="Zip Code"
                        value={recipientDbaForm.Address.ZipCd}
                        onChange={(e) =>
                          setRecipientDbaForm({
                            ...recipientDbaForm,
                            Address: {
                              ...recipientDbaForm.Address,
                              ZipCd: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={() => setIsAddingRecipientDBA(false)}
                      type="button"
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-400 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRecipientDBA}
                      type="button"
                      className="flex-1 px-4 py-3 bg-tax-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={14} /> Save DBA
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <PayerOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
        payer={editingPayer}
        onSave={(data) => {
          console.log("Saved Payer Data:", data);
          fetchBusinesses();
        }}
      />

      {selectedRecipient && (
        <AssignRecipientModal
          isOpen={showAssignRecipient}
          onClose={() => setShowAssignRecipient(false)}
          recipientId={selectedRecipient.RecipientId}
          recipientNm={selectedRecipient.RecipientNm}
          onAssign={handleAssignRecipient}
        />
      )}

      {/* Add / Edit Recipient Offcanvas */}
      <AnimatePresence>
        {(showAddRecipient || !!editingRecipientId) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddRecipient(false);
                setEditingRecipientId(null);
                setEditingRecipientData(null);
              }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full lg:max-w-[65%] md:max-w-[80%] max-w-full bg-white shadow-2xl z-[101] flex flex-col border-l border-slate-100"
            >
              <AddRecipientWizard
                onClose={() => {
                  setShowAddRecipient(false);
                  setEditingRecipientId(null);
                  setEditingRecipientData(null);
                }}
                onSubmit={handleCreateRecipient}
                isSubmitting={isCreatingRecipient}
                initialData={editingRecipientData || undefined}
                isEditMode={!!editingRecipientId}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-tax-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8 pb-4">
                <div
                  className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${
                    confirmModal.type === "danger"
                      ? "bg-red-50 text-red-500"
                      : "bg-orange-50 text-orange-500"
                  }`}
                >
                  {confirmModal.type === "danger" ? (
                    <Trash2 size={28} />
                  ) : (
                    <PowerOff size={28} />
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  {confirmModal.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
              <div className="p-8 pt-4 flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  type="button"
                  className="flex-1 py-3.5 px-6 bg-slate-50 text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-100 transition-all border border-slate-100"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  type="button"
                  className={`flex-1 py-3.5 px-6 text-white text-xs font-black rounded-2xl transition-all shadow-lg active:scale-95 ${
                    confirmModal.type === "danger"
                      ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                      : "bg-tax-orange hover:bg-orange-600 shadow-orange-500/20"
                  }`}
                >
                  CONFIRM
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recipient Create Result Modal */}
      <AnimatePresence>
        {recipientResult && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRecipientResult(null)}
              className="absolute inset-0 bg-tax-deep-blue/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col"
            >
              <div className="p-8 pb-4 overflow-y-auto custom-scrollbar">
                {recipientResult.success.length > 0 && (
                  <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-green-50 text-green-600">
                    <CheckCircle2 size={28} />
                  </div>
                )}
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  {recipientResult.success.length > 0
                    ? "Recipient Created"
                    : "Recipient Creation Failed"}
                </h3>

                {recipientResult.success.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-2">
                      Success ({recipientResult.success.length})
                    </p>
                    <div className="space-y-2">
                      {recipientResult.success.map((s, idx) => (
                        <div
                          key={idx}
                          className="bg-green-50 border border-green-100 rounded-xl p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              Recipient ID
                            </span>
                            <span className="text-xs font-mono text-slate-700">
                              {s.RecipientId}
                            </span>
                          </div>
                          {s.PayeeRef && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                Recipient Ref
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {s.PayeeRef}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recipientResult.errors.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-2">
                      Errors (
                      {recipientResult.errors.reduce(
                        (sum, e) => sum + e.Errors.length,
                        0,
                      )}
                      )
                    </p>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-red-100 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-red-50/80 backdrop-blur-md z-10">
                          <tr>
                            <th className="px-4 py-2 text-[9px] font-black uppercase text-red-400 tracking-widest border-b border-red-100">
                              ID
                            </th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase text-red-400 tracking-widest border-b border-red-100">
                              Error Name
                            </th>
                            <th className="px-4 py-2 text-[9px] font-black uppercase text-red-400 tracking-widest border-b border-red-100">
                              Message
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-50">
                          {recipientResult.errors.flatMap((e, idx) =>
                            e.Errors.map((err, errIdx) => (
                              <tr
                                key={`${idx}-${errIdx}`}
                                className="hover:bg-red-50/30 transition-colors"
                              >
                                <td className="px-4 py-2 text-[9px] font-bold text-red-600 font-mono tracking-tighter whitespace-nowrap">
                                  {err.Id}
                                </td>
                                <td className="px-4 py-2 text-[10px] font-bold text-red-800 whitespace-nowrap">
                                  {err.Name}
                                </td>
                                <td className="px-4 py-2 text-[10px] font-medium text-red-600 leading-tight">
                                  {err.Message}
                                </td>
                              </tr>
                            )),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 pt-4 shrink-0">
                <button
                  onClick={() => setRecipientResult(null)}
                  type="button"
                  className={`w-full py-3.5 px-6 text-white text-xs font-black rounded-2xl transition-all shadow-lg active:scale-95 ${
                    recipientResult.success.length > 0
                      ? "bg-green-600 hover:bg-green-700 shadow-green-500/20"
                      : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                  }`}
                >
                  DONE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
        ${
          danger
            ? "text-red-500 hover:bg-red-50"
            : "text-slate-600 hover:bg-slate-50 hover:text-tax-blue"
        }
      `}
    >
      <span className={danger ? "text-red-400" : "text-slate-400"}>{icon}</span>
      {label}
    </button>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">
      {children}
    </label>
  );
}

function Input({ ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      title={props.title ?? props["aria-label"] ?? props.placeholder}
      className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-tax-orange focus:ring-4 focus:ring-orange-50 transition-all placeholder:text-slate-200 ${props.className}`}
    />
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-tax-deep-blue/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 pb-0 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            type="button"
            title="Close modal"
            aria-label="Close modal"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 pt-4 overflow-y-auto max-h-[80vh] custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
