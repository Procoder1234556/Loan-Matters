import { useState, useRef, useEffect } from "react"
import { Bot, User, Send, Loader2, Sparkles, RotateCcw, CheckCircle2, AlertCircle, Globe, ExternalLink, ChevronRight, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  isTyping?: boolean
  isFinal?: boolean
}

interface UserProfile {
  country: string | null
  course: string | null
  universityTier: string | null
  loanAmountLakhs: number | null
  collateralAvailable: boolean | null
  familyIncomeLPA: number | null
  collegeBackground: string | null
  needsPreVisa: boolean | null
}

const STARTER_PROMPTS = [
  "I'm going to USA for MS in CS, need ₹40L, no collateral",
  "Comparing SBI vs HDFC Credila for UK MBA — which is better?",
  "I'm an IITian going to Germany, which lender suits me?",
  "Need ₹25L for Canada MS, family income ₹6L/year",
]

const PROFILE_LABELS: Partial<Record<keyof UserProfile, string>> = {
  country: "Country",
  course: "Degree",
  universityTier: "University Tier",
  loanAmountLakhs: "Loan Amount",
  collateralAvailable: "Collateral",
  collegeBackground: "Background",
}

function ProfileTag({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
      <CheckCircle2 className="w-3 h-3" />
      {label}: {value}
    </span>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "bg-blue-600 text-white rounded-br-md"
          : message.isFinal
          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-gray-800 rounded-bl-md"
          : "bg-gray-100 text-gray-800 rounded-bl-md"
      )}>
        {message.isTyping ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  )
}

export function CompareAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(() => { scrollToBottom() }, [messages])

  const getConfig = () => {
    const stored = localStorage.getItem("loanmatters_api_config")
    if (stored) {
      const cfg = JSON.parse(stored)
      return { apiKey: cfg.aiApiKey || cfg.apiKey, provider: cfg.aiProvider || cfg.provider || "openai" }
    }
    // Try nvidia key fallback
    const nvidiaKey = localStorage.getItem("nvidia_api_key")
    return { apiKey: nvidiaKey || "", provider: "nvidia" }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    setError(null)

    const { apiKey, provider } = getConfig()
    if (!apiKey) {
      setError("No AI API key found. Please configure your API key in Settings.")
      return
    }

    const userMsg: Message = { role: "user", content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    // Show typing indicator
    setMessages((prev) => [...prev, { role: "assistant", content: "", isTyping: true }])

    try {
      const conversationMessages = newMessages.map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch("/api/compare-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationMessages,
          apiKey,
          provider,
          questionsAsked,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error || `API error ${response.status}`)
      }

      const data = await response.json() as {
        response: string
        needsMoreInfo: boolean
        userProfile: UserProfile
        questionsAsked: number
      }

      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => !m.isTyping))

      const assistantMsg: Message = {
        role: "assistant",
        content: data.response || "",
        isFinal: !data.needsMoreInfo,
      }
      setMessages((prev) => [...prev, assistantMsg])
      setQuestionsAsked(data.questionsAsked)
      if (data.userProfile) setUserProfile(data.userProfile)
    } catch (err) {
      setMessages((prev) => prev.filter((m) => !m.isTyping))
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput("")
    setQuestionsAsked(0)
    setUserProfile(null)
    setError(null)
  }

  const profileEntries = userProfile
    ? Object.entries(userProfile)
        .filter(([k, v]) => v !== null && PROFILE_LABELS[k as keyof UserProfile])
        .map(([k, v]) => ({
          label: PROFILE_LABELS[k as keyof UserProfile]!,
          value: typeof v === "boolean" ? (v ? "Yes" : "No") : k === "loanAmountLakhs" ? `₹${v}L` : String(v),
        }))
    : []

  const hasMessages = messages.length > 0

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          Loan Advisor AI
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Tell me about your situation — I'll ask a couple of questions and recommend the best lenders for you
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Chat Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 540 }}>
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">LoanMatters CompareAgent</p>
                <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                  Knowledge base powered · {questionsAsked === 0 ? "Ready" : `${questionsAsked} question${questionsAsked > 1 ? "s" : ""} asked`}
                </p>
              </div>
            </div>
            {hasMessages && (
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Start over
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!hasMessages ? (
              <div className="h-full flex flex-col items-center justify-center gap-5 text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <IndianRupee className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 mb-1.5">Tell me about your loan needs</p>
                  <p className="text-sm text-gray-500 max-w-xs">
                    I'll ask you 1–2 questions, check our knowledge base, and recommend the best lenders for your profile
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Try one of these:</p>
                  {STARTER_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(prompt)}
                      className="w-full text-left px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-100 text-sm text-gray-600 hover:text-blue-700 transition-all flex items-center justify-between group"
                    >
                      <span>{prompt}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
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
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                placeholder="e.g. I need ₹50L for MS in USA, IIT background..."
                disabled={isLoading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors disabled:opacity-60"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Profile + How it works */}
        <div className="space-y-4">
          {/* Detected Profile */}
          {profileEntries.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Profile (detected)</p>
              <div className="flex flex-wrap gap-2">
                {profileEntries.map((e, i) => (
                  <ProfileTag key={i} label={e.label} value={e.value} />
                ))}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> How CompareAgent works
            </p>
            <div className="space-y-3">
              {[
                { step: "1", title: "You describe your situation", desc: "Country, degree, loan amount, collateral..." },
                { step: "2", title: "Agent asks 1–2 questions", desc: "Only if needed to give a good recommendation" },
                { step: "3", title: "KB-grounded recommendation", desc: "Top 3 lenders with specific pros, cons, and action steps" },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-800">{item.title}</p>
                    <p className="text-xs text-blue-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Base badge */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Powered by</p>
            <div className="space-y-2">
              {[
                { icon: Globe, label: "12 KB docs on Indian lenders" },
                { icon: IndianRupee, label: "SBI, HDFC Credila, Avanse, Auxilo, BoB, MPOWER" },
                { icon: CheckCircle2, label: "PSU vs NBFC guide, CSIS subsidy, 80E tax" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <item.icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  {item.label}
                </div>
              ))}
            </div>
            <a
              href="https://www.paisabazaar.com/education-loan/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
            >
              <ExternalLink className="w-3 h-3" /> Also check PaisaBazaar rates
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
