"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Grid3X3, TrendingUp, AlertTriangle, Minus, Globe, RefreshCw, ExternalLink, Loader2, X } from "lucide-react"
import { roiHeatmap, countries, heatmapFields, type ROILevel } from "@/lib/data"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { IMAGES } from "@/lib/images"

const levelConfig: Record<ROILevel, { 
  bg: string
  text: string
  border: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}> = {
  high: { 
    bg: "bg-success/20", 
    text: "text-success", 
    border: "border-success/30",
    icon: TrendingUp,
    label: "High ROI"
  },
  medium: { 
    bg: "bg-warning/20", 
    text: "text-warning", 
    border: "border-warning/30",
    icon: Minus,
    label: "Medium ROI"
  },
  low: { 
    bg: "bg-destructive/20", 
    text: "text-destructive", 
    border: "border-destructive/30",
    icon: AlertTriangle,
    label: "Low ROI"
  },
}

interface WebInsight {
  answer: string | null
  results: { title: string; url: string; snippet: string }[]
}

export function ROIHeatmap() {
  const [selectedCell, setSelectedCell] = useState<{ country: string; field: string } | null>(null)
  const [cellInsight, setCellInsight] = useState<WebInsight | null>(null)
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)

  const fetchCellInsight = async (country: string, field: string) => {
    setIsLoadingInsight(true)
    setCellInsight(null)
    
    try {
      const response = await fetch("/api/roi-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, field }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setCellInsight(data)
      }
    } catch (error) {
      console.error("Failed to fetch ROI insight:", error)
    } finally {
      setIsLoadingInsight(false)
    }
  }

  const handleCellClick = (country: string, field: string) => {
    if (selectedCell?.country === country && selectedCell?.field === field) {
      setSelectedCell(null)
      setCellInsight(null)
    } else {
      setSelectedCell({ country, field })
      fetchCellInsight(country, field)
    }
  }

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-fade-slide-up">
        <h2 className="font-[family-name:var(--font-sora)] text-2xl font-bold text-foreground mb-2">
          STEM ROI Heatmap
        </h2>
        <p className="text-muted-foreground">
          Quick visual guide to ROI by country and field combination. Click any cell for real-time insights.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 opacity-0 animate-fade-slide-up animation-delay-100">
        {(Object.entries(levelConfig) as [ROILevel, typeof levelConfig[ROILevel]][]).map(([level, config]) => {
          const Icon = config.icon
          return (
            <div key={level} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded", config.bg, "border", config.border)} />
              <Icon className={cn("w-4 h-4", config.text)} />
              <span className="text-sm text-muted-foreground">{config.label}</span>
            </div>
          )
        })}
        <div className="flex items-center gap-2 ml-auto">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Click cells for live data</span>
        </div>
      </div>

      {/* Selected Cell Insight */}
      {selectedCell && (
        <Card className="bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20 shadow-xl opacity-0 animate-fade-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-card-foreground">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span>Real-Time Insights: {selectedCell.field} in {selectedCell.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchCellInsight(selectedCell.country, selectedCell.field)}
                  disabled={isLoadingInsight}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingInsight ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCell(null)
                    setCellInsight(null)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInsight ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Searching the web for latest data...</span>
              </div>
            ) : cellInsight ? (
              <div className="space-y-4">
                {cellInsight.answer && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <h4 className="font-medium text-foreground mb-2">Market Analysis</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{cellInsight.answer}</p>
                  </div>
                )}
                
                {cellInsight.results && cellInsight.results.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {cellInsight.results.slice(0, 3).map((source, i) => (
                      <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200 hover:border-primary/50 transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-xs text-foreground truncate group-hover:text-primary transition-colors">
                              {source.title}
                            </h5>
                          </div>
                          <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Heatmap Table */}
      <Card className="bg-card border-0 shadow-xl overflow-hidden opacity-0 animate-fade-slide-up animation-delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Grid3X3 className="w-5 h-5 text-primary" />
            ROI Score Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10">
                    Country
                  </th>
                  {heatmapFields.map((field) => (
                    <th key={field} className="px-4 py-3 text-center text-sm font-semibold text-gray-600 min-w-[100px]">
                      {field}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countries.map((country, rowIndex) => (
                  <tr 
                    key={country} 
                    className={cn(
                      "border-b border-gray-100 opacity-0 animate-fade-slide-up",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    )}
                    style={{ animationDelay: `${(rowIndex + 3) * 100}ms` }}
                  >
                    <td className="px-4 py-3 font-medium text-card-foreground sticky left-0 bg-inherit z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCountryFlag(country)}</span>
                        {country}
                      </div>
                    </td>
                    {heatmapFields.map((field) => {
                      const data = roiHeatmap[country]?.[field]
                      if (!data) return <td key={field} className="px-4 py-3" />

                      const config = levelConfig[data.level]
                      const Icon = config.icon
                      const isSelected = selectedCell?.country === country && selectedCell?.field === field

                      return (
                        <td key={field} className="px-4 py-3">
                          <button
                            onClick={() => handleCellClick(country, field)}
                            className={cn(
                              "w-full flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:scale-105 cursor-pointer",
                              config.bg,
                              isSelected ? "ring-2 ring-primary ring-offset-2" : config.border
                            )}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <Icon className={cn("w-4 h-4", config.text)} />
                              <span className={cn("text-lg font-bold", config.text)}>
                                {data.score}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", config.text, config.border)}
                            >
                              {data.level.toUpperCase()}
                            </Badge>
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights with Stick Illustrations */}
      <div className="grid gap-4 md:grid-cols-3 opacity-0 animate-fade-slide-up animation-delay-300">
        <Card className="bg-success/10 border-success/20 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-24 h-24 opacity-20">
            <Image
              src={IMAGES.success}
              alt="Success illustration"
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-success mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Best Combinations</h3>
                <p className="text-sm text-muted-foreground">
                  CS/AI in USA (92), Germany (88), and Data Science in USA (88) offer the highest ROI potential.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-24 h-24 opacity-20">
            <Image
              src={IMAGES.globe}
              alt="Globe illustration"
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-start gap-3">
              <Grid3X3 className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Germany Advantage</h3>
                <p className="text-sm text-muted-foreground">
                  Germany shows consistently high ROI across all STEM fields due to minimal tuition fees.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/20 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-24 h-24 opacity-20">
            <Image
              src={IMAGES.money}
              alt="Money growth illustration"
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-warning mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Consider Carefully</h3>
                <p className="text-sm text-muted-foreground">
                  Civil Engineering in UK shows lower ROI. Factor in job market and visa policies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        * ROI scores are calculated based on average costs, expected salaries, and job market conditions. Click any cell for real-time market data.
      </p>
    </div>
  )
}

function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    USA: "🇺🇸",
    UK: "🇬🇧",
    Canada: "🇨🇦",
    Germany: "🇩🇪",
    Australia: "🇦🇺",
  }
  return flags[country] || "🌍"
}
