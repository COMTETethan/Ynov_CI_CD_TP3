/* eslint-disable no-undef */
import { serve } from "@hono/node-server";
import app from "./app.js";
import {
  closeDatabasePool,
  initializeDatabase,
  isDatabaseConfigured,
} from "./db.js";

const port = Number.parseInt(process.env.PORT || "3000", 10);

async function startServer() {
  if (isDatabaseConfigured()) {
    await initializeDatabase();
  }

  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`Server running on http://localhost:${port}`);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void closeDatabasePool().finally(() => process.exit(0));
  });
}

startServer().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1);
});
