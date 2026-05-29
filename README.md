# Site-Portifolio

Personal portfolio of **Felipe Mazzeo Barbosa** ([ManoTilts](https://github.com/ManoTilts)) — a full-stack web app with a playful twist: the whole site can transform into completely different **themed experiences**.

## ✨ Themes

The site ships four themes, three of which replace the entire layout with a bespoke, interactive experience:

| Theme | Experience |
|-------|-----------|
| **Default** | Classic animated single-page portfolio (hero, about, projects, contact). |
| **Angler** 🎣 | *Gone Fishing* — a fisherman in a boat casts his line at labeled clouds to **reel in** each portfolio section. |
| **Magic** 🔮 | *The Scrying Chamber* — a wizard gazes into a glowing orb; touch a rune to **scry** a section into a vision panel. |
| **CMD** 💻 | An interactive terminal — type `help` and explore the portfolio via commands. |

Everything is **bilingual (English / Português)** and the theme/language choice persists across visits.

## 🧰 Tech stack

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, lucide-react, Axios.
**Backend** — FastAPI, MongoDB (Motor + Beanie), Pydantic v2, JWT auth (python-jose + passlib), SendGrid/SMTP email, Pillow, slowapi rate limiting.

## 📁 Structure

```
.
├── frontend/        # React + Vite SPA
│   └── src/
│       ├── components/   # sections, themed experiences, ui/
│       ├── contexts/     # Theme + Language providers
│       └── lib/          # api client, shared data, utils
└── backend/         # FastAPI service
    └── app/
        ├── routes/       # projects, contact, cv, upload, admin, auth, health
        ├── models/ schemas/ services/ middleware/ utils/
        └── config/       # settings + database
```

## 🚀 Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Optional: set `VITE_API_URL` (defaults to `http://localhost:8000/api`).
Build for production with `npm run build`.

### Backend

Requires **Python 3.10+** and a running **MongoDB** instance.

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then fill in the required values
python main.py                # http://localhost:8000  (docs at /docs)
```

The required environment variables (no defaults, for safety) are documented in
[`backend/.env.example`](backend/.env.example): `MONGODB_URL`, `JWT_SECRET_KEY`,
`ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FROM_EMAIL`, `ADMIN_EMAIL_RECIPIENT`.

## 🔐 Notes

- Admin endpoints (project CRUD, file/CV uploads) require a JWT — obtain one via
  `POST /api/admin/login`. Public visitors only ever hit read-only endpoints.
- Interactive API docs are available at `/docs` (Swagger) and `/redoc`.

## License

See [LICENSE](LICENSE).
