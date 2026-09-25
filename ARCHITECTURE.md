# Aivora Studio — Architecture (for humans & AI analysis)

> Public system map. Share this repo / README with ChatGPT or any analyst to understand the full product.

## What it is

**Aivora Studio** is the operations center and **identity guardian** for **Aivora**, a Cuban virtual AI creator (transparent as AI — never presented as a real human).

It is **not** a sales CRM (not SysVent). It orchestrates:

**Idea → Prompt Studio (Identity Lock) → External generation → Import → Review → Library → Calendar/Publish → Analytics → Ideas/Campaigns**

External tools generate media (Gemini, Higgsfield, ElevenLabs). Studio decides what belongs to Aivora.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js App Router + TypeScript + Tailwind |
| Auth + DB + Storage | Supabase project `tsmprljeyszfjnmfzszx` |
| Hosting | Netlify (`aivora-studio`) |
| Source | GitHub `Aivora Avatar Studio` |
| Sync model | Authenticated `workspace_snapshots` JSON + relational tables/RLS |

## Supabase

- **URL:** `https://tsmprljeyszfjnmfzszx.supabase.co`
- **Org:** Aivora Studio
- **Project:** Aivora Studio Project
- **Email confirmation:** disabled (`mailer_autoconfirm=true`) — users can sign up and enter immediately
- **RLS:** enabled; rows scoped by `auth.uid()`
- **Storage bucket:** `aivora-media` (per-user folder = user id)
- **Signup trigger:** creates `profiles`, `studio_settings`, canonical **Aivora identity v1**, and Owner team member

### Core tables

`profiles`, `studio_settings`, `identity_profiles`, `identity_versions`, `reference_assets`, `products`, `ideas`, `campaigns`, `productions`, `production_scenes`, `prompts`, `generated_assets`, `reviews`, `library_assets`, `publications`, `calendar_items`, `publication_metrics`, `team_members`, `workspace_snapshots`

## Product modules (UI)

1. **Dashboard** — command center  
2. **Aivora** — canonical identity DNA  
3. **Ideas** — concept bank  
4. **Prompt Studio** — composes Identity Canon + Lock + scene + tool  
5. **Producciones** — status machine + **Identity Lock** + scenes + review checklist  
6. **Importar** — external assets → review (import ≠ approve)  
7. **Biblioteca** — APPROVED only  
8. **Calendario / Publicaciones** — schedule + mock publish states  
9. **Analíticas** — metrics loop  
10. **Campañas** — group productions/publications  
11. **Equipo / Configuración** — roles + guardian rules  

## Identity Lock (non-negotiable)

Before production, lock: face, body, hair, outfit, accessories, product, environment, voice, personality. All scenes inherit. No silent changes — versioned identity/outfits only.

## Auth flow

`/signup` → Supabase Auth (no email confirm) → trigger bootstraps workspace → `/`  
`/login` → session cookies via `@supabase/ssr` middleware  
Workspace JSON synced to `workspace_snapshots` every ~15s while logged in

## Environment

```
NEXT_PUBLIC_SUPABASE_URL=https://tsmprljeyszfjnmfzszx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Never commit `service_role`.

## Principle

> The AI can generate; Aivora Studio decides what belongs to Aivora.
