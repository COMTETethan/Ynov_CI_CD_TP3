# Application Full Stack Production-Ready - TP3

[![CI](https://github.com/COMTETethan/Ynov_CI_CD_TP3/actions/workflows/ci.yml/badge.svg)](https://github.com/COMTETethan/Ynov_CI_CD_TP3/actions/workflows/ci.yml)

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
DATABASE_URL=postgres://taskuser:taskpassword@localhost:5432/taskdbs
REDIS_URL=redis://localhost:6379
```

Vous pouvez copier:

```bash
cp .env.example .env
```

Puis exporter les variables locales ( si vous ne chargez pas .env automatiquement ):

```bash
export PORT=3000
export DATABASE_URL=postgres://taskuser:taskpassword@localhost:5432/taskdbs
export REDIS_URL=redis://localhost:6379
```

Configuration pour Docker Compose (Partie 3):

```bash
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpassword
POSTGRES_DB=taskdbs
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
	-e POSTGRES_DB=taskdbs \
	postgres:16-alpine
```

4) Lancer Redis:

```bash
docker run -d --name tp3-redis --network tp3-net redis:7-alpine
```

5) Lancer l'API:

```bash
docker run -d --name tp3-api --network tp3-net -p 3000:3000 \
	-e DATABASE_URL=postgres://taskuser:taskpassword@tp3-db:5432/taskdbs \
	-e REDIS_URL=redis://tp3-redis:6379 \
	tp3-api:latest
```

6) Verifier:

```bash
curl http://localhost:3000/health
```

## Dockerfile optimise (Partie 2)

- Multi-stage build
- Target `runtime` pour le lancement Compose standard
- Target `production` pour l'image Alpine plus legere
- Utilisateur non-root
- Layer caching sur package.json/package-lock.json
- Healthcheck
- Image finale validee sous 100 MB

Image mesuree:
- tp3-api:sub100 -> 94.7MB

## Orchestration Docker Compose (Partie 3)

- docker-compose.yml (api + db + redis + nginx)
- healthcheck PostgreSQL avec pg_isready
- depends_on avec condition service_healthy
- volume persistant pgdata
- variables via .env
- reverse proxy Nginx
- restart: unless-stopped

Lancer en une commande:

```bash
cp .env.example .env
docker compose up -d --build
```

Le `docker-compose.yml` build le target `runtime`.

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

Si vous avez change `POSTGRES_DB` apres un premier lancement, recreez le volume PostgreSQL:

```bash
docker compose down -v
docker compose up -d --build
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

Verifier non root:

```bash
docker build --target production -t tp3-api:secure .
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
- Dockerfile propose deux targets d'execution:
  - `runtime`: utilise `node:20-alpine`, pratique pour `docker compose up --build`
  - `production`: part de `alpine:3.20`, installe Node.js, et sert pour l'image `tp3-api:secure`
- .env est ignore via .gitignore.
- Si Trivy remonte des CVE critiques, mettez a jour les tags image et rebuild.

## Pipeline CI/CD complet (Partie 5)

Comportement:
- Trigger sur push main et pull_request main
- Job test:
	- npm ci
	- npm run lint
	- npm run test:coverage
	- upload de l'artifact coverage/
- Job build-and-push:
	- depends_on test (needs)
	- execute uniquement sur push main
	- login GHCR avec GITHUB_TOKEN
	- build + push image Docker vers ghcr.io
	- cache Buildx (cache-from/cache-to type=gha)
	- scan Trivy CRITICAL,HIGH
	- echec du pipeline si vulnerabilite detectee (exit-code 1)

Image publiee:
- ghcr.io/<owner>/<repo>:latest
- ghcr.io/<owner>/<repo>:sha-<commit>

Prerequis GitHub:
- Settings -> Actions -> General -> Workflow permissions -> Read and write permissions

## Simulation Blue/Green Deploy (Partie 6)

Architecture Blue/Green:
- api-blue: environnement actif (traffic client)
- api-green: environnement standby (nouvelle version)
- nginx: route vers blue par defaut
- endpoint de test standby: /test-standby/

Versions exposees dans /health:
- api-blue -> APP_VERSION=1.0.0-blue
- api-green -> APP_VERSION=2.0.0-green

Lancer la simulation:

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

Le `docker-compose.prod.yml` build le target `production`.

Verifier environnement actif (Blue):

```bash
curl http://localhost/health
```

Verifier standby (Green) avant bascule:

```bash
curl http://localhost/test-standby/health
```

Bascule Blue -> Green:

1. Editer nginx/blue-green.conf
2. Dans upstream active_backend, remplacer api-blue par api-green
3. Recharger Nginx sans interruption:

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Verifier apres bascule:

```bash
curl http://localhost/health
```

Rollback Green -> Blue:

1. Remettre api-blue dans active_backend
2. Recharger Nginx:

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Arret de la stack Blue/Green:

```bash
docker compose -f docker-compose.prod.yml down
```

Si le nom de base PostgreSQL a change depuis un ancien lancement:

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```

## Qualite

```bash
npm run lint
npm test -- --run
```
