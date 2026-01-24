# tunele

A Heardle clone after the game shut down on May 5th, 2023

## Architecture Overview

| Component | Technology | Location |
|-----------|------------|----------|
| Frontend | React + Vite + Tailwind | `src/frontend/` |
| Backend | Node.js + Express + TypeScript | `src/backend/` |
| Database | Firebase Firestore | Cloud |
| Cache | Redis | Docker container |
| Auth | Google OAuth 2.0 | Cloud |

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

4. **Start Redis**

   ```bash
   yarn redis
   ```

5. **Start the application**

   ```bash
   yarn start
   ```

6. **Access the app** at http://localhost:5173

## Environment Variables

### Backend (`src/backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 7600) |
| `CORS_OPTIONS` | CORS configuration JSON |
| `COOKIE_SETTINGS` | Cookie configuration JSON |
| `SPOTIFY_CLIENT_KEY` | Base64 encoded `client_id:client_secret` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase service account JSON (inline) |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `REDIRECT_URI` | OAuth redirect URI |
| `REDIS_URL` | Redis connection URL |
| `REDIS_PASSWORD` | Redis password (required in production) |

### Frontend (`src/frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_OAUTH_CLIENT_ID` | Same as `GOOGLE_OAUTH_CLIENT_ID` |

## Development

### Running with Docker

Build and run the backend with Docker Compose:

```bash
cd src/backend
docker compose -f "./docker/docker-compose.local.yml" build
docker compose -f "./docker/docker-compose.local.yml" up
```

This starts both the API and Redis containers.

### Available Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start frontend and backend in development mode |
| `yarn redis` | Start Redis container (auto-removes on stop) |
| `yarn lint` | Run ESLint across all packages |
| `yarn test` | Run test suites |

## Deployment

See [`src/backend/README.md`](src/backend/README.md) for detailed deployment documentation.

### Quick Reference

- **Production**: Auto-deploys on push to `master` (backend changes only)
- **Preview**: Manual deployment via GitHub Actions workflow dispatch
- **CI/CD**: GitHub Actions with lint/test gates before deployment

### Environments

| Environment | Branch | Port | Compose File |
|-------------|--------|------|--------------|
| Production | `master` | 7600 | `docker-compose.prod.yml` |
| Preview | `develop` | 7601 | `docker-compose.preview.yml` |

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
