import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const orderId = searchParams.get("orderId");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};

  if (projectId) where.projectId = projectId;
  if (orderId) where.orderId = orderId;

  if (session.role === "CLIENT") {
    where.OR = [
      { project: { clientId: session.id } },
      { order: { clientId: session.id } },
    ];
  }

  const events = await prisma.traceEvent.findMany({
    where,
    include: {
      user: { select: { id: true, name: true } },
      project: { select: { id: true, title: true } },
      order: { select: { id: true, orderNumber: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { eventType, title, description, projectId, orderId, metadata } = body;

  if (!eventType || !title) {
    return NextResponse.json({ error: "Tipo y título requeridos" }, { status: 400 });
  }

  const event = await prisma.traceEvent.create({
    data: {
      eventType,
      title,
      description,
      projectId: projectId || null,
      orderId: orderId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      userId: session.id,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(event, { status: 201 });
}
