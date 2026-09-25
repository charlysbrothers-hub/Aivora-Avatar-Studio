"use client";

import { useState } from "react";
import { useStore, useStoreActions } from "@/lib/store";

export default function ProductosPage() {
  const store = useStore();
  const { addProduct } = useStoreActions();
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Productos</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Fotos reales y claims permitidos — la IA no inventa detalles.
        </p>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Agregar producto</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="input"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </div>
        <textarea
          className="textarea"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!name.trim()) return;
            addProduct({
              name: name.trim(),
              sku: sku.trim() || `SKU-${Date.now()}`,
              description: description.trim(),
              specs: [],
              colors: [],
              dimensions: "",
              claims: ["No inventar características visuales"],
              visualDetails: [],
            });
            setName("");
            setSku("");
            setDescription("");
          }}
        >
          Guardar producto
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {store.products.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="text-xs text-[var(--text-muted)]">{p.sku}</div>
              </div>
              <span className="badge badge-info">{p.colors.join(", ") || "—"}</span>
            </div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{p.description}</p>
            {p.specs.length > 0 && (
              <ul className="mt-3 list-inside list-disc text-sm">
                {p.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
            {p.visualDetails.length > 0 && (
              <div className="mt-3 text-sm">
                <div className="text-xs text-[var(--text-muted)]">Detalles visuales</div>
                <p>{p.visualDetails.join(" · ")}</p>
              </div>
            )}
            {p.claims.length > 0 && (
              <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
                Claims: {p.claims.join(" · ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
