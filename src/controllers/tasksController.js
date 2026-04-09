import {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../data/tasks.js";

function parseTaskId(rawId) {
  const id = Number.parseInt(rawId, 10);
  return Number.isNaN(id) ? null : id;
}

export function getTasks(c) {
  return c.json(listTasks());
}

export function getTask(c) {
  const id = parseTaskId(c.req.param("id"));

  if (id === null) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  const task = getTaskById(id);

  if (!task) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json(task);
}

export async function postTask(c) {
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body.title !== "string" || body.title.trim() === "") {
    return c.json({ error: "title is required" }, 400);
  }

  const task = createTask({
    title: body.title.trim(),
    description:
      typeof body.description === "string" ? body.description.trim() : "",
    completed: body.completed,
  });

  return c.json(task, 201);
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

  const updated = updateTask(id, body);

  if (!updated) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json(updated);
}

export function removeTask(c) {
  const id = parseTaskId(c.req.param("id"));

  if (id === null) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  const deleted = deleteTask(id);

  if (!deleted) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.body(null, 204);
}
