import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import { ProjectWithRelations, PROJECT_TYPE_LABELS } from "@/lib/types";

interface ProjectCardProps {
  project: ProjectWithRelations;
  basePath?: string;
}

function formatDate(d: string | null) {
  if (!d) return null;
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}

const TYPE_ICONS: Record<string, string> = {
  MARKETING_DIGITAL: "📣",
  CONTENT_CREATION: "✏️",
  ADS_CAMPAIGN: "⚡",
  DTF_ORDER: "🎨",
  EMBROIDERY_ORDER: "🧵",
  LASER_ENGRAVING: "🔆",
  DIGITAL_SERVICE: "💻",
  PHYSICAL_PRODUCT: "📦",
};

export default function ProjectCard({ project, basePath = "/dashboard/projects" }: ProjectCardProps) {
  return (
    <GlassCard hover padding="none" className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{TYPE_ICONS[project.type] || "📋"}</span>
            <div>
              <p className="text-sm font-semibold text-white line-clamp-1">{project.title}</p>
              <p className="text-xs text-white/40 mt-0.5">{PROJECT_TYPE_LABELS[project.type]}</p>
            </div>
          </div>
          <Badge label={project.status} type="status" />
        </div>

        {project.description && (
          <p className="text-xs text-white/50 mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-white/40">
          {project.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatDate(project.dueDate)}
            </span>
          )}
          {project.collaborator && (
            <span className="flex items-center gap-1">
              <User size={11} />
              {project.collaborator.name.split(" ")[0]}
            </span>
          )}
          {project.client && (
            <span className="flex items-center gap-1">
              <User size={11} />
              {project.client.name.split(" ")[0]}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-white/8 px-5 py-2.5">
        <Link
          href={`${basePath}/${project.id}`}
          className="flex items-center gap-1 text-xs text-brand-red hover:text-brand-red-light transition-colors"
        >
          Ver detalle <ArrowRight size={12} />
        </Link>
      </div>
    </GlassCard>
  );
}
