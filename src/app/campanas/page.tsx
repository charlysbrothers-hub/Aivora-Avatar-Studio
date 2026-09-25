"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore, useStoreActions } from "@/lib/store";

export default function CampanasPage() {
  const store = useStore();
  const { addCampaign, updateCampaign, linkProductionToCampaign } = useStoreActions();
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [productId, setProductId] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campañas</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Agrupa producciones y publicaciones bajo un mismo objetivo
        </p>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Nueva campaña</h2>
        <input
          className="input"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textarea"
          placeholder="Objetivo"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        />
        <select
          className="select max-w-md"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Sin producto</option>
          {store.products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!title.trim() || !objective.trim()) return;
            addCampaign({
              title: title.trim(),
              objective: objective.trim(),
              productId: productId || undefined,
              status: "active",
            });
            setTitle("");
            setObjective("");
            setProductId("");
          }}
        >
          Crear campaña
        </button>
      </div>

      <div className="space-y-4">
        {store.campaigns.map((c) => {
          const product = store.products.find((p) => p.id === c.productId);
          const productions = store.productions.filter((p) => c.productionIds.includes(p.id));
          const publications = store.publications.filter((p) => c.publicationIds.includes(p.id));
          const unlinkable = store.productions.filter((p) => !c.productionIds.includes(p.id));

          return (
            <div key={c.id} className="card space-y-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{c.objective}</p>
                  {product && (
                    <div className="mt-2 text-xs text-purple-300">Producto: {product.name}</div>
                  )}
                </div>
                <select
                  className="select max-w-[160px]"
                  value={c.status}
                  onChange={(e) =>
                    updateCampaign(c.id, {
                      status: e.target.value as typeof c.status,
                    })
                  }
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                  <option value="completed">completed</option>
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
                    Producciones ({productions.length})
                  </div>
                  <div className="space-y-2">
                    {productions.map((p) => (
                      <Link
                        key={p.id}
                        href={`/producciones/${p.id}`}
                        className="block rounded-xl border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--bg-elevated)]"
                      >
                        {p.title}
                      </Link>
                    ))}
                    {productions.length === 0 && (
                      <p className="text-xs text-[var(--text-muted)]">Sin producciones vinculadas</p>
                    )}
                  </div>
                  {unlinkable.length > 0 && (
                    <select
                      className="select mt-2"
                      defaultValue=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        linkProductionToCampaign(c.id, e.target.value);
                        e.target.value = "";
                      }}
                    >
                      <option value="">Vincular producción…</option>
                      {unlinkable.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
                    Publicaciones ({publications.length})
                  </div>
                  <div className="space-y-2">
                    {publications.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                      >
                        {p.title}
                        <div className="text-xs text-[var(--text-muted)]">{p.status}</div>
                      </div>
                    ))}
                    {publications.length === 0 && (
                      <p className="text-xs text-[var(--text-muted)]">
                        Programa desde Calendario con esta campaña
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
