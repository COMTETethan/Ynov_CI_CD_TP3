/* eslint-disable no-undef */
import { Pool } from "pg";

const CREATE_TASKS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

let pool = null;
let initializationPromise = null;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("Database is not configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
}

async function createSchema() {
  await getPool().query(CREATE_TASKS_TABLE_SQL);
}

export async function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }

  if (!initializationPromise) {
    initializationPromise = createSchema().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export async function query(sql, params = []) {
  await initializeDatabase();
  return getPool().query(sql, params);
}

export async function checkDatabaseHealth() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabasePool() {
  initializationPromise = null;

  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = null;
  await activePool.end();
}
