<div align="center">

# Hotel Management System

Modern, neon-inspired hotel booking experience built with the Next.js App Router, shadcn/ui components, and a Prisma + NextAuth backend.

</div>

## 🧭 Overview

This project delivers a production-ready front end for hotel discovery, booking, and administration. It ships with:

- **Next.js 14 App Router** + TypeScript for routing, server components, and server actions.
- **TailwindCSS + shadcn/ui** for a cohesive, futuristic UI (lucide icons, framer-motion micro interactions).
- **NextAuth.js (Google + Credentials)** wired to a **Prisma/PostgreSQL** database for sessions, OAuth, and password logins.
- Modular API helpers (`src/lib/api.ts`) and server actions for talking to external microservices.

## ✨ Feature Highlights

- Hero home page with search, featured hotels, and animated cards
- Dynamic hotel details with amenities, gallery, and booking form
- Auth suite: login, register, and Google OAuth with polished UI states
- User dashboard for bookings plus admin dashboard metrics
- Shared primitive library (Button, Card, Input, Skeleton, etc.) via shadcn/ui
- Prisma schema aligned with NextAuth (User, Account, Session, VerificationToken)
- Central Prisma client singleton and adapter

## 🧰 Tech Stack

| Layer      | Tech |
|------------|------|
| Framework  | Next.js 14 / TypeScript |
| Styling    | TailwindCSS, shadcn/ui, framer-motion, lucide-react |
| Auth       | NextAuth.js (Google + Credentials) |
| Data       | Prisma ORM, PostgreSQL |
| Tooling    | ESLint, Prettier, pnpm/npm scripts |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string)

### 1. Install dependencies

```powershell
npm install
```

### 2. Configure environment

Copy `.env.example` (or use `.env`) and update the values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `NEXTAUTH_URL` | Base URL for the Next.js app (e.g., `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT/session encryption |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth credentials from Google Cloud |

### 3. Generate Prisma client & run migrations

```powershell
npx prisma generate
npx prisma migrate deploy
```

You can inspect the schema in `prisma/schema.prisma` and existing migrations under `prisma/migrations`.

### 4. Start the dev server

```powershell
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The dev server prints the actual URL if you change the port.

## 📁 Project Structure (partial)

```
prisma/
  schema.prisma            # NextAuth + domain models
  migrations/              # Versioned SQL migrations
src/
  app/
    (auth)/                # Login + register routes & server actions
    api/auth/[...nextauth] # NextAuth route handler
    admin/                 # Admin dashboard
    bookings/              # User bookings dashboard
    layout.tsx             # Root layout (Navbar + Footer)
    page.tsx               # Landing page
  components/
    ui/                    # shadcn primitives (Button, Card, Input, etc.)
    AuthForm.tsx           # Credential + Google auth UI
    BookingForm.tsx, HotelCard.tsx, etc.
  lib/
    prisma.ts              # Prisma client singleton
    api.ts                 # Axios instance + helpers
    auth.ts                # Client session utilities
    types.ts               # Shared domain types
```

## 🔐 Authentication Notes

- NextAuth handles Google and credentials login at `src/app/api/auth/[...nextauth]/route.ts`.
- Credentials provider expects hashed passwords stored on the `User` model.
- Google sign-ins populate `Account` + `Session` tables automatically via the Prisma adapter.
- Client-side flows can call `signIn("google")` or `signIn("credentials")`, while server routes can read sessions via `auth()`.

## 💾 Database & Prisma Tips

- Prisma config (`prisma.config.ts`) loads `.env`, so CLI commands pick up `DATABASE_URL` automatically.
- Regenerate the client after altering `schema.prisma`:

```powershell
npx prisma generate
```

- Use `npx prisma studio` for a quick dataset browser.

## 🧑‍💻 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Create an optimized production build |
| `npm start` | Run the production server after building |
| `npm run lint` | Lint the codebase with ESLint |

## 🧠 Roadmap Ideas

- Middleware-based route protection (bookings/admin)
- Profile dropdown with sign-out + avatar
- Rich admin analytics (charts, room management CRUD)
- Real payment integration and booking confirmations
- E2E coverage (Playwright/Cypress) for key flows

---

Questions or ideas? Open an issue or start a discussion — contributions are welcome!