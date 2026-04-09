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

Variables a definir pour un run local direct (sans Docker Compose):

```bash
PORT=3000
DATABASE_URL=postgres://taskuser:taskpassword@localhost:5432/taskdb
REDIS_URL=redis://localhost:6379
```

Vous pouvez copier:

```bash
cp .env.example .env
```

Puis exporter les variables locales (si vous ne chargez pas .env automatiquement):

```bash
export PORT=3000
export DATABASE_URL=postgres://taskuser:taskpassword@localhost:5432/taskdb
export REDIS_URL=redis://localhost:6379
```

Configuration pour Docker Compose (Partie 3):

```bash
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpassword
POSTGRES_DB=taskdb
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

## Orchestration Docker Compose (Partie 3)

Partie 3 livree avec:
- docker-compose.yml (api + db + redis + nginx)
- healthcheck PostgreSQL avec pg_isready
- depends_on avec condition service_healthy
- volume persistant pgdata
- variables via .env
- reverse proxy Nginx
- restart: unless-stopped

Fichiers:
- docker-compose.yml
- nginx/default.conf
- .env.example

Lancer en une commande:

```bash
cp .env.example .env
docker compose up -d --build
```

Tester:

```bash
curl http://localhost/health
```

Swagger via Nginx:

```bash
http://localhost/docs
```

Arreter les services:

```bash
docker compose down
```

Si vous avez l'erreur "docker: unknown command: docker compose":
- installez le plugin Compose v2 (package docker-compose-plugin)
- ou utilisez un Docker Desktop qui inclut Compose

## Securisation image (Partie 4)

Checklist couverte:
- Image ne tourne pas en root (USER appuser)
- Pas de secrets hardcodes dans Dockerfile
- Versions epinglees (pas de :latest)
- Scan Trivy local (bloquant sur CRITICAL)
- .env ignore par git

Verifier non-root:

```bash
docker build -t tp3-api:secure .
docker run --rm tp3-api:secure whoami
```

Attendu:

```bash
appuser
```

Scanner les vulnerabilites (CRITICAL + HIGH):

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
	aquasec/trivy:0.65.0 image --severity CRITICAL,HIGH tp3-api:secure
```

Mode bloquant sur CRITICAL:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
	aquasec/trivy:0.65.0 image --severity CRITICAL --exit-code 1 tp3-api:secure
```

Notes:
- Dockerfile utilise un build multi-stage, base alpine, user non-root.
- .env est ignore via .gitignore.
- Si Trivy remonte des CVE critiques, mettez a jour les tags image et rebuild.

## Qualite

```bash
npm run lint
npm test -- --run
```
