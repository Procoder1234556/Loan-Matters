

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, 
  Upload, 
  Key, 
  Building2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Eye, 
  EyeOff, 
  Check, 
  Download,
  AlertCircle,
  Sparkles,
  CreditCard,
  GraduationCap,
  FileCheck,
  Landmark
} from "lucide-react"
import { IMAGES } from "@/lib/images"

const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI GPT-4o", icon: "🤖", color: "bg-emerald-500" },
  { id: "anthropic", name: "Anthropic Claude", icon: "🧠", color: "bg-orange-500" },
  { id: "google", name: "Google Gemini", icon: "✨", color: "bg-blue-500" },
  { id: "groq", name: "Groq Llama 3.3", icon: "⚡", color: "bg-purple-500" },
]

const BANKS = [
  { id: "sbi", name: "State Bank of India", shortName: "SBI", logo: "🏛️" },
  { id: "hdfc", name: "HDFC Credila", shortName: "HDFC", logo: "🔷" },
  { id: "icici", name: "ICICI Bank", shortName: "ICICI", logo: "🔶" },
  { id: "axis", name: "Axis Bank", shortName: "Axis", logo: "🟣" },
  { id: "bob", name: "Bank of Baroda", shortName: "BoB", logo: "🟠" },
  { id: "pnb", name: "Punjab National Bank", shortName: "PNB", logo: "🔴" },
  { id: "canara", name: "Canara Bank", shortName: "Canara", logo: "🟡" },
  { id: "union", name: "Union Bank", shortName: "Union", logo: "🔵" },
  { id: "avanse", name: "Avanse Financial", shortName: "Avanse", logo: "💎" },
  { id: "incred", name: "InCred Finance", shortName: "InCred", logo: "💫" },
  { id: "prodigy", name: "Prodigy Finance", shortName: "Prodigy", logo: "🌟" },
  { id: "mpower", name: "MPOWER Financing", shortName: "MPOWER", logo: "⭐" },
]

const LOAN_TYPES = [
  "Education Loan - Domestic",
  "Education Loan - Abroad",
  "Education Loan - Collateral Free",
  "Education Loan - With Collateral",
  "Skill Development Loan",
  "Vocational Training Loan",
]

interface LoanApplication {
  applicationNumber: string
  applicationDate: string
  bankDetails: {
    bankName: string
    branch: string
    loanType: string
    loanScheme: string
  }
  applicantInformation: {
    fullName: string
    dateOfBirth: string
    gender: string
    nationality: string
    maritalStatus: string
    email: string
    phone: string
    permanentAddress: string
    currentAddress: string
    panNumber: string
    aadharNumber: string
  }
  educationDetails: {
    currentQualification: string
    previousEducation: Array<{ qualification: string; institution: string; year: string; percentage: string }>
    targetCourse: string
    targetInstitution: string
    targetCountry: string
    courseDuration: string
    expectedStartDate: string
    admissionStatus: string
  }
  loanDetails: {
    totalCourseCost: string
    loanAmountRequired: string
    ownContribution: string
    tenure: string
    purpose: string
    disbursementSchedule: string
  }
  financialInformation: {
    applicantIncome: string
    coApplicantDetails: {
      name: string
      relationship: string
      occupation: string
      annualIncome: string
      employer: string
    }
    existingLoans: string
    bankingRelationship: string
  }
  collateralDetails: {
    collateralType: string
    collateralValue: string
    propertyDetails: string
  }
  documentsChecklist: Array<{ document: string; status: string; remarks: string }>
  declarations: string[]
  recommendations: {
    suggestedScheme: string
    expectedInterestRate: string
    processingFee: string
    tips: string[]
  }
  coverLetter: string
}

