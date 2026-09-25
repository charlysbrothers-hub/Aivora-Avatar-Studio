"use client";

import { useState } from "react";
import { useStore, useStoreActions } from "@/lib/store";
import type { TeamRole } from "@/lib/types";

const ROLES: TeamRole[] = ["Owner", "Admin", "Creator", "Reviewer"];

export default function EquipoPage() {
  const store = useStore();
  const { addTeamMember, updateTeamMember } = useStoreActions();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Creator");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipo</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Roles locales (Owner / Admin / Creator / Reviewer). Sin auth real todavía.
        </p>
      </div>

      <div className="card grid gap-3 p-5 md:grid-cols-[1fr_1fr_160px_auto]">
        <input
          className="input"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="select"
          value={role}
          onChange={(e) => setRole(e.target.value as TeamRole)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (!name.trim() || !email.trim()) return;
            addTeamMember({ name: name.trim(), email: email.trim(), role });
            setName("");
            setEmail("");
          }}
        >
          Añadir
        </button>
      </div>

      <div className="space-y-3">
        {store.team.map((m) => (
          <div
            key={m.id}
            className="card flex flex-wrap items-center justify-between gap-3 p-5"
          >
            <div>
              <div className="font-semibold">{m.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{m.email}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="select max-w-[140px]"
                value={m.role}
                onChange={(e) =>
                  updateTeamMember(m.id, { role: e.target.value as TeamRole })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`btn ${m.active ? "btn-success" : "btn-ghost"}`}
                onClick={() => updateTeamMember(m.id, { active: !m.active })}
              >
                {m.active ? "Activo" : "Inactivo"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
