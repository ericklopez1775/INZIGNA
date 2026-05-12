"use client";
import { Bell, Search } from "lucide-react";
import type { UserSession } from "@/lib/types";

interface HeaderProps {
  user: UserSession;
  title?: string;
}

export default function Header({ user, title }: HeaderProps) {
  return (
    <header className="hidden lg:flex h-14 glass border-b border-white/8 items-center justify-between px-6 sticky top-0 z-30 flex-shrink-0">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-base font-semibold text-white/80">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl glass-sm text-white/50 hover:text-white transition-colors">
          <Search size={17} />
        </button>
        <button className="p-2 rounded-xl glass-sm text-white/50 hover:text-white transition-colors relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-red rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-7 h-7 rounded-full glass-red flex items-center justify-center text-xs font-bold text-brand-red">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-white/60">{user.name.split(" ")[0]}</span>
        </div>
      </div>
    </header>
  );
}
