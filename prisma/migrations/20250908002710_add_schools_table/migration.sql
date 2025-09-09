-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "classification" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "requestedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gradYear" INTEGER,
    "position" TEXT,
    "teamId" TEXT,
    "school" TEXT,
    "schoolId" TEXT,
    "outlet" TEXT,
    "affiliation" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "placeholder" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profiles_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "profiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_profiles" ("affiliation", "avatar", "bio", "createdAt", "firstName", "gradYear", "id", "lastName", "outlet", "placeholder", "position", "public", "school", "teamId", "type", "updatedAt", "userId") SELECT "affiliation", "avatar", "bio", "createdAt", "firstName", "gradYear", "id", "lastName", "outlet", "placeholder", "position", "public", "school", "teamId", "type", "updatedAt", "userId" FROM "profiles";
DROP TABLE "profiles";
ALTER TABLE "new_profiles" RENAME TO "profiles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_city_state_key" ON "schools"("name", "city", "state");
