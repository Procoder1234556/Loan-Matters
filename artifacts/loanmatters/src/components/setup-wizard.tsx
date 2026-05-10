import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Key, Sparkles, CheckCircle2, Eye, EyeOff, Globe, ArrowRight, GraduationCap,
  Zap, Shield, HardDrive, Github, Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { setAPIConfig, markSetupComplete, isSetupComplete, type APIConfig } from "@/lib/local-storage"
import { IMAGES } from "@/lib/images"

const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", model: "GPT-4o", description: "Most capable, great for complex tasks", color: "bg-emerald-500" },
  { id: "anthropic", name: "Anthropic", model: "Claude Sonnet", description: "Excellent reasoning and safety", color: "bg-orange-500" },
  { id: "google", name: "Google", model: "Gemini Pro", description: "Fast and efficient", color: "bg-blue-500" },
  { id: "groq", name: "Groq", model: "Llama 3.3 70B", description: "Lightning fast inference", color: "bg-purple-500" },
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
    setStep(step + 1)
  }

  const handleComplete = () => {
    const config: APIConfig = {
      tavilyApiKey: tavilyKey,
      aiProvider: selectedProvider as APIConfig["aiProvider"],
      aiApiKey: aiKey,
      setupDate: new Date().toISOString(),
    }
    setAPIConfig(config)
    markSetupComplete()
    onComplete()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to LoanMatters</h1>
          <p className="text-muted-foreground mt-2">Set up your AI-powered education loan advisor</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                step >= s ? "bg-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                How LoanMatters Works
              </CardTitle>
              <CardDescription>100% open source — AI-powered loan guidance that runs entirely in your browser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {[
                  { icon: Github, title: "Fully Open Source", desc: "The entire codebase is public. Audit every line — no hidden logic, no black boxes.", color: "bg-slate-500/10 text-slate-600" },
                  { icon: Lock, title: "Zero Server Storage", desc: "We never store your API keys, queries, or results. Nothing you do here touches our servers.", color: "bg-red-500/10 text-red-600" },
                  { icon: HardDrive, title: "Your Data, Your Device", desc: "All keys and history are saved in your browser's localStorage — only you can access them.", color: "bg-green-500/10 text-green-600" },
                  { icon: Globe, title: "Real-time Web Search", desc: "Tavily fetches live loan rates directly to your browser. The data never passes through us.", color: "bg-blue-500/10 text-blue-600" },
                  { icon: Zap, title: "Bring Your Own AI", desc: "Your AI API key goes straight from your browser to OpenAI / Anthropic / Google / Groq.", color: "bg-purple-500/10 text-purple-600" },
                  { icon: Shield, title: "Self-Host Anytime", desc: "Clone the repo and run it locally or on your own server — full control, always.", color: "bg-orange-500/10 text-orange-600" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", item.color)}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-sm text-center text-muted-foreground">
                Your API keys are <span className="font-semibold text-foreground">never transmitted to LoanMatters servers</span> — they go directly from your browser to the AI provider.
              </div>
              <Button onClick={() => setStep(2)} className="w-full">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Tavily API Key
              </CardTitle>
              <CardDescription>
                Tavily powers real-time web search for live loan rates and market data.{" "}
                <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Get a free key at tavily.com
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tavily-key">Tavily API Key</Label>
                <div className="relative">
                  <Input
                    id="tavily-key"
                    type={showTavilyKey ? "text" : "password"}
                    placeholder="tvly-..."
                    value={tavilyKey}
                    onChange={(e) => setTavilyKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTavilyKey(!showTavilyKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTavilyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationError && <p className="text-sm text-destructive">{validationError}</p>}
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2">
                  <Key className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Free tier includes 1,000 searches/month — plenty for personal use</span>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-sm flex items-start gap-2">
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-semibold">Stored on your device only.</span> This key is saved in your browser's localStorage. It is sent directly to Tavily — never to LoanMatters servers.
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={handleValidateAndContinue} className="flex-1">Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Choose Your AI Provider
              </CardTitle>
              <CardDescription>Select which AI to use for analysis and personalized insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <div className={cn("w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold", provider.color)}>
                      {provider.name[0]}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{provider.name}</p>
                    <p className="text-xs text-primary font-medium">{provider.model}</p>
                    <p className="text-xs text-muted-foreground mt-1">{provider.description}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-key">API Key for {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name}</Label>
                <div className="relative">
                  <Input
                    id="ai-key"
                    type={showAiKey ? "text" : "password"}
                    placeholder="Enter your API key..."
                    value={aiKey}
                    onChange={(e) => setAiKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAiKey(!showAiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationError && <p className="text-sm text-destructive">{validationError}</p>}
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-sm flex items-start gap-2">
                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-semibold">Private &amp; local.</span> Your key is saved only in your browser's localStorage and sent directly to {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name}. LoanMatters never sees or logs it.
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleValidateAndContinue} className="flex-1">Continue <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                You&apos;re All Set!
              </CardTitle>
              <CardDescription>LoanMatters is configured and ready to help you make smart financial decisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm font-medium">Tavily API configured for real-time web search</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm font-medium">{AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} AI ready for analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm font-medium">All keys stored locally — only accessible by you</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Open Source Privacy Guarantee</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  LoanMatters is 100% open source. Your API keys, search queries, and results are <span className="font-semibold text-foreground">never stored on our servers</span>. Everything lives in your browser's localStorage on your device. You can export, wipe, or inspect your data at any time from Settings.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In the self-hosted (open source) version, all data stays entirely within your own infrastructure — your server, your database, your rules.
                </p>
              </div>
              <Button onClick={handleComplete} className="w-full" size="lg">
                Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export function SetupGuard({ children }: { children: React.ReactNode }) {
  const [setupDone, setSetupDone] = useState(isSetupComplete())

  if (!setupDone) {
    return <SetupWizard onComplete={() => setSetupDone(true)} />
  }

  return <>{children}</>
}
