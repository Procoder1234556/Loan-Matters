/**
 * Agent Routes — CompareAgent, BlogAgent, RateAgent, Ask AI (KB-grounded)
 */

import { Router } from "express"
import type { Request, Response } from "express"
import { runCompareAgent } from "../agents/compare-agent"
import type { CompareAgentState, ConversationMessage } from "../agents/compare-agent"
import { runBlogAgent } from "../agents/blog-agent"
import { runRateAgent } from "../agents/rate-agent"
import { getKBContext, searchKB } from "../knowledge-base"

const router = Router()

// ── AI provider helper (reused from loanmatters.ts pattern) ──────────────────

type AIProvider = "openai" | "anthropic" | "google" | "groq" | "nvidia"

async function callAI(provider: AIProvider, apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const providers: Record<string, { url: string; model: string }> = {
    openai: { url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o" },
    groq: { url: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile" },
    anthropic: { url: "https://api.anthropic.com/v1/messages", model: "claude-sonnet-4-20250514" },
    google: { url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", model: "gemini-1.5-flash" },
    nvidia: { url: "https://integrate.api.nvidia.com/v1/chat/completions", model: "google/gemma-3-27b-it" },
  }

  const config = providers[provider] ?? providers.openai

  if (provider === "anthropic") {
    interface AnthropicResp { error?: { message: string }; content: { text: string }[] }
    const r = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: config.model, max_tokens: 4096, system: systemPrompt, messages: [{ role: "user", content: userMessage }] }),
    })
    const d = await r.json() as AnthropicResp
    if (d.error) throw new Error(d.error.message)
    return d.content[0].text
  }

  if (provider === "google") {
    interface GoogleResp { error?: { message: string }; candidates: { content: { parts: { text: string }[] } }[] }
    const r = await fetch(`${config.url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 4096 } }),
    })
    const d = await r.json() as GoogleResp
    if (d.error) throw new Error(d.error.message)
    return d.candidates[0].content.parts[0].text
  }

  // OpenAI / Groq / NVIDIA (all OpenAI-compatible)
  interface OpenAIResp { error?: { message: string }; choices: { message: { content: string } }[] }
  const r = await fetch(config.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: config.model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], temperature: 0.3, max_tokens: 4096 }),
  })
  const d = await r.json() as OpenAIResp
  if (d.error) throw new Error(d.error.message)
  return d.choices[0].message.content
}

async function tavilySearch(query: string, apiKey?: string) {
  if (!apiKey) throw new Error("Tavily API key required")
  const r = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey, query, search_depth: "advanced", include_answer: true, max_results: 5 }),
  })
  if (!r.ok) throw new Error(`Tavily error: ${r.status}`)
  return r.json() as Promise<{ answer?: string; results?: { title: string; url: string; content: string }[] }>
}

// ── POST /api/compare-agent ──────────────────────────────────────────────────
/**
 * CompareAgent: multi-turn personalized loan advisor.
 * Body: { messages, apiKey, provider, questionsAsked? }
 * Returns: { response, needsMoreInfo, userProfile, questionsAsked }
 */
router.post("/compare-agent", async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, apiKey, provider = "openai", questionsAsked = 0 } = req.body as {
      messages: ConversationMessage[]
      apiKey: string
      provider: AIProvider
      questionsAsked?: number
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" }); return
    }
    if (!apiKey) {
      res.status(400).json({ error: "apiKey is required" }); return
    }

    const aiCaller = (system: string, user: string) => callAI(provider, apiKey, system, user)

    const state: CompareAgentState = {
      messages,
      userProfile: {
        country: null, course: null, universityTier: null, loanAmountLakhs: null,
        collateralAvailable: null, familyIncomeLPA: null, collegeBackground: null, needsPreVisa: null,
      },
      questionsAsked,
      recommendation: null,
      needsMoreInfo: false,
    }

    const result = await runCompareAgent(state, aiCaller)

    res.json({
      response: result.recommendation,
      needsMoreInfo: result.needsMoreInfo,
      userProfile: result.userProfile,
      questionsAsked: result.questionsAsked,
    })
  } catch (error) {
    console.error("CompareAgent error:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "CompareAgent failed" })
  }
})

// ── POST /api/ask-ai-kb ──────────────────────────────────────────────────────
/**
 * KB-grounded Ask AI: injects relevant KB context into every response.
 * Body: { messages, query, apiKey, provider, tavilyApiKey? }
 */
router.post("/ask-ai-kb", async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages = [], query, apiKey, provider = "nvidia", tavilyApiKey } = req.body as {
      messages: ConversationMessage[]
      query: string
      apiKey: string
      provider: AIProvider
      tavilyApiKey?: string
    }

    if (!query || !apiKey) {
      res.status(400).json({ error: "query and apiKey are required" }); return
    }

    // 1. Search KB for relevant context
    const kbContext = getKBContext(query, 4)

    // 2. Optionally fetch live web data
    let webContext = ""
    let webSources: { title: string; url: string; snippet: string }[] = []
    if (tavilyApiKey) {
      try {
        const webData = await tavilySearch(
          `${query} education loan India students abroad`,
          tavilyApiKey
        )
        webContext = webData.answer || ""
        webSources = (webData.results || []).slice(0, 3).map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.content?.slice(0, 200) || "",
        }))
      } catch { /* web search optional */ }
    }

    // 3. Build grounded system prompt
    const systemPrompt = `You are LoanMatters AI — an expert, impartial advisor for Indian STEM students planning to study abroad.
You have deep knowledge of Indian education loans from a curated knowledge base.

KNOWLEDGE BASE (accurate as of 2025 — use these facts, do not contradict them):
${kbContext || "General education loan knowledge available."}

${webContext ? `REAL-TIME WEB DATA:\n${webContext}` : ""}

Guidelines:
- Use specific numbers from the knowledge base (interest rates, lender names, amounts)
- Be concise, practical, and honest — like a knowledgeable friend
- Cite lenders by name when recommending
- Always add: "Verify current rates directly with the lender" when quoting rates
- If user asks about a specific lender, give pros AND cons
- Do not invent rates not present in the knowledge base`

    const conversationHistory = messages
      .slice(-6) // last 6 messages for context
      .map((m) => ({ role: m.role, content: m.content }))

    // 4. Call AI with KB-grounded prompt
    const aiCaller = (system: string, user: string) => callAI(provider as AIProvider, apiKey, system, user)
    const fullHistory = conversationHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
    const userMessage = fullHistory ? `Previous conversation:\n${fullHistory}\n\nCurrent question: ${query}` : query

    const response = await aiCaller(systemPrompt, userMessage)

    res.json({
      response,
      kbDocsUsed: searchKB(query, 4).map((d) => d.id),
      webSources,
      hasKBContext: kbContext.length > 0,
    })
  } catch (error) {
    console.error("Ask AI KB error:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "Ask AI KB failed" })
  }
})

// ── POST /api/blog-agent ──────────────────────────────────────────────────────
/**
 * BlogAgent: generate a full SEO blog post from a keyword.
 * Body: { keyword, apiKey, provider }
 * Admin-protected.
 */
router.post("/blog-agent", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    const authHeader = req.headers.authorization
    if (!adminPassword) {
      res.status(503).json({ error: "Admin features not configured" }); return
    }
    if (authHeader !== `Bearer ${adminPassword}`) {
      res.status(401).json({ error: "Unauthorized" }); return
    }

    const { keyword, apiKey, provider = "openai" } = req.body as { keyword: string; apiKey: string; provider: AIProvider }
    if (!keyword || !apiKey) {
      res.status(400).json({ error: "keyword and apiKey are required" }); return
    }

    const aiCaller = (system: string, user: string) => callAI(provider, apiKey, system, user)
    const draft = await runBlogAgent(keyword, aiCaller)

    res.json({ success: true, draft })
  } catch (error) {
    console.error("BlogAgent error:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "BlogAgent failed" })
  }
})

// ── POST /api/rate-agent ──────────────────────────────────────────────────────
/**
 * RateAgent: scrape and compare current lender rates.
 * Body: { apiKey, provider, tavilyApiKey }
 * Admin-protected.
 */
router.post("/rate-agent", async (req: Request, res: Response): Promise<void> => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    const authHeader = req.headers.authorization
    if (!adminPassword) {
      res.status(503).json({ error: "Admin features not configured" }); return
    }
    if (authHeader !== `Bearer ${adminPassword}`) {
      res.status(401).json({ error: "Unauthorized" }); return
    }

    const { apiKey, provider = "openai", tavilyApiKey } = req.body as {
      apiKey: string; provider: AIProvider; tavilyApiKey?: string
    }
    if (!apiKey || !tavilyApiKey) {
      res.status(400).json({ error: "apiKey and tavilyApiKey are required" }); return
    }

    const aiCaller = (system: string, user: string) => callAI(provider, apiKey, system, user)
    const tavilyFn = (query: string) => tavilySearch(query, tavilyApiKey)
    const result = await runRateAgent(tavilyFn, aiCaller)

    res.json({ success: true, ...result })
  } catch (error) {
    console.error("RateAgent error:", error)
    res.status(500).json({ error: error instanceof Error ? error.message : "RateAgent failed" })
  }
})

// ── GET /api/kb-search ────────────────────────────────────────────────────────
/**
 * Search the knowledge base directly (for debugging/admin).
 */
router.get("/kb-search", (req: Request, res: Response) => {
  const query = req.query.q as string
  if (!query) { res.status(400).json({ error: "q is required" }); return }
  const results = searchKB(query, 5)
  res.json({ query, count: results.length, results: results.map((d) => ({ id: d.id, preview: d.text.slice(0, 200) })) })
})

export default router
