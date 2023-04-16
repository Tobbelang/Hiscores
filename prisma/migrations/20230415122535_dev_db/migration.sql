/*
  Warnings:

  - You are about to drop the column `player_id` on the `Score` table. All the data in the column will be lost.
  - Added the required column `player` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leaderboard_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Score_leaderboard_id_fkey" FOREIGN KEY ("leaderboard_id") REFERENCES "Leaderboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("date", "id", "leaderboard_id", "value") SELECT "date", "id", "leaderboard_id", "value" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
