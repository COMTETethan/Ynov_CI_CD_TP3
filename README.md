# Application Full Stack Production-Ready - TP3

## Description

API REST Node.js (Hono) pour la gestion de taches.

Endpoints inclus:
- GET /health
- GET /api/tasks
- GET /api/tasks/:id
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id
- GET /openapi.json
- GET /docs

## Configuration locale

Le endpoint /health verifie PostgreSQL et Redis.
Sans variables d'environnement, il retournera:
- status: unhealthy
- database: not_configured
- cache: not_configured

Variables a definir:

```bash
PORT=3000
DATABASE_URL=postgres://taskuser:taskpassword@localhost:5432/taskdb
REDIS_URL=redis://localhost:6379
```

Vous pouvez copier:

```bash
cp .env.example .env
```

Puis exporter les variables (si vous ne chargez pas .env automatiquement):

```bash
export PORT=3000
export DATABASE_URL=postgres://taskuser:taskpassword@localhost:5432/taskdb
export REDIS_URL=redis://localhost:6379
```

## Lancement en local

```bash
npm install
npm run start
```

Swagger:
- http://localhost:3000/docs

## Lancement Docker Engine (sans compose)

Oui, vous pouvez lancer avec Docker Engine maintenant.

1) Build image:

```bash
docker build -t tp3-api:latest .
```

2) Creer un reseau:

```bash
docker network create tp3-net
```

3) Lancer PostgreSQL:

```bash
docker run -d --name tp3-db --network tp3-net \
	-e POSTGRES_USER=taskuser \
	-e POSTGRES_PASSWORD=taskpassword \
	-e POSTGRES_DB=taskdb \
	postgres:16-alpine
```

4) Lancer Redis:

```bash
docker run -d --name tp3-redis --network tp3-net redis:7-alpine
```

5) Lancer l'API:

```bash
docker run -d --name tp3-api --network tp3-net -p 3000:3000 \
	-e DATABASE_URL=postgres://taskuser:taskpassword@tp3-db:5432/taskdb \
	-e REDIS_URL=redis://tp3-redis:6379 \
	tp3-api:latest
```

6) Verifier:

```bash
curl http://localhost:3000/health
```

## Dockerfile optimise (Partie 2)

- Multi-stage build
- Base Alpine
- Utilisateur non-root
- Layer caching sur package.json/package-lock.json
- Healthcheck
- Image finale validee sous 100 MB

Image mesuree:
- tp3-api:sub100 -> 94.7MB

## Qualite

```bash
npm run lint
npm test -- --run
```
