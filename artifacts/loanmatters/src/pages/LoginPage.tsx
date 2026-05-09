import { useEffect, useState } from "react"
import { useLocation } from "wouter"
import { GraduationCap, LogIn, Chrome, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [, navigate] = useLocation()
  const { user, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard")
    }
  }, [user, loading, navigate])

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    if (!supabase) return
    setIsSigningIn(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) setError(error.message)
    } catch {
      setError("Sign-in failed. Please try again.")
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to save your calculations and access them from any device
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sign in to LoanMatters</CardTitle>
            <CardDescription className="text-xs">
              Your API keys stay in your browser — we never store them on our servers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isSupabaseConfigured ? (
              <>
                <Button
                  className="w-full gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                >
                  <Chrome className="w-4 h-4" />
                  {isSigningIn ? "Redirecting…" : "Continue with Google"}
                </Button>
                {error && (
                  <p className="text-xs text-destructive text-center">{error}</p>
                )}
              </>
            ) : (
              <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground text-center space-y-2">
                <LogIn className="w-6 h-6 mx-auto text-muted-foreground/50" />
                <p>
                  Auth is not configured for this deployment. You can still use all
                  tools — your data is saved locally in your browser.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Continue without signing in
        </Button>
      </div>
    </div>
  )
}
