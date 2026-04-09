import { Hono } from "hono";
import {
  getTasks,
  getTask,
  postTask,
  putTask,
  removeTask,
} from "../controllers/tasksController.js";

const tasksRoutes = new Hono();

tasksRoutes.get("/", getTasks);
tasksRoutes.get("/:id", getTask);
tasksRoutes.post("/", postTask);
tasksRoutes.put("/:id", putTask);
tasksRoutes.delete("/:id", removeTask);

export default tasksRoutes;
