"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore, useStoreActions } from "@/lib/store";
import {
  PLATFORM_LABELS,
  type ProductionType,
  type SocialPlatform,
} from "@/lib/types";

const PLATFORMS: SocialPlatform[] = ["instagram", "tiktok", "youtube", "facebook"];
const FORMATS: ProductionType[] = ["reel", "story", "fotografia", "carrusel", "video"];

export default function CalendarioPage() {
  const store = useStore();
  const { scheduleFromLibrary } = useStoreActions();
  const [monthOffset, setMonthOffset] = useState(0);
  const [libraryAssetId, setLibraryAssetId] = useState(store.library[0]?.id || "");
  const [platform, setPlatform] = useState<SocialPlatform>(store.settings.defaultPlatform);
  const [format, setFormat] = useState<ProductionType>("reel");
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("2026-09-28T10:00");
  const [campaignId, setCampaignId] = useState("");

  const view = useMemo(() => {
    const base = new Date(2026, 8, 1);
    base.setMonth(base.getMonth() + monthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { day: number | null; dateKey: string | null }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ day: null, dateKey: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, dateKey: key });
    }
    return { year, month, label: base.toLocaleString("es", { month: "long", year: "numeric" }), cells };
  }, [monthOffset]);

  const itemsByDay = useMemo(() => {
    const map: Record<string, typeof store.calendarItems> = {};
    for (const item of store.calendarItems) {
      const key = item.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [store.calendarItems]);

  const upcoming = [...store.calendarItems].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Programa desde Biblioteca · fecha · red · formato
        </p>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="font-semibold">Programar publicación</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <select
            className="select"
            value={libraryAssetId}
            onChange={(e) => setLibraryAssetId(e.target.value)}
          >
            <option value="">Asset de biblioteca…</option>
            {store.library.map((l) => (
              <option key={l.id} value={l.id}>
                {l.fileName}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="input"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <select
            className="select"
            value={platform}
            onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={format}
            onChange={(e) => setFormat(e.target.value as ProductionType)}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            <option value="">Sin campaña</option>
            {store.campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!libraryAssetId || !title.trim() || !when) return;
            if (store.settings.requireLibraryBeforePublish && !store.library.length) return;
            scheduleFromLibrary({
              libraryAssetId,
              title: title.trim(),
              platform,
              format,
              scheduledAt: new Date(when).toISOString(),
              campaignId: campaignId || undefined,
            });
            setTitle("");
          }}
        >
          Añadir al calendario
        </button>
        {store.library.length === 0 && (
          <p className="text-xs text-amber-300">
            La biblioteca está vacía. Aprueba contenido antes de programar.
          </p>
        )}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">{view.label}</h2>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setMonthOffset((n) => n - 1)}>
              ←
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMonthOffset(0)}>
              Hoy
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMonthOffset((n) => n + 1)}>
              →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--text-muted)]">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div key={d} className="py-1 font-semibold">
              {d}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-2">
          {view.cells.map((cell, idx) => {
            const items = cell.dateKey ? itemsByDay[cell.dateKey] || [] : [];
            return (
              <div
                key={idx}
                className={`min-h-[84px] rounded-xl border border-[var(--border)] p-2 ${
                  cell.day ? "bg-[var(--bg-elevated)]" : "opacity-30"
                }`}
              >
                {cell.day && (
                  <>
                    <div className="text-xs font-semibold">{cell.day}</div>
                    <div className="mt-1 space-y-1">
                      {items.slice(0, 2).map((it) => (
                        <div
                          key={it.id}
                          className="truncate rounded bg-purple-500/20 px-1 py-0.5 text-[10px] text-purple-200"
                          title={it.title}
                        >
                          {PLATFORM_LABELS[it.platform].slice(0, 2)} · {it.title}
                        </div>
                      ))}
                      {items.length > 2 && (
                        <div className="text-[10px] text-[var(--text-muted)]">+{items.length - 2}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Próximas en calendario</h2>
          <Link href="/publicaciones" className="text-sm text-purple-300 hover:underline">
            Ver publicaciones
          </Link>
        </div>
        <div className="space-y-2">
          {upcoming.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-4 py-3"
            >
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {PLATFORM_LABELS[item.platform]} · {item.format} ·{" "}
                  {new Date(item.date).toLocaleString()}
                </div>
              </div>
              <span className="badge badge-info">{PLATFORM_LABELS[item.platform]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
