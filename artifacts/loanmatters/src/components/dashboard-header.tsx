import { Bell, Search, User, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { Link } from "wouter"

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  estimator: { title: "Cost Estimator", subtitle: "Calculate total costs for your target program" },
  roi: { title: "ROI Calculator", subtitle: "Understand your return on investment" },
  compare: { title: "Loan Comparison", subtitle: "Compare lenders side by side" },
  heatmap: { title: "ROI Heatmap", subtitle: "Visualize returns by country and field" },
  profile: { title: "Profile Analyzer", subtitle: "Analyze your chances of admission" },
  application: { title: "Application Builder", subtitle: "AI-powered university application generator" },
  "loan-app": { title: "Loan Application Builder", subtitle: "Generate ready-to-submit bank loan applications" },
  resume: { title: "ATS Resume Builder", subtitle: "Create high-scoring ATS-optimized resumes" },
  "ask-ai": { title: "Ask AI", subtitle: "Get instant answers to your questions" },
  settings: { title: "Settings", subtitle: "Manage API keys and local data" },
}

interface DashboardHeaderProps {
  activeTab: string
}

export function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  const { title, subtitle } = tabTitles[activeTab] || tabTitles.estimator
  const { user, loading, signOut } = useAuth()

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="md:hidden">
          <h1 className="text-lg font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl hidden md:flex">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          {loading ? (
            <div className="w-10 h-10 rounded-xl bg-secondary animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || "User"}
                      width={40}
                      height={40}
                      className="rounded-xl"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal truncate">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground">
                  Your calculations are being saved
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Sign in</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
      {!loading && !user && (
        <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hidden md:block">
          <p className="text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>{" "}
            to save your calculations and access them from anywhere.
          </p>
        </div>
      )}
    </header>
  )
}
