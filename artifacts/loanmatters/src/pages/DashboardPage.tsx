import { useState, useEffect } from "react"
import { Link, useSearch } from "wouter"
import { GraduationCap, Calculator, TrendingUp, Scale, Grid3X3, MessageSquare,
  UserCheck, FileText, Landmark, Briefcase, Settings, Home, BookOpen,
  ChevronDown, Bell, User, LogOut, LogIn, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { EmiCalculator } from "@/components/emi-calculator"
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface NavTab {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  group?: "calculators" | "ai-tools" | "builders"
}

const PRIMARY_TABS: NavTab[] = [
  { id: "emi", label: "EMI Calculator", icon: Calculator, group: "calculators" },
  { id: "compare", label: "Loan Compare", icon: Scale, group: "calculators" },
  { id: "roi", label: "ROI Calculator", icon: TrendingUp, group: "calculators" },
  { id: "estimator", label: "Cost Estimator", icon: IndianRupee, group: "calculators" },
  { id: "heatmap", label: "ROI Heatmap", icon: Grid3X3, group: "calculators" },
  { id: "ask-ai", label: "Ask AI", icon: MessageSquare, group: "ai-tools" },
  { id: "profile", label: "Profile Analyzer", icon: UserCheck, group: "ai-tools" },
]

const MORE_TABS: NavTab[] = [
  { id: "application", label: "Application Builder", icon: FileText, group: "builders" },
  { id: "loan-app", label: "Loan Application", icon: Landmark, group: "builders" },
  { id: "resume", label: "Resume Builder", icon: Briefcase, group: "builders" },
  { id: "settings", label: "Settings", icon: Settings },
]

const ALL_TABS = [...PRIMARY_TABS, ...MORE_TABS]

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  emi: { title: "EMI Calculator", subtitle: "Calculate monthly installment with live lender comparison" },
  estimator: { title: "Cost Estimator", subtitle: "Total cost breakdown for your program" },
  roi: { title: "ROI Calculator", subtitle: "Loan payback timeline and break-even analysis" },
  compare: { title: "Loan Comparison", subtitle: "Side-by-side comparison of 15+ Indian lenders" },
  heatmap: { title: "ROI Heatmap", subtitle: "Country × field ROI matrix" },
  profile: { title: "Profile Analyzer", subtitle: "AI assessment of your admission chances" },
  application: { title: "Application Builder", subtitle: "AI-generated SOP and application documents" },
  "loan-app": { title: "Loan Application Builder", subtitle: "Bank-ready loan application document" },
  resume: { title: "Resume Builder", subtitle: "STEM-optimized ATS resume generator" },
  "ask-ai": { title: "Ask AI", subtitle: "Get instant answers with real-time web grounding" },
  settings: { title: "Settings", subtitle: "Configure API keys and preferences" },
}

export default function DashboardPage() {
  const search = useSearch()
  const params = new URLSearchParams(search)
  const initialTab = params.get("tab") || "emi"
  const [activeTab, setActiveTab] = useState(
    ALL_TABS.find(t => t.id === initialTab) ? initialTab : "emi"
  )
  const [moreOpen, setMoreOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const tab = p.get("tab")
    if (tab && ALL_TABS.find(t => t.id === tab)) setActiveTab(tab)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "emi": return <EmiCalculator />
      case "estimator": return <CostEstimator />
      case "roi": return <ROICalculator />
      case "compare": return <LoanComparison />
      case "heatmap": return <ROIHeatmap />
      case "profile": return <ProfileAnalyzer />
      case "application": return <ApplicationBuilder />
      case "loan-app": return <LoanApplicationBuilder />
      case "resume": return <ResumeBuilder />
      case "ask-ai": return <AskAI />
      case "settings": return <SettingsPanel />
      default: return <EmiCalculator />
    }
  }

  const { title, subtitle } = TAB_TITLES[activeTab] || TAB_TITLES.emi
  const isMoreActive = MORE_TABS.some(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">

          {/* Brand row */}
          <div className="flex items-center justify-between h-14 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-black text-gray-900 text-base">Loan<span className="text-blue-600">Matters</span></span>
                </div>
              </Link>
              <div className="hidden md:flex items-center gap-1 text-sm">
                <Link href="/">
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <Home className="w-3.5 h-3.5" /> Home
                  </button>
                </Link>
                <Link href="/blog">
                  <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <BookOpen className="w-3.5 h-3.5" /> Blog
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>
              {loading ? (
                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>
                      <p className="font-medium text-sm">{user.user_metadata?.full_name || "User"}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-red-500 text-sm">
                      <LogOut className="w-4 h-4 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Tab row */}
          <div className="flex items-center overflow-x-auto scrollbar-hide -mx-1">
            {PRIMARY_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0",
                    isActive
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}

            {/* More dropdown */}
            <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0",
                  isMoreActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                )}>
                  More <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {MORE_TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMoreOpen(false) }}
                      className={cn("text-sm gap-2", activeTab === tab.id && "text-blue-600 bg-blue-50")}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Page Title Banner ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2 text-sm text-gray-500">
          <Link href="/"><span className="hover:text-blue-600 cursor-pointer">Home</span></Link>
          <span>›</span>
          <span className="text-gray-800 font-medium">{title}</span>
          <span className="hidden md:block ml-3 text-xs text-gray-400">— {subtitle}</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-6 py-6 pb-24 md:pb-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="min-w-0">{renderContent()}</div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-5">
            {/* Quick nav */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Access</p>
              <div className="space-y-1">
                {PRIMARY_TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                        activeTab === tab.id
                          ? "bg-blue-600 text-white font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sign in prompt */}
            {!user && !loading && (
              <div className="bg-blue-600 rounded-2xl p-4 text-white">
                <p className="font-bold text-sm mb-1">Save Your Calculations</p>
                <p className="text-xs text-blue-100 mb-3">Sign in to access your history from anywhere</p>
                <Link href="/login">
                  <button className="w-full bg-white text-blue-600 font-semibold text-sm py-2 rounded-xl hover:bg-blue-50 transition-colors">
                    Sign In Free
                  </button>
                </Link>
              </div>
            )}

            <UserHistory />
          </aside>
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {PRIMARY_TABS.slice(0, 4).map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500"
                )}
              >
                <Icon className="w-5 h-5" />
                {tab.label.split(" ")[0]}
              </button>
            )
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-gray-500"
          >
            <Grid3X3 className="w-5 h-5" />
            More
          </button>
        </div>
      </nav>
    </div>
  )
}
