import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true, email: true } },
      milestones: { orderBy: { createdAt: "asc" } },
      traceEvents: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      order: {
        include: { items: true },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (session.role === "CLIENT" && project.clientId !== session.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status && { status: body.status }),
      ...(body.collaboratorId !== undefined && { collaboratorId: body.collaboratorId }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.priority && { priority: body.priority }),
      ...(body.status === "COMPLETED" && { completedAt: new Date() }),
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      collaborator: { select: { id: true, name: true, email: true } },
    },
  });

  if (body.status && body.status !== project.status) {
    await prisma.traceEvent.create({
      data: {
        eventType: "STATUS_CHANGED",
        title: `Estado actualizado a ${body.status}`,
        description: `Estado cambiado de ${project.status} a ${body.status}`,
        projectId: id,
        userId: session.id,
      },
    });
  }

  return NextResponse.json(updated);
}
