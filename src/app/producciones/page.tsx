"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, useStoreActions } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import type { ProductionType } from "@/lib/types";

const TYPES: ProductionType[] = [
  "fotografia",
  "carrusel",
  "story",
  "reel",
  "anuncio",
  "video",
  "promocional",
];

function ProduccionesInner() {
  const store = useStore();
  const { createProduction } = useStoreActions();
  const router = useRouter();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProductionType>("reel");

  useEffect(() => {
    if (search.get("nueva") === "1") setOpen(true);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Producciones</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Control de estados · Identity Lock · escenas
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          Nueva producción
        </button>
      </div>

      {open && (
        <div className="card space-y-3 p-5">
          <input
            className="input"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="select max-w-xs"
            value={type}
            onChange={(e) => setType(e.target.value as ProductionType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (!title.trim()) return;
                const id = createProduction(title.trim(), type);
                setOpen(false);
                setTitle("");
                router.push(`/producciones/${id}`);
              }}
            >
              Crear
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {store.productions.map((p) => (
          <Link
            key={p.id}
            href={`/producciones/${p.id}`}
            className="card flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-[var(--bg-card-hover)]"
          >
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="mt-1 text-xs capitalize text-[var(--text-muted)]">
                {p.type} · {p.sceneIds.length} escenas · Lock{" "}
                {p.identityLock ? "✓" : "pendiente"}
              </div>
            </div>
            <StatusBadge status={p.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ProduccionesPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Cargando…</div>}>
      <ProduccionesInner />
    </Suspense>
  );
}
