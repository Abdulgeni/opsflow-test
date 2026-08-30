<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0A08,50:1C1815,100:C9A24B&height=260&section=header&text=OpsFlow&fontSize=68&fontColor=F5F1E8&animation=fadeIn&fontAlignY=38&desc=Institutional%20Operations%20Platform%20%C2%B7%20GoldenAge%20Technology%20PLC&descAlignY=58&descColor=E8D5A8&descSize=18" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Playfair+Display&weight=600&size=22&duration=3200&pause=1000&color=C9A24B&center=true&vCenter=true&width=820&lines=A+full-stack+institutional+operations+platform;From+a+formal+SRS+to+a+live%2C+tested+production+system;Real+auth.+Real+RBAC.+Real-time+by+WebSocket.;Designed+and+engineered+by+Golden+Age+Internship+Group" alt="Typing SVG" />

<br/>

<a href="https://opsflow-golden-age.vercel.app">
  <img src="https://img.shields.io/badge/◆_LIVE_DEMO-0B0A08?style=for-the-badge&labelColor=C9A24B&color=0B0A08" />
</a>
<a href="https://github.com/Abdulgeni/opsflow-test/issues">
  <img src="https://img.shields.io/badge/REPORT_AN_ISSUE-0B0A08?style=for-the-badge&labelColor=1C1815&color=0B0A08" />
</a>

<br/><br/>

<img src="https://github.com/Abdulgeni/opsflow-test/actions/workflows/ci.yml/badge.svg" />
<img src="https://img.shields.io/badge/Next.js-16-0B0A08?style=flat-square&logo=next.js&logoColor=C9A24B&labelColor=0B0A08" />
<img src="https://img.shields.io/badge/NestJS-11-0B0A08?style=flat-square&logo=nestjs&logoColor=C9A24B&labelColor=0B0A08" />
<img src="https://img.shields.io/badge/Prisma-6-0B0A08?style=flat-square&logo=prisma&logoColor=C9A24B&labelColor=0B0A08" />
<img src="https://img.shields.io/badge/PostgreSQL-16-0B0A08?style=flat-square&logo=postgresql&logoColor=C9A24B&labelColor=0B0A08" />
<img src="https://img.shields.io/badge/License-Proprietary-0B0A08?style=flat-square&labelColor=1C1815&color=0B0A08" />

</div>

<br/>

<div align="center">
<img src="https://raw.githubusercontent.com/Abdulgeni/Abdulgeni/main/assets/divider-gold.svg" width="60%" alt="" onerror="this.style.display='none'"/>
</div>

> *"Built with a design language of deep charcoal, muted gold, and warm ivory — intended to feel less like a generic SaaS dashboard, and more like a private institutional instrument."*

<br/>

## ◆ Overview

**OpsFlow** is an internal operations platform engineered for a real estate and asset management organization. It unifies property management, client relationships, document control, approval workflows, business intelligence, and executive oversight into a single, role-aware system.

Every module in this repository was built against a formal **Software Requirements Specification (SRS)**, then implemented end-to-end — real authentication, a real relational database, real role-based access control enforced server-side, and genuine real-time collaboration. Not a mockup. Not a prototype pretending to be a product.

<br/>

## ◆ Features

<table>
<tr>
<td width="50%" valign="top">

### 🏢 Property Management
Full lifecycle tracking across Available, Occupied, Under Maintenance, and Decommissioned states, with automatic maintenance-status synchronization and soft-delete archival that preserves complete history.

### 🤝 Client Management
A searchable directory spanning individuals and organizations, backed by a running contact log capturing every call, meeting, and touchpoint — by author and timestamp.

### 📄 Document Management
Centralized document metadata with full version history, category tagging, and entity linking — architected to extend into real cloud storage (Cloudflare R2) as a drop-in enhancement.

### 🔄 Workflow Automation
Multi-stage approval workflows with a live visual stage tracker, strict sequential advancement, a permanent immutable audit trail, and **real-time collaborative comments over WebSockets** — no polling, no manual refresh.

### 📊 Analytics & Reporting
Live KPIs aggregated across every module, with historical trend tracking captured by a scheduled daily snapshot job, exportable to CSV.

</td>
<td width="50%" valign="top">

### 🎯 Executive Decision Support
A calm, single-glance summary built for leadership — automatically flags workflows stalled beyond five business days and properties under maintenance beyond ten calendar days, with a running decision log.

### 👥 User & Access Management
Four-tier role-based access control — **Admin · Manager · Staff · Executive** — enforced at the API layer via server-side guards, never trusted to the frontend. Includes a secure, single-use activation flow in place of open self-registration.

### 🔔 Real-Time Notifications
A live notification center reflecting workflow activity across the platform, with unread-state tracking.

