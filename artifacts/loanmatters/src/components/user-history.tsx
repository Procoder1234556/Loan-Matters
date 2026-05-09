

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  History, 
  Calculator, 
  TrendingUp, 
  Scale, 
  MessageSquare, 
  Trash2, 
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { formatDistanceToNow } from "@/lib/utils"

interface HistoryItem {
  id: string
  action_type: string
  action_data: Record<string, unknown>
  created_at: string
}

const ACTION_ICONS: Record<string, typeof Calculator> = {
  cost_estimate: Calculator,
  roi_calculation: TrendingUp,
  loan_comparison: Scale,
  ai_chat: MessageSquare,
}

const ACTION_LABELS: Record<string, string> = {
  cost_estimate: "Cost Estimate",
  roi_calculation: "ROI Calculation",
  loan_comparison: "Loan Comparison",
  ai_chat: "AI Chat",
}

const ACTION_COLORS: Record<string, string> = {
  cost_estimate: "bg-blue-100 text-blue-700",
  roi_calculation: "bg-green-100 text-green-700",
  loan_comparison: "bg-purple-100 text-purple-700",
  ai_chat: "bg-orange-100 text-orange-700",
}

export function UserHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!user) return
    
    try {
      const res = await fetch("/api/history")
      const data = await res.json()
      if (data.history) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/history?id=${id}`, { method: "DELETE" })
      setHistory(history.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  const clearAll = async () => {
    if (!confirm("Clear all history?")) return
    try {
      await fetch("/api/history", { method: "DELETE" })
      setHistory([])
    } catch (error) {
      console.error("Failed to clear:", error)
    }
  }

  if (!user) return null

  const displayedHistory = expanded ? history : history.slice(0, 5)

  return (
    <Card className="opacity-0 animate-fade-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Your History
          </CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No history yet. Start using the tools!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedHistory.map((item) => {
              const Icon = ACTION_ICONS[item.action_type] || History
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ACTION_COLORS[item.action_type] || "bg-gray-100"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {ACTION_LABELS[item.action_type] || item.action_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formatHistoryData(item.action_type, item.action_data)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              )
            })}

            {history.length > 5 && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show {history.length - 5} more
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatHistoryData(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "cost_estimate":
      return `${data.country || "Unknown"} - ${data.field || "Unknown"} (${data.duration || 0} years)`
    case "roi_calculation":
      return `Loan: ${data.loanAmount ? `₹${Number(data.loanAmount).toLocaleString()}` : "N/A"} at ${data.interestRate || 0}% for ${data.tenure || 0} years`
    case "loan_comparison":
      return `Compared ${(data.providers as string[])?.length || 0} lenders`
    case "ai_chat":
      return String(data.query || "Chat conversation")
    default:
      return JSON.stringify(data).slice(0, 100)
  }
}
