import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import { Users, UserPlus, FolderKanban, ShoppingBag, Calendar } from "lucide-react";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { projectsOwned: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const invitations = await prisma.invitation.findMany({
    where: { used: false, expiresAt: { gt: new Date() } },
    include: { creator: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  function fmt(d: Date) {
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  }

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const collaboratorCount = users.filter((u) => u.role === "COLLABORATOR").length;
  const clientCount = users.filter((u) => u.role === "CLIENT").length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} title="Usuarios" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Usuarios</h2>
          <p className="text-white/40 text-sm">{users.length} usuarios registrados</p>
        </div>
        <a
          href="/dashboard/users/invite"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-red hover:bg-brand-red-dark text-white text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Invitar Usuario
        </a>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Admins", count: adminCount, color: "text-red-400" },
          { label: "Colaboradores", count: collaboratorCount, color: "text-blue-400" },
          { label: "Clientes", count: clientCount, color: "text-emerald-400" },
        ].map((stat) => (
          <GlassCard key={stat.label} padding="sm">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-white/40 mt-1">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Users table */}
      <GlassCard padding="none">
        <div className="p-5 border-b border-white/8">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Users size={16} className="text-brand-red" /> Lista de Usuarios
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
              <div className="w-9 h-9 rounded-full glass-red flex items-center justify-center text-sm font-bold text-brand-red flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  {!user.isActive && (
                    <span className="text-xs text-gray-500 glass-sm rounded-full px-2 py-0.5">Inactivo</span>
                  )}
                </div>
                <p className="text-xs text-white/40">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge label={user.role} type="role" />
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <FolderKanban size={11} /> {user._count.projectsOwned}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingBag size={11} /> {user._count.orders}
                  </span>
                </div>
                <span className="text-xs text-white/20 flex items-center gap-1">
                  <Calendar size={10} /> {fmt(user.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <GlassCard>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-brand-red" />
            Invitaciones Pendientes
          </h3>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl glass-sm">
                <div>
                  <p className="text-sm text-white">{inv.email}</p>
                  <p className="text-xs text-white/30">por {inv.creator.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={inv.role} type="role" />
                  <span className="text-xs text-white/30">Expira: {fmt(inv.expiresAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
