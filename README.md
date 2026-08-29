<div align="center">

# ∞ OpsFlow

### Institutional Operations Platform for GoldenAge Technology PLC

*A full-stack, real-time property, client, and workflow management system — built from a software requirements specification through to a live, tested, and continuously integrated production deployment.*

[![CI](https://github.com/Abdulgeni/opsflow-test/actions/workflows/ci.yml/badge.svg)](https://github.com/Abdulgeni/opsflow-test/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)

**[Live Demo](https://opsflow-golden-age.vercel.app)** · **[Report an Issue](https://github.com/Abdulgeni/opsflow-test/issues)**

</div>

---

## ✦ Overview

OpsFlow is an internal operations platform designed for a real estate and asset management organization. It unifies property management, client relationships, document control, approval workflows, business intelligence, and executive oversight into a single, role-aware system — with a design language of deep charcoal, muted gold, and warm ivory intended to feel less like a generic SaaS dashboard and more like a private institutional tool.

Every module in this repository was built against a formal Software Requirements Specification (SRS), then implemented end-to-end: real authentication, a real relational database, real role-based access control enforced server-side, and real-time collaboration — not a mockup.

---

## ✦ Features

### 🏢 Property Management
Full property lifecycle tracking — status (Available, Occupied, Under Maintenance, Decommissioned), maintenance requests with automatic status synchronization, and soft-delete archival that preserves history.

### 🤝 Client Management
A searchable client directory spanning individuals and organizations, with a running contact log capturing every call, meeting, and touchpoint by author and timestamp.

### 📄 Document Management
Centralized document metadata with full version history, category tagging, and entity linking — designed to extend into real cloud file storage (Cloudflare R2) as a drop-in enhancement.

### 🔄 Workflow Automation
Custom, multi-stage approval workflows with a live visual stage tracker, strict sequential advancement (no stage-skipping), a permanent, immutable audit trail, and **real-time collaborative comments delivered via WebSockets** — no polling, no manual refresh.

### 📊 Analytics & Reporting
Live KPIs aggregated across every module, with historical trend tracking captured by a scheduled daily snapshot job and exportable to CSV.

### 🎯 Executive Decision Support
A calm, single-glance summary built for leadership — automatically flags workflows stalled beyond five business days and properties under maintenance beyond ten calendar days, with a running decision log.

### 👥 User & Access Management
Four-tier role-based access control (**Admin**, **Manager**, **Staff**, **Executive**) enforced at the API layer via server-side guards — never trusted to the frontend alone. Includes a secure, single-use account-activation flow in place of open self-registration.

### 🔔 Real-Time Notifications
A live notification center reflecting workflow activity, with unread-state tracking.

### 🌓 Light & Dark Mode
A refined dark theme that preserves the brand's charcoal-and-gold identity rather than inverting it into a generic dark palette.

### 📱 Fully Responsive
A collapsible mobile navigation drawer, horizontally scrollable data tables, and adaptive grid layouts — designed and tested down to phone width.

---

## ✦ Architecture

OpsFlow is a **Turborepo monorepo** with a strict separation between presentation and business logic:
opsflow/
├── apps/
│ ├── web/ Next.js 16 (App Router) — the entire user interface
│ └── api/ NestJS — REST API, WebSocket gateway, scheduled jobs
├── prisma/
│ └── schema.prisma Single shared source of truth for the data model
└── .github/workflows/ Continuous integration pipeline


### Why this shape

Frontend and backend are deliberately independent deployable services communicating over a versioned REST API and WebSocket connection — never sharing runtime state, never trusting each other's validation. A request is only as authorized as the JWT and role it carries; the UI merely reflects what the API permits.

---

## ✦ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React, TypeScript, Tailwind CSS v4 |
| **Backend** | NestJS 11, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | JWT (Passport.js), bcrypt password hashing, server-enforced RBAC |
| **Real-time** | Socket.IO (WebSocket gateway with room-scoped broadcasting) |
| **Scheduling** | NestJS `@nestjs/schedule` — daily cron-driven analytics snapshots |
| **Testing** | Jest, Supertest |
| **CI/CD** | GitHub Actions — automated lint, typecheck, and test on every push |
| **Hosting** | Vercel (frontend) · Railway (backend & PostgreSQL) |

---

## ✦ Security & Access Control

Access control is enforced **exclusively at the server**, never assumed from the client:

- Every protected route requires a valid, non-expired JWT, re-validated against the user's *current* database status on every request — so deactivating a user takes effect immediately, without waiting for their session to expire.
- Role checks run inside a dedicated `RolesGuard`, returning a structured `403 FORBIDDEN_ROLE` response with the required role named explicitly — never a silent failure.
- Passwords are never stored or transmitted in plaintext; `bcrypt` hashing is applied before persistence.
- New accounts are created in a `PENDING` state and cannot authenticate until activated via a single-use, expiring token — mirroring how the platform's real-world users are provisioned by an administrator, not via open signup.

---

## ✦ Real-Time Architecture

Workflow comments are delivered over a persistent WebSocket connection rather than polling:

1. A client joins a private "room" scoped to the specific workflow they're viewing.
2. A new comment is persisted to PostgreSQL, then broadcast **only** to clients currently subscribed to that workflow's room.
3. Every open browser tab viewing that workflow — including the sender's own — updates instantly, with no page refresh.

---

## ✦ Getting Started

### Prerequisites
- Node.js 22+
- Docker (for local PostgreSQL) — or any reachable PostgreSQL 16 instance

### Installation

```bash
git clone https://github.com/Abdulgeni/opsflow-test.git
cd opsflow-test
npm install
```

### Environment Setup

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

Fill in `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_API_URL` as appropriate for your environment.

### Database

```bash
docker run --name opsflow-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=opsflow -p 5432:5432 -d postgres:16

npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate dev --schema=prisma/schema.prisma
```

### Seed Data

```bash
cd apps/api
npx ts-node src/prisma-seed.ts
```

This creates a starter administrator account:
admin@goldenage.com / password123


### Run

```bash
# from the repo root
npm run dev
```

- Frontend → `http://localhost:3000`
- Backend → `http://localhost:4000`

---

## ✦ Testing

```bash
cd apps/api
npm test
```

Tests cover service-layer create/read/update flows and the business logic underpinning maintenance-status synchronization, run against a real database connection to validate genuine behavior rather than mocked assumptions.

---

## ✦ Continuous Integration

Every push and pull request against `main` automatically:

1. Provisions a fresh, isolated PostgreSQL instance
2. Installs dependencies and generates the Prisma client
3. Applies all database migrations
4. Typechecks both applications
5. Runs the full test suite
6. Confirms the frontend builds for production

A merge is only possible once every step passes.

---

## ✦ Roadmap

- [ ] Cloud file storage for document uploads (Cloudflare R2 — architecture already scaffolded)
- [ ] Expanded automated test coverage across all modules
- [ ] Workflow template library with reusable stage configurations
- [ ] Business-day–aware scheduling refinements

---

## ✦ Credits

Designed and built by **Abdulgeni Abdulaziz**, GoldenAge Technology PLC.

<div align="center">

*OpsFlow — Management Suite*

</div>
