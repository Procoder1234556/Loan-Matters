/**
 * RateAgent — Autonomous Rate Monitor
 * Adapted from the LangGraph blueprint to TypeScript.
 * Checks lender websites for rate changes and summarizes findings.
 * Note: actual web scraping uses Tavily search (no raw HTML scraping needed).
 */

export interface RateResult {
  lender: string
  currentRate: string
  rateMin: number | null
  rateMax: number | null
  confidence: "high" | "medium" | "low"
  source: string
  lastChecked: string
}

export interface RateAgentSummary {
  results: RateResult[]
  changes: string[]
  summary: string
  checkedAt: string
}

// Known baseline rates (our static data) to compare against
const BASELINE_RATES: Record<string, { min: number; max: number }> = {
  "SBI": { min: 8.15, max: 10.15 },
  "HDFC Credila": { min: 9.5, max: 13.5 },
  "Avanse": { min: 10.5, max: 13.75 },
  "Auxilo": { min: 11.0, max: 14.0 },
  "Bank of Baroda": { min: 9.15, max: 10.5 },
  "ICICI Bank": { min: 10.75, max: 13.0 },
}

export async function runRateAgent(
  tavilySearch: (query: string) => Promise<{ answer?: string; results?: { title: string; url: string; content: string }[] }>,
  callAI: (system: string, user: string) => Promise<string>
): Promise<RateAgentSummary> {
  const checkedAt = new Date().toISOString()
  const results: RateResult[] = []
  const changes: string[] = []

  // Search for current rates for each major lender
  const lenders = Object.keys(BASELINE_RATES)

  for (const lender of lenders.slice(0, 4)) { // limit to 4 to avoid rate limits
    try {
      const searchData = await tavilySearch(
        `${lender} education loan interest rate 2025 India abroad current`
      )

      const rawContent = searchData.results?.map((r) => r.content).join("\n").slice(0, 2000) || ""
      const answer = searchData.answer || ""

      // Use AI to extract rate from search results
      const extracted = await callAI(
        `Extract education loan interest rates from text. Return ONLY JSON, no markdown.`,
        `Lender: ${lender}
Search result text: ${answer}\n${rawContent.slice(0, 1000)}

Extract the current interest rate. Return ONLY:
{
  "rateMin": number or null,
  "rateMax": number or null,
  "confidence": "high" | "medium" | "low",
  "rateString": "e.g. 9.5% to 13.5%"
}`
      )

      let rateData = { rateMin: null as number | null, rateMax: null as number | null, confidence: "low" as const, rateString: "N/A" }
      try {
        const match = extracted.match(/\{[\s\S]*\}/)
        if (match) rateData = { ...rateData, ...JSON.parse(match[0]) }
      } catch { /* use defaults */ }

      // Detect changes vs baseline
      const baseline = BASELINE_RATES[lender]
      if (rateData.rateMin && rateData.confidence !== "low" && baseline) {
        const diff = rateData.rateMin - baseline.min
        if (Math.abs(diff) > 0.1) {
          const dir = diff > 0 ? "UP" : "DOWN"
          changes.push(`${lender}: ${dir} ${baseline.min}% → ${rateData.rateMin}% (${diff > 0 ? "+" : ""}${diff.toFixed(2)}%)`)
        }
      }

      results.push({
        lender,
        currentRate: rateData.rateString,
        rateMin: rateData.rateMin,
        rateMax: rateData.rateMax,
        confidence: rateData.confidence,
        source: searchData.results?.[0]?.url || "",
        lastChecked: checkedAt,
      })
    } catch (err) {
      results.push({
        lender,
        currentRate: "Error fetching",
        rateMin: BASELINE_RATES[lender].min,
        rateMax: BASELINE_RATES[lender].max,
        confidence: "low",
        source: "",
        lastChecked: checkedAt,
      })
    }
  }

  const summary = changes.length > 0
    ? `Rate update: ${changes.length} changes detected — ${changes.join("; ")}`
    : `No significant rate changes detected. All ${results.length} lenders checked. Rates appear stable.`

  return { results, changes, summary, checkedAt }
}
