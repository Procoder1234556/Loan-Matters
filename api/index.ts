/**
 * Vercel Serverless API Handler
 * ─────────────────────────────
 * Self-contained Express app for Vercel deployment.
 * All routes mirror artifacts/api-server but have zero workspace dependencies.
 */

import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Helpers ───────────────────────────────────────────────────────────────────

interface TavilyResult { title: string; url: string; content: string }
interface TavilyResponse { answer?: string; results?: TavilyResult[] }

async function tavilySearch(
  query: string,
  options: Record<string, unknown> = {},
  apiKey?: string,
): Promise<TavilyResponse> {
  if (!apiKey) throw new Error("Tavily API key required — configure it in app settings")
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query, include_answer: true, max_results: 5, ...options }),
  })
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`)
  return res.json() as Promise<TavilyResponse>
}

type AIProvider = "openai" | "anthropic" | "google" | "groq"

async function callAI(
  provider: AIProvider,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (provider === "openai" || provider === "groq") {
    const baseURL = provider === "groq"
      ? "https://api.groq.com/openai/v1"
      : "https://api.openai.com/v1"
    const model = provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini"
    const res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })
    if (!res.ok) throw new Error(`${provider} API error: ${res.status}`)
    const data = await res.json() as { choices: [{ message: { content: string } }] }
    return data.choices[0].message.content
  }

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)
    const data = await res.json() as { content: [{ text: string }] }
    return data.content[0].text
  }

  if (provider === "google") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        }),
      },
    )
    if (!res.ok) throw new Error(`Google API error: ${res.status}`)
    const data = await res.json() as { candidates: [{ content: { parts: [{ text: string }] } }] }
    return data.candidates[0].content.parts[0].text
  }

  throw new Error(`Unknown provider: ${provider}`)
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), deployment: "vercel" })
})

// GET or POST /api/loan-rates
async function loanRatesHandler(req: Request, res: Response) {
  try {
    const tavilyApiKey = (req.query.tavilyApiKey ?? req.body?.tavilyApiKey) as string | undefined
    const data = await tavilySearch(
      "India education loan interest rates 2024 2025 SBI HDFC Axis Bank Credila comparison best rates",
      {},
      tavilyApiKey,
    )
    const results = (data.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content?.slice(0, 500),
    }))
    res.json({ answer: data.answer, results, fetchedAt: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch loan rates" })
  }
}
app.get("/api/loan-rates", loanRatesHandler)
app.post("/api/loan-rates", loanRatesHandler)

// GET /api/market-trends
app.get("/api/market-trends", async (req, res) => {
  try {
    const tavilyApiKey = (req.query.tavilyApiKey ?? req.body?.tavilyApiKey) as string | undefined
    const data = await tavilySearch(
      "India education loan market 2025 trends STEM students abroad study",
      { search_depth: "advanced" },
      tavilyApiKey,
    )
    res.json({ answer: data.answer, results: data.results, fetchedAt: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch market trends" })
  }
})

// POST /api/search
app.post("/api/search", async (req, res) => {
  try {
    const { query, searchDepth = "basic", maxResults = 5, tavilyApiKey } = req.body
    if (!query) { res.status(400).json({ error: "Query is required" }); return }
    const data = await tavilySearch(query, { search_depth: searchDepth, max_results: maxResults }, tavilyApiKey)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Search failed" })
  }
})

// POST /api/analyze-profile
app.post("/api/analyze-profile", async (req, res) => {
  try {
    const body = req.body as Record<string, unknown>
    const profile = (body.profileDetails ?? body.profile ?? {}) as Record<string, unknown>
    const university = (body.universityPreferences ?? body.targetUniversity ?? body.targetProgram ?? "") as string
    const provider = ((body.modelProvider ?? body.provider ?? "openai") as string).toLowerCase() as AIProvider
    const apiKey = (body.apiKey ?? body.openaiApiKey ?? body.anthropicApiKey ?? body.googleApiKey ?? body.groqApiKey ?? "") as string

    if (!apiKey) { res.status(400).json({ error: "apiKey is required" }); return }

    const systemPrompt = `You are an expert education loan advisor for Indian STEM students.
Analyse the student profile and provide personalised loan recommendations.
Consider GRE scores, GPA, target universities, field of study, and family income.
Provide a structured analysis with: loan eligibility estimate, recommended lenders, tips to improve chances, and expected ROI.`

    const userPrompt = `Student Profile:
${JSON.stringify(profile, null, 2)}
Target University/Program: ${university}`

    const result = await callAI(provider, apiKey, systemPrompt, userPrompt)
    res.json({ analysis: result, provider, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Profile analysis failed" })
  }
})

// POST /api/salary-data
app.post("/api/salary-data", async (req, res) => {
  try {
    const { field, country = "USA", tavilyApiKey } = req.body
    if (!field) { res.status(400).json({ error: "field is required" }); return }
    const data = await tavilySearch(
      `${field} engineer salary ${country} 2025 average starting salary STEM`,
      { max_results: 5 },
      tavilyApiKey,
    )
    res.json({ field, country, answer: data.answer, results: data.results })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch salary data" })
  }
})

// POST /api/university-costs
app.post("/api/university-costs", async (req, res) => {
  try {
    const { university, program, tavilyApiKey } = req.body
    if (!university) { res.status(400).json({ error: "university is required" }); return }
    const data = await tavilySearch(
      `${university} ${program ?? "MS"} tuition fees 2025 total cost of attendance`,
      { max_results: 5 },
      tavilyApiKey,
    )
    res.json({ university, program, answer: data.answer, results: data.results })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Failed to fetch university costs" })
  }
})

// POST /api/roi-insights
app.post("/api/roi-insights", async (req, res) => {
  try {
    const { loanAmount, courseDuration, expectedSalary, interestRate, provider = "openai", apiKey } = req.body
    if (!apiKey) { res.status(400).json({ error: "apiKey is required" }); return }

    const systemPrompt = `You are an education finance expert. Calculate and explain the ROI for an education loan.
Provide: monthly EMI estimate, break-even timeline, total interest paid, and qualitative ROI assessment.
Use realistic assumptions and explain them clearly.`

    const userPrompt = `Loan details:
- Loan amount: ₹${loanAmount ?? "unknown"}
- Course duration: ${courseDuration ?? "2 years"}
- Expected starting salary: ${expectedSalary ?? "unknown"}
- Interest rate: ${interestRate ?? "10"}% per annum`

    const result = await callAI(provider as AIProvider, apiKey, systemPrompt, userPrompt)
    res.json({ insights: result, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "ROI calculation failed" })
  }
})

// 404 fallback for unmatched /api/* routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API route not found" })
})

export default app
