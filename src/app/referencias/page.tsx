"use client";

import { useState } from "react";
import { useStore, useStoreActions } from "@/lib/store";
import type { ReferenceCategory, ReferenceStatus } from "@/lib/types";

const CATEGORIES: ReferenceCategory[] = [
  "Face",
  "Body",
  "Hair",
  "Outfit",
  "Accessories",
  "Pose",
  "Environment",
  "Product",
  "Voice",
];

const STATUSES: ReferenceStatus[] = [
  "Candidate",
  "Reviewed",
  "Canonical",
  "Archived",
];

export default function ReferenciasPage() {
  const store = useStore();
  const { addReference, updateReference } = useStoreActions();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ReferenceCategory>("Face");
  const [filter, setFilter] = useState<ReferenceCategory | "all">("all");

  const list =
    filter === "all"
      ? store.references
      : store.references.filter((r) => r.category === filter);

  function onFile(file: File | null, id?: string) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (id) {
        updateReference(id, { imageDataUrl: dataUrl });
      } else if (title.trim()) {
        addReference({
          title: title.trim(),
          category,
          status: "Candidate",
          imageDataUrl: dataUrl,
        });
        setTitle("");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referencias</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Solo lo canónico alimenta Identity Lock. Las malas no contaminan.
        </p>
      </div>

      <div className="card grid gap-3 p-5 md:grid-cols-[1fr_180px_auto]">
        <input
          className="input"
          placeholder="Título de la referencia"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value as ReferenceCategory)}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="btn btn-primary cursor-pointer">
          Subir imagen
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost md:col-span-3"
          onClick={() => {
            if (!title.trim()) return;
            addReference({
              title: title.trim(),
              category,
              status: "Candidate",
            });
            setTitle("");
          }}
        >
          Añadir sin imagen
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`btn ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setFilter("all")}
        >
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            className={`btn ${filter === c ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <div key={r.id} className="card overflow-hidden">
            <div className="flex h-36 items-center justify-center bg-[var(--bg-elevated)]">
              {r.imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.imageDataUrl}
                  alt={r.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-[var(--text-muted)]">Sin imagen</span>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="text-xs text-purple-300">{r.category}</div>
              <div className="font-medium">{r.title}</div>
              <select
                className="select"
                value={r.status}
                onChange={(e) =>
                  updateReference(r.id, {
                    status: e.target.value as ReferenceStatus,
                  })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <label className="btn btn-ghost w-full cursor-pointer text-xs">
                Reemplazar imagen
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] || null, r.id)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
