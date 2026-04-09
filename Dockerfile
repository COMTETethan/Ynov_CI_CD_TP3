# ========== STAGE 1: Build ==========
FROM node:20.12-alpine3.19 AS builder
WORKDIR /app

# Install dependencies first to maximize Docker layer cache hits.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source after dependencies.
COPY src ./src

# ========== STAGE 2: Production ==========
FROM alpine:3.20 AS production
WORKDIR /app

RUN apk add --no-cache nodejs
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
