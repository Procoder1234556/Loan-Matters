import { Router } from "express"
import type { Request, Response } from "express"

const router = Router()

interface TavilyResult {
  title: string
  url: string
  content: string
}

interface TavilyResponse {
  answer?: string
  results?: TavilyResult[]
}

async function tavilySearch(query: string, options: Record<string, unknown> = {}, clientApiKey?: string): Promise<TavilyResponse> {
  const apiKey = clientApiKey || process.env.TAVILY_API_KEY
  if (!apiKey) throw new Error("Tavily API key not configured")

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      include_answer: true,
      include_raw_content: false,
      max_results: 5,
      ...options,
    }),
  })

  if (!response.ok) throw new Error(`Tavily API error: ${response.status}`)
  return response.json() as Promise<TavilyResponse>
}

function formatResults(data: TavilyResponse) {
  return {
    answer: data.answer || null,
    results: data.results?.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.substring(0, 200) + "...",
    })) || [],
  }
}

// GET /api/market-trends
router.get("/market-trends", async (req: Request, res: Response) => {
  try {
    const tavilyApiKey = req.query.tavilyApiKey as string | undefined
    const data = await tavilySearch(
      "India education loan trends 2024 2025 interest rates international students STEM abroad",
      {},
      tavilyApiKey
    )
    res.json({ ...formatResults(data), fetchedAt: new Date().toISOString() })
  } catch (error) {
    console.error("Market trends error:", error)
    res.status(500).json({ error: "Failed to fetch market trends" })
  }
})

// GET or POST /api/loan-rates
async function loanRatesHandler(req: Request, res: Response) {
  try {
    const tavilyApiKey = req.body?.tavilyApiKey as string | undefined
    const data = await tavilySearch(
      "India education loan interest rates 2024 2025 SBI HDFC Axis Bank Credila comparison best rates",
      {},
      tavilyApiKey
    )
    res.json({ ...formatResults(data), fetchedAt: new Date().toISOString() })
  } catch (error) {
    console.error("Loan rates error:", error)
    res.status(500).json({ error: "Failed to fetch loan rates" })
  }
}
router.get("/loan-rates", loanRatesHandler)
router.post("/loan-rates", loanRatesHandler)

// POST /api/search
router.post("/search", async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, searchDepth = "basic", maxResults = 5, tavilyApiKey } = req.body
    if (!query) { res.status(400).json({ error: "Query is required" }); return }

    const data = await tavilySearch(query, { search_depth: searchDepth, max_results: maxResults, days: 90 }, tavilyApiKey as string | undefined)
    res.json(data)
  } catch (error) {
    console.error("Search error:", error)
    res.status(500).json({ error: "Failed to search" })
  }
})

// POST /api/salary-data
router.post("/salary-data", async (req: Request, res: Response) => {
  try {
    const { country, field, tavilyApiKey } = req.body
    const query = `${field} engineer developer salary ${country} 2024 2025 average starting fresh graduate international`
    const data = await tavilySearch(query, {}, tavilyApiKey as string | undefined)
    res.json({ ...formatResults(data), query })
  } catch (error) {
    console.error("Salary data error:", error)
    res.status(500).json({ error: "Failed to fetch salary data" })
  }
})

// POST /api/university-costs
router.post("/university-costs", async (req: Request, res: Response) => {
  try {
    const { country, field, university, tavilyApiKey } = req.body
    const query = university
      ? `${university} ${field} master's degree tuition fees living costs 2024 2025 international students`
      : `${country} ${field} master's degree tuition fees living costs 2024 2025 international students average`
    const data = await tavilySearch(query, {}, tavilyApiKey as string | undefined)
    res.json({ ...formatResults(data), query })
  } catch (error) {
    console.error("University costs error:", error)
    res.status(500).json({ error: "Failed to fetch university cost data" })
  }
})

// POST /api/roi-insights
router.post("/roi-insights", async (req: Request, res: Response) => {
  try {
    const { country, field, tavilyApiKey } = req.body
    const query = `${field} graduate salary ROI ${country} study abroad worth investment return break even point 2024`
    const data = await tavilySearch(query, {}, tavilyApiKey as string | undefined)
    res.json({ ...formatResults(data), query })
  } catch (error) {
    console.error("ROI insights error:", error)
    res.status(500).json({ error: "Failed to fetch ROI insights" })
  }
})

