# tunele

A Heardle clone after the game shut down on May 5th, 2023

## Architecture Overview

| Component | Technology                     | Location         |
| --------- | ------------------------------ | ---------------- |
| Frontend  | React + Vite + Tailwind        | `src/frontend/`  |
| Backend   | Node.js + Express + TypeScript | `src/backend/`   |
| Database  | Firebase Firestore             | Cloud            |
| Cache     | Redis                          | Docker container |
| Auth      | Google OAuth 2.0               | Cloud            |

## Quick Start

### Prerequisites

1. **Developer Tools**
   - [Git](https://git-scm.com/downloads)
   - [Node.js 18+](https://nodejs.org/en/about/previous-releases)
   - [Docker](https://www.docker.com/get-started) (for Redis)
   - Yarn - `npm i -g yarn`

2. **External Services**
   - [Spotify Developer App](https://developer.spotify.com/dashboard)
   - [Firebase Project with Firestore](https://firebase.google.com/docs/firestore/quickstart)
   - [Google Cloud OAuth Credentials](https://developers.google.com/identity/protocols/oauth2)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/alneng/tunele.git
   cd tunele
   ```

2. **Configure environment variables**

   ```bash
   # Backend
   cp src/backend/.env.example src/backend/.env
   # Edit src/backend/.env with your credentials

   # Frontend
   cp src/frontend/.env.example src/frontend/.env
   # Edit src/frontend/.env with your credentials
   ```

3. **Install dependencies**

   ```bash
   yarn install
   ```

4. **Start the application**

   ```bash
   yarn dev
   ```

   This starts Redis (via Docker), the backend API with hot reload, and the frontend — all in one command.

5. **Access the app** at http://localhost:5173

## Environment Variables

### Backend (`src/backend/.env`)

| Variable                       | Description                              |
| ------------------------------ | ---------------------------------------- |
| `PORT`                         | Server port (default: 7600)              |
| `CORS_OPTIONS`                 | CORS configuration JSON                  |
| `COOKIE_SETTINGS`              | Cookie configuration JSON                |
| `SPOTIFY_CLIENT_KEY`           | Base64 encoded `client_id:client_secret` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase service account JSON (inline)   |
| `GOOGLE_OAUTH_CLIENT_ID`       | Google OAuth 2.0 client ID               |
| `GOOGLE_OAUTH_CLIENT_SECRET`   | Google OAuth 2.0 client secret           |
| `REDIRECT_URI`                 | OAuth redirect URI                       |
| `SESSION_ENCRYPTION_KEY`       | Session encryption key                   |
| `SESSION_TTL_SECONDS`          | Session TTL in seconds (default: 7 days) |
| `REDIS_URL`                    | Redis connection URL                     |
| `REDIS_PASSWORD`               | Redis password (required in production)  |

### Backend - Observability (`src/backend/.env`)

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

### Frontend (`src/frontend/.env`)

| Variable                             | Description                            |
| ------------------------------------ | -------------------------------------- |
| `VITE_OAUTH_CLIENT_ID`               | Same as `GOOGLE_OAUTH_CLIENT_ID`       |
| `VITE_FARO_COLLECTOR_URL` (optional) | Grafana Faro collector url for metrics |
| `VITE_FARO_APP_NAME` (optional)      | Grafana Faro app name for metrics      |

## Development

### Available Scripts

| Command                      | Description                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `yarn dev`                   | Start Redis, backend (with hot reload), and frontend in one command                     |
| `yarn backend`               | Start Redis and backend only (with hot reload)                                          |
| `yarn backend:preview <cmd>` | Shortcut for `docker compose` on `docker-compose.local.yml` (e.g. `up --build`, `down`) |
| `yarn dev:stop`              | Stop the Redis Docker container started by `yarn dev`/`yarn backend`                    |
| `yarn frontend`              | Start the frontend only                                                                 |
| `yarn frontend:build`        | Build the frontend for production                                                       |
| `yarn frontend:preview`      | Preview the production frontend build locally                                           |
| `yarn lint`                  | Run ESLint across all packages                                                          |
| `yarn test`                  | Run test suites                                                                         |

### Smoke-testing the production image locally

To test the fully containerised production build locally (API + Redis in Docker, no hot reload):

```bash
yarn backend:preview up --build
```

## Deployment

See [`src/backend/README.md`](src/backend/README.md) for detailed deployment documentation.

### Quick Reference

- **Production**: Auto-deploys on push to `master` (backend changes only)
- **Preview**: Manual deployment via GitHub Actions workflow dispatch
- **CI/CD**: GitHub Actions with lint/test gates before deployment

### Environments

| Environment | Branch    | Port | Compose File                 |
| ----------- | --------- | ---- | ---------------------------- |
| Production  | `master`  | 7600 | `docker-compose.prod.yml`    |
| Preview     | `develop` | 7601 | `docker-compose.preview.yml` |

## Project Structure

```
tunele/
├── .github/workflows/     # CI/CD pipelines
│   ├── ci.yml             # Lint and test (runs on all PRs/pushes)
│   └── backend-cicd.yml   # Build and deploy backend
├── src/
│   ├── backend/           # Express API server
│   │   ├── docker/        # Docker configuration
│   │   ├── src/           # Application source
│   │   └── tests/         # Test suites
│   └── frontend/          # React application
│       ├── src/           # Application source
│       └── public/        # Static assets
└── package.json           # Root workspace config
```

## License

See [LICENSE](LICENSE) for details.
