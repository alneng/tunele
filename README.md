# tunele

A Heardle clone after the game shut down on May 5th, 2023

## How to use this repository

Starting the server

1. Run `npm install` (requires node 16.x)
2. Run `npm start`
3. The server is accessible at http://localhost:7600/

Starting the client

1. Run `cd client`
2. Run `npm install` (requires node 16.x)
3. Run `npm run dev`

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

```env
SPOTIFY_CLIENT_KEY=""
```
