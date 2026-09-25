"use client";

import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 px-6 backdrop-blur">
      <div className="relative max-w-xl flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          className="input pl-9"
          placeholder="Buscar ideas, producciones, prompts…"
          readOnly
        />
      </div>
      <button className="btn btn-ghost relative px-3" type="button" aria-label="Notificaciones">
        <Bell size={18} />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
      </button>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full gradient-bg" />
        <div className="leading-tight">
          <div className="text-sm font-semibold">Admin</div>
          <div className="text-xs text-[var(--text-muted)]">Aivora Studio</div>
        </div>
      </div>
    </header>
  );
}
