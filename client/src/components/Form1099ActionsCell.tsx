import {
  Eye,
  Pencil,
  Trash2,
  Send,
  FileText,
  ExternalLink,
  Paperclip,
  Info,
  ListTree,
} from "lucide-react";
import type { Form1099UtilityListRecords } from "../services/form1099UtilityService";

interface Form1099ActionsCellProps {
  record: Form1099UtilityListRecords;
  onView: (record: Form1099UtilityListRecords) => void;
  onEdit: (record: Form1099UtilityListRecords) => void;
  onDelete: (record: Form1099UtilityListRecords) => void;
  onTransmit: (record: Form1099UtilityListRecords) => void;
  onDraft: (record: Form1099UtilityListRecords) => void;
  onUrls: (record: Form1099UtilityListRecords) => void;
  onAttach: (record: Form1099UtilityListRecords) => void;
  onStatus: (record: Form1099UtilityListRecords) => void;
  onStatusLog: (record: Form1099UtilityListRecords) => void;
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="p-1.5 text-slate-400 hover:text-tax-orange hover:bg-orange-50 rounded-lg transition-colors"
    >
      {children}
    </button>
  );
}

function Chip({
  label,
  icon,
  color,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  color: "purple" | "blue" | "amber" | "slate";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const colorClasses: Record<typeof color, string> = {
    purple:
      "bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100",
    slate: "bg-slate-50 text-slate-400 border-slate-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
        disabled
          ? `${colorClasses.slate} cursor-not-allowed opacity-70`
          : colorClasses[color]
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function Form1099ActionsCell({
  record,
  onView,
  onEdit,
  onDelete,
  onTransmit,
  onDraft,
  onUrls,
  onAttach,
  onStatus,
  onStatusLog,
}: Form1099ActionsCellProps) {
  const isTransmitted =
    (record.FederalStatus?.Status || "").toUpperCase() === "TRANSMITTED";

  return (
    <div className="flex flex-col items-start gap-2 py-1">
      <div className="flex items-center gap-1">
        <IconButton title="View" onClick={() => onView(record)}>
          <Eye size={15} />
        </IconButton>
        <IconButton title="Edit" onClick={() => onEdit(record)}>
          <Pencil size={15} />
        </IconButton>
        <IconButton title="Delete" onClick={() => onDelete(record)}>
          <Trash2 size={15} />
        </IconButton>
        <IconButton title="Transmit" onClick={() => onTransmit(record)}>
          <Send size={15} />
        </IconButton>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <Chip
          label="Draft"
          icon={<FileText size={12} />}
          color="purple"
          onClick={() => onDraft(record)}
        />
        <Chip
          label="URLs"
          icon={<ExternalLink size={12} />}
          color="blue"
          onClick={() => onUrls(record)}
        />
        <Chip
          label="Attach"
          icon={<Paperclip size={12} />}
          color="amber"
          onClick={() => onAttach(record)}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Chip
          label="Status"
          icon={<Info size={12} />}
          color="slate"
          onClick={() => onStatus(record)}
        />
        <Chip
          label="Status Log"
          icon={<ListTree size={12} />}
          color="slate"
          disabled={!isTransmitted}
          onClick={isTransmitted ? () => onStatusLog(record) : undefined}
        />
      </div>
    </div>
  );
}
