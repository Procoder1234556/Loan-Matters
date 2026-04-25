"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingUp, Wallet, Clock, Target, DollarSign, Globe, RefreshCw, ExternalLink, Loader2 } from "lucide-react"
import Image from "next/image"
import { countries, fields, salaryEstimates, calculateEMI, calculateBreakeven, formatCurrency } from "@/lib/data"
import { IMAGES } from "@/lib/images"

interface WebInsight {
  answer: string | null
  results: { title: string; url: string; snippet: string }[]
  query: string
}

export function ROICalculator() {
  const [loanAmount, setLoanAmount] = useState<string>("3000000")
  const [interestRate, setInterestRate] = useState<string>("10")
  const [tenure, setTenure] = useState<string>("10")
  const [country, setCountry] = useState<string>("")
  const [field, setField] = useState<string>("")
  const [result, setResult] = useState<{
    emi: number
    totalRepayment: number
    totalInterest: number
    breakeven: number
    salary: { min: number; max: number; median: number }
    chartData: { month: number; paid: number; principal: number }[]
  } | null>(null)

  const [salaryInsight, setSalaryInsight] = useState<WebInsight | null>(null)
  const [isLoadingWeb, setIsLoadingWeb] = useState(false)
  const [showWebData, setShowWebData] = useState(true)

  const fetchSalaryData = async () => {
    if (!country || !field) return
    
    setIsLoadingWeb(true)
    try {
      const response = await fetch("/api/salary-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, field }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setSalaryInsight(data)
      }
    } catch (error) {
      console.error("Failed to fetch salary data:", error)
    } finally {
      setIsLoadingWeb(false)
    }
  }

  const handleCalculate = async () => {
    const principal = parseInt(loanAmount) || 0
    const rate = parseFloat(interestRate) || 0
    const tenureYears = parseInt(tenure) || 0
    const tenureMonths = tenureYears * 12

    if (!principal || !rate || !tenureMonths || !country || !field) return

    const emi = calculateEMI(principal, rate, tenureMonths)
    const totalRepayment = emi * tenureMonths
    const totalInterest = totalRepayment - principal

    const salary = salaryEstimates[country]?.[field]
    if (!salary) return

    const breakeven = calculateBreakeven(totalRepayment, salary.median)

    // Generate chart data for repayment curve
    const chartData: { month: number; paid: number; principal: number }[] = []
    let remainingPrincipal = principal
    let totalPaid = 0
    const monthlyRate = rate / 12 / 100

    for (let month = 0; month <= tenureMonths; month += Math.max(1, Math.floor(tenureMonths / 24))) {
      chartData.push({
        month,
        paid: totalPaid,
        principal: Math.max(0, remainingPrincipal),
      })

      // Calculate for next data point
      const monthsToJump = Math.max(1, Math.floor(tenureMonths / 24))
      for (let i = 0; i < monthsToJump && month + i < tenureMonths; i++) {
        const interestPayment = remainingPrincipal * monthlyRate
        const principalPayment = emi - interestPayment
        remainingPrincipal -= principalPayment
        totalPaid += emi
      }
    }

    setResult({
      emi,
      totalRepayment,
      totalInterest,
      breakeven,
      salary,
      chartData,
    })

    // Fetch real-time salary data
    if (showWebData) {
      await fetchSalaryData()
    }
  }

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-slide-up">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-foreground mb-2">
          Loan ROI Calculator
        </h2>
        <p className="text-muted-foreground">
          Calculate EMI, total repayment, and break-even point for your education loan
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-card-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Loan Details
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWebData(!showWebData)}
                className={showWebData ? "text-primary" : "text-muted-foreground"}
              >
                <Globe className="w-4 h-4 mr-1" />
                Live Salary {showWebData ? "On" : "Off"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loan-amount" className="text-card-foreground">Loan Amount (INR)</Label>
              <Input
                id="loan-amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="e.g., 3000000"
                className="bg-white border-gray-200 text-card-foreground placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest-rate" className="text-card-foreground">Interest Rate (%)</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="e.g., 10"
                  className="bg-white border-gray-200 text-card-foreground placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure" className="text-card-foreground">Tenure (Years)</Label>
                <Select value={tenure} onValueChange={setTenure}>
                  <SelectTrigger id="tenure" className="bg-white border-gray-200 text-card-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 7, 10, 12, 15].map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y} Years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">For salary projection:</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roi-country" className="text-card-foreground">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="roi-country" className="bg-white border-gray-200 text-card-foreground">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roi-field" className="text-card-foreground">Field</Label>
                  <Select value={field} onValueChange={setField}>
                    <SelectTrigger id="roi-field" className="bg-white border-gray-200 text-card-foreground">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCalculate} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!loanAmount || !interestRate || !tenure || !country || !field || isLoadingWeb}
            >
              {isLoadingWeb ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Salary Data...
                </>
              ) : (
                "Calculate ROI"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly EMI</p>
                      <p className="text-xl font-bold text-card-foreground">{formatCurrency(result.emi)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <DollarSign className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Repayment</p>
                      <p className="text-xl font-bold text-card-foreground">{formatCurrency(result.totalRepayment)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <Clock className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Interest</p>
                      <p className="text-xl font-bold text-card-foreground">{formatCurrency(result.totalInterest)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Target className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Break-even</p>
                      <p className="text-xl font-bold text-card-foreground">{result.breakeven} months</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-300">
              <CardHeader>
                <CardTitle className="text-card-foreground">Repayment Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={12} label={{ value: 'Months', position: 'bottom', fill: '#64748B' }} />
                      <YAxis stroke="#64748B" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [formatCurrency(value), name === 'paid' ? 'Total Paid' : 'Remaining Principal']}
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          color: '#0F172A'
                        }}
                      />
                      <Line type="monotone" dataKey="paid" stroke="#2563EB" strokeWidth={2} dot={false} name="Total Paid" />
                      <Line type="monotone" dataKey="principal" stroke="#10B981" strokeWidth={2} dot={false} name="Remaining Principal" />
                      <ReferenceLine y={result.totalRepayment} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: 'Total', fill: '#F59E0B', fontSize: 12 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Salary Projection */}
            <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-300">
              <CardHeader>
                <CardTitle className="text-card-foreground">Projected Salary Range ({field} in {country})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Minimum</p>
                    <p className="text-lg font-semibold text-card-foreground">{formatCurrency(result.salary.min)}/yr</p>
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full relative">
                    <div 
                      className="absolute left-0 h-full bg-gradient-to-r from-warning via-success to-success rounded-full"
                      style={{ width: '100%' }}
                    />
                    <div 
                      className="absolute h-5 w-1 bg-primary -top-1 rounded"
                      style={{ left: '50%', transform: 'translateX(-50%)' }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Maximum</p>
                    <p className="text-lg font-semibold text-card-foreground">{formatCurrency(result.salary.max)}/yr</p>
                  </div>
                </div>
                <p className="text-center mt-3 text-primary font-medium">
                  Median: {formatCurrency(result.salary.median)}/yr
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && (
          <Card className="bg-card/50 border-2 border-dashed border-gray-200 opacity-0 animate-fade-slide-up animation-delay-200 overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 relative">
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={IMAGES.chart}
                  alt="Stick figure climbing chart"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative z-10">
                <TrendingUp className="w-12 h-12 mb-4 mx-auto" />
                <p className="text-center">Enter your loan details to see EMI, total repayment, and break-even analysis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Real-time Salary Insights */}
      {salaryInsight && showWebData && result && (
        <Card className="bg-gradient-to-br from-success/5 to-primary/5 border-success/20 shadow-xl opacity-0 animate-fade-slide-up animation-delay-400">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-card-foreground">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-success" />
                Real-Time Salary Data ({field} in {country})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSalaryData}
                disabled={isLoadingWeb}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingWeb ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salaryInsight.answer && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <h4 className="font-medium text-foreground mb-2">Current Market Insights</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{salaryInsight.answer}</p>
              </div>
            )}
            
            {salaryInsight.results.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-3">Sources</h4>
                <div className="grid gap-2">
                  {salaryInsight.results.slice(0, 3).map((source, i) => (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:border-success/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-foreground truncate group-hover:text-success transition-colors">
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
