<div align="center">

<!-- LOGO / BANNER -->
<img src="https://raw.githubusercontent.com/Procoder1234556/Loan-Matters/main/public/logo.png" alt="LoanMatters Logo" width="120" height="120" onerror="this.style.display='none'"/>

# 💸 LoanMatters

### AI-Powered Education Loan Clarity for STEM Students

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://loan-matters.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)

**[🌐 Live Demo](https://loan-matters.vercel.app)** · **[🐛 Report Bug](https://github.com/Procoder1234556/Loan-Matters/issues)** · **[✨ Request Feature](https://github.com/Procoder1234556/Loan-Matters/issues)**

---

<!-- DEMO GIF PLACEHOLDER — replace with real recording -->
> 📽️ **Demo GIF** — A small demo of the application


![LoanMatters Demo](<img width="800" height="385" alt="demovideoloanrecord-ezgif com-speed" src="https://github.com/user-attachments/assets/07da02d6-7ed3-40b1-b3ae-5e89435908e8" />
)

</div>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
  - [How to Contribute](#how-to-contribute)
  - [Good First Issues](#good-first-issues)
  - [Code Style](#code-style)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 About The Project

> "Millions of STEM students take education loans every year without fully understanding the terms, hidden costs, or long-term ROI. LoanMatters fixes that."

**LoanMatters** is a free, open-source web application that helps STEM students in India and globally make smarter decisions about education loans. Instead of reading through dense financial documents, students can:

- **Compare** loans from multiple banks and NBFCs side-by-side
- **Calculate** the true total cost including hidden fees
- **Estimate ROI** based on expected salary after graduation
- **Chat with AI** to get plain-language explanations of any loan terms
- **Export** their full loan analysis as a PDF report

This project is built in public — open source, community-driven, and 100% free to use.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Loan Advisor** | Ask questions in natural language. Get plain-English answers about EMI, moratorium, collateral, and more |
| 📊 **Loan Comparison Engine** | Compare multiple loan offers side-by-side across interest rate, processing fee, tenure, and total cost |
| 🧮 **ROI Calculator** | Enter your expected post-graduation salary and see how long it takes to break even on your loan |
| 🔍 **Real-time Web Search** | Powered by Tavily API — fetches up-to-date loan rates and bank offerings |
| 📄 **PDF Export** | Download a beautifully formatted loan analysis report you can share with family |
| 🌙 **Dark / Light Mode** | Fully themed UI with system preference detection |
| 🔐 **Optional Auth** | Supabase-powered authentication to save and revisit your comparisons |
| 🔑 **Bring Your Own Key** | Use your own OpenAI / Anthropic / Gemini / Groq API key — no data stored server-side |
| 📱 **PWA Ready** | Install as a Progressive Web App on mobile |

---

## 🛠 Tech Stack

```
Frontend  →  Next.js 16  ·  React 19  ·  TypeScript 5.7  ·  Tailwind CSS 4
UI        →  shadcn/ui  ·  Radix UI  ·  Lucide Icons  ·  Recharts
Backend   →  Next.js API Routes  ·  Supabase (Auth + Postgres)
AI        →  OpenAI  ·  Anthropic Claude  ·  Google Gemini  ·  Groq
Search    →  Tavily API (real-time web search)
Forms     →  React Hook Form  ·  Zod validation
PDF       →  @react-pdf/renderer
Deploy    →  Vercel  ·  pnpm
```

---

## 📁 Project Structure

```
loan-matters/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── api/                # API route handlers
│   │   ├── ai/             # AI chat & analysis endpoints
│   │   ├── loans/          # Loan data & comparison endpoints
│   │   └── search/         # Tavily web search integration
│   ├── calculator/         # ROI & EMI calculator pages
│   ├── compare/            # Loan comparison page
│   └── page.tsx            # Homepage
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui base components
│   ├── loan-card.tsx       # Loan offer card component
│   ├── ai-chat.tsx         # AI advisor chat interface
│   ├── comparison-table.tsx# Side-by-side comparison table
│   └── pdf-report.tsx      # PDF export component
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, helpers, Supabase client
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── styles/                 # Global CSS
├── .env.example            # Environment variable template
├── middleware.ts            # Auth & route protection middleware
└── next.config.mjs         # Next.js config
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ → [Download](https://nodejs.org/)
- **pnpm** (recommended) → `npm install -g pnpm`
- A free **Supabase** account → [supabase.com](https://supabase.com) *(optional for auth)*
- A **Tavily** API key → [tavily.com](https://tavily.com) *(for real-time search)*
- At least one AI API key → OpenAI / Anthropic / Google / Groq

---

### Installation

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/Loan-Matters.git
cd Loan-Matters

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app running. 🎉

---

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# ── REQUIRED ──────────────────────────────────────────
# Tavily API Key (real-time loan rate search)
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxx

# ── OPTIONAL: Supabase (for auth & saved comparisons) ─
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ── OPTIONAL: AI Providers (pick one or more) ─────────
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
GOOGLE_GENERATIVE_AI_API_KEY=AIzaxxxxxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
```

> **Note for Open Source Users:** You can skip all AI provider keys and enter them directly in the app's Settings UI. Keys are stored only in your browser's localStorage — never on our servers.

---

## 💡 Usage

<!-- Replace GIFs below with actual screen recordings -->

### 1. Compare Loans Side-by-Side

> Paste or search for loan offers and compare them on a single screen

![Compare Feature](<img width="1530" height="864" alt="image" src="https://github.com/user-attachments/assets/58355e23-8971-4217-849b-bfc861647bb6" />
)

### 2. Ask the AI Advisor

> Type any question in plain English — "What is a moratorium period?" or "Which loan has lower total cost?"

![AI Chat](<img width="1494" height="844" alt="image" src="https://github.com/user-attachments/assets/970cf80c-2121-4342-8dcb-a6e8d77c9d26" />
)

### 3. Calculate Your ROI

> Enter your expected first-year salary and watch the break-even timeline update in real time

![ROI Calculator](<img width="1496" height="855" alt="image" src="https://github.com/user-attachments/assets/499300e0-7393-4041-9ef4-f3e263b99b81" />
)

### 4. Loan Application Builder

> You can build your custom loan aplication with the help of this tool

![PDF Export](<img width="1460" height="828" alt="image" src="https://github.com/user-attachments/assets/2596858c-4c76-44f4-8c5f-c7d8513f68ac" />
)

---

## 🗺 Roadmap

- [x] AI chat for loan Q&A
- [x] Loan comparison table
- [x] EMI & ROI calculator
- [x] PDF export
- [x] Supabase auth & saved comparisons
- [x] Dark/light mode
- [ ] Mobile app (React Native / Expo)
- [ ] Support for international loans (US, UK, Canada)
- [ ] Bank API integrations for live rates
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Community loan reviews and ratings
- [ ] Scholarship database integration

Want to work on any of these? See [Contributing](#-contributing) below.

---

## 🤝 Contributing

**LoanMatters is community-driven and welcomes contributions of all kinds!**

Whether you're a designer, developer, finance expert, or a student who used the app — there's a place for you here.

---

### How to Contribute

```
1. Fork the project
        ↓
2. Create your feature branch
   git checkout -b feat/amazing-feature
        ↓
3. Make your changes & write tests
        ↓
4. Commit with a clear message
   git commit -m "feat: add EMI rounding option"
        ↓
5. Push to your fork
   git push origin feat/amazing-feature
        ↓
6. Open a Pull Request on GitHub
        ↓
7. Get reviewed, iterate, and merge! 🎉
```

---

### Good First Issues

New to open source? Start here — these are beginner-friendly tasks:

| Label | Description |
|---|---|
| `good first issue` | Small, well-scoped tasks — great for first-timers |
| `documentation` | Improve or translate docs |
| `ui-improvement` | Polish UI components, fix spacing, improve accessibility |
| `bug` | Confirmed bugs that need fixing |
| `help wanted` | Tasks where maintainers want community input |

Browse all open issues → **[github.com/Procoder1234556/Loan-Matters/issues](https://github.com/Procoder1234556/Loan-Matters/issues)**

---

### Code Style

- **Formatter:** Prettier (run `pnpm format` before committing)
- **Linter:** ESLint (run `pnpm lint`)
- **Branch naming:** `feat/`, `fix/`, `docs/`, `chore/`
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, etc.
- **TypeScript:** No `any` types — keep it strict
- **Components:** One component per file, colocated in `components/`

---

### Types of Contributions Welcome

```
🐛 Bug Reports      →  Open an Issue with steps to reproduce
✨ Features         →  Discuss in Issues first, then open a PR
📝 Documentation    →  Edit any .md file and open a PR
🌍 Translations     →  Help translate the app UI to other languages
🎨 Design           →  Figma mockups, icon suggestions, accessibility
🧪 Tests            →  Write unit or integration tests
💬 Community        →  Answer questions in Issues and Discussions
```

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full text.

This means you are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of this software — just keep the original license notice.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) — The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) — Beautifully designed, accessible components
- [Supabase](https://supabase.com/) — Open source Firebase alternative
- [Tavily](https://tavily.com/) — Real-time web search for AI applications
- [Radix UI](https://www.radix-ui.com/) — Unstyled, accessible UI primitives
- [Recharts](https://recharts.org/) — Composable charting library for React
- [Vercel](https://vercel.com/) — Zero-config deployment platform
- Every student who shared their loan confusion — you inspired this project ❤️

---

<div align="center">

**Made with ❤️ by the LoanMatters community**

If this project helps you, please ⭐ **star the repo** — it helps others find it!

[![Star History Chart](https://api.star-history.com/svg?repos=Procoder1234556/Loan-Matters&type=Date)](https://star-history.com/#Procoder1234556/Loan-Matters&Date)

</div>
