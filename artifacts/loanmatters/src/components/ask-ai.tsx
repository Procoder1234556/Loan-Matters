import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Bot, User, Loader2, AlertCircle, Globe, ExternalLink, Search, Sparkles, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

type SearchResult = {
  title: string
  url: string
  snippet?: string
  content?: string
}

type Message = {
  role: "user" | "assistant"
  content: string
  sources?: SearchResult[]
  kbDocsUsed?: string[]
  isSearching?: boolean
  hasKBContext?: boolean
}

const KNOWLEDGE_BASE_SYSTEM = `You are LoanMatters AI — an expert, impartial advisor for Indian STEM students planning to study abroad.
You have deep knowledge of Indian education loans from a curated knowledge base including SBI, HDFC Credila, Avanse, Auxilo, Bank of Baroda, MPOWER, and all major schemes.
Be concise, practical, and honest. Use specific numbers. Never invent interest rates.`

const SUGGESTED_QUESTIONS = [
  "Which is better for US MS — SBI or HDFC Credila?",
  "Can I get a loan without collateral for ₹50L?",
  "What is the CSIS government subsidy scheme?",
  "How does pre-visa vs post-visa disbursement work?",
  "What documents do I need for an education loan?",
]

function getApiConfig() {
  const stored = localStorage.getItem("loanmatters_api_config")
  if (stored) {
    const cfg = JSON.parse(stored)
    return {
      apiKey: cfg.aiApiKey || cfg.apiKey || "",
      provider: cfg.aiProvider || cfg.provider || "openai",
      tavilyApiKey: cfg.tavilyApiKey || "",
    }
  }
  const nvidiaKey = localStorage.getItem("nvidia_api_key")
  return { apiKey: nvidiaKey || "", provider: "nvidia", tavilyApiKey: "" }
}

