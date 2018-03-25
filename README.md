# Wings Cheap

[Wings.cheap](https://wings.cheap/) is an online website for finding cheap wings near you. This repo houses both the front-end and back-end for the application.

## Running Locally

1. Build a `.env` file. Add the following:

```
GOOGLE_PLACES_API_KEY=YOUR_API_KEY
GOOGLE_PLACES_OUTPUT_FORMAT=json
```

2. Run this in the terminal

```bash
npm install
npm start
```

## Running Production

```
export NODE_ENV=production
npm run build
node server.js
```

**NOTE:** you may want to use something like Forever.js to keep the process running in the background.

## Backup/Restore Database

We leverage MongoDB as a database provider. The below commands are used to backup/restore the database.

```bash
mongodump
mongorestore
```