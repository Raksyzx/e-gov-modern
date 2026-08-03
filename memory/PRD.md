# PRD — Dashboard Informasi Kelurahan

## Original Problem Statement
Build a modern, responsive, user-friendly Web Dashboard Informasi Kelurahan (Indonesian sub-district information portal) with real-time GovTech / Emergency Response features: dashboard header with logo + clock, quick stats (KK/Penduduk/RT-RW/Wilayah), emergency contacts (RT/RW, ambulance with availability, fire, police/koramil, health) with one-tap Call/WhatsApp buttons, kader info (Posyandu, PKK, Linmas), announcements & agenda, Google Maps embed, search & filter, dark/light mode, PDF/CSV export, admin auth for editing, PWA offline support.

## Architecture
- **Backend**: FastAPI + Motor (async MongoDB) + JWT (PyJWT + bcrypt).
- **Frontend**: React 19 + React Router 7 + Tailwind + Shadcn UI + next-themes + react-fast-marquee + jspdf + framer-motion.
- **Data**: All models UUID-based; seeded on startup only if empty.
- **Auth**: Admin-only JWT (7-day). Token stored in `localStorage` (`kel_token`), sent via `Authorization: Bearer`.

## User Personas
- **Warga (public)**: browse dashboard, view emergency contacts, kader, announcements, agenda, location — no auth needed.
- **Admin Kelurahan**: login to manage contacts, announcements, agenda.

## Core Requirements (static)
1. Real-time clock, statistik header.
2. Kontak darurat dengan status ketersediaan + Call/WhatsApp.
3. Kader Posyandu/PKK/Linmas dengan jadwal.
4. Pengumuman berjalan (marquee) + agenda.
5. Peta lokasi kantor (Google Maps embed).
6. Search + filter kategori.
7. Dark/light mode toggle.
8. Download CSV/PDF.
9. Admin JWT login + CRUD panel.
10. PWA (manifest + service worker) untuk offline.

## Implemented (2026-02-06)
- ✅ Backend: /api/info, /api/contacts (GET/POST/PUT/DELETE + query filter), /api/announcements, /api/agenda, /api/auth/login, /api/auth/me
- ✅ Seed: 17 dummy contacts (emergency + kader), 4 announcements, 4 agenda, admin user
- ✅ Frontend: 6 routes (Dashboard, Darurat, Kader, Pengumuman, Lokasi, AdminLogin, AdminPanel)
- ✅ Layout: Desktop sidebar + mobile bottom nav + hamburger Sheet + real-time clock header + theme toggle
- ✅ CSV & PDF export (jspdf + autoTable)
- ✅ PWA manifest.json + service-worker.js registered in index.js
- ✅ Admin panel with dialog CRUD forms for contacts/announcements/agenda
- ✅ Testing subagent iteration_1 100% pass on backend + frontend

## Backlog (P1 / P2)
- P1: Rich profile photo upload untuk contacts (object storage integration)
- P1: Multi-role: RT admin only sees own RT contacts
- P1: SMS / WhatsApp Business API notifications for urgent announcements
- P2: Public form for warga to report incidents/complaints (routed to Linmas)
- P2: Analytics: most-called emergency contact, click-through stats
- P2: Multi-kelurahan support (super-admin)
- P2: Full audit log for admin actions
