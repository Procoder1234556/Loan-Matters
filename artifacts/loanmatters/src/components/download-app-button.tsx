

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, Smartphone, Monitor, Check, Apple, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Store the prompt globally so it persists
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null

export function DownloadAppButton({ variant = "default" }: { variant?: "default" | "outline" | "ghost" }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">("desktop")
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    if (/android/.test(userAgent)) {
      setPlatform("android")
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios")
    } else {
      setPlatform("desktop")
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      globalDeferredPrompt = e as BeforeInstallPromptEvent
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      globalDeferredPrompt = null
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt
    if (promptToUse) {
      setInstalling(true)
      try {
        await promptToUse.prompt()
        const { outcome } = await promptToUse.userChoice
        if (outcome === "accepted") {
          setIsInstalled(true)
          setShowDialog(false)
        }
      } catch (err) {
        console.error("Install error:", err)
      }
      setInstalling(false)
      globalDeferredPrompt = null
      setDeferredPrompt(null)
    } else {
      // Show manual instructions
      setShowDialog(true)
    }
  }, [deferredPrompt])

  const handleButtonClick = () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt
    if (promptToUse) {
      handleInstall()
    } else {
      setShowDialog(true)
    }
  }

  if (isInstalled) {
    return (
      <Button variant={variant} className="rounded-full gap-2" disabled>
        <Check className="w-4 h-4" />
        Installed
      </Button>
    )
  }

  return (
    <>
      <Button 
        variant={variant} 
        className="rounded-full gap-2" 
        onClick={handleButtonClick}
        disabled={installing}
      >
        <Download className="w-4 h-4" />
        {installing ? "Installing..." : "Download App"}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Install LoanMatters
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {(deferredPrompt || globalDeferredPrompt) && (
              <Button onClick={handleInstall} className="w-full" disabled={installing}>
                <Download className="w-4 h-4 mr-2" />
                {installing ? "Installing..." : "Install Now"}
              </Button>
            )}

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Smartphone className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Android</p>
                  <p className="text-xs text-muted-foreground">
                    1. Tap the menu (3 dots) in Chrome<br/>
                    2. Select &quot;Add to Home Screen&quot;<br/>
                    3. Tap &quot;Install&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Apple className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">iOS (Safari)</p>
                  <p className="text-xs text-muted-foreground">
                    1. Tap the Share button<br/>
                    2. Scroll and tap &quot;Add to Home Screen&quot;<br/>
                    3. Tap &quot;Add&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Monitor className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Desktop (Chrome/Edge)</p>
                  <p className="text-xs text-muted-foreground">
                    1. Look for install icon in the address bar<br/>
                    2. Or click the menu and select &quot;Install app&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                No app store needed. Works offline after installation.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
