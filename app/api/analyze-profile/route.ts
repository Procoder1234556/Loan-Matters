import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { 
      profileDetails, 
      universityPreferences, 
      apiKey, 
      modelProvider 
    } = await req.json()

    if (!profileDetails || !universityPreferences || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Fetch real-time university data using Tavily
    let universityInsights = ""
    const tavilyKey = process.env.TAVILY_API_KEY
    
    if (tavilyKey) {
      try {
        const searchQueries = universityPreferences.slice(0, 3).map((uni: string) => 
          `${uni} admission requirements acceptance rate GPA GRE TOEFL 2024`
        )
        
        const searchResults = await Promise.all(
          searchQueries.map(async (query: string) => {
            const response = await fetch("https://api.tavily.com/search", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                api_key: tavilyKey,
                query,
                search_depth: "advanced",
                include_answer: true,
                max_results: 3,
              }),
            })
            if (response.ok) {
              return await response.json()
            }
            return null
          })
        )
        
        universityInsights = searchResults
          .filter(Boolean)
          .map((r: { answer?: string }) => r?.answer || "")
          .join("\n\n")
      } catch (error) {
        console.error("Tavily search error:", error)
      }
    }

    // Build the analysis prompt
    const analysisPrompt = `You are an expert university admissions counselor. Analyze the following student profile and provide a detailed admission chances report.

## Student Profile Details:
${profileDetails}

## Target Universities:
${universityPreferences.join(", ")}

## Real-Time University Insights (from web search):
${universityInsights || "Not available"}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "chanceCategory": "<High|Medium|Low|Very Low>",
  "profileSummary": "<2-3 sentence summary of the candidate>",
  "academicAnalysis": {
    "gpa": { "extracted": "<value or N/A>", "assessment": "<assessment>", "score": <0-25> },
    "testScores": { "extracted": "<GRE/GMAT/TOEFL values>", "assessment": "<assessment>", "score": <0-25> }
  },
  "experienceAnalysis": {
    "work": { "years": "<value>", "relevance": "<assessment>", "score": <0-15> },
    "research": { "publications": "<count>", "assessment": "<assessment>", "score": <0-10> },
    "projects": { "count": "<count>", "assessment": "<assessment>", "score": <0-10> },
    "extracurriculars": { "highlights": ["<item1>", "<item2>"], "score": <0-10> }
  },
  "universityAnalysis": [
    {
      "name": "<university name>",
      "program": "<extracted program if mentioned>",
      "admissionChance": "<High|Medium|Low>",
      "averageAcceptedGPA": "<value if found>",
      "averageAcceptedGRE": "<value if found>",
      "keyRequirements": ["<req1>", "<req2>"],
      "fitAnalysis": "<why this student fits or doesn't fit>",
      "recommendations": ["<specific recommendation for this university>"]
    }
  ],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "recommendations": [
    { "priority": "High", "action": "<specific action>", "impact": "<expected impact>" },
    { "priority": "Medium", "action": "<specific action>", "impact": "<expected impact>" }
  ],
  "sopTopics": ["<suggested SOP topic 1>", "<suggested SOP topic 2>"],
  "interviewTips": ["<tip1>", "<tip2>"],
  "timeline": [
    { "month": "<month>", "action": "<action to take>" }
  ]
}

Be specific and actionable. Extract as much information as possible from the profile details.`

    // Determine API endpoint and headers based on model provider
    let apiUrl: string
    let headers: Record<string, string>
    let body: Record<string, unknown>

    switch (modelProvider) {
      case "openai":
        apiUrl = "https://api.openai.com/v1/chat/completions"
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        }
        body = {
          model: "gpt-4o",
          messages: [{ role: "user", content: analysisPrompt }],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }
        break

      case "anthropic":
        apiUrl = "https://api.anthropic.com/v1/messages"
        headers = {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        }
        body = {
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          messages: [{ role: "user", content: analysisPrompt + "\n\nRespond with valid JSON only." }],
        }
        break

      case "google":
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
        headers = { "Content-Type": "application/json" }
        body = {
          contents: [{ parts: [{ text: analysisPrompt + "\n\nRespond with valid JSON only." }] }],
          generationConfig: { temperature: 0.7 },
        }
        break

      case "groq":
        apiUrl = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        }
        body = {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: analysisPrompt }],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }
        break

      default:
        return NextResponse.json(
          { error: "Invalid model provider" },
          { status: 400 }
        )
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("AI API error:", errorText)
      return NextResponse.json(
        { error: "Failed to analyze profile. Please check your API key." },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Extract the response based on provider
    let analysisText: string
    switch (modelProvider) {
      case "openai":
      case "groq":
        analysisText = data.choices?.[0]?.message?.content || ""
        break
      case "anthropic":
        analysisText = data.content?.[0]?.text || ""
        break
      case "google":
        analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
        break
      default:
        analysisText = ""
    }

    // Parse the JSON response
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        analysisText.match(/```\n?([\s\S]*?)\n?```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText
      const analysis = JSON.parse(jsonStr.trim())
      
      return NextResponse.json({
        success: true,
        analysis,
        universityInsights: universityInsights || null,
      })
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({
        success: true,
        analysis: {
          overallScore: 65,
          chanceCategory: "Medium",
          profileSummary: "Analysis completed but structured data extraction failed.",
          rawAnalysis: analysisText,
        },
        universityInsights: universityInsights || null,
      })
    }
  } catch (error) {
    console.error("Profile analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    )
  }
}
