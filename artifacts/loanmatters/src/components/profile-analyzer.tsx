

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  GraduationCap, 
  Trophy, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Target,
  Lightbulb,
  Globe,
  Download,
  Upload,
  Key,
  Sparkles,
  X,
  Plus,
  Calendar,
  Star,
  BookOpen,
  Eye,
  EyeOff
} from "lucide-react"

interface AnalysisResult {
  overallScore: number
  chanceCategory: "High" | "Medium" | "Low" | "Very Low"
  profileSummary: string
  academicAnalysis?: {
    gpa: { extracted: string; assessment: string; score: number }
    testScores: { extracted: string; assessment: string; score: number }
  }
  experienceAnalysis?: {
    work: { years: string; relevance: string; score: number }
    research: { publications: string; assessment: string; score: number }
    projects: { count: string; assessment: string; score: number }
    extracurriculars: { highlights: string[]; score: number }
  }
  universityAnalysis?: {
    name: string
    program: string
    admissionChance: string
    averageAcceptedGPA: string
    averageAcceptedGRE: string
    keyRequirements: string[]
    fitAnalysis: string
    recommendations: string[]
  }[]
  strengths: string[]
  weaknesses: string[]
  recommendations: { priority: string; action: string; impact: string }[]
  sopTopics?: string[]
  interviewTips?: string[]
  timeline?: { month: string; action: string }[]
  rawAnalysis?: string
}

const AI_MODELS = [
  { value: "openai", label: "OpenAI GPT-4o", icon: "🤖", description: "Best for detailed analysis" },
  { value: "anthropic", label: "Anthropic Claude", icon: "🧠", description: "Excellent reasoning" },
  { value: "google", label: "Google Gemini", icon: "💎", description: "Fast and accurate" },
  { value: "groq", label: "Groq Llama 3.3", icon: "⚡", description: "Ultra-fast inference" },
]

type Step = "api-setup" | "profile-input" | "university-selection" | "analysis"

export function ProfileAnalyzer() {
  const [currentStep, setCurrentStep] = useState<Step>("api-setup")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [modelProvider, setModelProvider] = useState("")
  const [profileDetails, setProfileDetails] = useState("")
  const [universityPreferences, setUniversityPreferences] = useState<string[]>([])
  const [newUniversity, setNewUniversity] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)

    if (file.type === "application/pdf") {
      // For PDF files, we'll read the text content
      const formData = new FormData()
      formData.append("file", file)
      
      // Read as text for now (simple extraction)
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = event.target?.result as string
        // For PDFs, we'll just note the file was uploaded
        // In production, you'd use a PDF parser
        setProfileDetails(prev => 
          prev + `\n\n[Uploaded PDF: ${file.name}]\nPlease note: PDF content extraction is limited. For best results, paste your details directly.`
        )
      }
      reader.readAsText(file)
    } else if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setProfileDetails(prev => prev ? prev + "\n\n" + text : text)
      }
      reader.readAsText(file)
    }
  }

  const handleAddUniversity = () => {
    if (newUniversity.trim() && !universityPreferences.includes(newUniversity.trim())) {
      setUniversityPreferences([...universityPreferences, newUniversity.trim()])
      setNewUniversity("")
    }
  }

  const handleRemoveUniversity = (uni: string) => {
    setUniversityPreferences(universityPreferences.filter(u => u !== uni))
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileDetails,
          universityPreferences,
          apiKey,
          modelProvider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setResult(data.analysis)
      setCurrentStep("analysis")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze profile")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadReport = () => {
    if (!result) return

    const reportContent = generateTextReport(result, universityPreferences)
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "admission-analysis-report.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateTextReport = (analysis: AnalysisResult, universities: string[]): string => {
    let report = `
╔════════════════════════════════════════════════════════════════════╗
║                    ADMISSION ANALYSIS REPORT                        ║
║                         Generated by LoanMatters                       ║
╚════════════════════════════════════════════════════════════════════╝

📅 Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 OVERALL ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Score: ${analysis.overallScore}/100
Admission Chances: ${analysis.chanceCategory}

${analysis.profileSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 ACADEMIC ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    if (analysis.academicAnalysis) {
      report += `
GPA: ${analysis.academicAnalysis.gpa.extracted}
Assessment: ${analysis.academicAnalysis.gpa.assessment}

Test Scores: ${analysis.academicAnalysis.testScores.extracted}
Assessment: ${analysis.academicAnalysis.testScores.assessment}
`
    }

    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ STRENGTHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    analysis.strengths?.forEach((s, i) => {
      report += `${i + 1}. ${s}\n`
    })

    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ AREAS FOR IMPROVEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    analysis.weaknesses?.forEach((w, i) => {
      report += `${i + 1}. ${w}\n`
    })

    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏫 UNIVERSITY-SPECIFIC ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    analysis.universityAnalysis?.forEach(uni => {
      report += `
┌─────────────────────────────────────────────────────────────────────
│ ${uni.name}
├─────────────────────────────────────────────────────────────────────
│ Program: ${uni.program || "Not specified"}
│ Admission Chance: ${uni.admissionChance}
│ Average Accepted GPA: ${uni.averageAcceptedGPA || "N/A"}
│ Average Accepted GRE: ${uni.averageAcceptedGRE || "N/A"}
│
│ Fit Analysis:
│ ${uni.fitAnalysis}
│
│ Recommendations:
${uni.recommendations?.map(r => `│ • ${r}`).join("\n") || "│ No specific recommendations"}
└─────────────────────────────────────────────────────────────────────
`
    })

    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 ACTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
    analysis.recommendations?.forEach((rec, i) => {
      report += `
[${rec.priority.toUpperCase()} PRIORITY]
Action: ${rec.action}
Expected Impact: ${rec.impact}
`
    })

    if (analysis.sopTopics?.length) {
      report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 SUGGESTED SOP TOPICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      analysis.sopTopics.forEach((topic, i) => {
        report += `${i + 1}. ${topic}\n`
      })
    }

    if (analysis.interviewTips?.length) {
      report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎤 INTERVIEW TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      analysis.interviewTips.forEach((tip, i) => {
        report += `${i + 1}. ${tip}\n`
      })
    }

    if (analysis.timeline?.length) {
      report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 RECOMMENDED TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`
      analysis.timeline.forEach(item => {
        report += `${item.month}: ${item.action}\n`
      })
    }

    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This report was generated by LoanMatters Profile Analyzer.
