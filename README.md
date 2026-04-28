# Volunteer Connect Prototype

## Current architecture

- Frontend: React + TypeScript + Vite
- Frontend hosting: Vercel
- Backend: Node + Express + WebSocket
- Backend hosting: Render Web Service
- Database: local `PGlite` file storage for prototype data

## What works in the prototype

- signup, login, logout
- explore dashboard with match scoring
- chat API + WebSocket updates
- editable profile with persistence
- admin/community/task/survey flows
- NLP-style need extraction and score-based matching

## Local development

### Option 1: full local app on one URL

```bash
npm run api
```

Open:

- [http://127.0.0.1:4177](http://127.0.0.1:4177)

### Option 2: frontend dev server + local backend

Terminal 1:

```bash
npm run api:server
```

Terminal 2:

```bash
npm run dev
```

Open:

- [http://127.0.0.1:4175/login](http://127.0.0.1:4175/login)

## Vercel frontend setup

Deploy this repo as a Vite frontend on Vercel.

Set these environment variables in Vercel:

- `VITE_API_BASE=https://your-render-service.onrender.com/api`
- `VITE_WS_BASE=wss://your-render-service.onrender.com/ws`

For your current frontend domain, use:

- [https://volunteer-web-app-one.vercel.app](https://volunteer-web-app-one.vercel.app)

## Render backend setup

Create a Render Web Service from this same repo.

Recommended settings:

- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Set these environment variables in Render:

- `HOST=0.0.0.0`
- `JWT_SECRET=<your-random-secret>`
- `ALLOW_VERCEL_PREVIEWS=true`
- `ALLOWED_ORIGINS=https://volunteer-web-app-one.vercel.app`

Optional for local frontend access too:

- `ALLOWED_ORIGINS=https://volunteer-web-app-one.vercel.app,http://127.0.0.1:4175,http://localhost:4175,http://127.0.0.1:4177,http://localhost:4177`

## Important prototype note

The backend currently stores data with `PGlite`.

That means:

- localhost works well
- Render works for prototype behavior
- data persistence on Render is not production-grade unless you attach persistent storage or move to hosted Postgres

If you want stronger deployment persistence next, the best upgrade is:

1. move backend data to Render Postgres or Supabase Postgres
2. keep Render for API/WebSocket
3. keep Vercel for frontend

## Demo account

- Email: `riya@volunteerconnect.org`
- Password: `demo-access`

## Deployment behavior

- When frontend and backend are on different domains, the frontend uses `VITE_API_BASE` and `VITE_WS_BASE`
- When running locally on one URL, the backend can also serve the built frontend directly
- The backend health endpoint is:
  - `/api/health`
