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

The app runs at http://localhost:5173 and the API at http://localhost:3001. Saved applications are stored in `server/data/applications.json` on this device.

## Live job search

Without a search key, Discover shows a sample dataset so the tracking workflow can be tried immediately. To search live Google Jobs results, create a SerpApi account, copy `.env.example` to `.env`, and set `SERPAPI_KEY` to your key. Restart the app after changing environment variables.

Search results come from Google Jobs via SerpApi. Sponsorship wording varies by employer and country; verify visa type, eligibility, and current availability on the original listing before applying.

Resume Studio imports searchable PDF, DOCX, and TXT files in the browser, maps common sections into the editor, and keeps the draft in browser storage. Country guidance covers Europe, the UK and Ireland, Australia and New Zealand, Singapore, and Japan. The ATS score is a local heuristic based on section completeness and job-description keyword overlap; it does not represent an employer's ATS result. Scanned image-only PDFs require OCR before import.

## Build

```sh
npm run build
```
