# tunele

A Heardle clone after the game shut down on May 5th, 2023

## How to use this repository

Starting the app

1. Run `npm install` (requires node 16.x)
2. Run `npm start`

---

Directory and important files

### Frontend

`templates/` - HTML files located here

`static/` - Any static files (css, js) are located here; they will be automatically exposted to the web server (ex. domain.com/app.css)

### Backend

`index.js` - Where the express app is located

`api.js` - Where the api is located

### Important Files

`.env` - Should contain the following environment variables

```env
SPOTIFY_CLIENT_KEY=""
```
