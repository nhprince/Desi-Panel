# Desi Panel

A full-stack hosting management panel inspired by cPanel.

This monorepo contains:

- `backend/` — Node.js + Express + PostgreSQL (Sequelize ORM)
- `frontend/` — React + Vite + Tailwind + Zustand
- `docs/` — Documentation (see `docs/CONTEXT.md`)

## Quick Start (Development)

1. Create env files:
   - Copy `backend/.env.example` to `backend/.env` and set values.
   - Copy `frontend/.env.example` to `frontend/.env`.

2. Install dependencies:
   - Backend: `npm install --prefix backend`
   - Frontend: `npm install --prefix frontend`

3. Start services:
   - Backend: `npm run dev --prefix backend`
   - Frontend: `npm run dev --prefix frontend`

Backend runs on http://localhost:4000 and Frontend on http://localhost:5173

### Fast dev (SQLite fallback)

For quickest setup during development, the backend supports a SQLite fallback. Copy `backend/.env.example` to `.env` and leave `USE_SQLITE=1`. No Postgres or Docker required.

## Local Database with Docker (Recommended)

You can spin up PostgreSQL via Docker Compose:

```
docker compose up -d db
```

Then set `backend/.env`:

```
PORT=4000
DATABASE_URL=postgres://desi:desi@localhost:5432/desipanel
JWT_SECRET=dev-secret-change-me
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
FILES_ROOT=./storage
```

## Production Install on Linux

Use the `install.sh` script to provision environment variables and the initial admin credentials. This will generate `backend/.env` and prompt for values.

## API

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`

- Account
  - `GET  /api/account/details` (JWT)
  - `PUT  /api/account/profile` (JWT) — update email/password with current password verification

- Files (JWT)
  - `GET  /api/files/` — list root
  - `GET  /api/files/:path*` — list subpath
  - `POST /api/files/upload?dir=relative/path` — upload single file (field `file`)
  - `POST /api/files/mkdir?dir=relative/path` — create folder (body `{ name }`)
  - `DELETE /api/files/:path*` — delete file or directory

- Domains (JWT)
  - `GET    /api/domains/` — list
  - `POST   /api/domains/` — create `{ name, type: 'addon'|'subdomain'|'parked' }`
  - `DELETE /api/domains/:id` — delete

- FTP (JWT)
  - `GET    /api/ftp/` — list FTP accounts
  - `POST   /api/ftp/` — create `{ username, password, homeDir? }`
  - `PATCH  /api/ftp/:id/status` — update `{ status: 'active'|'disabled' }`
  - `POST   /api/ftp/:id/reset-password` — reset `{ password }`
  - `DELETE /api/ftp/:id` — delete FTP account

- SSL (JWT; self-signed in development)
  - `GET    /api/ssl/domains` — list domains with current cert status
  - `POST   /api/ssl/issue` — issue self-signed for `{ domainId }`
  - `POST   /api/ssl/:id/revoke` — revoke certificate
  - `DELETE /api/ssl/:id` — delete certificate record

- Databases (JWT; stubs in development)
  - `GET    /api/db/` — list databases (with users)
  - `POST   /api/db/` — create database `{ engine: 'mysql'|'mariadb', name }`
  - `DELETE /api/db/:id` — delete database
  - `POST   /api/db/:id/users` — create DB user `{ username, password, host? }`
  - `POST   /api/db/users/:userId/reset-password` — set new password `{ password }`
  - `DELETE /api/db/users/:userId` — delete DB user

- Email (JWT; stubs in development)
  - `GET    /api/email/accounts?domainId=<optional>` — list mailboxes
  - `POST   /api/email/accounts` — create mailbox `{ domainId, localPart, password, quotaMb? }`
  - `PATCH  /api/email/accounts/:id/status` — update `{ status: 'active'|'disabled' }`
  - `POST   /api/email/accounts/:id/reset-password` — set new password `{ password }`
  - `DELETE /api/email/accounts/:id` — delete mailbox
  - `GET    /api/email/forwarders?domainId=<optional>` — list forwarders
  - `POST   /api/email/forwarders` — create forwarder `{ sourceDomainId, sourceLocalPart, destinationEmail }`
  - `DELETE /api/email/forwarders/:id` — delete forwarder

See `docs/CONTEXT.md` for the broader roadmap.
