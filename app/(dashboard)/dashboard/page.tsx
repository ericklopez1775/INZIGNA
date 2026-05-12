import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import TraceabilityTimeline from "@/components/dashboard/TraceabilityTimeline";
import { PageWrapper, PageItem } from "@/components/ui/PageWrapper";
import {
  FolderKanban, ShoppingBag, Users, Activity,
  Package, Zap, CheckCircle, Clock
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = session.role === "ADMIN";
  const isCollaborator = session.role === "COLLABORATOR";
  const isClient = session.role === "CLIENT";

  const [projectStats, orderStats, recentEvents] = await Promise.all([
    prisma.project.groupBy({
      by: ["status"],
      where: isClient
        ? { clientId: session.id }
        : isCollaborator
        ? { collaboratorId: session.id }
        : {},
      _count: { status: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: isClient ? { clientId: session.id } : {},
      _count: { status: true },
    }),
    prisma.traceEvent.findMany({
      where: isClient
        ? { OR: [{ project: { clientId: session.id } }, { order: { clientId: session.id } }] }
        : isCollaborator
        ? { project: { collaboratorId: session.id } }
        : {},
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
        order: { select: { id: true, orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalProjects = projectStats.reduce((s, g) => s + g._count.status, 0);
  const activeProjects = projectStats.find((g) => g.status === "IN_PROGRESS")?._count.status ?? 0;
  const completedProjects = projectStats.find((g) => g.status === "COMPLETED")?._count.status ?? 0;
  const totalOrders = orderStats.reduce((s, g) => s + g._count.status, 0);

  const recentProjects = await prisma.project.findMany({
    where: isClient
      ? { clientId: session.id }
      : isCollaborator
      ? { collaboratorId: session.id }
      : {},
    include: {
      client: { select: { name: true } },
      collaborator: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  let totalUsers = 0;
  if (isAdmin) {
    totalUsers = await prisma.user.count();
  }

  const greetings: Record<string, string> = {
    ADMIN: "Panel de Administración",
    COLLABORATOR: "Mi Panel de Trabajo",
    CLIENT: "Mi Portal",
  };

  return (
    <>
      <Header user={session} title={greetings[session.role]} />
      <PageWrapper>
        <PageItem>
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Bienvenido, {session.name.split(" ")[0]} 👋
          </h2>
          <p className="text-white/40 text-sm mt-1">
            {new Intl.DateTimeFormat("es-MX", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            }).format(new Date())}
          </p>
        </PageItem>

        {/* Stats grid */}
        <PageItem>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              title="Proyectos Totales"
              value={totalProjects}
              icon={<FolderKanban size={20} />}
            />
            <StatCard
              title="En Progreso"
              value={activeProjects}
              icon={<Zap size={20} />}
              accentColor="text-blue-400"
            />
            <StatCard
              title="Completados"
              value={completedProjects}
              icon={<CheckCircle size={20} />}
              accentColor="text-emerald-400"
            />
            {isAdmin ? (
              <StatCard
                title="Usuarios Totales"
                value={totalUsers}
                icon={<Users size={20} />}
                accentColor="text-purple-400"
              />
            ) : (
              <StatCard
                title="Pedidos"
                value={totalOrders}
                icon={<ShoppingBag size={20} />}
                accentColor="text-cyan-400"
              />
            )}
          </div>
        </PageItem>

        <PageItem>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            {/* Recent projects */}
            <GlassCard className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FolderKanban size={18} className="text-brand-red" />
                  Proyectos Recientes
                </h3>
                <a href="/dashboard/projects" className="text-xs text-brand-red hover:underline">
                  Ver todos →
                </a>
              </div>
              <div className="space-y-2.5">
                {recentProjects.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">Sin proyectos aún</p>
                ) : recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center gap-3 p-3 rounded-xl glass-sm hover:bg-white/8 transition-colors">
                    <div className="w-8 h-8 rounded-lg glass-red flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-brand-red" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{project.title}</p>
                      <p className="text-xs text-white/40 truncate">
                        {project.client?.name}
                        {project.collaborator ? ` · ${project.collaborator.name}` : ""}
                      </p>
                    </div>
                    <Badge label={project.status} type="status" />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Traceability feed */}
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Activity size={18} className="text-brand-red" />
                  Actividad
                </h3>
              </div>
              <TraceabilityTimeline
                events={recentEvents.map((e) => ({
                  ...e,
                  createdAt: e.createdAt.toISOString(),
                  user: e.user,
                }))}
                compact
              />
            </GlassCard>
          </div>
        </PageItem>

        {isAdmin && (
          <PageItem>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {[
                { label: "Marketing Digital", icon: "📣", href: "/dashboard/marketing" },
                { label: "Producción DTF / Bordado / Láser", icon: "🎨", href: "/dashboard/production" },
                { label: "Campañas Ads", icon: "⚡", href: "/dashboard/campaigns" },
              ].map((item) => (
                <a key={item.href} href={item.href}>
                  <GlassCard hover className="flex items-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-white/40">
                        <Clock size={10} className="inline mr-1" />
                        Ver proyectos
                      </p>
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </PageItem>
        )}
      </PageWrapper>
    </>
  );
}
