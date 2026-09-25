# Aivora Studio

Centro de operaciones y **guardián de identidad** de Aivora (creadora virtual cubana con IA).

Para un mapa completo del sistema (ideal para análisis con ChatGPT u otro LLM), lee **[ARCHITECTURE.md](./ARCHITECTURE.md)** — describe producto, stack, tablas, auth, Identity Lock y flujo end-to-end.

## URLs vivas

| Servicio | URL |
|---|---|
| **App (Netlify)** | https://aivora-avatar-studio.netlify.app |
| **Signup** | https://aivora-avatar-studio.netlify.app/signup |
| **GitHub** | https://github.com/charlysbrothers-hub/Aivora-Avatar-Studio |
| **Supabase** | https://tsmprljeyszfjnmfzszx.supabase.co |

- Org Supabase: **Aivora Studio** · Proyecto: **Aivora Studio Project**
- Confirmación de email: **desactivada** (signup → entra al instante)
- Deploy continuo: push a `main` en GitHub → build en Netlify

## Arranque local

```bash
cd aivora-studio
cp .env.example .env.local
npm install
npm run dev
```

Abre http://localhost:3000 → **Crear usuario** (sin confirmación de email).

## Flujo

Idea → Identity Lock → Prompt Studio → generación externa → Importar → Revisión → Biblioteca → Calendario/Publicaciones → Analíticas

## Principio

> La IA puede generar; Aivora Studio decide qué pertenece a Aivora.
