"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import Header from "@/components/layout/Header";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ProjectCard from "@/components/dashboard/ProjectCard";
import type { ProjectWithRelations, UserSession } from "@/lib/types";
import { PROJECT_TYPE_LABELS } from "@/lib/types";

const PROJECT_TYPES = Object.entries(PROJECT_TYPE_LABELS);
const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [filtered, setFiltered] = useState<ProjectWithRelations[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [collaborators, setCollaborators] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", type: "MARKETING_DIGITAL",
    clientId: "", collaboratorId: "", dueDate: "", budget: "", priority: "MEDIUM",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
    // Get current user from cookie via /api/auth/me (we'll use stored session approach)
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setSession(d.user);
    });
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data);
    setFiltered(data);
    setLoading(false);
  }

  useEffect(() => {
    if (session?.role === "ADMIN") {
      fetch("/api/users").then((r) => r.json()).then((users: { id: string; name: string; role: string }[]) => {
        setClients(users.filter((u) => u.role === "CLIENT"));
        setCollaborators(users.filter((u) => u.role === "COLLABORATOR" || u.role === "ADMIN"));
      });
    }
  }, [session]);

  useEffect(() => {
    let result = projects;
    if (search) result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (typeFilter) result = result.filter((p) => p.type === typeFilter);
    setFiltered(result);
  }, [search, statusFilter, typeFilter, projects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ title: "", description: "", type: "MARKETING_DIGITAL", clientId: "", collaboratorId: "", dueDate: "", budget: "", priority: "MEDIUM" });
      fetchProjects();
    }
    setSaving(false);
  }

  const canCreate = session?.role === "ADMIN" || session?.role === "COLLABORATOR";

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {session && <Header user={session} title="Proyectos" />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Proyectos</h2>
          <p className="text-white/40 text-sm">{filtered.length} proyectos encontrados</p>
        </div>
        {canCreate && (
          <Button icon={<Plus size={16} />} onClick={() => setShowModal(true)}>
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Filters */}
      <GlassCard padding="sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="w-full glass-sm rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-red/40"
              placeholder="Buscar proyectos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="glass-sm rounded-xl px-3 py-2.5 text-sm text-white/70 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="" className="bg-gray-900">Todos los estados</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-gray-900">{s}</option>
            ))}
          </select>
          <select
            className="glass-sm rounded-xl px-3 py-2.5 text-sm text-white/70 outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="" className="bg-gray-900">Todos los tipos</option>
            {PROJECT_TYPES.map(([key, label]) => (
              <option key={key} value={key} className="bg-gray-900">{label}</option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 glass rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="text-center py-16">
          <p className="text-white/30 text-lg">Sin proyectos</p>
          <p className="text-white/20 text-sm mt-1">
            {canCreate ? "Crea tu primer proyecto" : "No tienes proyectos asignados"}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} basePath="/dashboard/projects" />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nuevo Proyecto" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-white/60 mb-1.5 block">Título *</label>
              <input
                className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                placeholder="Nombre del proyecto"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Tipo *</label>
              <select
                className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white outline-none"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {PROJECT_TYPES.map(([key, label]) => (
                  <option key={key} value={key} className="bg-gray-900">{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Prioridad</label>
              <select
                className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white outline-none"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="LOW" className="bg-gray-900">Baja</option>
                <option value="MEDIUM" className="bg-gray-900">Media</option>
                <option value="HIGH" className="bg-gray-900">Alta</option>
              </select>
            </div>
            {session?.role === "ADMIN" && (
              <>
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Cliente *</label>
                  <select
                    className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white outline-none"
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                    required
                  >
                    <option value="" className="bg-gray-900">Seleccionar cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-1.5 block">Colaborador</label>
                  <select
                    className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white outline-none"
                    value={form.collaboratorId}
                    onChange={(e) => setForm({ ...form, collaboratorId: e.target.value })}
                  >
                    <option value="" className="bg-gray-900">Sin asignar</option>
                    {collaborators.map((c) => (
                      <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Fecha límite</label>
              <input
                type="date"
                className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white outline-none"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Presupuesto (MXN)</label>
              <input
                type="number"
                className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                placeholder="0.00"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm text-white/60 mb-1.5 block">Descripción</label>
              <textarea
                className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none"
                placeholder="Descripción del proyecto..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={saving}>
              Crear Proyecto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
