import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/app.js";
import { resetTasksStore } from "../src/data/tasks.js";

beforeEach(() => {
  resetTasksStore();
});

describe("TP3 Task API", () => {
  it("GET /api/tasks returns an array", async () => {
    const response = await app.request("/api/tasks");

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(Array.isArray(payload)).toBe(true);
  });

  it("POST /api/tasks creates a task", async () => {
    const response = await app.request("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Prepare docker setup" }),
    });

    expect(response.status).toBe(201);

    const payload = await response.json();
    expect(payload.title).toBe("Prepare docker setup");
    expect(payload.completed).toBe(false);
  });

  it("GET /api/tasks/:id returns created task", async () => {
    const created = await app.request("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Write health check" }),
    });

    const createdTask = await created.json();

    const response = await app.request(`/api/tasks/${createdTask.id}`);

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.id).toBe(createdTask.id);
    expect(payload.title).toBe("Write health check");
  });

  it("PUT /api/tasks/:id updates task", async () => {
    const created = await app.request("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Initial title" }),
    });

    const createdTask = await created.json();

    const response = await app.request(`/api/tasks/${createdTask.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated title", completed: true }),
    });

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.title).toBe("Updated title");
    expect(payload.completed).toBe(true);
  });

  it("DELETE /api/tasks/:id removes task", async () => {
    const created = await app.request("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Task to remove" }),
    });

    const createdTask = await created.json();

    const removeResponse = await app.request(`/api/tasks/${createdTask.id}`, {
      method: "DELETE",
    });

    expect(removeResponse.status).toBe(204);

    const findResponse = await app.request(`/api/tasks/${createdTask.id}`);
    expect(findResponse.status).toBe(404);
  });

  it("GET /openapi.json returns openapi spec", async () => {
    const response = await app.request("/openapi.json");

    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.openapi).toBe("3.0.0");
    expect(payload.paths).toHaveProperty("/api/tasks");
  });

  it("GET /health exposes status payload", async () => {
    const response = await app.request("/health");

    expect([200, 503]).toContain(response.status);

    const payload = await response.json();
    expect(payload).toHaveProperty("status");
    expect(payload).toHaveProperty("database");
    expect(payload).toHaveProperty("cache");
  });
});
