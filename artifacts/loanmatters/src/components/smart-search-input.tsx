

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Loader2, X, TrendingUp, Building2, GraduationCap, DollarSign, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface Suggestion {
  text: string
  category: string
  icon: React.ReactNode
}

interface SmartSearchInputProps {
  placeholder?: string
  field: "university" | "country" | "field" | "lender" | "general"
  value: string
  onChange: (value: string) => void
  onSelect?: (suggestion: Suggestion) => void
  className?: string
}

const SUGGESTIONS_DATA: Record<string, Suggestion[]> = {
  university: [
    { text: "MIT - Massachusetts Institute of Technology", category: "USA", icon: <Building2 className="w-4 h-4" /> },
    { text: "Stanford University", category: "USA", icon: <Building2 className="w-4 h-4" /> },
    { text: "Harvard University", category: "USA", icon: <Building2 className="w-4 h-4" /> },
    { text: "Carnegie Mellon University", category: "USA", icon: <Building2 className="w-4 h-4" /> },
    { text: "UC Berkeley", category: "USA", icon: <Building2 className="w-4 h-4" /> },
    { text: "Georgia Tech", category: "USA", icon: <Building2 className="w-4 h-4" /> },
    { text: "University of Toronto", category: "Canada", icon: <Building2 className="w-4 h-4" /> },
    { text: "University of British Columbia", category: "Canada", icon: <Building2 className="w-4 h-4" /> },
    { text: "McGill University", category: "Canada", icon: <Building2 className="w-4 h-4" /> },
    { text: "University of Waterloo", category: "Canada", icon: <Building2 className="w-4 h-4" /> },
    { text: "Imperial College London", category: "UK", icon: <Building2 className="w-4 h-4" /> },
    { text: "University of Oxford", category: "UK", icon: <Building2 className="w-4 h-4" /> },
    { text: "University of Cambridge", category: "UK", icon: <Building2 className="w-4 h-4" /> },
    { text: "University College London (UCL)", category: "UK", icon: <Building2 className="w-4 h-4" /> },
    { text: "ETH Zurich", category: "Switzerland", icon: <Building2 className="w-4 h-4" /> },
    { text: "TU Munich", category: "Germany", icon: <Building2 className="w-4 h-4" /> },
    { text: "RWTH Aachen", category: "Germany", icon: <Building2 className="w-4 h-4" /> },
    { text: "University of Melbourne", category: "Australia", icon: <Building2 className="w-4 h-4" /> },
    { text: "University of Sydney", category: "Australia", icon: <Building2 className="w-4 h-4" /> },
    { text: "National University of Singapore", category: "Singapore", icon: <Building2 className="w-4 h-4" /> },
  ],
  country: [
    { text: "United States", category: "North America", icon: <Globe className="w-4 h-4" /> },
    { text: "Canada", category: "North America", icon: <Globe className="w-4 h-4" /> },
    { text: "United Kingdom", category: "Europe", icon: <Globe className="w-4 h-4" /> },
    { text: "Germany", category: "Europe", icon: <Globe className="w-4 h-4" /> },
    { text: "Australia", category: "Oceania", icon: <Globe className="w-4 h-4" /> },
    { text: "Singapore", category: "Asia", icon: <Globe className="w-4 h-4" /> },
    { text: "Netherlands", category: "Europe", icon: <Globe className="w-4 h-4" /> },
    { text: "Switzerland", category: "Europe", icon: <Globe className="w-4 h-4" /> },
    { text: "Ireland", category: "Europe", icon: <Globe className="w-4 h-4" /> },
    { text: "New Zealand", category: "Oceania", icon: <Globe className="w-4 h-4" /> },
  ],
  field: [
    { text: "Computer Science", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Artificial Intelligence / Machine Learning", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Data Science", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Electrical Engineering", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Mechanical Engineering", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Civil Engineering", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Biotechnology", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Information Technology", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Cybersecurity", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Robotics", category: "STEM", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "MBA / Business Analytics", category: "Business", icon: <GraduationCap className="w-4 h-4" /> },
    { text: "Finance / FinTech", category: "Business", icon: <GraduationCap className="w-4 h-4" /> },
  ],
  lender: [
    { text: "SBI Education Loan", category: "Public Bank", icon: <DollarSign className="w-4 h-4" /> },
    { text: "HDFC Credila", category: "Private NBFC", icon: <DollarSign className="w-4 h-4" /> },
    { text: "Axis Bank Education Loan", category: "Private Bank", icon: <DollarSign className="w-4 h-4" /> },
    { text: "ICICI Bank Education Loan", category: "Private Bank", icon: <DollarSign className="w-4 h-4" /> },
    { text: "Avanse Education Loan", category: "Private NBFC", icon: <DollarSign className="w-4 h-4" /> },
    { text: "Prodigy Finance", category: "International", icon: <DollarSign className="w-4 h-4" /> },
    { text: "MPOWER Financing", category: "International", icon: <DollarSign className="w-4 h-4" /> },
    { text: "Incred Education Loan", category: "Private NBFC", icon: <DollarSign className="w-4 h-4" /> },
    { text: "Auxilo Education Loan", category: "Private NBFC", icon: <DollarSign className="w-4 h-4" /> },
    { text: "Bank of Baroda Education Loan", category: "Public Bank", icon: <DollarSign className="w-4 h-4" /> },
  ],
  general: [
    { text: "Best universities for MS in Computer Science", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "Education loan interest rates 2024", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "Study abroad scholarships", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "GRE score requirements", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "IELTS vs TOEFL", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "Cost of living in USA for students", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "Post-study work visa options", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
    { text: "H1B visa sponsorship companies", category: "Search", icon: <TrendingUp className="w-4 h-4" /> },
  ],
}

export function SmartSearchInput({
  placeholder = "Search...",
  field,
  value,
  onChange,
  onSelect,
  className,
}: SmartSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filterSuggestions = useCallback((query: string) => {
    const allSuggestions = SUGGESTIONS_DATA[field] || SUGGESTIONS_DATA.general
    if (!query.trim()) {
      return allSuggestions.slice(0, 6)
    }
    const lowerQuery = query.toLowerCase()
    return allSuggestions
      .filter(
        (s) =>
          s.text.toLowerCase().includes(lowerQuery) ||
          s.category.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8)
  }, [field])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(true)
      const filtered = filterSuggestions(value)
      setSuggestions(filtered)
      setIsLoading(false)
      setHighlightedIndex(-1)
    }, 150)

    return () => clearTimeout(timer)
  }, [value, filterSuggestions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.text)
    onSelect?.(suggestion)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {value && (
          <button
            onClick={() => {
              onChange("")
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-slide-up">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : suggestions.length > 0 ? (
            <ul className="py-2 max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSelect(suggestion)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      highlightedIndex === index
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary"
                    )}
                  >
                    <span className="text-muted-foreground">{suggestion.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{suggestion.text}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.category}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
