/*
  Warnings:

  - The primary key for the `Leaderboard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Leaderboard` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `name` to the `Leaderboard` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Leaderboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Leaderboard" ("id") SELECT "id" FROM "Leaderboard";
DROP TABLE "Leaderboard";
ALTER TABLE "new_Leaderboard" RENAME TO "Leaderboard";
CREATE UNIQUE INDEX "Leaderboard_name_key" ON "Leaderboard"("name");
CREATE TABLE "new_Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leaderboard_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Score_leaderboard_id_fkey" FOREIGN KEY ("leaderboard_id") REFERENCES "Leaderboard" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("date", "id", "leaderboard_id", "player", "value") SELECT "date", "id", "leaderboard_id", "player", "value" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
