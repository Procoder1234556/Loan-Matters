"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2, 
  Download, 
  Upload,
  CheckCircle2,
  Settings,
  Database,
  Sparkles,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  getAPIConfig, 
  setAPIConfig, 
  getHistory, 
  clearHistory,
  exportAllData,
  importData,
  resetSetup,
  type APIConfig 
} from "@/lib/local-storage"

const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI GPT-4o", color: "bg-emerald-500" },
  { id: "anthropic", name: "Anthropic Claude", color: "bg-orange-500" },
  { id: "google", name: "Google Gemini", color: "bg-blue-500" },
  { id: "groq", name: "Groq Llama 3.3", color: "bg-purple-500" },
] as const

interface SettingsPanelProps {
  onClose?: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [config, setConfig] = useState<APIConfig | null>(null)
  const [tavilyKey, setTavilyKey] = useState("")
  const [showTavilyKey, setShowTavilyKey] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>("openai")
  const [aiKey, setAiKey] = useState("")
  const [showAiKey, setShowAiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [historyCount, setHistoryCount] = useState(0)
  const [isOpenSource, setIsOpenSource] = useState(false)

  useEffect(() => {
    const storedConfig = getAPIConfig()
    if (storedConfig) {
      setConfig(storedConfig)
      setTavilyKey(storedConfig.tavilyApiKey)
      setSelectedProvider(storedConfig.aiProvider)
      setAiKey(storedConfig.aiApiKey)
    }
    setHistoryCount(getHistory().length)
    
    // Check if open source mode
    const openSource = typeof window !== "undefined" && 
      (window.matchMedia('(display-mode: standalone)').matches || 
       localStorage.getItem("loanmatters_opensource") === "true")
    setIsOpenSource(openSource)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    
    const newConfig: APIConfig = {
      tavilyApiKey: tavilyKey,
      aiProvider: selectedProvider as APIConfig["aiProvider"],
      aiApiKey: aiKey,
      setupDate: config?.setupDate || new Date().toISOString(),
    }
    
    setAPIConfig(newConfig)
    setConfig(newConfig)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `loanmatters-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        if (importData(text)) {
          const newConfig = getAPIConfig()
          if (newConfig) {
            setConfig(newConfig)
            setTavilyKey(newConfig.tavilyApiKey)
            setSelectedProvider(newConfig.aiProvider)
            setAiKey(newConfig.aiApiKey)
          }
          setHistoryCount(getHistory().length)
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }
      }
    }
    input.click()
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      clearHistory()
      setHistoryCount(0)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings? This will clear your API keys and require setup again.")) {
      resetSetup()
      window.location.reload()
    }
  }

  const toggleOpenSource = () => {
    if (isOpenSource) {
      localStorage.removeItem("loanmatters_opensource")
    } else {
      localStorage.setItem("loanmatters_opensource", "true")
    }
    setIsOpenSource(!isOpenSource)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h2>
          <p className="text-muted-foreground">Manage your API keys and data</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Open Source Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Open Source Mode
          </CardTitle>
          <CardDescription>
            Enable to use your own API keys and store data locally
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Use Local Storage</p>
              <p className="text-sm text-muted-foreground">
                API keys and history stored on your device only
              </p>
            </div>
            <Switch checked={isOpenSource} onCheckedChange={toggleOpenSource} />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Your API keys are stored locally and never sent to our servers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tavily API */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Tavily API Key (Web Search)
            </Label>
            <div className="relative">
              <Input
                type={showTavilyKey ? "text" : "password"}
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-xxxxxxxxxxxxxxxx"
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
          </div>

          {/* AI Provider */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Provider
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {AI_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all",
                    selectedProvider === provider.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", provider.color)} />
                    <span className="text-sm font-medium">{provider.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI API Key */}
          <div className="space-y-2">
            <Label>
              {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} API Key
            </Label>
            <div className="relative">
              <Input
                type={showAiKey ? "text" : "password"}
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                placeholder="Enter your API key"
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
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save API Keys
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, or clear your local data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium">History Items</p>
              <p className="text-sm text-muted-foreground">{historyCount} calculations saved locally</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleClearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button variant="destructive" onClick={handleReset} className="w-full">
              Reset All Settings
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              This will clear all API keys and require setup again
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
