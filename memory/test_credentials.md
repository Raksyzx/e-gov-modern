# Test Credentials — Dashboard Informasi Kelurahan

## Admin Account
- Email: `admin@kelurahan.id`
- Password: `[REDACTED]` — Set via `ADMIN_PASSWORD` env var
- Role: admin

## Auth Endpoints
- POST `/api/auth/login` — { email, password } → { access_token, user }
- GET `/api/auth/me` — Bearer token → user info

## Notes
- Auth uses JWT bearer tokens (7-day expiry) stored in localStorage on the frontend.
- Admin is seeded on backend startup from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
- **Never commit real credentials.** Use `.env.local` for local development.