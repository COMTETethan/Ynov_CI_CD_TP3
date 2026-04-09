/* eslint-disable no-undef */
import { Pool } from "pg";

let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
}

export async function checkDatabaseHealth() {
  const dbPool = getPool();

  if (!dbPool) {
    return false;
  }

  try {
    await dbPool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
