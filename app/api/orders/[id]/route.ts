import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

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

  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (session.role === "CLIENT" && order.clientId !== session.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
      ...(body.trackingCode !== undefined && { trackingCode: body.trackingCode }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  if (body.status && body.status !== order.status) {
    await prisma.traceEvent.create({
      data: {
        eventType: body.status === "SHIPPED" ? "SHIPPED" : "STATUS_CHANGED",
        title: `Estado de pedido: ${body.status}`,
        description: body.trackingCode ? `Código de rastreo: ${body.trackingCode}` : undefined,
        orderId: id,
        userId: session.id,
      },
    });
  }

  return NextResponse.json(updated);
}
