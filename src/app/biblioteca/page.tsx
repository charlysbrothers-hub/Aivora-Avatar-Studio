"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function BibliotecaPage() {
  const store = useStore();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "video" | "audio">("all");

  const items = useMemo(() => {
    return store.library.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.fileName.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [store.library, query, kind]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Solo material APPROVED. Archivo maestro de Aivora.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="input max-w-md"
          placeholder="Buscar por nombre o tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="select max-w-[160px]"
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
        >
          <option value="all">Todos</option>
          <option value="image">Imágenes</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      {items.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--text-muted)]">
          La biblioteca está vacía. Aprueba una producción en revisión para llenarla.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const production = store.productions.find((p) => p.id === item.productionId);
            return (
              <div key={item.id} className="card overflow-hidden">
                <div className="flex h-40 items-center justify-center bg-[var(--bg-elevated)]">
                  {item.dataUrl && item.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.dataUrl}
                      alt={item.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs uppercase text-[var(--text-muted)]">
                      {item.kind}
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="font-medium">{item.fileName}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {production?.title || item.productionId}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span key={t} className="badge badge-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/calendario`}
                      className="btn btn-primary w-full text-xs"
                    >
                      Programar
                    </Link>
                    <Link
                      href={`/producciones/${item.productionId}`}
                      className="btn btn-ghost w-full text-xs"
                    >
                      Producción
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
