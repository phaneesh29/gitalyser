# Gitalyser - Current Progress

This file tracks the active progress and implemented features of the **Gitalyser** repository. For the project's long-term goals and architecture design, please see [`GOAL.md`](./GOAL.md).

## 🚀 Current Status

### ⚡ Lite Speed Analysis (Current Focus)
We have heavily focused on building the **"Lite Speed"** analysis pipeline which quickly parses GitHub metadata and provides immediate baseline repository insights:
- **Github Context Fetching**: Implemented `fetchLiteContext` which efficiently pulls repository metadata directly from the GitHub API using user access tokens.
- **Quota Management**: Enforced strict per-user quotas (currently limited to 5 `lite_speed` workspaces per user) to control API usage.
- **Deduplication Check**: Prevents users from wasting quota by analyzing the exact same repository twice.
- **Caching & Refreshing**: Set up TTLs (Time-to-Live) to label fetched analysis data as `isStale` after 24 hours, and built a dedicated endpoint to allow users to force-refresh stale `lite_speed` data directly from GitHub.

### ⚙️ Backend (Hono Server)
- **Routing**: Set up Hono routing framework and established route definitions for `lite_speed` analysis inside `analyses-lite.ts`.
- **Controllers**: Implemented core logic in `analyses.controller.ts` for managing workspaces (creating, fetching, listing, refreshing, and deleting).
- **Validation**: 
  - Extracted Zod schemas into a dedicated `server/src/schemas/analysis.schema.ts`.
  - Implemented strict input validation using `@hono/zod-validator` directly at the route level for JSON request bodies and route parameters (enforcing strict `z.uuid()` checks on paths).
- **Database**: Integrated `drizzle-orm` for connecting and interacting with the Postgres database.
- **Refactoring**: Abstracted utility functions (e.g., `handleError`, `isStale`) into a clean `server/src/helpers/analyses.helper.ts` file to keep controllers focused on business logic.

### 🖥️ Frontend (Next.js)
- **Structure**: Next.js application structure established inside the `web/` directory.
- **Pages**: Built the `dashboard` and dynamic `workspace/[id]` interactive views to display the `lite_speed` analysis payload.
- **Components**: Created shared UI elements like the `new-analysis-dialog` overlay integrated with Hono API handlers via `web/src/lib/api.ts`.

## 🛠️ Next Steps
- Expand upon the `lite_speed` data parsing to surface more metrics on the frontend.
- Build out the heavier **Deep Research** analysis flow which utilizes local AST parsers.
- Add test suites for core backend schemas and routing endpoints.
- Integrate AI summarization workflows directly into the `lite_speed` and `deep_research` outputs.
