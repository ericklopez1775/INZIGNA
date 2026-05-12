import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INZIGNA — Sistema de Trazabilidad",
  description: "Plataforma de trazabilidad para productos, servicios y proyectos de INZIGNA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-mesh text-white antialiased">{children}</body>
    </html>
  );
}
