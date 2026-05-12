"use client";
import Link from "next/link";
import { Menu, Package } from "lucide-react";
import type { UserSession } from "@/lib/types";

interface MobileHeaderProps {
  user: UserSession;
  onMenuClick: () => void;
}

export default function MobileHeader({ user, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 glass border-b border-white/8 lg:hidden flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl glass-sm text-white/60 hover:text-white hover:bg-white/8 transition-all active:scale-95"
        aria-label="Abrir menú"
      >
        <Menu size={20} />
      </button>

      <Link href="/dashboard" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg glass-red flex items-center justify-center">
          <Package size={14} className="text-brand-red" />
        </div>
        <span className="font-bold text-white tracking-tight">INZIGNA</span>
      </Link>

      <div className="w-9 h-9 rounded-full glass-red flex items-center justify-center text-sm font-bold text-brand-red">
        {user.name.charAt(0).toUpperCase()}
      </div>
    </header>
  );
}
