-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leaderboard_id" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "Score_leaderboard_id_fkey" FOREIGN KEY ("leaderboard_id") REFERENCES "Leaderboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
