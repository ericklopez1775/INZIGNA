"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Package, Eye, EyeOff } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales inválidas");
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
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-red mb-4 glow-red">
            <Package size={28} className="text-brand-red" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">INZIGNA</h1>
          <p className="text-white/40 text-sm mt-1">Sistema de Trazabilidad</p>
        </div>

        <GlassCard variant="strong">
          <h2 className="text-xl font-semibold text-white mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
              autoFocus
            />
            <Input
              label="Contraseña"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />

            {error && (
              <div className="glass-red rounded-xl px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              {loading ? "Iniciando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            ¿Acceso denegado?{" "}
            <span className="text-brand-red">Contacta al administrador</span>
          </p>
        </GlassCard>

        <p className="text-center text-xs text-white/20 mt-6">
          © 2025 INZIGNA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
