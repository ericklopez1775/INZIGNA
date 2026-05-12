import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import TraceabilityTimeline from "@/components/dashboard/TraceabilityTimeline";
import { GitBranch, Activity } from "lucide-react";

export default async function TraceabilityPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const where =
    session.role === "CLIENT"
      ? { OR: [{ project: { clientId: session.id } }, { order: { clientId: session.id } }] }
      : session.role === "COLLABORATOR"
      ? { project: { collaboratorId: session.id } }
      : {};

  const events = await prisma.traceEvent.findMany({
    where,
    include: {
      user: { select: { id: true, name: true } },
      project: { select: { id: true, title: true } },
      order: { select: { id: true, orderNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const byEntity: Record<string, typeof events> = {};
  for (const event of events) {
    const key = event.projectId
      ? `project:${event.projectId}`
      : event.orderId
      ? `order:${event.orderId}`
      : "global";
    if (!byEntity[key]) byEntity[key] = [];
    byEntity[key].push(event);
  }

  // Count by event type
  const typeCounts: Record<string, number> = {};
  for (const event of events) {
    typeCounts[event.eventType] = (typeCounts[event.eventType] || 0) + 1;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} title="Trazabilidad" />

      <div>
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <GitBranch size={24} className="text-brand-red" />
          Trazabilidad
        </h2>
        <p className="text-white/40 text-sm mt-1">{events.length} eventos registrados</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(typeCounts).slice(0, 4).map(([type, count]) => (
          <GlassCard key={type} padding="sm">
            <p className="text-xl font-bold text-white">{count}</p>
            <p className="text-xs text-white/40 mt-0.5">{type.replace(/_/g, " ")}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* All events feed */}
        <GlassCard>
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Activity size={16} className="text-brand-red" />
            Feed Global de Actividad
          </h3>
          <TraceabilityTimeline
            events={events.map((e) => ({
              ...e,
              createdAt: e.createdAt.toISOString(),
              description: e.project
                ? `Proyecto: ${e.project.title}`
                : e.order
                ? `Pedido: ${e.order.orderNumber}`
                : e.description,
            }))}
          />
        </GlassCard>

        {/* By entity */}
        <div className="space-y-4">
          {Object.entries(byEntity)
            .filter(([k]) => k !== "global")
            .slice(0, 5)
            .map(([key, entityEvents]) => {
              const firstEvent = entityEvents[0];
              const label = firstEvent.project?.title || firstEvent.order?.orderNumber || key;
              const isProject = key.startsWith("project:");
              return (
                <GlassCard key={key}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{isProject ? "📋" : "📦"}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs text-white/30">{entityEvents.length} eventos</p>
                      </div>
                    </div>
                    {isProject && firstEvent.project && (
                      <a
                        href={`/dashboard/projects/${firstEvent.project.id}`}
                        className="text-xs text-brand-red hover:underline"
                      >
                        Ver →
                      </a>
                    )}
                    {!isProject && firstEvent.order && (
                      <a
                        href={`/dashboard/orders/${firstEvent.order.id}`}
                        className="text-xs text-brand-red hover:underline"
                      >
                        Ver →
                      </a>
                    )}
                  </div>
                  <TraceabilityTimeline
                    events={entityEvents.slice(0, 4).map((e) => ({
                      ...e,
                      createdAt: e.createdAt.toISOString(),
                    }))}
                    compact
                  />
                </GlassCard>
              );
            })}
          {Object.keys(byEntity).length === 0 && (
            <GlassCard className="text-center py-10">
              <p className="text-white/30">Sin actividad registrada</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
