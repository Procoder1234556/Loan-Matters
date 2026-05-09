"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Scale, Check, Star, Info, ChevronDown, ChevronUp, Globe, RefreshCw, ExternalLink, Loader2 } from "lucide-react"
import { loanProviders, formatCurrency } from "@/lib/data"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { IMAGES } from "@/lib/images"

type RealTimeData = {
  answer: string
  sources: { title: string; url: string; snippet: string }[]
  lastUpdated: string
}

export function LoanComparison() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    loanProviders.slice(0, 3).map((p) => p.id)
  )
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  const [showRealTimePanel, setShowRealTimePanel] = useState(false)

  const fetchRealTimeRates = async () => {
    setIsLoadingRates(true)
    try {
      const response = await fetch("/api/loan-rates")
      if (response.ok) {
        const data = await response.json()
        if (!data.useStatic) {
          setRealTimeData(data)
          setShowRealTimePanel(true)
        }
      }
    } catch (error) {
      console.error("Failed to fetch real-time rates:", error)
    } finally {
      setIsLoadingRates(false)
    }
  }

  useEffect(() => {
    fetchRealTimeRates()
  }, [])

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id)
      }
      if (prev.length >= 5) {
        return prev
      }
      return [...prev, id]
    })
  }

  const selectedLoans = loanProviders.filter((p) => selectedProviders.includes(p.id))
  const bestOption = selectedLoans.reduce((best, current) => 
    current.interestRate < best.interestRate ? current : best
  , selectedLoans[0])

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-slide-up">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-foreground mb-2">
          Bias-Free Loan Comparison
        </h2>
        <p className="text-muted-foreground">
          Compare education loan options from top Indian banks and NBFCs side by side
        </p>
      </div>

      {/* Real-Time Market Data Panel */}
      {showRealTimePanel && realTimeData && (
        <Card className="bg-gradient-to-r from-success/5 to-primary/5 border-success/20 opacity-0 animate-fade-slide-up animation-delay-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-card-foreground text-base">
                <Globe className="w-5 h-5 text-success" />
                Real-Time Market Data
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Updated: {new Date(realTimeData.lastUpdated).toLocaleTimeString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchRealTimeRates}
                  disabled={isLoadingRates}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={cn("w-4 h-4", isLoadingRates && "animate-spin")} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {realTimeData.answer && (
              <p className="text-sm text-card-foreground leading-relaxed">
                {realTimeData.answer}
              </p>
            )}
            {realTimeData.sources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {realTimeData.sources.slice(0, 4).map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/50 hover:bg-white text-xs text-gray-600 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {source.title.length > 25 ? source.title.slice(0, 25) + "..." : source.title}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoadingRates && !realTimeData && (
        <Card className="bg-card border-0 shadow-lg opacity-0 animate-fade-slide-up animation-delay-50">
          <CardContent className="flex items-center justify-center py-6 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Fetching latest market rates...</span>
          </CardContent>
        </Card>
      )}

      {/* Provider Selection */}
      <Card className="bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up animation-delay-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Scale className="w-5 h-5 text-primary" />
            Select Lenders to Compare (Max 5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {loanProviders.map((provider) => (
              <Label
                key={provider.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all",
                  selectedProviders.includes(provider.id)
                    ? "border-primary bg-primary/5 text-card-foreground"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Checkbox
                  checked={selectedProviders.includes(provider.id)}
                  onCheckedChange={() => toggleProvider(provider.id)}
                  disabled={!selectedProviders.includes(provider.id) && selectedProviders.length >= 5}
                />
                <span className="text-sm font-medium">{provider.name}</span>
                {provider.recommended && (
                  <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                    Popular
                  </Badge>
                )}
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedLoans.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {selectedLoans.map((loan, index) => {
            const isBest = loan.id === bestOption?.id
            const isExpanded = expandedProvider === loan.id

            return (
              <Card 
                key={loan.id} 
                className={cn(
                  "bg-card border-0 shadow-xl opacity-0 animate-fade-slide-up relative overflow-hidden",
                  isBest && "ring-2 ring-success"
                )}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {isBest && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-success text-success-foreground">
                      <Star className="w-3 h-3 mr-1" />
                      Best Rate
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary text-sm">{loan.logo}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-card-foreground">{loan.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-500">Interest Rate</p>
                      <p className="text-lg font-bold text-card-foreground">{loan.interestRate}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-500">Max Amount</p>
                      <p className="text-lg font-bold text-card-foreground">{formatCurrency(loan.maxAmount)}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processing Fee</span>
                      <span className="text-card-foreground font-medium">{loan.processingFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Moratorium</span>
                      <span className="text-card-foreground font-medium">{loan.moratoriumPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Repayment</span>
                      <span className="text-card-foreground font-medium">{loan.repaymentTenure}</span>
                    </div>
                  </div>

                  {/* Collateral */}
                  <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-warning">Collateral</p>
                        <p className="text-xs text-gray-600">{loan.collateralRequired}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Features */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-gray-500"
                    onClick={() => setExpandedProvider(isExpanded ? null : loan.id)}
                  >
                    {isExpanded ? "Hide Features" : "Show Features"}
                    {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                  </Button>

                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      {loan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {selectedLoans.length === 0 && (
        <Card className="bg-card/50 border-2 border-dashed border-gray-200 opacity-0 animate-fade-slide-up animation-delay-200 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400 relative min-h-[300px]">
            <div className="absolute inset-0 opacity-20">
              <Image
                src={IMAGES.compare}
                alt="Stick figure comparing options"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative z-10">
              <Scale className="w-12 h-12 mb-4 mx-auto" />
              <p className="text-center">Select lenders above to compare their loan offerings</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center opacity-0 animate-fade-slide-up animation-delay-300">
        * Interest rates and terms are indicative and may vary based on your profile. Real-time data is sourced from the web and should be verified with the respective lender.
      </p>
    </div>
  )
}
