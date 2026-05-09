

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Key, Bot, User, Loader2, AlertCircle, Eye, EyeOff, Globe, ExternalLink, Search } from "lucide-react"
import { cn } from "@/lib/utils"
// Image replaced with img
import { IMAGES } from "@/lib/images"

type SearchResult = {
  title: string
  url: string
  content: string
}

type Message = {
  role: "user" | "assistant"
  content: string
  sources?: SearchResult[]
  isSearching?: boolean
}

const SYSTEM_PROMPT = `You are LoanMatters AI, an expert assistant for Indian STEM students planning to study abroad. You help them understand education loan costs, ROI, and compare international universities.

You have access to real-time web search data. When provided with search results, use them to give accurate, up-to-date information. Always cite your sources when using search data.

Key guidelines:
1. Be concise but comprehensive
2. Use specific numbers and cite sources when available
3. Acknowledge limitations in data
4. Never recommend a specific lender - present facts neutrally
5. When you have search results, prioritize the most recent and authoritative sources
6. Always mention if information might be outdated and suggest verifying with official sources`

const SUGGESTED_QUESTIONS = [
  "What are the latest education loan interest rates in India 2024?",
  "What's the best country for an MS in Computer Science considering ROI?",
  "Compare SBI and HDFC Credila education loans",
  "What are the living costs for students in Germany 2024?",
]

export function AskAI() {
  const [apiKey, setApiKey] = useState<string>("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isApiKeySet, setIsApiKeySet] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useWebSearch, setUseWebSearch] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedKey = localStorage.getItem("nvidia_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      setIsApiKeySet(true)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("nvidia_api_key", apiKey.trim())
      setIsApiKeySet(true)
      setError(null)
    }
  }

  const handleClearApiKey = () => {
    localStorage.removeItem("nvidia_api_key")
    setApiKey("")
    setIsApiKeySet(false)
    setMessages([])
  }

  const searchWeb = async (query: string): Promise<{ answer: string; results: SearchResult[] } | null> => {
    try {
      const storedConfig = localStorage.getItem("loanmatters_api_config")
      const tavilyApiKey = storedConfig ? JSON.parse(storedConfig).tavilyApiKey : undefined
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${query} education loan study abroad India students`,
          searchDepth: "advanced",
          maxResults: 5,
          tavilyApiKey,
        }),
      })

      if (!response.ok) return null

      const data = await response.json()
      return {
        answer: data.answer || "",
        results: data.results || [],
      }
    } catch {
      return null
    }
  }

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    if (!textToSend || isLoading) return

    const userMessage: Message = { role: "user", content: textToSend }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    let searchData: { answer: string; results: SearchResult[] } | null = null

    // Perform web search if enabled
    if (useWebSearch) {
      setIsSearching(true)
      setMessages((prev) => [...prev, { role: "assistant", content: "", isSearching: true }])
      searchData = await searchWeb(textToSend)
      setIsSearching(false)
      // Remove the searching placeholder
      setMessages((prev) => prev.filter((m) => !m.isSearching))
    }

    try {
      // Build context from search results
      let searchContext = ""
      if (searchData && searchData.results.length > 0) {
        searchContext = `\n\nReal-time web search results for context:\n\nSummary: ${searchData.answer}\n\nSources:\n`
        searchData.results.forEach((result, i) => {
          searchContext += `\n[${i + 1}] ${result.title}\nURL: ${result.url}\nContent: ${result.content}\n`
        })
        searchContext += "\n\nPlease use this information to provide an accurate, up-to-date response. Cite sources when applicable."
      }

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemma-3-27b-it",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.filter(m => !m.isSearching).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: textToSend + searchContext },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.",
        sources: searchData?.results,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response. Please check your API key and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-slide-up">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-foreground mb-2">
          Ask AI
        </h2>
        <p className="text-muted-foreground">
          Get real-time answers powered by Tavily search and Gemma AI
        </p>
      </div>

      {!isApiKeySet ? (
        <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Key className="w-5 h-5 text-primary" />
              Setup Nvidia API Key
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              To use the AI assistant, you need to provide your Nvidia NIM API key. 
              Get one free at{" "}
              <a 
                href="https://build.nvidia.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                build.nvidia.com
              </a>
            </p>
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-card-foreground">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="nvapi-..."
                    className="bg-white border-gray-200 text-card-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveApiKey} disabled={!apiKey.trim()}>
                  Save Key
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-100">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Chat with LoanMatters AI
                </CardTitle>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setUseWebSearch(!useWebSearch)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                      useWebSearch 
                        ? "bg-success/10 text-success" 
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    <Globe className="w-4 h-4" />
                    Web Search {useWebSearch ? "ON" : "OFF"}
                  </button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearApiKey}
                    className="text-gray-500 hover:text-destructive"
                  >
                    <Key className="w-4 h-4 mr-1" />
                    Change Key
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[450px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <img src={IMAGES.ai} alt="AI illustration" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="relative mb-4">
                        <Bot className="w-12 h-12" />
                        {useWebSearch && (
                          <Globe className="w-5 h-5 text-success absolute -top-1 -right-1" />
                        )}
                      </div>
                      <p className="text-center mb-2">Ask me anything about education loans, costs, or ROI</p>
                      {useWebSearch && (
                        <p className="text-xs text-success mb-6">Real-time web search enabled</p>
                      )}
                      
                      <div className="w-full max-w-lg space-y-2">
                        <p className="text-xs text-gray-500 text-center mb-2">Try asking:</p>
                        {SUGGESTED_QUESTIONS.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(question)}
                            className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.filter(m => !m.isSearching).map((message, index) => (
                    <div key={index}>
                      <div
                        className={cn(
                          "flex gap-3",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-gray-100 text-card-foreground rounded-bl-md"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="ml-11 mt-2">
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Sources from web search:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.slice(0, 3).map((source, i) => (
                              <a
                                key={i}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {source.title.length > 30 ? source.title.slice(0, 30) + "..." : source.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                
                {isSearching && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Search className="w-4 h-4 text-success" />
                    </div>
                    <div className="bg-success/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-success" />
                      <span className="text-sm text-success">Searching the web...</span>
                    </div>
                  </div>
                )}
                
                {isLoading && !isSearching && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-gray-500">Generating response...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about loans, costs, ROI..."
                    className="min-h-[44px] max-h-32 resize-none bg-white border-gray-200 text-card-foreground"
                    rows={1}
                  />
                  <Button 
                    onClick={() => handleSendMessage()} 
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20 opacity-0 animate-fade-slide-up animation-delay-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Bot className="w-6 h-6 text-primary mt-1" />
                  <Globe className="w-3 h-3 text-success absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Real-Time AI + Web Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Powered by <span className="font-medium text-success">Tavily Search</span> for real-time web data 
                    and <span className="font-medium text-primary">Google Gemma 3</span> via Nvidia NIM for intelligent responses. 
                    Toggle web search on/off based on your query type.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
