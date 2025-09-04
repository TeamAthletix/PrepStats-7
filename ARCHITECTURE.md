# PrepStats Architecture

## Overview

PrepStats is a role-based SaaS platform for managing athletic statistics, awards, media uploads, and leaderboards. It supports multiple user roles, including Athlete, Coach, Parent, Media, Organization, and Admin, each with tailored dashboards and permissions.

## Major Components

- **Frontend:** Next.js (React) for dynamic dashboards, onboarding, and role-based routing.
- **Backend API:** Node.js/TypeScript REST endpoints for authentication, stats, awards, profiles, leaderboards.
- **Database:** Prisma ORM with PostgreSQL for robust relational data modeling (User, Profile, Stat, Award, Leaderboard, Media).
- **Object Storage:** S3-compatible service for images, videos, and highlights.
- **Authentication:** JWT-based, with role mapping and secure routes.
- **Payments:** Stripe integration for award payments and premium features.
- **Admin Tools:** Audit logs, moderation interface, user management.
- **Analytics & Monitoring:** Google Analytics, Sentry, Mixpanel integrations.

## Data Flow

1. **User Onboarding:**  
   - Registers and selects a role.
   - Role stored in DB, permissions assigned.

2. **Stat Submission:**  
   - Athlete uploads stats.
   - Coach/Org verifies and approves.
   - Stats update leaderboards and can trigger awards.

3. **Media Upload:**  
   - Users upload images/videos to S3.
   - Media linked to profiles/stats.

4. **Awards & Payments:**  
   - Admin creates awards.
   - Stripe handles payments for premium awards.
   - Award status updated in DB.

5. **Leaderboards:**  
   - Aggregates stats by role/org/team.
   - Filtered, sortable, and displayed on dashboards.

## Directory Structure

-  — Next.js routes and dashboards
-  — API endpoints (REST)
-  — Database schema
-  — Reusable UI elements
-  — Seed and static data
-  — Utility functions
-  — Migration and setup scripts

## Extensibility

- Add new roles by updating DB schema and permissions.
- Integrate new storage providers via abstraction in .
- Expand award/payment logic via modular API endpoints.

## Security

- All endpoints validate JWT and role.
- Sensitive data is encrypted at rest.
- Payments handled via Stripe with webhook verification.

---

*For detailed onboarding and environment setup, see ONBOARDING.md.*
