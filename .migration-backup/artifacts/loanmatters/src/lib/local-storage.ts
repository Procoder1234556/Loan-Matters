// Local storage utilities for open-source version
// Stores API keys and user data locally on desktop

const STORAGE_KEYS = {
  API_CONFIG: "loanmatters_api_config",
  USER_DATA: "loanmatters_user_data",
  HISTORY: "loanmatters_history",
  SETUP_COMPLETE: "loanmatters_setup_complete",
} as const

export interface APIConfig {
  tavilyApiKey: string
  aiProvider: "openai" | "anthropic" | "google" | "groq"
  aiApiKey: string
  setupDate: string
}

export interface UserData {
  name?: string
  email?: string
  preferences?: {
    theme: "light" | "dark" | "system"
    notifications: boolean
  }
}

export interface HistoryItem {
  id: string
  type: "cost_estimate" | "roi_calculation" | "loan_comparison" | "profile_analysis" | "application" | "resume" | "loan_application"
  title: string
  data: Record<string, unknown>
  createdAt: string
}

// API Configuration
export function getAPIConfig(): APIConfig | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEYS.API_CONFIG)
  return stored ? JSON.parse(stored) : null
}

export function setAPIConfig(config: APIConfig): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config))
}

export function clearAPIConfig(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.API_CONFIG)
}

// Setup status
export function isSetupComplete(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE) === "true"
}

export function markSetupComplete(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, "true")
}

export function resetSetup(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.SETUP_COMPLETE)
  localStorage.removeItem(STORAGE_KEYS.API_CONFIG)
}

// User Data
export function getUserData(): UserData | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA)
  return stored ? JSON.parse(stored) : null
}

export function setUserData(data: UserData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data))
}

// History
export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
  return stored ? JSON.parse(stored) : []
}

export function addToHistory(item: Omit<HistoryItem, "id" | "createdAt">): void {
  if (typeof window === "undefined") return
  const history = getHistory()
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  history.unshift(newItem)
  // Keep only last 100 items
  if (history.length > 100) {
    history.pop()
  }
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
}

export function clearHistory(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.HISTORY)
}

export function deleteHistoryItem(id: string): void {
  if (typeof window === "undefined") return
  const history = getHistory()
  const filtered = history.filter((item) => item.id !== id)
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered))
}

// Export all data (for backup)
export function exportAllData(): string {
  const data = {
    apiConfig: getAPIConfig(),
    userData: getUserData(),
    history: getHistory(),
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(data, null, 2)
}

// Import data (from backup)
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (data.apiConfig) setAPIConfig(data.apiConfig)
    if (data.userData) setUserData(data.userData)
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history))
    }
    return true
  } catch {
    return false
  }
}
