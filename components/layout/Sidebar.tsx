"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, FolderKanban, ShoppingBag,
  Users, GitBranch, Megaphone, Scissors, Zap, LogOut,
  ChevronRight, Activity, X
} from "lucide-react";
import type { UserSession } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/projects", label: "Proyectos", icon: <FolderKanban size={18} /> },
  { href: "/dashboard/orders", label: "Pedidos", icon: <ShoppingBag size={18} />, roles: ["CLIENT"] },
  { href: "/dashboard/traceability", label: "Trazabilidad", icon: <GitBranch size={18} /> },
  { href: "/dashboard/marketing", label: "Marketing", icon: <Megaphone size={18} />, roles: ["ADMIN", "COLLABORATOR"] },
  { href: "/dashboard/production", label: "Producción", icon: <Scissors size={18} />, roles: ["ADMIN", "COLLABORATOR"] },
  { href: "/dashboard/campaigns", label: "Campañas Ads", icon: <Zap size={18} />, roles: ["ADMIN", "COLLABORATOR"] },
  { href: "/dashboard/users", label: "Usuarios", icon: <Users size={18} />, roles: ["ADMIN"] },
  { href: "/dashboard/analytics", label: "Analíticas", icon: <Activity size={18} />, roles: ["ADMIN"] },
];

interface SidebarProps {
  user: UserSession;
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ user, onClose }: { user: UserSession; onClose?: () => void }) {
  const pathname = usePathname();

  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl glass-red flex items-center justify-center">
            <Package size={18} className="text-brand-red" />
          </div>
          <div>
            <p className="font-bold text-white text-lg tracking-tight">INZIGNA</p>
            <p className="text-xs text-white/40 -mt-0.5">Sistema de Trazabilidad</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {visible.map((item, idx) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? "glass-red text-white glow-red-sm"
                    : "text-white/50 hover:text-white hover:bg-white/6"
                  }
                `}
              >
                <span className={isActive ? "text-brand-red" : "text-white/40 group-hover:text-white/80 transition-colors"}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-brand-red" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-sm mb-2">
          <div className="w-8 h-8 rounded-full glass-red flex items-center justify-center text-xs font-bold text-brand-red">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-white/40 truncate capitalize">
              {user.role === "ADMIN" ? "Administrador" : user.role === "COLLABORATOR" ? "Colaborador" : "Cliente"}
            </p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/6 transition-colors group"
          >
            <LogOut size={16} className="group-hover:text-brand-red transition-colors" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );
}

export default function Sidebar({ user, isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-64 h-screen flex-col glass border-r border-white/8 fixed left-0 top-0 z-40">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile sidebar — drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="mobile-sidebar"
            className="flex lg:hidden w-64 h-screen flex-col glass border-r border-white/8 fixed left-0 top-0 z-40"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SidebarContent user={user} onClose={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
