import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import { Scissors, Package, User, Calendar } from "lucide-react";
import Link from "next/link";

export default async function ProductionPage() {
  const session = await getSession();
  if (!session || session.role === "CLIENT") redirect("/dashboard");

  const productionTypes = ["DTF_ORDER", "EMBROIDERY_ORDER", "LASER_ENGRAVING", "PHYSICAL_PRODUCT"];

  const projects = await prisma.project.findMany({
    where: {
      type: { in: productionTypes },
      ...(session.role === "COLLABORATOR" ? { collaboratorId: session.id } : {}),
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true, email: true } },
      order: {
        include: { items: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const typeIcons: Record<string, string> = {
    DTF_ORDER: "🎨",
    EMBROIDERY_ORDER: "🧵",
    LASER_ENGRAVING: "🔆",
    PHYSICAL_PRODUCT: "📦",
  };

  const typeLabels: Record<string, string> = {
    DTF_ORDER: "DTF",
    EMBROIDERY_ORDER: "Bordado",
    LASER_ENGRAVING: "Grabado Láser",
    PHYSICAL_PRODUCT: "Producto Físico",
  };

  const byType: Record<string, typeof projects> = {};
  for (const p of projects) {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  }

  function fmt(d: Date | null) {
    if (!d) return "—";
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(d);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} title="Producción" />

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass-red flex items-center justify-center">
          <Scissors size={20} className="text-brand-red" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Producción</h2>
          <p className="text-white/40 text-sm">DTF · Bordado · Grabado Láser · Productos Físicos</p>
        </div>
      </div>

      {/* Summary cards per type */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {productionTypes.map((type) => {
          const count = byType[type]?.length || 0;
          const active = byType[type]?.filter((p) => p.status === "IN_PROGRESS").length || 0;
          return (
            <GlassCard key={type} padding="sm">
              <div className="text-2xl mb-2">{typeIcons[type]}</div>
              <p className="text-xl font-bold text-white">{count}</p>
              <p className="text-xs text-white/40">{typeLabels[type]}</p>
              {active > 0 && (
                <p className="text-xs text-blue-400 mt-1">{active} activo{active !== 1 ? "s" : ""}</p>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* All production orders */}
      {productionTypes.map((type) => {
        const typeProjects = byType[type] || [];
        if (!typeProjects.length) return null;
        return (
          <div key={type}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span>{typeIcons[type]}</span> {typeLabels[type]}
              <span className="text-sm text-white/30">({typeProjects.length})</span>
            </h3>
            <div className="space-y-2">
              {typeProjects.map((project) => (
                <GlassCard key={project.id} hover padding="none">
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{project.title}</p>
                        {project.order && (
                          <span className="text-xs text-white/30 font-mono">{project.order.orderNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <User size={10} /> {project.client.name}
                        </span>
                        {project.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={10} /> {fmt(project.dueDate)}
                          </span>
                        )}
                        {project.order && (
                          <span className="flex items-center gap-1">
                            <Package size={10} /> {project.order.items.length} artículos
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge label={project.status} type="status" />
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-xs text-brand-red hover:underline"
                      >
                        Ver →
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        );
      })}

      {projects.length === 0 && (
        <GlassCard className="text-center py-16">
          <p className="text-white/30 text-lg">Sin órdenes de producción</p>
        </GlassCard>
      )}
    </div>
  );
}
