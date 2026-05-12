import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import TraceabilityTimeline from "@/components/dashboard/TraceabilityTimeline";
import OrderProgressTracker from "@/components/dashboard/OrderProgressTracker";
import { PageWrapper, PageItem } from "@/components/ui/PageWrapper";
import { ArrowLeft, Package, User, MapPin, Truck } from "lucide-react";
import Link from "next/link";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      items: true,
      project: { select: { id: true, title: true, type: true } },
      traceEvents: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) notFound();
  if (session.role === "CLIENT" && order.clientId !== session.id) redirect("/dashboard");

  function fmt(d: Date) {
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" }).format(d);
  }

  return (
    <>
      <Header user={session} />
      <PageWrapper>
        <PageItem>
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/dashboard/orders"
              className="p-2 rounded-xl glass-sm text-white/50 hover:text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-semibold text-white truncate">{order.orderNumber}</h2>
              <p className="text-white/40 text-sm">Creado el {fmt(order.createdAt)}</p>
            </div>
            <Badge label={order.status} type="status" />
          </div>
        </PageItem>

        {/* Animated progress tracker */}
        <PageItem>
          <GlassCard>
            <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
              <Truck size={16} className="text-brand-red" /> Estado del Pedido
            </h3>
            <OrderProgressTracker status={order.status} trackingCode={order.trackingCode} />
          </GlassCard>
        </PageItem>

        <PageItem>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-6">
            <div className="xl:col-span-2 space-y-5">
              {/* Items */}
              <GlassCard>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Package size={16} className="text-brand-red" /> Artículos
                </h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl glass-sm gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-white/40 truncate">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-white">×{item.quantity}</p>
                        <p className="text-xs text-white/40">${item.unitPrice.toLocaleString("es-MX")}/u</p>
                      </div>
                      <p className="text-sm font-semibold text-white flex-shrink-0">
                        ${item.subtotal.toLocaleString("es-MX")}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/8 mt-4">
                  <span className="text-sm text-white/60">Total</span>
                  <span className="text-xl font-bold text-white">
                    ${order.totalAmount.toLocaleString("es-MX")}
                    <span className="text-sm text-white/40 ml-1">{order.currency}</span>
                  </span>
                </div>
              </GlassCard>

              {/* Client & shipping */}
              <GlassCard>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={16} className="text-brand-red" /> Información del Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Nombre</p>
                    <p className="text-sm text-white">{order.client.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Email</p>
                    <p className="text-sm text-white break-all">{order.client.email}</p>
                  </div>
                  {order.client.phone && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Teléfono</p>
                      <p className="text-sm text-white">{order.client.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-white/40 mb-1">Pago</p>
                    <Badge label={order.paymentStatus} colorClass={
                      order.paymentStatus === "COMPLETED"
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                    } />
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
                      <MapPin size={11} /> Dirección de envío
                    </p>
                    <p className="text-sm text-white">{order.shippingAddress}</p>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Timeline */}
            <div>
              <GlassCard>
                <h3 className="font-semibold text-white mb-5">Historial</h3>
                <TraceabilityTimeline
                  events={order.traceEvents.map((e) => ({
                    ...e,
                    createdAt: e.createdAt.toISOString(),
                  }))}
                />
              </GlassCard>
            </div>
          </div>
        </PageItem>
      </PageWrapper>
    </>
  );
}
