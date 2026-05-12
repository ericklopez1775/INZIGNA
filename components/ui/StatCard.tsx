import { ReactNode } from "react";
import GlassCard from "./GlassCard";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  subtitle,
  accentColor = "text-brand-red",
}: StatCardProps) {
  return (
    <GlassCard hover className="relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl glass-sm ${accentColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? "text-emerald-400" : "text-red-400"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-sm text-white/50 mt-1">{title}</p>
        {subtitle && <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>}
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-5">
        <div className="w-16 h-16 scale-150">{icon}</div>
      </div>
    </GlassCard>
  );
}
