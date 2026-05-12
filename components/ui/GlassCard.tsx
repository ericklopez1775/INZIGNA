"use client";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "red" | "sm";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClass = {
  default: "glass",
  strong: "glass-strong",
  red: "glass-red",
  sm: "glass-sm",
};

const paddingClass = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function GlassCard({
  variant = "default",
  hover = false,
  padding = "md",
  className = "",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`
        rounded-2xl
        ${variantClass[variant]}
        ${paddingClass[padding]}
        ${hover ? "transition-all duration-300 hover:bg-white/8 hover:border-white/20 cursor-pointer" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
