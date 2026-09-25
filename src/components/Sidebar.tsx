"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clapperboard,
  FolderKanban,
  Home,
  ImagePlus,
  Lightbulb,
  Megaphone,
  Package,
  Settings,
  Share2,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/aivora", label: "Aivora", icon: Sparkles },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
  { href: "/prompt-studio", label: "Prompt Studio", icon: Wand2 },
  { href: "/producciones", label: "Producciones", icon: Clapperboard },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { href: "/importar", label: "Importar", icon: ImagePlus },
  { href: "/referencias", label: "Referencias", icon: FolderKanban },
  { href: "/productos", label: "Productos", icon: Package },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/publicaciones", label: "Publicaciones", icon: Share2 },
  { href: "/analiticas", label: "Analíticas", icon: BarChart3 },
  { href: "/campanas", label: "Campañas", icon: Megaphone },
  { href: "/equipo", label: "Equipo", icon: Users },
  { href: "/configuracion", label: "Configuración", icon: Settings },
] as const;

export function Sidebar({ onSignOut }: { onSignOut?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <div className="text-lg font-bold tracking-tight">
          <span className="gradient-text">Aivora</span> Studio
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Centro de operaciones · Guardián de identidad
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "gradient-bg text-white shadow-lg shadow-purple-500/20"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] space-y-2 px-5 py-4 text-xs text-[var(--text-muted)]">
        {onSignOut && (
          <button type="button" className="btn btn-ghost w-full text-xs" onClick={onSignOut}>
            Cerrar sesión
          </button>
        )}
        <div>v1.2.0 · Supabase sync</div>
        <div className="italic">Crea. Inspira. Conecta.</div>
      </div>
    </aside>
  );
}
