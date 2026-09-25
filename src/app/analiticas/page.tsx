"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { PLATFORM_LABELS } from "@/lib/types";

export default function AnaliticasPage() {
  const store = useStore();

  const totals = useMemo(() => {
    return store.metrics.reduce(
      (acc, m) => {
        acc.views += m.views;
        acc.reach += m.reach;
        acc.likes += m.likes;
        acc.comments += m.comments;
        acc.shares += m.shares;
        acc.saves += m.saves;
        acc.followers += m.followersGained;
        return acc;
      },
      { views: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followers: 0 },
    );
  }, [store.metrics]);

  const byPlatform = useMemo(() => {
    const map: Record<string, { views: number; engagement: number; count: number }> = {};
    for (const m of store.metrics) {
      if (!map[m.platform]) map[m.platform] = { views: 0, engagement: 0, count: 0 };
      map[m.platform].views += m.views;
      map[m.platform].engagement += m.engagementRate;
      map[m.platform].count += 1;
    }
    return Object.entries(map).map(([platform, v]) => ({
      platform,
      views: v.views,
      avgEngagement: v.count ? Number((v.engagement / v.count).toFixed(1)) : 0,
    }));
  }, [store.metrics]);

  const published = store.publications.filter((p) => p.status === "published");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analíticas</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Cierra el ciclo: qué funcionó → qué producir después (datos mock locales)
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Vistas", value: totals.views.toLocaleString() },
          { label: "Alcance", value: totals.reach.toLocaleString() },
          { label: "Interacciones", value: (totals.likes + totals.comments + totals.shares).toLocaleString() },
          { label: "Seguidores +", value: totals.followers.toLocaleString() },
        ].map((k) => (
          <div key={k.label} className="card p-4">
            <div className="text-xs text-[var(--text-muted)]">{k.label}</div>
            <div className="mt-2 text-2xl font-bold">{k.value}</div>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold">Rendimiento por red</h2>
        <div className="space-y-3">
          {byPlatform.map((row) => {
            const max = Math.max(...byPlatform.map((r) => r.views), 1);
            const width = Math.round((row.views / max) * 100);
            return (
              <div key={row.platform}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{PLATFORM_LABELS[row.platform as keyof typeof PLATFORM_LABELS]}</span>
                  <span className="text-[var(--text-muted)]">
                    {row.views.toLocaleString()} vistas · {row.avgEngagement}% eng.
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-elevated)]">
                  <div className="h-2 rounded-full gradient-bg" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
          {byPlatform.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">Sin métricas todavía.</p>
          )}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Por publicación</h2>
          <Link href="/publicaciones" className="text-sm text-purple-300 hover:underline">
            Publicaciones
          </Link>
        </div>
        <div className="space-y-3">
          {store.metrics.map((m) => {
            const pub = store.publications.find((p) => p.id === m.publicationId);
            return (
              <div
                key={m.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-medium">{pub?.title || m.publicationId}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {PLATFORM_LABELS[m.platform]} · eng. {m.engagementRate}%
                    </div>
                  </div>
                  <span className="badge badge-muted">{pub?.status || "—"}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
                  <Metric label="Vistas" value={m.views} />
                  <Metric label="Alcance" value={m.reach} />
                  <Metric label="Likes" value={m.likes} />
                  <Metric label="Coment." value={m.comments} />
                  <Metric label="Shares" value={m.shares} />
                  <Metric label="Saves" value={m.saves} />
                  <Metric label="Followers+" value={m.followersGained} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-2 font-semibold">Aprendizajes rápidos</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--text-muted)]">
          <li>
            Publicadas: {published.length}. Usa lo que más engagement tenga para nuevas Ideas.
          </li>
          <li>
            Guardados ({totals.saves}): buen indicador de contenido “útil” para Aivora.
          </li>
          <li>Transparencia IA debe permanecer visible en captions de alto alcance.</li>
        </ul>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[var(--text-muted)]">{label}</div>
      <div className="font-semibold">{value.toLocaleString()}</div>
    </div>
  );
}
