import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Zap } from "lucide-react";

export default async function CampaignsPage() {
  const session = await getSession();
  if (!session || session.role === "CLIENT") redirect("/dashboard");

  const projects = await prisma.project.findMany({
    where: {
      type: "ADS_CAMPAIGN",
      ...(session.role === "COLLABORATOR" ? { collaboratorId: session.id } : {}),
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true, email: true } },
      milestones: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const active = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} title="Campañas Ads" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass-red flex items-center justify-center">
          <Zap size={20} className="text-brand-red" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Campañas Ads</h2>
          <p className="text-white/40 text-sm">{projects.length} campañas registradas</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard padding="sm">
          <p className="text-2xl font-bold text-blue-400">{active}</p>
          <p className="text-xs text-white/40 mt-1">Campañas Activas</p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-2xl font-bold text-emerald-400">{completed}</p>
          <p className="text-xs text-white/40 mt-1">Completadas</p>
        </GlassCard>
        <GlassCard padding="sm">
          <p className="text-2xl font-bold text-white">
            {totalBudget > 0 ? `$${(totalBudget / 1000).toFixed(1)}k` : "—"}
          </p>
          <p className="text-xs text-white/40 mt-1">Presupuesto Total</p>
        </GlassCard>
      </div>

      {projects.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Zap size={40} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-lg">Sin campañas</p>
          <p className="text-white/20 text-sm mt-1">Las campañas Ads aparecerán aquí</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                type: project.type as import("@/lib/types").ProjectType,
                status: project.status as import("@/lib/types").ProjectStatus,
                startDate: project.startDate?.toISOString() || null,
                dueDate: project.dueDate?.toISOString() || null,
                completedAt: project.completedAt?.toISOString() || null,
                createdAt: project.createdAt.toISOString(),
              }}
              basePath="/dashboard/projects"
            />
          ))}
        </div>
      )}
    </div>
  );
}
