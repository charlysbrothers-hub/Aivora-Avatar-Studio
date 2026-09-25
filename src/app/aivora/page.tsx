"use client";

import { useState } from "react";
import { useStore, useStoreActions } from "@/lib/store";

const TABS = [
  "Identity",
  "Appearance",
  "Voice",
  "Personality",
  "References",
  "Versions",
] as const;

export default function AivoraPage() {
  const store = useStore();
  const { bumpIdentityVersion, updateActiveIdentity } = useStoreActions();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Identity");
  const version = store.identity.versions.find(
    (v) => v.id === store.identity.activeVersionId,
  )!;
  const voice = store.voiceProfiles.find((v) => v.id === version.voiceProfileId);
  const refs = store.references.filter((r) => r.status === "Canonical");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Aivora</h1>
          <p className="text-sm text-[var(--text-muted)]">
            ADN digital · identidad canónica · {version.version}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            bumpIdentityVersion("Ajuste de identidad desde el módulo Aivora")
          }
        >
          Nueva versión (bump)
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {tab === "Identity" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre" value={store.identity.name} />
            <Field label="Edad" value={String(store.identity.age)} />
            <Field label="Nacionalidad" value={store.identity.nationality} />
            <Field label="Origen" value={store.identity.originCity} />
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Bio</label>
              <textarea
                className="textarea"
                defaultValue={store.identity.bio}
                onBlur={(e) => updateActiveIdentity({ bio: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <strong>Transparencia:</strong> {store.identity.transparencyNote}
            </div>
          </div>
        )}

        {tab === "Appearance" && version && (
          <div className="space-y-3">
            {(
              [
                ["face", "Rostro"],
                ["eyes", "Ojos"],
                ["eyebrows", "Cejas"],
                ["nose", "Nariz"],
                ["lips", "Labios"],
                ["skin", "Piel"],
                ["hair", "Cabello"],
                ["body", "Cuerpo"],
                ["realism", "Realismo"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">{label}</label>
                <textarea
                  className="textarea min-h-[72px]"
                  defaultValue={version.appearance[key]}
                  onBlur={(e) =>
                    updateActiveIdentity({ appearance: { [key]: e.target.value } })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {tab === "Voice" && voice && (
          <div className="space-y-3">
            <Field label="Perfil" value={voice.name} />
            <Field label="Versión" value={voice.version} />
            <Field label="Descripción" value={voice.description} />
            <Field label="Parámetros" value={voice.params} />
          </div>
        )}

        {tab === "Personality" && (
          <div className="space-y-3">
            <Field label="Traits" value={version.personality.traits.join(", ")} />
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Tono</label>
              <textarea
                className="textarea"
                defaultValue={version.personality.tone}
                onBlur={(e) =>
                  updateActiveIdentity({ personality: { tone: e.target.value } })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Habla</label>
              <textarea
                className="textarea"
                defaultValue={version.personality.speech}
                onBlur={(e) =>
                  updateActiveIdentity({ personality: { speech: e.target.value } })
                }
              />
            </div>
            <Field
              label="Límites"
              value={version.personality.limits.join(" · ")}
            />
          </div>
        )}

        {tab === "References" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {refs.map((r) => (
              <div key={r.id} className="rounded-xl border border-[var(--border)] p-4">
                <div className="text-xs text-purple-300">{r.category}</div>
                <div className="mt-1 font-medium">{r.title}</div>
                <div className="mt-2 badge badge-success">{r.status}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "Versions" && (
          <div className="space-y-3">
            {store.identity.versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{v.version}</div>
                  <div className="text-xs text-[var(--text-muted)]">{v.changelog}</div>
                </div>
                {v.id === store.identity.activeVersionId && (
                  <span className="badge badge-success">Activa</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
