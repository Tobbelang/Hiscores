/*
  Warnings:

  - Added the required column `name` to the `Leaderboard` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Leaderboard" ("id") SELECT "id" FROM "Leaderboard";
DROP TABLE "Leaderboard";
ALTER TABLE "new_Leaderboard" RENAME TO "Leaderboard";
CREATE UNIQUE INDEX "Leaderboard_name_key" ON "Leaderboard"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
