"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Package, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 overflow-hidden">
      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-red/5 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-brand-red/4 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-red-900/10 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.35, 0.15], x: [0, -25, 0], y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-brand-red/3 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </div>

      <motion.div
        className="w-full max-w-sm relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-red mb-4 glow-red"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Package size={28} className="text-brand-red" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-white tracking-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            INZIGNA
          </motion.h1>
          <motion.p
            className="text-white/40 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Sistema de Trazabilidad
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
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
                <motion.div
                  className="glass-red rounded-xl px-4 py-3 text-sm text-red-300"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
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
        </motion.div>

        <p className="text-center text-xs text-white/20 mt-6">
          © 2025 INZIGNA. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
}
