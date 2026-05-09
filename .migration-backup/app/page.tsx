"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, GraduationCap, Calculator, BarChart3, Sparkles, TrendingUp, Shield, Users, Globe, RefreshCw, ExternalLink, Loader2, BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { DownloadAppButton } from "@/components/download-app-button"
import { IMAGES } from "@/lib/images"

interface MarketTrend {
  answer: string | null
  results: { title: string; url: string; snippet: string }[]
  fetchedAt: string
}

export default function LandingPage() {
  const [marketTrends, setMarketTrends] = useState<MarketTrend | null>(null)
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)

  const fetchMarketTrends = async () => {
    setIsLoadingTrends(true)
    try {
      const response = await fetch("/api/market-trends")
      if (response.ok) {
        const data = await response.json()
        setMarketTrends(data)
      }
    } catch (error) {
      console.error("Failed to fetch market trends:", error)
    } finally {
      setIsLoadingTrends(false)
    }
  }

  useEffect(() => {
    fetchMarketTrends()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">LoanMatters</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#trends" className="text-muted-foreground hover:text-foreground transition-colors">Live Trends</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <DownloadAppButton variant="outline" />
            <Link href="/dashboard">
              <Button className="rounded-full px-6">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 opacity-0 animate-fade-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Loan Intelligence
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              Plan your
              <br />
              <span className="text-primary">STEM degree</span>
              <br />
              with clarity
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Cut through the noise with data-driven insights. Compare education loans, estimate costs, and calculate ROI for your international degree.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-8 h-14 text-base animate-pulse-glow">
                  Start Planning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base">
                Watch Demo
              </Button>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">Bank-grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-chart-4" />
                <span className="text-sm text-muted-foreground">Real-time Data</span>
              </div>
            </div>
          </div>
          
          {/* Right - Hero Illustration */}
          <div className="relative opacity-0 animate-fade-slide-up animation-delay-200">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "$2.5B+", label: "Loans Analyzed" },
            { value: "150+", label: "Universities Covered" },
            { value: "98%", label: "Accuracy Rate" },
            { value: "15+", label: "Lender Partners" },
          ].map((stat, i) => (
            <div key={i} className="text-center opacity-0 animate-fade-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
              <div className="text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Market Trends Section */}
      <section id="trends" className="py-24 px-6 bg-gradient-to-br from-primary/5 via-background to-chart-2/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 opacity-0 animate-fade-slide-up">
            <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              Powered by Real-Time Web Search
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Live Market Trends
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stay updated with the latest education loan trends and market insights, fetched in real-time.
            </p>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-2xl opacity-0 animate-fade-slide-up animation-delay-100">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Education Loan Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      {marketTrends?.fetchedAt 
                        ? `Updated ${new Date(marketTrends.fetchedAt).toLocaleTimeString()}`
                        : "Fetching latest data..."}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchMarketTrends}
                  disabled={isLoadingTrends}
                  className="rounded-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTrends ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {isLoadingTrends ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
                  <span className="text-muted-foreground">Searching the web for latest trends...</span>
                </div>
              ) : marketTrends ? (
                <div className="space-y-6">
                  {marketTrends.answer && (
                    <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl p-6 border border-success/20">
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-success" />
                        AI Summary
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">{marketTrends.answer}</p>
                    </div>
                  )}

                  {marketTrends.results && marketTrends.results.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-4">Latest News & Sources</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {marketTrends.results.slice(0, 6).map((source, i) => (
                          <a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {source.title}
                              </h5>
                              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{source.snippet}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Unable to fetch market trends. Please try again.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-fade-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Everything you need to
              <br />
              <span className="text-primary">make the right choice</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you navigate the complex world of education financing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calculator,
                title: "Cost Estimator",
                description: "Get detailed breakdowns with real-time tuition, living costs, visa fees, and more for any program worldwide.",
                color: "bg-primary/10 text-primary",
                badge: "Live Data",
              },
              {
                icon: TrendingUp,
                title: "ROI Calculator",
                description: "Calculate your break-even point with real-time salary data from job markets worldwide.",
                color: "bg-success/10 text-success",
                badge: "Live Data",
              },
              {
                icon: BarChart3,
                title: "Loan Comparison",
                description: "Compare interest rates, terms, and benefits with live market rates from 15+ leading lenders.",
                color: "bg-warning/10 text-warning",
                badge: "Live Data",
              },
              {
                icon: Sparkles,
                title: "AI Assistant",
                description: "Get instant answers powered by real-time web search and AI for the most accurate information.",
                color: "bg-chart-4/10 text-chart-4",
                badge: "AI + Live",
              },
              {
                icon: GraduationCap,
                title: "ROI Heatmap",
                description: "Visualize which country and field combinations offer the best return with live market insights.",
                color: "bg-chart-5/10 text-chart-5",
                badge: "Live Data",
              },
              {
                icon: Shield,
                title: "Smart Insights",
                description: "Receive personalized recommendations based on your profile and current market conditions.",
                color: "bg-destructive/10 text-destructive",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 opacity-0 animate-fade-slide-up group relative"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {feature.badge && (
                  <div className="absolute top-4 right-4 bg-success/10 text-success text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {feature.badge}
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-fade-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to financial clarity
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Your Details",
                description: "Tell us about your target country, field of study, and loan requirements.",
                image: IMAGES.calculator,
              },
              {
                step: "02",
                title: "Get Real-Time Analysis",
                description: "Our AI searches the web and processes data from 150+ universities and 15+ lenders live.",
                image: IMAGES.ai,
              },
              {
                step: "03",
                title: "Make Smart Decisions",
                description: "Compare options with the latest market data and choose the best path forward.",
                image: IMAGES.success,
              },
            ].map((item, i) => (
              <div key={i} className="relative opacity-0 animate-fade-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="text-8xl font-bold text-primary/10 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative pt-12">
                  <div className="w-24 h-24 relative mb-4 rounded-2xl overflow-hidden bg-secondary">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover opacity-80"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 opacity-0 animate-fade-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Trusted by students
            </h2>
            <p className="text-muted-foreground text-lg">
              Hear from students who made smarter decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "LoanMatters helped me save over 2 lakh in interest by showing me the best lender options. The real-time rate comparison was eye-opening!",
                name: "Priya Sharma",
                role: "MS CS @ Stanford",
                avatar: "PS",
              },
              {
                quote: "The cost estimator was incredibly accurate with live data. It helped my parents understand the true cost of my MS degree in Germany.",
                name: "Rahul Menon",
                role: "MS Data Science @ TUM",
                avatar: "RM",
              },
              {
                quote: "The AI assistant with real-time web search answered all my niche questions about co-signer requirements. Highly recommend!",
                name: "Ananya Patel",
                role: "MBA @ Wharton",
                avatar: "AP",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl p-8 border border-border opacity-0 animate-fade-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-foreground leading-relaxed mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center opacity-0 animate-fade-slide-up">
          <div className="bg-primary rounded-3xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute right-8 bottom-0 w-40 h-40 opacity-20 hidden md:block">
              <Image
                src={IMAGES.hero}
                alt="Celebration illustration"
                fill
                className="object-contain"
              />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 text-balance">
                Ready to plan your future?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students who made smarter financial decisions with real-time data.
              </p>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-14 text-base">
                  Start Planning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">LoanMatters</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Blog
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" />
              Powered by real-time web search
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with care for STEM students worldwide
          </p>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

function HeroIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-xl mx-auto">
      {/* Background Image - Stick Animation Style */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <Image
          src={IMAGES.hero}
          alt="Stick figure celebrating graduation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      </div>
      
      {/* Floating Cards */}
      <div className="absolute bottom-8 left-4 right-4 md:left-8 md:right-auto">
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border p-5 max-w-xs animate-float">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">MS Computer Science</div>
              <div className="text-xs text-muted-foreground">Stanford University</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">Cost</div>
              <div className="text-sm font-bold text-foreground">$125k</div>
            </div>
            <div className="bg-success/10 rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">ROI</div>
              <div className="text-sm font-bold text-success">185%</div>
            </div>
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <div className="text-xs text-muted-foreground">Break-even</div>
              <div className="text-sm font-bold text-primary">3.2yr</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-8 right-8 bg-success text-success-foreground rounded-2xl px-4 py-2 shadow-lg animate-float animation-delay-100">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Globe className="w-4 h-4" />
          Live: 8.5%
        </div>
      </div>
      
      <div className="absolute top-1/2 right-4 bg-card/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-border animate-float animation-delay-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-success" />
          <span className="text-sm font-semibold text-foreground">$180k/yr</span>
        </div>
      </div>
      
      <div className="absolute top-16 left-4 bg-primary/10 backdrop-blur-sm rounded-2xl p-3 animate-float animation-delay-300">
        <Calculator className="w-6 h-6 text-primary" />
      </div>
    </div>
  )
}
