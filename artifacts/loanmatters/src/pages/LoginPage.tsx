import { useEffect, useState } from "react"
import { useLocation } from "wouter"
import { GraduationCap, LogIn, Chrome, ArrowLeft, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-provider"

type AuthMode = "signin" | "signup"

export default function LoginPage() {
  const [, navigate] = useLocation()
  const { user, loading } = useAuth()
  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard")
    }
  }, [user, loading, navigate])

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    if (!supabase) return
    setIsGoogleLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) setError(error.message)
    } catch {
      setError("Google sign-in failed. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    if (!supabase) return
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        })
        if (error) {
          setError(error.message)
        } else {
          setSuccess("Account created! Check your email to confirm your address, then sign in.")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setError(error.message)
        } else {
          navigate("/dashboard")
        }
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to save your calculations across devices"
              : "Create an account to save and sync your loan research"}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {mode === "signin" ? "Sign in to LoanMatters" : "Sign up for LoanMatters"}
            </CardTitle>
            <CardDescription className="text-xs">
              Your API keys stay in your browser — we never store them on our servers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSupabaseConfigured ? (
              <>
                {/* Google OAuth */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isSubmitting}
                >
                  <Chrome className="w-4 h-4" />
                  {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                {/* Email + Password */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                        className="pl-9 pr-9"
                        minLength={mode === "signup" ? 8 : undefined}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-xs text-destructive">{error}</p>}
                  {success && <p className="text-xs text-green-600">{success}</p>}

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting || isGoogleLoading}>
                    {isSubmitting ? (
                      "Please wait…"
                    ) : mode === "signin" ? (
                      <><LogIn className="w-4 h-4" />Sign in</>
                    ) : (
                      <><UserPlus className="w-4 h-4" />Create account</>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                  {mode === "signin" ? (
                    <>Don't have an account?{" "}
                      <button onClick={() => { setMode("signup"); setError(null); setSuccess(null) }} className="text-primary hover:underline font-medium">
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>Already have an account?{" "}
                      <button onClick={() => { setMode("signin"); setError(null); setSuccess(null) }} className="text-primary hover:underline font-medium">
                        Sign in
                      </button>
                    </>
                  )}
                </p>
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
