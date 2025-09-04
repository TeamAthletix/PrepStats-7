-- Example legacy migration for Phase 2 Core MVP
-- Add tables or alterations if needed (align with Prisma schema)

CREATE TABLE IF NOT EXISTS "StatEntry" (
  "id" SERIAL PRIMARY KEY,
  "athleteId" INTEGER NOT NULL,
  "statType" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "verified" BOOLEAN DEFAULT FALSE,
  "verifierId" INTEGER
);

-- Add more tables or indexes as per MVP (e.g., for leaderboards)
CREATE INDEX IF NOT EXISTS "stat_entry_athlete_idx" ON "StatEntry" ("athleteId");

-- Insert seed data if needed
-- INSERT INTO "StatEntry" (athleteId, statType, value, date) VALUES (1, 'points', 20.0, '2025-09-01');
