"use client";

import Link from "next/link";
import {
  Clapperboard,
  ImagePlus,
  Share2,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useStore, useStoreActions } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const store = useStore();
  const { resetStore } = useStoreActions();
  const inReview = store.productions.filter((p) => p.status === "REVIEW");
  const approved = store.productions.filter(
    (p) => p.status === "APPROVED" || p.status === "LIBRARY",
  );
  const ideasPending = store.ideas.filter((i) => i.status !== "converted");
  const scheduled = store.publications
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 5);
  const activeVersion = store.identity.versions.find(
    (v) => v.id === store.identity.activeVersionId,
  );

  const kpis = [
    { label: "Contenidos creados", value: String(store.generatedAssets.length || 32), delta: "+12%" },
    { label: "En biblioteca", value: String(store.library.length || 0), delta: store.library.length ? "+100%" : "—" },
    { label: "Ideas pendientes", value: String(ideasPending.length), delta: "activas" },
    { label: "En revisión", value: String(inReview.length), delta: inReview.length ? "acción" : "ok" },
  ];

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.25),transparent_55%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Centro de mando</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              Hola, Admin. Bienvenido a{" "}
              <span className="gradient-text">Aivora Studio</span>.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Qué estamos creando → qué necesita revisión → qué está aprobado → qué
              publicaremos. La IA genera; Studio decide qué pertenece a Aivora.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Crear", "Inspirar", "Conectar", "Hacer crecer"].map((t) => (
                <span key={t} className="badge badge-muted">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="card min-w-[220px] bg-[var(--bg-elevated)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles size={16} className="text-purple-400" />
              {store.identity.name} · {activeVersion?.version}
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {store.identity.nationality} · {store.identity.originCity} ·{" "}
              {store.identity.age} años
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="text-xs text-[var(--text-muted)]">{k.label}</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-bold">{k.value}</div>
              <span className="badge badge-success">{k.delta}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Necesita revisión</h2>
              <Link href="/producciones" className="text-sm text-purple-300 hover:underline">
                Ver producciones
              </Link>
            </div>
            {inReview.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Nada pendiente. Buen momento para una nueva idea.
              </p>
            ) : (
              <div className="space-y-3">
                {inReview.map((p) => (
                  <Link
                    key={p.id}
                    href={`/producciones/${p.id}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 hover:bg-[var(--bg-card-hover)]"
                  >
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-[var(--text-muted)] capitalize">{p.type}</div>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-lg font-semibold">Proyectos recientes</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {store.productions.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/producciones/${p.id}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 hover:bg-[var(--bg-card-hover)]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs uppercase text-[var(--text-muted)]">{p.type}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="font-medium">{p.title}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    {p.sceneIds.length} escenas · Lock{" "}
                    {p.identityLock ? "activo" : "pendiente"}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Publicaciones programadas</h2>
              <Link href="/calendario" className="text-sm text-purple-300 hover:underline">
                Calendario
              </Link>
            </div>
            {scheduled.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Nada programado. Programa desde Biblioteca o Calendario.
              </p>
            ) : (
              <div className="space-y-3">
                {scheduled.map((p) => (
                  <Link
                    key={p.id}
                    href="/publicaciones"
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 hover:bg-[var(--bg-card-hover)]"
                  >
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {p.platform} · {new Date(p.scheduledAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="badge badge-info">Programada</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" />
              <h2 className="text-lg font-semibold">Tareas de hoy</h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Revisar identidad canónica de Aivora
              </li>
              <li className="flex items-center gap-2 text-[var(--text-muted)]">
                <span className="h-4 w-4 rounded border border-[var(--border)]" />
                Revisar {inReview.length} producción(es) en cola
              </li>
              <li className="flex items-center gap-2 text-[var(--text-muted)]">
                <span className="h-4 w-4 rounded border border-[var(--border)]" />
                Preparar prompt en Prompt Studio
              </li>
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-sm italic text-[var(--text-muted)]">
              “Ideas hoy, oportunidades mañana” — Aivora
            </p>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Acciones rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/producciones?nueva=1"
                className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-center text-sm font-semibold text-white"
              >
                <Clapperboard size={20} />
                Nueva producción
              </Link>
              <Link
                href="/prompt-studio"
                className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 p-4 text-center text-sm font-semibold text-white"
              >
                <Wand2 size={20} />
                Prompt Studio
              </Link>
              <Link
                href="/importar"
                className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 text-center text-sm font-semibold text-white"
              >
                <ImagePlus size={20} />
                Importar contenido
              </Link>
              <Link
                href="/calendario"
                className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-center text-sm font-semibold text-white"
              >
                <Share2 size={20} />
                Nueva publicación
              </Link>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="gradient-bg p-5">
              <h3 className="font-semibold text-white">Tu creatividad sin límites</h3>
              <p className="mt-1 text-sm text-white/80">
                Aprobados en biblioteca: {approved.length}. La consistencia es el activo.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost w-full text-xs text-[var(--text-muted)]"
            onClick={() => {
              if (confirm("¿Restablecer datos al seed inicial de Aivora?")) {
                resetStore();
              }
            }}
          >
            Restablecer datos locales
          </button>
        </aside>
      </div>
    </div>
  );
}
