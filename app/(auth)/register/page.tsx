"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Package, Eye, EyeOff, Phone } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrar");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-red mb-4 glow-red">
            <Package size={28} className="text-brand-red" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">INZIGNA</h1>
          <p className="text-white/40 text-sm mt-1">Crear cuenta</p>
        </div>

        <GlassCard variant="strong">
          <h2 className="text-xl font-semibold text-white mb-6">Registro</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Juan García"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              icon={<User size={16} />}
              required
              autoFocus
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Teléfono (opcional)"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              icon={<Phone size={16} />}
            />
            <Input
              label="Contraseña"
              type={showPass ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              icon={<Lock size={16} />}
              iconRight={
                <button type="button" onClick={() => setShowPass((v) => !v)} className="text-white/40 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
            <Input
              label="Confirmar contraseña"
              type={showPass ? "text" : "password"}
              placeholder="Repite la contraseña"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            {error && (
              <div className="glass-red rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              {loading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-brand-red hover:underline">Iniciar sesión</a>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
