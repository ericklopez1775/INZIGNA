"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, UserPlus, Copy, Check } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function InviteUserPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("CLIENT");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inviteUrl: string; token: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al crear invitación");
    } else {
      setResult(data);
    }
    setLoading(false);
  }

  async function copy() {
    const url = `${window.location.origin}${result?.inviteUrl}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-lg animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/users" className="p-2 rounded-xl glass-sm text-white/50 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-2xl font-semibold text-white">Invitar Usuario</h2>
      </div>

      {!result ? (
        <GlassCard variant="strong">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Correo electrónico *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  className="w-full glass-sm rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-red/50"
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Rol *</label>
              <select
                className="w-full glass-sm rounded-xl px-4 py-3 text-sm text-white outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CLIENT" className="bg-gray-900">Cliente</option>
                <option value="COLLABORATOR" className="bg-gray-900">Colaborador</option>
                <option value="ADMIN" className="bg-gray-900">Administrador</option>
              </select>
              <p className="text-xs text-white/30 mt-1.5">
                {role === "CLIENT" && "Acceso a sus pedidos y proyectos propios"}
                {role === "COLLABORATOR" && "Gestión de proyectos asignados y producción"}
                {role === "ADMIN" && "Acceso completo a todos los módulos"}
              </p>
            </div>
            {error && (
              <div className="glass-red rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" fullWidth onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading} fullWidth icon={<UserPlus size={16} />}>
                Crear invitación
              </Button>
            </div>
          </form>
        </GlassCard>
      ) : (
        <GlassCard variant="strong">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">¡Invitación creada!</h3>
            <p className="text-white/40 text-sm mt-1">Comparte este enlace con el usuario</p>
          </div>
          <div className="glass-sm rounded-xl p-4 mb-4">
            <p className="text-xs text-white/40 mb-2">Enlace de registro</p>
            <p className="text-sm text-white font-mono break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}
              {result.inviteUrl}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth icon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={copy}>
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </Button>
            <Button fullWidth onClick={() => router.push("/dashboard/users")}>
              Volver
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