### 🌓 Light & Dark Mode
A refined dark theme preserving the charcoal-and-gold identity — never inverted into a generic dark palette.

### 📱 Fully Responsive
A collapsible mobile navigation drawer, horizontally scrollable data tables, and adaptive grid layouts — designed and tested down to phone width.

</td>
</tr>
</table>

<br/>

## ◆ Architecture

OpsFlow is a **Turborepo monorepo** with a strict separation between presentation and business logic:

```
opsflow/
├── apps/
│   ├── web/                Next.js 16 (App Router) — the entire user interface
│   └── api/                NestJS — REST API, WebSocket gateway, scheduled jobs
├── prisma/
│   └── schema.prisma       Single shared source of truth for the data model
└── .github/workflows/      Continuous integration pipeline
```

**Why this shape** — frontend and backend are deliberately independent, deployable services communicating over a versioned REST API and WebSocket connection, never sharing runtime state, never trusting each other's validation. A request is only as authorized as the JWT and role it carries; the interface merely reflects what the API permits.

<br/>

## ◆ Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| **Frontend** | Next.js 16 (App Router, Turbopack) · React · TypeScript · Tailwind CSS v4 |
| **Backend** | NestJS 11 · TypeScript |
| **Database** | PostgreSQL · Prisma ORM |
| **Auth** | JWT (Passport.js) · bcrypt password hashing · server-enforced RBAC |
| **Real-time** | Socket.IO — room-scoped WebSocket broadcasting |
| **Scheduling** | NestJS `@nestjs/schedule` — daily cron-driven analytics snapshots |
| **Testing** | Jest · Supertest |
| **CI/CD** | GitHub Actions — automated lint, typecheck, and test on every push |
| **Hosting** | Vercel (frontend) · Railway (backend & PostgreSQL) |

</div>

<br/>

## ◆ Security & Access Control

Access control is enforced **exclusively at the server**, never assumed from the client:

- Every protected route requires a valid, non-expired JWT, re-validated against the user's *current* database status on every request — deactivating a user takes effect immediately, without waiting for their session to expire
- Role checks run inside a dedicated `RolesGuard`, returning a structured `403 FORBIDDEN_ROLE` response naming the required role explicitly — never a silent failure
- Passwords are never stored or transmitted in plaintext; `bcrypt` hashing is applied before persistence
- New accounts are created in a `PENDING` state and cannot authenticate until activated via a single-use, expiring token — mirroring how real users are provisioned by an administrator, not open signup

<br/>

## ◆ Real-Time Architecture

Workflow comments are delivered over a persistent WebSocket connection, never polling:

```
1.  Client joins a private "room" scoped to the workflow being viewed
2.  A new comment is persisted to PostgreSQL
3.  The comment is broadcast ONLY to clients currently subscribed
    to that workflow's room
4.  Every open tab viewing that workflow — including the sender's
    own — updates instantly, with zero page refresh
```

<br/>

## ◆ Getting Started

### Prerequisites
`Node.js 22+`  ·  `Docker` (for local PostgreSQL, or any reachable PostgreSQL 16 instance)

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
docker run --name opsflow-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=opsflow \
  -p 5432:5432 -d postgres:16

npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate dev --schema=prisma/schema.prisma
```

### Seed Data

```bash
cd apps/api
npx ts-node src/prisma-seed.ts
```

Creates a starter administrator account: `admin@goldenage.com` / `password123`

### Run

```bash
# from the repo root
npm run dev
```

<div align="center">

| Service | URL |
|:---|:---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:4000` |

</div>

<br/>

## ◆ Testing

```bash
cd apps/api
npm test
```

Tests cover service-layer create/read/update flows and the business logic underpinning maintenance-status synchronization, run against a real database connection to validate genuine behavior rather than mocked assumptions.

<br/>

## ◆ Continuous Integration

Every push and pull request against `main` automatically:

```
1.  Provisions a fresh, isolated PostgreSQL instance
2.  Installs dependencies and generates the Prisma client
3.  Applies all database migrations
4.  Typechecks both applications
5.  Runs the full test suite
6.  Confirms the frontend builds for production
```

A merge is only possible once every step passes.

<br/>

## ◆ Roadmap

- [ ] Cloud file storage for document uploads — Cloudflare R2 (architecture already scaffolded)
- [ ] Expanded automated test coverage across all modules
- [ ] Workflow template library with reusable stage configurations
- [ ] Business-day–aware scheduling refinements

<br/>

<div align="center">

## ◆ Credits

**Designed and built by Internship Group**
GoldenAge Technology PLC

<sub>OpsFlow — Management Suite</sub>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:C9A24B,50:1C1815,100:0B0A08&height=140&section=footer" width="100%"/>

</div>
