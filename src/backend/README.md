# Tunele Backend

Express.js API server for Tunele.

## Authentication

The backend uses **OpenID Connect (OIDC)** for user authentication with Google. Key security features:

- **CSRF Protection:** `state` stored server-side (Redis), validated and consumed once on callback
- **PKCE:** Proof Key for Code Exchange (S256)
- **Nonce:** Prevents ID token replay attacks
- **Session-based Auth:** Server-side sessions with HttpOnly cookies
- **Two-tier Storage:** Redis cache + Firestore persistence; Google refresh token encrypted at rest

### Auth Flow

1. Frontend generates state/nonce/PKCE, calls `POST /api/auth/initiate`; backend stores state/nonce in Redis
2. Frontend redirects to Google; user signs in; Google redirects back to frontend callback
3. Frontend sends code + state + nonce + code_verifier to `POST /api/auth/callback`; backend validates, exchanges code, verifies ID token, creates session
4. Session cookie used for authenticated requests; logout deletes session and clears cookie

### Endpoints

- `POST /api/auth/initiate` - Register state/nonce before redirect to Google
- `POST /api/auth/callback` - OIDC authentication callback
- `GET /api/auth/verify` - Verify session
- `GET /api/auth/logout` - Logout

## Local Development

### Quick Start

```bash
# From repository root
yarn install
yarn dev # Starts Redis (Docker), backend with hot reload, and frontend
```

`yarn dev` uses `docker compose up -d --wait` to boot Redis and wait until it is healthy before starting the API with `tsx watch`. Changes to source files are picked up automatically without any rebuild.

To stop Redis when you're done:

```bash
yarn dev:stop
```

### Smoke-testing the production image locally

To test the fully containerised production build (API compiled + running in Docker, no hot reload):

```bash
# From the root directory — pass any docker compose subcommand as an argument
yarn backend:preview up --build   # build and start
yarn backend:preview up -d        # start detached
yarn backend:preview down         # stop and remove containers
# or directly from src/backend/
docker compose -f "./docker/docker-compose.local.yml" --env-file ".env" up --build
```

This mirrors the prod/preview environments and is useful for verifying the Docker image before deploying.

## Deployment

### Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                          │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────────────┐ │
│  │  Lint   │   │  Test   │─▶│  Build  │──▶│     Deploy      │ │
│  └────┬────┘   └────┬────┘   │ (Docker)│   │ (SSH to server) │ │
│       └─────────────┘        └─────────┘   └─────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────┐
│                         Server                                 │
│  ┌───────────────────┐    ┌───────────────────┐                │
│  │   tunele-api      │    │   tunele-redis    │                │
│  │   (Express.js)    │◀─▶│   (Redis 8)       │                │
│  │   Port: 7600      │    │   Port: internal  │                │
│  └───────────────────┘    └───────────────────┘                │
└────────────────────────────────────────────────────────────────┘
```

### Environments

| Environment    | Trigger           | Image Tag                  | Port | Compose File                 |
| -------------- | ----------------- | -------------------------- | ---- | ---------------------------- |
| **Production** | Push to `master`  | `latest`, `{sha}`          | 7600 | `docker-compose.prod.yml`    |
| **Preview**    | Manual dispatch   | `preview`, `preview-{sha}` | 7601 | `docker-compose.preview.yml` |
| **Local**      | Local development | `tunele-api-local`         | 7600 | `docker-compose.local.yml`   |

### CI/CD Pipeline

The deployment pipeline (`backend-cicd.yml`) runs on:

- **Automatic**: Push to `master` with changes in `src/backend/**`
- **Manual**: Workflow dispatch (select environment: preview or production)

#### Pipeline Stages

1. **Lint** - ESLint check (parallel with test)
2. **Test** - Jest test suite (parallel with lint)
3. **Build** - Docker image build with layer caching, push to GHCR
4. **Deploy** - SSH to server, pull image, health check, rollback on failure

#### Key Features

- **Gated deployments**: Build only runs after lint and test pass
- **Concurrency control**: Prevents simultaneous deployments
- **Docker layer caching**: Uses GitHub Actions cache for faster builds
- **Health checks**: Verifies service is healthy before completing
- **Automatic rollback**: Reverts to previous version if deployment fails

### Manual Deployment

To deploy a branch to an environment manually:

1. Go to **Actions** → **Backend CI/CD** → **Run workflow**
2. Select the **branch** to deploy
3. Select the **environment** (preview or production)
4. Click **Run workflow**

This is useful for:

- Testing `develop` branch changes in production before merging
- Deploying hotfixes from feature branches
- Rolling back to a previous commit

### Server Setup

#### Directory Structure

On the deployment server, create this structure:

```
/home/{user}/tunele-api/
├── .env                       # Production environment variables
├── .env.preview               # Preview environment variables (if using preview)
├── docker-compose.prod.yml    # Downloaded by CI/CD
├── docker-compose.preview.yml # Downloaded by CI/CD (if using preview)
└── logs/
    ├── prod/                  # Production logs (mounted volume)
    └── preview/               # Preview logs (mounted volume)
```

#### Initial Setup Commands

```bash
# SSH to your server
ssh user@your-server

# Create project directory
mkdir -p ~/tunele-api/logs/prod ~/tunele-api/logs/preview

# Create environment file
cd ~/tunele-api
nano .env  # Add your production environment variables
```

#### Required Environment Variables

```env
PORT=7600
CORS_OPTIONS='{"origin":["https://yourdomain.com"],"credentials":true,"methods":"GET,POST,OPTIONS"}'
COOKIE_SETTINGS='{"httpOnly":true,"secure":true,"sameSite":"strict","path":"/"}'
SPOTIFY_CLIENT_KEY='your_base64_encoded_key'
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
GOOGLE_OAUTH_CLIENT_ID='your_client_id'
GOOGLE_OAUTH_CLIENT_SECRET='your_client_secret'
REDIRECT_URI='https://yourdomain.com/auth/callback'
SESSION_ENCRYPTION_KEY='<32-byte-hex-string>'
SESSION_TTL_SECONDS='604800'
REDIS_URL='redis://redis:6379' # Docker service name — correct for prod/preview containers, use localhost:6379 for local development
REDIS_PASSWORD='your_secure_redis_password'
```

#### Observability Configuration - Environment Variables

| Variable                        | Description                          |
| ------------------------------- | ------------------------------------ |
| `METRICS_AUTH_TOKEN` (optional) | Metrics authentication token         |
| `CLUSTER_NAME` (optional)       | Cluster name for metrics and logging |
| `GRAFANA_LOKI_HOST`             | Grafana Loki host                    |
| `GRAFANA_LOKI_USER`             | Grafana Loki user                    |
| `GRAFANA_LOKI_TOKEN`            | Grafana Loki token                   |
| `GRAFANA_PROMETHEUS_URL`        | Grafana Prometheus URL               |
| `GRAFANA_PROMETHEUS_USER`       | Grafana Prometheus user              |
| `GRAFANA_PROMETHEUS_TOKEN`      | Grafana Prometheus token             |

#### GitHub Secrets Required

Configure these in your repository settings:

| Secret            | Description                       |
| ----------------- | --------------------------------- |
| `SSH_PRIVATE_KEY` | SSH private key for server access |
| `SERVER_HOST`     | Server hostname or IP             |
| `SERVER_USER`     | SSH username on server            |

### Docker Configuration

#### Compose Files

| File                         | Purpose                         | Services                           |
| ---------------------------- | ------------------------------- | ---------------------------------- |
| `docker-compose.dev.yml`     | Dev dependencies (hot reload)   | Redis only (port 6379 exposed)     |
| `docker-compose.local.yml`   | Local smoke-test (mirrors prod) | API + Redis (port 6379 exposed)    |
| `docker-compose.prod.yml`    | Production                      | API (port 7600) + Redis (internal) |
| `docker-compose.preview.yml` | Preview/staging                 | API (port 7601) + Redis (internal) |

#### Health Checks

Both API and Redis containers have health checks:

- **API**: `curl -f http://localhost:7600/api/health`
- **Redis**: `redis-cli ping`

The deployment script waits for health checks to pass before considering deployment successful.

### Rollback

If a deployment fails health checks, the pipeline automatically:

1. Restores the previous `docker-compose.*.yml` from backup
2. Restarts containers with the previous configuration
3. Verifies the rollback was successful

For manual rollback, you can re-run the workflow with a previous commit SHA or trigger a new deployment from a known-good branch.

### Troubleshooting

#### Check container status

```bash
ssh user@server
cd ~/tunele-api
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100
```

#### Check Redis connectivity

```bash
docker exec -it tunele-redis-prod redis-cli -a $REDIS_PASSWORD ping
```

#### Force recreate containers

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

#### View deployment logs

Check the GitHub Actions run logs for detailed deployment output.
