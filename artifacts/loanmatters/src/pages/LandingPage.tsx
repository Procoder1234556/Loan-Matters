import { useState, useEffect } from "react"
import { Link } from "wouter"
import {
  ArrowRight, GraduationCap, Calculator, BarChart3, Sparkles, TrendingUp,
  Shield, Users, Globe, RefreshCw, ExternalLink, Loader2, BookOpen, Star,
  ChevronRight, IndianRupee, BadgeCheck, Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroEmiCalculator } from "@/components/hero-emi-calculator"
import { IMAGES } from "@/lib/images"

interface MarketTrend {
  answer: string | null
  results: { title: string; url: string; snippet: string }[]
  fetchedAt: string
}

const TOOLS = [
  { id: "emi", label: "EMI Calculator", icon: Calculator },
  { id: "compare", label: "Loan Comparison", icon: BarChart3 },
  { id: "roi", label: "ROI Calculator", icon: TrendingUp },
  { id: "ai", label: "Ask AI", icon: Sparkles },
]

export default function LandingPage() {
  const [marketTrends, setMarketTrends] = useState<MarketTrend | null>(null)
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)

  const fetchMarketTrends = async () => {
    setIsLoadingTrends(true)
    try {
      const storedConfig = localStorage.getItem("loanmatters_api_config")
      const tavilyApiKey = storedConfig ? JSON.parse(storedConfig).tavilyApiKey : undefined
      const url = tavilyApiKey
        ? `/api/market-trends?tavilyApiKey=${encodeURIComponent(tavilyApiKey)}`
        : "/api/market-trends"
      const response = await fetch(url)
      if (response.ok) setMarketTrends(await response.json())
    } catch { /* silent */ } finally {
      setIsLoadingTrends(false)
    }
  }

  useEffect(() => { fetchMarketTrends() }, [])

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Top Utility Bar ── */}
      <div className="bg-blue-700 text-white text-xs py-1.5 px-6 hidden md:flex items-center justify-between">
        <span className="flex items-center gap-2">
          <BadgeCheck className="w-3.5 h-3.5" />
          RBI-compliant data · Trusted by 10,000+ STEM students
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />Help: Mon–Sat 9:30–6:30</span>
          <Link href="/blog" className="hover:underline flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Blog
          </Link>
        </div>
      </div>

      {/* ── Main Nav ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black text-gray-900 leading-none">Loan<span className="text-blue-600">Matters</span></span>
                <p className="text-[10px] text-gray-400 leading-none">Education Loan Clarity</p>
              </div>
            </div>

            {/* Product Nav */}
            <div className="hidden md:flex items-center gap-1">
              {TOOLS.map((t) => (
                <Link key={t.id} href="/dashboard">
                  <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="hidden md:block text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-2">
                  Sign In
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5">
                  Check Eligibility
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid lg:grid-cols-[1fr_420px] gap-10 items-center">
          {/* Left: Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Education Loan Advisor
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-balance">
              Apply for the{" "}
              <span className="text-yellow-300">Best Education</span>
              <br />Loan Online
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed max-w-xl">
              Compare interest rates from 15+ lenders, calculate your EMI instantly,
              and get AI-powered insights — all in one place.
            </p>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: Users, text: "10,000+ Students" },
                { icon: Shield, text: "Secure & Private" },
                { icon: BadgeCheck, text: "15+ Lenders" },
                { icon: Globe, text: "Real-time Rates" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-blue-100">
                  <item.icon className="w-4 h-4 text-yellow-300" />
                  {item.text}
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/dashboard">
                <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-7 py-3.5 rounded-xl text-base transition-colors flex items-center gap-2">
                  Check Eligibility Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dashboard?tab=compare">
                <button className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors flex items-center gap-2">
                  Compare Lenders
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Right: EMI Calculator (the HOOK) */}
          <div className="lg:mt-0 mt-4">
            <HeroEmiCalculator />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
          {[
            { value: "₹2.5B+", label: "Loans Analyzed" },
            { value: "150+", label: "Universities" },
            { value: "15+", label: "Lender Partners" },
            { value: "98%", label: "Accuracy Rate" },
          ].map((stat, i) => (
            <div key={i} className="text-center px-4 first:pl-0">
              <div className="text-2xl font-black text-blue-600">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tools Grid ── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">All Tools in One Place</h2>
            <p className="text-gray-500">Everything you need to make a smart education loan decision</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Calculator, title: "EMI Calculator", color: "bg-blue-600",
                description: "Drag sliders to get your monthly EMI instantly — with year-wise breakup and lender comparison.",
                badge: "Most Used", badgeColor: "bg-blue-100 text-blue-700", tab: "emi",
              },
              {
                icon: BarChart3, title: "Loan Comparison", color: "bg-indigo-600",
                description: "Compare SBI, HDFC Credila, Avanse and 12+ lenders side-by-side with live rates.",
                badge: "Live Rates", badgeColor: "bg-indigo-100 text-indigo-700", tab: "compare",
              },
              {
                icon: TrendingUp, title: "ROI Calculator", color: "bg-green-600",
                description: "Know your break-even point. Calculate loan payback vs projected salary after your degree.",
                badge: "AI-Powered", badgeColor: "bg-green-100 text-green-700", tab: "roi",
              },
              {
                icon: Calculator, title: "Cost Estimator", color: "bg-orange-600",
                description: "Full breakdown: tuition + living + visa + insurance costs by country and university.",
                badge: "Live Data", badgeColor: "bg-orange-100 text-orange-700", tab: "estimator",
              },
              {
                icon: Sparkles, title: "Ask AI", color: "bg-purple-600",
                description: "Ask anything about education loans. AI answers grounded in real-time web search data.",
                badge: "AI + Web", badgeColor: "bg-purple-100 text-purple-700", tab: "ask-ai",
              },
              {
                icon: GraduationCap, title: "Profile Analyzer", color: "bg-pink-600",
                description: "Get AI assessment of your admission chances and loan eligibility profile.",
                badge: "AI", badgeColor: "bg-pink-100 text-pink-700", tab: "profile",
              },
            ].map((tool, i) => (
              <Link key={i} href={`/dashboard?tab=${tool.tab}`}>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${tool.color} flex items-center justify-center`}>
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>{tool.badge}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{tool.description}</p>
                  <div className="flex items-center gap-1 mt-4 text-blue-600 text-sm font-semibold">
                    Open Tool <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-16 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">How LoanMatters Works</h2>
            <p className="text-gray-500">Three steps to your ideal education loan</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Calculate Your EMI", description: "Use the slider calculator to find the EMI you can afford. Compare across all major lenders instantly.", icon: Calculator },
              { step: "2", title: "Get AI Insights", description: "Ask our AI anything — loan eligibility, scholarship options, country-specific rules. Powered by real-time web data.", icon: Sparkles },
              { step: "3", title: "Apply with Confidence", description: "Use our Loan Application Builder to generate bank-ready documents and SOP drafts in minutes.", icon: GraduationCap },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Trends ── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Live Market Trends</h2>
              <p className="text-sm text-gray-500 mt-1">Real-time education loan rate movements and news</p>
            </div>
            <button
              onClick={fetchMarketTrends}
              disabled={isLoadingTrends}
              className="flex items-center gap-2 text-sm text-blue-600 font-semibold border border-blue-200 bg-white px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingTrends ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {isLoadingTrends ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Fetching latest rates...</span>
            </div>
          ) : marketTrends ? (
            <div className="space-y-4">
              {marketTrends.answer && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-gray-800 text-sm">AI Summary</h3>
                    {marketTrends.fetchedAt && (
                      <span className="text-[10px] text-gray-400 ml-auto">Updated {new Date(marketTrends.fetchedAt).toLocaleTimeString()}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{marketTrends.answer}</p>
                </div>
              )}
              {marketTrends.results?.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketTrends.results.slice(0, 6).map((source, i) => (
                    <a key={i} href={source.url} target="_blank" rel="noopener noreferrer"
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{source.title}</h4>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{source.snippet}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Market data unavailable — add your Tavily API key in settings to enable this.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "Saved 2 lakh in interest by comparing lenders on LoanMatters. The EMI slider made everything crystal clear.", name: "Priya Sharma", role: "MS CS @ Stanford", rating: 5 },
              { quote: "The cost estimator with live data helped my parents truly understand the cost of my MS in Germany.", name: "Rahul Menon", role: "MS Data Science @ TUM", rating: 5 },
              { quote: "Ask AI answered every niche question about co-signer requirements. Way better than any other tool.", name: "Ananya Patel", role: "MBA @ Wharton", rating: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-12 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">Start Planning Your Education Loan Today</h2>
          <p className="text-blue-100 mb-7">Free to use · No signup required · Instant results</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-base transition-colors flex items-center gap-2 justify-center">
                <IndianRupee className="w-5 h-5" />
                Open EMI Calculator
              </button>
            </Link>
            <Link href="/dashboard?tab=compare">
              <button className="bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors flex items-center gap-2 justify-center">
                Compare All Lenders
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">LoanMatters</span>
            <span className="text-xs ml-2">Education Loan Clarity for STEM Students</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Blog
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
          <p className="text-xs">Made for Indian STEM students planning to study abroad</p>
        </div>
      </footer>
    </div>
  )
}
