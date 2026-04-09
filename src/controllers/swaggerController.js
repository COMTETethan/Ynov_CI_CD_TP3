export function getOpenApiSpec(c) {
  return c.json({
    openapi: "3.0.0",
    info: {
      title: "TP3 Task API",
      version: "1.0.0",
      description: "REST API for tasks with health checks",
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check for API, PostgreSQL and Redis",
          responses: {
            200: { description: "Services are healthy" },
            503: { description: "At least one dependency is unavailable" },
          },
        },
      },
      "/api/tasks": {
        get: {
          summary: "List all tasks",
          responses: {
            200: {
              description: "Array of tasks",
            },
          },
        },
        post: {
          summary: "Create a new task",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    completed: { type: "boolean" },
                  },
                  required: ["title"],
                },
              },
            },
          },
          responses: {
            201: { description: "Task created" },
            400: { description: "Invalid payload" },
          },
        },
      },
      "/api/tasks/{id}": {
        get: {
          summary: "Get task by id",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            200: { description: "Task" },
            404: { description: "Task not found" },
          },
        },
        put: {
          summary: "Update task by id",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    completed: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Task updated" },
            404: { description: "Task not found" },
          },
        },
        delete: {
          summary: "Delete task by id",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            204: { description: "Task deleted" },
            404: { description: "Task not found" },
          },
        },
      },
    },
  });
}
