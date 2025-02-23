# tunele

A Heardle clone after the game shut down on May 5th, 2023

## How to use this repository

### Required Services

These services are **required** for Tunele to work properly.

- A Spotify web application: [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
- A Firebase project with Firestore set up: [https://firebase.google.com/docs/firestore/quickstart](https://firebase.google.com/docs/firestore/quickstart)
- A Google Cloud project with OAuth consent set up and client credentials: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)

### Required Developer Tools

1. Git - https://git-scm.com/downloads
2. Node.js 18+ - https://nodejs.org/en/about/previous-releases
3. Yarn - `npm i -g yarn` (must be done after Node.js is installed)

### Required Config Files for Running Tunele

1. `src/backend/.env`

   - Copy `src/backend/.env.example` to `src/backend/.env` and fill in the fields
   - Values
     - `SPOTIFY_CLIENT_KEY` - <base64 encoded `client_id:client_secret`>
       - e.g. if your client_id is `abc` and client_secret is `123`, base64 encode the string `abc:123` and that is your key
     - `FIREBASE_SERVICE_ACCOUNT_KEY` - JSON of Service Key with read/write access to Firebase project's Firestore Database (should be inline like the example)
     - `GOOGLE_OAUTH_CLIENT_ID` - Google Cloud OAuth 2.0 client ID
     - `GOOGLE_OAUTH_CLIENT_SECRET` - Google Cloud OAuth 2.0 client secret
     - `REDIRECT_URI` - Google OAuth 2.0 redirect_uri

2. `src/frontend/.env`

   - Copy `src/frontend/.env.example` to `src/frontend/.env` and fill in the fields (`VITE_OAUTH_CLIENT_ID` for local development, same value as `GOOGLE_OAUTH_CLIENT_ID`)

### Starting Tunele Locally

1. Clone the repository to the directory of your choice - `git clone https://github.com/alneng/tunele.git`
2. Download dependencies - `yarn install`
3. Start the frontend and backend - `yarn start`
4. Access the frontend - http://localhost:5173

### Starting Tunele backend with Docker

Building the image

```bash
cd src/backend
docker compose build # Creates image tunele-api:latest
```

Running the image

```bash
# With Docker Compose

cd src/backend
docker compose up # Has the correct context (log directory, env file)

# or Manually run the image - configure log directory and env file as fit

# Mac/Unix
docker run -v $(pwd)/logs:/app/logs --env-file .env -p 7600:7600 --name tunele tunele-api:latest
# Windows
docker run -v ${pwd}/logs:/app/logs --env-file .env -p 7600:7600 --name tunele tunele-api:latest
```
