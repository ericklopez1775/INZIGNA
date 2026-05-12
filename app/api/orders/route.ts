import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

function generateOrderNumber() {
  const date = new Date();
  const prefix = "INZ";
  const datePart = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${datePart}-${random}`;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (session.role === "CLIENT") where.clientId = session.id;
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
      project: { select: { id: true, title: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { clientId, items, shippingAddress, notes, projectId } = body;

  if (!clientId || !items?.length) {
    return NextResponse.json({ error: "Cliente e items requeridos" }, { status: 400 });
  }

  const totalAmount = items.reduce(
    (sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + item.quantity * item.unitPrice,
    0
  );

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      clientId,
      projectId: projectId || null,
      shippingAddress,
      notes,
      totalAmount,
      items: {
        create: items.map((item: { name: string; description?: string; quantity: number; unitPrice: number }) => ({
          name: item.name,
          description: item.description || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      },
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
    },
  });

  await prisma.traceEvent.create({
    data: {
      eventType: "CREATED",
      title: `Pedido ${order.orderNumber} creado`,
      description: `Total: $${totalAmount.toFixed(2)} MXN`,
      orderId: order.id,
      userId: session.id,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
