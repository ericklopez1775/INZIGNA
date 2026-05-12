import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Megaphone } from "lucide-react";

export default async function MarketingPage() {
  const session = await getSession();
  if (!session || session.role === "CLIENT") redirect("/dashboard");

  const where =
    session.role === "COLLABORATOR"
      ? {
          type: { in: ["MARKETING_DIGITAL", "CONTENT_CREATION"] as string[] },
          collaboratorId: session.id,
        }
      : { type: { in: ["MARKETING_DIGITAL", "CONTENT_CREATION"] as string[] } };

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true, email: true } },
      milestones: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const byStatus: Record<string, typeof projects> = {};
  for (const p of projects) {
    if (!byStatus[p.status]) byStatus[p.status] = [];
    byStatus[p.status].push(p);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} title="Marketing Digital" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass-red flex items-center justify-center">
          <Megaphone size={20} className="text-brand-red" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Marketing Digital</h2>
          <p className="text-white/40 text-sm">
            Marketing Digital · Creación de Contenido — {projects.length} proyectos
          </p>
        </div>
      </div>

      {/* Kanban view */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
        {["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"].map((status) => {
          const statusLabels: Record<string, string> = {
            PENDING: "Pendiente", IN_PROGRESS: "En Progreso",
            REVIEW: "Revisión", COMPLETED: "Completado", CANCELLED: "Cancelado",
          };
          const statusProjects = byStatus[status] || [];
          return (
            <div key={status} className="min-w-60">
              <div className="glass-sm rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60">{statusLabels[status]}</span>
                <span className="text-xs glass rounded-full px-2 py-0.5 text-white/40">
                  {statusProjects.length}
                </span>
              </div>
              <div className="space-y-3">
                {statusProjects.map((project) => (
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
                {statusProjects.length === 0 && (
                  <div className="glass-sm rounded-xl p-4 text-center">
                    <p className="text-xs text-white/20">Sin proyectos</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
