-- 主站 SQLite 增量。只建新表，不改用户、订单、课程。
CREATE TABLE IF NOT EXISTS "WwwBrowserDevice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tokenHash" TEXT NOT NULL,
  "explicitPick" BOOLEAN NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" DATETIME
);
CREATE UNIQUE INDEX IF NOT EXISTS "WwwBrowserDevice_tokenHash_key" ON "WwwBrowserDevice"("tokenHash");

CREATE TABLE IF NOT EXISTS "WwwDeviceAccount" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "deviceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "holdId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" DATETIME,
  CONSTRAINT "WwwDeviceAccount_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "WwwBrowserDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WwwDeviceAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "WwwDeviceAccount_holdId_key" ON "WwwDeviceAccount"("holdId");
CREATE UNIQUE INDEX IF NOT EXISTS "WwwDeviceAccount_deviceId_userId_key" ON "WwwDeviceAccount"("deviceId", "userId");

CREATE TABLE IF NOT EXISTS "WwwTabContext" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "deviceId" TEXT NOT NULL,
  "holdId" TEXT NOT NULL DEFAULT '',
  "activeRole" TEXT NOT NULL DEFAULT '',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" DATETIME,
  CONSTRAINT "WwwTabContext_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "WwwBrowserDevice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "WwwTabContext_deviceId_idx" ON "WwwTabContext"("deviceId");
