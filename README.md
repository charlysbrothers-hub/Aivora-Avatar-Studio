# Aivora Studio

Centro de operaciones y **guardián de identidad** de Aivora (creadora virtual cubana con IA).

Para un mapa completo del sistema (ideal para análisis con ChatGPT), lee **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Stack vivo

- **GitHub:** Aivora Avatar Studio  
- **Supabase:** [Aivora Studio Project](https://tsmprljeyszfjnmfzszx.supabase.co)  
- **Netlify:** sitio `aivora-studio`  

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
