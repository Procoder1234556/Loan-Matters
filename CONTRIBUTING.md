# Contributing to LoanMatters

Thank you for your interest in contributing! LoanMatters is an open-source, AI-powered education loan tool for STEM students.

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org))
- **pnpm** 9+ — `npm install -g pnpm`
- A **Tavily API key** (free tier works) — [get one here](https://tavily.com)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Procoder1234556/Loan-Matters.git
cd Loan-Matters

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your TAVILY_API_KEY (minimum required)

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app running.

---

## 🌿 Branching Strategy

| Branch      | Purpose                                     |
| ----------- | ------------------------------------------- |
| `main`      | Production — protected, never push directly |
| `dev`       | Staging — all PRs merge here first          |
| `feature/*` | New features                                |
| `fix/*`     | Bug fixes                                   |

**Always branch off `dev`, not `main`.**

```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

---

## ✅ Before Submitting a PR

Run these locally and make sure they pass:

```bash
pnpm lint        # ESLint
pnpm typecheck   # TypeScript type check
pnpm build       # Ensure the app builds
```

---

## 📋 PR Guidelines

- Keep PRs **focused** — one feature or fix per PR
- Write a **clear PR description** using the PR template
- Add screenshots for UI changes
- Never commit secrets or API keys — use `.env.local` only

---

## 🗂️ Project Structure

```
app/              → Next.js App Router pages & API routes
components/       → Reusable UI components (shadcn/ui based)
lib/              → Utilities, types, Supabase client
hooks/            → Custom React hooks
public/           → Static assets
styles/           → Global CSS
```

---

## 🐛 Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) when opening issues.

---

## 💬 Questions?

Open a [GitHub Discussion](https://github.com/Procoder1234556/Loan-Matters/discussions) — we're happy to help!
