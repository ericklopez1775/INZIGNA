import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Badge from "@/components/ui/Badge";
import TraceabilityTimeline from "@/components/dashboard/TraceabilityTimeline";
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

  const statusSteps = ["PENDING_PAYMENT", "PAID", "IN_PRODUCTION", "QUALITY_CHECK", "SHIPPED", "DELIVERED"];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Header user={session} />

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/orders"
          className="p-2 rounded-xl glass-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white">{order.orderNumber}</h2>
          <p className="text-white/40 text-sm">Creado el {fmt(order.createdAt)}</p>
        </div>
        <Badge label={order.status} type="status" />
      </div>

      {/* Progress tracker */}
      <GlassCard>
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Truck size={16} className="text-brand-red" /> Estado del Pedido
        </h3>
        <div className="flex items-center gap-0">
          {statusSteps.map((step, i) => {
            const labels: Record<string, string> = {
              PENDING_PAYMENT: "Pago", PAID: "Pagado", IN_PRODUCTION: "Producción",
              QUALITY_CHECK: "Calidad", SHIPPED: "Enviado", DELIVERED: "Entregado",
            };
            const isDone = i <= currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? "bg-brand-red text-white" : "glass-sm text-white/30"
                  } ${isCurrent ? "ring-2 ring-brand-red/40 ring-offset-2 ring-offset-transparent" : ""}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <p className={`text-xs mt-1.5 text-center w-16 ${isDone ? "text-white/70" : "text-white/20"}`}>
                    {labels[step]}
                  </p>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentStep ? "bg-brand-red" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>
        {order.trackingCode && (
          <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-2 text-sm">
            <span className="text-white/40">Código de rastreo:</span>
            <span className="text-brand-red font-mono font-medium">{order.trackingCode}</span>
          </div>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          {/* Items */}
          <GlassCard>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Package size={16} className="text-brand-red" /> Artículos
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl glass-sm">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-white/40">{item.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">×{item.quantity}</p>
                    <p className="text-xs text-white/40">${item.unitPrice.toLocaleString("es-MX")}/u</p>
                  </div>
                  <p className="text-sm font-semibold text-white ml-4">
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Nombre</p>
                <p className="text-sm text-white">{order.client.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Email</p>
                <p className="text-sm text-white">{order.client.email}</p>
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
    </div>
  );
}
