

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Calculator, GraduationCap, Plane, Home, FileText, Sparkles, Globe, RefreshCw, ExternalLink, Loader2 } from "lucide-react"
import { countries, fields, universityCosts, formatCurrency } from "@/lib/data"
import { IMAGES } from "@/lib/images"

const CHART_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]

interface WebInsight {
  answer: string | null
  results: { title: string; url: string; snippet: string }[]
  query: string
}

export function CostEstimator() {
  const [country, setCountry] = useState<string>("")
  const [field, setField] = useState<string>("")
  const [university, setUniversity] = useState<string>("")
  const [duration, setDuration] = useState<string>("2")
  const [result, setResult] = useState<{
    breakdown: { name: string; value: number; icon: React.ComponentType<{ className?: string }> }[]
    total: number
    scholarship: number
    loanRequired: number
  } | null>(null)
  
  const [webInsight, setWebInsight] = useState<WebInsight | null>(null)
  const [isLoadingWeb, setIsLoadingWeb] = useState(false)
  const [showWebData, setShowWebData] = useState(true)

  const fetchWebData = async () => {
    if (!country || !field) return
    
    setIsLoadingWeb(true)
    try {
      const storedConfig = localStorage.getItem("loanmatters_api_config")
      const tavilyApiKey = storedConfig ? JSON.parse(storedConfig).tavilyApiKey : undefined
      const response = await fetch("/api/university-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, field, university, tavilyApiKey }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setWebInsight(data)
      }
    } catch (error) {
      console.error("Failed to fetch web data:", error)
    } finally {
      setIsLoadingWeb(false)
    }
  }

  const handleCalculate = async () => {
    if (!country || !field) return

    const costs = universityCosts[country]?.[field]
    if (!costs) return

    const years = parseInt(duration) || 2
    const breakdown = [
      { name: "Tuition", value: costs.tuition * years, icon: GraduationCap },
      { name: "Living", value: costs.living * years, icon: Home },
      { name: "Visa", value: costs.visa, icon: FileText },
      { name: "Travel", value: costs.travel * years, icon: Plane },
      { name: "Misc", value: costs.misc * years, icon: Sparkles },
    ]

    const total = breakdown.reduce((sum, item) => sum + item.value, 0)
    const scholarship = costs.scholarshipAvg * years

    setResult({
      breakdown,
      total,
      scholarship,
      loanRequired: total - scholarship,
    })

    // Fetch real-time web data
    if (showWebData) {
      await fetchWebData()
    }
  }

  const chartData = result?.breakdown.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-slide-up">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-foreground mb-2">
          University + Course Cost Estimator
        </h2>
        <p className="text-muted-foreground">
          Get an itemized cost breakdown for your international STEM degree
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-card-foreground">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Enter Details
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWebData(!showWebData)}
                className={showWebData ? "text-primary" : "text-muted-foreground"}
              >
                <Globe className="w-4 h-4 mr-1" />
                Live Data {showWebData ? "On" : "Off"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-card-foreground">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country" className="bg-white border-gray-200 text-card-foreground">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university" className="text-card-foreground">University Name (Optional)</Label>
              <Input
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g., MIT, Stanford, Oxford"
                className="bg-white border-gray-200 text-card-foreground placeholder:text-gray-400"
              />
              {showWebData && (
                <p className="text-xs text-muted-foreground">Enter a specific university for more accurate real-time data</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="field" className="text-card-foreground">Course / Major</Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger id="field" className="bg-white border-gray-200 text-card-foreground">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-card-foreground">Duration (Years)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration" className="bg-white border-gray-200 text-card-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Year</SelectItem>
                  <SelectItem value="2">2 Years</SelectItem>
                  <SelectItem value="3">3 Years</SelectItem>
                  <SelectItem value="4">4 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCalculate} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!country || !field || isLoadingWeb}
            >
              {isLoadingWeb ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Live Data...
                </>
              ) : (
                "Calculate Costs"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-200">
            <CardHeader>
              <CardTitle className="text-card-foreground">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} stroke="#64748B" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={12} width={60} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        color: '#0F172A'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Estimated Cost</span>
                  <span className="font-semibold text-card-foreground">{formatCurrency(result.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Scholarship Available</span>
                  <span className="font-semibold text-success">{formatCurrency(result.scholarship)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-medium text-card-foreground">Loan Required</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(result.loanRequired)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!result && (
          <Card className="bg-card/50 border-2 border-dashed border-gray-200 opacity-0 animate-fade-slide-up animation-delay-200 overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 relative">
              <div className="absolute inset-0 opacity-20">
                <img src={IMAGES.calculator} alt="Calculator illustration" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10">
                <Calculator className="w-12 h-12 mb-4 mx-auto" />
                <p className="text-center">Fill in the details and click calculate to see your cost breakdown</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Real-time Web Insights */}
      {webInsight && showWebData && (
        <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20 shadow-xl opacity-0 animate-fade-slide-up animation-delay-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-card-foreground">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Real-Time Market Data
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchWebData}
                disabled={isLoadingWeb}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingWeb ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webInsight.answer && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <h4 className="font-medium text-foreground mb-2">AI Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{webInsight.answer}</p>
              </div>
            )}
            
            {webInsight.results.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3">Sources</h4>
                <div className="grid gap-2">
                  {webInsight.results.slice(0, 3).map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {source.title}
                          </h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.snippet}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