export function AskAI() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useWebSearch, setUseWebSearch] = useState(true)
  const [useKB, setUseKB] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim()
    if (!text || isLoading) return

    const { apiKey, provider, tavilyApiKey } = getApiConfig()
    if (!apiKey) {
      setError("No AI API key configured. Please go to Settings and add your API key.")
      return
    }

    const userMsg: Message = { role: "user", content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)
    setError(null)

    // Show searching indicator
    if (useWebSearch && tavilyApiKey) {
      setIsSearching(true)
      setMessages((prev) => [...prev, { role: "assistant", content: "", isSearching: true }])
    }

    try {
      let response: string
      let webSources: SearchResult[] = []
      let kbDocsUsed: string[] = []
      let hasKBContext = false

      if (useKB) {
        // Use KB-grounded endpoint
        setIsSearching(false)
        setMessages((prev) => prev.filter((m) => !m.isSearching))

        const conversationMessages = newMessages.map((m) => ({ role: m.role, content: m.content }))

        const r = await fetch("/api/ask-ai-kb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: conversationMessages,
            query: text,
            apiKey,
            provider,
            tavilyApiKey: useWebSearch ? tavilyApiKey : undefined,
          }),
        })

        if (!r.ok) {
          const errData = await r.json().catch(() => ({})) as { error?: string }
          throw new Error(errData.error || `API error ${r.status}`)
        }

        const data = await r.json() as {
          response: string
          webSources: SearchResult[]
          kbDocsUsed: string[]
          hasKBContext: boolean
        }
        response = data.response
        webSources = data.webSources || []
        kbDocsUsed = data.kbDocsUsed || []
        hasKBContext = data.hasKBContext || false
      } else {
        // Fallback: direct NVIDIA call with web search
        let searchContext = ""
        if (useWebSearch && tavilyApiKey) {
          try {
            const searchRes = await fetch("/api/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: `${text} education loan India students abroad`, searchDepth: "advanced", maxResults: 5, tavilyApiKey }),
            })
            if (searchRes.ok) {
              const sd = await searchRes.json() as { answer?: string; results?: SearchResult[] }
              webSources = sd.results?.slice(0, 3) || []
              if (sd.answer || webSources.length > 0) {
                searchContext = `\n\nWeb search context:\nSummary: ${sd.answer || ""}\n\nSources:\n${webSources.map((r, i) => `[${i + 1}] ${r.title}: ${r.content?.slice(0, 200) || ""}`).join("\n")}`
              }
            }
          } catch { /* ignore */ }
        }

        setIsSearching(false)
        setMessages((prev) => prev.filter((m) => !m.isSearching))

        const conversationHistory = newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
        const fullHistory = conversationHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
        const userMessage = fullHistory ? `${fullHistory}\n\nCurrent question: ${text}${searchContext}` : text + searchContext

        const aiRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemma-3-27b-it",
            messages: [{ role: "system", content: KNOWLEDGE_BASE_SYSTEM }, { role: "user", content: userMessage }],
            temperature: 0.4,
            max_tokens: 1500,
          }),
        })
        if (!aiRes.ok) {
          const errData = await aiRes.json().catch(() => ({})) as { error?: { message: string } }
          throw new Error(errData.error?.message || `AI error ${aiRes.status}`)
        }
        const aiData = await aiRes.json() as { choices: { message: { content: string } }[] }
        response = aiData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: response,
        sources: webSources,
        kbDocsUsed,
        hasKBContext,
      }
      setMessages((prev) => [...prev.filter((m) => !m.isSearching), assistantMsg])
    } catch (err) {
      setMessages((prev) => prev.filter((m) => !m.isSearching))
      setError(err instanceof Error ? err.message : "Failed to get a response. Check your API key in Settings.")
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ask AI</h2>
        <p className="text-gray-500 text-sm mt-1">
          Grounded in our education loan knowledge base · Optionally enhanced with real-time web search
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 560 }}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-bold text-gray-800">LoanMatters AI</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseKB(!useKB)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                useKB ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-100 text-gray-500 border-gray-200"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              KB {useKB ? "ON" : "OFF"}
            </button>
            <button
              onClick={() => setUseWebSearch(!useWebSearch)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                useWebSearch ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              Web {useWebSearch ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">KB-Grounded Loan Intelligence</p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Answers use our curated knowledge base with verified lender data — not just the internet
                </p>
              </div>
              {useKB && (
                <div className="flex flex-wrap justify-center gap-2 text-xs">
                  {["SBI", "HDFC Credila", "Avanse", "Auxilo", "CSIS", "80E", "No-collateral"].map((tag) => (
                    <span key={tag} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100 font-medium">{tag}</span>
                  ))}
                </div>
              )}
              <div className="w-full max-w-md space-y-2 mt-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Try asking:</p>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="w-full text-left px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-sm text-gray-600 hover:text-blue-700 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.filter((m) => !m.isSearching).map((msg, i) => (
                <div key={i} className="space-y-2">
                  <div className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    )}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.hasKBContext && msg.role === "assistant" && (
                        <p className="text-[10px] text-indigo-500 mt-2 flex items-center gap-1 font-medium">
                          <BookOpen className="w-3 h-3" /> Grounded in LoanMatters KB
                        </p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="ml-11 space-y-1">
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Web sources:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.slice(0, 3).map((src, j) => (
                          <a key={j} href={src.url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            {(src.title || "").slice(0, 35)}{(src.title || "").length > 35 ? "…" : ""}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isSearching && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Search className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    <span className="text-sm text-green-700">Searching web...</span>
                  </div>
                </div>
              )}
              {isLoading && !isSearching && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Generating response...</span>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Ask about loans, rates, eligibility, countries..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-400 text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors disabled:opacity-60"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {useKB ? "Answers grounded in LoanMatters KB" : "Using AI without KB"} ·{" "}
            {useWebSearch ? "Live web data enabled" : "Web search disabled"} ·{" "}
            Verify rates with lenders before applying
          </p>
        </div>
      </div>
    </div>
  )
}
