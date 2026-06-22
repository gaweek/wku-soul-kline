# WKU soul-kline Architecture

This project is now scoped to one product: WKU soul-kline.

## Frontend

- `App.tsx` mounts the WKU soul-kline experience at `/`, `/vibeline`, and `/soul-kline`.
- `pages/VibeLinePage.tsx` owns the single-person and two-person product flow.
- `components/VibeLineChart.tsx` renders the interactive soul-kline curve.
- `services/vibelineService.ts` handles SSE calls to the backend.

## Backend

- `server/index.js` exposes only:
  - `GET /api/health`
  - `POST /api/vibeline/analyze`
  - `POST /api/vibeline/match`
- `server/vibelineAnalyzer.js` runs the Who Know U multi-agent flow.
- `server/vibelineMatchAnalyzer.js` runs the Who Know Us multi-agent flow.
- `server/vibelinePrompts.js` contains soul-kline Agent prompts.
- `server/vibelineEngine.js` handles input normalization, safety cleaning, structured fallbacks for UI previews, and result merging.
- `server/modelConfig.js` detects OpenAI-compatible providers and model candidates.

## Removed Surface

The legacy metaphysics routes, prompt packs, frontend pages, database/auth/points modules, content scripts, and old generated-data stores have been removed from the runtime and source tree.
