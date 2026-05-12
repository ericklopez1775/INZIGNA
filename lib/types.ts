export type Role = "ADMIN" | "COLLABORATOR" | "CLIENT";

export type ProjectType =
  | "MARKETING_DIGITAL"
  | "CONTENT_CREATION"
  | "ADS_CAMPAIGN"
  | "DTF_ORDER"
  | "EMBROIDERY_ORDER"
  | "LASER_ENGRAVING"
  | "DIGITAL_SERVICE"
  | "PHYSICAL_PRODUCT";

export type ProjectStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "IN_PRODUCTION"
  | "QUALITY_CHECK"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
}

export interface ProjectWithRelations {
  id: string;
  title: string;
  description: string | null;
  type: ProjectType;
  status: ProjectStatus;
  priority: string;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  tags: string | null;
  notes: string | null;
  budget: number | null;
  clientId: string;
  collaboratorId: string | null;
  createdAt: string;
  client?: { id: string; name: string; email: string };
  collaborator?: { id: string; name: string; email: string } | null;
  milestones?: Array<{ id: string; title: string; description: string | null; dueDate: Date | string | null; completed: boolean }>;
  traceEvents?: TraceEventData[];
}

export interface OrderWithRelations {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  trackingCode: string | null;
  shippingAddress: string | null;
  notes: string | null;
  clientId: string;
  projectId: string | null;
  createdAt: string;
  client?: { id: string; name: string; email: string };
  items: OrderItemData[];
  traceEvents?: TraceEventData[];
}

export interface OrderItemData {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface TraceEventData {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  metadata: string | null;
  createdAt: string;
  userId: string | null;
  projectId: string | null;
  orderId: string | null;
  user?: { id: string; name: string } | null;
}

export interface MilestoneData {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  MARKETING_DIGITAL: "Marketing Digital",
  CONTENT_CREATION: "Creación de Contenido",
  ADS_CAMPAIGN: "Campaña Ads",
  DTF_ORDER: "Impresión DTF",
  EMBROIDERY_ORDER: "Bordado",
  LASER_ENGRAVING: "Grabado Láser",
  DIGITAL_SERVICE: "Servicio Digital",
  PHYSICAL_PRODUCT: "Producto Físico",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  REVIEW: "En Revisión",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pago Pendiente",
  PAID: "Pagado",
  IN_PRODUCTION: "En Producción",
  QUALITY_CHECK: "Control de Calidad",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  IN_PROGRESS: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  REVIEW: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  COMPLETED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  CANCELLED: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  PAID: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  IN_PRODUCTION: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  QUALITY_CHECK: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  SHIPPED: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  DELIVERED: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  PENDING_PAYMENT: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};
