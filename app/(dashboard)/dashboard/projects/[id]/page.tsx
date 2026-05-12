import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import TraceabilityTimeline from "@/components/dashboard/TraceabilityTimeline";
import { Calendar, User, Tag, DollarSign, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { PROJECT_TYPE_LABELS } from "@/lib/types";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      collaborator: { select: { id: true, name: true, email: true } },
      milestones: { orderBy: { createdAt: "asc" } },
      traceEvents: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      order: { include: { items: true } },
    },
  });

  if (!project) notFound();
  if (session.role === "CLIENT" && project.clientId !== session.id) redirect("/dashboard");

  function fmt(d: Date | null) {
    if (!d) return "—";
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" }).format(d);
  }

  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const progress = project.milestones.length
    ? Math.round((completedMilestones / project.milestones.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} />

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/projects"
          className="p-2 rounded-xl glass-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {project.type === "DTF_ORDER" ? "🎨" :
               project.type === "EMBROIDERY_ORDER" ? "🧵" :
               project.type === "LASER_ENGRAVING" ? "🔆" :
               project.type === "MARKETING_DIGITAL" ? "📣" :
               project.type === "ADS_CAMPAIGN" ? "⚡" :
               project.type === "CONTENT_CREATION" ? "✏️" : "📋"}
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">{project.title}</h2>
              <p className="text-white/40 text-sm">
                {PROJECT_TYPE_LABELS[project.type as keyof typeof PROJECT_TYPE_LABELS]}
              </p>
            </div>
          </div>
        </div>
        <Badge label={project.status} type="status" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="xl:col-span-2 space-y-5">
          <GlassCard>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={16} className="text-brand-red" /> Información del Proyecto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Cliente</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full glass-red flex items-center justify-center text-xs font-bold text-brand-red">
                    {project.client.name.charAt(0)}
                  </div>
                  <p className="text-sm text-white">{project.client.name}</p>
                </div>
              </div>
              {project.collaborator && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Colaborador</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full glass-sm flex items-center justify-center text-xs font-bold text-white/60">
                      {project.collaborator.name.charAt(0)}
                    </div>
                    <p className="text-sm text-white">{project.collaborator.name}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
                  <Calendar size={11} /> Inicio
                </p>
                <p className="text-sm text-white">{fmt(project.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
                  <Calendar size={11} /> Fecha límite
                </p>
                <p className="text-sm text-white">{fmt(project.dueDate)}</p>
              </div>
              {project.budget && (
                <div>
                  <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
                    <DollarSign size={11} /> Presupuesto
                  </p>
                  <p className="text-sm text-white">
                    ${project.budget.toLocaleString("es-MX")} MXN
                  </p>
                </div>
              )}
              {project.priority && (
                <div>
                  <p className="text-xs text-white/40 mb-1">Prioridad</p>
                  <Badge
                    label={project.priority}
                    colorClass={
                      project.priority === "HIGH" ? "text-red-400 bg-red-400/10 border-red-400/20" :
                      project.priority === "MEDIUM" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                      "text-gray-400 bg-gray-400/10 border-gray-400/20"
                    }
                  />
                </div>
              )}
            </div>
            {project.description && (
              <div className="mt-4 pt-4 border-t border-white/8">
                <p className="text-xs text-white/40 mb-1">Descripción</p>
                <p className="text-sm text-white/70">{project.description}</p>
              </div>
            )}
            {project.tags && (
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tags.split(",").map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs glass-sm rounded-full px-2.5 py-1 text-white/50">
                    <Tag size={10} /> {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Milestones */}
          {project.milestones.length > 0 && (
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Hitos del Proyecto</h3>
                <span className="text-xs text-white/40">{completedMilestones}/{project.milestones.length}</span>
              </div>
              <div className="h-1.5 glass-sm rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-brand-red rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-2">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl glass-sm">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${m.completed ? "border-emerald-400 bg-emerald-400" : "border-white/20"}`}>
                      {m.completed && <span className="text-black text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${m.completed ? "line-through text-white/30" : "text-white"}`}>
                        {m.title}
                      </p>
                      {m.description && <p className="text-xs text-white/30">{m.description}</p>}
                    </div>
                    {m.dueDate && (
                      <span className="text-xs text-white/30">{fmt(m.dueDate)}</span>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Order if exists */}
          {project.order && (
            <GlassCard>
              <h3 className="font-semibold text-white mb-4">Pedido Asociado</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/60">{project.order.orderNumber}</span>
                <Badge label={project.order.status} type="status" />
              </div>
              <div className="space-y-2">
                {project.order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-white/60">{item.name} × {item.quantity}</span>
                    <span className="text-white">${item.subtotal.toLocaleString("es-MX")}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-white/8">
                  <span className="text-white/80">Total</span>
                  <span className="text-white">${project.order.totalAmount.toLocaleString("es-MX")} MXN</span>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Timeline */}
        <div>
          <GlassCard>
            <h3 className="font-semibold text-white mb-5">Historial de Trazabilidad</h3>
            <TraceabilityTimeline
              events={project.traceEvents.map((e) => ({
                ...e,
                createdAt: e.createdAt.toISOString(),
              }))}
            />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
