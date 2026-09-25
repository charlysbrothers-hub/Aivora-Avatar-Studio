"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, useStoreActions } from "@/lib/store";
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

export default function IdeasPage() {
  const store = useStore();
  const { addIdea, convertIdeaToProduction } = useStoreActions();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [concept, setConcept] = useState("");
  const [formatHint, setFormatHint] = useState<ProductionType>("reel");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ideas</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Banco de conceptos antes de Identity Lock y producción.
        </p>
      </div>

      <div className="card space-y-3 p-5">
        <input
          className="input"
          placeholder="Título de la idea"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="textarea"
          placeholder="Qué quieres comunicar…"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <select
            className="select max-w-xs"
            value={formatHint}
            onChange={(e) => setFormatHint(e.target.value as ProductionType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!title.trim() || !concept.trim()) return;
              addIdea({ title: title.trim(), concept: concept.trim(), formatHint });
              setTitle("");
              setConcept("");
            }}
          >
            Guardar idea
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {store.ideas.map((idea) => (
          <div key={idea.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{idea.title}</h3>
                  <span className="badge badge-muted">{idea.status}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{idea.concept}</p>
                {idea.formatHint && (
                  <div className="mt-2 text-xs capitalize text-purple-300">
                    Formato: {idea.formatHint}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {idea.productionId ? (
                  <Link
                    href={`/producciones/${idea.productionId}`}
                    className="btn btn-ghost"
                  >
                    Ver producción
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      const id = convertIdeaToProduction(
                        idea.id,
                        idea.formatHint || "reel",
                      );
                      if (id) router.push(`/producciones/${id}`);
                    }}
                  >
                    Convertir en producción
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
