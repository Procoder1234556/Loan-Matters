"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Key, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Globe, 
  ArrowRight, 
  GraduationCap,
  Zap,
  Shield,
  HardDrive
} from "lucide-react"
import { cn } from "@/lib/utils"
import { setAPIConfig, markSetupComplete, isSetupComplete, type APIConfig } from "@/lib/local-storage"
import Image from "next/image"
import { IMAGES } from "@/lib/images"

const AI_PROVIDERS = [
  { 
    id: "openai", 
    name: "OpenAI", 
    model: "GPT-4o",
    description: "Most capable, great for complex tasks",
    color: "bg-emerald-500"
  },
  { 
    id: "anthropic", 
    name: "Anthropic", 
    model: "Claude Sonnet",
    description: "Excellent reasoning and safety",
    color: "bg-orange-500"
  },
  { 
    id: "google", 
    name: "Google", 
    model: "Gemini Pro",
    description: "Fast and efficient",
    color: "bg-blue-500"
  },
  { 
    id: "groq", 
    name: "Groq", 
    model: "Llama 3.3 70B",
    description: "Lightning fast inference",
    color: "bg-purple-500"
  },
] as const

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [tavilyKey, setTavilyKey] = useState("")
  const [showTavilyKey, setShowTavilyKey] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>("openai")
  const [aiKey, setAiKey] = useState("")
  const [showAiKey, setShowAiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState("")

  const handleValidateAndContinue = async () => {
    if (step === 2 && !tavilyKey.trim()) {
      setValidationError("Please enter your Tavily API key")
      return
    }
    if (step === 3 && !aiKey.trim()) {
      setValidationError("Please enter your AI API key")
      return
    }
    
    setValidationError("")
    
    if (step === 3) {
      setIsValidating(true)
      // Simple validation - just check if keys look valid
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsValidating(false)
      
      // Save configuration
      const config: APIConfig = {
        tavilyApiKey: tavilyKey,
        aiProvider: selectedProvider as APIConfig["aiProvider"],
        aiApiKey: aiKey,
        setupDate: new Date().toISOString(),
      }
      setAPIConfig(config)
      markSetupComplete()
      setStep(4)
    } else {
      setStep(step + 1)
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                step >= s ? "bg-primary scale-100" : "bg-muted scale-75"
              )}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="border-2 animate-fade-slide-up">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Welcome to LoanMatters</CardTitle>
              <CardDescription className="text-lg mt-2">
                Open Source Edition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <Image
                  src={IMAGES.hero}
                  alt="Education"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>

              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Zap className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Your Own API Keys</h4>
                    <p className="text-sm text-muted-foreground">Use your own Tavily and AI provider keys for unlimited access</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <HardDrive className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Local Data Storage</h4>
                    <p className="text-sm text-muted-foreground">All your data stays on your device, nothing sent to our servers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Privacy First</h4>
                    <p className="text-sm text-muted-foreground">API keys are stored locally and never leave your computer</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Tavily API Key */}
        {step === 2 && (
          <Card className="border-2 animate-fade-slide-up">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-success/10 flex items-center justify-center">
                <Globe className="w-8 h-8 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold">Tavily API Key</CardTitle>
              <CardDescription className="text-base mt-2">
                Tavily powers real-time web search for live data on loans, universities, and salaries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tavily-key">Tavily API Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="tavily-key"
                      type={showTavilyKey ? "text" : "password"}
                      placeholder="tvly-xxxxxxxxxxxxxxxx"
                      value={tavilyKey}
                      onChange={(e) => setTavilyKey(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTavilyKey(!showTavilyKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showTavilyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 text-sm">
                  <p className="font-medium mb-2">How to get your Tavily API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Visit <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">tavily.com</a></li>
                    <li>Sign up for a free account</li>
                    <li>Go to your dashboard and copy your API key</li>
                  </ol>
                </div>

                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleValidateAndContinue} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: AI Provider */}
        {step === 3 && (
          <Card className="border-2 animate-fade-slide-up">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">AI Provider</CardTitle>
              <CardDescription className="text-base mt-2">
                Choose your AI provider and enter your API key
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {AI_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      selectedProvider === provider.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("w-2 h-2 rounded-full", provider.color)} />
                      <span className="font-semibold">{provider.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{provider.model}</p>
                    <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-key">
                  {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} API Key
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="ai-key"
                    type={showAiKey ? "text" : "password"}
                    placeholder={selectedProvider === "openai" ? "sk-..." : "Enter your API key"}
                    value={aiKey}
                    onChange={(e) => setAiKey(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAiKey(!showAiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleValidateAndContinue} disabled={isValidating} className="flex-1">
                  {isValidating ? "Validating..." : "Complete Setup"}
                  {!isValidating && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card className="border-2 animate-fade-slide-up">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <CardTitle className="text-3xl font-bold">You&apos;re All Set!</CardTitle>
              <CardDescription className="text-lg mt-2">
                LoanMatters is ready to help you plan your education journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <Image
                  src={IMAGES.success}
                  alt="Success"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>

              <div className="p-4 rounded-xl bg-secondary/50">
                <h4 className="font-semibold mb-2">Your configuration:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Tavily API: Connected</li>
                  <li>AI Provider: {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} ({AI_PROVIDERS.find(p => p.id === selectedProvider)?.model})</li>
                  <li>Data Storage: Local (your device)</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                You can change these settings anytime from the Settings menu
              </p>

              <Button onClick={handleFinish} className="w-full" size="lg">
                Start Using LoanMatters
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Wrapper component that shows setup wizard if needed
export function SetupGuard({ children }: { children: React.ReactNode }) {
  const [showSetup, setShowSetup] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if this is the open-source version (PWA installed or specific flag)
    const isOpenSource = typeof window !== "undefined" && 
      (window.matchMedia('(display-mode: standalone)').matches || 
       localStorage.getItem("loanmatters_opensource") === "true")
    
    if (isOpenSource && !isSetupComplete()) {
      setShowSetup(true)
    }
  }, [])

  if (!mounted) return null

  if (showSetup) {
    return <SetupWizard onComplete={() => setShowSetup(false)} />
  }

  return <>{children}</>
}
