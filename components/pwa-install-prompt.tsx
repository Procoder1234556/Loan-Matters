"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Download, Smartphone, Monitor, Chrome, Apple, GraduationCap } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop" | "unknown">("unknown")
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem("pwa-prompt-dismissed")
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    const isAndroid = /android/.test(userAgent)
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isDesktop = !isAndroid && !isIOS

    if (isAndroid) setPlatform("android")
    else if (isIOS) setPlatform("ios")
    else if (isDesktop) setPlatform("desktop")

    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Show prompt immediately for all platforms
    setShowPrompt(true)

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      console.log("[v0] beforeinstallprompt event captured")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowPrompt(false)
      console.log("[v0] App installed successfully")
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    sessionStorage.setItem("pwa-prompt-dismissed", "true")
  }

  if (isInstalled || dismissed || !showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50 animate-fade-slide-up">
      <Card className="bg-card border-2 border-primary/30 shadow-2xl shadow-primary/10">
        <CardContent className="p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-bold text-lg text-foreground mb-1 flex items-center gap-2">
                Install LoanMatters
                {platform === "android" && <Smartphone className="w-4 h-4 text-green-500" />}
                {platform === "ios" && <Apple className="w-4 h-4 text-gray-500" />}
                {platform === "desktop" && <Monitor className="w-4 h-4 text-blue-500" />}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {platform === "android" && "Install for quick access, offline use & native experience"}
                {platform === "ios" && "Add to Home Screen for the best experience"}
                {platform === "desktop" && "Install as a desktop app for quick access & offline use"}
                {platform === "unknown" && "Install our app for the best experience"}
              </p>

              {deferredPrompt ? (
                <Button onClick={handleInstall} size="default" className="w-full gap-2 font-semibold">
                  <Download className="w-4 h-4" />
                  Install Now
                </Button>
              ) : (
                <div className="space-y-3">
                  {platform === "ios" && (
                    <div className="text-sm bg-secondary/70 rounded-xl p-4">
                      <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Apple className="w-4 h-4" />
                        Install on iOS:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                        <li>Tap the <span className="font-medium text-foreground">Share</span> button at bottom</li>
                        <li>Scroll down, tap <span className="font-medium text-foreground">&quot;Add to Home Screen&quot;</span></li>
                        <li>Tap <span className="font-medium text-foreground">&quot;Add&quot;</span> to confirm</li>
                      </ol>
                    </div>
                  )}
                  {platform === "desktop" && (
                    <div className="text-sm bg-secondary/70 rounded-xl p-4">
                      <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Chrome className="w-4 h-4" />
                        Install on Desktop:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                        <li>Look for the <span className="font-medium text-foreground">install icon</span> in address bar</li>
                        <li>Or click <span className="font-medium text-foreground">Menu (⋮) → Install LoanMatters</span></li>
                        <li>Click <span className="font-medium text-foreground">&quot;Install&quot;</span> to confirm</li>
                      </ol>
                    </div>
                  )}
                  {platform === "android" && (
                    <div className="text-sm bg-secondary/70 rounded-xl p-4">
                      <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Install on Android:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                        <li>Tap the <span className="font-medium text-foreground">menu (⋮)</span> in browser</li>
                        <li>Tap <span className="font-medium text-foreground">&quot;Add to Home screen&quot;</span></li>
                        <li>Tap <span className="font-medium text-foreground">&quot;Add&quot;</span> to confirm</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Works offline
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Fast access
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                No app store
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
