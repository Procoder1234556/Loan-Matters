import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { unstructuredDetails, universityName, programName, apiKey } = await request.json()

    if (!unstructuredDetails || !universityName || !programName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use Tavily to get university-specific requirements
    const tavilyApiKey = process.env.TAVILY_API_KEY
    let universityContext = ""
    
    if (tavilyApiKey) {
      try {
        const searchResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query: `${universityName} ${programName} admission requirements application essay tips what they look for`,
            search_depth: "advanced",
            max_results: 5,
          }),
        })
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          universityContext = searchData.results
            ?.map((r: { content: string }) => r.content)
            .join("\n\n")
            .slice(0, 3000)
        }
      } catch (e) {
        console.error("Tavily search error:", e)
      }
    }

    // Use the provided API key or fall back to AI Gateway
    const aiApiKey = apiKey || process.env.AI_GATEWAY_API_KEY
    
    const systemPrompt = `You are an expert university admissions consultant who helps students craft compelling applications. 
Based on the student's unstructured details, create a polished, professional university application package.

University Context (from research):
${universityContext || "No specific context available - use general best practices."}

Create a comprehensive application that includes:
1. Personal Statement (500-700 words) - Compelling narrative about the student's journey, motivations, and fit
2. Statement of Purpose (400-500 words) - Academic and career goals, why this program
3. Research Interests (if applicable) - 200-300 words
4. Extracurricular Summary - Formatted list with impact descriptions
5. Leadership & Achievements - Bullet points with quantified results
6. Why This University - Specific reasons showing research about the program

Format the response as JSON with these exact keys:
{
  "personalStatement": "...",
  "statementOfPurpose": "...",
  "researchInterests": "...",
  "extracurriculars": ["activity1 - impact", "activity2 - impact"],
  "achievements": ["achievement1", "achievement2"],
  "whyThisUniversity": "...",
  "summary": "Brief 2-3 sentence summary of the candidate"
}`

    const response = await fetch("https://ai.vercel.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Student Details (unstructured):
${unstructuredDetails}

Target University: ${universityName}
Target Program: ${programName}

Please create a polished application package for this student.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      throw new Error("AI API request failed")
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    
    // Parse JSON from the response
    let applicationData
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        applicationData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found")
      }
    } catch {
      // If parsing fails, create structured response from text
      applicationData = {
        personalStatement: content,
        statementOfPurpose: "",
        researchInterests: "",
        extracurriculars: [],
        achievements: [],
        whyThisUniversity: "",
        summary: "",
      }
    }

    return NextResponse.json({
      success: true,
      application: applicationData,
      universityName,
      programName,
    })
  } catch (error) {
    console.error("Application builder error:", error)
    return NextResponse.json(
      { error: "Failed to build application" },
      { status: 500 }
    )
  }
}
