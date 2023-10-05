# tunele

A Heardle clone after the game shut down on May 5th, 2023

## How to use this repository

### Required Services

These services are **required** for Tunele to work properly.

-   A Spotify web application: [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
-   A Firebase project with Firestore set up: [https://firebase.google.com/docs/firestore/quickstart](https://firebase.google.com/docs/firestore/quickstart)
-   A Google Cloud project with OAuth consent set up and client credentials: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)

### Starting Tunele

Starting the server (see [important files](https://github.com/wildrxge/tunele#important-files) first)

1. Run `npm install` (requires node 18.x)
2. Run `npm start`
3. The server is accessible at http://localhost:7600/

Starting the client

1. Run `cd client`
2. Run `npm install` (requires node 18.x)
3. Run `npm run dev`

Running Tunele locally

1. Edit `API_ORIGIN` in `client/src/components/App.tsx` to the origin of your API ("http://localhost:7600" for local dev)
2. Edit `queryParams.redirect_uri` in `client/src/components/modules/UserAccountModal.tsx` to your redirect_uri

Deploying to Production (on servers)

1. The client (Vite React App) is deployed on Vercel
2. The server is deployed on Heroku

## Directory and important files

### Frontend

`client/` - Vite React-ts app

`client/src/components/App.tsx` - Main App component of React app (route handler)

### Backend

`index.js` - Where the express app is located

`api.js` - Where the api is located

### Important Files

`.env` - Should contain the following environment variables

-   SPOTIFY_CLIENT_KEY - <base64 encoded `client_id:client_secret`>
-   FIREBASE_SERVICE_ACCOUNT_KEY - JSON of Service Key with read/write access to Firebase project's Firestore Database
-   GOOGLE_OAUTH_CLIENT_ID - Google Cloud OAuth 2.0 client ID
-   GOOGLE_OAUTH_CLIENT_SECRET - Google Cloud OAuth 2.0 client secret
-   REDIRECT_URI - OAuth 2.0 redirect_uri
-   CORS_OPTIONS - Replace { origin } with the origin of the client app
-   COOKIE_SETTINGS - Replace { "secure": false, "sameSite": "lax"} for local development / non HTTPS connections

```env
SPOTIFY_CLIENT_KEY=""
FIREBASE_SERVICE_ACCOUNT_KEY={}
GOOGLE_OAUTH_CLIENT_ID=""
GOOGLE_OAUTH_CLIENT_SECRET=""
REDIRECT_URI="https://domain.com/auth/callback"
CORS_OPTIONS={"origin":"https://domain.com","credentials":true,"methods":"GET,POST,OPTIONS"}
COOKIE_SETTINGS={"httpOnly":true,"secure":true,"sameSite":"none","path":"/"}
```
