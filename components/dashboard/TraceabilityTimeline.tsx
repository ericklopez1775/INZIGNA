import { TraceEventData } from "@/lib/types";
import { GitCommitHorizontal, User, Package, CheckCircle, AlertCircle, Truck, CreditCard } from "lucide-react";

interface TimelineProps {
  events: TraceEventData[];
  compact?: boolean;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  CREATED: <Package size={14} />,
  UPDATED: <GitCommitHorizontal size={14} />,
  STATUS_CHANGED: <CheckCircle size={14} />,
  PAYMENT: <CreditCard size={14} />,
  SHIPPED: <Truck size={14} />,
  ASSIGNED: <User size={14} />,
  ERROR: <AlertCircle size={14} />,
};

const EVENT_COLORS: Record<string, string> = {
  CREATED: "text-blue-400 bg-blue-400/15 border-blue-400/20",
  UPDATED: "text-gray-400 bg-gray-400/15 border-gray-400/20",
  STATUS_CHANGED: "text-emerald-400 bg-emerald-400/15 border-emerald-400/20",
  PAYMENT: "text-purple-400 bg-purple-400/15 border-purple-400/20",
  SHIPPED: "text-cyan-400 bg-cyan-400/15 border-cyan-400/20",
  ASSIGNED: "text-amber-400 bg-amber-400/15 border-amber-400/20",
  ERROR: "text-red-400 bg-red-400/15 border-red-400/20",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function TraceabilityTimeline({ events, compact = false }: TimelineProps) {
  if (!events.length) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">
        Sin eventos de trazabilidad
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const color = EVENT_COLORS[event.eventType] || EVENT_COLORS.UPDATED;
        const icon = EVENT_ICONS[event.eventType] || <GitCommitHorizontal size={14} />;

        return (
          <li key={event.id} className="flex gap-4 group">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center z-10 ${color}`}>
                {icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-white/8 my-1" />}
            </div>
            {/* Content */}
            <div className={`flex-1 ${!isLast ? "pb-4" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white">{event.title}</p>
                <span className="text-xs text-white/30 whitespace-nowrap flex-shrink-0">
                  {formatDate(event.createdAt)}
                </span>
              </div>
              {!compact && event.description && (
                <p className="text-xs text-white/40 mt-0.5">{event.description}</p>
              )}
              {!compact && event.user && (
                <p className="text-xs text-white/30 mt-1">por {event.user.name}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
