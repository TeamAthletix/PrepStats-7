/*
  Warnings:

  - You are about to drop the column `createdBy` on the `awards` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `awards` table. All the data in the column will be lost.
  - You are about to drop the column `winnerId` on the `awards` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `poster_templates` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `poster_templates` table. All the data in the column will be lost.
  - You are about to drop the column `adminApproved` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `adminReviewed` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `customText` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `flagReason` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `flagged` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `hasVerifiedStats` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `playerName` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `purchased` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `purchasedAt` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `statsData` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `teamColors` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `teamLogo` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `tokensCost` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedStatIds` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `affiliation` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `gradYear` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `outlet` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `placeholder` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `isApproved` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `requestedBy` on the `schools` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `spotlights` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `spotlights` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `spotlights` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `stats` table. All the data in the column will be lost.
  - You are about to drop the column `submissionCount` on the `stats` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `stats` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBy` on the `stats` table. All the data in the column will be lost.
  - You are about to drop the column `verifierRole` on the `stats` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `stripeId` on the `token_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `isTrusted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `users` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `awards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `awards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `awards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `awards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `awards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateData` to the `poster_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `poster_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `posters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasedById` to the `spotlights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenCost` to the `spotlights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `stats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `balance` to the `token_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `token_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "parent_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "athleteCode" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "parent_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "homeTeamId" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "gameDate" DATETIME NOT NULL,
    "season" TEXT NOT NULL,
    "week" INTEGER,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "boxScore" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "games_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "nominations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "awardId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "reason" TEXT,
    "tokenCost" INTEGER NOT NULL DEFAULT 0,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nominations_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "awards" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "nominations_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "awardId" TEXT NOT NULL,
    "nominationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 1,
    "tokenCost" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "votes_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "awards" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "votes_nominationId_fkey" FOREIGN KEY ("nominationId") REFERENCES "nominations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "votes_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "coach_verifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT,
    "schoolEmail" TEXT,
    "nfhsId" TEXT,
    "letterhead" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" DATETIME,
    "reviewerNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "coach_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "coach_verifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "oldData" TEXT,
    "newData" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_awards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "week" INTEGER,
    "season" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "votingEnds" DATETIME,
    "tokenCostPerVote" INTEGER NOT NULL DEFAULT 1,
    "maxVotesPerUser" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "awards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_awards" ("createdAt", "description", "id", "season", "sport", "week") SELECT "createdAt", "description", "id", "season", "sport", "week" FROM "awards";
DROP TABLE "awards";
ALTER TABLE "new_awards" RENAME TO "awards";
CREATE TABLE "new_poster_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateData" TEXT NOT NULL,
    "sport" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_poster_templates" ("active", "createdAt", "description", "id", "name") SELECT "active", "createdAt", "description", "id", "name" FROM "poster_templates";
DROP TABLE "poster_templates";
ALTER TABLE "new_poster_templates" RENAME TO "poster_templates";
CREATE TABLE "new_posters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "generatedUrl" TEXT,
    "customData" TEXT,
    "tokenCost" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "posters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "posters_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "posters_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "poster_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_posters" ("createdAt", "id", "status", "templateId", "updatedAt", "userId") SELECT "createdAt", "id", "status", "templateId", "updatedAt", "userId" FROM "posters";
DROP TABLE "posters";
ALTER TABLE "new_posters" RENAME TO "posters";
CREATE TABLE "new_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "graduationYear" INTEGER,
    "position" TEXT,
    "jerseyNumber" INTEGER,
    "height" TEXT,
    "weight" TEXT,
    "speed40" TEXT,
    "gpa" REAL,
    "satScore" INTEGER,
    "actScore" INTEGER,
    "schoolId" TEXT,
    "teamId" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "bannerImage" TEXT,
    "highlights" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "profiles_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_profiles" ("avatar", "bio", "createdAt", "firstName", "id", "lastName", "position", "public", "schoolId", "teamId", "updatedAt", "userId") SELECT "avatar", "bio", "createdAt", "firstName", "id", "lastName", "position", "public", "schoolId", "teamId", "updatedAt", "userId" FROM "profiles";
DROP TABLE "profiles";
ALTER TABLE "new_profiles" RENAME TO "profiles";
CREATE TABLE "new_schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "classification" TEXT,
    "district" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_schools" ("city", "classification", "createdAt", "id", "name", "state") SELECT "city", "classification", "createdAt", "id", "name", "state" FROM "schools";
DROP TABLE "schools";
ALTER TABLE "new_schools" RENAME TO "schools";
CREATE UNIQUE INDEX "schools_name_city_state_key" ON "schools"("name", "city", "state");
CREATE TABLE "new_spotlights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchasedById" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "tokenCost" INTEGER NOT NULL,
    "transactionId" TEXT,
    "stripePaymentId" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "moderatedAt" DATETIME,
    "moderatorNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "spotlights_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "spotlights_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_spotlights" ("active", "approved", "createdAt", "description", "endDate", "id", "profileId", "startDate", "title", "updatedAt") SELECT "active", "approved", "createdAt", "description", "endDate", "id", "profileId", "startDate", "title", "updatedAt" FROM "spotlights";
DROP TABLE "spotlights";
ALTER TABLE "new_spotlights" RENAME TO "spotlights";
CREATE TABLE "new_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdById" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "teamId" TEXT,
    "sport" TEXT NOT NULL,
    "gameDate" DATETIME NOT NULL,
    "opponent" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "week" INTEGER,
    "isHome" BOOLEAN NOT NULL DEFAULT true,
    "gameResult" TEXT,
    "metrics" TEXT NOT NULL,
    "mediaLink" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verifiedById" TEXT,
    "verificationNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stats_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stats_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stats_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stats_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_stats" ("createdAt", "gameDate", "gameResult", "id", "isHome", "mediaLink", "metrics", "opponent", "profileId", "season", "sport", "teamId", "updatedAt", "verified", "week") SELECT "createdAt", "gameDate", "gameResult", "id", "isHome", "mediaLink", "metrics", "opponent", "profileId", "season", "sport", "teamId", "updatedAt", "verified", "week" FROM "stats";
DROP TABLE "stats";
ALTER TABLE "new_stats" RENAME TO "stats";
CREATE TABLE "new_teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "division" TEXT,
    "schoolId" TEXT NOT NULL,
    "headCoachId" TEXT,
    "coachIds" TEXT,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teams_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_teams" ("createdAt", "id", "name", "season", "sport", "updatedAt", "verified") SELECT "createdAt", "id", "name", "season", "sport", "updatedAt", "verified" FROM "teams";
DROP TABLE "teams";
ALTER TABLE "new_teams" RENAME TO "teams";
CREATE UNIQUE INDEX "teams_schoolId_sport_season_division_key" ON "teams"("schoolId", "sport", "season", "division");
CREATE TABLE "new_token_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "description" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "token_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_token_transactions" ("amount", "createdAt", "description", "id", "type", "userId") SELECT "amount", "createdAt", "description", "id", "type", "userId" FROM "token_transactions";
DROP TABLE "token_transactions";
ALTER TABLE "new_token_transactions" RENAME TO "token_transactions";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verificationData" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Alabama',
    "location" TEXT,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionId" TEXT,
    "subscriptionEnds" DATETIME,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "password", "role", "updatedAt", "verified") SELECT "createdAt", "email", "id", "password", "role", "updatedAt", "verified" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "nominations_awardId_profileId_key" ON "nominations"("awardId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_awardId_userId_key" ON "votes"("awardId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");
