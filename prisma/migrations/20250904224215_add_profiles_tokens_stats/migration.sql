/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokensAvailable` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokensSpent` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AthleteProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Award` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Poll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Poster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "AthleteProfile" DROP CONSTRAINT "AthleteProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Award" DROP CONSTRAINT "Award_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "Poster" DROP CONSTRAINT "Poster_userId_fkey";

-- DropForeignKey
ALTER TABLE "StatEntry" DROP CONSTRAINT "StatEntry_athleteId_fkey";

-- DropForeignKey
ALTER TABLE "StatEntry" DROP CONSTRAINT "StatEntry_verifierId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionLog" DROP CONSTRAINT "TransactionLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_pollId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "tokensAvailable",
DROP COLUMN "tokensSpent",
DROP COLUMN "updatedAt",
ADD COLUMN     "isTrusted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokens" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL;

-- DropTable
DROP TABLE "AthleteProfile";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Award";

-- DropTable
DROP TABLE "Media";

-- DropTable
DROP TABLE "Poll";

-- DropTable
DROP TABLE "Poster";

-- DropTable
DROP TABLE "School";

-- DropTable
DROP TABLE "StatEntry";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "TransactionLog";

-- DropTable
DROP TABLE "Vote";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SubscriptionTier";

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "gradYear" INTEGER,
    "team" TEXT,
    "outlet" TEXT,
    "affiliation" TEXT,
    "placeholder" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stat" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "sport" TEXT NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "opponent" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "mediaLink" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stat" ADD CONSTRAINT "Stat_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
