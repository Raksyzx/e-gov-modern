# Portal Warga Kelurahan SukaMaju

Dashboard informasi kelurahan modern untuk warga dan admin kelurahan. Dibangun dengan arsitektur terpisah (decoupled): **Frontend React (CRA)** + **Backend FastAPI (MongoDB)** + **Supabase Auth**.

> **Security Notice (Oct 2026):** Hardcoded credentials telah dihapus dari source code & git history. Environment variables wajib dikonfigurasi (lihat `.env.example`). Key lama di-redact di history: `sb_publishable_REDACTED_KEY_ROTATE_THIS`, `eyJhbG...REDACTED_ROTATE_KEY`.

---

## 🏗 Arsitektur

```
┌─────────────────┐     HTTPS/REST      ┌─────────────────┐
│  Frontend       │ ◄─────────────────► │  Backend        │
│  React 19 (CRA) │                     │  FastAPI + Mongo│
│  Port 3000      │                     │  Port 8000      │
└────────┬────────┘                     └────────┬────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│  Supabase Auth  │                     │  MongoDB        │
│  (JWT, session) │                     │  (data kelurahan)│
└─────────────────┘                     └─────────────────┘
```

**Tech Stack:**
| Layer | Stack |
|-------|-------|
| Frontend | React 19, React Router 7, Tailwind CSS, Shadcn UI, Framer Motion, JSPDF, next-themes |
| Auth | Supabase (email/password, JWT, real-time session) |
| Backend | FastAPI 0.110, Motor (async MongoDB), PyJWT, bcrypt, Pydantic 2 |
| Database | MongoDB (async via Motor) |
| Build | Create React App + Craco, Uvicorn |
| Deploy | Vercel (frontend), Railway/Render/Fly.io (backend) |

---

## ✨ Fitur Utama

### Publik (Warga)
- **Landing Page** — Hero, statistik real-time (KK, Penduduk, RT/RW, Wilayah), kontak darurat utama
- **Dashboard** — Jam real-time, stats cards, kontak darurat, kader, pengumuman berjalan (marquee), agenda terdekat, peta Google Maps embed
- **Darurat** — Kontak RT/RW, Ambulans, Pemadam, Polsek/Koramil, Puskesmas, Klinik — filter kategori, tombol Call/WhatsApp
- **Kader** — Posyandu, PKK, Linmas — jadwal, wilayah, foto
- **Pengumuman** — Daftar pengumuman dengan prioritas (urgent/normal)
- **Lokasi** — Embed Google Maps kantor kelurahan
- **Pendidikan / UMKM** — Halaman placeholder untuk ekstensi fitur
- **PWA Ready** — Manifest + Service Worker untuk offline
- **Dark/Light Mode** — Toggle di header, persist ke localStorage
- **Export** — Download CSV/PDF data kontak & pengumuman

### Admin (Kelurahan)
- **Login** — Supabase Auth (email/password), JWT 7 hari, token di `localStorage` (`kel_token`)
- **Admin Panel** — CRUD: Kontak, Pengumuman, Agenda (dialog form, validasi, real-time update)
- **Protected Routes** — Middleware `ProtectedRoute` + Supabase session listener

---

## 📁 Struktur Project

```
e-gov-v5/
├── backend/                 # FastAPI server
│   ├── server.py           # Main app: routes, auth, models, seed data
│   ├── requirements.txt    # Python deps
│   └── .env.example        # Backend env template
├── frontend/                # React app (CRA + Craco)
│   ├── public/             # Static assets, manifest, service-worker
│   ├── src/
│   │   ├── components/     # UI (layout, shadcn components)
│   │   ├── context/        # AuthContext (Supabase)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # supabaseClient.js, api.js (Supabase REST)
│   │   ├── pages/          # Landing, Dashboard, Emergency, Kader, Announcements, Location, Pendidikan, UMKM, AdminLogin, AdminPanel
│   │   ├── App.js          # Router + ProtectedRoute
│   │   └── index.js        # Entry + PWA registration
│   ├── package.json
│   ├── craco.config.js
│   ├── .env.example        # Frontend env template
│   └── .env.local          # (gitignored) Local Supabase keys
├── .env                    # Root template (placeholder)
├── .env.vercel.template    # Vercel env vars reference
├── .gitignore
├── vercel.json             # SPA rewrite rules
└── README.md               # This file
```

---

## ⚙️ Quick Start (Local)

### Prerequisites
- Node.js 18+ & npm/yarn
- Python 3.11+
- MongoDB (local atau Atlas)
- Supabase project (untuk Auth)

