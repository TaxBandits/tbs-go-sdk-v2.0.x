import { useState, type ReactNode } from "react";
import type { TINType } from "../types";
import {
  Building2,
  ChevronRight,
  FileText,
  MapPin,
  Plus,
} from "lucide-react";

export interface RecipientDetail {
  RecipientId: string;
  RecipientNm: string;
  RecipientRef: string;
  SequenceId?: string;
  RecipientType?: "Individual" | "Business";
  TINType: TINType;
  Last4Digit: string;
  IsActive?: boolean;
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
  AssignedBusinesses?: Array<{
    BusinessId: string;
    BusinessNm: string;
    PayerRef?: string;
    PayeeRef?: string;
    SequenceId?: string;
  }>;

  // TIN & Name Components
  IRSRegisteredNm?: string;
  TaxClassification?: string;
  PrimaryLegalNm?: string;
  BusinessNm?: string;
  NameCtrl?: string;

  // DBA Registry
  DBADetails?: Array<{ DBAId?: string; DBANm: string; DBARef: string }>;

  // IRS Annex Forms
  W9?: {
    FederalTaxClassification?: string;
    ExemptPayeeCode?: string;
    FATCAReportingCode?: string;
    BackupWithholdingStatus?: boolean;
  };
  W8BEN?: {
    CitizenOfCountry?: string;
    FTIN?: string;
    FTINNotLegallyRequired?: boolean;
  };
  Form1042S?: {
    Chapter3StatusCode?: string;
    Chapter4StatusCode?: string;
    GIIN?: string;
    LOBCode?: string;
  };
}

interface RecipientDetailPageProps {
  recipient: RecipientDetail;
  onBack: () => void;
  onAssignToBusiness?: () => void;
  onUnassignBusiness?: (businessId: string) => void;
  onManageDBAs?: () => void;
}

