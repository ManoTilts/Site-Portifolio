# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio of Felipe Mazzeo Barbosa ("ManoTilts"). Two independent apps with no root package manager — work inside `frontend/` or `backend/`:

- `frontend/` — React 19 + TypeScript + Vite 7 + Tailwind 3 SPA (Framer Motion, lucide-react, Axios).
- `backend/` — FastAPI + MongoDB (Motor + Beanie ODM), JWT auth, SendGrid/SMTP email, file/CV uploads.

## Commands

Frontend (`cd frontend`):
- `npm install` — install deps
- `npm run dev` — Vite dev server on http://localhost:5173 (does **not** typecheck)
- `npm run build` — `tsc -b && vite build`. Typechecking happens **only here**, so a green dev server can still have type errors — run this before committing.
- `npm run lint` — ESLint
- No frontend test runner is configured.

Backend (`cd backend`, requires Python 3.10+ and a running MongoDB):
- `python -m venv venv && source venv/bin/activate` (Windows: `venv\Scripts\activate`)
- `pip install -r requirements.txt`
- `cp .env.example .env` then fill in the required values (the app refuses to start otherwise)
- `python main.py` — Uvicorn on http://localhost:8000 (auto-reload when `ENVIRONMENT=development`); interactive docs at `/docs`
- `pytest` is a dependency but there are currently no tests.

## Frontend architecture

**Themes drive the entire layout, not just colors.** `contexts/ThemeContext` holds `currentTheme` ∈ `default | angler | magic | cmd`, persists it to localStorage, and applies a `theme-<name>` class to `<body>`. `App.tsx` then renders a *completely different experience* per theme:
- `cmd` → `TerminalPortfolio` (interactive terminal)
- `magic` → `MagicPortfolio` ("Scrying Chamber" — wizard + orb + runes)
- `angler` → `AnglerPortfolio` ("Gone Fishing" — boat + clouds + cast line)
- otherwise → the standard scrolling sections (Header/Hero/About/Projects/Contact/Footer)

The three alternate experiences are `React.lazy`-loaded so they stay out of the initial bundle. When adding a theme experience, follow this same pattern (lazy import + branch in `App.tsx`).

**Theme colors are RGB-triplet CSS variables.** `index.css` defines `--background`, `--primary`, etc. per `body.theme-*` block as space-separated RGB (e.g. `--primary: 99 102 241`). `tailwind.config.js` consumes them as `rgb(var(--x) / <alpha-value>)`. Gotcha: keep that format — writing the vars as hex or consuming them as `hsl()` silently breaks every theme color and opacity modifier (`bg-primary/20`).

**Framer Motion + Tailwind translate conflict.** Motion components write an inline `transform`, which overrides Tailwind translate utilities like `-translate-x-1/2`. For a centered element that also animates, do the centering inside the motion props (`x: '-50%'` in `initial`/`animate`), not via the class — otherwise it loses its centering.

**Shared scene infrastructure** (used by the themed experiences):
- `lib/portfolioData.ts` — `SECTIONS`, `SKILLS`, social links (single source of truth)
- `components/ui/SectionContent.tsx` — renders a section's content given a per-scene color `palette`
- `components/ui/SceneControls.tsx` — floating in-scene theme + language switcher so visitors aren't trapped

**i18n:** `contexts/LanguageContext` provides `t(key)` with `en`/`pt` translation maps; selection persists to localStorage. All user-facing content should go through `t()`.

**Projects come from GitHub, not the backend.** `lib/github.ts` fetches the user's public repos from the GitHub REST API (unauthenticated, so 60 req/hr → cached 6h in localStorage with stale fallback). A repo is shown if it's in the `CURATED` allowlist **or** carries a `portfolio`/`showcase` topic; `featured` (allowlist flag or topic) sorts it first. Thumbnails use GitHub's social-preview image. The Projects section and both themed scenes all read from here — the backend project endpoints are no longer used by the read path. To feature/curate a project, edit `CURATED` in `lib/github.ts` or tag the repo on GitHub. `VITE_API_URL` (default `http://localhost:8000/api`) is now only used for the contact form and CV endpoints.

## Backend architecture

Layered under `app/`: `routes/`, `models/` (Beanie documents), `schemas/` (Pydantic), `services/`, `middleware/`, `utils/`, `config/`. `main.py` wires routers under `/api` and runs a lifespan that calls `init_database()` (connect Motor → `init_beanie` → create default admin from env).

**Settings fail closed.** `config/settings.py` gives secret-bearing values (`MONGODB_URL`, `JWT_SECRET_KEY`, `ADMIN_*`, `FROM_EMAIL`, `ADMIN_EMAIL_RECIPIENT`) **no defaults** and validates them (JWT ≥ 32 chars, admin password strength, rejects `example.com`); the app raises on startup if any are missing/weak. See `.env.example`.

**Auth.** `utils/security.py` issues/verifies JWTs; `utils/dependencies.py:get_current_admin` is the `HTTPBearer` dependency. Login is `POST /api/admin/login`. Every write/admin endpoint (project create/update/delete, file uploads, CV upload/delete) must depend on `get_current_admin`; public read endpoints (projects list/detail, CV download/view/info, contact) stay open.

**Data access is mixed.** Several routes talk to the Motor collection directly (`from app.config.database import database; database.database.projects`) rather than through the Beanie ODM, even though Beanie is initialized. Match the surrounding style when editing a given route.

**Custom middleware:** `RateLimiterMiddleware` (in-memory sliding window, per-endpoint + global limits) and `ErrorHandlerMiddleware`. Uploads are validated by reading bytes (size enforced from content, not `UploadFile.size`) and stored under server-generated UUID filenames; deletions resolve real paths and verify containment within the upload dir.

## Conventions

- Commit subjects use Conventional Commits (`feat:`, `docs:`, `feat(projects):`).
- The frontend is fully static-hostable (projects via GitHub, no backend required for the read path); keep it that way unless a feature genuinely needs the API.
