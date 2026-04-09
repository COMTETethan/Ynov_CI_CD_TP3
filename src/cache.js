/* eslint-disable no-undef */
import { createClient } from "redis";

let client;

export function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    });
  }

  return client;
}

export async function checkRedisHealth() {
  const redisClient = getRedisClient();

  if (!redisClient) {
    return false;
  }

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    await redisClient.ping();
    return true;
  } catch {
    return false;
  }
}
