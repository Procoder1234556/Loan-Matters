"use client"

import { useState } from "react"
import Image from "next/image"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DownloadAppButton } from "@/components/download-app-button"
import { IMAGES } from "@/lib/images"
import { CostEstimator } from "@/components/cost-estimator"
import { ROICalculator } from "@/components/roi-calculator"
import { LoanComparison } from "@/components/loan-comparison"
import { ROIHeatmap } from "@/components/roi-heatmap"
import { AskAI } from "@/components/ask-ai"
import { ProfileAnalyzer } from "@/components/profile-analyzer"
import { ApplicationBuilder } from "@/components/application-builder"
import { LoanApplicationBuilder } from "@/components/loan-application-builder"
import { ResumeBuilder } from "@/components/resume-builder"
import { SettingsPanel } from "@/components/settings-panel"
import { UserHistory } from "@/components/user-history"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("estimator")

  const renderContent = () => {
    switch (activeTab) {
      case "estimator":
        return <CostEstimator />
      case "roi":
        return <ROICalculator />
      case "compare":
        return <LoanComparison />
      case "heatmap":
        return <ROIHeatmap />
      case "profile":
        return <ProfileAnalyzer />
      case "application":
        return <ApplicationBuilder />
      case "loan-app":
        return <LoanApplicationBuilder />
      case "resume":
        return <ResumeBuilder />
      case "ask-ai":
        return <AskAI />
      case "settings":
        return <SettingsPanel />
      default:
        return <CostEstimator />
    }
  }

  return (
    <div className="flex min-h-screen bg-secondary">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader activeTab={activeTab} />
        
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-[1fr,320px] gap-6">
              <div>
                {renderContent()}
              </div>
              <aside className="hidden lg:block space-y-6">
                {/* Download App Card */}
                <div className="bg-gradient-to-br from-primary/10 to-chart-2/10 rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                    <Image
                      src={IMAGES.success}
                      alt="Success"
                      fill
                      className="object-cover rounded-tr-2xl"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-semibold text-foreground mb-1">Get the App</h3>
                    <p className="text-xs text-muted-foreground mb-3">Install for offline access and faster loading</p>
                    <DownloadAppButton variant="default" />
                  </div>
                </div>

                {/* User History */}
                <UserHistory />

                {/* Quick Tips Card */}
                <div className="bg-card rounded-2xl p-5 border border-border relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10">
                    <Image
                      src={IMAGES.education}
                      alt="Education"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-3">Quick Tips</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground relative z-10">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">1.</span>
                      Start with Cost Estimator to understand total expenses
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">2.</span>
                      Use ROI Calculator to check loan feasibility
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">3.</span>
                      Compare lenders for best interest rates
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