// POST /api/analyze-profile
router.post("/analyze-profile", async (req: Request, res: Response): Promise<void> => {
  try {
    const { profile, targetUniversity, targetProgram, apiKey, provider } = req.body
    if (!profile || !apiKey || !provider) {
      res.status(400).json({ error: "Missing required fields" }); return
    }

    let universityContext = ""
    try {
      const data = await tavilySearch(
        `${targetUniversity} ${targetProgram} admission requirements average GPA GRE TOEFL 2024`,
        { max_results: 3 }
      )
      universityContext = data.results?.map((r) => r.content).join("\n").slice(0, 2000) || ""
    } catch (e) {
      console.error("Tavily search error:", e)
    }

    const systemPrompt = `You are an expert university admissions consultant specializing in STEM programs for international students.
Analyze the student profile and provide a detailed assessment.

University Context:
${universityContext || "Use general best practices."}

Provide a JSON response with:
{
  "overallScore": 75,
  "chanceCategory": "High|Medium|Low|Very Low",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "universityFit": {"score": 80, "reasons": ["reason 1"]},
  "profileBreakdown": {
    "academics": {"score": 85, "comment": "Strong GPA"},
    "research": {"score": 70, "comment": "Limited research"},
    "workExperience": {"score": 60, "comment": "Internship experience"},
    "extracurriculars": {"score": 75, "comment": "Good activities"},
    "testScores": {"score": 80, "comment": "Above average GRE"}
  },
  "summary": "Overall summary of the candidate"
}`

    const result = await callAI(provider, apiKey, systemPrompt, `Profile:\n${JSON.stringify(profile, null, 2)}\nTarget: ${targetUniversity} - ${targetProgram}`)
    const json = extractJSON(result)
    res.json({ success: true, analysis: json })
  } catch (error) {
    console.error("Profile analysis error:", error)
    res.status(500).json({ error: "Failed to analyze profile" })
  }
})

// POST /api/build-application
router.post("/build-application", async (req: Request, res: Response): Promise<void> => {
  try {
    const { unstructuredDetails, universityName, programName, apiKey, provider } = req.body
    if (!unstructuredDetails || !universityName || !programName) {
      res.status(400).json({ error: "Missing required fields" }); return
    }

    let universityContext = ""
    try {
      const data = await tavilySearch(`${universityName} ${programName} admission requirements application essay tips`, { max_results: 5 })
      universityContext = data.results?.map((r) => r.content).join("\n\n").slice(0, 3000) || ""
    } catch (e) {
      console.error("Tavily error:", e)
    }

    const providerUsed = provider || "openai"
    const systemPrompt = `You are an expert university admissions consultant who helps students craft compelling applications.
University Context: ${universityContext || "Use general best practices."}
Return JSON with: {"personalStatement":"...","statementOfPurpose":"...","researchInterests":"...","extracurriculars":[],"achievements":[],"whyThisUniversity":"...","summary":"..."}`

    const result = await callAI(providerUsed, apiKey, systemPrompt, `Student Details:\n${unstructuredDetails}\nTarget: ${universityName} - ${programName}`)
    const json = extractJSON(result)
    res.json({ success: true, application: json, universityName, programName })
  } catch (error) {
    console.error("Application builder error:", error)
    res.status(500).json({ error: "Failed to build application" })
  }
})

