import { Hono } from "hono";
import healthRoutes from "./routes/health.js";
import tasksRoutes from "./routes/tasks.js";
import swaggerRoutes from "./routes/swagger.js";

const app = new Hono();

app.route("/", healthRoutes);
app.route("/", swaggerRoutes);
app.route("/api/tasks", tasksRoutes);

export default app;
export const handler = app.fetch;
