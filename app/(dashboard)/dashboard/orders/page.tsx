import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import { ShoppingBag, Package, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const where = session.role === "CLIENT" ? { clientId: session.id } : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      client: { select: { name: true, email: true } },
      items: true,
      project: { select: { id: true, title: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  function fmt(d: Date) {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit", month: "short", year: "numeric",
    }).format(d);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} title="Pedidos" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Pedidos</h2>
          <p className="text-white/40 text-sm">{orders.length} pedidos registrados</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <GlassCard className="text-center py-20">
          <ShoppingBag size={40} className="text-white/20 mx-auto mb-4" />
          <p className="text-white/30 text-lg">Sin pedidos</p>
          <p className="text-white/20 text-sm mt-1">Tus pedidos aparecerán aquí</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <GlassCard key={order.id} hover padding="none">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl glass-red flex items-center justify-center">
                      <Package size={18} className="text-brand-red" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{order.orderNumber}</p>
                      <p className="text-xs text-white/40">
                        {session.role !== "CLIENT" && `${order.client.name} · `}
                        {order.items.length} artículo{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge label={order.status} type="status" />
                    <span className="text-lg font-semibold text-white">
                      ${order.totalAmount.toLocaleString("es-MX")}
                      <span className="text-xs text-white/40 ml-1">{order.currency}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {fmt(order.createdAt)}
                  </span>
                  <Badge label={order.paymentStatus} colorClass={
                    order.paymentStatus === "COMPLETED"
                      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                      : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                  } />
                  {order.trackingCode && (
                    <span className="text-brand-red">📦 {order.trackingCode}</span>
                  )}
                </div>

                {order.items.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-xs glass-sm rounded-lg px-2.5 py-1 text-white/50">
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-white/30">+{order.items.length - 3} más</span>
                    )}
                  </div>
                )}
              </div>
              <div className="border-t border-white/8 px-5 py-2.5">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-1 text-xs text-brand-red hover:text-brand-red-light"
                >
                  Ver detalle <ArrowRight size={12} />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
