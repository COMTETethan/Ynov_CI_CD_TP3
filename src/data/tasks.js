import { query } from "../db.js";

function toIsoString(value) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapTaskRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function listTasks() {
  const result = await query(
    `SELECT id, title, description, completed, created_at, updated_at
     FROM tasks
     ORDER BY id ASC`,
  );

  return result.rows.map(mapTaskRow);
}

export async function getTaskById(id) {
  const result = await query(
    `SELECT id, title, description, completed, created_at, updated_at
     FROM tasks
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] ? mapTaskRow(result.rows[0]) : null;
}

export async function createTask(payload) {
  const result = await query(
    `INSERT INTO tasks (title, description, completed)
     VALUES ($1, $2, $3)
     RETURNING id, title, description, completed, created_at, updated_at`,
    [payload.title, payload.description || "", payload.completed === true],
  );

  return mapTaskRow(result.rows[0]);
}

export async function updateTask(id, payload) {
  const existingTask = await getTaskById(id);

  if (!existingTask) {
    return null;
  }

  const result = await query(
    `UPDATE tasks
     SET title = $2,
         description = $3,
         completed = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, description, completed, created_at, updated_at`,
    [
      id,
      typeof payload.title === "string" ? payload.title : existingTask.title,
      typeof payload.description === "string"
        ? payload.description
        : existingTask.description,
      typeof payload.completed === "boolean"
        ? payload.completed
        : existingTask.completed,
    ],
  );

  return mapTaskRow(result.rows[0]);
}

export async function deleteTask(id) {
  const result = await query("DELETE FROM tasks WHERE id = $1", [id]);
  return result.rowCount > 0;
}

export async function resetTasksStore() {
  await query("TRUNCATE TABLE tasks RESTART IDENTITY");
}
