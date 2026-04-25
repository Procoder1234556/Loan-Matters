"use client"

import Link from "next/link"
import Image from "next/image"
import { IMAGES } from "@/lib/images"
import { 
  Calculator, 
  TrendingUp, 
  Scale, 
  Grid3X3, 
  MessageSquare,
  GraduationCap,
  Home,
  Settings,
  HelpCircle,
  UserCheck,
  BookOpen,
  FileText,
  Briefcase,
  Landmark
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { id: "estimator", label: "Cost Estimator", icon: Calculator },
  { id: "roi", label: "ROI Calculator", icon: TrendingUp },
  { id: "compare", label: "Loan Compare", icon: Scale },
  { id: "heatmap", label: "ROI Heatmap", icon: Grid3X3 },
  { id: "profile", label: "Profile Analyzer", icon: UserCheck },
  { id: "application", label: "App Builder", icon: FileText },
  { id: "loan-app", label: "Loan Application", icon: Landmark },
  { id: "resume", label: "Resume Builder", icon: Briefcase },
  { id: "ask-ai", label: "Ask AI", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
]

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-card border-r border-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              LoanMatters
            </h1>
            <p className="text-xs text-muted-foreground">Education Clarity</p>
          </div>
        </div>

        {/* Back to Home & Blog */}
        <div className="px-4 pt-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <Link
            href="/blog"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Blog</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <p className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tools
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Stick Illustration */}
        <div className="px-4 py-2">
          <div className="relative h-32 rounded-2xl overflow-hidden bg-secondary/50">
            <Image
              src={IMAGES.success}
              alt="Success illustration"
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs font-medium text-foreground">Ready to plan your future?</p>
              <p className="text-[10px] text-muted-foreground mt-1">Let&apos;s calculate your ROI</p>
            </div>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="px-4 py-4 border-t border-border">
          <ul className="space-y-1">
            <li>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </li>
            <li>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Help Center</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg">
        <ul className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
