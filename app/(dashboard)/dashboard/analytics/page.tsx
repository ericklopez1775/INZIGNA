import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import { PageWrapper, PageItem } from "@/components/ui/PageWrapper";
import { Activity, TrendingUp, Users, DollarSign, FolderKanban, ShoppingBag } from "lucide-react";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const [
    userCount, projectCount, orderCount,
    projectByStatus, orderByStatus, projectByType,
    totalRevenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.order.count(),
    prisma.project.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.project.groupBy({ by: ["type"], _count: { type: true }, orderBy: { _count: { type: "desc" } } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "COMPLETED" },
    }),
  ]);

  const revenue = totalRevenue._sum.totalAmount || 0;

  const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendiente", IN_PROGRESS: "En Progreso",
    REVIEW: "Revisión", COMPLETED: "Completado", CANCELLED: "Cancelado",
    PENDING_PAYMENT: "Pago Pendiente", PAID: "Pagado",
    IN_PRODUCTION: "Producción", QUALITY_CHECK: "Calidad",
    SHIPPED: "Enviado", DELIVERED: "Entregado",
  };

  const TYPE_LABELS: Record<string, string> = {
    MARKETING_DIGITAL: "Marketing", CONTENT_CREATION: "Contenido",
    ADS_CAMPAIGN: "Ads", DTF_ORDER: "DTF",
    EMBROIDERY_ORDER: "Bordado", LASER_ENGRAVING: "Grabado",
    DIGITAL_SERVICE: "Digital", PHYSICAL_PRODUCT: "Físico",
  };

  return (
    <>
      <Header user={session} title="Analíticas" />
      <PageWrapper>
        <PageItem>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-2">
              <Activity size={22} className="text-brand-red" /> Analíticas
            </h2>
            <p className="text-white/40 text-sm mt-1">Vista general del negocio</p>
          </div>
        </PageItem>

        {/* KPIs */}
        <PageItem>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "Usuarios Totales", value: userCount, icon: <Users size={20} />, color: "text-blue-400" },
              { label: "Proyectos Totales", value: projectCount, icon: <FolderKanban size={20} />, color: "text-purple-400" },
              { label: "Pedidos Totales", value: orderCount, icon: <ShoppingBag size={20} />, color: "text-cyan-400" },
              {
                label: "Ingresos (MXN)",
                value: `$${revenue.toLocaleString("es-MX")}`,
                icon: <DollarSign size={20} />,
                color: "text-emerald-400",
              },
            ].map((kpi) => (
              <GlassCard key={kpi.label} padding="sm">
                <div className={`mb-2 ${kpi.color}`}>{kpi.icon}</div>
                <p className="text-xl md:text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-white/40 mt-1">{kpi.label}</p>
              </GlassCard>
            ))}
          </div>
        </PageItem>

        <PageItem>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Projects by status */}
            <GlassCard>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FolderKanban size={16} className="text-brand-red" /> Proyectos por Estado
              </h3>
              <div className="space-y-3">
                {projectByStatus.map((s) => {
                  const pct = projectCount > 0 ? (s._count.status / projectCount) * 100 : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">{STATUS_LABELS[s.status] || s.status}</span>
                        <span className="text-white/40">{s._count.status}</span>
                      </div>
                      <div className="h-1.5 glass-sm rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-red rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {projectByStatus.length === 0 && (
                  <p className="text-white/20 text-sm text-center py-2">Sin proyectos</p>
                )}
              </div>
            </GlassCard>

            {/* Orders by status */}
            <GlassCard>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ShoppingBag size={16} className="text-brand-red" /> Pedidos por Estado
              </h3>
              <div className="space-y-3">
                {orderByStatus.map((s) => {
                  const pct = orderCount > 0 ? (s._count.status / orderCount) * 100 : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">{STATUS_LABELS[s.status] || s.status}</span>
                        <span className="text-white/40">{s._count.status}</span>
                      </div>
                      <div className="h-1.5 glass-sm rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {orderByStatus.length === 0 && (
                  <p className="text-white/20 text-sm text-center py-2">Sin pedidos</p>
                )}
              </div>
            </GlassCard>

            {/* Projects by type */}
            <GlassCard className="md:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-red" /> Tipo de Proyecto
              </h3>
              <div className="space-y-3">
                {projectByType.slice(0, 6).map((t) => {
                  const pct = projectCount > 0 ? (t._count.type / projectCount) * 100 : 0;
                  return (
                    <div key={t.type}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">{TYPE_LABELS[t.type] || t.type}</span>
                        <span className="text-white/40">{t._count.type}</span>
                      </div>
                      <div className="h-1.5 glass-sm rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {projectByType.length === 0 && (
                  <p className="text-white/20 text-sm text-center py-2">Sin proyectos</p>
                )}
              </div>
            </GlassCard>
          </div>
        </PageItem>
      </PageWrapper>
    </>
  );
}
