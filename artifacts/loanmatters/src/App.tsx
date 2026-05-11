import { Switch, Route, Router as WouterRouter } from "wouter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/auth-context.tsx"
import { SetupGuard } from "@/components/setup-wizard"
import LandingPage from "@/pages/LandingPage"
import DashboardPage from "@/pages/DashboardPage"
import BlogPage from "@/pages/BlogPage"
import BlogPostPage from "@/pages/BlogPostPage"
import LoginPage from "@/pages/LoginPage"
import AdminPage from "@/pages/AdminPage"
import NotFound from "@/pages/not-found"

const queryClient = new QueryClient()

function DashboardWithSetup() {
  return (
    <SetupGuard>
      <DashboardPage />
    </SetupGuard>
  )
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/dashboard" component={DashboardWithSetup} />
      <Route path="/login" component={LoginPage} />
      <Route path="/loanlens-admin-x7k9m2" component={AdminPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