const TABS = [
  "Overview & Address",
  "TIN & Name Components",
  "DBA Registry Details",
  "IRS Annex Forms (W9/W8/1042S)",
] as const;

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="py-3 border-b border-slate-100 last:border-b-0">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center gap-2 text-tax-deep-blue mb-2 pb-3 border-b border-slate-100">
        {icon}
        <h3 className="text-base font-black tracking-tight">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function RecipientDetailPage({
  recipient,
  onBack,
  onAssignToBusiness,
  onUnassignBusiness,
  onManageDBAs,
}: RecipientDetailPageProps) {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Overview & Address");

  const assignedBusinesses = recipient.AssignedBusinesses || [];
  const isActive = recipient.IsActive ?? true;

  const addressParts = [
    recipient.Address1,
    recipient.Address2,
    recipient.City,
    recipient.ProvinceOrState,
    recipient.ZipCd,
  ].filter(Boolean);
  const addressLine =
    addressParts.length > 0 ? addressParts.join(", ") : "Not Provided";

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-8 py-6 border-b border-slate-200 bg-white shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold mb-4">
          <button
            onClick={onBack}
            type="button"
            className="text-blue-600 hover:underline"
          >
            Recipients
          </button>
          <ChevronRight size={12} className="text-slate-400" />
          <span className="text-slate-400">{recipient.RecipientNm}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {recipient.RecipientNm}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              {recipient.RecipientId}
            </p>
          </div>

        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 mt-6 border-b border-slate-100 -mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
              className={`pb-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab
                  ? "border-tax-deep-blue text-tax-deep-blue"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
        {activeTab === "Overview & Address" && (
          <>
            <div className="flex items-start gap-6">
              <SectionCard
                icon={<Building2 size={18} />}
                title="Recipient Identification"
              >
                <InfoRow label="Display Name" value={recipient.RecipientNm} />
                <InfoRow
                  label="Recipient Ref (PayeeRef)"
                  value={recipient.RecipientRef}
                />
                <InfoRow
                  label="Sequence ID"
                  value={recipient.SequenceId || "01"}
                />
                <InfoRow
                  label="Name Control"
                  value={recipient.NameCtrl || "Not Provided"}
                />
                <InfoRow
                  label="Recipient Type"
                  value={recipient.RecipientType || "Individual"}
                />
                <InfoRow label="TIN Type" value={recipient.TINType} />
                <InfoRow
                  label="Taxpayer Ident Number (TIN)"
                  value={`••••${recipient.Last4Digit}`}
                />
              </SectionCard>

              <SectionCard
                icon={<MapPin size={18} />}
                title="Address & Communication"
              >
                <InfoRow label="Address" value={addressLine} />
                <InfoRow
                  label="Country Code"
                  value={recipient.Country || "US"}
                />
                <InfoRow
                  label="Email"
                  value={
                    recipient.Email ? (
                      <a
                        href={`mailto:${recipient.Email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {recipient.Email}
                      </a>
                    ) : (
                      "Not Provided"
                    )
                  }
                />
                <InfoRow
                  label="Phone"
                  value={recipient.Phone || "Not Provided"}
                />
                <InfoRow label="Fax" value={recipient.Fax || "Not Provided"} />
                <InfoRow
                  label="Date of Birth"
                  value={recipient.DateOfBirth || "Not Provided"}
                />
              </SectionCard>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-tax-deep-blue">
                  <Building2 size={18} />
                  <h3 className="text-base font-black tracking-tight">
                    Assigned Businesses
                  </h3>
                </div>
                <button
                  onClick={onAssignToBusiness}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 bg-tax-deep-blue text-white text-xs font-black rounded-lg hover:bg-slate-800 transition-all shadow-md"
                >
                  <Plus size={14} /> Assign to Business
                </button>
              </div>

              {assignedBusinesses.length === 0 ? (
                <div className="p-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Building2
                    size={32}
                    className="text-slate-300 mx-auto mb-3"
                  />
                  <p className="text-sm font-bold text-slate-500">
                    Not assigned to any business
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Linking recipients to businesses allows creating returns
                    and mapping correct Payer/Payee references.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {assignedBusinesses.map((b) => (
                    <div
                      key={b.BusinessId}
                      className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200"
                    >
                      <p className="text-sm font-black text-slate-800">
                        {b.BusinessNm}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 mb-3">
                        BusinessId: {b.BusinessId}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                            Payer Ref
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            {b.PayerRef || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                            Payee Ref
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            {b.PayeeRef || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                            Sequence ID
                          </p>
                          <p className="text-xs font-bold text-slate-700">
                            {b.SequenceId || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => onUnassignBusiness?.(b.BusinessId)}
                          className="text-xs font-bold text-red-500 hover:underline"
                        >
                          Unassign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "TIN & Name Components" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-tax-deep-blue mb-4 pb-3 border-b border-slate-100">
              <FileText size={18} />
              <h3 className="text-base font-black tracking-tight">
                TIN details &amp; Legal Name Breakdown
              </h3>
            </div>

            <div className="flex items-start gap-10">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                  IRS Registered Name
                </p>
                <InfoRow
                  label="Tax Classification"
                  value={
                    recipient.TaxClassification ||
                    "Individual / Sole Proprietor"
                  }
                />
                <InfoRow
                  label="Primary Legal Name"
                  value={
                    recipient.PrimaryLegalNm ||
                    recipient.IRSRegisteredNm ||
                    recipient.RecipientNm
                  }
                />
                <InfoRow
                  label="Sequence ID"
                  value={recipient.SequenceId || "01"}
                />
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                  Business Entity Name Components (BusinessNm)
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                    BusinessNm
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {recipient.BusinessNm || recipient.RecipientNm}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "DBA Registry Details" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-tax-deep-blue">
                <Building2 size={18} />
                <h3 className="text-base font-black tracking-tight">
                  Doing Business As (DBADetails) Registry
                </h3>
              </div>
              {onManageDBAs && (
                <button
                  onClick={onManageDBAs}
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 bg-tax-orange/10 text-tax-orange text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-tax-orange hover:text-white transition-all shadow-sm"
                >
                  <Plus size={14} /> Manage DBAs
                </button>
              )}
            </div>

            {!recipient.DBADetails || recipient.DBADetails.length === 0 ? (
              <div className="p-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Building2
                  size={32}
                  className="text-slate-300 mx-auto mb-3"
                />
                <p className="text-sm font-bold text-slate-500">
                  No DBA Details registered for this recipient
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Manage DBAs" to add a trade name for this recipient.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recipient.DBADetails.map((dba) => (
                  <div
                    key={dba.DBAId}
                    className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center gap-3"
                  >
                    <Building2 size={16} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {dba.DBANm}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                        Ref: {dba.DBARef}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "IRS Annex Forms (W9/W8/1042S)" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-tax-deep-blue tracking-tight mb-4 pb-3 border-b border-slate-100">
                Form W-9 (Request for Taxpayer Identification and
                Certification)
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <InfoRow
                  label="Federal Tax Classification"
                  value={
                    recipient.W9?.FederalTaxClassification || "Not Provided"
                  }
                />
                <InfoRow
                  label="Exempt Payee Code"
                  value={recipient.W9?.ExemptPayeeCode || "None"}
                />
                <InfoRow
                  label="FATCA Reporting Code"
                  value={recipient.W9?.FATCAReportingCode || "None"}
                />
                <InfoRow
                  label="Backup Withholding Status"
                  value={recipient.W9?.BackupWithholdingStatus ? "Yes" : "No"}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-tax-deep-blue tracking-tight mb-4 pb-3 border-b border-slate-100">
                Form W-8BEN (Certificate of Foreign Status of Beneficial
                Owner)
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <InfoRow
                  label="Citizen of Country"
                  value={
                    recipient.W8BEN?.CitizenOfCountry ||
                    "Not Provided (U.S. Resident)"
                  }
                />
                <InfoRow
                  label="FTIN (Foreign Tax ID)"
                  value={recipient.W8BEN?.FTIN || "None"}
                />
                <InfoRow
                  label="FTIN Not Legally Required"
                  value={recipient.W8BEN?.FTINNotLegallyRequired ? "Yes" : "No"}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-tax-deep-blue tracking-tight mb-4 pb-3 border-b border-slate-100">
                Form 1042-S (Foreign Person's U.S. Source Income Subject to
                Withholding)
              </h3>
              <div className="grid grid-cols-4 gap-6">
                <InfoRow
                  label="Chapter 3 Status Code"
                  value={recipient.Form1042S?.Chapter3StatusCode || "None"}
                />
                <InfoRow
                  label="Chapter 4 Status Code"
                  value={recipient.Form1042S?.Chapter4StatusCode || "None"}
                />
                <InfoRow
                  label="GIIN (Global Intermediary ID)"
                  value={recipient.Form1042S?.GIIN || "None"}
                />
                <InfoRow
                  label="LOB Code"
                  value={recipient.Form1042S?.LOBCode || "None"}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              This info was developed by another user. It may be inaccurate or
              unsafe.{" "}
              <button type="button" className="text-blue-600 hover:underline">
                Report legal issue
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
