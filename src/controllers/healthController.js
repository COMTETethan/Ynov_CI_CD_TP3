import { checkDatabaseHealth } from "../db.js";
import { checkRedisHealth } from "../cache.js";

export async function getHealth(c) {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
  };

  const isDatabaseConnected = await checkDatabaseHealth();
  health.database = isDatabaseConnected ? "connected" : "disconnected";

  if (!isDatabaseConnected) {
    health.status = "unhealthy";
  }

  const isCacheConnected = await checkRedisHealth();
  health.cache = isCacheConnected ? "connected" : "disconnected";

  if (!isCacheConnected) {
    health.status = "unhealthy";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  return c.json(health, statusCode);
}
