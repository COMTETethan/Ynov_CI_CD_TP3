import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../data/tasks.js";
import { DatabaseNotConfiguredError } from "../db.js";

function parseTaskId(rawId) {
  const id = Number.parseInt(rawId, 10);
  return Number.isNaN(id) ? null : id;
}

function handleTaskDataError(c, error) {
  if (error instanceof DatabaseNotConfiguredError) {
    return c.json({ error: "Database is not configured" }, 503);
  }

  console.error("Task database operation failed", error);
  return c.json({ error: "Database unavailable" }, 503);
}

export async function getTasks(c) {
  try {
    return c.json(await listTasks());
  } catch (error) {
    return handleTaskDataError(c, error);
  }
}

export async function getTask(c) {
  const id = parseTaskId(c.req.param("id"));

  if (id === null) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  try {
    const task = await getTaskById(id);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(task);
  } catch (error) {
    return handleTaskDataError(c, error);
  }
}

export async function postTask(c) {
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body.title !== "string" || body.title.trim() === "") {
    return c.json({ error: "title is required" }, 400);
  }

  try {
    const task = await createTask({
      title: body.title.trim(),
      description:
        typeof body.description === "string" ? body.description.trim() : "",
      completed: body.completed,
    });

    return c.json(task, 201);
  } catch (error) {
    return handleTaskDataError(c, error);
  }
}

export async function putTask(c) {
  const id = parseTaskId(c.req.param("id"));

  if (id === null) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  const body = await c.req.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return c.json({ error: "Invalid payload" }, 400);
  }

  try {
    const updated = await updateTask(id, body);

    if (!updated) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return handleTaskDataError(c, error);
  }
}

export async function removeTask(c) {
  const id = parseTaskId(c.req.param("id"));

  if (id === null) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  try {
    const deleted = await deleteTask(id);

    if (!deleted) {
      return c.json({ error: "Task not found" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return handleTaskDataError(c, error);
  }
}
