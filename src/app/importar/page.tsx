"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, useStoreActions } from "@/lib/store";
import type { AssetKind } from "@/lib/types";

function ImportarInner() {
  const store = useStore();
  const { importAsset } = useStoreActions();
  const search = useSearchParams();
  const router = useRouter();
  const [productionId, setProductionId] = useState(
    search.get("production") || store.productions[0]?.id || "",
  );
  const [sceneId, setSceneId] = useState("");
  const [kind, setKind] = useState<AssetKind>("image");
  const [msg, setMsg] = useState("");

  const scenes = store.scenes
    .filter((s) => s.productionId === productionId)
    .sort((a, b) => a.order - b.order);
  const activeScene = sceneId || scenes[0]?.id || "";

  function onFile(file: File | null) {
    if (!file || !productionId || !activeScene) return;
    const reader = new FileReader();
    reader.onload = () => {
      importAsset({
        productionId,
        sceneId: activeScene,
        kind,
        dataUrl: String(reader.result || ""),
        fileName: file.name,
      });
      setMsg(`Importado: ${file.name}. Pasa a revisión.`);
      router.push(`/producciones/${productionId}`);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar contenido</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Generaste fuera (Gemini / Higgsfield). Aquí entra a Producciones → Revisión.
          Importar ≠ aprobar.
        </p>
      </div>

      <div className="card max-w-xl space-y-4 p-5">
        <div>
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Producción</label>
          <select
            className="select"
            value={productionId}
            onChange={(e) => {
              setProductionId(e.target.value);
              setSceneId("");
            }}
          >
            {store.productions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Escena</label>
          <select
            className="select"
            value={activeScene}
            onChange={(e) => setSceneId(e.target.value)}
          >
            {scenes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.order}. {s.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Tipo</label>
          <select
            className="select"
            value={kind}
            onChange={(e) => setKind(e.target.value as AssetKind)}
          >
            <option value="image">Imagen</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>
        <label className="btn btn-primary w-full cursor-pointer">
          Seleccionar archivo
          <input
            type="file"
            accept={kind === "image" ? "image/*" : kind === "video" ? "video/*" : "audio/*"}
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </label>
        {msg && <p className="text-sm text-emerald-300">{msg}</p>}
      </div>
    </div>
  );
}

export default function ImportarPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Cargando…</div>}>
      <ImportarInner />
    </Suspense>
  );
}
