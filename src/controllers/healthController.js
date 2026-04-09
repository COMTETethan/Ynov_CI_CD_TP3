/* eslint-disable no-undef */
import { checkDatabaseHealth, isDatabaseConfigured } from "../db.js";
import { checkRedisHealth, isRedisConfigured } from "../cache.js";

export async function getHealth(c) {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
  };

  if (process.env.APP_VERSION) {
    health.version = process.env.APP_VERSION;
  }

  if (!isDatabaseConfigured()) {
    health.database = "not_configured";
    health.status = "unhealthy";
  } else {
    const isDatabaseConnected = await checkDatabaseHealth();
    health.database = isDatabaseConnected ? "connected" : "disconnected";

    if (!isDatabaseConnected) {
      health.status = "unhealthy";
    }
  }

  if (!isRedisConfigured()) {
    health.cache = "not_configured";
    health.status = "unhealthy";
  } else {
    const isCacheConnected = await checkRedisHealth();
    health.cache = isCacheConnected ? "connected" : "disconnected";

    if (!isCacheConnected) {
      health.status = "unhealthy";
    }
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  return c.json(health, statusCode);
}
