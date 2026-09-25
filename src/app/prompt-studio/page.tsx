"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore, useStoreActions } from "@/lib/store";
import { composePrompt } from "@/lib/prompt-composer";
import type { PromptTool } from "@/lib/types";

const TOOLS: { id: PromptTool; label: string }[] = [
  { id: "gemini_image", label: "Gemini Image" },
  { id: "gemini_video", label: "Gemini Video" },
  { id: "higgsfield", label: "Higgsfield" },
];

function PromptStudioInner() {
  const store = useStore();
  const { savePrompt } = useStoreActions();
  const search = useSearchParams();
  const initialProd = search.get("production") || store.productions[0]?.id || "";

  const [productionId, setProductionId] = useState(initialProd);
  const [sceneId, setSceneId] = useState("");
  const [tool, setTool] = useState<PromptTool>("gemini_image");
  const [cameraExtra, setCameraExtra] = useState("");
  const [lightingExtra, setLightingExtra] = useState("");
  const [copied, setCopied] = useState(false);

  const production = store.productions.find((p) => p.id === productionId);
  const scenes = store.scenes
    .filter((s) => s.productionId === productionId)
    .sort((a, b) => a.order - b.order);
  const activeSceneId = sceneId || scenes[0]?.id || "";
  const scene = scenes.find((s) => s.id === activeSceneId);

  const prompt = useMemo(() => {
    if (!production?.identityLock || !scene) return "";
    return composePrompt({
      store,
      lock: production.identityLock,
      scene,
      tool,
      cameraExtra,
      lightingExtra,
    });
  }, [production, scene, store, tool, cameraExtra, lightingExtra]);

  const history = store.prompts.filter(
    (p) => p.productionId === productionId && p.sceneId === activeSceneId,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prompt Studio</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Compone Identity Canon + Lock + escena + producto + instrucciones por tool.
        </p>
      </div>

      <div className="card grid gap-3 p-5 md:grid-cols-3">
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
            value={activeSceneId}
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
          <label className="mb-1 block text-xs text-[var(--text-muted)]">Tool</label>
          <select
            className="select"
            value={tool}
            onChange={(e) => setTool(e.target.value as PromptTool)}
          >
            {TOOLS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <input
          className="input md:col-span-1"
          placeholder="Cámara extra (opcional)"
          value={cameraExtra}
          onChange={(e) => setCameraExtra(e.target.value)}
        />
        <input
          className="input md:col-span-2"
          placeholder="Iluminación (opcional)"
          value={lightingExtra}
          onChange={(e) => setLightingExtra(e.target.value)}
        />
      </div>

      {!production?.identityLock && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Esta producción aún no tiene Identity Lock. Guárdalo antes de generar prompts
          canónicos.
        </div>
      )}

      <div className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Prompt compuesto</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!prompt}
              onClick={async () => {
                await navigator.clipboard.writeText(prompt);
                if (production && scene) {
                  savePrompt(production.id, scene.id, tool, prompt);
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copiado ✓" : "Copiar prompt"}
            </button>
          </div>
        </div>
        <textarea className="textarea min-h-[420px] font-mono text-xs" readOnly value={prompt} />
      </div>

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">Historial de esta escena</h2>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Sin prompts guardados aún.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div
                key={h.id}
                className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm"
              >
                <div className="flex justify-between gap-2">
                  <span className="badge badge-info">{h.tool}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(h.createdAt).toLocaleString()}
                  </span>
                </div>
                <pre className="mt-2 max-h-24 overflow-hidden text-xs whitespace-pre-wrap text-[var(--text-muted)]">
                  {h.content.slice(0, 280)}…
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PromptStudioPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Cargando…</div>}>
      <PromptStudioInner />
    </Suspense>
  );
}
