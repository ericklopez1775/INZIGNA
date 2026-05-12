import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = `file:${path.resolve(__dirname, "../dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding database...");

  const adminPass = await bcrypt.hash("Admin123!", 12);
  const collabPass = await bcrypt.hash("Collab123!", 12);
  const clientPass = await bcrypt.hash("Client123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@inzigna.com" },
    update: {},
    create: {
      name: "Admin INZIGNA",
      email: "admin@inzigna.com",
      password: adminPass,
      role: "ADMIN",
      phone: "+52 55 1234 5678",
      company: "INZIGNA",
    },
  });

  const collab = await prisma.user.upsert({
    where: { email: "colaborador@inzigna.com" },
    update: {},
    create: {
      name: "María González",
      email: "colaborador@inzigna.com",
      password: collabPass,
      role: "COLLABORATOR",
      phone: "+52 55 9876 5432",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "cliente@inzigna.com" },
    update: {},
    create: {
      name: "Juan Martínez",
      email: "cliente@inzigna.com",
      password: clientPass,
      role: "CLIENT",
      phone: "+52 55 5555 5555",
      company: "Empresa XYZ",
    },
  });

  const project1 = await prisma.project.upsert({
    where: { id: "proj-1" },
    update: {},
    create: {
      id: "proj-1",
      title: "Campaña Redes Sociales Q2 2025",
      description: "Estrategia completa de redes sociales para Q2 con contenido orgánico y pagado",
      type: "MARKETING_DIGITAL",
      status: "IN_PROGRESS",
      priority: "HIGH",
      clientId: client.id,
      collaboratorId: collab.id,
      budget: 15000,
      tags: "redes-sociales,instagram,facebook",
      dueDate: new Date("2025-06-30"),
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: "proj-2" },
    update: {},
    create: {
      id: "proj-2",
      title: "Playeras DTF Corporativas — 50 pzas",
      description: "Impresión DTF en playeras blancas talla M y L con logo empresarial",
      type: "DTF_ORDER",
      status: "IN_PRODUCTION",
      priority: "HIGH",
      clientId: client.id,
      collaboratorId: collab.id,
      budget: 8500,
      dueDate: new Date("2025-05-20"),
    },
  });

  await prisma.project.upsert({
    where: { id: "proj-3" },
    update: {},
    create: {
      id: "proj-3",
      title: "Campaña Google Ads — Verano 2025",
      description: "Campaña de búsqueda y display para temporada de verano",
      type: "ADS_CAMPAIGN",
      status: "PENDING",
      priority: "MEDIUM",
      clientId: client.id,
      budget: 25000,
      dueDate: new Date("2025-07-15"),
    },
  });

  const project4 = await prisma.project.upsert({
    where: { id: "proj-4" },
    update: {},
    create: {
      id: "proj-4",
      title: "Gorras Bordadas — Colección Especial",
      description: "Bordado de logo en gorras negras, 30 piezas, entrega express",
      type: "EMBROIDERY_ORDER",
      status: "QUALITY_CHECK",
      priority: "HIGH",
      clientId: client.id,
      collaboratorId: collab.id,
      budget: 4500,
      dueDate: new Date("2025-05-15"),
    },
  });

  const order1 = await prisma.order.upsert({
    where: { id: "order-1" },
    update: {},
    create: {
      id: "order-1",
      orderNumber: "INZ-250512-0001",
      status: "IN_PRODUCTION",
      paymentStatus: "COMPLETED",
      totalAmount: 8500,
      currency: "MXN",
      clientId: client.id,
      projectId: project2.id,
      shippingAddress: "Av. Insurgentes Sur 1234, Col. Del Valle, CDMX",
      items: {
        create: [
          { name: "Playera DTF Blanca M", quantity: 25, unitPrice: 95, subtotal: 2375 },
          { name: "Playera DTF Blanca L", quantity: 25, unitPrice: 95, subtotal: 2375 },
          { name: "Impresión DTF A4 — Logo Corporativo", quantity: 50, unitPrice: 75, subtotal: 3750 },
        ],
      },
    },
  });

  const order2 = await prisma.order.upsert({
    where: { id: "order-2" },
    update: {},
    create: {
      id: "order-2",
      orderNumber: "INZ-250510-0002",
      status: "QUALITY_CHECK",
      paymentStatus: "COMPLETED",
      totalAmount: 4500,
      currency: "MXN",
      clientId: client.id,
      projectId: project4.id,
      items: {
        create: [
          { name: "Gorra Negra Premium", quantity: 30, unitPrice: 100, subtotal: 3000 },
          { name: "Bordado Logo 5cm", quantity: 30, unitPrice: 50, subtotal: 1500 },
        ],
      },
    },
  });

  const milestones = [
    { id: "m1", title: "Brief de marca aprobado", completed: true, projectId: project1.id },
    { id: "m2", title: "Calendario editorial Q2", completed: true, projectId: project1.id },
    { id: "m3", title: "Diseño de banners", completed: false, projectId: project1.id },
    { id: "m4", title: "Publicación semana 1", completed: false, projectId: project1.id },
  ];
  for (const m of milestones) {
    await prisma.milestone.upsert({ where: { id: m.id }, update: {}, create: m });
  }

  const traceEvents = [
    { id: "te-1", eventType: "CREATED", title: "Proyecto creado", description: "Campaña Redes Sociales Q2 iniciada", projectId: project1.id, userId: admin.id, createdAt: new Date("2025-04-15T10:00:00") },
    { id: "te-2", eventType: "ASSIGNED", title: "Colaborador asignado", description: "María González asignada al proyecto", projectId: project1.id, userId: admin.id, createdAt: new Date("2025-04-15T10:05:00") },
    { id: "te-3", eventType: "STATUS_CHANGED", title: "Estado: En Progreso", description: "Proyecto iniciado oficialmente", projectId: project1.id, userId: collab.id, createdAt: new Date("2025-04-20T09:00:00") },
    { id: "te-4", eventType: "CREATED", title: "Pedido creado", description: "Orden INZ-250512-0001. Total: $8,500 MXN", orderId: order1.id, userId: admin.id, createdAt: new Date("2025-05-01T11:00:00") },
    { id: "te-5", eventType: "PAYMENT", title: "Pago confirmado", description: "Pago de $8,500 MXN recibido", orderId: order1.id, userId: admin.id, createdAt: new Date("2025-05-01T11:30:00") },
    { id: "te-6", eventType: "STATUS_CHANGED", title: "Producción iniciada", description: "DTF en proceso", orderId: order1.id, userId: collab.id, createdAt: new Date("2025-05-05T08:00:00") },
    { id: "te-7", eventType: "CREATED", title: "Pedido creado", description: "Orden INZ-250510-0002. Total: $4,500 MXN", orderId: order2.id, userId: admin.id, createdAt: new Date("2025-05-02T14:00:00") },
    { id: "te-8", eventType: "STATUS_CHANGED", title: "Control de calidad", description: "Revisión de bordados en progreso", orderId: order2.id, userId: collab.id, createdAt: new Date("2025-05-10T10:00:00") },
  ];
  for (const te of traceEvents) {
    await prisma.traceEvent.upsert({ where: { id: te.id }, update: {}, create: te });
  }

  console.log("✅ Seed completado!");
  console.log("\n📋 Credenciales demo:");
  console.log("   Admin:         admin@inzigna.com       / Admin123!");
  console.log("   Colaborador:   colaborador@inzigna.com / Collab123!");
  console.log("   Cliente:       cliente@inzigna.com     / Client123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
