# Volunteer Connect Prototype

## What this prototype includes

- React + TypeScript web-app
- Node + Express backend
- PostgreSQL-compatible embedded database using `@electric-sql/pglite`
- JWT-based auth
- Signup, login, logout
- Explore dashboard with live matching scores
- Realtime chat using WebSockets
- Editable profile with backend persistence
- Admin/community management dashboard
- Survey NLP parsing and volunteer-task matching

## Run the prototype

Open one terminal in:

`C:\varun\D_Drive\app-ceration\volunteer-app`

Start the full app on one URL:

```bash
npm run api
```

Then open:

`http://127.0.0.1:4177`

For frontend-only development, you can still use:

```bash
npm run dev
```

and open:

`http://127.0.0.1:4175/login`

## Demo accounts

Admin account:

- Email: `riya@volunteerconnect.org`
- Password: `demo-access`

Or create a new volunteer account from `/signup`.

## Demo flow for submission

1. Open the login page and sign in with the admin account
2. Show the home page recommendations and live match percentages
3. Open inbox and explain that chat is now connected through WebSockets
4. Open profile and save a profile edit
5. Open admin and show:
   - community creation
   - task creation
   - survey intake
   - NLP need extraction
   - match scoreboard
6. Create a new volunteer account from signup to show real auth and persistence

## Internal ports

- Combined backend + served app: `4177`
- Vite frontend dev server: `4175`
