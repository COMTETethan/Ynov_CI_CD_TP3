import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import { getOpenApiSpec } from "../controllers/swaggerController.js";

const swaggerRoutes = new Hono();

swaggerRoutes.get("/docs", swaggerUI({ url: "/openapi.json" }));
swaggerRoutes.get("/openapi.json", getOpenApiSpec);

export default swaggerRoutes;
