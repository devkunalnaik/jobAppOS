# Job Atlas

Job Atlas is a React and Node app for discovering international roles that mention work visa sponsorship and tracking applications through a personal pipeline.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Run locally

```sh
npm install
npm run dev
```

The app runs at http://localhost:5173 and the API at http://localhost:3001.

## Deploy on Render with Supabase

This project includes a [`render.yaml`](render.yaml) Blueprint. Push the repository to GitHub, then in Render choose **New > Blueprint**, connect the repository's `main` branch, and apply the Blueprint. It builds the Vite app and serves the frontend and Express API from the same web service. Automatic deploys run on each commit to `main`.

When Render prompts for unsynced environment variables, enter `VITE_SUPABASE_PUBLISHABLE_KEY` and `SERPAPI_KEY`. Do not add a Supabase service-role key. `ALLOW_LOCAL_MIGRATION` is disabled on Render.

Before the first deploy, run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. In Supabase Authentication URL Configuration, add `https://<your-render-service>.onrender.com` to the Site URL/Redirect URLs, keeping `http://localhost:5173` for local development. Enable email/password sign-in.

Render's free web service sleeps when idle and its filesystem is ephemeral; application data remains in Supabase. Free services may take around a minute to wake. Live job searches also consume your SerpApi account's quota.

## Supabase setup

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql) once to create the application table and enable per-user row-level security. Enable email/password sign-in in Supabase Authentication, then create an account in Job Atlas. Confirm the signup email if confirmation is enabled for the project. Add `http://localhost:5173` under Supabase Authentication > URL Configuration > Redirect URLs; add the deployed app origin there when it is hosted.

Application records are stored in Supabase and isolated to the signed-in user. In local development only, Job Atlas can offer to import existing records from `server/data/applications.json` after the first sign-in. Review and confirm that import in the app. The migration endpoint requires a valid Supabase session and `ALLOW_LOCAL_MIGRATION=true`; keep that flag off in deployed environments.

## Live job search

Without a search key, Discover shows a sample dataset. To search live Google Jobs results, set `SERPAPI_KEY` in `.env` and restart the app.

Search results come from Google Jobs via SerpApi. Sponsorship wording varies by employer and country; verify visa type, eligibility, and current availability on the original listing before applying.

Resume Studio imports searchable PDF, DOCX, and TXT files in the browser, maps common sections into the editor, and keeps the draft in browser storage. Country guidance covers Europe, the UK and Ireland, Australia and New Zealand, Singapore, and Japan. The ATS score is a local heuristic based on section completeness and job-description keyword overlap; it does not represent an employer's ATS result. Scanned image-only PDFs require OCR before import.

## Build

```sh
npm run build
```