### 1. Clone & Setup
```bash
git clone https://github.com/raksyz-porto/e-gov-v5.git
cd e-gov-v5
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env isi MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CORS_ORIGINS
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### 3. Frontend
```bash
cd ../frontend
cp .env.example .env.local
# Edit .env.local isi REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY
npm install --legacy-peer-deps
npm start
# Buka http://localhost:3000
```

---

## 🔐 Environment Variables

### Frontend (`.env.local` — **CRA butuh prefix `REACT_APP_`**)
| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_SUPABASE_URL` | ✅ | `https://your-project.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | ✅ | Anon/public key dari Supabase Dashboard → API |

### Backend (`.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ | MongoDB connection string |
| `DB_NAME` | ✅ | Database name (default: `kelurahan`) |
| `JWT_SECRET` | ✅ | Min 32 chars, random string |
| `ADMIN_EMAIL` | ✅ | Admin email untuk seed |
| `ADMIN_PASSWORD` | ✅ | Admin password (bcrypt hashed) |
| `CORS_ORIGINS` | ✅ | `http://localhost:3000,https://your-vercel-app.vercel.app` |
| `EMERGENT_LLM_KEY` | ❌ | Object storage key (kalau pakai upload file) |

### Vercel Deploy
Set di **Vercel Dashboard → Settings → Environment Variables** (Production + Preview):
```
REACT_APP_SUPABASE_URL=https://hwajykehhncjnpowrbox.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<key-baru-dari-dashboard>
```
Lalu **Redeploy**.

---

## 🚀 Deployment

### Frontend → Vercel
1. Import repo di Vercel
2. Framework: **Create React App** (auto-detect)
3. Build Command: `npm run build`
4. Output Directory: `build`
5. Set env vars (lihat atas)
6. Deploy — SPA rewrite sudah di `vercel.json`

### Backend → Railway / Render / Fly.io
```bash
# Railway example
railway init
railway add mongo
railway variables set MONGO_URL=... JWT_SECRET=... ADMIN_EMAIL=... ADMIN_PASSWORD=... CORS_ORIGINS=https://your-frontend.vercel.app
railway up
```
Atau Docker:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🔧 Development

### Scripts
```bash
# Frontend
cd frontend
npm start           # Dev server (port 3000)
npm run build       # Production build
npm test            # Watch mode tests

# Backend
cd backend
uvicorn server:app --reload --port 8000
pytest              # Run tests
black . && isort .  # Format
```

### Code Style
- **Frontend:** ESLint + Prettier (CRA default)
- **Backend:** Black + isort + flake8 + mypy (see `pytest.ini`)

### Git Workflow
```bash
# Pre-commit hook aktif: scan secrets + syntax check
git add .
git commit -m "feat: deskripsi perubahan"
git push origin master
```

---

## 🛡 Security

- **No hardcoded secrets** — semua credentials via env vars
- **Pre-commit hook** — block commit kalau ada secret (`sb_publishable_`, `eyJhbG...`, passwords, DB URLs)
- **Git history cleaned** — key lama di-redact (`git filter-repo`)
- **Supabase RLS** — aktifkan di dashboard untuk production
- **JWT** — HS256, 7 hari expiry, bcrypt password hashing
- **CORS** — restrict ke domain frontend saja di production

---

## 📋 API Endpoints (Backend)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | ❌ | Login admin → JWT |
| GET | `/api/auth/me` | ✅ | Current admin info |
| GET | `/api/info` | ❌ | Info kelurahan (published) |
| GET | `/api/info/draft` | ✅ | Draft info |
| PUT | `/api/info` | ✅ | Save draft |
| POST | `/api/info/publish` | ✅ | Publish draft |
| GET | `/api/contacts` | ❌ | List kontak (filter `category`, `q`) |
| POST | `/api/contacts` | ✅ | Create kontak |
| PUT | `/api/contacts/:id` | ✅ | Update kontak |
| DELETE | `/api/contacts/:id` | ✅ | Delete kontak |
| GET | `/api/announcements` | ❌ | List pengumuman |
| POST | `/api/announcements` | ✅ | Create |
| DELETE | `/api/announcements/:id` | ✅ | Delete |
| GET | `/api/agenda` | ❌ | List agenda |
| POST | `/api/agenda` | ✅ | Create |
| DELETE | `/api/agenda/:id` | ✅ | Delete |
| GET | `/api/pengurus` | ❌ | List pengurus |
| POST | `/api/upload` | ✅ | Upload file (object storage) |

---

## 📝 License

Internal project — Kelurahan SukaMaju. Tidak untuk distribusi komersial.

---

## 📞 Support

- **Repo:** https://github.com/raksyz-porto/e-gov-v5
- **Issues:** Gunakan GitHub Issues untuk bug/feature request
- **Admin:** Login di `/admin/login` (kredensial di Supabase Auth)

---

**Last Updated:** Oktober 2026 — Security audit & cleanup completed