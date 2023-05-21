# tunele

A Heardle clone after the game shut down on May 5th, 2023

## How to use this repository

Starting the server

1. Run `npm install` (requires node 18.x)
2. Run `npm start`
3. The server is accessible at http://localhost:7600/

Starting the client

1. Run `cd client`
2. Run `npm install` (requires node 18.x)
3. Run `npm run dev`

Deploying to Production (on servers)

1. The client (Vite React App) is deployed on Vercel
2. The server is deployed on Heroku

---

Directory and important files

### Frontend

`client/` - Vite React-ts app

`client/src/components/App.tsx` - Main App component of React app (handles routes)

### Backend

`index.js` - Where the express app is located

`api.js` - Where the api is located

### Important Files

`.env` - Should contain the following environment variables

-   SPOTIFY_CLIENT_KEY - <base64 encoded `client_id:client_secret`>
-   FIREBASE_SERVICE_ACCOUNT_KEY - JSON of Service Key with read/write access to Firebase project's Firestore Database

```env
SPOTIFY_CLIENT_KEY=""
FIREBASE_SERVICE_ACCOUNT_KEY={}
```
