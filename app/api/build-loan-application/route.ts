import { NextRequest, NextResponse } from "next/server"

const AI_PROVIDERS = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
    headerKey: "Authorization",
    headerPrefix: "Bearer ",
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    headerKey: "x-api-key",
    headerPrefix: "",
  },
  google: {
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    model: "gemini-1.5-flash",
    headerKey: "x-goog-api-key",
    headerPrefix: "",
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    headerKey: "Authorization",
    headerPrefix: "Bearer ",
  },
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, provider, applicantDetails, bankName, loanType, loanAmount, loanPurpose } = await req.json()

    if (!apiKey || !provider || !applicantDetails || !bankName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const providerConfig = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS]
    if (!providerConfig) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    // First, search for bank-specific requirements using Tavily
    let bankRequirements = ""
    if (process.env.TAVILY_API_KEY) {
      try {
        const tavilyResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: `${bankName} education loan application requirements documents eligibility criteria India 2024`,
            search_depth: "advanced",
            max_results: 5,
          }),
        })
        const tavilyData = await tavilyResponse.json()
        if (tavilyData.results) {
          bankRequirements = tavilyData.results.map((r: { content: string }) => r.content).join("\n")
        }
      } catch (e) {
        console.error("Tavily search failed:", e)
      }
    }

    const systemPrompt = `You are an expert education loan application specialist. Generate a complete, professional loan application for ${bankName}.

Bank-specific requirements and guidelines:
${bankRequirements || "Use standard education loan application format."}

Generate a COMPLETE loan application with all sections filled in based on the applicant's details. The application should be ready to submit with minimal modifications.

Return the response as a JSON object with this EXACT structure:
{
  "applicationNumber": "AUTO-GENERATED-NUMBER",
  "applicationDate": "CURRENT_DATE",
  "bankDetails": {
    "bankName": "${bankName}",
    "branch": "Suggested branch based on applicant location",
    "loanType": "${loanType || 'Education Loan'}",
    "loanScheme": "Recommended scheme name"
  },
  "applicantInformation": {
    "fullName": "Extracted from details",
    "dateOfBirth": "If available",
    "gender": "If available",
    "nationality": "Indian or as specified",
    "maritalStatus": "If available",
    "email": "Extracted",
    "phone": "Extracted",
    "permanentAddress": "Full address",
    "currentAddress": "If different",
    "panNumber": "If available",
    "aadharNumber": "If available"
  },
  "educationDetails": {
    "currentQualification": "Degree, University, Year, Percentage",
    "previousEducation": [{"qualification": "", "institution": "", "year": "", "percentage": ""}],
    "targetCourse": "Course name",
    "targetInstitution": "University/College name",
    "targetCountry": "Country",
    "courseDuration": "Duration",
    "expectedStartDate": "Date",
    "admissionStatus": "Admitted/Applied/Planning"
  },
  "loanDetails": {
    "totalCourseCost": "Amount",
    "loanAmountRequired": "${loanAmount || 'To be calculated'}",
    "ownContribution": "Amount if any",
    "tenure": "Suggested tenure in years",
    "purpose": "${loanPurpose || 'Higher Education'}",
    "disbursementSchedule": "Suggested schedule"
  },
  "financialInformation": {
    "applicantIncome": "If working",
    "coApplicantDetails": {
      "name": "Parent/Guardian name",
      "relationship": "Relationship",
      "occupation": "Occupation",
      "annualIncome": "Income",
      "employer": "If employed"
    },
    "existingLoans": "Any existing EMIs",
    "bankingRelationship": "Existing accounts with this bank"
  },
  "collateralDetails": {
    "collateralType": "Property/FD/LIC/None if under limit",
    "collateralValue": "If applicable",
    "propertyDetails": "If property collateral"
  },
  "documentsChecklist": [
    {"document": "Document name", "status": "Available/Required/Pending", "remarks": "Any notes"}
  ],
  "declarations": [
    "Standard declaration 1",
    "Standard declaration 2"
  ],
  "recommendations": {
    "suggestedScheme": "Best loan scheme for this profile",
    "expectedInterestRate": "Based on current rates",
    "processingFee": "Expected fee",
    "tips": ["Tip 1", "Tip 2", "Tip 3"]
  },
  "coverLetter": "A professional cover letter for the loan application"
}`

    const userPrompt = `Generate a complete ${bankName} education loan application based on these applicant details:

${applicantDetails}

Loan Type: ${loanType || 'Education Loan'}
Loan Amount Required: ${loanAmount || 'To be calculated based on course cost'}
Purpose: ${loanPurpose || 'Higher Education Abroad'}

Extract all relevant information and create a comprehensive, ready-to-submit loan application. Fill in realistic suggestions where information is missing.`

    let responseText = ""

    if (provider === "anthropic") {
      const response = await fetch(providerConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [providerConfig.headerKey]: `${providerConfig.headerPrefix}${apiKey}`,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: providerConfig.model,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      responseText = data.content[0].text
    } else if (provider === "google") {
      const response = await fetch(`${providerConfig.url}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      responseText = data.candidates[0].content.parts[0].text
    } else {
      const response = await fetch(providerConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [providerConfig.headerKey]: `${providerConfig.headerPrefix}${apiKey}`,
        },
        body: JSON.stringify({
          model: providerConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message || data.error)
      responseText = data.choices[0].message.content
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse application response")
    }

    const application = JSON.parse(jsonMatch[0])
    return NextResponse.json({ application })
  } catch (error) {
    console.error("Loan application build error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build loan application" },
      { status: 500 }
    )
  }
}
