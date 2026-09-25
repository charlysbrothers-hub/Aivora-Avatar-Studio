"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore, useStoreActions } from "@/lib/store";
import {
  PLATFORM_LABELS,
  PUBLICATION_STATUS_LABELS,
  type PublicationStatus,
  type SocialPlatform,
} from "@/lib/types";

const FILTERS: Array<PublicationStatus | "all"> = [
  "all",
  "draft",
  "scheduled",
  "published",
  "failed",
];

export default function PublicacionesPage() {
  const store = useStore();
  const { setPublicationStatus, simulatePublish } = useStoreActions();
  const [filter, setFilter] = useState<PublicationStatus | "all">("all");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");

  const list = useMemo(() => {
    return store.publications.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (platform !== "all" && p.platform !== platform) return false;
      return true;
    });
  }, [store.publications, filter, platform]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publicaciones</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Control local · Scheduled → Published / Failed (sin API real aún)
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Todas" : PUBLICATION_STATUS_LABELS[f]}
          </button>
        ))}
        <select
          className="select max-w-[160px]"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as SocialPlatform | "all")}
        >
          <option value="all">Todas las redes</option>
          {Object.entries(PLATFORM_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
            No hay publicaciones con este filtro. Programá desde{" "}
            <Link href="/calendario" className="text-purple-300 hover:underline">
              Calendario
            </Link>
            .
          </div>
        )}
        {list.map((p) => {
          const campaign = store.campaigns.find((c) => c.id === p.campaignId);
          const lib = store.library.find((l) => l.id === p.libraryAssetId);
          return (
            <div key={p.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    <span className="badge badge-muted">{PLATFORM_LABELS[p.platform]}</span>
                    <PubBadge status={p.status} />
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    Programada: {new Date(p.scheduledAt).toLocaleString()}
                    {p.publishedAt && ` · Publicada: ${new Date(p.publishedAt).toLocaleString()}`}
                  </div>
                  {p.caption && (
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{p.caption}</p>
                  )}
                  {campaign && (
                    <div className="mt-2 text-xs text-purple-300">Campaña: {campaign.title}</div>
                  )}
                  {lib && (
                    <div className="mt-1 text-xs text-[var(--text-muted)]">Asset: {lib.fileName}</div>
                  )}
                  {p.errorMessage && (
                    <div className="mt-2 text-xs text-rose-300">{p.errorMessage}</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.status === "draft" && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setPublicationStatus(p.id, "scheduled")}
                    >
                      Marcar programada
                    </button>
                  )}
                  {(p.status === "scheduled" || p.status === "failed") && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => simulatePublish(p.id)}
                    >
                      Simular publicar
                    </button>
                  )}
                  {p.status === "published" && (
                    <Link href="/analiticas" className="btn btn-ghost">
                      Ver métricas
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PubBadge({ status }: { status: PublicationStatus }) {
  const cls =
    status === "published"
      ? "badge-success"
      : status === "failed"
        ? "badge-danger"
        : status === "scheduled"
          ? "badge-info"
          : "badge-muted";
  return <span className={`badge ${cls}`}>{PUBLICATION_STATUS_LABELS[status]}</span>;
}
