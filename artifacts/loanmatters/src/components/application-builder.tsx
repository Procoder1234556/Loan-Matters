

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, 
  Sparkles, 
  Download, 
  Loader2, 
  GraduationCap,
  BookOpen,
  Award,
  Target,
  Copy,
  Check
} from "lucide-react"
// Image replaced with img
import { IMAGES } from "@/lib/images"

interface ApplicationData {
  personalStatement: string
  statementOfPurpose: string
  researchInterests: string
  extracurriculars: string[]
  achievements: string[]
  whyThisUniversity: string
  summary: string
}

export function ApplicationBuilder() {
  const [unstructuredDetails, setUnstructuredDetails] = useState("")
  const [universityName, setUniversityName] = useState("")
  const [programName, setProgramName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleBuild = async () => {
    if (!unstructuredDetails.trim() || !universityName.trim() || !programName.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/build-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unstructuredDetails,
          universityName,
          programName,
          apiKey: apiKey || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setApplication(data.application)
      }
    } catch (error) {
      console.error("Failed to build application:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const downloadAsPDF = () => {
    if (!application) return
    
    // Create a printable HTML document
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>University Application - ${universityName}</title>
        <style>
          body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
          h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
          h2 { color: #2c5282; margin-top: 30px; }
          .meta { color: #666; font-style: italic; margin-bottom: 30px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
          .summary { background: #f7fafc; padding: 15px; border-left: 4px solid #4299e1; margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <h1>Application for ${programName}</h1>
        <p class="meta">${universityName}</p>
        
        ${application.summary ? `<div class="summary"><strong>Candidate Summary:</strong> ${application.summary}</div>` : ''}
        
        <div class="section">
          <h2>Personal Statement</h2>
          <p>${application.personalStatement.replace(/\n/g, '</p><p>')}</p>
        </div>
        
        <div class="section">
          <h2>Statement of Purpose</h2>
          <p>${application.statementOfPurpose.replace(/\n/g, '</p><p>')}</p>
        </div>
        
        ${application.researchInterests ? `
        <div class="section">
          <h2>Research Interests</h2>
          <p>${application.researchInterests.replace(/\n/g, '</p><p>')}</p>
        </div>
        ` : ''}
        
        ${application.extracurriculars?.length ? `
        <div class="section">
          <h2>Extracurricular Activities</h2>
          <ul>
            ${application.extracurriculars.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${application.achievements?.length ? `
        <div class="section">
          <h2>Achievements & Leadership</h2>
          <ul>
            ${application.achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div class="section">
          <h2>Why ${universityName}?</h2>
          <p>${application.whyThisUniversity.replace(/\n/g, '</p><p>')}</p>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([printContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 opacity-0 animate-fade-slide-up">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Application Builder</h1>
          <p className="text-muted-foreground">AI-powered university application generator</p>
        </div>
      </div>

      {!application ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Details
              </CardTitle>
              <CardDescription>
                Paste all your information in any format - we&apos;ll organize it into a polished application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">Target University</Label>
                  <Input
                    id="university"
                    placeholder="e.g., Stanford University"
                    value={universityName}
                    onChange={(e) => setUniversityName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Program Name</Label>
                  <Input
                    id="program"
                    placeholder="e.g., MS Computer Science"
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Your Details (Unstructured)</Label>
                <Textarea
                  id="details"
                  placeholder={`Paste everything about yourself here in any format:

- Your academic background, GPA, courses
- Work experience, internships, projects
- Research papers, publications
- Extracurricular activities, clubs, sports
- Awards, scholarships, achievements
- Leadership roles, volunteer work
- Skills, certifications, languages
- Personal interests, goals, motivations
- Why you want to study this field
- Any challenges you've overcome

Don't worry about formatting - our AI will organize everything!`}
                  className="min-h-[300px] font-mono text-sm"
                  value={unstructuredDetails}
                  onChange={(e) => setUnstructuredDetails(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-muted-foreground text-sm">
                  Custom API Key (Optional)
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Leave empty to use default"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBuild}
                disabled={isLoading || !unstructuredDetails.trim() || !universityName.trim() || !programName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Building Application...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Build My Application
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview / Instructions */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-200 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <img src={IMAGES.education} alt="Application illustration" className="w-full h-full object-cover" />
            </div>
            <CardContent className="pt-6 relative z-10">
              <h3 className="font-semibold text-lg mb-4">What You&apos;ll Get</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Personal Statement</h4>
                    <p className="text-sm text-muted-foreground">Compelling narrative tailored to the university</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">Statement of Purpose</h4>
                    <p className="text-sm text-muted-foreground">Clear academic and career goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium">Achievements & Activities</h4>
                    <p className="text-sm text-muted-foreground">Formatted with impact metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-medium">Why This University</h4>
                    <p className="text-sm text-muted-foreground">Research-backed specific reasons</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Pro Tip:</strong> Include as much detail as possible - 
                  specific numbers, dates, project names, and outcomes help create a stronger application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results */
        <div className="space-y-6">
          {/* Action Bar */}
          <Card className="opacity-0 animate-fade-slide-up">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{programName}</h2>
                  <p className="text-muted-foreground">{universityName}</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setApplication(null)}>
                    Start Over
                  </Button>
                  <Button onClick={downloadAsPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {application.summary && (
            <Card className="bg-primary/5 border-primary/20 opacity-0 animate-fade-slide-up animation-delay-100">
              <CardContent className="pt-6">
                <p className="text-lg italic text-foreground">&quot;{application.summary}&quot;</p>
              </CardContent>
            </Card>
          )}

          {/* Personal Statement */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Personal Statement
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(application.personalStatement, "personal")}
                >
                  {copiedSection === "personal" ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {application.personalStatement}
              </p>
            </CardContent>
          </Card>

          {/* Statement of Purpose */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-success" />
                  Statement of Purpose
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(application.statementOfPurpose, "sop")}
                >
                  {copiedSection === "sop" ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {application.statementOfPurpose}
              </p>
            </CardContent>
          </Card>

          {/* Research Interests */}
          {application.researchInterests && (
            <Card className="opacity-0 animate-fade-slide-up animation-delay-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-warning" />
                  Research Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {application.researchInterests}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Extracurriculars & Achievements */}
          <div className="grid md:grid-cols-2 gap-6">
            {application.extracurriculars?.length > 0 && (
              <Card className="opacity-0 animate-fade-slide-up animation-delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Extracurriculars
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {application.extracurriculars.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {application.achievements?.length > 0 && (
              <Card className="opacity-0 animate-fade-slide-up animation-delay-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-success" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {application.achievements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Why This University */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-destructive" />
                  Why {universityName}?
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(application.whyThisUniversity, "why")}
                >
                  {copiedSection === "why" ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {application.whyThisUniversity}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