Visit https://loanmatters.app for more tools and resources.

Good luck with your applications! 🎓
`

    return report
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 60) return "text-primary"
    if (score >= 40) return "text-warning"
    return "text-destructive"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "High": return "bg-success/10 text-success border-success/20"
      case "Medium": return "bg-primary/10 text-primary border-primary/20"
      case "Low": return "bg-warning/10 text-warning border-warning/20"
      case "Very Low": return "bg-destructive/10 text-destructive border-destructive/20"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { step: "api-setup", label: "1", title: "API Setup" },
        { step: "profile-input", label: "2", title: "Your Profile" },
        { step: "university-selection", label: "3", title: "Universities" },
        { step: "analysis", label: "4", title: "Analysis" },
      ].map((s, i) => (
        <div key={s.step} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
            currentStep === s.step 
              ? "bg-primary text-primary-foreground" 
              : ["api-setup", "profile-input", "university-selection", "analysis"].indexOf(currentStep) > i
                ? "bg-success text-success-foreground"
                : "bg-secondary text-muted-foreground"
          }`}>
            {["api-setup", "profile-input", "university-selection", "analysis"].indexOf(currentStep) > i ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : s.label}
          </div>
          {i < 3 && (
            <div className={`w-8 md:w-16 h-1 mx-1 rounded-full ${
              ["api-setup", "profile-input", "university-selection", "analysis"].indexOf(currentStep) > i
                ? "bg-success"
                : "bg-secondary"
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Custom Profile Analyzer</h2>
          <p className="text-muted-foreground">AI-powered admission chances analysis with your preferred model</p>
        </div>
      </div>

      {renderStepIndicator()}

      {/* Step 1: API Setup */}
      {currentStep === "api-setup" && (
        <Card className="bg-card border-border shadow-sm opacity-0 animate-fade-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="w-5 h-5 text-primary" />
              Choose Your AI Model
            </CardTitle>
            <CardDescription>
              Select an AI provider and enter your API key. Your key is only used for this session and never stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {AI_MODELS.map((model) => (
                <button
                  key={model.value}
                  onClick={() => setModelProvider(model.value)}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    modelProvider === model.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{model.icon}</span>
                  <div>
                    <div className="font-semibold text-foreground">{model.label}</div>
                    <div className="text-sm text-muted-foreground">{model.description}</div>
                  </div>
                  {modelProvider === model.value && (
                    <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {modelProvider && (
              <div className="space-y-2 animate-fade-slide-up">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    placeholder={`Enter your ${AI_MODELS.find(m => m.value === modelProvider)?.label} API key`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is used only for this analysis and is never stored on our servers.
                </p>
              </div>
            )}

            <Button
              onClick={() => setCurrentStep("profile-input")}
              disabled={!modelProvider || !apiKey}
              className="w-full h-12 rounded-xl"
            >
              Continue to Profile
              <TrendingUp className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Profile Input */}
      {currentStep === "profile-input" && (
        <Card className="bg-card border-border shadow-sm opacity-0 animate-fade-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Your Profile Details
            </CardTitle>
            <CardDescription>
              Paste all your details in any format - academics, work experience, projects, achievements, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload your resume, CV, or any document with your details
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Choose File
              </Button>
              {uploadedFileName && (
                <p className="text-sm text-success mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {uploadedFileName}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or paste directly</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Profile Details</Label>
              <Textarea
                placeholder={`Paste all your details here. For example:

Education:
- B.Tech Computer Science, IIT Delhi, GPA: 8.5/10
- GRE: 325 (Q: 168, V: 157), TOEFL: 108

Work Experience:
- Software Engineer at Google, 2 years
- ML Intern at Microsoft, 6 months

Research:
- 2 papers published in IEEE conferences
- Research assistant under Prof. XYZ

Projects:
- Built a recommendation system used by 10k+ users
- Open source contributor to TensorFlow

Achievements:
- Won ACM ICPC regionals
- National scholarship recipient

... Add anything else relevant!`}
                value={profileDetails}
                onChange={(e) => setProfileDetails(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("api-setup")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep("university-selection")}
                disabled={!profileDetails.trim()}
                className="flex-1"
              >
                Continue to Universities
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: University Selection */}
      {currentStep === "university-selection" && (
        <Card className="bg-card border-border shadow-sm opacity-0 animate-fade-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-primary" />
              Target Universities
            </CardTitle>
            <CardDescription>
              Add the universities and programs you&apos;re interested in applying to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., MIT MS Computer Science"
                value={newUniversity}
                onChange={(e) => setNewUniversity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUniversity()}
                className="flex-1"
              />
              <Button onClick={handleAddUniversity} className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {universityPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {universityPreferences.map((uni) => (
                  <Badge
                    key={uni}
                    variant="secondary"
                    className="px-3 py-2 text-sm flex items-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    {uni}
                    <button
                      onClick={() => handleRemoveUniversity(uni)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {universityPreferences.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Add at least one university to continue</p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("profile-input")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={universityPreferences.length === 0 || isAnalyzing}
                className="flex-1 gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Analysis Results */}
      {currentStep === "analysis" && result && (
        <div className="space-y-6 opacity-0 animate-fade-slide-up">
          {/* Overall Score Card */}
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Admission Score</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getCategoryColor(result.chanceCategory)}`}>
                    <Star className="w-4 h-4" />
                    <span className="font-bold">{result.chanceCategory} Chance</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}
                  </p>
                  <p className="text-sm text-muted-foreground">out of 100</p>
                </div>
              </div>
              {result.profileSummary && (
                <p className="mt-4 text-muted-foreground">{result.profileSummary}</p>
              )}
            </div>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-success/5 border-success/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses?.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* University Analysis */}
          {result.universityAnalysis && result.universityAnalysis.length > 0 && (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  University-Specific Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.universityAnalysis.map((uni, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{uni.name}</h4>
                      <Badge className={getCategoryColor(uni.admissionChance)}>
                        {uni.admissionChance} Chance
                      </Badge>
                    </div>
                    {uni.program && (
                      <p className="text-sm text-muted-foreground mb-2">Program: {uni.program}</p>
                    )}
                    <p className="text-sm text-muted-foreground mb-3">{uni.fitAnalysis}</p>
                    {uni.recommendations && uni.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">Recommendations:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {uni.recommendations.map((rec, j) => (
                            <li key={j} className="flex items-start gap-1">
                              <Lightbulb className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Action Plan */}
          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                    <Badge variant={rec.priority === "High" ? "destructive" : "secondary"} className="shrink-0">
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{rec.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">Impact: {rec.impact}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SOP Topics & Interview Tips */}
          <div className="grid md:grid-cols-2 gap-4">
            {result.sopTopics && result.sopTopics.length > 0 && (
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    SOP Topic Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.sopTopics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-semibold">{i + 1}.</span>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.interviewTips && result.interviewTips.length > 0 && (
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Interview Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.interviewTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Timeline */}
          {result.timeline && result.timeline.length > 0 && (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recommended Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-4">
                    {result.timeline.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0 z-10">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-medium text-foreground">{item.month}</p>
                          <p className="text-sm text-muted-foreground">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep("api-setup")
                setResult(null)
              }}
              className="flex-1"
            >
              Start New Analysis
            </Button>
            <Button
              onClick={handleDownloadReport}
              className="flex-1 gap-2"
            >
              <Download className="w-5 h-5" />
              Download Report
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
