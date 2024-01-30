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
2. Node.js 18.x - https://nodejs.org/en/about/previous-releases
3. Yarn - `npm i -g yarn` (must be done after Node.js is installed)

### Starting Tunele Locally

1. Clone the repository to the directory of your choice - `git clone https://github.com/alneng/tunele.git`
2. Download dependencies - `yarn install`
3. \*Start the client and backend - `yarn start`
4. Access the client - http://localhost:5173

\* Important files must be setup first; see below

## Understanding the Project Structure

### Frontend

`src/client/` - Vite React-TS app

`src/client/src/components/App.tsx` - Main App component of React app (route handler)

### Backend

`src/backend/src/` - Where the express app is located

`src/backend/src/index.js` - Main server entryway

`src/backend/src/api.js` - Where the API is located

### Important Files for Running Tunele

1. `src/client/src/components/modules/UserAccountModal.tsx`

   - Edit `googleSsoParams` to your redirect_uri and ClientId

2. `src/backend/.env.development` - Should contain the following environment variables, or `src/backend/.env` for production environments

   - SPOTIFY_CLIENT_KEY - <base64 encoded `client_id:client_secret`>
   - FIREBASE_SERVICE_ACCOUNT_KEY - JSON of Service Key with read/write access to Firebase project's Firestore Database
   - GOOGLE_OAUTH_CLIENT_ID - Google Cloud OAuth 2.0 client ID
   - GOOGLE_OAUTH_CLIENT_SECRET - Google Cloud OAuth 2.0 client secret
   - REDIRECT_URI - Google OAuth 2.0 redirect_uri
   - CORS_OPTIONS - Replace { origin } with the origin of the client app
   - COOKIE_SETTINGS - Replace { "secure": false, "sameSite": "lax"} for local development / non HTTPS connections

   ```env
   SPOTIFY_CLIENT_KEY=""
   FIREBASE_SERVICE_ACCOUNT_KEY='{}'
   GOOGLE_OAUTH_CLIENT_ID=""
   GOOGLE_OAUTH_CLIENT_SECRET=""
   REDIRECT_URI="https://yourdomain.com/auth/callback"
   CORS_OPTIONS='{"origin":"https://yourdomain.com","credentials":true,"methods":"GET,POST,OPTIONS"}'
   COOKIE_SETTINGS='{"httpOnly":true,"secure":true,"sameSite":"none","path":"/"}'
   ```
