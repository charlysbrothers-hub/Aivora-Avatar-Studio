"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, useStoreActions } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import type { IdentityLock, ReviewChecklist } from "@/lib/types";
import { EMPTY_CHECKLIST } from "@/lib/types";

const CHECK_LABELS: { key: keyof ReviewChecklist; label: string }[] = [
  { key: "face", label: "Rostro" },
  { key: "body", label: "Cuerpo" },
  { key: "hair", label: "Cabello" },
  { key: "outfit", label: "Outfit" },
  { key: "accessories", label: "Accesorios" },
  { key: "product", label: "Producto" },
  { key: "environment", label: "Escenario" },
  { key: "continuity", label: "Continuidad" },
  { key: "voice", label: "Voz" },
  { key: "quality", label: "Calidad" },
];

export default function ProductionDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const store = useStore();
  const {
    saveIdentityLock,
    addScene,
    updateScene,
    setProductionStatus,
    updateReviewChecklist,
    decideReview,
  } = useStoreActions();

  const production = store.productions.find((p) => p.id === id);
  const scenes = store.scenes
    .filter((s) => s.productionId === id)
    .sort((a, b) => a.order - b.order);
  const assets = store.generatedAssets.filter((a) => a.productionId === id);
  const reviews = store.reviews.filter((r) => r.productionId === id);

  const faceRefs = store.references.filter(
    (r) => r.category === "Face" && r.status !== "Archived",
  );
  const bodyRefs = store.references.filter(
    (r) => r.category === "Body" && r.status !== "Archived",
  );
  const hairRefs = store.references.filter(
    (r) => r.category === "Hair" && r.status !== "Archived",
  );
  const outfitRefs = store.references.filter(
    (r) => r.category === "Outfit" && r.status !== "Archived",
  );
  const accRefs = store.references.filter(
    (r) => r.category === "Accessories" && r.status !== "Archived",
  );
  const envRefs = store.references.filter(
    (r) => r.category === "Environment" && r.status !== "Archived",
  );

  const [lock, setLock] = useState<IdentityLock>(() =>
    production?.identityLock || {
      characterName: store.identity.name,
      identityVersionId: store.identity.activeVersionId,
      faceRefId: faceRefs[0]?.id,
      bodyRefId: bodyRefs[0]?.id,
      hairRefId: hairRefs[0]?.id,
      outfitRefId: outfitRefs[0]?.id,
      accessoryRefIds: accRefs[0] ? [accRefs[0].id] : [],
      productId: store.products[0]?.id,
      environmentRefId: envRefs[0]?.id,
      voiceProfileId: store.voiceProfiles[0]?.id,
      personalityNote: "Canon Aivora",
      notes: "",
    },
  );

  const [sceneTitle, setSceneTitle] = useState("");
  const [sceneDesc, setSceneDesc] = useState("");

  const pendingReview = useMemo(
    () => reviews.find((r) => r.decision === "PENDING"),
    [reviews],
  );

  if (!production) {
    return (
      <div className="space-y-3">
        <p>Producción no encontrada.</p>
        <Link href="/producciones" className="btn btn-ghost">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/producciones" className="text-xs text-purple-300 hover:underline">
            ← Producciones
          </Link>
          <h1 className="mt-1 text-2xl font-bold">{production.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={production.status} />
            <span className="badge badge-muted capitalize">{production.type}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/prompt-studio?production=${production.id}`} className="btn btn-primary">
            Prompt Studio
          </Link>
          <Link href={`/importar?production=${production.id}`} className="btn btn-ghost">
            Importar
          </Link>
        </div>
      </div>

      <section className="card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AIVORA IDENTITY LOCK</h2>
          {production.identityLock && (
            <span className="badge badge-success">Activo</span>
          )}
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Todas las escenas heredan estas condiciones. Sin cambios silenciosos.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Rostro"
            value={lock.faceRefId || ""}
            onChange={(v) => setLock({ ...lock, faceRefId: v })}
            options={faceRefs.map((r) => ({ value: r.id, label: r.title }))}
          />
          <Select
            label="Cuerpo"
            value={lock.bodyRefId || ""}
            onChange={(v) => setLock({ ...lock, bodyRefId: v })}
            options={bodyRefs.map((r) => ({ value: r.id, label: r.title }))}
          />
          <Select
            label="Cabello"
            value={lock.hairRefId || ""}
            onChange={(v) => setLock({ ...lock, hairRefId: v })}
            options={hairRefs.map((r) => ({ value: r.id, label: r.title }))}
          />
          <Select
            label="Outfit"
            value={lock.outfitRefId || ""}
            onChange={(v) => setLock({ ...lock, outfitRefId: v })}
            options={outfitRefs.map((r) => ({ value: r.id, label: r.title }))}
          />
          <Select
            label="Accesorio principal"
            value={lock.accessoryRefIds[0] || ""}
            onChange={(v) =>
              setLock({ ...lock, accessoryRefIds: v ? [v] : [] })
            }
            options={accRefs.map((r) => ({ value: r.id, label: r.title }))}
          />
          <Select
            label="Producto"
            value={lock.productId || ""}
            onChange={(v) => setLock({ ...lock, productId: v })}
            options={store.products.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.sku})`,
            }))}
          />
          <Select
            label="Escenario"
            value={lock.environmentRefId || ""}
            onChange={(v) => setLock({ ...lock, environmentRefId: v })}
            options={envRefs.map((r) => ({ value: r.id, label: r.title }))}
          />
          <Select
            label="Voz"
            value={lock.voiceProfileId || ""}
            onChange={(v) => setLock({ ...lock, voiceProfileId: v })}
            options={store.voiceProfiles.map((v) => ({
              value: v.id,
              label: v.name,
            }))}
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-[var(--text-muted)]">
              Personalidad / notas
            </label>
            <textarea
              className="textarea"
              value={lock.personalityNote}
              onChange={(e) =>
                setLock({ ...lock, personalityNote: e.target.value })
              }
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            saveIdentityLock(production.id, {
              ...lock,
              characterName: store.identity.name,
              identityVersionId: store.identity.activeVersionId,
            });
          }}
        >
          Guardar Identity Lock
        </button>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="text-lg font-semibold">Escenas</h2>
        <div className="space-y-3">
          {scenes.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4"
            >
              <div className="mb-2 text-xs text-purple-300">
                Scene {String(s.order).padStart(2, "0")}
              </div>
              <input
                className="input mb-2"
                value={s.title}
                onChange={(e) => updateScene(s.id, { title: e.target.value })}
              />
              <textarea
                className="textarea mb-2"
                value={s.description}
                onChange={(e) =>
                  updateScene(s.id, { description: e.target.value })
                }
              />
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className="input"
                  placeholder="Cámara"
                  value={s.camera || ""}
                  onChange={(e) => updateScene(s.id, { camera: e.target.value })}
                />
                <input
                  className="input"
                  placeholder="Diálogo"
                  value={s.dialogue || ""}
                  onChange={(e) =>
                    updateScene(s.id, { dialogue: e.target.value })
                  }
                />
              </div>
              {!s.overrideLock && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Hereda Identity Lock de la producción
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            className="input"
            placeholder="Título escena"
            value={sceneTitle}
            onChange={(e) => setSceneTitle(e.target.value)}
          />
          <input
            className="input"
            placeholder="Descripción"
            value={sceneDesc}
            onChange={(e) => setSceneDesc(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (!sceneTitle.trim()) return;
              addScene(production.id, sceneTitle.trim(), sceneDesc.trim());
              setSceneTitle("");
              setSceneDesc("");
            }}
          >
            Añadir escena
          </button>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="text-lg font-semibold">Revisión (guardián)</h2>
        {assets.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">
            Aún no hay assets importados. Usa Importar después de generar fuera.
          </p>
        )}
        {assets.map((asset) => {
          const review = reviews.find((r) => r.assetId === asset.id);
          if (!review) return null;
          const checklist = review.checklist || { ...EMPTY_CHECKLIST };
          return (
            <div
              key={asset.id}
              className="rounded-xl border border-[var(--border)] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{asset.fileName}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Escena {asset.sceneId} · {asset.kind} · {review.decision}
                  </div>
                </div>
                {asset.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.dataUrl}
                    alt={asset.fileName}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[10px] text-[var(--text-muted)]">
                    Sin preview
                  </div>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {CHECK_LABELS.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[key]}
                      disabled={review.decision !== "PENDING"}
                      onChange={(e) =>
                        updateReviewChecklist(review.id, {
                          ...checklist,
                          [key]: e.target.checked,
                        })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
              {review.decision === "PENDING" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => decideReview(review.id, "APPROVED")}
                  >
                    Aprobar → Biblioteca
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      decideReview(review.id, "REJECTED", "Falló checklist");
                      setProductionStatus(production.id, "REJECTED");
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {pendingReview && (
          <p className="text-xs text-amber-300">
            Hay revisión pendiente. No publicar sin aprobación.
          </p>
        )}
      </section>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-[var(--text-muted)]">{label}</label>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
