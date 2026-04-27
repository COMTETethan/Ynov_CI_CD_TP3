# ========== Shared dependencies ==========
FROM node:20.12-alpine3.19 AS deps
WORKDIR /app

# Install production dependencies first to maximize Docker layer cache hits.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ========== Stage 1: Runtime ==========
# Friendly runtime for day-to-day `docker compose up --build`.
FROM node:20.12-alpine3.19 AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup package.json ./package.json

USER appuser

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]

# ========== Stage 2: Production ==========
# Slimmer final image for blue/green or production-style runs.
FROM alpine:3.20 AS production
WORKDIR /app

RUN apk add --no-cache nodejs && addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup package.json ./package.json

USER appuser

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
