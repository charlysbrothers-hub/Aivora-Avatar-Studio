"use client";

import { useStore, useStoreActions } from "@/lib/store";
import type { PromptTool, SocialPlatform } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";

const TOOLS: PromptTool[] = ["gemini_image", "gemini_video", "higgsfield"];
const PLATFORMS: SocialPlatform[] = ["instagram", "tiktok", "youtube", "facebook"];

export default function ConfiguracionPage() {
  const store = useStore();
  const { updateSettings, resetStore } = useStoreActions();
  const s = store.settings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Parámetros locales del Studio · reglas de control · handles
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="font-semibold">General</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Nombre del studio</label>
            <input
              className="input"
              value={s.studioName}
              onChange={(e) => updateSettings({ studioName: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Idioma</label>
            <input
              className="input"
              value={s.defaultLanguage}
              onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-muted)]">Red por defecto</label>
            <select
              className="select"
              value={s.defaultPlatform}
              onChange={(e) =>
                updateSettings({ defaultPlatform: e.target.value as SocialPlatform })
              }
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Reglas del guardián</h2>
        {(
          [
            ["transparencyRequired", "Transparencia IA obligatoria"],
            ["requireReviewBeforeLibrary", "Revisión obligatoria antes de Biblioteca"],
            ["requireLibraryBeforePublish", "Solo publicar desde Biblioteca"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={s[key]}
              onChange={(e) => updateSettings({ [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Tools preferidas</h2>
        <div className="flex flex-wrap gap-3">
          {TOOLS.map((tool) => {
            const on = s.preferredTools.includes(tool);
            return (
              <button
                key={tool}
                type="button"
                className={`btn ${on ? "btn-primary" : "btn-ghost"}`}
                onClick={() => {
                  const preferredTools = on
                    ? s.preferredTools.filter((t) => t !== tool)
                    : [...s.preferredTools, tool];
                  updateSettings({ preferredTools });
                }}
              >
                {tool}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Handles de redes</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {PLATFORMS.map((p) => (
            <div key={p}>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">
                {PLATFORM_LABELS[p]}
              </label>
              <input
                className="input"
                value={s.socialHandles[p] || ""}
                onChange={(e) =>
                  updateSettings({
                    socialHandles: { ...s.socialHandles, [p]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Notas</h2>
        <textarea
          className="textarea"
          value={s.notes || ""}
          onChange={(e) => updateSettings({ notes: e.target.value })}
        />
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            if (confirm("¿Restablecer TODO el Studio al seed inicial?")) resetStore();
          }}
        >
          Restablecer datos locales
        </button>
      </div>
    </div>
  );
}