// POST /api/build-loan-application
router.post("/build-loan-application", async (req: Request, res: Response): Promise<void> => {
  try {
    const { apiKey, provider, applicantDetails, bankName, loanType, loanAmount } = req.body
    if (!apiKey || !provider || !applicantDetails || !bankName) {
      res.status(400).json({ error: "Missing required fields" }); return
    }

    let bankRequirements = ""
    try {
      const data = await tavilySearch(`${bankName} education loan application requirements documents eligibility India 2024`, { max_results: 5 })
      bankRequirements = data.results?.map((r) => r.content).join("\n").slice(0, 2000) || ""
    } catch (e) {
      console.error("Tavily error:", e)
    }

    const systemPrompt = `You are an expert education loan application specialist for ${bankName}.
Bank requirements: ${bankRequirements || "Use standard education loan format."}
Return a comprehensive JSON loan application object with all sections: applicationNumber, bankDetails, applicantInformation, educationDetails, loanDetails, financialInformation, documentsChecklist, declarations, recommendations, coverLetter.`

    const result = await callAI(provider, apiKey, systemPrompt, `Applicant Details:\n${applicantDetails}\nBank: ${bankName}, Type: ${loanType}, Amount: ${loanAmount}`)
    const json = extractJSON(result)
    res.json({ application: json })
  } catch (error) {
    console.error("Loan application error:", error)
    res.status(500).json({ error: "Failed to build loan application" })
  }
})

// POST /api/build-resume
router.post("/build-resume", async (req: Request, res: Response): Promise<void> => {
  try {
    const { unstructuredDetails, jobDescription, jobTitle, companyName, apiKey, provider } = req.body
    if (!unstructuredDetails || !jobDescription) {
      res.status(400).json({ error: "Missing required fields" }); return
    }

    let jobContext = ""
    try {
      const data = await tavilySearch(`${jobTitle} ${companyName || ""} resume keywords ATS optimization skills 2024`, { max_results: 3, search_depth: "basic" })
      jobContext = data.results?.map((r) => r.content).join("\n").slice(0, 2000) || ""
    } catch (e) {
      console.error("Tavily error:", e)
    }

    const systemPrompt = `You are an expert ATS resume optimizer. Create a highly ATS-optimized resume scoring 85%+.
Job Market Context: ${jobContext || "Use general best practices."}
Return JSON: {"name":"","title":"","email":"","phone":"","location":"","summary":"","experience":[{"title":"","company":"","duration":"","bullets":[]}],"education":[{"degree":"","school":"","year":""}],"skills":{"technical":[],"tools":[],"soft":[]},"certifications":[],"projects":[{"name":"","description":""}],"atsScore":85,"keywordMatches":[],"improvementTips":[]}`

    const providerUsed = provider || "openai"
    const result = await callAI(providerUsed, apiKey, systemPrompt, `Details:\n${unstructuredDetails}\nJob:\n${jobDescription}\nTitle: ${jobTitle}, Company: ${companyName}`)
    const json = extractJSON(result)
    res.json({ success: true, resume: json })
  } catch (error) {
    console.error("Resume builder error:", error)
    res.status(500).json({ error: "Failed to build resume" })
  }
})

// GET /api/history
router.get("/history", (_req: Request, res: Response) => {
  res.json({ message: "History is stored locally in the browser" })
})

type AIProvider = "openai" | "anthropic" | "google" | "groq"

async function callAI(provider: AIProvider, apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const providers: Record<AIProvider, { url: string; model: string }> = {
    openai: { url: "https://api.openai.com/v1/chat/completions", model: "gpt-4o" },
    groq: { url: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile" },
    anthropic: { url: "https://api.anthropic.com/v1/messages", model: "claude-sonnet-4-20250514" },
    google: { url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", model: "gemini-1.5-flash" },
  }

  const config = providers[provider] ?? providers.openai

  if (provider === "anthropic") {
    interface AnthropicResponse { error?: { message: string }; content: { text: string }[] }
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })
    const data = await response.json() as AnthropicResponse
    if (data.error) throw new Error(data.error.message)
    return data.content[0].text
  }

  if (provider === "google") {
    interface GoogleResponse { error?: { message: string }; candidates: { content: { parts: { text: string }[] } }[] }
    const response = await fetch(`${config.url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    })
    const data = await response.json() as GoogleResponse
    if (data.error) throw new Error(data.error.message)
    return data.candidates[0].content.parts[0].text
  }

  // OpenAI / Groq
  interface OpenAIResponse { error?: { message: string }; choices: { message: { content: string } }[] }
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })
  const data = await response.json() as OpenAIResponse
  if (data.error) throw new Error(data.error.message)
  return data.choices[0].message.content
}

function extractJSON(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("No JSON found in response")
  return JSON.parse(match[0]) as Record<string, unknown>
}

export default router