export function LoanApplicationBuilder() {
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedBank, setSelectedBank] = useState("")
  const [loanType, setLoanType] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [loanPurpose, setLoanPurpose] = useState("")
  const [applicantDetails, setApplicantDetails] = useState("")
  const [fileName, setFileName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    if (file.type === "text/plain") {
      const text = await file.text()
      setApplicantDetails(text)
    } else if (file.type === "application/pdf") {
      const formData = new FormData()
      formData.append("file", file)
      
      try {
        const text = await file.text()
        setApplicantDetails(`[PDF Content from ${file.name}]\n${text.slice(0, 5000)}`)
      } catch {
        setApplicantDetails(`[Uploaded PDF: ${file.name}] - Please also paste your details in text format for best results.`)
      }
    }
  }

  const handleBuildApplication = async () => {
    if (!apiKey || !selectedProvider || !applicantDetails || !selectedBank) {
      setError("Please complete all required fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const bankName = BANKS.find(b => b.id === selectedBank)?.name || selectedBank
      
      const response = await fetch("/api/build-loan-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          provider: selectedProvider,
          applicantDetails,
          bankName,
          loanType,
          loanAmount,
          loanPurpose,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setApplication(data.application)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build application")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadApplication = () => {
    if (!application) return

    const content = `
╔════════════════════════════════════════════════════════════════════════════════╗
║                        EDUCATION LOAN APPLICATION                               ║
║                              ${application.bankDetails.bankName.toUpperCase().padEnd(40)}║
╚════════════════════════════════════════════════════════════════════════════════╝

Application Number: ${application.applicationNumber}
Date: ${application.applicationDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━

                                  COVER LETTER

${application.coverLetter}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                              BANK & LOAN DETAILS

Bank Name: ${application.bankDetails.bankName}
Branch: ${application.bankDetails.branch}
Loan Type: ${application.bankDetails.loanType}
Loan Scheme: ${application.bankDetails.loanScheme}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                            APPLICANT INFORMATION

Full Name: ${application.applicantInformation.fullName}
Date of Birth: ${application.applicantInformation.dateOfBirth}
Gender: ${application.applicantInformation.gender}
Nationality: ${application.applicantInformation.nationality}
Marital Status: ${application.applicantInformation.maritalStatus}
Email: ${application.applicantInformation.email}
Phone: ${application.applicantInformation.phone}

Permanent Address:
${application.applicantInformation.permanentAddress}

Current Address:
${application.applicantInformation.currentAddress}

PAN Number: ${application.applicantInformation.panNumber}
Aadhar Number: ${application.applicantInformation.aadharNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                              EDUCATION DETAILS

Current Qualification: ${application.educationDetails.currentQualification}

Previous Education:
${application.educationDetails.previousEducation.map((edu, i) => `  ${i + 1}. ${edu.qualification} - ${edu.institution} (${edu.year}) - ${edu.percentage}`).join("\n")}

Target Course: ${application.educationDetails.targetCourse}
Target Institution: ${application.educationDetails.targetInstitution}
Country: ${application.educationDetails.targetCountry}
Course Duration: ${application.educationDetails.courseDuration}
Expected Start Date: ${application.educationDetails.expectedStartDate}
Admission Status: ${application.educationDetails.admissionStatus}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                                LOAN DETAILS

Total Course Cost: ${application.loanDetails.totalCourseCost}
Loan Amount Required: ${application.loanDetails.loanAmountRequired}
Own Contribution: ${application.loanDetails.ownContribution}
Loan Tenure: ${application.loanDetails.tenure}
Purpose: ${application.loanDetails.purpose}
Disbursement Schedule: ${application.loanDetails.disbursementSchedule}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                            FINANCIAL INFORMATION

Applicant Income: ${application.financialInformation.applicantIncome}

Co-Applicant Details:
  Name: ${application.financialInformation.coApplicantDetails.name}
  Relationship: ${application.financialInformation.coApplicantDetails.relationship}
  Occupation: ${application.financialInformation.coApplicantDetails.occupation}
  Annual Income: ${application.financialInformation.coApplicantDetails.annualIncome}
  Employer: ${application.financialInformation.coApplicantDetails.employer}

Existing Loans/EMIs: ${application.financialInformation.existingLoans}
Banking Relationship: ${application.financialInformation.bankingRelationship}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                             COLLATERAL DETAILS

Collateral Type: ${application.collateralDetails.collateralType}
Collateral Value: ${application.collateralDetails.collateralValue}
Property Details: ${application.collateralDetails.propertyDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                            DOCUMENTS CHECKLIST

${application.documentsChecklist.map((doc, i) => `  ${i + 1}. ${doc.document}\n     Status: ${doc.status}\n     Remarks: ${doc.remarks}`).join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                               DECLARATIONS

${application.declarations.map((dec, i) => `  ${i + 1}. ${dec}`).join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                     RECOMMENDATIONS & NEXT STEPS

Suggested Loan Scheme: ${application.recommendations.suggestedScheme}
Expected Interest Rate: ${application.recommendations.expectedInterestRate}
Processing Fee: ${application.recommendations.processingFee}

Tips for Approval:
${application.recommendations.tips.map((tip, i) => `  ${i + 1}. ${tip}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                              SIGNATURE SECTION

Applicant Signature: _______________________     Date: _______________

Co-Applicant Signature: ____________________     Date: _______________


For Bank Use Only:
┌─────────────────────────────────────────────────────────────────────────────┐
│ Verified By: _________________    Date: _____________    Branch Code: _____ │
│ Remarks: __________________________________________________________________ │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
                    Generated by LoanMatters - AI-Powered Education Loan Tool
═══════════════════════════════════════════════════════════════════════════════
`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${application.bankDetails.bankName.replace(/\s+/g, "_")}_Loan_Application_${application.applicationNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderStep1 = () => (
    <div className="space-y-6 opacity-0 animate-fade-slide-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose AI Provider</h2>
        <p className="text-muted-foreground">Select your preferred AI model and enter your API key</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {AI_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setSelectedProvider(provider.id)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedProvider === provider.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${provider.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                {provider.icon}
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">{provider.name}</div>
                {selectedProvider === provider.id && (
                  <Check className="w-4 h-4 text-primary mt-1" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedProvider && (
        <div className="space-y-2 opacity-0 animate-fade-slide-up">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} API key`}
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
          <p className="text-xs text-muted-foreground">Your API key is never stored and is only used for this session</p>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 opacity-0 animate-fade-slide-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Bank & Loan Type</h2>
        <p className="text-muted-foreground">Choose your preferred bank and loan details</p>
      </div>

      <div>
        <Label className="mb-3 block">Select Bank</Label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {BANKS.map((bank) => (
            <button
              key={bank.id}
              onClick={() => setSelectedBank(bank.id)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                selectedBank === bank.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-1">{bank.logo}</div>
              <div className="text-xs font-medium text-foreground">{bank.shortName}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loanType">Loan Type</Label>
          <select
            id="loanType"
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="">Select loan type</option>
            {LOAN_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loanAmount">Loan Amount (INR)</Label>
          <Input
            id="loanAmount"
            type="text"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g., 25,00,000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="loanPurpose">Loan Purpose</Label>
        <Input
          id="loanPurpose"
          value={loanPurpose}
          onChange={(e) => setLoanPurpose(e.target.value)}
          placeholder="e.g., MS in Computer Science at Stanford University, USA"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 opacity-0 animate-fade-slide-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Details</h2>
        <p className="text-muted-foreground">Upload or paste your information - AI will structure it</p>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <img src={IMAGES.loan} alt="Upload illustration" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">
            {fileName || "Upload PDF or TXT file"}
          </p>
          <p className="text-sm text-muted-foreground">
            Resume, ID proofs, income documents, or any relevant files
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or paste details</span>
        </div>
      </div>

      <Textarea
        value={applicantDetails}
        onChange={(e) => setApplicantDetails(e.target.value)}
        placeholder={`Paste all your details here in any format. Include:

• Personal Information (Name, DOB, Address, Phone, Email, PAN, Aadhar)
• Educational Background (10th, 12th, Graduation details with percentages)
• Target Course & University details
• Parent/Guardian Information (Name, Occupation, Income)
• Work Experience (if any)
• Bank Account details
• Property/Collateral details (if applicable)
• Existing loans/EMIs

The AI will extract and structure all information automatically.`}
        className="min-h-[250px] resize-none"
      />

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Button 
        onClick={handleBuildApplication}
        disabled={isLoading || !applicantDetails || !selectedBank}
        className="w-full h-12"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Building Application...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Loan Application
          </>
        )}
      </Button>
    </div>
  )

  const renderStep4 = () => {
    if (!application) return null

    return (
      <div className="space-y-6 opacity-0 animate-fade-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Ready!</h2>
          <p className="text-muted-foreground">Your loan application has been generated</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Application Number</div>
                <div className="text-xl font-bold text-primary">{application.applicationNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="font-medium">{application.applicationDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
              <Landmark className="w-8 h-8 text-primary" />
              <div>
                <div className="font-semibold">{application.bankDetails.bankName}</div>
                <div className="text-sm text-muted-foreground">{application.bankDetails.loanScheme}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Applicant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{application.applicantInformation.fullName}</div>
              <div className="text-sm text-muted-foreground">{application.applicantInformation.email}</div>
              <div className="text-sm text-muted-foreground">{application.applicantInformation.phone}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{application.loanDetails.loanAmountRequired}</div>
              <div className="text-sm text-muted-foreground">Tenure: {application.loanDetails.tenure}</div>
              <div className="text-sm text-success">{application.recommendations.expectedInterestRate}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Target Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold">{application.educationDetails.targetCourse}</div>
            <div className="text-muted-foreground">{application.educationDetails.targetInstitution}</div>
            <div className="text-sm text-primary">{application.educationDetails.targetCountry} • {application.educationDetails.courseDuration}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Documents Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {application.documentsChecklist.slice(0, 6).map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <span className="text-sm">{doc.document}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === "Available" ? "bg-success/20 text-success" :
                    doc.status === "Required" ? "bg-warning/20 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm">Tips for Quick Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {application.recommendations.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button onClick={downloadApplication} className="w-full h-12">
          <Download className="w-4 h-4 mr-2" />
          Download Complete Application
        </Button>

        <Button 
          variant="outline" 
          onClick={() => {
            setStep(1)
            setApplication(null)
            setApplicantDetails("")
            setSelectedBank("")
          }}
          className="w-full"
        >
          Build Another Application
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Landmark className="w-5 h-5 text-primary-foreground" />
            </div>
            Loan Application Builder
          </CardTitle>
          <CardDescription>
            AI-powered loan application generator for Indian banks
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {[
              { num: 1, label: "API Setup" },
              { num: 2, label: "Bank Selection" },
              { num: 3, label: "Your Details" },
              { num: 4, label: "Application" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step >= s.num 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground hidden md:block">{s.label}</span>
                </div>
                {i < 3 && (
                  <div className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-all ${
                    step > s.num ? "bg-primary" : "bg-secondary"
                  }`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {step < 3 && (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!selectedProvider || !apiKey)) ||
                    (step === 2 && !selectedBank)
                  }
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
