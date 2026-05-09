

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Sparkles, 
  Download, 
  Loader2, 
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Target,
  Code,
  Users,
  Award,
  GraduationCap,
  Lightbulb
} from "lucide-react"
// Image replaced with img
import { IMAGES } from "@/lib/images"

interface ResumeData {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  summary: string
  experience: {
    title: string
    company: string
    duration: string
    location: string
    bullets: string[]
  }[]
  education: {
    degree: string
    school: string
    year: string
    gpa: string
    relevant: string
  }[]
  skills: {
    technical: string[]
    tools: string[]
    soft: string[]
  }
  certifications: string[]
  projects: {
    name: string
    description: string
  }[]
  atsScore: number
  keywordMatches: string[]
  improvementTips: string[]
}

export function ResumeBuilder() {
  const [unstructuredDetails, setUnstructuredDetails] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resume, setResume] = useState<ResumeData | null>(null)

  const handleBuild = async () => {
    if (!unstructuredDetails.trim() || !jobDescription.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/build-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unstructuredDetails,
          jobDescription,
          jobTitle,
          companyName,
          apiKey: apiKey || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setResume(data.resume)
      }
    } catch (error) {
      console.error("Failed to build resume:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadAsPDF = () => {
    if (!resume) return
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resume - ${resume.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px;
            line-height: 1.4;
            color: #333;
          }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
          .name { font-size: 28px; font-weight: bold; color: #1e3a5f; }
          .title { font-size: 16px; color: #2563eb; margin-top: 5px; }
          .contact { font-size: 12px; color: #666; margin-top: 10px; }
          .section { margin-top: 20px; }
          .section-title { 
            font-size: 14px; 
            font-weight: bold; 
            color: #1e3a5f; 
            text-transform: uppercase; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px; 
            margin-bottom: 10px;
          }
          .summary { font-size: 13px; color: #444; }
          .experience-item { margin-bottom: 15px; }
          .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
          .exp-title { font-weight: bold; font-size: 14px; }
          .exp-company { color: #2563eb; font-size: 13px; }
          .exp-duration { font-size: 12px; color: #666; }
          .exp-bullets { margin-top: 5px; padding-left: 20px; }
          .exp-bullets li { font-size: 12px; margin-bottom: 3px; }
          .education-item { margin-bottom: 10px; }
          .edu-degree { font-weight: bold; font-size: 13px; }
          .edu-school { color: #2563eb; font-size: 12px; }
          .skills-grid { display: flex; flex-wrap: wrap; gap: 20px; }
          .skills-category { flex: 1; min-width: 200px; }
          .skills-label { font-weight: bold; font-size: 12px; color: #666; }
          .skills-list { font-size: 12px; margin-top: 5px; }
          .projects-item { margin-bottom: 10px; }
          .project-name { font-weight: bold; font-size: 13px; }
          .project-desc { font-size: 12px; color: #444; }
          .certs { font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${resume.name}</div>
          <div class="title">${resume.title}</div>
          <div class="contact">
            ${resume.email} | ${resume.phone} | ${resume.location}
            ${resume.linkedin ? ` | ${resume.linkedin}` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p class="summary">${resume.summary}</p>
        </div>

        ${resume.experience?.length ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${resume.experience.map(exp => `
            <div class="experience-item">
              <div class="exp-header">
                <div>
                  <span class="exp-title">${exp.title}</span>
                  <span class="exp-company"> | ${exp.company}</span>
                </div>
                <span class="exp-duration">${exp.duration}</span>
              </div>
              <ul class="exp-bullets">
                ${exp.bullets?.map(b => `<li>${b}</li>`).join('') || ''}
              </ul>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resume.education?.length ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${resume.education.map(edu => `
            <div class="education-item">
              <div class="edu-degree">${edu.degree}</div>
              <div class="edu-school">${edu.school} | ${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
              ${edu.relevant ? `<div style="font-size: 11px; color: #666;">${edu.relevant}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills-grid">
            ${resume.skills?.technical?.length ? `
            <div class="skills-category">
              <div class="skills-label">Technical:</div>
              <div class="skills-list">${resume.skills.technical.join(', ')}</div>
            </div>
            ` : ''}
            ${resume.skills?.tools?.length ? `
            <div class="skills-category">
              <div class="skills-label">Tools:</div>
              <div class="skills-list">${resume.skills.tools.join(', ')}</div>
            </div>
            ` : ''}
            ${resume.skills?.soft?.length ? `
            <div class="skills-category">
              <div class="skills-label">Soft Skills:</div>
              <div class="skills-list">${resume.skills.soft.join(', ')}</div>
            </div>
            ` : ''}
          </div>
        </div>

        ${resume.projects?.length ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${resume.projects.map(proj => `
            <div class="projects-item">
              <div class="project-name">${proj.name}</div>
              <div class="project-desc">${proj.description}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${resume.certifications?.length ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          <div class="certs">${resume.certifications.join(' | ')}</div>
        </div>
        ` : ''}
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

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success"
    if (score >= 70) return "text-warning"
    return "text-destructive"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 opacity-0 animate-fade-slide-up">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">ATS Resume Builder</h1>
          <p className="text-muted-foreground">Create high-scoring ATS-optimized resumes</p>
        </div>
      </div>

      {!resume ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Details
              </CardTitle>
              <CardDescription>
                Paste your experience, skills, and background - we&apos;ll optimize it for ATS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jd">Job Description</Label>
                <Textarea
                  id="jd"
                  placeholder="Paste the full job description here..."
                  className="min-h-[150px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Your Background (Unstructured)</Label>
                <Textarea
                  id="details"
                  placeholder={`Paste everything about yourself:

- Name, email, phone, location
- Work experience with dates
- Education, degrees, GPA
- Skills, tools, technologies
- Projects you've worked on
- Certifications, courses
- Achievements with numbers

Don't worry about formatting!`}
                  className="min-h-[200px] font-mono text-sm"
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
                disabled={isLoading || !unstructuredDetails.trim() || !jobDescription.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Building ATS Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Build ATS Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-200 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <img src={IMAGES.success} alt="Resume illustration" className="w-full h-full object-cover" />
            </div>
            <CardContent className="pt-6 relative z-10">
              <h3 className="font-semibold text-lg mb-4">ATS Optimization Features</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">Keyword Matching</h4>
                    <p className="text-sm text-muted-foreground">Extracts and includes exact keywords from job description</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Code className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Skills Alignment</h4>
                    <p className="text-sm text-muted-foreground">Prioritizes skills mentioned in the JD</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-medium">Achievement Metrics</h4>
                    <p className="text-sm text-muted-foreground">Quantifies accomplishments with numbers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-medium">ATS-Friendly Format</h4>
                    <p className="text-sm text-muted-foreground">Clean layout that parses perfectly</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results */
        <div className="space-y-6">
          {/* ATS Score & Actions */}
          <Card className="opacity-0 animate-fade-slide-up">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(resume.atsScore)}`}>
                      {resume.atsScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">ATS Score</p>
                  </div>
                  <div className="w-48">
                    <Progress value={resume.atsScore} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {resume.atsScore >= 85 ? "Excellent match!" : 
                       resume.atsScore >= 70 ? "Good match" : "Needs improvement"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setResume(null)}>
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

          {/* Keyword Matches */}
          {resume.keywordMatches?.length > 0 && (
            <Card className="opacity-0 animate-fade-slide-up animation-delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Matched Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {resume.keywordMatches.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-success/10 text-success rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resume Preview */}
          <Card className="opacity-0 animate-fade-slide-up animation-delay-200">
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-foreground">{resume.name}</h2>
                <p className="text-primary font-medium">{resume.title}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {resume.email} | {resume.phone} | {resume.location}
                  {resume.linkedin && ` | ${resume.linkedin}`}
                </p>
              </div>

              {/* Summary */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                  Professional Summary
                </h3>
                <p className="text-foreground">{resume.summary}</p>
              </div>

              {/* Experience */}
              {resume.experience?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Experience
                  </h3>
                  <div className="space-y-4">
                    {resume.experience.map((exp, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="font-semibold">{exp.title}</span>
                            <span className="text-primary"> | {exp.company}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{exp.duration}</span>
                        </div>
                        {exp.bullets?.length > 0 && (
                          <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                            {exp.bullets.map((bullet, j) => (
                              <li key={j}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.education?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                  </h3>
                  <div className="space-y-2">
                    {resume.education.map((edu, i) => (
                      <div key={i}>
                        <div className="font-semibold">{edu.degree}</div>
                        <div className="text-sm text-primary">
                          {edu.school} | {edu.year}{edu.gpa && ` | GPA: ${edu.gpa}`}
                        </div>
                        {edu.relevant && (
                          <div className="text-xs text-muted-foreground">{edu.relevant}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Skills
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {resume.skills?.technical?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Technical</p>
                      <p className="text-sm">{resume.skills.technical.join(", ")}</p>
                    </div>
                  )}
                  {resume.skills?.tools?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Tools</p>
                      <p className="text-sm">{resume.skills.tools.join(", ")}</p>
                    </div>
                  )}
                  {resume.skills?.soft?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Soft Skills</p>
                      <p className="text-sm">{resume.skills.soft.join(", ")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects */}
              {resume.projects?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                    Projects
                  </h3>
                  <div className="space-y-2">
                    {resume.projects.map((proj, i) => (
                      <div key={i}>
                        <div className="font-semibold text-sm">{proj.name}</div>
                        <p className="text-sm text-muted-foreground">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resume.certifications?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
                    Certifications
                  </h3>
                  <p className="text-sm">{resume.certifications.join(" | ")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Improvement Tips */}
          {resume.improvementTips?.length > 0 && (
            <Card className="opacity-0 animate-fade-slide-up animation-delay-300 bg-warning/5 border-warning/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  Improvement Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resume.improvementTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
