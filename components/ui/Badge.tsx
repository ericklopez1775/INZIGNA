import { STATUS_COLORS, PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/types";

interface BadgeProps {
  label: string;
  type?: "status" | "type" | "role" | "custom";
  colorClass?: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "text-red-400 bg-red-400/10 border-red-400/20",
  COLLABORATOR: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CLIENT: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function Badge({ label, type = "status", colorClass }: BadgeProps) {
  let displayLabel = label;
  let color = colorClass || "text-gray-400 bg-gray-400/10 border-gray-400/20";

  if (type === "status") {
    displayLabel =
      PROJECT_STATUS_LABELS[label as keyof typeof PROJECT_STATUS_LABELS] ||
      ORDER_STATUS_LABELS[label as keyof typeof ORDER_STATUS_LABELS] ||
      label;
    color = STATUS_COLORS[label] || color;
  } else if (type === "type") {
    displayLabel = PROJECT_TYPE_LABELS[label as keyof typeof PROJECT_TYPE_LABELS] || label;
  } else if (type === "role") {
    displayLabel = label === "ADMIN" ? "Admin" : label === "COLLABORATOR" ? "Colaborador" : "Cliente";
    color = ROLE_COLORS[label] || color;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {displayLabel}
    </span>
  );
}
