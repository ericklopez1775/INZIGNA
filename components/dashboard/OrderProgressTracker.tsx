"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STATUS_STEPS = ["PENDING_PAYMENT", "PAID", "IN_PRODUCTION", "QUALITY_CHECK", "SHIPPED", "DELIVERED"];

const STEP_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pago",
  PAID: "Pagado",
  IN_PRODUCTION: "Producción",
  QUALITY_CHECK: "Calidad",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
};

interface OrderProgressTrackerProps {
  status: string;
  trackingCode?: string | null;
}

export default function OrderProgressTracker({ status, trackingCode }: OrderProgressTrackerProps) {
  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div>
      <div className="flex items-center">
        {STATUS_STEPS.map((step, i) => {
          const isDone = i <= currentStep;
          const isCurrent = i === currentStep;
          const isLast = i === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone ? "bg-brand-red text-white" : "glass-sm text-white/30"
                  } ${isCurrent ? "ring-2 ring-brand-red/50 ring-offset-2 ring-offset-transparent" : ""}`}
                >
                  {isCurrent ? (
                    <motion.span
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {isDone ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                    </motion.span>
                  ) : isDone ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.15, duration: 0.3 }}
                  className={`text-xs mt-1.5 text-center w-14 leading-tight ${isDone ? "text-white/70" : "text-white/20"}`}
                >
                  {STEP_LABELS[step]}
                </motion.p>
              </div>

              {!isLast && (
                <div className="flex-1 h-0.5 mx-1 glass-sm overflow-hidden rounded-full">
                  <motion.div
                    className="h-full bg-brand-red"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: i < currentStep ? 1 : 0 }}
                    transition={{ delay: i * 0.08 + 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {trackingCode && (
        <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-2 text-sm">
          <span className="text-white/40">Código de rastreo:</span>
          <span className="text-brand-red font-mono font-medium">{trackingCode}</span>
        </div>
      )}
    </div>
  );
}
