# PrepStats Onboarding Guide

Welcome to PrepStats! This guide will help new contributors and developers set up their local environment, get the project running, and understand where to start contributing.

---

## 1. Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** (preferred), or **npm/yarn**
- **PostgreSQL** (local or cloud)
- **Git** (latest)
- **AWS account** (or S3-compatible service, for media uploads)
- **Stripe account** (for payments, if developing award features)

---

## 2. Clone the Repository

```bash
git clone https://github.com/TeamAthletix/PrepStats-7.git
cd PrepStats-7
```

---

## 3. Install Dependencies

```bash
pnpm install
# or
npm install
```

---

## 4. Environment Variables

1. Copy the sample environment file:
    ```bash
    cp .env.save .env
    ```
2. Update `.env` with your local or cloud credentials:
    - Database (`DATABASE_URL`)
    - AWS/S3 (`S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`)
    - Stripe (`STRIPE_SECRET_KEY`)
    - App secrets (`JWT_SECRET`, etc.)

See `.env.save` for required keys.

---

## 5. Database Setup

1. **Start PostgreSQL** locally or connect to a remote DB.
2. **Run migrations:**
    ```bash
    pnpm prisma migrate dev
    ```
3. **(Optional) Seed the database:**
    ```bash
    pnpm prisma db seed
    ```

---

## 6. Starting the App

```bash
pnpm dev
# or
npm run dev
```
- Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 7. Code Structure

- `/pages` — Next.js routes and dashboards
- `/api` — API endpoints
- `/prisma` — Database schema
- `/components` — UI components
- `/lib` — Utility functions

---

## 8. Common Tasks

- **Create new user roles:** Update Prisma schema and role logic in `/lib/auth`.
- **Add API endpoints:** Scaffold new handlers in `/pages/api`.
- **UI changes:** Edit or add components in `/components`.

---

## 9. Troubleshooting

- **Install fails?** Delete `node_modules`, run `pnpm install` again.
- **DB errors?** Check `.env` for correct `DATABASE_URL`, restart PostgreSQL.
- **AWS/Stripe issues?** Confirm credentials and access in AWS/Stripe dashboard.

---

## 10. Contributing

- Fork the repo, make changes in a branch, open a PR.
- Follow the [ARCHITECTURE.md](ARCHITECTURE.md) for system structure.
- Keep code clean and well-documented.
- Ask questions in Issues or Discussions!

---

**Welcome aboard! PrepStats thrives because of contributors like you.**
