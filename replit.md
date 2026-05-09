# LoanMatters

AI-powered education loan clarity tool for Indian STEM students planning to study abroad.

## Run & Operate

- `pnpm --filter @workspace/loanmatters run dev` — run the frontend (Vite, port 21231 → external 80)
- `pnpm --filter @workspace/api-server run dev` — run the API server (Express, port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19, TailwindCSS v4, wouter (routing), recharts, next-themes
- API: Express 5, pino logging
- Auth: optional Supabase (@supabase/ssr) — app works without it
- External APIs: Tavily (web search), OpenAI / Anthropic / NVIDIA (AI)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/loanmatters/src/pages/` — LandingPage, DashboardPage, BlogPage, BlogPostPage, not-found
- `artifacts/loanmatters/src/components/` — 10 dashboard tool components + UI primitives
- `artifacts/loanmatters/src/lib/` — local-storage.ts (API config), data.ts (static data), images.ts (Unsplash URLs)
- `artifacts/loanmatters/src/components/setup-wizard.tsx` — SetupWizard + SetupGuard (first-run flow)
- `artifacts/api-server/src/routes/loanmatters.ts` — all 10 Express API routes
- `artifacts/api-server/src/routes/index.ts` — registers health + loanmatters routers
- `artifacts/loanmatters/vite.config.ts` — Vite config; proxies `/api` → `http://localhost:8080`

## Architecture decisions

- No database — all user state (API keys, history, setup status) lives in localStorage
- Users bring their own API keys: Tavily key + AI provider key entered in SetupWizard, stored in localStorage, sent with each API request
- API server accepts `tavilyApiKey` in request body (or query param for GET routes) so the server-side `TAVILY_API_KEY` env var is optional
- AI routes accept `apiKey` + `provider` in POST body; provider can be `openai`, `anthropic`, or `nvidia`
- Vite proxy handles CORS — all `/api/*` calls in the browser go to the Vite dev server which forwards to Express on port 8080

## Product

10 tools on the dashboard:
1. **Cost Estimator** — itemized university + living cost breakdown by country/field
2. **ROI Calculator** — loan payback timeline and break-even analysis
3. **Loan Comparison** — side-by-side comparison of Indian lenders (SBI, HDFC, Credila, etc.)
4. **ROI Heatmap** — country × field matrix of ROI scores
5. **Ask AI** — chat interface with web-grounded answers (Tavily + AI)
6. **Profile Analyzer** — AI assessment of admission chances
7. **Application Builder** — AI-generated SOP / university application
8. **Loan Application Builder** — structured loan application document
9. **Resume Builder** — STEM-optimized resume generator
10. **History** — localStorage-backed record of past analyses

## User preferences

- Commit changes after completing work

## Gotchas

- `loan-comparison.tsx` auto-fetches loan rates on mount — it silently falls back to static data if Tavily fails
- History component calls `/api/history` DELETE — these 404 gracefully since history is localStorage-only
- The app shows SetupWizard on first visit (correct behavior); skip setup via localStorage for dev: `localStorage.setItem("loanmatters_setup_complete", "true")`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
