import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};

  if (session.role === "CLIENT") {
    where.clientId = session.id;
  } else if (session.role === "COLLABORATOR") {
    where.collaboratorId = session.id;
  }

  if (status) where.status = status;
  if (type) where.type = type;

  const projects = await prisma.project.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true, email: true } },
      milestones: true,
      _count: { select: { traceEvents: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, type, clientId, collaboratorId, dueDate, budget, tags, notes, priority } = body;

  if (!title || !type || !clientId) {
    return NextResponse.json({ error: "Título, tipo y cliente son requeridos" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      type,
      clientId,
      collaboratorId: collaboratorId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      budget: budget ? parseFloat(budget) : null,
      tags,
      notes,
      priority: priority || "MEDIUM",
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.traceEvent.create({
    data: {
      eventType: "CREATED",
      title: "Proyecto creado",
      description: `Proyecto "${title}" creado`,
      projectId: project.id,
      userId: session.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
